/**
 * Example usage of the Search component
 */

import { Search } from "./Search";
import type { Airport, SearchCriteria } from "@/lib/types";

// Mock airport search function
const mockAirportSearch = async (query: string): Promise<Airport[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const airports: Airport[] = [
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
      code: "SYD",
      name: "Sydney Kingsford Smith Airport",
      city: "Sydney",
      country: "Australia",
    },
    {
      code: "LAX",
      name: "Los Angeles International Airport",
      city: "Los Angeles",
      country: "United States",
    },
    {
      code: "CDG",
      name: "Charles de Gaulle Airport",
      city: "Paris",
      country: "France",
    },
    {
      code: "NRT",
      name: "Narita International Airport",
      city: "Tokyo",
      country: "Japan",
    },
    {
      code: "SIN",
      name: "Singapore Changi Airport",
      city: "Singapore",
      country: "Singapore",
    },
  ];

  // Filter airports based on query
  const lowerQuery = query.toLowerCase();
  return airports.filter(
    (airport) =>
      airport.code.toLowerCase().includes(lowerQuery) ||
      airport.name.toLowerCase().includes(lowerQuery) ||
      airport.city.toLowerCase().includes(lowerQuery) ||
      airport.country.toLowerCase().includes(lowerQuery),
  );
};

// Example 1: Basic usage
export function BasicSearchExample() {
  const handleSearch = (criteria: SearchCriteria) => {
    console.log("Search criteria:", criteria);
    // Handle search submission
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Flight Search</h2>
      <Search onSearch={handleSearch} onAirportSearch={mockAirportSearch} />
    </div>
  );
}

// Example 2: With initial values
export function SearchWithInitialValuesExample() {
  const handleSearch = (criteria: SearchCriteria) => {
    console.log("Search criteria:", criteria);
  };

  const initialValues = {
    tripType: "one-way" as const,
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
        departureDate: new Date("2024-06-15"),
      },
    ],
    passengers: {
      adults: 2,
      children: 1,
      infants: 0,
    },
    cabinClass: "business" as const,
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Edit Search</h2>
      <Search
        initialValues={initialValues}
        onSearch={handleSearch}
        onAirportSearch={mockAirportSearch}
      />
    </div>
  );
}

// Example 3: With loading state
export function SearchWithLoadingExample() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSearch = async (criteria: SearchCriteria) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Search criteria:", criteria);
    setIsLoading(false);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Flight Search (with loading)</h2>
      <Search
        onSearch={handleSearch}
        onAirportSearch={mockAirportSearch}
        isLoading={isLoading}
      />
    </div>
  );
}

// Example 4: Multi-city search
export function MultiCitySearchExample() {
  const handleSearch = (criteria: SearchCriteria) => {
    console.log("Multi-city search:", criteria);
  };

  const initialValues = {
    tripType: "multi-city" as const,
    segments: [
      {
        origin: null,
        destination: null,
        departureDate: null,
      },
      {
        origin: null,
        destination: null,
        departureDate: null,
      },
      {
        origin: null,
        destination: null,
        departureDate: null,
      },
    ],
    passengers: {
      adults: 1,
      children: 0,
      infants: 0,
    },
    cabinClass: "economy" as const,
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Multi-City Flight Search</h2>
      <Search
        initialValues={initialValues}
        onSearch={handleSearch}
        onAirportSearch={mockAirportSearch}
      />
    </div>
  );
}
