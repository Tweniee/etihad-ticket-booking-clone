"use client";

import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Clock,
  Plane,
  Building2,
  Sunrise,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Flight } from "@/lib/types";

/**
 * FilterSidebar Component
 *
 * Provides comprehensive filtering options for flight search results.
 * Supports filtering by price, duration, stops, airlines, and departure times.
 *
 * Features:
 * - Price range filter with min/max sliders
 * - Duration filter with time range
 * - Number of stops filter (direct, 1 stop, 2+ stops)
 * - Airlines multi-select filter
 * - Departure time ranges (morning, afternoon, evening, night)
 * - AND logic for multiple filters
 * - Active filter count display
 * - Clear all filters option
 * - Collapsible filter sections
 * - Responsive design
 *
 * Validates Requirements:
 * - 4.1: Provide filters for price range, flight duration, number of stops, airlines, and departure time ranges
 * - 4.2: Update results within 1 second to show only matching flights
 * - 4.3: Apply all filters using AND logic
 * - 4.4: Display the count of active filters
 * - 4.5: Provide a clear all filters option
 * - 4.6: Display a message indicating no flights match the selected filters
 */

export interface FlightFilters {
  priceRange: {
    min: number;
    max: number;
  };
  durationRange: {
    min: number; // minutes
    max: number; // minutes
  };
  stops: number[]; // e.g., [0, 1, 2] for direct, 1 stop, 2+ stops
  airlines: string[]; // airline codes
  departureTimeRanges: string[]; // e.g., ['morning', 'afternoon']
}

export interface FilterSidebarProps {
  /**
   * All available flights (unfiltered)
   */
  flights: Flight[];

  /**
   * Current active filters
   */
  filters: FlightFilters;

  /**
   * Callback when filters change
   */
  onFiltersChange: (filters: FlightFilters) => void;

  /**
   * Whether the sidebar is open (mobile)
   */
  isOpen?: boolean;

  /**
   * Callback to close sidebar (mobile)
   */
  onClose?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Test ID for testing
   */
  testId?: string;
}

interface FilterSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
}

/**
 * Get the total duration of a flight in minutes
 */
function getFlightDuration(flight: Flight): number {
  return flight.segments.reduce(
    (total, segment) => total + segment.duration,
    0,
  );
}

/**
 * Get the number of stops for a flight
 */
function getFlightStops(flight: Flight): number {
  return Math.max(0, flight.segments.length - 1);
}

/**
 * Get the departure time range for a flight
 */
function getDepartureTimeRange(flight: Flight): string {
  const departureHour = flight.segments[0].departure.dateTime.getHours();

  if (departureHour >= 6 && departureHour < 12) return "morning";
  if (departureHour >= 12 && departureHour < 18) return "afternoon";
  if (departureHour >= 18 && departureHour < 22) return "evening";
  return "night";
}

/**
 * Get price range from flights
 */
function getPriceRange(flights: Flight[]): { min: number; max: number } {
  if (flights.length === 0) return { min: 0, max: 1000 };

  const prices = flights.map((f) => f.price.amount);
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
}

/**
 * Get duration range from flights
 */
function getDurationRange(flights: Flight[]): { min: number; max: number } {
  if (flights.length === 0) return { min: 0, max: 1440 };

  const durations = flights.map(getFlightDuration);
  return {
    min: Math.floor(Math.min(...durations)),
    max: Math.ceil(Math.max(...durations)),
  };
}

/**
 * Get unique airlines from flights
 */
