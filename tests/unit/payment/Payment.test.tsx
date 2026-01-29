/**
 * Payment Component Tests
 *
 * Tests for the Payment component with Razorpay integration
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Payment } from "@/components/payment/Payment";
import { useBookingStore } from "@/lib/store/booking-store";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock Razorpay utilities
vi.mock("@/lib/utils/razorpay-client", () => ({
  loadRazorpayScript: vi.fn(() => Promise.resolve(true)),
  openRazorpayCheckout: vi.fn(),
  createPaymentOrder: vi.fn(() =>
    Promise.resolve({
      orderId: "order_test123",
      amount: 10000,
      currency: "INR",
      keyId: "test_key",
    }),
  ),
  verifyPayment: vi.fn(() =>
    Promise.resolve({
      success: true,
      paymentId: "pay_test123",
      orderId: "order_test123",
    }),
  ),
}));

describe("Payment Component", () => {
  beforeEach(() => {
    // Reset store before each test
    useBookingStore.setState({
      selectedFlight: {
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
                code: "JFK",
                name: "John F. Kennedy International Airport",
                city: "New York",
                country: "USA",
              },
              dateTime: new Date("2024-06-01T10:00:00"),
            },
            arrival: {
              airport: {
                code: "AUH",
                name: "Abu Dhabi International Airport",
                city: "Abu Dhabi",
                country: "UAE",
              },
              dateTime: new Date("2024-06-02T06:00:00"),
            },
            duration: 780,
            aircraft: "Boeing 787",
          },
        ],
        price: {
          amount: 1000,
          currency: "USD",
          breakdown: {
            baseFare: 800,
            taxes: 150,
            fees: 50,
          },
        },
        cabinClass: "economy",
        availableSeats: 50,
      },
      passengers: [
        {
          id: "passenger-1",
          type: "adult",
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: new Date("1990-01-01"),
          gender: "male",
          contact: {
            email: "john@example.com",
            phone: "+1234567890",
            countryCode: "+1",
          },
        },
      ],
      selectedSeats: new Map(),
      selectedExtras: {
        baggage: new Map(),
        meals: new Map(),
        insurance: null,
        loungeAccess: null,
      },
      priceBreakdown: {
        baseFare: 800,
        taxes: 150,
        fees: 50,
        seatFees: 0,
        extraBaggage: 0,
        meals: 0,
        insurance: 0,
        loungeAccess: 0,
        total: 1000,
      },
      totalPrice: 1000,
    });
  });

  it("renders payment component with booking summary", async () => {
    render(<Payment />);

    await waitFor(() => {
      expect(screen.getByText("Payment")).toBeInTheDocument();
      expect(screen.getByText("Booking Summary")).toBeInTheDocument();
      expect(screen.getByText("Etihad Airways EY123")).toBeInTheDocument();
      // Check for passenger name parts separately since they're in different elements
      expect(screen.getByText(/John/)).toBeInTheDocument();
      expect(screen.getByText(/Doe/)).toBeInTheDocument();
      expect(screen.getByText(/adult/)).toBeInTheDocument();
    });
  });

  it("displays price breakdown", async () => {
    render(<Payment />);

    await waitFor(() => {
      expect(screen.getByText("Price Breakdown")).toBeInTheDocument();
    });
  });

  it("shows payment button with correct amount", async () => {
    render(<Payment />);

    await waitFor(() => {
      const payButton = screen.getByRole("button", {
        name: /Pay USD 1000.00/i,
      });
      expect(payButton).toBeInTheDocument();
    });
  });

  it("displays security notice", async () => {
    render(<Payment />);

    await waitFor(() => {
      expect(
        screen.getByText(/Your payment is secure and encrypted/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Powered by Razorpay/i)).toBeInTheDocument();
    });
  });

  it("shows error when booking data is invalid", () => {
    // Clear booking data
    useBookingStore.setState({
      selectedFlight: null,
      passengers: [],
      totalPrice: 0,
    });

    render(<Payment />);

    expect(
      screen.getByText(
        /Invalid booking data. Please complete all previous steps./i,
      ),
    ).toBeInTheDocument();
  });

  it("displays back button", async () => {
    render(<Payment />);

    await waitFor(() => {
      const backButton = screen.getByRole("button", { name: /Back/i });
      expect(backButton).toBeInTheDocument();
    });
  });
});
