/**
 * Confirmation Page
 *
 * Displays booking confirmation after successful payment
 * Fetches booking data from API and displays complete details
 *
 * Requirements: 11.2
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useBookingStore } from "@/lib/store/booking-store";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { downloadBookingPDF } from "@/lib/utils/pdf";
import type { Flight, PassengerInfo, Seat } from "@/lib/types";

interface BookingData {
  id: string;
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
  paymentId: string;
  paymentStatus: string;
  createdAt: string;
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingReference = searchParams.get("ref");

  const { clearSession } = useBookingStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingReference) {
        setError("No booking reference found");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/bookings/${bookingReference}`);

        if (!response.ok) {
          throw new Error("Failed to fetch booking");
        }

        const data = await response.json();

        if (data.success && data.booking) {
          setBookingData(data.booking);
        } else {
          throw new Error("Invalid booking data");
        }
      } catch (err) {
        console.error("Error fetching booking:", err);
        setError("Failed to load booking details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBooking();
  }, [bookingReference]);

  useEffect(() => {
    // Clear session after successful booking
    if (bookingReference) {
      clearSession();
    }
  }, [bookingReference, clearSession]);

  if (!bookingReference) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorMessage
          message="No booking reference found. Please complete the booking process."
          onRetry={() => router.push("/")}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorMessage
          message={error || "Failed to load booking details"}
          onRetry={() => router.push("/")}
        />
      </div>
    );
  }

  const flight = bookingData.flightData;
  const passengers = bookingData.passengers;
  const seats = bookingData.seats;
  const primaryPassenger = passengers.find((p) => p.email);

  // Calculate price breakdown from flight data
  const baseFare = flight.price.breakdown.baseFare * passengers.length;
  const taxes = flight.price.breakdown.taxes * passengers.length;
  const fees = flight.price.breakdown.fees * passengers.length;

  // Calculate seat fees
  let seatFees = 0;
  Object.values(seats).forEach((seat) => {
    seatFees += seat.price || 0;
  });

  // Calculate extras
  const extras = bookingData.extras;
  let extraBaggage = 0;
  let meals = 0;
  let insurance = 0;
  let loungeAccess = 0;

  if (extras.baggage) {
    Object.values(extras.baggage).forEach((bag: any) => {
      extraBaggage += bag.price || 0;
    });
  }

  if (extras.meals) {
    Object.values(extras.meals).forEach((meal: any) => {
      meals += meal.price || 0;
    });
  }

  if (extras.insurance) {
    insurance = extras.insurance.price || 0;
  }

  if (extras.loungeAccess) {
    loungeAccess = extras.loungeAccess.price || 0;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Success Header */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h1 className="text-3xl font-bold text-green-800 mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-green-700">
          Your booking has been successfully confirmed
        </p>
      </div>

      {/* Booking Reference */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Booking Reference</h2>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-1">Your booking reference</p>
          <p className="text-3xl font-bold text-blue-600 tracking-wider">
            {bookingData.reference}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Please save this reference for future use
          </p>
        </div>
      </div>

      {/* Flight Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Flight Details</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Airline</span>
            <span className="font-medium">{flight.airline.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Flight Number</span>
            <span className="font-medium">{flight.flightNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Route</span>
            <span className="font-medium">
              {flight.segments[0].departure.airport.code} →{" "}
              {flight.segments[flight.segments.length - 1].arrival.airport.code}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Departure</span>
            <span className="font-medium">
              {new Date(flight.segments[0].departure.dateTime).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Arrival</span>
            <span className="font-medium">
              {new Date(
                flight.segments[flight.segments.length - 1].arrival.dateTime,
              ).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cabin Class</span>
            <span className="font-medium capitalize">{flight.cabinClass}</span>
          </div>
        </div>
      </div>

      {/* Passenger Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Passenger Details</h2>
        <div className="space-y-3">
          {passengers.map((passenger, index) => {
            const seatInfo = seats[passenger.id];
            return (
              <div key={passenger.id} className="border-b pb-3 last:border-b-0">
                <p className="font-medium">
                  {index + 1}. {passenger.firstName} {passenger.lastName}
                </p>
                <p className="text-sm text-gray-600 capitalize">
                  {passenger.type.toLowerCase()}
                  {seatInfo && (
                    <span className="ml-2">
                      • Seat {seatInfo.row}
                      {seatInfo.column}
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Base Fare</span>
            <span>
              {bookingData.currency} {baseFare.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Taxes & Fees</span>
            <span>
              {bookingData.currency} {(taxes + fees).toFixed(2)}
            </span>
          </div>
          {seatFees > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Seat Fees</span>
              <span>
                {bookingData.currency} {seatFees.toFixed(2)}
              </span>
            </div>
          )}
          {(extraBaggage > 0 ||
            meals > 0 ||
            insurance > 0 ||
            loungeAccess > 0) && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Extras</span>
              <span>
                {bookingData.currency}{" "}
                {(extraBaggage + meals + insurance + loungeAccess).toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total Paid</span>
              <span className="text-green-600">
                {bookingData.currency}{" "}
                {parseFloat(bookingData.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Email Confirmation Notice */}
      {primaryPassenger?.email && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-center">
            📧 A confirmation email has been sent to {primaryPassenger.email}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Book Another Flight
        </button>
        <button
          onClick={() => downloadBookingPDF(bookingData)}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Download PDF
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Print Confirmation
        </button>
      </div>
    </div>
  );
}
