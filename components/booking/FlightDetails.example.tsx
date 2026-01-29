/**
 * FlightDetails Component Example
 *
 * This file demonstrates how to use the FlightDetails component
 * with sample data for testing and development purposes.
 */

import { FlightDetails } from "./FlightDetails";
import type { FlightDetails as FlightDetailsType } from "@/lib/types";

// Sample flight data
const sampleFlight: FlightDetailsType = {
  id: "FL123",
  airline: {
    code: "EY",
    name: "Etihad Airways",
    logo: "/airlines/etihad.png",
  },
  flightNumber: "EY101",
  segments: [
    {
      departure: {
        airport: {
          code: "JFK",
          name: "John F. Kennedy International Airport",
          city: "New York",
          country: "United States",
        },
        dateTime: new Date("2024-06-15T18:30:00"),
        terminal: "4",
      },
      arrival: {
        airport: {
          code: "AUH",
          name: "Abu Dhabi International Airport",
          city: "Abu Dhabi",
          country: "United Arab Emirates",
        },
        dateTime: new Date("2024-06-16T17:45:00"),
        terminal: "3",
      },
      duration: 795, // 13h 15m
      aircraft: "Boeing 787-9 Dreamliner",
    },
    {
      departure: {
        airport: {
          code: "AUH",
          name: "Abu Dhabi International Airport",
          city: "Abu Dhabi",
          country: "United Arab Emirates",
        },
        dateTime: new Date("2024-06-16T20:15:00"),
        terminal: "3",
      },
      arrival: {
        airport: {
          code: "LHR",
          name: "London Heathrow Airport",
          city: "London",
          country: "United Kingdom",
        },
        dateTime: new Date("2024-06-17T00:30:00"),
        terminal: "2",
      },
      duration: 435, // 7h 15m
      aircraft: "Airbus A380-800",
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
  cabinClass: "Business",
  availableSeats: 12,
  baggage: {
    checkedBags: {
      quantity: 2,
      weight: 32,
      dimensions: "158 cm (62 in) total",
    },
    carryOn: {
      quantity: 1,
      weight: 7,
      dimensions: "56 x 36 x 23 cm",
    },
  },
  fareRules: {
    changeFee: 150.0,
    cancellationFee: 200.0,
    refundable: true,
    changePolicy:
      "Changes are permitted up to 24 hours before departure. A change fee of USD 150 applies, plus any fare difference.",
    cancellationPolicy:
      "Cancellations are permitted up to 24 hours before departure. A cancellation fee of USD 200 applies. Refund will be processed within 7-10 business days.",
  },
  amenities: [
    "WiFi",
    "In-flight Entertainment",
    "Power Outlets",
    "USB Charging",
    "Lie-flat Seats",
    "Premium Dining",
    "Amenity Kit",
    "Priority Boarding",
  ],
};

// Sample non-refundable flight
const nonRefundableFlight: FlightDetailsType = {
  ...sampleFlight,
  id: "FL456",
  flightNumber: "EY202",
  price: {
    amount: 450.0,
    currency: "USD",
    breakdown: {
      baseFare: 350.0,
      taxes: 80.0,
      fees: 20.0,
    },
  },
  cabinClass: "Economy",
  fareRules: {
    changeFee: null,
    cancellationFee: null,
    refundable: false,
    changePolicy: "Changes are not permitted for this fare type.",
    cancellationPolicy:
      "This ticket is non-refundable. No refund will be provided for cancellations.",
  },
  baggage: {
    checkedBags: {
      quantity: 1,
      weight: 23,
      dimensions: "158 cm (62 in) total",
    },
    carryOn: {
      quantity: 1,
      weight: 7,
      dimensions: "56 x 36 x 23 cm",
    },
  },
  amenities: ["WiFi", "In-flight Entertainment", "Snacks & Beverages"],
};

// Example 1: Business Class Flight
export function BusinessClassExample() {
  const handleContinue = () => {
    console.log("Continue to seat selection");
  };

  const handleBack = () => {
    console.log("Back to results");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <FlightDetails
        flight={sampleFlight}
        onContinue={handleContinue}
        onBack={handleBack}
      />
    </div>
  );
}

// Example 2: Economy Non-Refundable Flight
export function EconomyNonRefundableExample() {
  const handleContinue = () => {
    console.log("Continue to seat selection");
  };

  const handleBack = () => {
    console.log("Back to results");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <FlightDetails
        flight={nonRefundableFlight}
        onContinue={handleContinue}
        onBack={handleBack}
      />
    </div>
  );
}

// Example 3: Direct Flight (Single Segment)
export function DirectFlightExample() {
  const directFlight: FlightDetailsType = {
    ...sampleFlight,
    id: "FL789",
    flightNumber: "EY303",
    segments: [sampleFlight.segments[0]], // Only first segment
    price: {
      amount: 850.0,
      currency: "USD",
      breakdown: {
        baseFare: 650.0,
        taxes: 150.0,
        fees: 50.0,
      },
    },
  };

  const handleContinue = () => {
    console.log("Continue to seat selection");
  };

  const handleBack = () => {
    console.log("Back to results");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <FlightDetails
        flight={directFlight}
        onContinue={handleContinue}
        onBack={handleBack}
      />
    </div>
  );
}
