"use client";

/**
 * Passenger Information Page
 *
 * Collects passenger details for all travelers
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/shared";
import { useBookingStore } from "@/lib/store/booking-store";
import type { PassengerInfo } from "@/lib/types";

// Lazy load PassengerForm component
const PassengerForm = dynamic(
  () =>
    import("@/components/booking").then((mod) => ({
      default: mod.PassengerForm,
    })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    ),
  },
);

export default function PassengersPage() {
  const router = useRouter();
  const {
    selectedFlight,
    searchCriteria,
    passengers,
    setPassengers,
    goToStep,
  } = useBookingStore();

  // Redirect if no flight selected
  useEffect(() => {
    if (!selectedFlight || !searchCriteria) {
      router.push("/");
    }
  }, [selectedFlight, searchCriteria, router]);

  /**
   * Handle passenger form submission
   */
  const handleSubmit = (passengerData: PassengerInfo[]) => {
    setPassengers(passengerData);
    goToStep("seats");
    router.push("/seats");
  };

  if (!selectedFlight || !searchCriteria) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Determine if flight is international
  const isInternational =
    searchCriteria.segments[0].origin.country !==
    searchCriteria.segments[0].destination.country;

  // Get travel date (first segment departure)
  const travelDate = searchCriteria.segments[0].departureDate;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push("/")}
                className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <span className="text-white font-bold text-xl">E</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Etihad Airways
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PassengerForm
          passengerCount={searchCriteria.passengers}
          isInternational={isInternational}
          travelDate={travelDate}
          initialPassengers={passengers.length > 0 ? passengers : undefined}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
