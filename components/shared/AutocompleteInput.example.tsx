/**
 * Example usage of AutocompleteInput component
 *
 * This file demonstrates how to use the AutocompleteInput component
 * for airport search functionality.
 */

"use client";

import { useState } from "react";
import { AutocompleteInput } from "./AutocompleteInput";
import { Airport } from "@/lib/types";

// Mock airport data for demonstration
const mockAirports: Airport[] = [
  {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
  },
  {
    code: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    country: "United Kingdom",
  },
  {
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
  },
  {
    code: "AUH",
    name: "Abu Dhabi International Airport",
    city: "Abu Dhabi",
    country: "United Arab Emirates",
  },
  {
    code: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    country: "United States",
  },
];

export function AutocompleteInputExample() {
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);

  // Mock search function that filters airports
  const handleSearch = async (query: string): Promise<Airport[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const lowerQuery = query.toLowerCase();

    // Search by city name, airport name, or IATA code
    return mockAirports.filter(
      (airport) =>
        airport.city.toLowerCase().includes(lowerQuery) ||
        airport.name.toLowerCase().includes(lowerQuery) ||
        airport.code.toLowerCase().includes(lowerQuery),
    );
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Airport Search Example</h2>

      <AutocompleteInput
        value={selectedAirport}
        onChange={setSelectedAirport}
        onSearch={handleSearch}
        label="Origin Airport"
        placeholder="Search by city, airport name, or code..."
        required
        debounceMs={300}
        minChars={2}
      />

      {selectedAirport && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Selected Airport:</h3>
          <p>
            <strong>Code:</strong> {selectedAirport.code}
          </p>
          <p>
            <strong>Name:</strong> {selectedAirport.name}
          </p>
          <p>
            <strong>City:</strong> {selectedAirport.city}
          </p>
          <p>
            <strong>Country:</strong> {selectedAirport.country}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Integration with API:
 *
 * In a real application, you would replace the mock search function
 * with an actual API call:
 *
 * const handleSearch = async (query: string): Promise<Airport[]> => {
 *   const response = await fetch(`/api/airports/search?q=${encodeURIComponent(query)}`);
 *   if (!response.ok) {
 *     throw new Error('Failed to search airports');
 *   }
 *   const data = await response.json();
 *   return data.airports;
 * };
 */
