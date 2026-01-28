# Mock Flight API Examples

This document provides examples of how to use the mock flight data API in the Flight Booking System.

## Table of Contents

1. [Flight Search Examples](#flight-search-examples)
2. [Airport Search Examples](#airport-search-examples)
3. [Client-Side Usage](#client-side-usage)
4. [Error Handling](#error-handling)

## Flight Search Examples

### Example 1: One-Way Economy Flight

Search for a one-way economy flight from New York (JFK) to London (LHR):

```typescript
const searchCriteria = {
  tripType: "one-way",
  segments: [
    {
      origin: "JFK",
      destination: "LHR",
      departureDate: "2024-06-01",
    },
  ],
  passengers: {
    adults: 1,
    children: 0,
    infants: 0,
  },
  cabinClass: "economy",
};

const response = await fetch("/api/flights/search", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(searchCriteria),
});

const data = await response.json();
console.log(`Found ${data.totalResults} flights`);
console.log(`Search ID: ${data.searchId}`);
```

### Example 2: Round-Trip Business Class

Search for a round-trip business class flight:

```typescript
const searchCriteria = {
  tripType: "round-trip",
  segments: [
    {
      origin: "AUH",
      destination: "CDG",
      departureDate: "2024-07-15",
    },
    {
      origin: "CDG",
      destination: "AUH",
      departureDate: "2024-07-30",
    },
  ],
  passengers: {
    adults: 2,
    children: 0,
    infants: 0,
  },
  cabinClass: "business",
};

const response = await fetch("/api/flights/search", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(searchCriteria),
});

const data = await response.json();
```

### Example 3: Family Travel with Children

Search for a family trip with adults, children, and infants:

```typescript
const searchCriteria = {
  tripType: "one-way",
  segments: [
    {
      origin: "DXB",
      destination: "SYD",
      departureDate: "2024-08-10",
    },
  ],
  passengers: {
    adults: 2,
    children: 2,
    infants: 1,
  },
  cabinClass: "economy",
};

const response = await fetch("/api/flights/search", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(searchCriteria),
});

const data = await response.json();
```

### Example 4: First Class Flight

Search for a luxury first class flight:

```typescript
const searchCriteria = {
  tripType: "one-way",
  segments: [
    {
      origin: "LHR",
      destination: "SIN",
      departureDate: "2024-09-01",
    },
  ],
  passengers: {
    adults: 1,
    children: 0,
    infants: 0,
  },
  cabinClass: "first",
};

const response = await fetch("/api/flights/search", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(searchCriteria),
});

const data = await response.json();
```

## Airport Search Examples

### Example 1: Search by City Name

Search for airports in London:

```typescript
const response = await fetch("/api/airports/search?q=London");
const data = await response.json();

console.log(`Found ${data.airports.length} airports`);
data.airports.forEach((airport) => {
  console.log(`${airport.code} - ${airport.name}, ${airport.city}`);
});
```

### Example 2: Search by IATA Code

Search for a specific airport by code:

```typescript
const response = await fetch("/api/airports/search?q=JFK");
const data = await response.json();

if (data.airports.length > 0) {
  const airport = data.airports[0];
  console.log(`${airport.name} in ${airport.city}, ${airport.country}`);
}
```

### Example 3: Search by Airport Name

Search for airports by name:

```typescript
const response = await fetch("/api/airports/search?q=Heathrow");
const data = await response.json();

console.log(`Found ${data.airports.length} airports matching "Heathrow"`);
```

### Example 4: Autocomplete Implementation

Implement an autocomplete feature with debouncing:

```typescript
import { useState, useEffect } from "react";

function AirportAutocomplete() {
  const [query, setQuery] = useState("");
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only search if query is 2+ characters
    if (query.length < 2) {
      setAirports([]);
      return;
    }

    // Debounce the search
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/airports/search?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setAirports(data.airports);
      } catch (error) {
        console.error("Airport search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search airports..."
      />
      {loading && <div>Loading...</div>}
      <ul>
        {airports.map((airport) => (
          <li key={airport.code}>
            {airport.code} - {airport.name}, {airport.city}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Client-Side Usage

### Using with React Query

```typescript
import { useQuery } from "@tanstack/react-query";

function useFlightSearch(searchCriteria) {
  return useQuery({
    queryKey: ["flights", searchCriteria],
    queryFn: async () => {
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchCriteria),
      });

      if (!response.ok) {
        throw new Error("Flight search failed");
      }

      return response.json();
    },
    enabled: !!searchCriteria.segments.length,
  });
}

// Usage in component
function FlightSearchResults({ searchCriteria }) {
  const { data, isLoading, error } = useFlightSearch(searchCriteria);

  if (isLoading) return <div>Searching for flights...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Found {data.totalResults} flights</h2>
      {data.flights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} />
      ))}
    </div>
  );
}
```

### Using with SWR

```typescript
import useSWR from "swr";

