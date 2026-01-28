/**
 * Integration tests for Flight Search API
 */

import { describe, it, expect } from "vitest";

// Base URL for API calls
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

describe("Flight Search API Integration", () => {
  describe("POST /api/flights/search", () => {
    it("should return flights for valid search criteria", async () => {
      const searchCriteria = {
        tripType: "one-way",
        segments: [
          {
            origin: "JFK",
            destination: "LHR",
            departureDate: "2024-06-01",
          },
        ],
        passengers: {
          adults: 1,
          children: 0,
          infants: 0,
        },
        cabinClass: "economy",
      };

      const response = await fetch(`${BASE_URL}/api/flights/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchCriteria),
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.flights).toBeDefined();
      expect(Array.isArray(data.flights)).toBe(true);
      expect(data.flights.length).toBeGreaterThan(0);
      expect(data.searchId).toBeDefined();
      expect(data.totalResults).toBe(data.flights.length);
    });

    it("should return 400 for missing segments", async () => {
      const invalidCriteria = {
        tripType: "one-way",
        passengers: {
          adults: 1,
          children: 0,
          infants: 0,
        },
        cabinClass: "economy",
      };

      const response = await fetch(`${BASE_URL}/api/flights/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidCriteria),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it("should return 400 for missing passengers", async () => {
      const invalidCriteria = {
        tripType: "one-way",
        segments: [
          {
            origin: "JFK",
            destination: "LHR",
            departureDate: "2024-06-01",
          },
        ],
        cabinClass: "economy",
      };

      const response = await fetch(`${BASE_URL}/api/flights/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidCriteria),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it("should return 400 for missing cabin class", async () => {
      const invalidCriteria = {
        tripType: "one-way",
        segments: [
          {
            origin: "JFK",
            destination: "LHR",
            departureDate: "2024-06-01",
          },
        ],
        passengers: {
          adults: 1,
          children: 0,
          infants: 0,
        },
      };

      const response = await fetch(`${BASE_URL}/api/flights/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidCriteria),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it("should return 400 for invalid airport code", async () => {
      const invalidCriteria = {
        tripType: "one-way",
        segments: [
          {
            origin: "INVALID",
            destination: "LHR",
            departureDate: "2024-06-01",
          },
        ],
        passengers: {
          adults: 1,
          children: 0,
          infants: 0,
        },
        cabinClass: "economy",
      };

      const response = await fetch(`${BASE_URL}/api/flights/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidCriteria),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
      expect(data.error).toContain("Invalid origin airport");
    });

    it("should return 400 for invalid date", async () => {
      const invalidCriteria = {
        tripType: "one-way",
        segments: [
          {
            origin: "JFK",
            destination: "LHR",
            departureDate: "invalid-date",
          },
        ],
        passengers: {
          adults: 1,
          children: 0,
          infants: 0,
        },
        cabinClass: "economy",
      };

      const response = await fetch(`${BASE_URL}/api/flights/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidCriteria),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
      expect(data.error).toContain("Invalid departure date");
    });

    it("should handle round-trip searches", async () => {
      const searchCriteria = {
        tripType: "round-trip",
        segments: [
          {
            origin: "JFK",
            destination: "LHR",
            departureDate: "2024-06-01",
          },
          {
            origin: "LHR",
            destination: "JFK",
            departureDate: "2024-06-15",
          },
        ],
        passengers: {
          adults: 2,
          children: 1,
          infants: 0,
        },
        cabinClass: "business",
      };

      const response = await fetch(`${BASE_URL}/api/flights/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchCriteria),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.flights).toBeDefined();
      expect(data.flights.length).toBeGreaterThan(0);
    });

    it("should return 405 for GET requests", async () => {
      const response = await fetch(`${BASE_URL}/api/flights/search`, {
        method: "GET",
      });

      expect(response.status).toBe(405);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  describe("GET /api/airports/search", () => {
    it("should return airports for valid query", async () => {
      const response = await fetch(`${BASE_URL}/api/airports/search?q=London`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.airports).toBeDefined();
      expect(Array.isArray(data.airports)).toBe(true);
      expect(data.airports.length).toBeGreaterThan(0);
      expect(data.airports[0].city).toBe("London");
    });

    it("should return airports for IATA code query", async () => {
      const response = await fetch(`${BASE_URL}/api/airports/search?q=JFK`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.airports).toBeDefined();
      expect(data.airports.length).toBeGreaterThan(0);
      expect(data.airports[0].code).toBe("JFK");
    });

    it("should return empty array for short query", async () => {
      const response = await fetch(`${BASE_URL}/api/airports/search?q=J`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.airports).toBeDefined();
      expect(data.airports.length).toBe(0);
    });

    it("should return 400 for missing query parameter", async () => {
      const response = await fetch(`${BASE_URL}/api/airports/search`);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it("should limit results to 10 airports", async () => {
      const response = await fetch(`${BASE_URL}/api/airports/search?q=a`);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.airports).toBeDefined();
      expect(data.airports.length).toBeLessThanOrEqual(10);
    });

    it("should search by airport name", async () => {
      const response = await fetch(
        `${BASE_URL}/api/airports/search?q=Heathrow`,
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.airports).toBeDefined();
      expect(data.airports.length).toBeGreaterThan(0);
      expect(data.airports[0].name).toContain("Heathrow");
    });

    it("should be case-insensitive", async () => {
      const response1 = await fetch(`${BASE_URL}/api/airports/search?q=london`);
      const response2 = await fetch(`${BASE_URL}/api/airports/search?q=LONDON`);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      const data1 = await response1.json();
      const data2 = await response2.json();

      expect(data1.airports.length).toBe(data2.airports.length);
    });
  });
});
