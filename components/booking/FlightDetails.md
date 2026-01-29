# FlightDetails Component

## Overview

The `FlightDetails` component displays comprehensive flight information including complete itinerary, baggage allowance, fare rules, aircraft amenities, and price breakdown. This component allows users to review all flight details before proceeding with the booking.

## Requirements

- **5.1**: Display detailed itinerary including all segments for connecting flights
- **5.2**: Display baggage allowance for checked bags and carry-on items
- **5.3**: Display fare rules including change fees, cancellation policies, and refund conditions
- **5.4**: Display aircraft type and amenities
- **5.5**: Provide a clear option to proceed with booking

## Props

```typescript
interface FlightDetailsProps {
  flight: FlightDetailsType;
  onContinue: () => void;
  onBack: () => void;
}
```

### `flight`

- **Type**: `FlightDetailsType`
- **Required**: Yes
- **Description**: Complete flight information including segments, baggage, fare rules, and amenities

### `onContinue`

- **Type**: `() => void`
- **Required**: Yes
- **Description**: Callback function when user clicks "Continue to Seat Selection"

### `onBack`

- **Type**: `() => void`
- **Required**: Yes
- **Description**: Callback function when user clicks "Back to Results"

## Features

### 1. Flight Header

- Airline logo and name
- Flight number and cabin class
- Total price per passenger

### 2. Flight Summary

- Origin and destination airports with city names
- Total flight duration
- Number of stops (for connecting flights)

### 3. Itinerary Details

- Expandable/collapsible segments
- Departure and arrival times with full date/time formatting
- Airport names, cities, and countries
- Terminal information (when available)
- Flight duration per segment
- Aircraft type
- Operating airline (for codeshare flights)

### 4. Baggage Allowance

- Checked baggage: quantity, weight, dimensions
- Carry-on baggage: quantity, weight, dimensions

### 5. Aircraft Amenities

- List of available amenities (WiFi, entertainment, power outlets, etc.)
- Visual checkmarks for each amenity

### 6. Fare Rules & Policies

- Expandable/collapsible section
- Refundable status with visual indicator
- Change policy with fees
- Cancellation policy with fees
- Clear messaging for non-changeable/non-refundable fares

### 7. Price Breakdown

- Base fare
- Taxes
- Fees
- Total per passenger

### 8. Action Buttons

- Back to Results
- Continue to Seat Selection

## Usage Example

```tsx
import { FlightDetails } from "@/components/booking";
import { useBookingStore } from "@/lib/store/booking-store";
import { useRouter } from "next/navigation";

export default function FlightDetailsPage() {
  const router = useRouter();
  const selectedFlight = useBookingStore((state) => state.selectedFlight);
  const goToStep = useBookingStore((state) => state.goToStep);

  if (!selectedFlight) {
    router.push("/results");
    return null;
  }

  const handleContinue = () => {
    goToStep("seats");
    router.push("/booking/seats");
  };

  const handleBack = () => {
    router.push("/results");
  };

  return (
    <FlightDetails
      flight={selectedFlight}
      onContinue={handleContinue}
      onBack={handleBack}
    />
  );
}
```

## Styling

The component uses Tailwind CSS for styling with:

- Responsive design (mobile-first approach)
- Card-based layout with shadows
- Color-coded status indicators (green for positive, red for negative)
- Hover effects on interactive elements
- Smooth transitions for expand/collapse animations

## Accessibility

- Semantic HTML structure
- Keyboard navigation support for all interactive elements
- Clear visual hierarchy
- Sufficient color contrast
- Descriptive button labels
- Icon + text combinations for better understanding

## State Management

The component is stateless except for UI interactions:

- `expandedSegment`: Controls which flight segment is expanded
- `showFareRules`: Controls fare rules section visibility

All booking data is managed through the Zustand store.

## Date Formatting

Uses `date-fns` for consistent date/time formatting:

- Full date/time: "Wed, Jan 15, 2024 at 2:30 PM"
- Time only: "2:30 PM"
- Duration: "2h 30m"

## Notes

- The component expects a `FlightDetails` type which extends `Flight` with additional properties
- All segments are displayed in chronological order
- Layover times between segments are not explicitly shown but can be calculated from arrival/departure times
- The component is fully responsive and works on mobile, tablet, and desktop
