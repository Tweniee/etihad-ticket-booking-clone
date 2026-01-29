# FilterSidebar Component

## Overview

The `FilterSidebar` component provides comprehensive filtering options for flight search results. It allows users to narrow down flight options based on multiple criteria including price, duration, stops, airlines, and departure times.

## Features

- **Price Range Filter**: Dual-slider for minimum and maximum price
- **Duration Filter**: Dual-slider for flight duration range
- **Stops Filter**: Checkboxes for direct, 1 stop, and 2+ stops
- **Airlines Filter**: Multi-select checkboxes for available airlines
- **Departure Time Filter**: Time range selection (morning, afternoon, evening, night)
- **AND Logic**: All filters are applied using AND logic (Requirement 4.3)
- **Active Filter Count**: Displays number of active filters (Requirement 4.4)
- **Clear All**: Button to reset all filters (Requirement 4.5)
- **Collapsible Sections**: Each filter section can be expanded/collapsed
- **Responsive Design**: Mobile-friendly with slide-in overlay
- **Real-time Updates**: Filters update results within 1 second (Requirement 4.2)

## Requirements Validated

- **4.1**: Provide filters for price range, flight duration, number of stops, airlines, and departure time ranges
- **4.2**: Update results within 1 second to show only matching flights
- **4.3**: Apply all filters using AND logic
- **4.4**: Display the count of active filters
- **4.5**: Provide a clear all filters option
- **4.6**: Display a message indicating no flights match the selected filters

## Usage

### Basic Usage

```tsx
import {
  FilterSidebar,
  getInitialFilters,
  type FlightFilters,
} from "@/components/results";
import { useState } from "react";

function FlightResultsPage() {
  const [filters, setFilters] = useState<FlightFilters>(() =>
    getInitialFilters(flights),
  );

  return (
    <FilterSidebar
      flights={flights}
      filters={filters}
      onFiltersChange={setFilters}
    />
  );
}
```

### With Filtered Results

```tsx
import {
  FilterSidebar,
  applyFilters,
  getInitialFilters,
} from "@/components/results";
import { useState, useMemo } from "react";

function FlightResultsPage() {
  const [filters, setFilters] = useState(() => getInitialFilters(flights));

  const filteredFlights = useMemo(
    () => applyFilters(flights, filters),
    [flights, filters],
  );

  return (
    <div className="flex gap-6">
      <FilterSidebar
        flights={flights}
        filters={filters}
        onFiltersChange={setFilters}
      />
      <FlightList flights={filteredFlights} />
    </div>
  );
}
```

### Mobile with Overlay

```tsx
function MobileFlightResults() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState(() => getInitialFilters(flights));

  return (
    <>
      <button onClick={() => setIsFilterOpen(true)}>Show Filters</button>

      <FilterSidebar
        flights={flights}
        filters={filters}
        onFiltersChange={setFilters}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </>
  );
}
```

## Props

### FilterSidebarProps

| Prop              | Type                               | Required | Default            | Description                        |
| ----------------- | ---------------------------------- | -------- | ------------------ | ---------------------------------- |
| `flights`         | `Flight[]`                         | Yes      | -                  | All available flights (unfiltered) |
| `filters`         | `FlightFilters`                    | Yes      | -                  | Current active filters             |
| `onFiltersChange` | `(filters: FlightFilters) => void` | Yes      | -                  | Callback when filters change       |
| `isOpen`          | `boolean`                          | No       | `true`             | Whether sidebar is open (mobile)   |
| `onClose`         | `() => void`                       | No       | -                  | Callback to close sidebar (mobile) |
| `className`       | `string`                           | No       | `""`               | Additional CSS classes             |
| `testId`          | `string`                           | No       | `"filter-sidebar"` | Test ID for testing                |

### FlightFilters

```typescript
interface FlightFilters {
  priceRange: {
    min: number;
    max: number;
  };
  durationRange: {
    min: number; // minutes
    max: number; // minutes
  };
  stops: number[]; // e.g., [0, 1, 2] for direct, 1 stop, 2+ stops
  airlines: string[]; // airline codes
  departureTimeRanges: string[]; // e.g., ['morning', 'afternoon']
}
```

## Helper Functions

### `applyFilters(flights: Flight[], filters: FlightFilters): Flight[]`

Applies all filters to the flight list using AND logic. Returns only flights that match ALL filter criteria.

```tsx
const filteredFlights = applyFilters(allFlights, filters);
```

### `getInitialFilters(flights: Flight[]): FlightFilters`

Creates initial filter state with full ranges and no selections.

```tsx
const initialFilters = getInitialFilters(flights);
```

## Filter Types

### Price Range Filter

- Dual-slider for min/max price
- Automatically calculates range from available flights
- Displays current selected range

### Duration Filter

- Dual-slider for min/max duration
- Duration shown in hours and minutes format
- Calculates total duration for multi-segment flights

### Stops Filter

- **Direct**: Non-stop flights (0 stops)
- **1 Stop**: Flights with one connection
- **2+ Stops**: Flights with two or more connections

### Airlines Filter

- Multi-select checkboxes
- Automatically populated from available flights
- Sorted alphabetically by airline name
- Scrollable list for many airlines

### Departure Time Filter

- **Morning**: 6:00 AM - 12:00 PM
- **Afternoon**: 12:00 PM - 6:00 PM
- **Evening**: 6:00 PM - 10:00 PM
- **Night**: 10:00 PM - 6:00 AM

## Accessibility

- All filter controls are keyboard accessible
- Proper ARIA labels for screen readers
- Focus management for collapsible sections
- Clear visual feedback for active filters

## Responsive Behavior

### Desktop (lg and above)

- Sticky sidebar that stays visible while scrolling
- Always visible, no overlay

### Mobile (below lg)

- Slide-in overlay from left
- Full-screen filter panel
- Close button in header
- Backdrop overlay to close

## Styling

The component uses Tailwind CSS for styling with the following key classes:

- `bg-white rounded-lg border border-gray-200 p-6` - Main container
- `lg:sticky lg:top-4` - Sticky positioning on desktop
- `fixed lg:relative` - Fixed on mobile, relative on desktop
- Smooth transitions for mobile slide-in

## Examples

### Filter by Price and Airline

```tsx
const filters: FlightFilters = {
  priceRange: { min: 0, max: 500 },
  durationRange: { min: 0, max: 1440 },
  stops: [],
  airlines: ["AA", "BA"],
  departureTimeRanges: [],
};

const filtered = applyFilters(flights, filters);
// Returns only AA and BA flights under $500
```

### Filter by Direct Flights in Morning

```tsx
const filters: FlightFilters = {
  priceRange: { min: 0, max: 1000 },
  durationRange: { min: 0, max: 1440 },
  stops: [0], // Direct only
  airlines: [],
  departureTimeRanges: ["morning"],
};

const filtered = applyFilters(flights, filters);
// Returns only direct flights departing 6am-12pm
```

## Testing

The component includes comprehensive unit tests covering:

- Filter rendering
- Active filter count display
- Filter interactions (checkboxes, sliders)
- Clear all functionality
- Filter application with AND logic
- Edge cases (no matches, empty filters)

Run tests:

```bash
npm test -- FilterSidebar.test.tsx
```

## Performance

- Filters are applied using `useMemo` for efficient re-computation
- Only re-filters when flights or filter values change
- Collapsible sections reduce DOM size
- Efficient filter algorithms with early returns

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled for interactivity
