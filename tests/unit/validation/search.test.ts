/**
 * Unit tests for search form validation schemas
 * Tests specific examples and edge cases
 */

import { describe, it, expect } from "vitest";
import {
  airportSchema,
  departureDateSchema,
  passengerCountSchema,
  oneWaySearchSchema,
  roundTripSearchSchema,
  multiCitySearchSchema,
  searchCriteriaSchema,
  validateSearchCriteria,
  validatePassengerCount,
  validateAirport,
  validateDepartureDate,
} from "@/lib/validation/search";

describe("Airport Schema", () => {
  it("should validate a valid airport", () => {
    const validAirport = {
      code: "JFK",
      name: "John F. Kennedy International Airport",
      city: "New York",
      country: "United States",
    };

    const result = airportSchema.safeParse(validAirport);
    expect(result.success).toBe(true);
  });

  it("should reject airport with invalid code length", () => {
    const invalidAirport = {
      code: "JF",
      name: "John F. Kennedy International Airport",
      city: "New York",
      country: "United States",
    };

    const result = airportSchema.safeParse(invalidAirport);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("exactly 3 characters");
    }
  });

  it("should reject airport with lowercase code", () => {
    const invalidAirport = {
      code: "jfk",
      name: "John F. Kennedy International Airport",
      city: "New York",
      country: "United States",
    };

    const result = airportSchema.safeParse(invalidAirport);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("uppercase letters");
    }
  });

  it("should reject airport with missing fields", () => {
    const invalidAirport = {
      code: "JFK",
      name: "",
      city: "New York",
      country: "United States",
    };

    const result = airportSchema.safeParse(invalidAirport);
    expect(result.success).toBe(false);
  });
});

describe("Departure Date Schema", () => {
  it("should validate a future date", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const result = departureDateSchema.safeParse(futureDate);
    expect(result.success).toBe(true);
  });

  it("should validate today's date", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = departureDateSchema.safeParse(today);
    expect(result.success).toBe(true);
  });

  it("should reject a past date", () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const result = departureDateSchema.safeParse(pastDate);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("cannot be in the past");
    }
  });

  it("should coerce string dates to Date objects", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateString = futureDate.toISOString();

    const result = departureDateSchema.safeParse(dateString);
    expect(result.success).toBe(true);
  });
});

describe("Passenger Count Schema", () => {
  it("should validate valid passenger counts", () => {
    const validCounts = {
      adults: 2,
      children: 1,
      infants: 1,
    };

    const result = passengerCountSchema.safeParse(validCounts);
    expect(result.success).toBe(true);
  });

  it("should require at least 1 adult", () => {
    const invalidCounts = {
      adults: 0,
      children: 2,
      infants: 0,
    };

    const result = passengerCountSchema.safeParse(invalidCounts);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("At least 1 adult");
    }
  });

  it("should reject more than 9 adults", () => {
    const invalidCounts = {
      adults: 10,
      children: 0,
      infants: 0,
    };

    const result = passengerCountSchema.safeParse(invalidCounts);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Maximum 9 adults");
    }
  });

  it("should reject total passengers exceeding 9", () => {
    const invalidCounts = {
      adults: 5,
      children: 5,
      infants: 0,
    };

    const result = passengerCountSchema.safeParse(invalidCounts);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes("Total passengers"),
        ),
      ).toBe(true);
    }
  });

  it("should reject infants exceeding adults", () => {
    const invalidCounts = {
      adults: 1,
      children: 0,
      infants: 2,
    };

    const result = passengerCountSchema.safeParse(invalidCounts);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes("infants cannot exceed"),
        ),
      ).toBe(true);
    }
  });

  it("should accept negative values for children and infants", () => {
    const invalidCounts = {
      adults: 2,
      children: -1,
      infants: 0,
    };

    const result = passengerCountSchema.safeParse(invalidCounts);
    expect(result.success).toBe(false);
  });

  it("should validate edge case: 9 adults, 0 children, 0 infants", () => {
    const validCounts = {
      adults: 9,
      children: 0,
      infants: 0,
    };

    const result = passengerCountSchema.safeParse(validCounts);
    expect(result.success).toBe(true);
  });

  it("should validate edge case: 1 adult, 0 children, 1 infant", () => {
    const validCounts = {
      adults: 1,
      children: 0,
      infants: 1,
    };

    const result = passengerCountSchema.safeParse(validCounts);
    expect(result.success).toBe(true);
  });
});

