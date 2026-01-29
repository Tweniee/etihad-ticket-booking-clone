/**
 * Payment Verification API Route
 *
 * Verifies Razorpay payment signature and confirms payment
 *
 * Requirements: 10.6, 10.7
 */

import { NextRequest, NextResponse } from "next/server";
import {
  verifyPaymentSignature,
  fetchPaymentDetails,
} from "@/lib/utils/razorpay";

/**
 * POST /api/payment/verify
 *
 * Verifies a Razorpay payment
 *
 * Request body:
 * - orderId: string (Razorpay order ID)
 * - paymentId: string (Razorpay payment ID)
 * - signature: string (Payment signature from Razorpay)
 *
 * Response:
 * - success: boolean
 * - paymentId: string
 * - orderId: string
 * - paymentDetails: object (payment information)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentId, signature } = body;

    // Validate required fields
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "Order ID, payment ID, and signature are required" },
        { status: 400 },
      );
    }

    // Verify payment signature
    const isValid = verifyPaymentSignature(orderId, paymentId, signature);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment signature",
          message: "Payment verification failed",
        },
        { status: 400 },
      );
    }

    // Fetch payment details from Razorpay
    const paymentDetails = await fetchPaymentDetails(paymentId);

    // Return success response
    return NextResponse.json({
      success: true,
      paymentId,
      orderId,
      paymentDetails: {
        id: paymentDetails.id,
        amount: paymentDetails.amount,
        currency: paymentDetails.currency,
        status: paymentDetails.status,
        method: paymentDetails.method,
        email: paymentDetails.email,
        contact: paymentDetails.contact,
        createdAt: paymentDetails.created_at,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify payment",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
