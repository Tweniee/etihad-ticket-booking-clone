/**
 * Core type definitions for the Flight Booking System
 * These types are used throughout the application
 */

// ============================================================================
// Airport and Airline Types
// ============================================================================

export interface Airport {
  code: string; // IATA code (e.g., "JFK")
  name: string; // Airport name
  city: string; // City name
  country: string; // Country name
}

export interface Airline {
  code: string;
  name: string;
  logo: string;
}

// ============================================================================
// Search Types
// ============================================================================

export type TripType = "one-way" | "round-trip" | "multi-city";
export type CabinClass = "economy" | "business" | "first";

export interface PassengerCount {
  adults: number; // 1-9
  children: number; // 0-9
  infants: number; // 0-9
}

export interface FlightSegment {
  origin: Airport;
  destination: Airport;
  departureDate: Date;
}

export interface SearchCriteria {
  tripType: TripType;
  segments: FlightSegment[];
  passengers: PassengerCount;
  cabinClass: CabinClass;
}

// ============================================================================
// Flight Types
// ============================================================================

export interface FlightPoint {
  airport: Airport;
  dateTime: Date;
  terminal?: string;
}

export interface FlightSegmentDetail {
  departure: FlightPoint;
  arrival: FlightPoint;
  duration: number; // minutes
  aircraft: string;
  operatingAirline?: Airline;
}

export interface Price {
  amount: number;
  currency: string;
  breakdown: PriceBreakdown;
}

export interface PriceBreakdown {
  baseFare: number;
  taxes: number;
  fees: number;
}

export interface Flight {
  id: string;
  airline: Airline;
  flightNumber: string;
  segments: FlightSegmentDetail[];
  price: Price;
  cabinClass: string;
  availableSeats: number;
}

export interface BaggageAllowance {
  checkedBags: {
    quantity: number;
    weight: number; // kg
    dimensions?: string;
  };
  carryOn: {
    quantity: number;
    weight: number;
    dimensions?: string;
  };
}

export interface FareRules {
  changeFee: number | null; // null means not allowed
  cancellationFee: number | null;
  refundable: boolean;
  changePolicy: string;
  cancellationPolicy: string;
}

export interface FlightDetails extends Flight {
  baggage: BaggageAllowance;
  fareRules: FareRules;
  amenities: string[];
}

// ============================================================================
// Seat Types
// ============================================================================

export type SeatStatus = "available" | "occupied" | "blocked" | "selected";
export type SeatType = "standard" | "extra-legroom" | "exit-row" | "preferred";
export type SeatPosition = "window" | "middle" | "aisle";

export interface Seat {
  id: string;
  row: number;
  column: string;
  status: SeatStatus;
  type: SeatType;
  position: SeatPosition;
  price: number; // additional fee, 0 for standard
}

export interface SeatMap {
  aircraft: string;
  rows: number;
  columns: string[];
  seats: Seat[];
  exitRows: number[];
}

// ============================================================================
// Passenger Types
// ============================================================================

export type PassengerType = "adult" | "child" | "infant";
export type Gender = "male" | "female" | "other";

export interface PassportInfo {
  number: string;
  expiryDate: Date;
  nationality: string;
  issuingCountry: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  countryCode: string;
}

export interface PassengerInfo {
  id: string;
  type: PassengerType;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  passport?: PassportInfo;
  contact?: ContactInfo; // Required for first passenger
}

// ============================================================================
// Extras Types
// ============================================================================

export interface BaggageExtra {
  weight: number; // kg (5, 10, 15, 20, 25, 32)
  price: number;
}

export interface MealExtra {
  type: string; // 'standard', 'vegetarian', 'vegan', 'halal', etc.
  price: number;
}

export interface InsuranceExtra {
  type: "basic" | "comprehensive";
  coverage: number;
  price: number;
}

export interface LoungeExtra {
  airport: string;
  price: number;
}

export interface SelectedExtras {
  baggage: Map<string, BaggageExtra>; // passengerId -> baggage
  meals: Map<string, MealExtra>;
  insurance: InsuranceExtra | null;
  loungeAccess: LoungeExtra | null;
}

// ============================================================================
// Payment Types
// ============================================================================

export interface DetailedPriceBreakdown {
  baseFare: number;
  taxes: number;
  fees: number;
  seatFees: number;
  extraBaggage: number;
  meals: number;
  insurance: number;
  loungeAccess: number;
  total: number;
}

export interface PaymentInfo {
  amount: number;
  currency: string;
  method: string;
  transactionId: string;
  paidAt: Date;
}

export interface PaymentError {
  code: string;
  message: string;
  retryable: boolean;
}

// ============================================================================
// Booking Types
// ============================================================================

export type BookingStatus = "confirmed" | "pending" | "cancelled";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface Booking {
  reference: string;
  status: BookingStatus;
  flight: Flight;
  passengers: PassengerInfo[];
  seats: Map<string, Seat>;
  extras: SelectedExtras;
  payment: PaymentInfo;
  createdAt: Date;
}

export interface BookingSummary {
  flight: Flight;
  passengers: PassengerInfo[];
  seats: Map<string, Seat>;
  extras: SelectedExtras;
  priceBreakdown: DetailedPriceBreakdown;
}

// ============================================================================
// Booking Flow Types
// ============================================================================

export type BookingStep =
  | "search"
  | "results"
  | "details"
  | "seats"
  | "passengers"
  | "extras"
  | "payment"
  | "confirmation";

// ============================================================================
// API Response Types
// ============================================================================

export interface FlightSearchResponse {
  flights: Flight[];
  searchId: string;
  totalResults: number;
}

export interface SeatMapResponse {
  flightId: string;
  seatMap: SeatMap;
}

export interface BookingCreateResponse {
  booking: Booking;
  paymentIntent: {
    clientSecret: string;
    amount: number;
  };
}

export interface ModificationOption {
  type: "change-flight" | "change-seats" | "add-extras";
  available: boolean;
  fee: number;
}

export interface BookingRetrievalResponse {
  booking: Booking;
  modificationOptions: ModificationOption[];
}

// ============================================================================
// Error Types
// ============================================================================

export type ErrorType =
  | "validation"
  | "network"
  | "server"
  | "business"
  | "payment"
  | "session";

export type ErrorAction =
  | "correct-input"
  | "retry"
  | "select-alternative"
  | "contact-support"
  | "restart";

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: unknown;
}

export interface ErrorResponse {
  message: string;
  field?: string;
  retryable: boolean;
  action: ErrorAction;
}
