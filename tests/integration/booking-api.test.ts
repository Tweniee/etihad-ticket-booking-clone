/**
 * Integration Tests for Booking API
 *
 * Tests booking creation and retrieval endpoints
 *
 * Requirements: 10.6, 11.1, 11.2, 12.1, 12.2
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { prisma } from "@/lib/prisma";

describe("Booking API Integration", () => {
  // Clean up test data after each test
  afterEach(async () => {
    await prisma.passenger.deleteMany({});
    await prisma.booking.deleteMany({});
  });

  describe("POST /api/bookings/create", () => {
    it("creates a booking with valid data", async () => {
      const bookingData = {
        flight: {
          id: "flight-123",
          airline: { code: "EY", name: "Etihad Airways", logo: "/logo.png" },
          flightNumber: "EY123",
          segments: [
            {
              departure: {
                airport: {
                  code: "JFK",
                  name: "JFK",
                  city: "New York",
                  country: "USA",
                },
                dateTime: new Date("2024-06-01T10:00:00Z"),
              },
              arrival: {
                airport: {
                  code: "AUH",
                  name: "AUH",
                  city: "Abu Dhabi",
                  country: "UAE",
                },
                dateTime: new Date("2024-06-01T20:00:00Z"),
              },
              duration: 600,
              aircraft: "Boeing 787",
            },
          ],
          price: {
            amount: 1000,
            currency: "USD",
            breakdown: { baseFare: 800, taxes: 150, fees: 50 },
          },
          cabinClass: "economy",
          availableSeats: 100,
        },
        passengers: [
          {
            id: "passenger-1",
            type: "adult",
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: "1990-01-01",
            gender: "male",
            contact: {
              email: "john@example.com",
              phone: "1234567890",
              countryCode: "+1",
            },
          },
        ],
        seats: {
          "passenger-1": {
            id: "12A",
            row: 12,
            column: "A",
            status: "selected",
            type: "standard",
            position: "window",
            price: 0,
          },
        },
        extras: {
          baggage: {},
          meals: {},
          insurance: null,
          loungeAccess: null,
        },
        totalAmount: 1000,
        currency: "USD",
        paymentId: "pay_123456",
      };

      const response = await fetch(
        "http://localhost:3000/api/bookings/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        },
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.booking).toBeDefined();
      expect(data.booking.reference).toMatch(/^[A-Z0-9]{6}$/);
      expect(data.booking.status).toBe("CONFIRMED");
      expect(data.booking.paymentStatus).toBe("COMPLETED");
      expect(data.booking.passengers).toHaveLength(1);
      expect(data.booking.passengers[0].firstName).toBe("John");
      expect(data.booking.passengers[0].lastName).toBe("Doe");
    });

    it("rejects booking with missing required fields", async () => {
      const invalidData = {
        flight: null,
        passengers: [],
      };

      const response = await fetch(
        "http://localhost:3000/api/bookings/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invalidData),
        },
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it("rejects booking with empty passengers array", async () => {
      const invalidData = {
        flight: { id: "flight-123" },
        passengers: [],
        totalAmount: 1000,
        currency: "USD",
        paymentId: "pay_123",
      };

      const response = await fetch(
        "http://localhost:3000/api/bookings/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invalidData),
        },
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("passenger");
    });

    it("generates unique booking references", async () => {
      const bookingData = {
        flight: {
          id: "flight-123",
          airline: { code: "EY", name: "Etihad Airways", logo: "/logo.png" },
          flightNumber: "EY123",
          segments: [
            {
              departure: {
                airport: {
                  code: "JFK",
                  name: "JFK",
                  city: "New York",
                  country: "USA",
                },
                dateTime: new Date("2024-06-01T10:00:00Z"),
              },
              arrival: {
                airport: {
                  code: "AUH",
                  name: "AUH",
                  city: "Abu Dhabi",
                  country: "UAE",
                },
                dateTime: new Date("2024-06-01T20:00:00Z"),
              },
              duration: 600,
              aircraft: "Boeing 787",
            },
          ],
          price: {
            amount: 1000,
            currency: "USD",
            breakdown: { baseFare: 800, taxes: 150, fees: 50 },
          },
          cabinClass: "economy",
          availableSeats: 100,
        },
        passengers: [
          {
            id: "passenger-1",
            type: "adult",
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: "1990-01-01",
            gender: "male",
            contact: {
              email: "john@example.com",
              phone: "1234567890",
              countryCode: "+1",
            },
          },
        ],
        seats: {},
        extras: {
          baggage: {},
          meals: {},
          insurance: null,
          loungeAccess: null,
        },
        totalAmount: 1000,
        currency: "USD",
        paymentId: "pay_123456",
      };

      // Create multiple bookings
      const references = new Set<string>();
      for (let i = 0; i < 5; i++) {
        const response = await fetch(
          "http://localhost:3000/api/bookings/create",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...bookingData,
              paymentId: `pay_${i}`,
            }),
          },
        );

        const data = await response.json();
        references.add(data.booking.reference);
      }

      // All references should be unique
      expect(references.size).toBe(5);
    });
  });

  describe("GET /api/bookings/[reference]", () => {
    let testBookingReference: string;

    beforeEach(async () => {
      // Create a test booking
      const booking = await prisma.booking.create({
        data: {
          reference: "TEST01",
          status: "CONFIRMED",
          flightId: "flight-123",
          flightData: {
            id: "flight-123",
            airline: { code: "EY", name: "Etihad Airways" },
            flightNumber: "EY123",
          },
          seats: {},
          extras: {},
          totalAmount: 1000,
          currency: "USD",
          paymentId: "pay_test",
          paymentStatus: "COMPLETED",
          passengers: {
            create: [
              {
                type: "ADULT",
                firstName: "John",
                lastName: "Doe",
                dateOfBirth: new Date("1990-01-01"),
                gender: "MALE",
                email: "john@example.com",
              },
            ],
          },
        },
      });

      testBookingReference = booking.reference;
    });

    it("retrieves booking by reference", async () => {
      const response = await fetch(
        `http://localhost:3000/api/bookings/${testBookingReference}`,
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.booking.reference).toBe(testBookingReference);
      expect(data.booking.passengers).toHaveLength(1);
    });

    it("retrieves booking with lastName authentication", async () => {
      const response = await fetch(
        `http://localhost:3000/api/bookings/${testBookingReference}?lastName=Doe`,
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.booking.reference).toBe(testBookingReference);
    });

    it("rejects retrieval with incorrect lastName", async () => {
      const response = await fetch(
        `http://localhost:3000/api/bookings/${testBookingReference}?lastName=Smith`,
      );

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it("returns 404 for non-existent booking", async () => {
      const response = await fetch("http://localhost:3000/api/bookings/ABC999");

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it("rejects invalid booking reference format", async () => {
      const response = await fetch(
        "http://localhost:3000/api/bookings/invalid",
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Invalid");
    });
  });
});
