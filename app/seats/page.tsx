/**
 * Seat Selection Page
 *
 * Page for selecting seats during the booking flow
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { LoadingSpinner, ErrorMessage } from "@/components/shared";
import { useBookingStore } from "@/lib/store/booking-store";
import type { SeatMap as SeatMapType } from "@/lib/types";

// Lazy load SeatMap component
const SeatMap = dynamic(
  () =>
    import("@/components/booking").then((mod) => ({ default: mod.SeatMap })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    ),
  },
);

export default function SeatsPage() {
  const router = useRouter();
  const { selectedFlight, passengers, goToStep } = useBookingStore();
  const [seatMap, setSeatMap] = useState<SeatMapType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if no flight selected
    if (!selectedFlight) {
      router.push("/");
      return;
    }

    // Redirect if no passengers
    if (passengers.length === 0) {
      router.push("/passengers");
      return;
    }

    // Fetch seat map
    const fetchSeatMap = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/seats/${selectedFlight.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch seat map");
        }

        const data = await response.json();
        setSeatMap(data.seatMap);
      } catch (err) {
        console.error("Error fetching seat map:", err);
        setError("Failed to load seat map. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSeatMap();
  }, [selectedFlight, passengers, router]);

  const handleContinue = () => {
    goToStep("extras");
    router.push("/extras");
  };

  const handleBack = () => {
    goToStep("passengers");
    router.push("/passengers");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <ErrorMessage message={error} />
          <button
            onClick={() => router.push("/")}
            className="mt-4 w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Search
          </button>
        </div>
      </div>
    );
  }

  if (!seatMap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message="Seat map not available" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SeatMap
        seatMap={seatMap}
        passengers={passengers}
        onContinue={handleContinue}
        onBack={handleBack}
      />
    </div>
  );
}
