"use client";

/**
 * Flight Details Page
 *
 * Displays detailed information about the selected flight
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FlightDetails } from "@/components/booking";
import { LoadingSpinner } from "@/components/shared";
import { useBookingStore } from "@/lib/store/booking-store";

export default function DetailsPage() {
  const router = useRouter();
  const { selectedFlight, goToStep } = useBookingStore();

  // Redirect if no flight selected
  useEffect(() => {
    if (!selectedFlight) {
      router.push("/");
    }
  }, [selectedFlight, router]);

  /**
   * Handle continue to seat selection
   */
  const handleContinue = () => {
    goToStep("seats");
    router.push("/seats");
  };

  /**
   * Handle back to results
   */
  const handleBack = () => {
    goToStep("results");
    router.push("/results");
  };

  if (!selectedFlight) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

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
        <FlightDetails
          flight={selectedFlight}
          onContinue={handleContinue}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
