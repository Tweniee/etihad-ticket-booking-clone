/**
 * FilterSidebar Component Examples
 * Demonstrates various usage patterns for the FilterSidebar component
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  FilterSidebar,
  applyFilters,
  getInitialFilters,
  type FlightFilters,
} from "./FilterSidebar";
import { FlightCard } from "./FlightCard";
import type { Flight } from "@/lib/types";

// Mock flight data for examples
const mockFlights: Flight[] = [
  {
    id: "1",
    airline: {
      code: "AA",
      name: "American Airlines",
      logo: "https://images.kiwi.com/airlines/64/AA.png",
    },
    flightNumber: "AA100",
    segments: [
      {
        departure: {
          airport: {
            code: "JFK",
            name: "John F. Kennedy International Airport",
            city: "New York",
            country: "United States",
          },
          dateTime: new Date("2024-06-01T08:00:00"),
          terminal: "4",
        },
        arrival: {
          airport: {
            code: "LHR",
            name: "London Heathrow Airport",
            city: "London",
            country: "United Kingdom",
          },
          dateTime: new Date("2024-06-01T20:00:00"),
          terminal: "3",
        },
        duration: 420,
        aircraft: "Boeing 777-300ER",
      },
    ],
    price: {
      amount: 450,
      currency: "USD",
      breakdown: {
        baseFare: 350,
        taxes: 80,
        fees: 20,
      },
    },
    cabinClass: "economy",
    availableSeats: 50,
  },
  {
    id: "2",
    airline: {
      code: "BA",
      name: "British Airways",
      logo: "https://images.kiwi.com/airlines/64/BA.png",
    },
    flightNumber: "BA200",
    segments: [
      {
        departure: {
          airport: {
            code: "JFK",
            name: "John F. Kennedy International Airport",
            city: "New York",
            country: "United States",
          },
          dateTime: new Date("2024-06-01T14:00:00"),
          terminal: "7",
        },
        arrival: {
          airport: {
            code: "LHR",
            name: "London Heathrow Airport",
            city: "London",
            country: "United Kingdom",
          },
          dateTime: new Date("2024-06-02T02:00:00"),
          terminal: "5",
        },
        duration: 480,
        aircraft: "Airbus A380",
      },
    ],
    price: {
      amount: 850,
      currency: "USD",
      breakdown: {
        baseFare: 700,
        taxes: 120,
        fees: 30,
      },
    },
    cabinClass: "business",
    availableSeats: 20,
  },
  {
    id: "3",
    airline: {
      code: "DL",
      name: "Delta Air Lines",
      logo: "https://images.kiwi.com/airlines/64/DL.png",
    },
    flightNumber: "DL300",
    segments: [
      {
        departure: {
          airport: {
            code: "JFK",
            name: "John F. Kennedy International Airport",
            city: "New York",
            country: "United States",
          },
          dateTime: new Date("2024-06-01T10:00:00"),
          terminal: "4",
        },
        arrival: {
          airport: {
            code: "ATL",
            name: "Hartsfield-Jackson Atlanta International Airport",
            city: "Atlanta",
            country: "United States",
          },
          dateTime: new Date("2024-06-01T12:30:00"),
          terminal: "S",
        },
        duration: 150,
        aircraft: "Boeing 737-900",
      },
      {
        departure: {
          airport: {
            code: "ATL",
            name: "Hartsfield-Jackson Atlanta International Airport",
            city: "Atlanta",
            country: "United States",
          },
          dateTime: new Date("2024-06-01T14:00:00"),
          terminal: "I",
        },
        arrival: {
          airport: {
            code: "LHR",
            name: "London Heathrow Airport",
            city: "London",
            country: "United Kingdom",
          },
          dateTime: new Date("2024-06-02T03:00:00"),
          terminal: "3",
        },
        duration: 480,
        aircraft: "Airbus A350-900",
      },
    ],
    price: {
      amount: 550,
      currency: "USD",
      breakdown: {
        baseFare: 430,
        taxes: 100,
        fees: 20,
      },
    },
    cabinClass: "economy",
    availableSeats: 35,
  },
  {
    id: "4",
    airline: {
      code: "AA",
      name: "American Airlines",
      logo: "https://images.kiwi.com/airlines/64/AA.png",
    },
    flightNumber: "AA400",
    segments: [
      {
        departure: {
          airport: {
            code: "JFK",
            name: "John F. Kennedy International Airport",
            city: "New York",
            country: "United States",
          },
          dateTime: new Date("2024-06-01T18:00:00"),
          terminal: "8",
        },
        arrival: {
          airport: {
            code: "LHR",
            name: "London Heathrow Airport",
            city: "London",
            country: "United Kingdom",
          },
          dateTime: new Date("2024-06-02T06:00:00"),
          terminal: "3",
        },
        duration: 420,
        aircraft: "Boeing 787-9",
      },
    ],
    price: {
      amount: 480,
      currency: "USD",
      breakdown: {
        baseFare: 380,
        taxes: 80,
        fees: 20,
      },
    },
    cabinClass: "economy",
    availableSeats: 45,
  },
  {
    id: "5",
    airline: {
      code: "VS",
      name: "Virgin Atlantic",
      logo: "https://images.kiwi.com/airlines/64/VS.png",
    },
    flightNumber: "VS500",
    segments: [
      {
        departure: {
          airport: {
            code: "JFK",
            name: "John F. Kennedy International Airport",
            city: "New York",
            country: "United States",
          },
          dateTime: new Date("2024-06-01T21:00:00"),
          terminal: "4",
        },
        arrival: {
          airport: {
            code: "LHR",
            name: "London Heathrow Airport",
            city: "London",
            country: "United Kingdom",
          },
          dateTime: new Date("2024-06-02T09:00:00"),
          terminal: "3",
        },
        duration: 420,
        aircraft: "Airbus A350-1000",
      },
    ],
    price: {
      amount: 520,
      currency: "USD",
      breakdown: {
        baseFare: 410,
        taxes: 90,
        fees: 20,
      },
    },
    cabinClass: "economy",
    availableSeats: 40,
  },
];

/**
 * Example 1: Basic FilterSidebar with Results
 */
