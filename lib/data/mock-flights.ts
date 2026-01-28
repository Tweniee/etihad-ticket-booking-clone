/**
 * Mock Flight Data Generator
 * Generates realistic flight data for testing and development
 */

import type {
  Flight,
  Airport,
  Airline,
  FlightSegmentDetail,
  SearchCriteria,
} from "@/lib/types";

// ============================================================================
// Mock Data: Airlines
// ============================================================================

const AIRLINES: Airline[] = [
  {
    code: "EY",
    name: "Etihad Airways",
    logo: "/airlines/etihad.png",
  },
  {
    code: "EK",
    name: "Emirates",
    logo: "/airlines/emirates.png",
  },
  {
    code: "QR",
    name: "Qatar Airways",
    logo: "/airlines/qatar.png",
  },
  {
    code: "BA",
    name: "British Airways",
    logo: "/airlines/british-airways.png",
  },
  {
    code: "LH",
    name: "Lufthansa",
    logo: "/airlines/lufthansa.png",
  },
  {
    code: "AF",
    name: "Air France",
    logo: "/airlines/air-france.png",
  },
  {
    code: "AA",
    name: "American Airlines",
    logo: "/airlines/american.png",
  },
  {
    code: "UA",
    name: "United Airlines",
    logo: "/airlines/united.png",
  },
  {
    code: "DL",
    name: "Delta Air Lines",
    logo: "/airlines/delta.png",
  },
  {
    code: "SQ",
    name: "Singapore Airlines",
    logo: "/airlines/singapore.png",
  },
];

// ============================================================================
// Mock Data: Airports
// ============================================================================

export const AIRPORTS: Airport[] = [
  // Middle East
  {
    code: "AUH",
    name: "Abu Dhabi International Airport",
    city: "Abu Dhabi",
    country: "United Arab Emirates",
  },
  {
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
  },
  {
    code: "DOH",
    name: "Hamad International Airport",
    city: "Doha",
    country: "Qatar",
  },
  {
    code: "RUH",
    name: "King Khalid International Airport",
    city: "Riyadh",
    country: "Saudi Arabia",
  },
  {
    code: "JED",
    name: "King Abdulaziz International Airport",
    city: "Jeddah",
    country: "Saudi Arabia",
  },

  // Europe
  {
    code: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    country: "United Kingdom",
  },
  {
    code: "CDG",
    name: "Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
  },
  {
    code: "FRA",
    name: "Frankfurt Airport",
    city: "Frankfurt",
    country: "Germany",
  },
  {
    code: "AMS",
    name: "Amsterdam Airport Schiphol",
    city: "Amsterdam",
    country: "Netherlands",
  },
  {
    code: "MAD",
    name: "Adolfo Suárez Madrid-Barajas Airport",
    city: "Madrid",
    country: "Spain",
  },
  {
    code: "FCO",
    name: "Leonardo da Vinci-Fiumicino Airport",
    city: "Rome",
    country: "Italy",
  },
  { code: "MUC", name: "Munich Airport", city: "Munich", country: "Germany" },
  {
    code: "ZRH",
    name: "Zurich Airport",
    city: "Zurich",
    country: "Switzerland",
  },

  // North America
  {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
  },
  {
    code: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    country: "United States",
  },
  {
    code: "ORD",
    name: "O'Hare International Airport",
    city: "Chicago",
    country: "United States",
  },
  {
    code: "MIA",
    name: "Miami International Airport",
    city: "Miami",
    country: "United States",
  },
  {
    code: "SFO",
    name: "San Francisco International Airport",
    city: "San Francisco",
    country: "United States",
  },
  {
    code: "YYZ",
    name: "Toronto Pearson International Airport",
    city: "Toronto",
    country: "Canada",
  },

  // Asia
  {
    code: "SIN",
    name: "Singapore Changi Airport",
    city: "Singapore",
    country: "Singapore",
  },
  {
    code: "HKG",
    name: "Hong Kong International Airport",
    city: "Hong Kong",
    country: "Hong Kong",
  },
  {
    code: "NRT",
    name: "Narita International Airport",
    city: "Tokyo",
    country: "Japan",
  },
  {
    code: "ICN",
    name: "Incheon International Airport",
    city: "Seoul",
    country: "South Korea",
  },
  {
    code: "BKK",
    name: "Suvarnabhumi Airport",
    city: "Bangkok",
    country: "Thailand",
  },
  {
    code: "DEL",
    name: "Indira Gandhi International Airport",
    city: "New Delhi",
    country: "India",
  },
  {
    code: "BOM",
    name: "Chhatrapati Shivaji Maharaj International Airport",
    city: "Mumbai",
    country: "India",
  },

  // Australia
  {
    code: "SYD",
    name: "Sydney Kingsford Smith Airport",
    city: "Sydney",
    country: "Australia",
  },
  {
    code: "MEL",
    name: "Melbourne Airport",
    city: "Melbourne",
    country: "Australia",
  },
];

