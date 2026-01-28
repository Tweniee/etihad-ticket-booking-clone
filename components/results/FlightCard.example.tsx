/**
 * FlightCard Component Examples
 *
 * This file demonstrates various use cases of the FlightCard component.
 */

import React from "react";
import { FlightCard } from "./FlightCard";
import type { Flight } from "@/lib/types";

// Example flight data
const directFlight: Flight = {
  id: "FL001",
  airline: {
    code: "EY",
    name: "Etihad Airways",
    logo: "https://images.kiwi.com/airlines/64/EY.png",
  },
  flightNumber: "EY 101",
  segments: [
    {
      departure: {
        airport: {
          code: "AUH",
          name: "Abu Dhabi International Airport",
          city: "Abu Dhabi",
          country: "United Arab Emirates",
        },
        dateTime: new Date("2024-06-15T14:30:00Z"),
        terminal: "3",
      },
      arrival: {
        airport: {
          code: "LHR",
          name: "London Heathrow Airport",
          city: "London",
          country: "United Kingdom",
        },
        dateTime: new Date("2024-06-15T19:45:00Z"),
        terminal: "4",
      },
      duration: 435, // 7h 15m
      aircraft: "Boeing 787-9",
    },
  ],
  price: {
    amount: 1250.0,
    currency: "USD",
    breakdown: {
      baseFare: 950.0,
      taxes: 250.0,
      fees: 50.0,
    },
  },
  cabinClass: "economy",
  availableSeats: 12,
};

const oneStopFlight: Flight = {
  id: "FL002",
  airline: {
    code: "BA",
    name: "British Airways",
    logo: "https://images.kiwi.com/airlines/64/BA.png",
  },
  flightNumber: "BA 2156",
  segments: [
    {
      departure: {
        airport: {
          code: "JFK",
          name: "John F. Kennedy International Airport",
          city: "New York",
          country: "United States",
        },
        dateTime: new Date("2024-06-20T10:00:00Z"),
        terminal: "7",
      },
      arrival: {
        airport: {
          code: "LHR",
          name: "London Heathrow Airport",
          city: "London",
          country: "United Kingdom",
        },
        dateTime: new Date("2024-06-20T22:15:00Z"),
        terminal: "5",
      },
      duration: 435, // 7h 15m
      aircraft: "Boeing 777-300ER",
    },
    {
      departure: {
        airport: {
          code: "LHR",
          name: "London Heathrow Airport",
          city: "London",
          country: "United Kingdom",
        },
        dateTime: new Date("2024-06-21T08:30:00Z"),
        terminal: "5",
      },
      arrival: {
        airport: {
          code: "DXB",
          name: "Dubai International Airport",
          city: "Dubai",
          country: "United Arab Emirates",
        },
        dateTime: new Date("2024-06-21T19:45:00Z"),
        terminal: "3",
      },
      duration: 435, // 7h 15m
      aircraft: "Airbus A380",
    },
  ],
  price: {
    amount: 1850.0,
    currency: "USD",
    breakdown: {
      baseFare: 1450.0,
      taxes: 320.0,
      fees: 80.0,
    },
  },
  cabinClass: "business",
  availableSeats: 5,
};

