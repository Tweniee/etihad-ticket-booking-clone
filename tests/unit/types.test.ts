/**
 * Unit tests for core type definitions
 * Validates that all required types are properly defined and exported
 */

import { describe, it, expect } from "vitest";
import type {
  // Airport and Airline Types
  Airport,
  Airline,
  // Search Types
  TripType,
  CabinClass,
  PassengerCount,
  FlightSegment,
  SearchCriteria,
  // Flight Types
  FlightPoint,
  FlightSegmentDetail,
  Price,
  PriceBreakdown,
  Flight,
  BaggageAllowance,
  FareRules,
  FlightDetails,
  // Seat Types
  SeatStatus,
  SeatType,
  SeatPosition,
  Seat,
  SeatMap,
  // Passenger Types
  PassengerType,
  Gender,
  PassportInfo,
  ContactInfo,
  PassengerInfo,
  // Extras Types
  BaggageExtra,
  MealExtra,
  InsuranceExtra,
  LoungeExtra,
  SelectedExtras,
  // Payment Types
  DetailedPriceBreakdown,
  PaymentInfo,
  PaymentError,
  // Booking Types
  BookingStatus,
  PaymentStatus,
  Booking,
  BookingSummary,
  // Booking Flow Types
  BookingStep,
  // API Response Types
  FlightSearchResponse,
  SeatMapResponse,
  BookingCreateResponse,
  ModificationOption,
  BookingRetrievalResponse,
  // Error Types
  ErrorType,
  ErrorAction,
  AppError,
  ErrorResponse,
} from "@/lib/types";

