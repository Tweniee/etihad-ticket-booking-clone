/**
 * Booking Retrieval API Route
 *
 * Retrieves booking details by reference with modification options
 *
 * Requirements: 12.1, 12.2, 12.3, 12.5
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBookingReference } from "@/lib/utils/booking";
import { ModificationOption } from "@/lib/types";

/**
 * GET /api/bookings/[reference]
 *
 * Retrieves a booking by reference with modification options
 *
 * Query parameters:
 * - lastName: string (required for authentication)
 *
 * Response:
 * - booking: Booking object with all details
 * - modificationOptions: Available modification options based on fare rules
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

    // If lastName is provided, verify it matches one of the passengers (for manage booking)
    // If not provided, allow access (for confirmation page after payment)
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

    // Calculate modification options based on fare rules and booking status
    const modificationOptions = calculateModificationOptions(booking);

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
      modificationOptions,
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

/**
 * Calculate available modification options based on fare rules and booking status
 * Requirements: 12.5
 */
function calculateModificationOptions(booking: any): ModificationOption[] {
  const options: ModificationOption[] = [];

  // Cannot modify cancelled bookings
  if (booking.status === "CANCELLED") {
    return [
      { type: "change-flight", available: false, fee: 0 },
      { type: "change-seats", available: false, fee: 0 },
      { type: "add-extras", available: false, fee: 0 },
    ];
  }

  // Extract fare rules from flight data
  const flightData = booking.flightData as any;
  const fareRules = flightData.fareRules || {};

  // Change flight option
  const changeFee = fareRules.changeFee;
  options.push({
    type: "change-flight",
    available: changeFee !== null && changeFee !== undefined,
    fee: changeFee || 0,
  });

  // Change seats option (usually allowed with minimal or no fee)
  options.push({
    type: "change-seats",
    available: true,
    fee: 25, // Standard seat change fee
  });

  // Add extras option (usually always allowed)
  options.push({
    type: "add-extras",
    available: true,
    fee: 0, // No fee for adding extras
  });

  return options;
}
