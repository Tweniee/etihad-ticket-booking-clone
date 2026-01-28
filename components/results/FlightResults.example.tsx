/**
 * FlightResults Component Examples
 *
 * This file demonstrates various usage scenarios for the FlightResults component.
 */

import { FlightResults } from "./FlightResults";
import type { Flight, SearchCriteria } from "@/lib/types";

// Mock search criteria
const mockSearchCriteria: SearchCriteria = {
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

// Mock flights
const mockFlights: Flight[] = [
  {
    id: "flight-1",
    airline: {
      code: "BA",
      name: "British Airways",
      logo: "/airlines/ba.png",
    },
    flightNumber: "BA178",
    segments: [
      {
        departure: {
          airport: {
            code: "JFK",
            name: "John F. Kennedy International Airport",
            city: "New York",
            country: "United States",
          },
          dateTime: new Date("2024-06-01T20:00:00"),
          terminal: "7",
        },
        arrival: {
          airport: {
            code: "LHR",
            name: "London Heathrow Airport",
            city: "London",
            country: "United Kingdom",
          },
          dateTime: new Date("2024-06-02T08:00:00"),
          terminal: "5",
        },
        duration: 420,
        aircraft: "Boeing 777-300ER",
      },
    ],
    price: {
      amount: 650,
      currency: "USD",
      breakdown: {
        baseFare: 500,
        taxes: 120,
        fees: 30,
      },
    },
    cabinClass: "economy",
    availableSeats: 15,
  },
  {
    id: "flight-2",
    airline: {
      code: "AA",
      name: "American Airlines",
      logo: "/airlines/aa.png",
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
          dateTime: new Date("2024-06-01T22:30:00"),
          terminal: "8",
        },
        arrival: {
          airport: {
            code: "LHR",
            name: "London Heathrow Airport",
            city: "London",
            country: "United Kingdom",
          },
          dateTime: new Date("2024-06-02T10:30:00"),
          terminal: "3",
        },
        duration: 420,
        aircraft: "Boeing 787-9",
      },
    ],
    price: {
      amount: 720,
      currency: "USD",
      breakdown: {
        baseFare: 580,
        taxes: 110,
        fees: 30,
      },
    },
    cabinClass: "economy",
    availableSeats: 8,
  },
];

// Generate more flights for pagination testing
const generateMockFlights = (count: number): Flight[] => {
  const flights: Flight[] = [];
  for (let i = 0; i < count; i++) {
    flights.push({
      ...mockFlights[i % 2],
      id: `flight-${i + 1}`,
      price: {
        ...mockFlights[i % 2].price,
        amount: 500 + Math.random() * 500,
      },
    });
  }
  return flights;
};

// Example 1: Basic usage with flights
export function BasicExample() {
  return (
    <FlightResults
      flights={mockFlights}
      searchCriteria={mockSearchCriteria}
      onSelectFlight={(flight) => console.log("Selected:", flight)}
      onModifySearch={() => console.log("Modify search")}
    />
  );
}

// Example 2: Empty state
export function EmptyStateExample() {
  return (
    <FlightResults
      flights={[]}
      searchCriteria={mockSearchCriteria}
      onSelectFlight={(flight) => console.log("Selected:", flight)}
      onModifySearch={() => console.log("Modify search")}
    />
  );
}

// Example 3: Loading state
export function LoadingStateExample() {
  return (
    <FlightResults
      flights={[]}
      searchCriteria={mockSearchCriteria}
      onSelectFlight={(flight) => console.log("Selected:", flight)}
      onModifySearch={() => console.log("Modify search")}
      isLoading={true}
    />
  );
}

// Example 4: Error state
export function ErrorStateExample() {
  return (
    <FlightResults
      flights={[]}
      searchCriteria={mockSearchCriteria}
      onSelectFlight={(flight) => console.log("Selected:", flight)}
      onModifySearch={() => console.log("Modify search")}
      error="Unable to connect to the server. Please check your internet connection."
      onRetry={() => console.log("Retry search")}
    />
  );
}

// Example 5: Pagination with many flights
export function PaginationExample() {
  const manyFlights = generateMockFlights(45);

  return (
    <FlightResults
      flights={manyFlights}
      searchCriteria={mockSearchCriteria}
      onSelectFlight={(flight) => console.log("Selected:", flight)}
      onModifySearch={() => console.log("Modify search")}
    />
  );
}

// Example 6: With selected flight
export function SelectedFlightExample() {
  return (
    <FlightResults
      flights={mockFlights}
      searchCriteria={mockSearchCriteria}
      onSelectFlight={(flight) => console.log("Selected:", flight)}
      onModifySearch={() => console.log("Modify search")}
      selectedFlightId="flight-1"
    />
  );
}

// Example 7: Custom flights per page
export function CustomPerPageExample() {
  const manyFlights = generateMockFlights(30);

  return (
    <FlightResults
      flights={manyFlights}
      searchCriteria={mockSearchCriteria}
      onSelectFlight={(flight) => console.log("Selected:", flight)}
      onModifySearch={() => console.log("Modify search")}
      flightsPerPage={10}
    />
  );
}