describe("One-Way Search Schema", () => {
  const validAirport1 = {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
  };

  const validAirport2 = {
    code: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    country: "United Kingdom",
  };

  it("should validate a valid one-way search", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const validSearch = {
      tripType: "one-way" as const,
      segments: [
        {
          origin: validAirport1,
          destination: validAirport2,
          departureDate: futureDate,
        },
      ],
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: "economy" as const,
    };

    const result = oneWaySearchSchema.safeParse(validSearch);
    expect(result.success).toBe(true);
  });

  it("should reject one-way search with multiple segments", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const invalidSearch = {
      tripType: "one-way" as const,
      segments: [
        {
          origin: validAirport1,
          destination: validAirport2,
          departureDate: futureDate,
        },
        {
          origin: validAirport2,
          destination: validAirport1,
          departureDate: futureDate,
        },
      ],
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: "economy" as const,
    };

    const result = oneWaySearchSchema.safeParse(invalidSearch);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("exactly 1 segment");
    }
  });

  it("should reject one-way search with invalid cabin class", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const invalidSearch = {
      tripType: "one-way" as const,
      segments: [
        {
          origin: validAirport1,
          destination: validAirport2,
          departureDate: futureDate,
        },
      ],
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: "premium-economy",
    };

    const result = oneWaySearchSchema.safeParse(invalidSearch);
    expect(result.success).toBe(false);
  });
});

describe("Round-Trip Search Schema", () => {
  const validAirport1 = {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
  };

  const validAirport2 = {
    code: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    country: "United Kingdom",
  };

  it("should validate a valid round-trip search", () => {
    const departureDate = new Date();
    departureDate.setDate(departureDate.getDate() + 7);

    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 14);

    const validSearch = {
      tripType: "round-trip" as const,
      segments: [
        {
          origin: validAirport1,
          destination: validAirport2,
          departureDate: departureDate,
        },
        {
          origin: validAirport2,
          destination: validAirport1,
          departureDate: returnDate,
        },
      ],
      passengers: {
        adults: 2,
        children: 1,
        infants: 0,
      },
      cabinClass: "business" as const,
    };

    const result = roundTripSearchSchema.safeParse(validSearch);
    expect(result.success).toBe(true);
  });

  it("should reject round-trip with return date before departure date", () => {
    const departureDate = new Date();
    departureDate.setDate(departureDate.getDate() + 14);

    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 7);

    const invalidSearch = {
      tripType: "round-trip" as const,
      segments: [
        {
          origin: validAirport1,
          destination: validAirport2,
          departureDate: departureDate,
        },
        {
          origin: validAirport2,
          destination: validAirport1,
          departureDate: returnDate,
        },
      ],
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: "economy" as const,
    };

    const result = roundTripSearchSchema.safeParse(invalidSearch);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.message.includes("Return date must be after departure date"),
        ),
      ).toBe(true);
    }
  });

  it("should reject round-trip with same departure and return date", () => {
    const sameDate = new Date();
    sameDate.setDate(sameDate.getDate() + 7);

    const invalidSearch = {
      tripType: "round-trip" as const,
      segments: [
        {
          origin: validAirport1,
          destination: validAirport2,
          departureDate: sameDate,
        },
        {
          origin: validAirport2,
          destination: validAirport1,
          departureDate: sameDate,
        },
      ],
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: "economy" as const,
    };

    const result = roundTripSearchSchema.safeParse(invalidSearch);
    expect(result.success).toBe(false);
  });

  it("should reject round-trip with mismatched airports", () => {
    const departureDate = new Date();
    departureDate.setDate(departureDate.getDate() + 7);

    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 14);

    const validAirport3 = {
      code: "LAX",
      name: "Los Angeles International Airport",
      city: "Los Angeles",
      country: "United States",
    };

    const invalidSearch = {
      tripType: "round-trip" as const,
      segments: [
        {
          origin: validAirport1,
          destination: validAirport2,
          departureDate: departureDate,
        },
        {
          origin: validAirport3, // Should be validAirport2
          destination: validAirport1,
          departureDate: returnDate,
        },
      ],
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: "economy" as const,
    };

    const result = roundTripSearchSchema.safeParse(invalidSearch);
    expect(result.success).toBe(false);
  });
});