export function BasicFilterExample() {
  const [filters, setFilters] = useState<FlightFilters>(() =>
    getInitialFilters(mockFlights),
  );

  const filteredFlights = useMemo(
    () => applyFilters(mockFlights, filters),
    [filters],
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Flight Search Results
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Sidebar */}
          <FilterSidebar
            flights={mockFlights}
            filters={filters}
            onFiltersChange={setFilters}
            className="lg:w-80 flex-shrink-0"
          />

          {/* Results */}
          <div className="flex-1 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">
                Showing {filteredFlights.length} of {mockFlights.length} flights
              </p>
            </div>

            {filteredFlights.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-600">
                  No flights match your filter criteria. Try adjusting your
                  filters.
                </p>
              </div>
            ) : (
              filteredFlights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  onSelect={() => console.log("Selected:", flight.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 2: Mobile-Friendly Filter with Toggle
 */
export function MobileFilterExample() {
  const [filters, setFilters] = useState<FlightFilters>(() =>
    getInitialFilters(mockFlights),
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredFlights = useMemo(
    () => applyFilters(mockFlights, filters),
    [filters],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 p-4 lg:hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Flights</h1>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
          >
            Filters ({filteredFlights.length})
          </button>
        </div>
      </div>

      <div className="p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6">
            {/* Filter Sidebar */}
            <FilterSidebar
              flights={mockFlights}
              filters={filters}
              onFiltersChange={setFilters}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              className="lg:w-80 flex-shrink-0"
            />

            {/* Results */}
            <div className="flex-1 space-y-4">
              {filteredFlights.map((flight) => (
                <FlightCard
                  key={flight.id}
                  flight={flight}
                  onSelect={() => console.log("Selected:", flight.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 3: Pre-filtered Results
 */
export function PreFilteredExample() {
  // Start with some filters already applied
  const [filters, setFilters] = useState<FlightFilters>({
    priceRange: { min: 0, max: 600 },
    durationRange: { min: 0, max: 1440 },
    stops: [0], // Direct flights only
    airlines: [],
    departureTimeRanges: ["morning", "afternoon"],
  });

  const filteredFlights = useMemo(
    () => applyFilters(mockFlights, filters),
    [filters],
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Direct Flights Under $600
        </h1>
        <p className="text-gray-600 mb-8">
          Showing morning and afternoon departures
        </p>

        <div className="flex gap-6">
          <FilterSidebar
            flights={mockFlights}
            filters={filters}
            onFiltersChange={setFilters}
            className="lg:w-80 flex-shrink-0"
          />

          <div className="flex-1 space-y-4">
            {filteredFlights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onSelect={() => console.log("Selected:", flight.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 4: Filter Statistics Display
 */
export function FilterStatsExample() {
  const [filters, setFilters] = useState<FlightFilters>(() =>
    getInitialFilters(mockFlights),
  );

  const filteredFlights = useMemo(
    () => applyFilters(mockFlights, filters),
    [filters],
  );

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredFlights.length === 0) {
      return null;
    }

    const prices = filteredFlights.map((f) => f.price.amount);
    const durations = filteredFlights.map((f) =>
      f.segments.reduce((sum, seg) => sum + seg.duration, 0),
    );

    return {
      count: filteredFlights.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
    };
  }, [filteredFlights]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Flight Search with Statistics
        </h1>

        <div className="flex gap-6">
          <FilterSidebar
            flights={mockFlights}
            filters={filters}
            onFiltersChange={setFilters}
            className="lg:w-80 flex-shrink-0"
          />

          <div className="flex-1 space-y-4">
            {/* Statistics Card */}
            {stats && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Filter Results
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Flights Found</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.count}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price Range</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${stats.minPrice} - ${stats.maxPrice}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Price</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${Math.round(stats.avgPrice)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Flight Cards */}
            {filteredFlights.map((flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onSelect={() => console.log("Selected:", flight.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Export all examples
export default function FilterSidebarExamples() {
  const [activeExample, setActiveExample] = useState<
    "basic" | "mobile" | "prefiltered" | "stats"
  >("basic");

  return (
    <div>
      {/* Example Selector */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveExample("basic")}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeExample === "basic"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Basic
            </button>
            <button
              onClick={() => setActiveExample("mobile")}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeExample === "mobile"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Mobile
            </button>
            <button
              onClick={() => setActiveExample("prefiltered")}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeExample === "prefiltered"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Pre-filtered
            </button>
            <button
              onClick={() => setActiveExample("stats")}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeExample === "stats"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              With Stats
            </button>
          </div>
        </div>
      </div>

      {/* Active Example */}
      {activeExample === "basic" && <BasicFilterExample />}
      {activeExample === "mobile" && <MobileFilterExample />}
      {activeExample === "prefiltered" && <PreFilteredExample />}
      {activeExample === "stats" && <FilterStatsExample />}
    </div>
  );
}