// ============================================================================
// Mock Data: Aircraft Types
// ============================================================================

const AIRCRAFT_TYPES = [
  "Boeing 787-9 Dreamliner",
  "Boeing 777-300ER",
  "Airbus A380-800",
  "Airbus A350-1000",
  "Boeing 737-800",
  "Airbus A320neo",
  "Boeing 787-10 Dreamliner",
  "Airbus A330-300",
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate flight duration based on distance and add some randomness
 */
function calculateFlightDuration(
  origin: Airport,
  destination: Airport,
): number {
  // Simplified distance calculation (not accurate, just for mock data)
  const baseMinutes = 180 + Math.random() * 600; // 3-13 hours base

  // Add variation based on route
  const routeHash = (origin.code + destination.code)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variation = (routeHash % 120) - 60; // -60 to +60 minutes

  return Math.round(baseMinutes + variation);
}

/**
 * Generate a random flight number for an airline
 */
function generateFlightNumber(airlineCode: string): string {
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `${airlineCode}${number}`;
}

/**
 * Calculate price based on various factors
 */
function calculatePrice(
  duration: number,
  cabinClass: string,
  airline: Airline,
  stops: number,
): number {
  let basePrice = 200;

  // Duration factor (longer flights cost more)
  basePrice += (duration / 60) * 50;

  // Cabin class multiplier
  const classMultiplier =
    {
      economy: 1,
      business: 3,
      first: 5,
    }[cabinClass] || 1;

  basePrice *= classMultiplier;

  // Premium airline factor
  const premiumAirlines = ["EY", "EK", "QR", "SQ"];
  if (premiumAirlines.includes(airline.code)) {
    basePrice *= 1.2;
  }

  // Direct flights cost more
  if (stops === 0) {
    basePrice *= 1.15;
  } else {
    basePrice *= 1 - stops * 0.1; // Discount for stops
  }

  // Add some randomness
  basePrice *= 0.9 + Math.random() * 0.2;

  return Math.round(basePrice);
}

/**
 * Generate a connecting flight segment
 */
function generateConnectingSegment(
  origin: Airport,
  destination: Airport,
  departureTime: Date,
  airline: Airline,
): FlightSegmentDetail {
  const duration = Math.floor(
    calculateFlightDuration(origin, destination) * 0.6,
  );
  const arrivalTime = new Date(departureTime.getTime() + duration * 60000);

  return {
    departure: {
      airport: origin,
      dateTime: departureTime,
      terminal: String(Math.floor(Math.random() * 5) + 1),
    },
    arrival: {
      airport: destination,
      dateTime: arrivalTime,
      terminal: String(Math.floor(Math.random() * 5) + 1),
    },
    duration,
    aircraft: AIRCRAFT_TYPES[Math.floor(Math.random() * AIRCRAFT_TYPES.length)],
    operatingAirline: airline,
  };
}

/**
 * Get a random hub airport for connecting flights
 */
function getHubAirport(airline: Airline): Airport {
  const hubs: Record<string, string[]> = {
    EY: ["AUH"],
    EK: ["DXB"],
    QR: ["DOH"],
    BA: ["LHR"],
    LH: ["FRA", "MUC"],
    AF: ["CDG"],
    AA: ["JFK", "ORD", "MIA"],
    UA: ["ORD", "SFO"],
    DL: ["JFK", "LAX"],
    SQ: ["SIN"],
  };

  const airlineHubs = hubs[airline.code] || ["AUH", "DXB", "DOH"];
  const hubCode = airlineHubs[Math.floor(Math.random() * airlineHubs.length)];

  return AIRPORTS.find((a) => a.code === hubCode) || AIRPORTS[0];
}

// ============================================================================
// Main Flight Generation Function
// ============================================================================

/**
 * Generate a single flight option
 */
function generateFlight(
  origin: Airport,
  destination: Airport,
  departureDate: Date,
  cabinClass: string,
  airline: Airline,
  stops: number = 0,
): Flight {
  const segments: FlightSegmentDetail[] = [];

  if (stops === 0) {
    // Direct flight
    const duration = calculateFlightDuration(origin, destination);
    const departureTime = new Date(departureDate);
    departureTime.setHours(Math.floor(Math.random() * 20) + 4); // 4 AM to 11 PM
    departureTime.setMinutes(Math.floor(Math.random() * 12) * 5); // 5-minute intervals

    const arrivalTime = new Date(departureTime.getTime() + duration * 60000);

    segments.push({
      departure: {
        airport: origin,
        dateTime: departureTime,
        terminal: String(Math.floor(Math.random() * 5) + 1),
      },
      arrival: {
        airport: destination,
        dateTime: arrivalTime,
        terminal: String(Math.floor(Math.random() * 5) + 1),
      },
      duration,
      aircraft:
        AIRCRAFT_TYPES[Math.floor(Math.random() * AIRCRAFT_TYPES.length)],
      operatingAirline: airline,
    });
  } else {
    // Connecting flight(s)
    const hub = getHubAirport(airline);

    // First segment: origin to hub
    const firstDepartureTime = new Date(departureDate);
    firstDepartureTime.setHours(Math.floor(Math.random() * 16) + 4); // Earlier departure for connections
    firstDepartureTime.setMinutes(Math.floor(Math.random() * 12) * 5);

    segments.push(
      generateConnectingSegment(origin, hub, firstDepartureTime, airline),
    );

    // Layover time (1-4 hours)
    const layoverMinutes = 60 + Math.floor(Math.random() * 180);
    const secondDepartureTime = new Date(
      segments[0].arrival.dateTime.getTime() + layoverMinutes * 60000,
    );

    // Second segment: hub to destination
    segments.push(
      generateConnectingSegment(hub, destination, secondDepartureTime, airline),
    );
  }

  // Calculate total duration
  const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);

  // Add layover time if connecting
  if (stops > 0) {
    const layoverTime =
      segments[1].departure.dateTime.getTime() -
      segments[0].arrival.dateTime.getTime();
    const layoverMinutes = Math.floor(layoverTime / 60000);
    // Total duration includes layover
  }

  const baseFare = calculatePrice(totalDuration, cabinClass, airline, stops);
  const taxes = Math.round(baseFare * 0.15);
  const fees = Math.round(baseFare * 0.05);

  return {
    id: `${airline.code}-${generateFlightNumber(airline.code)}-${Date.now()}-${Math.random()}`,
    airline,
    flightNumber: generateFlightNumber(airline.code),
    segments,
    price: {
      amount: baseFare + taxes + fees,
      currency: "USD",
      breakdown: {
        baseFare,
        taxes,
        fees,
      },
    },
    cabinClass,
    availableSeats: Math.floor(Math.random() * 50) + 10,
  };
}

