/**
 * Validation schemas index
 * Central export point for all validation schemas
 */

// Search validation schemas
export {
  airportSchema,
  departureDateSchema,
  returnDateSchema,
  flightSegmentSchema,
  passengerCountSchema,
  oneWaySearchSchema,
  roundTripSearchSchema,
  multiCitySearchSchema,
  searchCriteriaSchema,
  validateSearchCriteria,
  validatePassengerCount,
  validateAirport,
  validateDepartureDate,
  type AirportInput,
  type FlightSegmentInput,
  type PassengerCountInput,
  type OneWaySearchInput,
  type RoundTripSearchInput,
  type MultiCitySearchInput,
  type SearchCriteriaInput,
} from "./search";
