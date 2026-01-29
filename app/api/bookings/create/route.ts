/**
 * Booking Creation API Route
 *
 * Creates a booking in the database after successful payment
 * Generates unique booking reference
 *
 * Requirements: 10.6, 11.1
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUniqueBookingReference } from "@/lib/utils/booking";
import type { PassengerInfo } from "@/lib/types";

/**
 * POST /api/bookings/create
 *
 * Creates a new booking after successful payment
 *
 * Request body:
 * - flight: Flight object
 * - passengers: PassengerInfo[]
 * - seats: Map<string, Seat> (as object)
 * - extras: SelectedExtras
 * - totalAmount: number
 * - currency: string
 * - paymentId: string
 *
 * Response:
 * - booking: Booking object with reference
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      flight,
      passengers,
      seats,
      extras,
      totalAmount,
      currency,
      paymentId,
    } = body;

    // Validate required fields
    if (!flight || !passengers || !totalAmount || !currency || !paymentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate passengers array
    if (!Array.isArray(passengers) || passengers.length === 0) {
      return NextResponse.json(
        { error: "At least one passenger is required" },
        { status: 400 },
      );
    }

    // Generate unique booking reference
    const reference = await generateUniqueBookingReference();

    // Create booking with passengers in a transaction
    const booking = await prisma.booking.create({
      data: {
        reference,
        status: "CONFIRMED",
        flightId: flight.id,
        flightData: flight,
        seats: seats || {},
        extras: extras || {
          baggage: {},
          meals: {},
          insurance: null,
          loungeAccess: null,
        },
        totalAmount,
        currency,
        paymentId,
        paymentStatus: "COMPLETED",
        passengers: {
          create: passengers.map((passenger: PassengerInfo) => ({
            type: passenger.type.toUpperCase() as "ADULT" | "CHILD" | "INFANT",
            firstName: passenger.firstName,
            lastName: passenger.lastName,
            dateOfBirth: new Date(passenger.dateOfBirth),
            gender: passenger.gender.toUpperCase() as
              | "MALE"
              | "FEMALE"
              | "OTHER",
            passportNumber: passenger.passport?.number,
            passportExpiry: passenger.passport?.expiryDate
              ? new Date(passenger.passport.expiryDate)
              : null,
            nationality: passenger.passport?.nationality,
            email: passenger.contact?.email,
            phone: passenger.contact?.phone,
            countryCode: passenger.contact?.countryCode,
          })),
        },
      },
      include: {
        passengers: true,
      },
    });

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
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);

    return NextResponse.json(
      {
        error: "Failed to create booking",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
