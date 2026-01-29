/**
 * Unit tests for SendGrid email service
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
  validateSendGridConfig,
  type BookingConfirmationData,
  type BookingCancellationData,
} from "@/lib/email";
import type { Booking, PassengerInfo } from "@/lib/types";

// Mock SendGrid
vi.mock("@sendgrid/mail", () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn().mockResolvedValue([{ statusCode: 202 }]),
  },
}));

describe("SendGrid Email Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateSendGridConfig", () => {
    it("should return true when SendGrid is configured", () => {
      const originalApiKey = process.env.SENDGRID_API_KEY;
      const originalFromEmail = process.env.SENDGRID_FROM_EMAIL;

      process.env.SENDGRID_API_KEY = "test-api-key";
      process.env.SENDGRID_FROM_EMAIL = "test@example.com";

      const result = validateSendGridConfig();
      expect(result).toBe(true);

      process.env.SENDGRID_API_KEY = originalApiKey;
      process.env.SENDGRID_FROM_EMAIL = originalFromEmail;
    });

    it("should return false when SendGrid is not configured", () => {
      const originalApiKey = process.env.SENDGRID_API_KEY;
      const originalFromEmail = process.env.SENDGRID_FROM_EMAIL;

      delete process.env.SENDGRID_API_KEY;
      delete process.env.SENDGRID_FROM_EMAIL;

      const result = validateSendGridConfig();
      expect(result).toBe(false);

      process.env.SENDGRID_API_KEY = originalApiKey;
      process.env.SENDGRID_FROM_EMAIL = originalFromEmail;
    });
  });

  describe("sendBookingConfirmationEmail", () => {
    it("should throw error when primary passenger has no email", async () => {
      const mockBooking: Booking = {
        reference: "ABC123",
        status: "confirmed",
        flight: {
          id: "flight-1",
          airline: {
            code: "EY",
            name: "Etihad Airways",
            logo: "/logos/etihad.png",
          },
          flightNumber: "EY123",
          segments: [
            {
              departure: {
                airport: {
                  code: "AUH",
                  name: "Abu Dhabi International",
                  city: "Abu Dhabi",
                  country: "UAE",
                },
                dateTime: new Date("2024-06-15T10:00:00Z"),
                terminal: "3",
              },
              arrival: {
                airport: {
                  code: "JFK",
                  name: "John F. Kennedy International",
                  city: "New York",
                  country: "USA",
                },
                dateTime: new Date("2024-06-15T18:00:00Z"),
                terminal: "4",
              },
              duration: 480,
              aircraft: "Boeing 787",
            },
          ],
          price: {
            amount: 1200,
            currency: "USD",
            breakdown: {
              baseFare: 1000,
              taxes: 150,
              fees: 50,
            },
          },
          cabinClass: "Economy",
          availableSeats: 50,
        },
        passengers: [],
        seats: new Map(),
        extras: {
          baggage: new Map(),
          meals: new Map(),
          insurance: null,
          loungeAccess: null,
        },
        payment: {
          amount: 1200,
          currency: "USD",
          method: "Card",
          transactionId: "txn_123",
          paidAt: new Date(),
        },
        createdAt: new Date(),
      };

      const primaryPassenger: PassengerInfo = {
        id: "passenger-1",
        type: "adult",
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: new Date("1990-01-01"),
        gender: "male",
      };

      const data: BookingConfirmationData = {
        booking: mockBooking,
        primaryPassenger,
      };

      await expect(sendBookingConfirmationEmail(data)).rejects.toThrow(
        "Primary passenger email is required",
      );
    });

    it("should send confirmation email successfully", async () => {
      const sgMail = await import("@sendgrid/mail");

      const mockBooking: Booking = {
        reference: "ABC123",
        status: "confirmed",
        flight: {
          id: "flight-1",
          airline: {
            code: "EY",
            name: "Etihad Airways",
            logo: "/logos/etihad.png",
          },
          flightNumber: "EY123",
          segments: [
            {
              departure: {
                airport: {
                  code: "AUH",
                  name: "Abu Dhabi International",
                  city: "Abu Dhabi",
                  country: "UAE",
                },
                dateTime: new Date("2024-06-15T10:00:00Z"),
                terminal: "3",
              },
              arrival: {
                airport: {
                  code: "JFK",
                  name: "John F. Kennedy International",
                  city: "New York",
                  country: "USA",
                },
                dateTime: new Date("2024-06-15T18:00:00Z"),
                terminal: "4",
              },
              duration: 480,
              aircraft: "Boeing 787",
            },
          ],
          price: {
            amount: 1200,
            currency: "USD",
            breakdown: {
              baseFare: 1000,
              taxes: 150,
              fees: 50,
            },
          },
          cabinClass: "Economy",
          availableSeats: 50,
        },
        passengers: [],
        seats: new Map(),
        extras: {
          baggage: new Map(),
          meals: new Map(),
          insurance: null,
          loungeAccess: null,
        },
        payment: {
          amount: 1200,
          currency: "USD",
          method: "Card",
          transactionId: "txn_123",
          paidAt: new Date(),
        },
        createdAt: new Date(),
      };

      const primaryPassenger: PassengerInfo = {
        id: "passenger-1",
        type: "adult",
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: new Date("1990-01-01"),
        gender: "male",
        contact: {
          email: "john.doe@example.com",
          phone: "+1234567890",
          countryCode: "+1",
        },
      };

      const data: BookingConfirmationData = {
        booking: mockBooking,
        primaryPassenger,
      };

      await sendBookingConfirmationEmail(data);

      expect(sgMail.default.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john.doe@example.com",
          subject: "Booking Confirmation - ABC123",
        }),
      );
    });
  });

  describe("sendBookingCancellationEmail", () => {
    it("should throw error when email is not provided", async () => {
      const data: BookingCancellationData = {
        bookingReference: "ABC123",
        passengerName: "John Doe",
        flightDetails: "EY123 - Abu Dhabi to New York",
        cancellationFee: 100,
        refundAmount: 1100,
        currency: "USD",
      };

      await expect(sendBookingCancellationEmail("", data)).rejects.toThrow(
        "Email address is required",
      );
    });

    it("should send cancellation email successfully", async () => {
      const sgMail = await import("@sendgrid/mail");

      const data: BookingCancellationData = {
        bookingReference: "ABC123",
        passengerName: "John Doe",
        flightDetails: "EY123 - Abu Dhabi to New York",
        cancellationFee: 100,
        refundAmount: 1100,
        currency: "USD",
      };

      await sendBookingCancellationEmail("john.doe@example.com", data);

      expect(sgMail.default.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john.doe@example.com",
          subject: "Booking Cancellation - ABC123",
        }),
      );
    });
  });
});