describe("Core Type Definitions", () => {
  describe("Airport and Airline Types", () => {
    it("should define Airport interface with required fields", () => {
      const airport: Airport = {
        code: "JFK",
        name: "John F. Kennedy International Airport",
        city: "New York",
        country: "United States",
      };

      expect(airport.code).toBe("JFK");
      expect(airport.name).toBeDefined();
      expect(airport.city).toBeDefined();
      expect(airport.country).toBeDefined();
    });

    it("should define Airline interface with required fields", () => {
      const airline: Airline = {
        code: "AA",
        name: "American Airlines",
        logo: "https://example.com/logo.png",
      };

      expect(airline.code).toBe("AA");
      expect(airline.name).toBeDefined();
      expect(airline.logo).toBeDefined();
    });
  });

  describe("Search Types", () => {
    it("should define valid TripType values", () => {
      const oneWay: TripType = "one-way";
      const roundTrip: TripType = "round-trip";
      const multiCity: TripType = "multi-city";

      expect(oneWay).toBe("one-way");
      expect(roundTrip).toBe("round-trip");
      expect(multiCity).toBe("multi-city");
    });

    it("should define valid CabinClass values", () => {
      const economy: CabinClass = "economy";
      const business: CabinClass = "business";
      const first: CabinClass = "first";

      expect(economy).toBe("economy");
      expect(business).toBe("business");
      expect(first).toBe("first");
    });

    it("should define PassengerCount interface", () => {
      const passengerCount: PassengerCount = {
        adults: 2,
        children: 1,
        infants: 0,
      };

      expect(passengerCount.adults).toBe(2);
      expect(passengerCount.children).toBe(1);
      expect(passengerCount.infants).toBe(0);
    });

    it("should define FlightSegment interface", () => {
      const segment: FlightSegment = {
        origin: {
          code: "JFK",
          name: "JFK Airport",
          city: "New York",
          country: "USA",
        },
        destination: {
          code: "LAX",
          name: "LAX Airport",
          city: "Los Angeles",
          country: "USA",
        },
        departureDate: new Date("2024-06-01"),
      };

      expect(segment.origin.code).toBe("JFK");
      expect(segment.destination.code).toBe("LAX");
      expect(segment.departureDate).toBeInstanceOf(Date);
    });

    it("should define SearchCriteria interface", () => {
      const criteria: SearchCriteria = {
        tripType: "round-trip",
        segments: [
          {
            origin: {
              code: "JFK",
              name: "JFK",
              city: "New York",
              country: "USA",
            },
            destination: {
              code: "LAX",
              name: "LAX",
              city: "Los Angeles",
              country: "USA",
            },
            departureDate: new Date("2024-06-01"),
          },
        ],
        passengers: {
          adults: 1,
          children: 0,
          infants: 0,
        },
        cabinClass: "economy",
      };

      expect(criteria.tripType).toBe("round-trip");
      expect(criteria.segments).toHaveLength(1);
      expect(criteria.passengers.adults).toBe(1);
      expect(criteria.cabinClass).toBe("economy");
    });
  });

  describe("Flight Types", () => {
    it("should define Price interface with breakdown", () => {
      const price: Price = {
        amount: 500,
        currency: "USD",
        breakdown: {
          baseFare: 400,
          taxes: 80,
          fees: 20,
        },
      };

      expect(price.amount).toBe(500);
      expect(price.currency).toBe("USD");
      expect(price.breakdown.baseFare).toBe(400);
      expect(price.breakdown.taxes).toBe(80);
      expect(price.breakdown.fees).toBe(20);
    });

    it("should define Flight interface", () => {
      const flight: Flight = {
        id: "flight-123",
        airline: {
          code: "AA",
          name: "American Airlines",
          logo: "logo.png",
        },
        flightNumber: "AA100",
        segments: [
          {
            departure: {
              airport: {
                code: "JFK",
                name: "JFK",
                city: "New York",
                country: "USA",
              },
              dateTime: new Date("2024-06-01T10:00:00"),
              terminal: "4",
            },
            arrival: {
              airport: {
                code: "LAX",
                name: "LAX",
                city: "Los Angeles",
                country: "USA",
              },
              dateTime: new Date("2024-06-01T13:00:00"),
              terminal: "B",
            },
            duration: 360,
            aircraft: "Boeing 737",
          },
        ],
        price: {
          amount: 500,
          currency: "USD",
          breakdown: {
            baseFare: 400,
            taxes: 80,
            fees: 20,
          },
        },
        cabinClass: "economy",
        availableSeats: 50,
      };

      expect(flight.id).toBe("flight-123");
      expect(flight.airline.code).toBe("AA");
      expect(flight.flightNumber).toBe("AA100");
      expect(flight.segments).toHaveLength(1);
      expect(flight.price.amount).toBe(500);
      expect(flight.cabinClass).toBe("economy");
      expect(flight.availableSeats).toBe(50);
    });
  });

  describe("Seat Types", () => {
    it("should define valid SeatStatus values", () => {
      const available: SeatStatus = "available";
      const occupied: SeatStatus = "occupied";
      const blocked: SeatStatus = "blocked";
      const selected: SeatStatus = "selected";

      expect(available).toBe("available");
      expect(occupied).toBe("occupied");
      expect(blocked).toBe("blocked");
      expect(selected).toBe("selected");
    });

    it("should define valid SeatType values", () => {
      const standard: SeatType = "standard";
      const extraLegroom: SeatType = "extra-legroom";
      const exitRow: SeatType = "exit-row";
      const preferred: SeatType = "preferred";

      expect(standard).toBe("standard");
      expect(extraLegroom).toBe("extra-legroom");
      expect(exitRow).toBe("exit-row");
      expect(preferred).toBe("preferred");
    });

    it("should define Seat interface", () => {
      const seat: Seat = {
        id: "12A",
        row: 12,
        column: "A",
        status: "available",
        type: "standard",
        position: "window",
        price: 0,
      };

      expect(seat.id).toBe("12A");
      expect(seat.row).toBe(12);
      expect(seat.column).toBe("A");
      expect(seat.status).toBe("available");
      expect(seat.type).toBe("standard");
      expect(seat.position).toBe("window");
      expect(seat.price).toBe(0);
    });
  });

  describe("Passenger Types", () => {
    it("should define valid PassengerType values", () => {
      const adult: PassengerType = "adult";
      const child: PassengerType = "child";
      const infant: PassengerType = "infant";

      expect(adult).toBe("adult");
      expect(child).toBe("child");
      expect(infant).toBe("infant");
    });

    it("should define PassengerInfo interface", () => {
      const passenger: PassengerInfo = {
        id: "passenger-1",
        type: "adult",
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: new Date("1990-01-01"),
        gender: "male",
        contact: {
          email: "john@example.com",
          phone: "1234567890",
          countryCode: "+1",
        },
      };

      expect(passenger.id).toBe("passenger-1");
      expect(passenger.type).toBe("adult");
      expect(passenger.firstName).toBe("John");
      expect(passenger.lastName).toBe("Doe");
      expect(passenger.dateOfBirth).toBeInstanceOf(Date);
      expect(passenger.gender).toBe("male");
      expect(passenger.contact?.email).toBe("john@example.com");
    });

    it("should define PassportInfo interface for international flights", () => {
      const passport: PassportInfo = {
        number: "AB1234567",
        expiryDate: new Date("2030-01-01"),
        nationality: "USA",
        issuingCountry: "USA",
      };

      expect(passport.number).toBe("AB1234567");
      expect(passport.expiryDate).toBeInstanceOf(Date);
      expect(passport.nationality).toBe("USA");
      expect(passport.issuingCountry).toBe("USA");
    });
  });

  describe("Extras Types", () => {
    it("should define BaggageExtra interface", () => {
      const baggage: BaggageExtra = {
        weight: 20,
        price: 50,
      };

      expect(baggage.weight).toBe(20);
      expect(baggage.price).toBe(50);
    });

    it("should define MealExtra interface", () => {
      const meal: MealExtra = {
        type: "vegetarian",
        price: 15,
      };

      expect(meal.type).toBe("vegetarian");
      expect(meal.price).toBe(15);
    });

    it("should define InsuranceExtra interface", () => {
      const insurance: InsuranceExtra = {
        type: "comprehensive",
        coverage: 100000,
        price: 50,
      };

      expect(insurance.type).toBe("comprehensive");
      expect(insurance.coverage).toBe(100000);
      expect(insurance.price).toBe(50);
    });

    it("should define LoungeExtra interface", () => {
      const lounge: LoungeExtra = {
        airport: "JFK",
        price: 75,
      };

      expect(lounge.airport).toBe("JFK");
      expect(lounge.price).toBe(75);
    });
  });

  describe("Payment Types", () => {
    it("should define DetailedPriceBreakdown interface", () => {
      const breakdown: DetailedPriceBreakdown = {
        baseFare: 400,
        taxes: 80,
        fees: 20,
        seatFees: 30,
        extraBaggage: 50,
        meals: 15,
        insurance: 50,
        loungeAccess: 75,
        total: 720,
      };

      expect(breakdown.baseFare).toBe(400);
      expect(breakdown.taxes).toBe(80);
      expect(breakdown.fees).toBe(20);
      expect(breakdown.seatFees).toBe(30);
      expect(breakdown.extraBaggage).toBe(50);
      expect(breakdown.meals).toBe(15);
      expect(breakdown.insurance).toBe(50);
      expect(breakdown.loungeAccess).toBe(75);
      expect(breakdown.total).toBe(720);
    });

    it("should define PaymentInfo interface", () => {
      const payment: PaymentInfo = {
        amount: 720,
        currency: "USD",
        method: "credit_card",
        transactionId: "txn_123456",
        paidAt: new Date(),
      };

      expect(payment.amount).toBe(720);
      expect(payment.currency).toBe("USD");
      expect(payment.method).toBe("credit_card");
      expect(payment.transactionId).toBe("txn_123456");
      expect(payment.paidAt).toBeInstanceOf(Date);
    });
  });

  describe("Booking Types", () => {
    it("should define valid BookingStatus values", () => {
      const confirmed: BookingStatus = "confirmed";
      const pending: BookingStatus = "pending";
      const cancelled: BookingStatus = "cancelled";

      expect(confirmed).toBe("confirmed");
      expect(pending).toBe("pending");
      expect(cancelled).toBe("cancelled");
    });

    it("should define valid BookingStep values", () => {
      const steps: BookingStep[] = [
        "search",
        "results",
        "details",
        "seats",
        "passengers",
        "extras",
        "payment",
        "confirmation",
      ];

      expect(steps).toHaveLength(8);
      expect(steps).toContain("search");
      expect(steps).toContain("confirmation");
    });
  });

  describe("Error Types", () => {
    it("should define valid ErrorType values", () => {
      const types: ErrorType[] = [
        "validation",
        "network",
        "server",
        "business",
        "payment",
        "session",
      ];

      expect(types).toHaveLength(6);
      expect(types).toContain("validation");
      expect(types).toContain("payment");
    });

    it("should define AppError interface", () => {
      const error: AppError = {
        type: "validation",
        message: "Invalid email format",
        code: "INVALID_EMAIL",
        details: { field: "email" },
      };

      expect(error.type).toBe("validation");
      expect(error.message).toBe("Invalid email format");
      expect(error.code).toBe("INVALID_EMAIL");
      expect(error.details).toBeDefined();
    });
  });
});
