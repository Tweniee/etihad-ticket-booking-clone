/**
 * Confirmation Page
 *
 * Displays booking confirmation after successful payment
 *
 * Requirements: 11.2
 */

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useBookingStore } from "@/lib/store/booking-store";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingReference = searchParams.get("ref");

  const {
    selectedFlight,
    passengers,
    selectedSeats,
    selectedExtras,
    priceBreakdown,
    totalPrice,
    clearSession,
  } = useBookingStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading confirmation data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
          onRetry={() => router.push("/search")}
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

  if (!selectedFlight) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorMessage
          message="Booking data not found. Your payment was successful, but we couldn't retrieve your booking details."
          onRetry={() => router.push("/search")}
        />
      </div>
    );
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
            {bookingReference}
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
            <span className="font-medium">{selectedFlight.airline.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Flight Number</span>
            <span className="font-medium">{selectedFlight.flightNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Route</span>
            <span className="font-medium">
              {selectedFlight.segments[0].departure.airport.code} →{" "}
              {
                selectedFlight.segments[selectedFlight.segments.length - 1]
                  .arrival.airport.code
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cabin Class</span>
            <span className="font-medium capitalize">
              {selectedFlight.cabinClass}
            </span>
          </div>
        </div>
      </div>

      {/* Passenger Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Passenger Details</h2>
        <div className="space-y-3">
          {passengers.map((passenger, index) => (
            <div key={passenger.id} className="border-b pb-3 last:border-b-0">
              <p className="font-medium">
                {index + 1}. {passenger.firstName} {passenger.lastName}
              </p>
              <p className="text-sm text-gray-600 capitalize">
                {passenger.type}
                {selectedSeats.has(passenger.id) && (
                  <span className="ml-2">
                    • Seat {selectedSeats.get(passenger.id)?.row}
                    {selectedSeats.get(passenger.id)?.column}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Base Fare</span>
            <span>
              {selectedFlight.price.currency}{" "}
              {priceBreakdown.baseFare.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Taxes & Fees</span>
            <span>
              {selectedFlight.price.currency}{" "}
              {(priceBreakdown.taxes + priceBreakdown.fees).toFixed(2)}
            </span>
          </div>
          {priceBreakdown.seatFees > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Seat Fees</span>
              <span>
                {selectedFlight.price.currency}{" "}
                {priceBreakdown.seatFees.toFixed(2)}
              </span>
            </div>
          )}
          {(priceBreakdown.extraBaggage > 0 ||
            priceBreakdown.meals > 0 ||
            priceBreakdown.insurance > 0 ||
            priceBreakdown.loungeAccess > 0) && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Extras</span>
              <span>
                {selectedFlight.price.currency}{" "}
                {(
                  priceBreakdown.extraBaggage +
                  priceBreakdown.meals +
                  priceBreakdown.insurance +
                  priceBreakdown.loungeAccess
                ).toFixed(2)}
              </span>
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold text-lg">
              <span>Total Paid</span>
              <span className="text-green-600">
                {selectedFlight.price.currency} {totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Email Confirmation Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-center">
          📧 A confirmation email has been sent to{" "}
          {passengers[0].contact?.email}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => router.push("/search")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Book Another Flight
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
