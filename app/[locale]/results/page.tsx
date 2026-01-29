"use client";

/**
 * Flight Results Page
 *
 * Displays search results with filtering and sorting options
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { LoadingSpinner, ErrorMessage } from "@/components/shared";
import { useBookingStore } from "@/lib/store/booking-store";
import type { Flight } from "@/lib/types";

// Lazy load FlightResults component
const FlightResults = dynamic(
  () =>
    import("@/components/results").then((mod) => ({
      default: mod.FlightResults,
    })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    ),
  },
);

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations();
  const { searchCriteria, setSelectedFlight, goToStep } = useBookingStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if no search criteria
  useEffect(() => {
    if (!searchCriteria) {
      router.push(`/${locale}`);
    }
  }, [searchCriteria, router, locale]);

  // Fetch flights on mount
  useEffect(() => {
    if (!searchCriteria) return;

    const fetchFlights = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/flights/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchCriteria),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch flights");
        }

        const data = await response.json();
        setFlights(data.flights || []);
      } catch (err) {
        console.error("Error fetching flights:", err);
        setError(err instanceof Error ? err.message : "Failed to load flights");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlights();
  }, [searchCriteria]);

  /**
   * Handle flight selection
   */
  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    goToStep("details");
    router.push(`/${locale}/details`);
  };

  /**
   * Handle modify search
   */
  const handleModifySearch = () => {
    goToStep("search");
    router.push(`/${locale}`);
  };

  /**
   * Handle retry
   */
  const handleRetry = () => {
    window.location.reload();
  };

  if (!searchCriteria) {
    return null;
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
            <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
              <a
                href={`/${locale}/manage`}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                {t("manageBooking.title")}
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Summary */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t("results.title")}
          </h2>
          <div className="flex items-center text-gray-600">
            <span className="font-medium">
              {searchCriteria.segments[0].origin.code} →{" "}
              {searchCriteria.segments[0].destination.code}
            </span>
            <span className="mx-2">•</span>
            <span>
              {searchCriteria.passengers.adults}{" "}
              {searchCriteria.passengers.adults === 1
                ? t("search.adult")
                : t("search.adults")}
            </span>
            {searchCriteria.passengers.children > 0 && (
              <>
                <span className="mx-2">•</span>
                <span>
                  {searchCriteria.passengers.children}{" "}
                  {searchCriteria.passengers.children === 1
                    ? t("search.child")
                    : t("search.children")}
                </span>
              </>
            )}
            {searchCriteria.passengers.infants > 0 && (
              <>
                <span className="mx-2">•</span>
                <span>
                  {searchCriteria.passengers.infants}{" "}
                  {searchCriteria.passengers.infants === 1
                    ? t("search.infant")
                    : t("search.infants")}
                </span>
              </>
            )}
            <span className="mx-2">•</span>
            <span className="capitalize">{searchCriteria.cabinClass}</span>
          </div>
        </div>

        {/* Flight Results */}
        <FlightResults
          flights={flights}
          searchCriteria={searchCriteria}
          onSelectFlight={handleSelectFlight}
          onModifySearch={handleModifySearch}
          isLoading={isLoading}
          error={error || undefined}
          onRetry={error ? handleRetry : undefined}
        />
      </div>
    </div>
  );
}
