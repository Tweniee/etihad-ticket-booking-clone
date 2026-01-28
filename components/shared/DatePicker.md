# DatePicker Component

A fully-featured, accessible date picker component with calendar view and manual input support.

## Features

- ✅ **Interactive Calendar View** (Requirement 18.1)
  - Month navigation with previous/next buttons
  - Visual calendar grid with day-of-week headers
  - Click to select dates
  - "Today" quick selection button

- ✅ **Date Restrictions** (Requirements 18.2, 18.3)
  - Disable past dates
  - Set minimum and maximum selectable dates
  - Visual indication of disabled dates
  - Prevents selection of invalid dates

- ✅ **Visual Feedback** (Requirement 18.4)
  - Highlighted selected date
  - Today's date indicator
  - Hover states for interactive elements
  - Clear visual distinction between enabled/disabled dates

- ✅ **Clear Date Display** (Requirement 18.5)
  - Day of week and date format: "Mon, Jan 15, 2024"
  - Consistent formatting throughout
  - Month and year in calendar header

- ✅ **Manual Input Support** (Requirement 18.6)
  - Type dates directly in multiple formats
  - Supported formats:
    - `MM/DD/YYYY` (e.g., 12/25/2024)
    - `YYYY-MM-DD` (e.g., 2024-12-25)
    - `MMM D, YYYY` (e.g., Dec 25, 2024)
    - `MMMM D, YYYY` (e.g., December 25, 2024)
  - Auto-formatting on blur

- ✅ **Accessibility**
  - Full keyboard navigation
  - ARIA labels and roles
  - Screen reader support
  - Focus management
  - Semantic HTML

## Usage

### Basic Example

```tsx
import { DatePicker } from "@/components/shared";
import { useState } from "react";

function MyComponent() {
  const [date, setDate] = useState<Date | null>(null);

  return (
    <DatePicker
      label="Select a date"
      value={date}
      onChange={setDate}
      placeholder="Choose a date"
    />
  );
}
```

### Disable Past Dates (Requirement 18.2)

```tsx
function DepartureDatePicker() {
  const [date, setDate] = useState<Date | null>(null);
  const today = new Date();

  return (
    <DatePicker
      label="Departure Date"
      value={date}
      onChange={setDate}
      minDate={today}
      placeholder="Select departure date"
    />
  );
}
```

### Round-trip Date Selection (Requirement 18.3)

```tsx
function RoundTripDatePickers() {
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const today = new Date();

  return (
    <>
      <DatePicker
        label="Departure Date"
        value={departureDate}
        onChange={(date) => {
          setDepartureDate(date);
          // Clear return date if it's before new departure date
          if (returnDate && date && returnDate < date) {
            setReturnDate(null);
          }
        }}
        minDate={today}
      />

      <DatePicker
        label="Return Date"
        value={returnDate}
        onChange={setReturnDate}
        minDate={departureDate ? addDays(departureDate, 1) : addDays(today, 1)}
        disabled={!departureDate}
      />
    </>
  );
}
```

### With Validation

```tsx
function ValidatedDatePicker() {
  const [date, setDate] = useState<Date | null>(null);
  const [error, setError] = useState<string>("");

  const handleChange = (newDate: Date | null) => {
    setDate(newDate);
    if (!newDate) {
      setError("Please select a date");
    } else {
      setError("");
    }
  };

  return (
    <DatePicker
      label="Required Date"
      value={date}
      onChange={handleChange}
      error={error}
      required
    />
  );
}
```

### Date Range Restriction

```tsx
function RestrictedDatePicker() {
  const [date, setDate] = useState<Date | null>(null);
  const today = new Date();
  const maxDate = addDays(today, 30);

  return (
    <DatePicker
      label="Select date within next 30 days"
      value={date}
      onChange={setDate}
      minDate={today}
      maxDate={maxDate}
    />
  );
}
```

## Props

| Prop          | Type                           | Default         | Description                                         |
| ------------- | ------------------------------ | --------------- | --------------------------------------------------- |
| `value`       | `Date \| null`                 | -               | The selected date value                             |
| `onChange`    | `(date: Date \| null) => void` | -               | Callback when date is selected                      |
| `minDate`     | `Date`                         | -               | Minimum selectable date (dates before are disabled) |
| `maxDate`     | `Date`                         | -               | Maximum selectable date (dates after are disabled)  |
| `placeholder` | `string`                       | `'Select date'` | Placeholder text for the input                      |
| `label`       | `string`                       | -               | Label for the date picker                           |
| `required`    | `boolean`                      | `false`         | Whether the field is required                       |
| `error`       | `string`                       | -               | Error message to display                            |
| `disabled`    | `boolean`                      | `false`         | Whether the date picker is disabled                 |
| `className`   | `string`                       | -               | Custom class name for the container                 |
| `id`          | `string`                       | -               | ID for the input element                            |
| `name`        | `string`                       | -               | Name for the input element                          |
| `ariaLabel`   | `string`                       | -               | ARIA label for accessibility                        |

## Keyboard Navigation

- **Tab**: Navigate between input and calendar button
- **Enter/Space**: Open calendar (when input is focused)
- **Escape**: Close calendar
- **Arrow Keys**: Navigate calendar (when calendar is open)
- **Tab**: Navigate through calendar controls

## Accessibility Features

### ARIA Attributes

- `aria-label`: Descriptive label for screen readers
- `aria-invalid`: Indicates validation errors
- `aria-describedby`: Links error messages to input
- `aria-selected`: Indicates selected date in calendar
- `role="dialog"`: Calendar popup role
- `role="alert"`: Error message role

### Keyboard Support

- Full keyboard navigation support
- Focus management (calendar opens with focus on current date)
- Escape key closes calendar
- Enter/Space opens calendar

### Visual Indicators

- High contrast colors for better visibility
- Clear focus indicators
- Disabled state styling
- Error state styling with icon

## Styling

The component uses Tailwind CSS classes and can be customized using the `className` prop. The component follows a consistent design system with:

- Blue accent color for selected dates and focus states
- Gray tones for disabled and inactive states
- Red for error states
- Hover states for interactive elements

## Requirements Mapping

| Requirement                         | Implementation                                          |
| ----------------------------------- | ------------------------------------------------------- |
| 18.1 - Interactive calendar picker  | Calendar popup with month navigation and date selection |
| 18.2 - Disable past dates           | `minDate` prop with visual disabled state               |
| 18.3 - Return date after departure  | `minDate` prop set to departure date + 1 day            |
| 18.4 - Highlight selected dates     | Blue background for selected date in calendar           |
| 18.5 - Display day of week and date | Format: "Mon, Jan 15, 2024"                             |
| 18.6 - Manual date entry            | Text input with multiple format support                 |

## Testing

The component includes comprehensive unit tests covering:

- Basic rendering and props
- Calendar interaction
- Date selection
- Past dates disabled
- Date range validation
- Manual input
- Error states
- Disabled states
- Keyboard navigation
- Accessibility features

Run tests with:

```bash
npm test -- DatePicker.test.tsx
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- `react` - UI framework
- `date-fns` - Date manipulation and formatting
- `lucide-react` - Icons
- `@/lib/utils/cn` - Class name utility

## Related Components

- `AutocompleteInput` - For airport selection
- Form components - For complete form integration

## Examples

See `DatePicker.example.tsx` for comprehensive usage examples including:

- Basic usage
- Past dates disabled
- Round-trip date selection
- Date range restriction
- Error states
- Disabled states
- Manual input formats
- Accessibility features
