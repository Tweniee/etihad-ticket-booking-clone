/**
 * Booking Retrieval API Route
 *
 * Retrieves booking details by reference
 *
 * Requirements: 12.1, 12.2
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBookingReference } from "@/lib/utils/booking";

/**
 * GET /api/bookings/[reference]
 *
 * Retrieves a booking by reference
 *
 * Query parameters:
 * - lastName: string (optional, for authentication)
 *
 * Response:
 * - booking: Booking object with all details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { reference: string } },
) {
  try {
    const { reference } = params;
    const searchParams = request.nextUrl.searchParams;
    const lastName = searchParams.get("lastName");

    // Validate reference format
    if (!isValidBookingReference(reference)) {
      return NextResponse.json(
        { error: "Invalid booking reference format" },
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

    // If lastName is provided, verify it matches one of the passengers
    if (lastName) {
      const hasMatchingPassenger = booking.passengers.some(
        (p) => p.lastName.toLowerCase() === lastName.toLowerCase(),
      );

      if (!hasMatchingPassenger) {
        return NextResponse.json(
          { error: "Booking not found or invalid credentials" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        reference: booking.reference,
        status: booking.status,
        flightData: booking.flightData,
        passengers: booking.passengers,
        seats: booking.seats,
        extras: booking.extras,
        totalAmount: booking.totalAmount.toString(),
        currency: booking.currency,
        paymentId: booking.paymentId,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error retrieving booking:", error);

    return NextResponse.json(
      {
        error: "Failed to retrieve booking",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