/**
 * Generate multiple flight options for a search
 */
export function generateMockFlights(searchCriteria: SearchCriteria): Flight[] {
  const flights: Flight[] = [];
  const { segments, cabinClass } = searchCriteria;

  // Only handle first segment for now (one-way or first leg of round-trip)
  if (segments.length === 0) {
    return flights;
  }

  const segment = segments[0];
  const { origin, destination, departureDate } = segment;

  // Generate 15-25 flight options
  const numFlights = 15 + Math.floor(Math.random() * 11);

  // Mix of direct and connecting flights
  const directFlightCount = Math.floor(numFlights * 0.4); // 40% direct
  const oneStopCount = Math.floor(numFlights * 0.5); // 50% one stop
  const twoStopCount = numFlights - directFlightCount - oneStopCount; // Rest with 2 stops

  // Generate direct flights
  for (let i = 0; i < directFlightCount; i++) {
    const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    flights.push(
      generateFlight(
        origin,
        destination,
        departureDate,
        cabinClass,
        airline,
        0,
      ),
    );
  }

  // Generate one-stop flights
  for (let i = 0; i < oneStopCount; i++) {
    const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    flights.push(
      generateFlight(
        origin,
        destination,
        departureDate,
        cabinClass,
        airline,
        1,
      ),
    );
  }

  // Generate two-stop flights (if any)
  for (let i = 0; i < twoStopCount; i++) {
    const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
    flights.push(
      generateFlight(
        origin,
        destination,
        departureDate,
        cabinClass,
        airline,
        1,
      ),
    );
  }

  // Sort by price (ascending) as per requirement 3.3
  flights.sort((a, b) => a.price.amount - b.price.amount);

  return flights;
}

/**
 * Search airports by query (city, name, or code)
 */
export function searchAirports(query: string): Airport[] {
  const lowerQuery = query.toLowerCase();

  return AIRPORTS.filter(
    (airport) =>
      airport.code.toLowerCase().includes(lowerQuery) ||
      airport.name.toLowerCase().includes(lowerQuery) ||
      airport.city.toLowerCase().includes(lowerQuery) ||
      airport.country.toLowerCase().includes(lowerQuery),
  ).slice(0, 10); // Limit to 10 results
}

/**
 * Get airport by code
 */
export function getAirportByCode(code: string): Airport | undefined {
  return AIRPORTS.find((airport) => airport.code === code);
}
