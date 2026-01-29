"use client";

/**
 * Flight Details Page
 *
 * Displays detailed information about the selected flight
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/shared";
import { useBookingStore } from "@/lib/store/booking-store";

// Lazy load FlightDetails component
const FlightDetails = dynamic(
  () =>
    import("@/components/booking").then((mod) => ({
      default: mod.FlightDetails,
    })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    ),
  },
);

export default function DetailsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations();
  const { selectedFlight, goToStep } = useBookingStore();

  // Redirect if no flight selected
  useEffect(() => {
    if (!selectedFlight) {
      router.push(`/${locale}`);
    }
  }, [selectedFlight, router, locale]);

  /**
   * Handle continue to passenger information
   */
  const handleContinue = () => {
    goToStep("passengers");
    router.push(`/${locale}/passengers`);
  };

  /**
   * Handle back to results
   */
  const handleBack = () => {
    goToStep("results");
    router.push(`/${locale}/results`);
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
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => router.push(`/${locale}`)}
                className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <span className="text-white font-bold text-xl">E</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("header.title")}
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