function getUniqueAirlines(
  flights: Flight[],
): Array<{ code: string; name: string }> {
  const airlinesMap = new Map<string, string>();

  flights.forEach((flight) => {
    airlinesMap.set(flight.airline.code, flight.airline.name);
  });

  return Array.from(airlinesMap.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Format duration in hours and minutes
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Count active filters
 */
function countActiveFilters(
  filters: FlightFilters,
  priceRange: { min: number; max: number },
  durationRange: { min: number; max: number },
): number {
  let count = 0;

  // Price filter is active if not at full range
  if (
    filters.priceRange.min !== priceRange.min ||
    filters.priceRange.max !== priceRange.max
  ) {
    count++;
  }

  // Duration filter is active if not at full range
  if (
    filters.durationRange.min !== durationRange.min ||
    filters.durationRange.max !== durationRange.max
  ) {
    count++;
  }

  // Stops filter is active if not all selected
  if (filters.stops.length > 0 && filters.stops.length < 3) {
    count++;
  }

  // Airlines filter is active if any selected
  if (filters.airlines.length > 0) {
    count++;
  }

  // Departure time filter is active if any selected
  if (filters.departureTimeRanges.length > 0) {
    count++;
  }

  return count;
}

export function FilterSidebar({
  flights,
  filters,
  onFiltersChange,
  isOpen = true,
  onClose,
  className = "",
  testId = "filter-sidebar",
}: FilterSidebarProps) {
  // Calculate ranges from available flights
  const priceRange = React.useMemo(() => getPriceRange(flights), [flights]);
  const durationRange = React.useMemo(
    () => getDurationRange(flights),
    [flights],
  );
  const airlines = React.useMemo(() => getUniqueAirlines(flights), [flights]);

  // Track which sections are open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    duration: true,
    stops: true,
    airlines: true,
    departureTime: true,
  });

  // Initialize filters with full ranges if not set
  useEffect(() => {
    if (
      filters.priceRange.min === 0 &&
      filters.priceRange.max === 0 &&
      priceRange.max > 0
    ) {
      onFiltersChange({
        ...filters,
        priceRange: { ...priceRange },
        durationRange: { ...durationRange },
      });
    }
  }, [priceRange, durationRange]);

  // Toggle section open/closed
  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Handle price range change
  const handlePriceChange = (type: "min" | "max", value: number) => {
    onFiltersChange({
      ...filters,
      priceRange: {
        ...filters.priceRange,
        [type]: value,
      },
    });
  };

  // Handle duration range change
  const handleDurationChange = (type: "min" | "max", value: number) => {
    onFiltersChange({
      ...filters,
      durationRange: {
        ...filters.durationRange,
        [type]: value,
      },
    });
  };

  // Handle stops filter change
  const handleStopsChange = (stops: number) => {
    const newStops = filters.stops.includes(stops)
      ? filters.stops.filter((s) => s !== stops)
      : [...filters.stops, stops];

    onFiltersChange({
      ...filters,
      stops: newStops,
    });
  };

  // Handle airline filter change
  const handleAirlineChange = (airlineCode: string) => {
    const newAirlines = filters.airlines.includes(airlineCode)
      ? filters.airlines.filter((a) => a !== airlineCode)
      : [...filters.airlines, airlineCode];

    onFiltersChange({
      ...filters,
      airlines: newAirlines,
    });
  };

  // Handle departure time range change
  const handleDepartureTimeChange = (timeRange: string) => {
    const newTimeRanges = filters.departureTimeRanges.includes(timeRange)
      ? filters.departureTimeRanges.filter((t) => t !== timeRange)
      : [...filters.departureTimeRanges, timeRange];

    onFiltersChange({
      ...filters,
      departureTimeRanges: newTimeRanges,
    });
  };

  // Clear all filters
  const handleClearAll = () => {
    onFiltersChange({
      priceRange: { ...priceRange },
      durationRange: { ...durationRange },
      stops: [],
      airlines: [],
      departureTimeRanges: [],
    });
  };

  // Count active filters (Requirement 4.4)
  const activeFilterCount = countActiveFilters(
    filters,
    priceRange,
    durationRange,
  );

  const sidebarContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <span
              className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
              data-testid={`${testId}-active-count`}
            >
              {activeFilterCount}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Close filters"
            data-testid={`${testId}-close-button`}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Clear all button (Requirement 4.5) */}
      {activeFilterCount > 0 && (
        <button
          onClick={handleClearAll}
          className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          data-testid={`${testId}-clear-all`}
        >
          Clear all filters
        </button>
      )}

      {/* Price Range Filter */}
      <div className="space-y-3" data-testid={`${testId}-price-section`}>
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
          aria-expanded={openSections.price}
        >
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-gray-600" />
            <h3 className="font-medium text-gray-900">Price Range</h3>
          </div>
          {openSections.price ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {openSections.price && (
          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                ${filters.priceRange.min.toFixed(0)}
              </span>
              <span className="text-gray-600">
                ${filters.priceRange.max.toFixed(0)}
              </span>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={filters.priceRange.min}
                onChange={(e) =>
                  handlePriceChange("min", Number(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                aria-label="Minimum price"
                data-testid={`${testId}-price-min`}
              />
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={filters.priceRange.max}
                onChange={(e) =>
                  handlePriceChange("max", Number(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                aria-label="Maximum price"
                data-testid={`${testId}-price-max`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Duration Filter */}
      <div className="space-y-3" data-testid={`${testId}-duration-section`}>
        <button
          onClick={() => toggleSection("duration")}
          className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
          aria-expanded={openSections.duration}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <h3 className="font-medium text-gray-900">Flight Duration</h3>
          </div>
          {openSections.duration ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {openSections.duration && (
          <div className="space-y-3 pl-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {formatDuration(filters.durationRange.min)}
              </span>
              <span className="text-gray-600">
                {formatDuration(filters.durationRange.max)}
              </span>
            </div>
            <div className="space-y-2">
              <input
                type="range"
                min={durationRange.min}
                max={durationRange.max}
                value={filters.durationRange.min}
                onChange={(e) =>
                  handleDurationChange("min", Number(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                aria-label="Minimum duration"
                data-testid={`${testId}-duration-min`}
              />
              <input
                type="range"
                min={durationRange.min}
                max={durationRange.max}
                value={filters.durationRange.max}
                onChange={(e) =>
                  handleDurationChange("max", Number(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                aria-label="Maximum duration"
                data-testid={`${testId}-duration-max`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stops Filter */}
      <div className="space-y-3" data-testid={`${testId}-stops-section`}>
        <button
          onClick={() => toggleSection("stops")}
          className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
          aria-expanded={openSections.stops}
        >
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4 text-gray-600" />
            <h3 className="font-medium text-gray-900">Number of Stops</h3>
          </div>
          {openSections.stops ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {openSections.stops && (
          <div className="space-y-2 pl-6">
            {[
              { value: 0, label: "Direct" },
              { value: 1, label: "1 Stop" },
              { value: 2, label: "2+ Stops" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.stops.includes(option.value)}
                  onChange={() => handleStopsChange(option.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  data-testid={`${testId}-stops-${option.value}`}
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Airlines Filter */}
      <div className="space-y-3" data-testid={`${testId}-airlines-section`}>
        <button
          onClick={() => toggleSection("airlines")}
          className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
          aria-expanded={openSections.airlines}
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gray-600" />
            <h3 className="font-medium text-gray-900">Airlines</h3>
          </div>
          {openSections.airlines ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {openSections.airlines && (
          <div className="space-y-2 pl-6 max-h-48 overflow-y-auto">
            {airlines.map((airline) => (
              <label
                key={airline.code}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.airlines.includes(airline.code)}
                  onChange={() => handleAirlineChange(airline.code)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  data-testid={`${testId}-airline-${airline.code}`}
                />
                <span className="text-sm text-gray-700">{airline.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Departure Time Filter */}
      <div
        className="space-y-3"
        data-testid={`${testId}-departure-time-section`}
      >
        <button
          onClick={() => toggleSection("departureTime")}
          className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
          aria-expanded={openSections.departureTime}
        >
          <div className="flex items-center gap-2">
            <Sunrise className="w-4 h-4 text-gray-600" />
            <h3 className="font-medium text-gray-900">Departure Time</h3>
          </div>
          {openSections.departureTime ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {openSections.departureTime && (
          <div className="space-y-2 pl-6">
            {[
              { value: "morning", label: "Morning (6am - 12pm)" },
              { value: "afternoon", label: "Afternoon (12pm - 6pm)" },
              { value: "evening", label: "Evening (6pm - 10pm)" },
              { value: "night", label: "Night (10pm - 6am)" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.departureTimeRanges.includes(option.value)}
                  onChange={() => handleDepartureTimeChange(option.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  data-testid={`${testId}-time-${option.value}`}
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Mobile: render as overlay
  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white rounded-lg border border-gray-200 p-6",
          "lg:sticky lg:top-4",
          // Mobile: slide in from left
          "fixed lg:relative inset-y-0 left-0 z-50 w-80 lg:w-auto",
          "transform transition-transform lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className,
        )}
        data-testid={testId}
        aria-label="Flight filters"
      >
        {sidebarContent}
      </aside>
    </>
  );
}

/**
 * Apply filters to flights (Requirement 4.3: AND logic)
 */
export function applyFilters(
  flights: Flight[],
  filters: FlightFilters,
): Flight[] {
  return flights.filter((flight) => {
    // Price filter
    if (
      flight.price.amount < filters.priceRange.min ||
      flight.price.amount > filters.priceRange.max
    ) {
      return false;
    }

    // Duration filter
    const duration = getFlightDuration(flight);
    if (
      duration < filters.durationRange.min ||
      duration > filters.durationRange.max
    ) {
      return false;
    }

    // Stops filter
    if (filters.stops.length > 0) {
      const stops = getFlightStops(flight);
      const matchesStops =
        filters.stops.includes(stops) ||
        (filters.stops.includes(2) && stops >= 2);
      if (!matchesStops) {
        return false;
      }
    }

    // Airlines filter
    if (filters.airlines.length > 0) {
      if (!filters.airlines.includes(flight.airline.code)) {
        return false;
      }
    }

    // Departure time filter
    if (filters.departureTimeRanges.length > 0) {
      const timeRange = getDepartureTimeRange(flight);
      if (!filters.departureTimeRanges.includes(timeRange)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get initial filters with full ranges
 */
export function getInitialFilters(flights: Flight[]): FlightFilters {
  const priceRange = getPriceRange(flights);
  const durationRange = getDurationRange(flights);

  return {
    priceRange,
    durationRange,
    stops: [],
    airlines: [],
    departureTimeRanges: [],
  };
}
