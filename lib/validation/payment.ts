/**
 * Zod validation schemas for payment information
 * Validates: Requirements 10.2, 10.3, 10.4
 */

import { z } from "zod";

// ============================================================================
// Card Number Validation
// ============================================================================

/**
 * Validates credit/debit card number using Luhn algorithm
 * @param cardNumber - The card number to validate
 * @returns true if valid, false otherwise
 */
function isValidCardNumber(cardNumber: string): boolean {
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, "");

  // Check if it contains only digits
  if (!/^\d+$/.test(cleaned)) {
    return false;
  }

  // Check length (most cards are 13-19 digits)
  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  // Loop through values starting from the rightmost digit
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Schema for card number validation
 * Validates: Requirement 10.3 (Card Number Format Validation)
 * - Must be 13-19 digits
 * - Must pass Luhn algorithm check
 * - Accepts spaces and dashes for formatting
 */
export const cardNumberSchema = z
  .string()
  .min(1, "Card number is required")
  .trim()
  .refine(
    (value) => {
      // Remove spaces and dashes for validation
      const cleaned = value.replace(/[\s-]/g, "");
      return /^\d{13,19}$/.test(cleaned);
    },
    {
      message: "Card number must be between 13 and 19 digits",
    },
  )
  .refine(
    (value) => {
      return isValidCardNumber(value);
    },
    {
      message: "Please enter a valid card number",
    },
  );

// ============================================================================
// Expiry Date Validation
// ============================================================================

/**
 * Schema for card expiry date validation
 * Validates: Requirement 10.4 (Expiry Date Future Validation)
 * - Must be in MM/YY or MM/YYYY format
 * - Must be in the future
 */
export const expiryDateSchema = z
  .string()
  .min(1, "Expiry date is required")
  .trim()
  .regex(
    /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/,
    "Expiry date must be in MM/YY or MM/YYYY format",
  )
  .refine(
    (value) => {
      // Parse the expiry date
      const [month, year] = value.split("/");
      const monthNum = parseInt(month, 10);
      let yearNum = parseInt(year, 10);

      // Convert 2-digit year to 4-digit year
      if (yearNum < 100) {
        yearNum += 2000;
      }

      // Create date for the last day of the expiry month
      const expiryDate = new Date(yearNum, monthNum, 0);
      const today = new Date();

      // Set today to the last day of current month for fair comparison
      today.setDate(1);
      today.setHours(0, 0, 0, 0);

      return expiryDate >= today;
    },
    {
      message: "Card has expired",
    },
  );

// ============================================================================
// CVV Validation
// ============================================================================

/**
 * Schema for CVV/CVC validation
 * Validates: Requirement 10.2 (CVV Required)
 * - Must be 3 or 4 digits
 * - Most cards use 3 digits, American Express uses 4
 */
export const cvvSchema = z
  .string()
  .min(1, "CVV is required")
  .trim()
  .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits");

// ============================================================================
// Cardholder Name Validation
// ============================================================================

/**
 * Schema for cardholder name validation
 * Validates: Requirement 10.2 (Cardholder Name Required)
 * - Must contain at least first and last name
 * - Can contain letters, spaces, hyphens, and apostrophes
 */
export const cardholderNameSchema = z
  .string()
  .min(1, "Cardholder name is required")
  .min(3, "Cardholder name must be at least 3 characters")
  .max(100, "Cardholder name must not exceed 100 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Cardholder name can only contain letters, spaces, hyphens, and apostrophes",
  )
  .trim()
  .refine(
    (value) => {
      // Must contain at least two words (first and last name)
      const words = value.trim().split(/\s+/);
      return words.length >= 2;
    },
    {
      message: "Please enter both first and last name",
    },
  );

// ============================================================================
// Payment Information Schema
// ============================================================================

/**
 * Complete payment information schema
 * Validates: Requirements 10.2, 10.3, 10.4
 * Requires: card number, expiry date, CVV, cardholder name
 */
export const paymentInfoSchema = z.object({
  cardNumber: cardNumberSchema,
  expiryDate: expiryDateSchema,
  cvv: cvvSchema,
  cardholderName: cardholderNameSchema,
});

// ============================================================================
// Billing Address Schema (Optional)
// ============================================================================

/**
 * Schema for billing address
 * Optional but recommended for fraud prevention
 */
export const billingAddressSchema = z.object({
  addressLine1: z
    .string()
    .min(1, "Address line 1 is required")
    .max(100, "Address line 1 must not exceed 100 characters")
    .trim(),
  addressLine2: z
    .string()
    .max(100, "Address line 2 must not exceed 100 characters")
    .trim()
    .optional(),
  city: z
    .string()
    .min(1, "City is required")
    .max(50, "City must not exceed 50 characters")
    .trim(),
  state: z
    .string()
    .max(50, "State must not exceed 50 characters")
    .trim()
    .optional(),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .max(20, "Postal code must not exceed 20 characters")
    .trim(),
  country: z
    .string()
    .min(1, "Country is required")
    .length(2, "Country code must be 2 characters (ISO 3166-1 alpha-2)")
    .regex(/^[A-Z]{2}$/, "Country code must be 2 uppercase letters")
    .trim(),
});

