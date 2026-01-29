/**
 * Payment Order Creation API Route
 *
 * Creates a Razorpay payment order for booking payment
 *
 * Requirements: 10.1, 10.5
 */

import { NextRequest, NextResponse } from "next/server";
import { createPaymentOrder } from "@/lib/utils/razorpay";

/**
 * POST /api/payment/create-order
 *
 * Creates a Razorpay payment order
 *
 * Request body:
 * - amount: number (in currency's smallest unit, e.g., paise for INR)
 * - currency: string (e.g., "INR", "USD")
 * - bookingReference?: string (optional, for tracking)
 * - metadata?: Record<string, string> (optional additional data)
 *
 * Response:
 * - orderId: string (Razorpay order ID)
 * - amount: number
 * - currency: string
 * - keyId: string (Razorpay public key for frontend)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, bookingReference, metadata } = body;

    // Validate required fields
    if (!amount || !currency) {
      return NextResponse.json(
        { error: "Amount and currency are required" },
        { status: 400 },
      );
    }

    // Validate amount is positive
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 },
      );
    }

    // Generate receipt ID
    const receipt = bookingReference || `receipt_${Date.now()}`;

    // Prepare notes/metadata
    const notes = {
      ...metadata,
      bookingReference: bookingReference || "",
      createdAt: new Date().toISOString(),
    };

    // Create Razorpay order
    const order = await createPaymentOrder(amount, currency, receipt, notes);

    // Return order details with public key
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating payment order:", error);

    return NextResponse.json(
      {
        error: "Failed to create payment order",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
