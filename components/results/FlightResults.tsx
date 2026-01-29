"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { FlightCard } from "./FlightCard";
import {
  FilterSidebar,
  applyFilters,
  getInitialFilters,
  type FlightFilters,
} from "./FilterSidebar";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import type { Flight, SearchCriteria } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

/**
 * FlightResults Component
 *
 * Displays flight search results with filtering and pagination.
 * Shows flight cards, filter sidebar, handles empty states, and provides pagination controls.
 *
 * Features:
 * - Display flight cards with pagination (20 per page)
 * - Filter sidebar with price, duration, stops, airlines, departure time filters
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
 * - 4.1: Provide filters for price range, flight duration, number of stops, airlines, and departure time ranges
 * - 4.2: Update results within 1 second to show only matching flights
 * - 4.3: Apply all filters using AND logic
 * - 4.4: Display the count of active filters
 * - 4.5: Provide a clear all filters option
 * - 4.6: Display a message indicating no flights match the selected filters
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
  const [filters, setFilters] = useState<FlightFilters>(() =>
    getInitialFilters(flights),
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Initialize filters when flights change
  React.useEffect(() => {
    setFilters(getInitialFilters(flights));
  }, [flights]);

  // Sort flights by price (Requirement 3.3)
  const sortedFlights = useMemo(() => sortFlightsByPrice(flights), [flights]);

  // Apply filters (Requirement 4.2, 4.3)
  const filteredFlights = useMemo(
    () => applyFilters(sortedFlights, filters),
    [sortedFlights, filters],
  );

  // Calculate pagination
  const totalPages = getTotalPages(filteredFlights.length, flightsPerPage);
  const paginatedFlights = useMemo(
    () => getPaginatedFlights(filteredFlights, currentPage, flightsPerPage),
    [filteredFlights, currentPage, flightsPerPage],
  );
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  // Reset to page 1 when flights or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [flights, filters]);

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

  // Empty state (Requirement 3.5, 4.6)
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

  // Filtered empty state (Requirement 4.6)
  const hasActiveFilters =
    filteredFlights.length === 0 && sortedFlights.length > 0;

  // Calculate result range for display
  const startResult = (currentPage - 1) * flightsPerPage + 1;
  const endResult = Math.min(
    currentPage * flightsPerPage,
    filteredFlights.length,
  );

  return (
    <div className={cn("space-y-6", className)} data-testid={testId}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar */}
        <FilterSidebar
          flights={sortedFlights}
          filters={filters}
          onFiltersChange={setFilters}
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          className="lg:w-80 flex-shrink-0"
          testId={`${testId}-filters`}
        />

        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Results header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <div className="flex items-center gap-3">
                <h2
                  className="text-2xl font-bold text-gray-900"
                  data-testid={`${testId}-title`}
                >
                  Available Flights
                </h2>
                {/* Mobile filter button */}
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid={`${testId}-mobile-filter-button`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
              </div>
              <p
                className="text-sm text-gray-600 mt-1"
                data-testid={`${testId}-count`}
              >
                {filteredFlights.length > 0 ? (
                  <>
                    Showing {startResult}-{endResult} of{" "}
                    {filteredFlights.length} flights
                    {filteredFlights.length !== sortedFlights.length &&
                      ` (filtered from ${sortedFlights.length})`}
                  </>
                ) : (
                  `${sortedFlights.length} flights available`
                )}
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

          {/* Filtered empty state (Requirement 4.6) */}
          {hasActiveFilters && (
            <div
              className="py-12 text-center"
              data-testid={`${testId}-filtered-empty`}
            >
              <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
                <Search
                  className="w-16 h-16 text-gray-400 mx-auto mb-4"
                  aria-hidden="true"
                />
                <h2
                  className="text-2xl font-semibold text-gray-900 mb-2"
                  data-testid={`${testId}-filtered-empty-title`}
                >
                  No flights match your filters
                </h2>
                <p
                  className="text-gray-600 mb-6"
                  data-testid={`${testId}-filtered-empty-message`}
                >
                  Try adjusting your filter criteria to see more results.
                </p>
                <button
                  onClick={() => setFilters(getInitialFilters(sortedFlights))}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  data-testid={`${testId}-clear-filters-button`}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {/* Flight cards */}
          {!hasActiveFilters && (
            <>
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
                      <ChevronLeft
                        className="w-4 h-4 mr-1"
                        aria-hidden="true"
                      />
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
                            aria-current={
                              pageNum === currentPage ? "page" : undefined
                            }
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
                      <ChevronRight
                        className="w-4 h-4 ml-1"
                        aria-hidden="true"
                      />
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