/**
 * Complete payment schema with optional billing address
 */
export const completePaymentSchema = z.object({
  payment: paymentInfoSchema,
  billingAddress: billingAddressSchema.optional(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type CardNumberInput = z.infer<typeof cardNumberSchema>;
export type ExpiryDateInput = z.infer<typeof expiryDateSchema>;
export type CvvInput = z.infer<typeof cvvSchema>;
export type CardholderNameInput = z.infer<typeof cardholderNameSchema>;
export type PaymentInfoInput = z.infer<typeof paymentInfoSchema>;
export type BillingAddressInput = z.infer<typeof billingAddressSchema>;
export type CompletePaymentInput = z.infer<typeof completePaymentSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates card number and returns typed result
 * @param data - Raw card number data
 * @returns Validation result with typed data or errors
 */
export function validateCardNumber(data: unknown) {
  return cardNumberSchema.safeParse(data);
}

/**
 * Validates expiry date and returns typed result
 * @param data - Raw expiry date data
 * @returns Validation result with typed data or errors
 */
export function validateExpiryDate(data: unknown) {
  return expiryDateSchema.safeParse(data);
}

/**
 * Validates CVV and returns typed result
 * @param data - Raw CVV data
 * @returns Validation result with typed data or errors
 */
export function validateCvv(data: unknown) {
  return cvvSchema.safeParse(data);
}

/**
 * Validates cardholder name and returns typed result
 * @param data - Raw cardholder name data
 * @returns Validation result with typed data or errors
 */
export function validateCardholderName(data: unknown) {
  return cardholderNameSchema.safeParse(data);
}

/**
 * Validates complete payment information and returns typed result
 * @param data - Raw payment data
 * @returns Validation result with typed data or errors
 */
export function validatePaymentInfo(data: unknown) {
  return paymentInfoSchema.safeParse(data);
}

/**
 * Validates billing address and returns typed result
 * @param data - Raw billing address data
 * @returns Validation result with typed data or errors
 */
export function validateBillingAddress(data: unknown) {
  return billingAddressSchema.safeParse(data);
}

/**
 * Validates complete payment with optional billing address and returns typed result
 * @param data - Raw complete payment data
 * @returns Validation result with typed data or errors
 */
export function validateCompletePayment(data: unknown) {
  return completePaymentSchema.safeParse(data);
}

// ============================================================================
// Card Type Detection
// ============================================================================

/**
 * Detects the card type based on the card number
 * @param cardNumber - The card number to analyze
 * @returns The detected card type or 'unknown'
 */
export function detectCardType(
  cardNumber: string,
): "visa" | "mastercard" | "amex" | "discover" | "diners" | "jcb" | "unknown" {
  const cleaned = cardNumber.replace(/[\s-]/g, "");

  // Visa: starts with 4
  if (/^4/.test(cleaned)) {
    return "visa";
  }

  // Mastercard: starts with 51-55 or 2221-2720
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
    return "mastercard";
  }

  // American Express: starts with 34 or 37
  if (/^3[47]/.test(cleaned)) {
    return "amex";
  }

  // Discover: starts with 6011, 622126-622925, 644-649, or 65
  if (
    /^6011/.test(cleaned) ||
    /^622[1-9]/.test(cleaned) ||
    /^64[4-9]/.test(cleaned) ||
    /^65/.test(cleaned)
  ) {
    return "discover";
  }

  // Diners Club: starts with 300-305, 36, or 38
  if (/^30[0-5]/.test(cleaned) || /^3[68]/.test(cleaned)) {
    return "diners";
  }

  // JCB: starts with 2131, 1800, or 35
  if (/^2131/.test(cleaned) || /^1800/.test(cleaned) || /^35/.test(cleaned)) {
    return "jcb";
  }

  return "unknown";
}

/**
 * Formats a card number with spaces for display
 * @param cardNumber - The card number to format
 * @returns Formatted card number
 */
export function formatCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/[\s-]/g, "");
  const cardType = detectCardType(cleaned);

  // American Express: 4-6-5 format
  if (cardType === "amex") {
    return cleaned.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3");
  }

  // Most cards: 4-4-4-4 format
  return cleaned.replace(/(\d{4})/g, "$1 ").trim();
}

/**
 * Masks a card number for display (shows only last 4 digits)
 * @param cardNumber - The card number to mask
 * @returns Masked card number (e.g., "**** **** **** 1234")
 */
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/[\s-]/g, "");
  const last4 = cleaned.slice(-4);
  const cardType = detectCardType(cleaned);

  // American Express: show last 5 digits
  if (cardType === "amex") {
    const last5 = cleaned.slice(-5);
    return `**** ****** *${last5}`;
  }

  // Most cards: show last 4 digits
  return `**** **** **** ${last4}`;
}
