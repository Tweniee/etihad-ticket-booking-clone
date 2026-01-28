/**
 * Zod validation schemas for passenger information
 * Validates: Requirements 7.2, 7.3, 7.4, 7.5, 7.6
 */

import { z } from "zod";
import { addMonths, isAfter } from "date-fns";

// ============================================================================
// Contact Information Schema
// ============================================================================

/**
 * Schema for contact information
 * Required for primary passenger
 * Validates: Requirement 7.2 (Contact Information Validation)
 */
export const contactInfoSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^[0-9]{7,15}$/,
      "Phone number must be between 7 and 15 digits without spaces or special characters",
    )
    .trim(),
  countryCode: z
    .string()
    .min(1, "Country code is required")
    .regex(
      /^\+[0-9]{1,4}$/,
      "Country code must start with + and contain 1-4 digits",
    )
    .trim(),
});

// ============================================================================
// Passport Information Schema
// ============================================================================

/**
 * Schema for passport information
 * Required for international flights
 * Validates: Requirement 7.3 (International Passport Requirement)
 * Validates: Requirement 7.6 (Passport Expiry Validation)
 */
export const passportInfoSchema = z.object({
  number: z
    .string()
    .min(1, "Passport number is required")
    .min(6, "Passport number must be at least 6 characters")
    .max(20, "Passport number must not exceed 20 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "Passport number must contain only uppercase letters and numbers",
    )
    .trim(),
  expiryDate: z.coerce.date({
    message: "Please enter a valid passport expiry date",
  }),
  nationality: z
    .string()
    .min(1, "Nationality is required")
    .min(2, "Nationality must be at least 2 characters")
    .max(100, "Nationality must not exceed 100 characters")
    .trim(),
  issuingCountry: z
    .string()
    .min(1, "Issuing country is required")
    .min(2, "Issuing country must be at least 2 characters")
    .max(100, "Issuing country must not exceed 100 characters")
    .trim(),
});

/**
 * Creates a passport schema with travel date validation
 * Validates that passport expires at least 6 months after travel date
 * Validates: Requirement 7.6 (Passport Expiry Validation)
 *
 * @param travelDate - The date of travel to validate against
 * @returns Zod schema with travel date validation
 */
export function createPassportSchemaWithTravelDate(travelDate: Date) {
  return passportInfoSchema.refine(
    (data) => {
      // Passport must be valid for at least 6 months after travel date
      const minimumExpiryDate = addMonths(travelDate, 6);
      return isAfter(data.expiryDate, minimumExpiryDate);
    },
    {
      message: "Passport must be valid for at least 6 months after travel date",
      path: ["expiryDate"],
    },
  );
}

// ============================================================================
// Passenger Information Schema
// ============================================================================

/**
 * Schema for basic passenger information
 * Validates: Requirement 7.1 (Passenger Information Collection)
 * Validates: Requirement 7.4 (Required Fields Validation)
 */
export const basePassengerInfoSchema = z.object({
  id: z.string().min(1, "Passenger ID is required"),
  type: z.enum(["adult", "child", "infant"], {
    message: "Please select a valid passenger type",
  }),
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "First name can only contain letters, spaces, hyphens, and apostrophes",
    )
    .trim(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Last name can only contain letters, spaces, hyphens, and apostrophes",
    )
    .trim(),
  dateOfBirth: z.coerce
    .date({
      message: "Please enter a valid date of birth",
    })
    .refine(
      (date) => {
        // Date of birth must be in the past
        return date < new Date();
      },
      {
        message: "Date of birth must be in the past",
      },
    )
    .refine(
      (date) => {
        // Date of birth must be within reasonable range (not more than 120 years ago)
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 120);
        return date > minDate;
      },
      {
        message: "Please enter a valid date of birth",
      },
    ),
  gender: z.enum(["male", "female", "other"], {
    message: "Please select a valid gender",
  }),
});

/**
 * Schema for domestic flight passenger (no passport required)
 * Validates: Requirement 7.1, 7.4
 */
export const domesticPassengerSchema = z.object({
  ...basePassengerInfoSchema.shape,
  passport: z.undefined().optional(),
  contact: contactInfoSchema.optional(),
});

/**
 * Schema for international flight passenger (passport required)
 * Validates: Requirement 7.3 (International Passport Requirement)
 */
export const internationalPassengerSchema = z.object({
  ...basePassengerInfoSchema.shape,
  passport: passportInfoSchema,
  contact: contactInfoSchema.optional(),
});

/**
 * Creates an international passenger schema with travel date validation
 *
 * @param travelDate - The date of travel to validate passport expiry against
 * @returns Zod schema with travel date validation
 */
