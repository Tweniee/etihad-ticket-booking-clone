/**
 * Booking PDF Generation API Route
 *
 * Generates and returns a PDF booking confirmation
 *
 * Requirements: 11.5
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBookingReference } from "@/lib/utils/booking";
import { generateBookingPDF } from "@/lib/utils/pdf";

/**
 * GET /api/bookings/[reference]/pdf
 *
 * Generates a PDF for the booking
 *
 * Query parameters:
 * - lastName: string (optional, for authentication)
 *
 * Response:
 * - PDF file download
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

    // Generate PDF
    const bookingData = {
      reference: booking.reference,
      status: booking.status,
      flightData: booking.flightData as any,
      passengers: booking.passengers.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        type: p.type,
        email: p.email || undefined,
      })),
      seats: booking.seats as any,
      extras: booking.extras as any,
      totalAmount: booking.totalAmount.toString(),
      currency: booking.currency,
      createdAt: booking.createdAt.toISOString(),
    };

    const pdf = generateBookingPDF(bookingData);
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="booking-${reference}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);

    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
