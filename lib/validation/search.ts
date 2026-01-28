/**
 * Zod validation schemas for flight search form
 * Validates: Requirements 1.3, 1.4, 1.7
 */

import { z } from "zod";

// ============================================================================
// Airport Schema
// ============================================================================

/**
 * Schema for airport selection
 * Validates that all required airport fields are present
 */
export const airportSchema = z.object({
  code: z
    .string()
    .length(3, "Airport code must be exactly 3 characters")
    .regex(/^[A-Z]{3}$/, "Airport code must be 3 uppercase letters"),
  name: z.string().min(1, "Airport name is required"),
  city: z.string().min(1, "City name is required"),
  country: z.string().min(1, "Country name is required"),
});

// ============================================================================
// Date Validation Schemas
// ============================================================================

/**
 * Schema for departure date
 * Validates that the date is not in the past
 * Validates: Requirement 18.2 (Past Date Disabling)
 */
export const departureDateSchema = z.coerce.date().refine(
  (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  },
  {
    message: "Departure date cannot be in the past",
  },
);

/**
 * Schema for return date (used in round-trip validation)
 * Validates that return date is after departure date
 * Validates: Requirement 1.3, 18.3 (Round-trip Date Validation)
 */
export const returnDateSchema = z.coerce.date();

// ============================================================================
// Flight Segment Schema
// ============================================================================

/**
 * Schema for a single flight segment
 * Used in one-way, round-trip, and multi-city searches
 */
export const flightSegmentSchema = z.object({
  origin: airportSchema,
  destination: airportSchema,
  departureDate: departureDateSchema,
});

// ============================================================================
// Passenger Count Schema
// ============================================================================

/**
 * Schema for passenger counts
 * Validates: Requirement 1.5 (Passenger Count Acceptance)
 * - Adults: 1-9
 * - Children: 0-9
 * - Infants: 0-9
 * - Total passengers: 1-9
 */
export const passengerCountSchema = z
  .object({
    adults: z
      .number()
      .int("Adults must be a whole number")
      .min(1, "At least 1 adult is required")
      .max(9, "Maximum 9 adults allowed"),
    children: z
      .number()
      .int("Children must be a whole number")
      .min(0, "Children cannot be negative")
      .max(9, "Maximum 9 children allowed"),
    infants: z
      .number()
      .int("Infants must be a whole number")
      .min(0, "Infants cannot be negative")
      .max(9, "Maximum 9 infants allowed"),
  })
  .refine(
    (data) => {
      const total = data.adults + data.children + data.infants;
      return total >= 1 && total <= 9;
    },
    {
      message: "Total passengers must be between 1 and 9",
    },
  )
  .refine(
    (data) => {
      // Each infant must have an accompanying adult
      return data.infants <= data.adults;
    },
    {
      message: "Number of infants cannot exceed number of adults",
    },
  );

// ============================================================================
// Trip Type Schemas
// ============================================================================

/**
 * Schema for one-way trip
 * Validates: Requirement 1.2 (Trip Type Support)
 * Requires: origin, destination, departure date
 */
export const oneWaySearchSchema = z.object({
  tripType: z.literal("one-way"),
  segments: z
    .array(flightSegmentSchema)
    .length(1, "One-way trip must have exactly 1 segment"),
  passengers: passengerCountSchema,
  cabinClass: z.enum(["economy", "business", "first"], {
    message: "Please select a valid cabin class",
  }),
});

/**
 * Schema for round-trip
 * Validates: Requirement 1.3 (Round-trip Date Validation)
 * Requires: origin, destination, departure date, return date
 * Return date must be after departure date
 */
export const roundTripSearchSchema = z
  .object({
    tripType: z.literal("round-trip"),
    segments: z
      .array(flightSegmentSchema)
      .length(2, "Round-trip must have exactly 2 segments"),
    passengers: passengerCountSchema,
    cabinClass: z.enum(["economy", "business", "first"], {
      message: "Please select a valid cabin class",
    }),
  })
  .refine(
    (data) => {
      // Validate that return date is after departure date
      if (data.segments.length === 2) {
        const departureDate = data.segments[0].departureDate;
        const returnDate = data.segments[1].departureDate;
        return returnDate > departureDate;
      }
      return true;
    },
    {
      message: "Return date must be after departure date",
      path: ["segments", 1, "departureDate"],
    },
  )
  .refine(
    (data) => {
      // Validate that return destination matches departure origin
      if (data.segments.length === 2) {
        return (
          data.segments[1].destination.code === data.segments[0].origin.code
        );
      }
      return true;
    },
    {
      message: "Return destination must match departure origin",
      path: ["segments", 1, "destination"],
    },
  )
  .refine(
    (data) => {
      // Validate that return origin matches departure destination
      if (data.segments.length === 2) {
        return (
          data.segments[1].origin.code === data.segments[0].destination.code
        );
      }
      return true;
    },
    {
      message: "Return origin must match departure destination",
      path: ["segments", 1, "origin"],
    },
  );

/**
 * Schema for multi-city trip
 * Validates: Requirement 1.4 (Multi-city Segment Limits)
 * Allows 1 to 5 flight segments
 */
export const multiCitySearchSchema = z.object({
  tripType: z.literal("multi-city"),
  segments: z
    .array(flightSegmentSchema)
    .min(1, "Multi-city trip must have at least 1 segment")
    .max(5, "Multi-city trip can have at most 5 segments"),
  passengers: passengerCountSchema,
  cabinClass: z.enum(["economy", "business", "first"], {
    message: "Please select a valid cabin class",
  }),
});

// ============================================================================
// Main Search Schema
// ============================================================================

/**
 * Main search criteria schema
 * Discriminated union based on trip type
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7
 */
export const searchCriteriaSchema = z.discriminatedUnion("tripType", [
  oneWaySearchSchema,
  roundTripSearchSchema,
  multiCitySearchSchema,
]);

// ============================================================================
// Type Exports
// ============================================================================

// Export inferred types for use in components
export type AirportInput = z.infer<typeof airportSchema>;
export type FlightSegmentInput = z.infer<typeof flightSegmentSchema>;
export type PassengerCountInput = z.infer<typeof passengerCountSchema>;
export type OneWaySearchInput = z.infer<typeof oneWaySearchSchema>;
export type RoundTripSearchInput = z.infer<typeof roundTripSearchSchema>;
export type MultiCitySearchInput = z.infer<typeof multiCitySearchSchema>;
export type SearchCriteriaInput = z.infer<typeof searchCriteriaSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates search criteria and returns typed result
 * @param data - Raw search form data
 * @returns Validation result with typed data or errors
 */
export function validateSearchCriteria(data: unknown) {
  return searchCriteriaSchema.safeParse(data);
}

/**
 * Validates passenger count and returns typed result
 * @param data - Raw passenger count data
 * @returns Validation result with typed data or errors
 */
export function validatePassengerCount(data: unknown) {
  return passengerCountSchema.safeParse(data);
}

/**
 * Validates airport selection and returns typed result
 * @param data - Raw airport data
 * @returns Validation result with typed data or errors
 */
export function validateAirport(data: unknown) {
  return airportSchema.safeParse(data);
}

/**
 * Validates departure date and returns typed result
 * @param data - Raw date data
 * @returns Validation result with typed data or errors
 */
export function validateDepartureDate(data: unknown) {
  return departureDateSchema.safeParse(data);
}