export function createInternationalPassengerSchema(travelDate: Date) {
  return z.object({
    ...basePassengerInfoSchema.shape,
    passport: createPassportSchemaWithTravelDate(travelDate),
    contact: contactInfoSchema.optional(),
  });
}

/**
 * Schema for primary passenger on domestic flight
 * Requires contact information
 * Validates: Requirement 7.2 (Contact Information Validation)
 */
export const primaryDomesticPassengerSchema = z.object({
  ...basePassengerInfoSchema.shape,
  passport: z.undefined().optional(),
  contact: contactInfoSchema,
});

/**
 * Schema for primary passenger on international flight
 * Requires both passport and contact information
 * Validates: Requirement 7.2, 7.3
 */
export const primaryInternationalPassengerSchema = z.object({
  ...basePassengerInfoSchema.shape,
  passport: passportInfoSchema,
  contact: contactInfoSchema,
});

/**
 * Creates a primary international passenger schema with travel date validation
 *
 * @param travelDate - The date of travel to validate passport expiry against
 * @returns Zod schema with travel date validation
 */
export function createPrimaryInternationalPassengerSchema(travelDate: Date) {
  return z.object({
    ...basePassengerInfoSchema.shape,
    passport: createPassportSchemaWithTravelDate(travelDate),
    contact: contactInfoSchema,
  });
}

// ============================================================================
// Passenger List Schema
// ============================================================================

/**
 * Schema for validating a list of passengers for domestic flights
 * First passenger must have contact information
 * Validates: Requirement 7.2, 7.4
 */
export const domesticPassengerListSchema = z
  .array(domesticPassengerSchema)
  .min(1, "At least one passenger is required")
  .refine(
    (passengers) => {
      // First passenger must have contact information
      return passengers.length > 0 && passengers[0].contact !== undefined;
    },
    {
      message: "Primary passenger must provide contact information",
      path: [0, "contact"],
    },
  );

/**
 * Schema for validating a list of passengers for international flights
 * All passengers must have passport information
 * First passenger must have contact information
 * Validates: Requirement 7.2, 7.3, 7.4
 */
export const internationalPassengerListSchema = z
  .array(internationalPassengerSchema)
  .min(1, "At least one passenger is required")
  .refine(
    (passengers) => {
      // All passengers must have passport information
      return passengers.every((p) => p.passport !== undefined);
    },
    {
      message:
        "All passengers must provide passport information for international flights",
    },
  )
  .refine(
    (passengers) => {
      // First passenger must have contact information
      return passengers.length > 0 && passengers[0].contact !== undefined;
    },
    {
      message: "Primary passenger must provide contact information",
      path: [0, "contact"],
    },
  );

/**
 * Creates an international passenger list schema with travel date validation
 *
 * @param travelDate - The date of travel to validate passport expiry against
 * @returns Zod schema with travel date validation
 */
export function createInternationalPassengerListSchema(travelDate: Date) {
  const passengerSchema = createInternationalPassengerSchema(travelDate);

  return z
    .array(passengerSchema)
    .min(1, "At least one passenger is required")
    .refine(
      (passengers) => {
        // All passengers must have passport information
        return passengers.every((p) => p.passport !== undefined);
      },
      {
        message:
          "All passengers must provide passport information for international flights",
      },
    )
    .refine(
      (passengers) => {
        // First passenger must have contact information
        return passengers.length > 0 && passengers[0].contact !== undefined;
      },
      {
        message: "Primary passenger must provide contact information",
        path: [0, "contact"],
      },
    );
}

// ============================================================================
// Age Validation Helpers
// ============================================================================

/**
 * Validates that a passenger's age matches their type
 * - Adult: 12 years or older
 * - Child: 2-11 years
 * - Infant: under 2 years
 *
 * @param dateOfBirth - The passenger's date of birth
 * @param passengerType - The passenger type
 * @param travelDate - The date of travel
 * @returns true if age matches type, false otherwise
 */
export function validatePassengerAge(
  dateOfBirth: Date,
  passengerType: "adult" | "child" | "infant",
  travelDate: Date,
): boolean {
  const ageInYears =
    (travelDate.getTime() - dateOfBirth.getTime()) /
    (1000 * 60 * 60 * 24 * 365.25);

  switch (passengerType) {
    case "adult":
      return ageInYears >= 12;
    case "child":
      return ageInYears >= 2 && ageInYears < 12;
    case "infant":
      return ageInYears < 2;
    default:
      return false;
  }
}

