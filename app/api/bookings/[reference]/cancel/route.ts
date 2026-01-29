/**
 * Booking Cancellation API Route
 *
 * Handles booking cancellation with fee calculation and refund processing
 *
 * Requirements: 12.6, 12.7
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBookingReference } from "@/lib/utils/booking";
import { sendBookingCancellationEmail } from "@/lib/email";
import { format } from "date-fns";

/**
 * POST /api/bookings/[reference]/cancel
 *
 * Cancels a booking and sends cancellation confirmation email
 *
 * Request body:
 * - lastName: string (for authentication)
 *
 * Response:
 * - success: boolean
 * - cancellationFee: number
 * - refundAmount: number
 * - message: string
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { reference: string } },
) {
  try {
    const { reference } = params;
    const body = await request.json();
    const { lastName } = body;

    // Validate reference format
    if (!isValidBookingReference(reference)) {
      return NextResponse.json(
        { error: "Invalid booking reference format" },
        { status: 400 },
      );
    }

    // Validate lastName
    if (!lastName) {
      return NextResponse.json(
        { error: "Last name is required for authentication" },
        { status: 400 },
      );
    }

    // Retrieve booking with passengers
    const booking = await prisma.booking.findUnique({
      where: { reference },
      include: {
        passengers: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify lastName matches one of the passengers
    const matchingPassenger = booking.passengers.find(
      (p) => p.lastName.toLowerCase() === lastName.toLowerCase(),
    );

    if (!matchingPassenger) {
      return NextResponse.json(
        { error: "Booking not found or invalid credentials" },
        { status: 404 },
      );
    }

    // Check if booking is already cancelled
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 },
      );
    }

    // Calculate cancellation fee based on fare rules
    // For now, using a simple calculation: 20% cancellation fee
    const flightData = booking.flightData as any;
    const fareRules = flightData.fareRules || {};
    const cancellationFee =
      fareRules.cancellationFee || Number(booking.totalAmount) * 0.2;
    const refundAmount = Number(booking.totalAmount) - cancellationFee;

    // Update booking status to CANCELLED
    const updatedBooking = await prisma.booking.update({
      where: { reference },
      data: {
        status: "CANCELLED",
        paymentStatus: "REFUNDED",
      },
      include: {
        passengers: true,
      },
    });

    // Send cancellation email to primary passenger
    try {
      const primaryPassenger = updatedBooking.passengers.find(
        (p) => p.email !== null && p.email !== undefined,
      );

      if (primaryPassenger && primaryPassenger.email) {
        // Format flight details
        const segments = flightData.segments || [];
        const firstSegment = segments[0] || {};
        const lastSegment = segments[segments.length - 1] || {};

        const departureDate = firstSegment.departure?.dateTime
          ? format(
              new Date(firstSegment.departure.dateTime),
              "EEEE, MMMM d, yyyy 'at' h:mm a",
            )
          : "N/A";

        const route = `${firstSegment.departure?.airport?.city || "N/A"} (${firstSegment.departure?.airport?.code || "N/A"}) → ${lastSegment.arrival?.airport?.city || "N/A"} (${lastSegment.arrival?.airport?.code || "N/A"})`;

        const flightDetails = `${flightData.airline?.name || "N/A"} ${flightData.flightNumber || "N/A"} - ${route} on ${departureDate}`;

        await sendBookingCancellationEmail(primaryPassenger.email, {
          bookingReference: reference,
          passengerName: `${primaryPassenger.firstName} ${primaryPassenger.lastName}`,
          flightDetails,
          cancellationFee,
          refundAmount,
          currency: booking.currency,
        });
      }
    } catch (emailError) {
      // Log email error but don't fail the cancellation
      console.error("Failed to send cancellation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
      cancellationFee,
      refundAmount,
      currency: booking.currency,
      booking: {
        reference: updatedBooking.reference,
        status: updatedBooking.status,
        paymentStatus: updatedBooking.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);

    return NextResponse.json(
      {
        error: "Failed to cancel booking",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
