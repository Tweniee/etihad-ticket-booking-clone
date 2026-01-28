# Shared Components

This directory contains reusable UI components used throughout the Flight Booking System.

## AutocompleteInput

A fully accessible autocomplete input component with debounced search, keyboard navigation, and loading states.

### Features

- **Debounced Search**: Configurable debounce delay to reduce API calls
- **Keyboard Navigation**: Full keyboard support (Arrow keys, Enter, Escape, Tab)
- **Loading States**: Visual feedback during search operations
- **Accessibility**: WCAG 2.1 Level AA compliant with proper ARIA attributes
- **Error Handling**: Displays validation errors and no-results states
- **Responsive**: Works seamlessly on mobile, tablet, and desktop

### Props

| Prop          | Type                                    | Required | Default                | Description                       |
| ------------- | --------------------------------------- | -------- | ---------------------- | --------------------------------- |
| `value`       | `Airport \| null`                       | Yes      | -                      | Currently selected airport        |
| `onChange`    | `(airport: Airport \| null) => void`    | Yes      | -                      | Callback when selection changes   |
| `onSearch`    | `(query: string) => Promise<Airport[]>` | Yes      | -                      | Async function to search airports |
| `placeholder` | `string`                                | No       | `"Search airports..."` | Input placeholder text            |
| `label`       | `string`                                | No       | -                      | Label text for the input          |
| `error`       | `string`                                | No       | -                      | Error message to display          |
| `disabled`    | `boolean`                               | No       | `false`                | Whether the input is disabled     |
| `debounceMs`  | `number`                                | No       | `300`                  | Debounce delay in milliseconds    |
| `minChars`    | `number`                                | No       | `2`                    | Minimum characters before search  |
| `id`          | `string`                                | No       | -                      | HTML id attribute                 |
| `name`        | `string`                                | No       | -                      | HTML name attribute               |
| `required`    | `boolean`                               | No       | `false`                | Whether the field is required     |

### Usage

```tsx
import { useState } from "react";
import { AutocompleteInput } from "@/components/shared";
import { Airport } from "@/lib/types";

function MyComponent() {
  const [airport, setAirport] = useState<Airport | null>(null);

  const searchAirports = async (query: string): Promise<Airport[]> => {
    const response = await fetch(`/api/airports/search?q=${query}`);
    const data = await response.json();
    return data.airports;
  };

  return (
    <AutocompleteInput
      value={airport}
      onChange={setAirport}
      onSearch={searchAirports}
      label="Origin Airport"
      placeholder="Search by city, airport name, or code..."
      required
    />
  );
}
```

### Keyboard Navigation

- **Arrow Down**: Move to next suggestion
- **Arrow Up**: Move to previous suggestion
- **Enter**: Select highlighted suggestion
- **Escape**: Close dropdown
- **Tab**: Close dropdown and move to next field

### Accessibility

The component includes:

- Proper ARIA labels and roles
- `aria-autocomplete="list"` for screen readers
- `aria-expanded` to indicate dropdown state
- `aria-activedescendant` for highlighted item
- `aria-invalid` for error states
- Focus management and keyboard navigation

### Requirements Validated

This component validates the following requirements:

- **Requirement 2.1**: Display autocomplete suggestions after 2 characters
- **Requirement 2.2**: Display airport suggestions with city name, airport name, and IATA code
- **Requirement 2.3**: Support search by city name, airport name, or IATA code
- **Requirement 2.4**: Populate field with selected airport

### Testing

The component includes comprehensive unit tests covering:

- Rendering with various props
- Debounced search functionality
- Keyboard navigation
- Loading and error states
- Accessibility attributes
- User interactions

Run tests with:

```bash
pnpm test tests/unit/AutocompleteInput.test.tsx
```

### Example

See `AutocompleteInput.example.tsx` for a complete working example with mock data.
