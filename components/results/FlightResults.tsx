"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { FlightCard } from "./FlightCard";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import type { Flight, SearchCriteria } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

/**
 * FlightResults Component
 *
 * Displays flight search results with pagination.
 * Shows flight cards, handles empty states, and provides pagination controls.
 *
 * Features:
 * - Display flight cards with pagination (20 per page)
 * - Handle empty results state
 * - Loading state support
 * - Error state support
 * - Pagination controls with page numbers
 * - Accessible with keyboard navigation
 * - Responsive design
 *
 * Validates Requirements:
 * - 3.3: Sort results by price in ascending order by default
 * - 3.4: Display all results with pagination showing 20 flights per page
 * - 3.5: Display a message indicating no results found when no flights match
 */

export interface FlightResultsProps {
  /**
   * Array of flights to display
   */
  flights: Flight[];

  /**
   * Search criteria used to find these flights
   */
  searchCriteria: SearchCriteria;

  /**
   * Callback when a flight is selected
   */
  onSelectFlight: (flight: Flight) => void;

  /**
   * Callback to modify search
   */
  onModifySearch: () => void;

  /**
   * Whether results are currently loading
   * @default false
   */
  isLoading?: boolean;

  /**
   * Error message if search failed
   */
  error?: string;

  /**
   * Callback to retry search on error
   */
  onRetry?: () => void;

  /**
   * Number of flights per page
   * @default 20
   */
  flightsPerPage?: number;

  /**
   * Currently selected flight ID
   */
  selectedFlightId?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Test ID for testing
   */
  testId?: string;
}

const FLIGHTS_PER_PAGE = 20;

/**
 * Sort flights by price in ascending order
 */
function sortFlightsByPrice(flights: Flight[]): Flight[] {
  return [...flights].sort((a, b) => a.price.amount - b.price.amount);
}

/**
 * Get paginated flights
 */
function getPaginatedFlights(
  flights: Flight[],
  page: number,
  perPage: number,
): Flight[] {
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  return flights.slice(startIndex, endIndex);
}

/**
 * Calculate total pages
 */
function getTotalPages(totalFlights: number, perPage: number): number {
  return Math.ceil(totalFlights / perPage);
}

/**
 * Get page numbers to display in pagination
 */
function getPageNumbers(currentPage: number, totalPages: number): number[] {
  const pages: number[] = [];
  const maxPagesToShow = 7;

  if (totalPages <= maxPagesToShow) {
    // Show all pages if total is small
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Show first page, last page, current page, and pages around current
    pages.push(1);

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if we're near the start or end
    if (currentPage <= 3) {
      endPage = 5;
    } else if (currentPage >= totalPages - 2) {
      startPage = totalPages - 4;
    }

    if (startPage > 2) {
      pages.push(-1); // Ellipsis
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push(-1); // Ellipsis
    }

    pages.push(totalPages);
  }

  return pages;
}

export function FlightResults({
  flights,
  searchCriteria,
  onSelectFlight,
  onModifySearch,
  isLoading = false,
  error,
  onRetry,
  flightsPerPage = FLIGHTS_PER_PAGE,
  selectedFlightId,
  className = "",
  testId = "flight-results",
}: FlightResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Sort flights by price (Requirement 3.3)
  const sortedFlights = useMemo(() => sortFlightsByPrice(flights), [flights]);

  // Calculate pagination
  const totalPages = getTotalPages(sortedFlights.length, flightsPerPage);
  const paginatedFlights = useMemo(
    () => getPaginatedFlights(sortedFlights, currentPage, flightsPerPage),
    [sortedFlights, currentPage, flightsPerPage],
  );
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  // Reset to page 1 when flights change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [flights]);

  // Scroll to top when page changes
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle previous page
  const handlePreviousPage = () => {
    handlePageChange(currentPage - 1);
  };

  // Handle next page
  const handleNextPage = () => {
    handlePageChange(currentPage + 1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("py-12", className)} data-testid={`${testId}-loading`}>
        <LoadingSpinner
          size="large"
          text="Searching for flights..."
          centered
          testId={`${testId}-loading-spinner`}
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn("py-12 max-w-2xl mx-auto", className)}
        data-testid={`${testId}-error`}
      >
        <ErrorMessage
          message={error}
          type="network"
          severity="error"
          retryable={!!onRetry}
          onRetry={onRetry}
          variant="block"
          testId={`${testId}-error-message`}
        />
      </div>
    );
  }

  // Empty state (Requirement 3.5)
  if (sortedFlights.length === 0) {
    return (
      <div
        className={cn("py-12 text-center max-w-2xl mx-auto", className)}
        data-testid={`${testId}-empty`}
      >
        <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
          <Search
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            aria-hidden="true"
          />
          <h2
            className="text-2xl font-semibold text-gray-900 mb-2"
            data-testid={`${testId}-empty-title`}
          >
            No flights found
          </h2>
          <p
            className="text-gray-600 mb-6"
            data-testid={`${testId}-empty-message`}
          >
            We couldn't find any flights matching your search criteria. Try
            adjusting your dates, destinations, or other search parameters.
          </p>
          <button
            onClick={onModifySearch}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            data-testid={`${testId}-modify-search-button`}
          >
            Modify Search
          </button>
        </div>
      </div>
    );
  }

  // Calculate result range for display
  const startResult = (currentPage - 1) * flightsPerPage + 1;
  const endResult = Math.min(
    currentPage * flightsPerPage,
    sortedFlights.length,
  );

  return (
    <div className={cn("space-y-6", className)} data-testid={testId}>
      {/* Results header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2
            className="text-2xl font-bold text-gray-900"
            data-testid={`${testId}-title`}
          >
            Available Flights
          </h2>
          <p
            className="text-sm text-gray-600 mt-1"
            data-testid={`${testId}-count`}
          >
            Showing {startResult}-{endResult} of {sortedFlights.length} flights
          </p>
        </div>
        <button
          onClick={onModifySearch}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          data-testid={`${testId}-modify-search-button`}
        >
          Modify Search
        </button>
      </div>

      {/* Flight cards */}
      <div className="space-y-4" data-testid={`${testId}-list`}>
        {paginatedFlights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            onSelect={onSelectFlight}
            isSelected={flight.id === selectedFlightId}
            testId={`${testId}-flight-${flight.id}`}
          />
        ))}
      </div>

      {/* Pagination (Requirement 3.4) */}
      {totalPages > 1 && (
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200"
          data-testid={`${testId}-pagination`}
        >
          {/* Page info */}
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>

          {/* Pagination controls */}
          <nav
            className="flex items-center gap-2"
            aria-label="Pagination"
            data-testid={`${testId}-pagination-controls`}
          >
            {/* Previous button */}
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={cn(
                "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                currentPage === 1
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50",
              )}
              aria-label="Previous page"
              data-testid={`${testId}-previous-button`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
              Previous
            </button>

            {/* Page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {pageNumbers.map((pageNum, index) => {
                if (pageNum === -1) {
                  // Ellipsis
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-3 py-2 text-gray-500"
                      aria-hidden="true"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      pageNum === currentPage
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50",
                    )}
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={pageNum === currentPage ? "page" : undefined}
                    data-testid={`${testId}-page-${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={cn(
                "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                currentPage === totalPages
                  ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50",
              )}
              aria-label="Next page"
              data-testid={`${testId}-next-button`}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