const multiStopFlight: Flight = {
  id: "FL003",
  airline: {
    code: "EK",
    name: "Emirates",
    logo: "https://images.kiwi.com/airlines/64/EK.png",
  },
  flightNumber: "EK 3421",
  segments: [
    {
      departure: {
        airport: {
          code: "LAX",
          name: "Los Angeles International Airport",
          city: "Los Angeles",
          country: "United States",
        },
        dateTime: new Date("2024-07-01T16:00:00Z"),
      },
      arrival: {
        airport: {
          code: "DXB",
          name: "Dubai International Airport",
          city: "Dubai",
          country: "United Arab Emirates",
        },
        dateTime: new Date("2024-07-02T19:30:00Z"),
      },
      duration: 870, // 14h 30m
      aircraft: "Airbus A380",
    },
    {
      departure: {
        airport: {
          code: "DXB",
          name: "Dubai International Airport",
          city: "Dubai",
          country: "United Arab Emirates",
        },
        dateTime: new Date("2024-07-03T02:45:00Z"),
      },
      arrival: {
        airport: {
          code: "BOM",
          name: "Chhatrapati Shivaji Maharaj International Airport",
          city: "Mumbai",
          country: "India",
        },
        dateTime: new Date("2024-07-03T06:15:00Z"),
      },
      duration: 210, // 3h 30m
      aircraft: "Boeing 777-300ER",
    },
    {
      departure: {
        airport: {
          code: "BOM",
          name: "Chhatrapati Shivaji Maharaj International Airport",
          city: "Mumbai",
          country: "India",
        },
        dateTime: new Date("2024-07-03T10:00:00Z"),
      },
      arrival: {
        airport: {
          code: "SIN",
          name: "Singapore Changi Airport",
          city: "Singapore",
          country: "Singapore",
        },
        dateTime: new Date("2024-07-03T17:30:00Z"),
      },
      duration: 330, // 5h 30m
      aircraft: "Airbus A350",
    },
  ],
  price: {
    amount: 2450.0,
    currency: "USD",
    breakdown: {
      baseFare: 1950.0,
      taxes: 400.0,
      fees: 100.0,
    },
  },
  cabinClass: "first",
  availableSeats: 2,
};

/**
 * Example: Basic FlightCard usage
 */
export function BasicExample() {
  const handleSelect = (flight: Flight) => {
    console.log("Selected flight:", flight.id);
  };

  return (
    <div className="p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Basic FlightCard</h2>
      <FlightCard flight={directFlight} onSelect={handleSelect} />
    </div>
  );
}

/**
 * Example: Multiple flight cards
 */
export function MultipleFlightsExample() {
  const [selectedFlightId, setSelectedFlightId] = React.useState<string | null>(
    null,
  );

  const handleSelect = (flight: Flight) => {
    setSelectedFlightId(flight.id);
  };

  return (
    <div className="p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Flight Search Results</h2>
      <div className="space-y-4 max-w-5xl">
        <FlightCard
          flight={directFlight}
          onSelect={handleSelect}
          isSelected={selectedFlightId === directFlight.id}
        />
        <FlightCard
          flight={oneStopFlight}
          onSelect={handleSelect}
          isSelected={selectedFlightId === oneStopFlight.id}
        />
        <FlightCard
          flight={multiStopFlight}
          onSelect={handleSelect}
          isSelected={selectedFlightId === multiStopFlight.id}
        />
      </div>
    </div>
  );
}

/**
 * Example: Different cabin classes
 */
export function CabinClassesExample() {
  const handleSelect = (flight: Flight) => {
    console.log("Selected flight:", flight.id);
  };

  return (
    <div className="p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Different Cabin Classes</h2>
      <div className="space-y-4 max-w-5xl">
        <div>
          <h3 className="text-lg font-semibold mb-2">Economy</h3>
          <FlightCard flight={directFlight} onSelect={handleSelect} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Business</h3>
          <FlightCard flight={oneStopFlight} onSelect={handleSelect} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">First Class</h3>
          <FlightCard flight={multiStopFlight} onSelect={handleSelect} />
        </div>
      </div>
    </div>
  );
}

/**
 * Example: Different stop configurations
 */
export function StopsExample() {
  const handleSelect = (flight: Flight) => {
    console.log("Selected flight:", flight.id);
  };

  return (
    <div className="p-8 bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Different Stop Configurations</h2>
      <div className="space-y-4 max-w-5xl">
        <div>
          <h3 className="text-lg font-semibold mb-2">Direct Flight</h3>
          <FlightCard flight={directFlight} onSelect={handleSelect} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">1 Stop</h3>
          <FlightCard flight={oneStopFlight} onSelect={handleSelect} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">2 Stops</h3>
          <FlightCard flight={multiStopFlight} onSelect={handleSelect} />
        </div>
      </div>
    </div>
  );
}
