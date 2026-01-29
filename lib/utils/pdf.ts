/**
 * PDF Generation Utility
 *
 * Generates PDF booking confirmations
 *
 * Requirements: 11.5
 */

import { jsPDF } from "jspdf";
import type { Flight, Seat } from "@/lib/types";

interface BookingPDFData {
  reference: string;
  status: string;
  flightData: Flight;
  passengers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    type: string;
    email?: string;
  }>;
  seats: Record<string, Seat>;
  extras: any;
  totalAmount: string;
  currency: string;
  createdAt: string;
}

/**
 * Generate a PDF booking confirmation
 * Requirements: 11.5
 *
 * @param bookingData - Complete booking data
 * @returns jsPDF instance
 */
export function generateBookingPDF(bookingData: BookingPDFData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Helper function to add text
  const addText = (text: string, x: number, y: number, options?: any) => {
    doc.text(text, x, y, options);
  };

  // Helper function to add line
  const addLine = (y: number) => {
    doc.line(20, y, pageWidth - 20, y);
  };

  // Title
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  addText("Booking Confirmation", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 15;

  // Booking Reference
  doc.setFontSize(16);
  addText(`Reference: ${bookingData.reference}`, pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  addText(`Status: ${bookingData.status}`, pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 15;

  addLine(yPosition);
  yPosition += 10;

  // Flight Details Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  addText("Flight Details", 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const flight = bookingData.flightData;
  addText(`Airline: ${flight.airline.name}`, 20, yPosition);
  yPosition += 6;
  addText(`Flight Number: ${flight.flightNumber}`, 20, yPosition);
  yPosition += 6;
  addText(
    `Route: ${flight.segments[0].departure.airport.code} → ${
      flight.segments[flight.segments.length - 1].arrival.airport.code
    }`,
    20,
    yPosition,
  );
  yPosition += 6;
  addText(
    `Departure: ${new Date(flight.segments[0].departure.dateTime).toLocaleString()}`,
    20,
    yPosition,
  );
  yPosition += 6;
  addText(
    `Arrival: ${new Date(
      flight.segments[flight.segments.length - 1].arrival.dateTime,
    ).toLocaleString()}`,
    20,
    yPosition,
  );
  yPosition += 6;
  addText(`Cabin Class: ${flight.cabinClass}`, 20, yPosition);
  yPosition += 12;

  addLine(yPosition);
  yPosition += 10;

  // Passenger Details Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  addText("Passenger Details", 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  bookingData.passengers.forEach((passenger, index) => {
    const seatInfo = bookingData.seats[passenger.id];
    const seatText = seatInfo
      ? ` - Seat ${seatInfo.row}${seatInfo.column}`
      : "";
    addText(
      `${index + 1}. ${passenger.firstName} ${passenger.lastName} (${passenger.type})${seatText}`,
      20,
      yPosition,
    );
    yPosition += 6;
  });

  yPosition += 6;
  addLine(yPosition);
  yPosition += 10;

  // Payment Summary Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  addText("Payment Summary", 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  // Calculate breakdown
  const baseFare =
    flight.price.breakdown.baseFare * bookingData.passengers.length;
  const taxes = flight.price.breakdown.taxes * bookingData.passengers.length;
  const fees = flight.price.breakdown.fees * bookingData.passengers.length;

  let seatFees = 0;
  Object.values(bookingData.seats).forEach((seat) => {
    seatFees += seat.price || 0;
  });

  let extraBaggage = 0;
  let meals = 0;
  let insurance = 0;
  let loungeAccess = 0;

  if (bookingData.extras.baggage) {
    Object.values(bookingData.extras.baggage).forEach((bag: any) => {
      extraBaggage += bag.price || 0;
    });
  }

  if (bookingData.extras.meals) {
    Object.values(bookingData.extras.meals).forEach((meal: any) => {
      meals += meal.price || 0;
    });
  }

  if (bookingData.extras.insurance) {
    insurance = bookingData.extras.insurance.price || 0;
  }

  if (bookingData.extras.loungeAccess) {
    loungeAccess = bookingData.extras.loungeAccess.price || 0;
  }

  addText(`Base Fare:`, 20, yPosition);
  addText(
    `${bookingData.currency} ${baseFare.toFixed(2)}`,
    pageWidth - 20,
    yPosition,
    { align: "right" },
  );
  yPosition += 6;

  addText(`Taxes & Fees:`, 20, yPosition);
  addText(
    `${bookingData.currency} ${(taxes + fees).toFixed(2)}`,
    pageWidth - 20,
    yPosition,
    { align: "right" },
  );
  yPosition += 6;

  if (seatFees > 0) {
    addText(`Seat Fees:`, 20, yPosition);
    addText(
      `${bookingData.currency} ${seatFees.toFixed(2)}`,
      pageWidth - 20,
      yPosition,
      { align: "right" },
    );
    yPosition += 6;
  }

  const totalExtras = extraBaggage + meals + insurance + loungeAccess;
  if (totalExtras > 0) {
    addText(`Extras:`, 20, yPosition);
    addText(
      `${bookingData.currency} ${totalExtras.toFixed(2)}`,
      pageWidth - 20,
      yPosition,
      { align: "right" },
    );
    yPosition += 6;
  }

  yPosition += 2;
  addLine(yPosition);
  yPosition += 6;

  doc.setFont("helvetica", "bold");
  addText(`Total Paid:`, 20, yPosition);
  addText(
    `${bookingData.currency} ${parseFloat(bookingData.totalAmount).toFixed(2)}`,
    pageWidth - 20,
    yPosition,
    { align: "right" },
  );
  yPosition += 12;

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  addText(
    `Booking Date: ${new Date(bookingData.createdAt).toLocaleString()}`,
    pageWidth / 2,
    yPosition,
    { align: "center" },
  );
  yPosition += 5;
  addText(
    "Please keep this confirmation for your records",
    pageWidth / 2,
    yPosition,
    { align: "center" },
  );

  return doc;
}

/**
 * Download booking confirmation as PDF
 * Requirements: 11.5
 *
 * @param bookingData - Complete booking data
 * @param filename - Optional filename (defaults to booking-{reference}.pdf)
 */
export function downloadBookingPDF(
  bookingData: BookingPDFData,
  filename?: string,
): void {
  const doc = generateBookingPDF(bookingData);
  const pdfFilename = filename || `booking-${bookingData.reference}.pdf`;
  doc.save(pdfFilename);
}
