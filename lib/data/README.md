# Mock Flight Data API

This directory contains the mock flight data generator for the Flight Booking System. The mock data is used for development and testing purposes before integrating with a real flight data API.

## Overview

The mock flight data generator creates realistic flight options based on search criteria, including:

- **Multiple airlines**: 10 major airlines (Etihad, Emirates, Qatar Airways, British Airways, etc.)
- **Global airports**: 28 major airports across Middle East, Europe, North America, Asia, and Australia
- **Flight variations**: Direct flights and connecting flights (1-2 stops)
- **Realistic pricing**: Based on distance, cabin class, airline, and number of stops
- **Complete flight details**: Segments, departure/arrival times, aircraft types, terminals

## Files

- `mock-flights.ts` - Main mock data generator with flight and airport functions

## API Endpoints

### Flight Search

**Endpoint**: `POST /api/flights/search`

**Request Body**:

```json
{
  "tripType": "one-way" | "round-trip" | "multi-city",
  "segments": [
    {
      "origin": "JFK",
      "destination": "LHR",
      "departureDate": "2024-06-01"
    }
  ],
  "passengers": {
    "adults": 1,
    "children": 0,
    "infants": 0
  },
  "cabinClass": "economy" | "business" | "first"
}
```

**Response**:

```json
{
  "flights": [
    {
      "id": "EY-EY1234-...",
      "airline": {
        "code": "EY",
        "name": "Etihad Airways",
        "logo": "/airlines/etihad.png"
      },
      "flightNumber": "EY1234",
      "segments": [
        {
          "departure": {
            "airport": {
              "code": "JFK",
              "name": "...",
              "city": "New York",
              "country": "United States"
            },
            "dateTime": "2024-06-01T10:00:00Z",
            "terminal": "4"
          },
          "arrival": {
            "airport": {
              "code": "LHR",
              "name": "...",
              "city": "London",
              "country": "United Kingdom"
            },
            "dateTime": "2024-06-01T22:00:00Z",
            "terminal": "3"
          },
          "duration": 420,
          "aircraft": "Boeing 787-9 Dreamliner"
        }
      ],
      "price": {
        "amount": 850,
        "currency": "USD",
        "breakdown": {
          "baseFare": 700,
          "taxes": 105,
          "fees": 45
        }
      },
      "cabinClass": "economy",
      "availableSeats": 45
    }
  ],
  "searchId": "search-1234567890-abc123",
  "totalResults": 20
}
```

### Airport Search

**Endpoint**: `GET /api/airports/search?q=query`

**Query Parameters**:

- `q` (required): Search query (minimum 2 characters)

**Response**:

```json
{
  "airports": [
    {
      "code": "JFK",
      "name": "John F. Kennedy International Airport",
      "city": "New York",
      "country": "United States"
    }
  ]
}
```

## Functions

### `generateMockFlights(searchCriteria: SearchCriteria): Flight[]`

Generates 15-25 mock flight options based on search criteria.

**Features**:

- 40% direct flights
- 50% one-stop flights
- 10% two-stop flights
- Sorted by price (ascending)
- Realistic pricing based on multiple factors
- Valid departure/arrival times
- Proper layover times for connecting flights

**Example**:

```typescript
import { generateMockFlights } from "@/lib/data/mock-flights";

const flights = generateMockFlights({
  tripType: "one-way",
  segments: [
    {
      origin: {
        code: "JFK",
        name: "...",
        city: "New York",
        country: "United States",
      },
      destination: {
        code: "LHR",
        name: "...",
        city: "London",
        country: "United Kingdom",
      },
      departureDate: new Date("2024-06-01"),
    },
  ],
  passengers: { adults: 1, children: 0, infants: 0 },
  cabinClass: "economy",
});
```

### `searchAirports(query: string): Airport[]`

Searches airports by city, name, or IATA code.

**Features**:

- Case-insensitive search
- Searches across code, name, city, and country
- Returns up to 10 results
- Supports partial matching

**Example**:

```typescript
import { searchAirports } from "@/lib/data/mock-flights";

const airports = searchAirports("London");
// Returns: [{ code: 'LHR', name: 'London Heathrow Airport', ... }]
```

### `getAirportByCode(code: string): Airport | undefined`

Retrieves a specific airport by its IATA code.

**Example**:

```typescript
import { getAirportByCode } from "@/lib/data/mock-flights";

const airport = getAirportByCode("JFK");
// Returns: { code: 'JFK', name: 'John F. Kennedy International Airport', ... }
```

## Data

### Airlines (10 total)

- Etihad Airways (EY)
- Emirates (EK)
- Qatar Airways (QR)
- British Airways (BA)
- Lufthansa (LH)
- Air France (AF)
- American Airlines (AA)
- United Airlines (UA)
- Delta Air Lines (DL)
- Singapore Airlines (SQ)

### Airports (28 total)

**Middle East**: AUH, DXB, DOH, RUH, JED

**Europe**: LHR, CDG, FRA, AMS, MAD, FCO, MUC, ZRH

**North America**: JFK, LAX, ORD, MIA, SFO, YYZ

**Asia**: SIN, HKG, NRT, ICN, BKK, DEL, BOM

**Australia**: SYD, MEL

### Aircraft Types (8 total)

- Boeing 787-9 Dreamliner
- Boeing 777-300ER
- Airbus A380-800
- Airbus A350-1000
- Boeing 737-800
- Airbus A320neo
- Boeing 787-10 Dreamliner
- Airbus A330-300

## Pricing Logic

Flight prices are calculated based on:

1. **Base Price**: $200 starting price
2. **Duration**: +$50 per hour of flight time
3. **Cabin Class**: Economy (1x), Business (3x), First (5x)
4. **Airline**: Premium airlines (EY, EK, QR, SQ) get 20% markup
5. **Stops**: Direct flights get 15% markup, each stop reduces price by 10%
6. **Randomness**: ±10% variation for realistic pricing

**Price Breakdown**:

- Base Fare: Calculated amount
- Taxes: 15% of base fare
- Fees: 5% of base fare
- Total: Base Fare + Taxes + Fees

## Testing

Unit tests are available in `tests/unit/mock-flights.test.ts`:

```bash
npm test tests/unit/mock-flights.test.ts
```

Integration tests for API routes are in `tests/integration/flight-search-api.test.ts`:

```bash
npm test tests/integration/flight-search-api.test.ts
```

## Future Enhancements

When integrating with a real flight data API:

1. Replace `generateMockFlights()` with actual API calls
2. Update `searchAirports()` to use real airport database
3. Add caching layer for frequently searched routes
4. Implement real-time availability checking
5. Add fare class variations (flexible, semi-flexible, non-refundable)
6. Include baggage allowances and fare rules in flight data

## Requirements Validation

This mock data API validates the following requirements:

- **Requirement 1.8**: Flight search returns results within 5 seconds
- **Requirement 2.1-2.4**: Airport autocomplete with 2+ characters
- **Requirement 3.1-3.3**: Flight cards with complete information, sorted by price
- **Requirement 3.4**: Pagination support (20 flights per page)

## Notes

- All times are in UTC
- Prices are in USD
- Flight durations are in minutes
- The mock data includes realistic layover times (1-4 hours) for connecting flights
- Seat availability is randomly generated (10-60 seats)
