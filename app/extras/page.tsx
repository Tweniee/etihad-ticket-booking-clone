"use client";

/**
 * Extras Selection Page
 *
 * Allows users to add optional services to their booking
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/shared";
import { useBookingStore } from "@/lib/store/booking-store";

// Lazy load Extras component
const Extras = dynamic(
  () => import("@/components/booking").then((mod) => ({ default: mod.Extras })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    ),
  },
);

export default function ExtrasPage() {
  const router = useRouter();
  const { selectedFlight, passengers, selectedExtras, setExtras, goToStep } =
    useBookingStore();

  // Redirect if no flight or passengers
  useEffect(() => {
    if (!selectedFlight) {
      router.push("/");
      return;
    }
    if (passengers.length === 0) {
      router.push("/passengers");
    }
  }, [selectedFlight, passengers, router]);

  /**
   * Handle continue to payment
   */
  const handleContinue = () => {
    goToStep("payment");
    router.push("/payment");
  };

  /**
   * Handle back to seats
   */
  const handleBack = () => {
    goToStep("seats");
    router.push("/seats");
  };

  if (!selectedFlight || passengers.length === 0) {
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
        <Extras
          flight={selectedFlight}
          passengers={passengers}
          selectedExtras={selectedExtras}
          onExtrasChange={setExtras}
          onContinue={handleContinue}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
