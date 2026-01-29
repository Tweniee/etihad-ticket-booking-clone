/**
 * Unit tests for price calculation utilities
 *
 * Requirements: 9.1, 9.3, 9.4, 9.5
 */

import { describe, it, expect } from "vitest";
import {
  calculateTotalPrice,
  calculatePricePerPassenger,
  calculateBaseFarePerPassenger,
  formatCurrency,
  formatPrice,
  getCurrencySymbol,
  getPriceBreakdownLineItems,
  validatePriceBreakdown,
  roundPrice,
  calculatePercentage,
} from "../../../lib/utils/price";
import type {
  Flight,
  Seat,
  SelectedExtras,
  PassengerCount,
  DetailedPriceBreakdown,
} from "../../../lib/types";

describe("Price Calculator Utilities", () => {
  // Mock data
  const mockFlight: Flight = {
    id: "FL123",
    airline: {
      code: "EY",
      name: "Etihad Airways",
      logo: "/logos/etihad.png",
    },
    flightNumber: "EY123",
    segments: [],
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
  };

  const mockSeats = new Map<string, Seat>([
    [
      "passenger1",
      {
        id: "1A",
        row: 1,
        column: "A",
        status: "selected",
        type: "extra-legroom",
        position: "window",
        price: 50,
      },
    ],
    [
      "passenger2",
      {
        id: "1B",
        row: 1,
        column: "B",
        status: "selected",
        type: "standard",
        position: "middle",
        price: 0,
      },
    ],
  ]);

  const mockExtras: SelectedExtras = {
    baggage: new Map([
      ["passenger1", { weight: 20, price: 75 }],
      ["passenger2", { weight: 15, price: 50 }],
    ]),
    meals: new Map([
      ["passenger1", { type: "vegetarian", price: 25 }],
      ["passenger2", { type: "standard", price: 20 }],
    ]),
    insurance: { type: "basic", coverage: 50000, price: 30 },
    loungeAccess: { airport: "AUH", price: 40 },
  };

  const mockPassengerCount: PassengerCount = {
    adults: 2,
    children: 0,
    infants: 0,
  };

  describe("calculateTotalPrice", () => {
    it("should calculate total price with all components", () => {
      const breakdown = calculateTotalPrice(
        mockFlight,
        mockSeats,
        mockExtras,
        mockPassengerCount,
      );

      expect(breakdown.baseFare).toBe(800);
      expect(breakdown.taxes).toBe(150);
      expect(breakdown.fees).toBe(50);
      expect(breakdown.seatFees).toBe(50); // Only passenger1 has paid seat
      expect(breakdown.extraBaggage).toBe(125); // 75 + 50
      expect(breakdown.meals).toBe(45); // 25 + 20
      expect(breakdown.insurance).toBe(30);
      expect(breakdown.loungeAccess).toBe(40);
      expect(breakdown.total).toBe(1290); // Sum of all components
    });

    it("should handle null flight", () => {
      const breakdown = calculateTotalPrice(null, new Map(), {
        baggage: new Map(),
        meals: new Map(),
        insurance: null,
        loungeAccess: null,
      });

      expect(breakdown.baseFare).toBe(0);
      expect(breakdown.total).toBe(0);
    });

    it("should handle empty seats and extras", () => {
      const breakdown = calculateTotalPrice(mockFlight, new Map(), {
        baggage: new Map(),
        meals: new Map(),
        insurance: null,
        loungeAccess: null,
      });

      expect(breakdown.baseFare).toBe(800);
      expect(breakdown.taxes).toBe(150);
      expect(breakdown.fees).toBe(50);
      expect(breakdown.seatFees).toBe(0);
      expect(breakdown.extraBaggage).toBe(0);
      expect(breakdown.meals).toBe(0);
      expect(breakdown.insurance).toBe(0);
      expect(breakdown.loungeAccess).toBe(0);
      expect(breakdown.total).toBe(1000);
    });

    it("should handle only some extras", () => {
      const partialExtras: SelectedExtras = {
        baggage: new Map([["passenger1", { weight: 20, price: 75 }]]),
        meals: new Map(),
        insurance: { type: "basic", coverage: 50000, price: 30 },
        loungeAccess: null,
      };

      const breakdown = calculateTotalPrice(
        mockFlight,
        new Map(),
        partialExtras,
      );

      expect(breakdown.extraBaggage).toBe(75);
      expect(breakdown.meals).toBe(0);
      expect(breakdown.insurance).toBe(30);
      expect(breakdown.loungeAccess).toBe(0);
      expect(breakdown.total).toBe(1105); // 1000 + 75 + 30
    });
  });

  describe("calculatePricePerPassenger", () => {
    it("should calculate price per passenger for adults only", () => {
      const pricePerPassenger = calculatePricePerPassenger(1000, {
        adults: 2,
        children: 0,
        infants: 0,
      });

      expect(pricePerPassenger).toBe(500);
    });

    it("should calculate price per passenger with mixed passenger types", () => {
      const pricePerPassenger = calculatePricePerPassenger(1200, {
        adults: 2,
        children: 1,
        infants: 1,
      });

      expect(pricePerPassenger).toBe(300); // 1200 / 4
    });

    it("should return 0 for zero passengers", () => {
      const pricePerPassenger = calculatePricePerPassenger(1000, {
        adults: 0,
        children: 0,
        infants: 0,
      });

      expect(pricePerPassenger).toBe(0);
    });

    it("should handle decimal results", () => {
      const pricePerPassenger = calculatePricePerPassenger(1000, {
        adults: 3,
        children: 0,
        infants: 0,
      });

      expect(pricePerPassenger).toBeCloseTo(333.33, 2);
    });
  });

  describe("calculateBaseFarePerPassenger", () => {
    it("should calculate base fare per passenger", () => {
      const baseFarePerPassenger = calculateBaseFarePerPassenger(mockFlight, {
        adults: 2,
        children: 0,
        infants: 0,
      });

      expect(baseFarePerPassenger).toBe(500); // (800 + 150 + 50) / 2
    });

    it("should return 0 for null flight", () => {
      const baseFarePerPassenger = calculateBaseFarePerPassenger(null, {
        adults: 2,
        children: 0,
        infants: 0,
      });

      expect(baseFarePerPassenger).toBe(0);
    });

    it("should return 0 for zero passengers", () => {
      const baseFarePerPassenger = calculateBaseFarePerPassenger(mockFlight, {
        adults: 0,
        children: 0,
        infants: 0,
      });

      expect(baseFarePerPassenger).toBe(0);
    });
  });

  describe("formatCurrency", () => {
    it("should format USD currency", () => {
      const formatted = formatCurrency(1234.56, "USD");
      expect(formatted).toBe("$1,234.56");
    });

    it("should format EUR currency", () => {
      const formatted = formatCurrency(1234.56, "EUR");
      expect(formatted).toBe("€1,234.56");
    });

    it("should format AED currency", () => {
      const formatted = formatCurrency(1234.56, "AED");
      expect(formatted).toContain("1,234.56");
    });

    it("should handle zero amount", () => {
      const formatted = formatCurrency(0, "USD");
      expect(formatted).toBe("$0.00");
    });

    it("should handle negative amounts", () => {
      const formatted = formatCurrency(-100, "USD");
      expect(formatted).toBe("-$100.00");
    });

    it("should round to 2 decimal places", () => {
      const formatted = formatCurrency(1234.567, "USD");
      expect(formatted).toBe("$1,234.57");
    });

    it("should use default USD when currency not provided", () => {
      const formatted = formatCurrency(100);
      expect(formatted).toBe("$100.00");
    });
  });

  describe("formatPrice", () => {
    it("should format price (shorthand for formatCurrency)", () => {
      const formatted = formatPrice(1234.56, "USD");
      expect(formatted).toBe("$1,234.56");
    });
  });

  describe("getCurrencySymbol", () => {
    it("should get USD symbol", () => {
      const symbol = getCurrencySymbol("USD");
      expect(symbol).toBe("$");
    });

    it("should get EUR symbol", () => {
      const symbol = getCurrencySymbol("EUR");
      expect(symbol).toBe("€");
    });

    it("should get GBP symbol", () => {
      const symbol = getCurrencySymbol("GBP");
      expect(symbol).toBe("£");
    });
  });

  describe("getPriceBreakdownLineItems", () => {
    it("should return all line items for complete breakdown", () => {
      const breakdown: DetailedPriceBreakdown = {
        baseFare: 800,
        taxes: 150,
        fees: 50,
        seatFees: 50,
        extraBaggage: 125,
        meals: 45,
        insurance: 30,
        loungeAccess: 40,
        total: 1290,
      };

      const items = getPriceBreakdownLineItems(breakdown, "USD");

      expect(items).toHaveLength(9); // 8 components + total
      expect(items[0].label).toBe("Base Fare");
      expect(items[0].amount).toBe(800);
      expect(items[0].formattedAmount).toBe("$800.00");
      expect(items[items.length - 1].label).toBe("Total");
      expect(items[items.length - 1].isTotal).toBe(true);
    });

    it("should exclude zero-value items", () => {
      const breakdown: DetailedPriceBreakdown = {
        baseFare: 800,
        taxes: 150,
        fees: 50,
        seatFees: 0,
        extraBaggage: 0,
        meals: 0,
        insurance: 0,
        loungeAccess: 0,
        total: 1000,
      };

      const items = getPriceBreakdownLineItems(breakdown, "USD");

      expect(items).toHaveLength(4); // baseFare, taxes, fees, total
      expect(
        items.find((item) => item.label === "Seat Selection"),
      ).toBeUndefined();
    });

    it("should format all amounts with currency", () => {
      const breakdown: DetailedPriceBreakdown = {
        baseFare: 800,
        taxes: 150,
        fees: 50,
        seatFees: 0,
        extraBaggage: 0,
        meals: 0,
        insurance: 0,
        loungeAccess: 0,
        total: 1000,
      };

      const items = getPriceBreakdownLineItems(breakdown, "EUR");

      items.forEach((item) => {
        expect(item.formattedAmount).toContain("€");
      });
    });
  });

  describe("validatePriceBreakdown", () => {
    it("should validate correct breakdown", () => {
      const breakdown: DetailedPriceBreakdown = {
        baseFare: 800,
        taxes: 150,
        fees: 50,
        seatFees: 50,
        extraBaggage: 125,
        meals: 45,
        insurance: 30,
        loungeAccess: 40,
        total: 1290,
      };

      expect(validatePriceBreakdown(breakdown)).toBe(true);
    });

    it("should reject incorrect breakdown", () => {
      const breakdown: DetailedPriceBreakdown = {
        baseFare: 800,
        taxes: 150,
        fees: 50,
        seatFees: 50,
        extraBaggage: 125,
        meals: 45,
        insurance: 30,
        loungeAccess: 40,
        total: 1500, // Wrong total
      };

      expect(validatePriceBreakdown(breakdown)).toBe(false);
    });

    it("should allow small floating point differences", () => {
      const breakdown: DetailedPriceBreakdown = {
        baseFare: 800.001,
        taxes: 150,
        fees: 50,
        seatFees: 0,
        extraBaggage: 0,
        meals: 0,
        insurance: 0,
        loungeAccess: 0,
        total: 1000, // Within 0.01 tolerance
      };

      expect(validatePriceBreakdown(breakdown)).toBe(true);
    });
  });

  describe("roundPrice", () => {
    it("should round to 2 decimal places", () => {
      expect(roundPrice(123.456)).toBe(123.46);
      expect(roundPrice(123.454)).toBe(123.45);
    });

    it("should handle whole numbers", () => {
      expect(roundPrice(100)).toBe(100);
    });

    it("should handle negative numbers", () => {
      expect(roundPrice(-123.456)).toBe(-123.46);
    });
  });

  describe("calculatePercentage", () => {
    it("should calculate percentage correctly", () => {
      expect(calculatePercentage(250, 1000)).toBe(25);
      expect(calculatePercentage(500, 1000)).toBe(50);
      expect(calculatePercentage(1000, 1000)).toBe(100);
    });

    it("should return 0 for zero total", () => {
      expect(calculatePercentage(100, 0)).toBe(0);
    });

    it("should handle decimal results", () => {
      expect(calculatePercentage(333, 1000)).toBeCloseTo(33.3, 1);
    });
  });
});
