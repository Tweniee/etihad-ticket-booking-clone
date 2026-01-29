"use client";

/**
 * Flight Results Demo Page
 * Demonstrates the FlightResults component with pagination
 */

import { useState, useEffect } from "react";
import { FlightResults } from "@/components/results";
import type { Flight, SearchCriteria } from "@/lib/types";

export default function ResultsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock search criteria
  const searchCriteria: SearchCriteria = {
    tripType: "one-way",
    segments: [
      {
        origin: {
          code: "JFK",
          name: "John F. Kennedy International Airport",
          city: "New York",
          country: "United States",
        },
        destination: {
          code: "LHR",
          name: "London Heathrow Airport",
          city: "London",
          country: "United Kingdom",
        },
        departureDate: new Date("2024-06-01"),
      },
    ],
    passengers: {
      adults: 1,
      children: 0,
      infants: 0,
    },
    cabinClass: "economy",
  };

  // Fetch flights on mount
  useEffect(() => {
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
        setFlights(data.flights);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlights();
  }, []);

  const handleSelectFlight = (flight: Flight) => {
    console.log("Selected flight:", flight);
    alert(`Selected flight ${flight.flightNumber} - ${flight.airline.name}`);
  };

  const handleModifySearch = () => {
    console.log("Modify search clicked");
    alert("Navigate back to search page");
  };

  const handleRetry = () => {
    console.log("Retry clicked");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Flight Search Results
          </h1>
          <p className="text-gray-600 mt-2">
            {searchCriteria.segments[0].origin.code} →{" "}
            {searchCriteria.segments[0].destination.code} •{" "}
            {searchCriteria.passengers.adults} Adult •{" "}
            {searchCriteria.cabinClass}
          </p>
        </div>

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
