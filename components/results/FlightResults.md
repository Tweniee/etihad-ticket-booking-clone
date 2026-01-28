# FlightResults Component

## Overview

The `FlightResults` component displays flight search results with pagination, empty states, loading states, and error handling. It automatically sorts flights by price in ascending order and provides pagination controls for navigating through large result sets.

## Features

- ✅ Display flight cards with pagination (20 per page by default)
- ✅ Automatic price sorting (ascending order)
- ✅ Empty state with helpful message
- ✅ Loading state with spinner
- ✅ Error state with retry option
- ✅ Pagination controls with page numbers
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Keyboard navigation support
- ✅ ARIA labels for accessibility
- ✅ Smooth scrolling on page change

## Requirements Validation

This component validates the following requirements:

- **Requirement 3.3**: Sort results by price in ascending order by default
- **Requirement 3.4**: Display all results with pagination showing 20 flights per page
- **Requirement 3.5**: Display a message indicating no results found when no flights match

## Props

### FlightResultsProps

| Prop               | Type                       | Required | Default            | Description                                |
| ------------------ | -------------------------- | -------- | ------------------ | ------------------------------------------ |
| `flights`          | `Flight[]`                 | Yes      | -                  | Array of flights to display                |
| `searchCriteria`   | `SearchCriteria`           | Yes      | -                  | Search criteria used to find these flights |
| `onSelectFlight`   | `(flight: Flight) => void` | Yes      | -                  | Callback when a flight is selected         |
| `onModifySearch`   | `() => void`               | Yes      | -                  | Callback to modify search                  |
| `isLoading`        | `boolean`                  | No       | `false`            | Whether results are currently loading      |
| `error`            | `string`                   | No       | -                  | Error message if search failed             |
| `onRetry`          | `() => void`               | No       | -                  | Callback to retry search on error          |
| `flightsPerPage`   | `number`                   | No       | `20`               | Number of flights per page                 |
| `selectedFlightId` | `string`                   | No       | -                  | Currently selected flight ID               |
| `className`        | `string`                   | No       | `""`               | Additional CSS classes                     |
| `testId`           | `string`                   | No       | `"flight-results"` | Test ID for testing                        |

## Usage

### Basic Usage

```tsx
import { FlightResults } from "@/components/results";

function SearchResultsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>(...);

  const handleSelectFlight = (flight: Flight) => {
    // Navigate to flight details or continue booking
    router.push(`/flights/${flight.id}`);
  };

  const handleModifySearch = () => {
    // Navigate back to search
    router.push("/search");
  };

  return (
    <FlightResults
      flights={flights}
      searchCriteria={searchCriteria}
      onSelectFlight={handleSelectFlight}
      onModifySearch={handleModifySearch}
    />
  );
}
```

### With Loading State

```tsx
<FlightResults
  flights={flights}
  searchCriteria={searchCriteria}
  onSelectFlight={handleSelectFlight}
  onModifySearch={handleModifySearch}
  isLoading={isSearching}
/>
```

### With Error Handling

```tsx
<FlightResults
  flights={flights}
  searchCriteria={searchCriteria}
  onSelectFlight={handleSelectFlight}
  onModifySearch={handleModifySearch}
  error={searchError}
  onRetry={handleRetrySearch}
/>
```

### With Selected Flight

```tsx
<FlightResults
  flights={flights}
  searchCriteria={searchCriteria}
  onSelectFlight={handleSelectFlight}
  onModifySearch={handleModifySearch}
  selectedFlightId={selectedFlight?.id}
/>
```

### Custom Flights Per Page

```tsx
<FlightResults
  flights={flights}
  searchCriteria={searchCriteria}
  onSelectFlight={handleSelectFlight}
  onModifySearch={handleModifySearch}
  flightsPerPage={10}
/>
```

## States

### Normal State

Displays flight cards with pagination controls when flights are available.

### Empty State

Shows a helpful message with a "Modify Search" button when no flights are found:

- Search icon
- "No flights found" heading
- Helpful message suggesting to adjust search criteria
- "Modify Search" button

### Loading State

Displays a centered loading spinner with "Searching for flights..." text while results are being fetched.

### Error State

Shows an error message with optional retry button when search fails:

- Error icon
- Error message
- "Try Again" button (if `onRetry` is provided)

## Pagination

The component automatically handles pagination:

- **Default**: 20 flights per page
- **Customizable**: Use `flightsPerPage` prop to change
- **Controls**: Previous/Next buttons and page numbers
- **Smart page numbers**: Shows first, last, current, and nearby pages with ellipsis
- **Disabled states**: Previous button disabled on first page, Next button disabled on last page
- **Keyboard accessible**: All pagination controls are keyboard navigable
- **Auto-scroll**: Smoothly scrolls to top when page changes
- **Auto-reset**: Resets to page 1 when flights change

### Pagination Display Logic

- **≤7 pages**: Shows all page numbers
- **>7 pages**: Shows first, last, current, and nearby pages with ellipsis
- **Near start**: Shows pages 1-5 + ellipsis + last
- **Near end**: Shows first + ellipsis + last 5 pages
- **Middle**: Shows first + ellipsis + nearby pages + ellipsis + last

## Sorting

Flights are automatically sorted by price in ascending order (cheapest first) as per Requirement 3.3. This sorting happens automatically and cannot be disabled.

## Accessibility

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Labels**: Proper ARIA labels for pagination controls
- **Screen Reader Support**: Announces current page and total pages
- **Focus Management**: Clear focus indicators on all interactive elements
- **Semantic HTML**: Uses proper semantic elements (`nav`, `button`, etc.)

## Responsive Design

The component is fully responsive:

- **Mobile**: Stacked layout, simplified pagination (no page numbers)
- **Tablet**: Optimized layout with visible page numbers
- **Desktop**: Full layout with all features

## Testing

The component includes comprehensive test IDs:

```tsx
// Main container
data-testid="flight-results"

// Loading state
data-testid="flight-results-loading"
data-testid="flight-results-loading-spinner"

// Error state
data-testid="flight-results-error"
data-testid="flight-results-error-message"

// Empty state
data-testid="flight-results-empty"
data-testid="flight-results-empty-title"
data-testid="flight-results-empty-message"
data-testid="flight-results-modify-search-button"

// Results
data-testid="flight-results-title"
data-testid="flight-results-count"
data-testid="flight-results-list"
data-testid="flight-results-flight-{flightId}"

// Pagination
data-testid="flight-results-pagination"
data-testid="flight-results-pagination-controls"
data-testid="flight-results-previous-button"
data-testid="flight-results-next-button"
data-testid="flight-results-page-{pageNumber}"
```

## Examples

See `FlightResults.example.tsx` for complete examples including:

1. Basic usage with flights
2. Empty state
3. Loading state
4. Error state
5. Pagination with many flights
6. With selected flight
7. Custom flights per page

## Related Components

- **FlightCard**: Individual flight card component
- **LoadingSpinner**: Loading indicator
- **ErrorMessage**: Error display component

## Notes

- Flights are automatically sorted by price (ascending)
- Pagination resets to page 1 when flights change
- Page changes trigger smooth scroll to top
- Empty state provides helpful guidance to users
- All states (loading, error, empty, normal) are handled gracefully