/**
 * Creates a passenger schema with age validation
 * Validates that the passenger's age matches their type on the travel date
 *
 * @param travelDate - The date of travel
 * @param isInternational - Whether the flight is international
 * @param isPrimary - Whether this is the primary passenger
 * @returns Zod schema with age validation
 */
export function createPassengerSchemaWithAgeValidation(
  travelDate: Date,
  isInternational: boolean,
  isPrimary: boolean,
) {
  if (isInternational) {
    if (isPrimary) {
      return createPrimaryInternationalPassengerSchema(travelDate).refine(
        (data) => {
          return validatePassengerAge(data.dateOfBirth, data.type, travelDate);
        },
        {
          message:
            "Passenger age does not match passenger type for travel date",
          path: ["dateOfBirth"],
        },
      );
    } else {
      return createInternationalPassengerSchema(travelDate).refine(
        (data) => {
          return validatePassengerAge(data.dateOfBirth, data.type, travelDate);
        },
        {
          message:
            "Passenger age does not match passenger type for travel date",
          path: ["dateOfBirth"],
        },
      );
    }
  } else {
    if (isPrimary) {
      return primaryDomesticPassengerSchema.refine(
        (data) => {
          return validatePassengerAge(data.dateOfBirth, data.type, travelDate);
        },
        {
          message:
            "Passenger age does not match passenger type for travel date",
          path: ["dateOfBirth"],
        },
      );
    } else {
      return domesticPassengerSchema.refine(
        (data) => {
          return validatePassengerAge(data.dateOfBirth, data.type, travelDate);
        },
        {
          message:
            "Passenger age does not match passenger type for travel date",
          path: ["dateOfBirth"],
        },
      );
    }
  }
}

// ============================================================================
// Type Exports
// ============================================================================

export type ContactInfoInput = z.infer<typeof contactInfoSchema>;
export type PassportInfoInput = z.infer<typeof passportInfoSchema>;
export type BasePassengerInfoInput = z.infer<typeof basePassengerInfoSchema>;
export type DomesticPassengerInput = z.infer<typeof domesticPassengerSchema>;
export type InternationalPassengerInput = z.infer<
  typeof internationalPassengerSchema
>;
export type PrimaryDomesticPassengerInput = z.infer<
  typeof primaryDomesticPassengerSchema
>;
export type PrimaryInternationalPassengerInput = z.infer<
  typeof primaryInternationalPassengerSchema
>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates contact information and returns typed result
 * @param data - Raw contact info data
 * @returns Validation result with typed data or errors
 */
export function validateContactInfo(data: unknown) {
  return contactInfoSchema.safeParse(data);
}

/**
 * Validates passport information and returns typed result
 * @param data - Raw passport data
 * @param travelDate - Optional travel date for expiry validation
 * @returns Validation result with typed data or errors
 */
export function validatePassportInfo(data: unknown, travelDate?: Date) {
  if (travelDate) {
    return createPassportSchemaWithTravelDate(travelDate).safeParse(data);
  }
  return passportInfoSchema.safeParse(data);
}

/**
 * Validates passenger information and returns typed result
 * @param data - Raw passenger data
 * @param isInternational - Whether the flight is international
 * @param isPrimary - Whether this is the primary passenger
 * @param travelDate - Optional travel date for passport and age validation
 * @returns Validation result with typed data or errors
 */
export function validatePassengerInfo(
  data: unknown,
  isInternational: boolean,
  isPrimary: boolean,
  travelDate?: Date,
) {
  if (travelDate) {
    return createPassengerSchemaWithAgeValidation(
      travelDate,
      isInternational,
      isPrimary,
    ).safeParse(data);
  }

  if (isInternational) {
    return isPrimary
      ? primaryInternationalPassengerSchema.safeParse(data)
      : internationalPassengerSchema.safeParse(data);
  }

  return isPrimary
    ? primaryDomesticPassengerSchema.safeParse(data)
    : domesticPassengerSchema.safeParse(data);
}

/**
 * Validates a list of passengers and returns typed result
 * @param data - Raw passenger list data
 * @param isInternational - Whether the flight is international
 * @param travelDate - Optional travel date for passport and age validation
 * @returns Validation result with typed data or errors
 */
export function validatePassengerList(
  data: unknown,
  isInternational: boolean,
  travelDate?: Date,
) {
  if (isInternational && travelDate) {
    return createInternationalPassengerListSchema(travelDate).safeParse(data);
  }

  return isInternational
    ? internationalPassengerListSchema.safeParse(data)
    : domesticPassengerListSchema.safeParse(data);
}
