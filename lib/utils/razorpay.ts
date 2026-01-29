/**
 * Razorpay Utility - Server-side Razorpay integration
 *
 * This utility provides functions for creating payment orders and verifying payments
 * using Razorpay's payment gateway.
 *
 * Requirements: 10.1, 10.5
 */

import Razorpay from "razorpay";

/**
 * Initialize Razorpay instance
 * This should only be used on the server side
 */
export function getRazorpayInstance(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_SECRET;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.",
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Create a Razorpay payment order
 *
 * @param amount - Amount in smallest currency unit (paise for INR)
 * @param currency - Currency code (e.g., "INR", "USD")
 * @param receipt - Unique receipt ID for the order
 * @param notes - Additional notes/metadata for the order
 * @returns Razorpay order object
 */
export async function createPaymentOrder(
  amount: number,
  currency: string,
  receipt: string,
  notes?: Record<string, string>,
) {
  const razorpay = getRazorpayInstance();

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount), // Amount in smallest currency unit
      currency: currency.toUpperCase(),
      receipt,
      notes,
    });

    return order;
  } catch (error) {
    console.error("Failed to create Razorpay order:", error);
    throw new Error("Failed to create payment order");
  }
}

/**
 * Verify Razorpay payment signature
 *
 * @param orderId - Razorpay order ID
 * @param paymentId - Razorpay payment ID
 * @param signature - Payment signature from Razorpay
 * @returns True if signature is valid
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const razorpay = getRazorpayInstance();

  try {
    const crypto = require("crypto");
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      throw new Error("Razorpay key secret not configured");
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return generatedSignature === signature;
  } catch (error) {
    console.error("Failed to verify payment signature:", error);
    return false;
  }
}

/**
 * Fetch payment details from Razorpay
 *
 * @param paymentId - Razorpay payment ID
 * @returns Payment details
 */
export async function fetchPaymentDetails(paymentId: string) {
  const razorpay = getRazorpayInstance();

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error("Failed to fetch payment details:", error);
    throw new Error("Failed to fetch payment details");
  }
}
