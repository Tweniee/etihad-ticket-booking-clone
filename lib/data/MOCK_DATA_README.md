# Mock Airline Data

This directory contains comprehensive mock airline travel data for testing and development.

## Generated Data

### File: `mock-airline-data.json`

Contains realistic flight booking data for 5 users with complete travel history.

## Data Structure

### Users (5 total)

1. **John Doe** - john.doe@example.com
2. **Sarah Smith** - sarah.smith@example.com
3. **Ahmed Ali** - ahmed.ali@example.com
4. **Maria Garcia** - maria.garcia@example.com
5. **David Chen** - david.chen@example.com

**Password for all users:** `password123`

### Per User Data

Each user has:

- **10 flights** spanning the last 2-3 years
- Mix of domestic and international trips
- Various cabin classes (Economy, Premium Economy, Business)
- Different airlines and routes
- Complete booking details including:
  - Booking ID and PNR
  - Flight details (number, aircraft, duration)
  - Departure and arrival information
  - Pricing and payment status
  - Baggage allowance
  - Meal preferences
  - Carbon emissions

### User Statistics

Each user profile includes:

- Total trips count
- Total spend amount
- Favorite airline
- Most visited city
- Preferred cabin class
- Average flight duration
- Frequent flyer program memberships

## Airlines Included

- Emirates (EK)
- Qatar Airways (QR)
- Lufthansa (LH)
- British Airways (BA)
- Air India (AI)
- IndiGo (6E)
- Vistara (UK)
- Delta Airlines (DL)
- United Airlines (UA)
- Singapore Airlines (SQ)
- Iberia (IB)
- Air China (CA)

## Airports Included

- JFK - New York
- LAX - Los Angeles
- LHR - London Heathrow
- DXB - Dubai
- DOH - Doha
- DEL - Delhi
- BOM - Mumbai
- BCN - Barcelona
- MAD - Madrid
- FRA - Frankfurt
- SIN - Singapore
- PEK - Beijing
- PVG - Shanghai

## Regenerating Data

To regenerate the mock data:

```bash
pnpm generate-mock-data
```

This will create fresh random data while maintaining the same structure and user profiles.

## Use Cases

This data supports:

- Testing flight search and booking flows
- User profile and history displays
- Analytics and reporting features
- AI chatbot training and testing
- Demo presentations
- Integration testing

## Data Quality

- All dates are logically consistent
- Arrival times are after departure times
- Currencies match geographical regions
- Cabin classes correlate with ticket prices
- No duplicate booking IDs or PNRs
- Realistic flight durations and routes
- Carbon emissions calculated based on flight duration

## Example Queries

The data supports queries like:

- "Show my last trip"
- "Which airline do I fly most?"
- "How much did I spend last year?"
- "My longest flight?"
- "Trips from India to Europe"
- "Cancelled or refunded flights"
- "Frequent flyer details"