const fetcher = async (url, searchCriteria) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(searchCriteria),
  });

  if (!response.ok) {
    throw new Error("Flight search failed");
  }

  return response.json();
};

function useFlightSearch(searchCriteria) {
  const { data, error, isLoading } = useSWR(
    searchCriteria.segments.length > 0
      ? ["/api/flights/search", searchCriteria]
      : null,
    ([url, criteria]) => fetcher(url, criteria)
  );

  return {
    flights: data?.flights,
    searchId: data?.searchId,
    totalResults: data?.totalResults,
    isLoading,
    error,
  };
}
```

## Error Handling

### Handling API Errors

```typescript
async function searchFlights(searchCriteria) {
  try {
    const response = await fetch("/api/flights/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(searchCriteria),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Flight search failed");
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      console.error("Flight search error:", error.message);
      // Show user-friendly error message
      alert(`Error: ${error.message}`);
    } else {
      console.error("Unknown error:", error);
      alert("An unexpected error occurred");
    }
    throw error;
  }
}
```

### Validation Errors

```typescript
// Example: Missing required fields
const invalidCriteria = {
  tripType: "one-way",
  // Missing segments
  passengers: { adults: 1, children: 0, infants: 0 },
  cabinClass: "economy",
};

const response = await fetch("/api/flights/search", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(invalidCriteria),
});

// Response: 400 Bad Request
// { "error": "At least one flight segment is required" }
```

### Invalid Airport Code

```typescript
const invalidCriteria = {
  tripType: "one-way",
  segments: [
    {
      origin: "INVALID",
      destination: "LHR",
      departureDate: "2024-06-01",
    },
  ],
  passengers: { adults: 1, children: 0, infants: 0 },
  cabinClass: "economy",
};

const response = await fetch("/api/flights/search", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(invalidCriteria),
});

// Response: 400 Bad Request
// { "error": "Invalid origin airport: INVALID" }
```

## Response Structure

### Flight Search Response

```typescript
interface FlightSearchResponse {
  flights: Flight[];
  searchId: string;
  totalResults: number;
}

interface Flight {
  id: string;
  airline: {
    code: string;
    name: string;
    logo: string;
  };
  flightNumber: string;
  segments: FlightSegment[];
  price: {
    amount: number;
    currency: string;
    breakdown: {
      baseFare: number;
      taxes: number;
      fees: number;
    };
  };
  cabinClass: string;
  availableSeats: number;
}

interface FlightSegment {
  departure: {
    airport: Airport;
    dateTime: string; // ISO 8601 format
    terminal?: string;
  };
  arrival: {
    airport: Airport;
    dateTime: string;
    terminal?: string;
  };
  duration: number; // minutes
  aircraft: string;
  operatingAirline?: Airline;
}
```

### Airport Search Response

```typescript
interface AirportSearchResponse {
  airports: Airport[];
}

interface Airport {
  code: string; // IATA code
  name: string;
  city: string;
  country: string;
}
```

## Performance Considerations

1. **Debouncing**: Always debounce airport search inputs (300-500ms recommended)
2. **Caching**: Consider caching flight search results for identical queries
3. **Pagination**: The API returns all results, implement client-side pagination for large result sets
4. **Loading States**: Always show loading indicators during API calls
5. **Error Boundaries**: Wrap API calls in error boundaries to handle failures gracefully

## Testing

### Example Test with Vitest

```typescript
import { describe, it, expect } from "vitest";

describe("Flight Search API", () => {
  it("should return flights for valid search", async () => {
    const searchCriteria = {
      tripType: "one-way",
      segments: [
        {
          origin: "JFK",
          destination: "LHR",
          departureDate: "2024-06-01",
        },
      ],
      passengers: { adults: 1, children: 0, infants: 0 },
      cabinClass: "economy",
    };

    const response = await fetch("http://localhost:3000/api/flights/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(searchCriteria),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.flights).toBeDefined();
    expect(data.flights.length).toBeGreaterThan(0);
  });
});
```

## Notes

- All dates should be in ISO 8601 format (YYYY-MM-DD)
- All times are in UTC
- Prices are in USD
- The mock API includes a 500ms simulated delay to mimic real API behavior
- Flight results are sorted by price in ascending order by default