describe("Multi-City Search Schema", () => {
  const validAirport1 = {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
  };

  const validAirport2 = {
    code: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    country: "United Kingdom",
  };

  const validAirport3 = {
    code: "CDG",
    name: "Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
  };

  it("should validate a valid multi-city search with 3 segments", () => {
    const date1 = new Date();
    date1.setDate(date1.getDate() + 7);

    const date2 = new Date();
    date2.setDate(date2.getDate() + 10);

    const date3 = new Date();
    date3.setDate(date3.getDate() + 14);

    const validSearch = {
      tripType: "multi-city" as const,
      segments: [
        {
          origin: validAirport1,
          destination: validAirport2,
          departureDate: date1,
        },
        {
          origin: validAirport2,
          destination: validAirport3,
          departureDate: date2,
        },
        {
          origin: validAirport3,
          destination: validAirport1,
          departureDate: date3,
        },
      ],
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: "first" as const,
    };

    const result = multiCitySearchSchema.safeParse(validSearch);
    expect(result.success).toBe(true);
  });

  it("should validate multi-city with 1 segment", () => {
    const date1 = new Date();
    date1.setDate(date1.getDate() + 7);

    const validSearch = {
      tripType: "multi-city" as const,
      segments: [
        {
          origin: validAirport1,
          destination: validAirport2,
          departureDate: date1,
        },
      ],
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: "economy" as const,
    };

    const result = multiCitySearchSchema.safeParse(validSearch);
    expect(result.success).toBe(true);
  });

  it("should validate multi-city with 5 segments (maximum)", () => {
    const segments = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + 7 + i * 3);
      segments.push({
        origin: i % 2 === 0 ? validAirport1 : validAirport2,
        destination: i % 2 === 0 ? validAirport2 : validAirport1,
        departureDate: date,
      });
    }

    const validSearch = {
      tripType: "multi-city" as const,
      segments,
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: "economy" as const,
    };

    const result = multiCitySearchSchema.safeParse(validSearch);
    expect(result.success).toBe(true);
  });

  it("should reject multi-city with 0 segments", () => {
    const invalidSearch = {
      tripType: "multi-city" as const,
      segments: [],
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: "economy" as const,
    };

    const result = multiCitySearchSchema.safeParse(invalidSearch);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 1 segment");
    }
  });

  it("should reject multi-city with more than 5 segments", () => {
    const segments = [];
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setDate(date.getDate() + 7 + i * 3);
      segments.push({
        origin: i % 2 === 0 ? validAirport1 : validAirport2,
        destination: i % 2 === 0 ? validAirport2 : validAirport1,
        departureDate: date,
      });
    }

    const invalidSearch = {
      tripType: "multi-city" as const,
      segments,
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: "economy" as const,
    };

    const result = multiCitySearchSchema.safeParse(invalidSearch);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at most 5 segments");
    }
  });
});

