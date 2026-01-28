# FlightCard Component

## Overview

The `FlightCard` component displays individual flight information in a card format. It shows comprehensive flight details including airline logo, flight times, duration, stops, and price in an accessible and visually appealing layout.

## Features

- **Airline Branding**: Displays airline logo with fallback to airline code
- **Flight Times**: Shows departure and arrival times with airport codes and dates
- **Duration Display**: Formats flight duration in hours and minutes
- **Stops Information**: Clearly indicates direct flights or number of stops
- **Price Display**: Integrates with PriceDisplay component for consistent pricing
- **Interactive**: Clickable card with hover and focus states
- **Accessible**: Full keyboard navigation and screen reader support
- **Responsive**: Adapts layout for mobile and desktop screens

## Requirements Validation

This component validates the following requirements:

- **Requirement 3.1**: Display each flight showing airline, flight number, departure time, arrival time, duration, number of stops, and price
- **Requirement 3.2**: Display airline logos for each flight result

## Usage

### Basic Usage

```tsx
import { FlightCard } from "@/components/results";
import type { Flight } from "@/lib/types";

function FlightResults() {
  const handleSelectFlight = (flight: Flight) => {
    console.log("Selected flight:", flight.id);
    // Navigate to flight details or update state
  };

  return <FlightCard flight={myFlight} onSelect={handleSelectFlight} />;
}
```

### With Selection State

```tsx
import { FlightCard } from "@/components/results";
import { useState } from "react";

function FlightResults({ flights }: { flights: Flight[] }) {
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlightId(flight.id);
  };

  return (
    <div className="space-y-4">
      {flights.map((flight) => (
        <FlightCard
          key={flight.id}
          flight={flight}
          onSelect={handleSelectFlight}
          isSelected={selectedFlightId === flight.id}
        />
      ))}
    </div>
  );
}
```

### With Custom Styling

```tsx
<FlightCard
  flight={myFlight}
  onSelect={handleSelectFlight}
  className="shadow-xl"
  testId="featured-flight"
/>
```

## Props

### `flight` (required)

- **Type**: `Flight`
- **Description**: Flight data to display

The Flight object should contain:

- `id`: Unique flight identifier
- `airline`: Airline information (code, name, logo)
- `flightNumber`: Flight number (e.g., "EY 101")
- `segments`: Array of flight segments with departure/arrival details
- `price`: Price information with breakdown
- `cabinClass`: Cabin class (economy, business, first)
- `availableSeats`: Number of available seats

### `onSelect` (required)

- **Type**: `(flight: Flight) => void`
- **Description**: Callback function when the flight card is clicked or selected via keyboard

### `isSelected` (optional)

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Whether the card is currently selected (applies selected styling)

### `className` (optional)

- **Type**: `string`
- **Default**: `""`
- **Description**: Additional CSS classes to apply to the card

### `testId` (optional)

- **Type**: `string`
- **Default**: `"flight-card"`
- **Description**: Test ID for testing purposes

## Component Structure

```
FlightCard
├── Airline Section
│   ├── Airline Logo (with fallback)
│   ├── Airline Name
│   └── Flight Number
├── Flight Route Section
│   ├── Departure (Time, Airport, Date)
│   ├── Flight Path Visualization
│   │   ├── Duration
│   │   └── Stops
│   └── Arrival (Time, Airport, Date)
└── Price Section
    ├── Price Display (with breakdown)
    ├── Cabin Class
    └── Available Seats
```

## Accessibility

The FlightCard component follows accessibility best practices:

- **Keyboard Navigation**: Fully navigable with Tab key
- **Activation**: Can be activated with Enter or Space key
- **Focus Indicators**: Clear focus ring when focused
- **ARIA Labels**: Descriptive aria-label for screen readers
- **Role**: Uses `role="button"` for semantic meaning
- **Tab Index**: `tabIndex={0}` for keyboard accessibility

### Screen Reader Announcement

When focused, screen readers will announce:

> "Flight [flight number] from [origin] to [destination], [stops info], [currency] [amount]"

Example:

> "Flight EY 101 from AUH to LHR, Direct, USD 1250.00"

## Styling

The component uses Tailwind CSS for styling with the following features:

- **Hover State**: Shadow and border color change on hover
- **Focus State**: Blue ring on keyboard focus
- **Selected State**: Blue border and background tint when selected
- **Responsive**: Stacks vertically on mobile, horizontal on desktop
- **Transitions**: Smooth transitions for interactive states

## Helper Functions

### `calculateTotalDuration(flight: Flight): number`

Calculates the total flight duration by summing all segment durations.

### `calculateStops(flight: Flight): number`

Calculates the number of stops (segments - 1).

### `formatDuration(minutes: number): string`

Formats duration in minutes to human-readable format (e.g., "7h 15m", "45m", "12h").

### `formatTime(date: Date): string`

Formats time in 24-hour format (e.g., "14:30").

### `formatDate(date: Date): string`

Formats date in short format (e.g., "Jun 15").

### `getStopsText(stops: number): string`

Returns human-readable stops text (e.g., "Direct", "1 stop", "2 stops").

## Examples

See `FlightCard.example.tsx` for comprehensive examples including:

- Basic usage
- Multiple flight cards with selection
- Different cabin classes
- Different stop configurations

## Integration with Other Components

### PriceDisplay

The FlightCard uses the `PriceDisplay` component to show flight prices with breakdown tooltips. The price display includes:

- Total price in large format
- Currency formatting
- Price breakdown tooltip
- Cabin class label
- Available seats count

### Date Formatting

Uses `date-fns` library for consistent date and time formatting across the application.

## Testing

The component includes comprehensive test IDs for testing:

- `{testId}`: Main card container
- `{testId}-airline-logo`: Airline logo image
- `{testId}-airline-name`: Airline name text
- `{testId}-flight-number`: Flight number text
- `{testId}-departure-time`: Departure time
- `{testId}-departure-airport`: Departure airport code
- `{testId}-arrival-time`: Arrival time
- `{testId}-arrival-airport`: Arrival airport code
- `{testId}-duration`: Flight duration
- `{testId}-stops`: Number of stops
- `{testId}-price`: Price display component

## Error Handling

### Image Loading Failure

If the airline logo fails to load, the component automatically falls back to displaying the airline code in a styled container.

## Performance Considerations

- **Image Optimization**: Uses standard img tag (can be upgraded to Next.js Image component for optimization)
- **Date Formatting**: Date formatting is done on render (consider memoization for large lists)
- **Event Handlers**: Uses inline handlers (consider useCallback for optimization if needed)

## Future Enhancements

Potential improvements for future iterations:

1. **Segment Details**: Expandable section showing all segments for multi-stop flights
2. **Amenities Icons**: Display flight amenities (WiFi, meals, entertainment)
3. **Baggage Info**: Quick view of baggage allowance
4. **Comparison Mode**: Checkbox for comparing multiple flights
5. **Favorite/Save**: Ability to save flights for later
6. **Price Alerts**: Option to set price alerts for the flight
7. **Carbon Footprint**: Display environmental impact information

## Related Components

- `PriceDisplay`: Used for displaying flight prices
- `FlightResults`: Parent component that displays multiple FlightCards
- `FlightDetails`: Detailed view shown when a flight is selected

## Browser Support

The component works in all modern browsers that support:

- ES6+ JavaScript
- CSS Grid and Flexbox
- CSS Transitions
- ARIA attributes
