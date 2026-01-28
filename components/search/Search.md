# Search Component

The Search component provides a comprehensive flight search form with support for one-way, round-trip, and multi-city searches.

## Features

- **Trip Type Selection**: Toggle between one-way, round-trip, and multi-city searches
- **Airport Autocomplete**: Search and select airports with debounced autocomplete
- **Date Selection**: Interactive date pickers with validation
- **Passenger Counter**: Increment/decrement controls for adults, children, and infants
- **Cabin Class Selection**: Choose between Economy, Business, and First Class
- **Form Validation**: Real-time validation with Zod schemas
- **Accessibility**: Full keyboard navigation and ARIA labels
- **Responsive Design**: Works on mobile, tablet, and desktop

## Requirements Validated

- **1.1**: Accepts origin airport, destination airport, and travel dates
- **1.2**: Supports one-way, round-trip, and multi-city trip types
- **1.3**: Requires both departure and return dates for round-trip
- **1.4**: Allows up to 5 flight segments for multi-city
- **1.5**: Accepts passenger counts for adults, children, and infants
- **1.6**: Accepts cabin class selection

## Usage

```tsx
import { Search } from "@/components/search";
import type { SearchCriteria, Airport } from "@/lib/types";

function SearchPage() {
  const handleSearch = (criteria: SearchCriteria) => {
    // Handle search submission
    console.log("Search criteria:", criteria);
  };

  const handleAirportSearch = async (query: string): Promise<Airport[]> => {
    // Fetch airports from API
    const response = await fetch(`/api/airports?q=${query}`);
    return response.json();
  };

  return (
    <Search onSearch={handleSearch} onAirportSearch={handleAirportSearch} />
  );
}
```

## Props

### SearchProps

| Prop              | Type                                                  | Required | Description                             |
| ----------------- | ----------------------------------------------------- | -------- | --------------------------------------- |
| `onSearch`        | `(criteria: SearchCriteria) => void \| Promise<void>` | Yes      | Callback when search is submitted       |
| `onAirportSearch` | `(query: string) => Promise<Airport[]>`               | Yes      | Function to search for airports         |
| `initialValues`   | `Partial<SearchCriteria>`                             | No       | Initial search values for editing       |
| `isLoading`       | `boolean`                                             | No       | Whether the search is currently loading |

## Examples

### Basic Search

```tsx
<Search onSearch={handleSearch} onAirportSearch={handleAirportSearch} />
```

### With Initial Values

```tsx
const initialValues = {
  tripType: "round-trip",
  segments: [
    {
      origin: {
        code: "JFK",
        name: "JFK Airport",
        city: "New York",
        country: "USA",
      },
      destination: {
        code: "LHR",
        name: "Heathrow",
        city: "London",
        country: "UK",
      },
      departureDate: new Date("2024-06-15"),
    },
    {
      origin: { code: "LHR", name: "Heathrow", city: "London", country: "UK" },
      destination: {
        code: "JFK",
        name: "JFK Airport",
        city: "New York",
        country: "USA",
      },
      departureDate: new Date("2024-06-22"),
    },
  ],
  passengers: { adults: 2, children: 1, infants: 0 },
  cabinClass: "business",
};

<Search
  initialValues={initialValues}
  onSearch={handleSearch}
  onAirportSearch={handleAirportSearch}
/>;
```

### With Loading State

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleSearch = async (criteria: SearchCriteria) => {
  setIsLoading(true);
  try {
    await searchFlights(criteria);
  } finally {
    setIsLoading(false);
  }
};

<Search
  onSearch={handleSearch}
  onAirportSearch={handleAirportSearch}
  isLoading={isLoading}
/>;
```

## Validation

The component uses Zod schemas for validation:

- **Trip Type**: Must be "one-way", "round-trip", or "multi-city"
- **Segments**:
  - One-way: Exactly 1 segment
  - Round-trip: Exactly 2 segments, return date must be after departure
  - Multi-city: 1-5 segments
- **Airports**: Must have code, name, city, and country
- **Dates**: Cannot be in the past, return date must be after departure
- **Passengers**:
  - Adults: 1-9
  - Children: 0-9
  - Infants: 0-9 (cannot exceed adults)
  - Total: 1-9 passengers
- **Cabin Class**: Must be "economy", "business", or "first"

## Accessibility

- Full keyboard navigation support
- ARIA labels on all interactive elements
- Screen reader announcements for dynamic content
- Focus management for modals and dropdowns
- High contrast mode support

## Styling

The component uses Tailwind CSS for styling and is fully responsive:

- **Mobile**: Stacked layout with full-width inputs
- **Tablet**: 2-column grid for better space utilization
- **Desktop**: 3-column grid for optimal layout

## Related Components

- [AutocompleteInput](../shared/AutocompleteInput.md) - Airport search input
- [DatePicker](../shared/DatePicker.md) - Date selection
- [ErrorMessage](../shared/ErrorMessage.md) - Error display
- [LoadingSpinner](../shared/LoadingSpinner.md) - Loading indicator