describe("Search Criteria Schema (Discriminated Union)", () => {
  it("should validate one-way search through main schema", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const validSearch = {
      tripType: "one-way" as const,
      segments: [
        {
          origin: {
            code: "JFK",
            name: "JFK Airport",
            city: "New York",
            country: "USA",
          },
          destination: {
            code: "LHR",
            name: "Heathrow",
            city: "London",
            country: "UK",
          },
          departureDate: futureDate,
        },
      ],
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: "economy" as const,
    };

    const result = searchCriteriaSchema.safeParse(validSearch);
    expect(result.success).toBe(true);
  });

  it("should validate round-trip search through main schema", () => {
    const departureDate = new Date();
    departureDate.setDate(departureDate.getDate() + 7);

    const returnDate = new Date();
    returnDate.setDate(returnDate.getDate() + 14);

    const validSearch = {
      tripType: "round-trip" as const,
      segments: [
        {
          origin: {
            code: "JFK",
            name: "JFK Airport",
            city: "New York",
            country: "USA",
          },
          destination: {
            code: "LHR",
            name: "Heathrow",
            city: "London",
            country: "UK",
          },
          departureDate: departureDate,
        },
        {
          origin: {
            code: "LHR",
            name: "Heathrow",
            city: "London",
            country: "UK",
          },
          destination: {
            code: "JFK",
            name: "JFK Airport",
            city: "New York",
            country: "USA",
          },
          departureDate: returnDate,
        },
      ],
      passengers: {
        adults: 2,
        children: 0,
        infants: 0,
      },
      cabinClass: "business" as const,
    };

    const result = searchCriteriaSchema.safeParse(validSearch);
    expect(result.success).toBe(true);
  });

  it("should validate multi-city search through main schema", () => {
    const date1 = new Date();
    date1.setDate(date1.getDate() + 7);

    const date2 = new Date();
    date2.setDate(date2.getDate() + 10);

    const validSearch = {
      tripType: "multi-city" as const,
      segments: [
        {
          origin: {
            code: "JFK",
            name: "JFK Airport",
            city: "New York",
            country: "USA",
          },
          destination: {
            code: "LHR",
            name: "Heathrow",
            city: "London",
            country: "UK",
          },
          departureDate: date1,
        },
        {
          origin: {
            code: "LHR",
            name: "Heathrow",
            city: "London",
            country: "UK",
          },
          destination: {
            code: "CDG",
            name: "Charles de Gaulle",
            city: "Paris",
            country: "France",
          },
          departureDate: date2,
        },
      ],
      passengers: {
        adults: 1,
        children: 1,
        infants: 0,
      },
      cabinClass: "first" as const,
    };

    const result = searchCriteriaSchema.safeParse(validSearch);
    expect(result.success).toBe(true);
  });
});

describe("Helper Functions", () => {
  it("validateSearchCriteria should work correctly", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const validSearch = {
      tripType: "one-way" as const,
      segments: [
        {
          origin: {
            code: "JFK",
            name: "JFK Airport",
            city: "New York",
            country: "USA",
          },
          destination: {
            code: "LHR",
            name: "Heathrow",
            city: "London",
            country: "UK",
          },
          departureDate: futureDate,
        },
      ],
      passengers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      cabinClass: "economy" as const,
    };

    const result = validateSearchCriteria(validSearch);
    expect(result.success).toBe(true);
  });

  it("validatePassengerCount should work correctly", () => {
    const validCounts = {
      adults: 2,
      children: 1,
      infants: 0,
    };

    const result = validatePassengerCount(validCounts);
    expect(result.success).toBe(true);
  });

  it("validateAirport should work correctly", () => {
    const validAirport = {
      code: "JFK",
      name: "JFK Airport",
      city: "New York",
      country: "USA",
    };

    const result = validateAirport(validAirport);
    expect(result.success).toBe(true);
  });

  it("validateDepartureDate should work correctly", () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const result = validateDepartureDate(futureDate);
    expect(result.success).toBe(true);
  });
});
