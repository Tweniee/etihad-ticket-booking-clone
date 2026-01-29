/**
 * Unit Tests for Booking Utilities
 *
 * Tests booking reference generation and validation
 *
 * Requirements: 11.1
 */

import { describe, it, expect } from "vitest";
import {
  generateBookingReference,
  isValidBookingReference,
} from "@/lib/utils/booking";

describe("Booking Utilities", () => {
  describe("generateBookingReference", () => {
    it("generates a 6-character alphanumeric reference", () => {
      const reference = generateBookingReference();
      expect(reference).toMatch(/^[A-Z0-9]{6}$/);
      expect(reference.length).toBe(6);
    });

    it("generates unique references", () => {
      const references = new Set<string>();
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        references.add(generateBookingReference());
      }

      // Should have high uniqueness (allow for small collision probability)
      expect(references.size).toBeGreaterThan(iterations * 0.99);
    });

    it("only uses uppercase letters and numbers", () => {
      const reference = generateBookingReference();
      const validChars = /^[A-Z0-9]+$/;
      expect(reference).toMatch(validChars);
    });

    it("generates different references on multiple calls", () => {
      const ref1 = generateBookingReference();
      const ref2 = generateBookingReference();
      const ref3 = generateBookingReference();

      // While technically they could be the same, probability is very low
      const allSame = ref1 === ref2 && ref2 === ref3;
      expect(allSame).toBe(false);
    });
  });

  describe("isValidBookingReference", () => {
    it("validates correct 6-character alphanumeric references", () => {
      expect(isValidBookingReference("ABC123")).toBe(true);
      expect(isValidBookingReference("XYZ789")).toBe(true);
      expect(isValidBookingReference("A1B2C3")).toBe(true);
      expect(isValidBookingReference("123456")).toBe(true);
      expect(isValidBookingReference("ABCDEF")).toBe(true);
    });

    it("rejects references with incorrect length", () => {
      expect(isValidBookingReference("ABC12")).toBe(false); // Too short
      expect(isValidBookingReference("ABC1234")).toBe(false); // Too long
      expect(isValidBookingReference("")).toBe(false); // Empty
      expect(isValidBookingReference("A")).toBe(false); // Single char
    });

    it("rejects references with lowercase letters", () => {
      expect(isValidBookingReference("abc123")).toBe(false);
      expect(isValidBookingReference("Abc123")).toBe(false);
      expect(isValidBookingReference("ABc123")).toBe(false);
    });

    it("rejects references with special characters", () => {
      expect(isValidBookingReference("ABC-123")).toBe(false);
      expect(isValidBookingReference("ABC_123")).toBe(false);
      expect(isValidBookingReference("ABC 123")).toBe(false);
      expect(isValidBookingReference("ABC@123")).toBe(false);
    });

    it("rejects references with spaces", () => {
      expect(isValidBookingReference("ABC 123")).toBe(false);
      expect(isValidBookingReference(" ABC123")).toBe(false);
      expect(isValidBookingReference("ABC123 ")).toBe(false);
    });
  });
});
