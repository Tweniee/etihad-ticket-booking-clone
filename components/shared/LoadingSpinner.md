# LoadingSpinner Component

A consistent loading indicator component for displaying loading states throughout the application.

## Features

- Multiple size variants (small, medium, large)
- Optional loading text
- Accessible with ARIA labels
- Centered or inline display
- Customizable colors (primary, white, gray)
- Full-page loading overlay variant

## Requirements

**Validates Requirements:**

- 14.1: Display a loading indicator when the System is processing a request

## Usage

### Basic Usage

```tsx
import { LoadingSpinner } from "@/components/shared";

function MyComponent() {
  return <LoadingSpinner />;
}
```

### With Loading Text

```tsx
<LoadingSpinner text="Loading flights..." />
```

### Size Variants

```tsx
<LoadingSpinner size="small" />
<LoadingSpinner size="medium" /> {/* default */}
<LoadingSpinner size="large" />
```

### Color Variants

```tsx
<LoadingSpinner color="primary" /> {/* default - blue */}
<LoadingSpinner color="white" />   {/* for dark backgrounds */}
<LoadingSpinner color="gray" />    {/* subtle loading */}
```

### Centered Display

```tsx
<LoadingSpinner centered text="Loading..." />
```

### Inline Display

```tsx
<p className="flex items-center gap-2">
  Processing <LoadingSpinner size="small" />
</p>
```

### Full Page Loading

```tsx
import { FullPageLoadingSpinner } from "@/components/shared";

function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return <FullPageLoadingSpinner text="Processing payment..." />;
  }

  return <div>Content</div>;
}
```

## Props

### LoadingSpinner

| Prop        | Type                             | Default             | Description                   |
| ----------- | -------------------------------- | ------------------- | ----------------------------- |
| `size`      | `"small" \| "medium" \| "large"` | `"medium"`          | Size of the spinner           |
| `text`      | `string`                         | `undefined`         | Optional loading text         |
| `centered`  | `boolean`                        | `false`             | Whether to center the spinner |
| `color`     | `"primary" \| "white" \| "gray"` | `"primary"`         | Color variant                 |
| `className` | `string`                         | `""`                | Additional CSS classes        |
| `testId`    | `string`                         | `"loading-spinner"` | Test ID for testing           |
| `ariaLabel` | `string`                         | `"Loading"`         | ARIA label for accessibility  |

### FullPageLoadingSpinner

| Prop     | Type     | Default               | Description             |
| -------- | -------- | --------------------- | ----------------------- |
| `text`   | `string` | `"Loading..."`        | Loading text to display |
| `testId` | `string` | `"full-page-loading"` | Test ID for testing     |

## Common Use Cases

### Button Loading State

```tsx
<button disabled className="flex items-center gap-2">
  <LoadingSpinner size="small" color="white" />
  Processing...
</button>
```

### Card Loading State

```tsx
<div className="bg-gray-50 rounded p-8">
  <LoadingSpinner centered text="Loading booking details..." />
</div>
```

### Search Results Loading

```tsx
{
  isSearching && (
    <LoadingSpinner text="Searching for flights..." size="medium" />
  );
}
```

### Page Transition

```tsx
{
  isNavigating && <FullPageLoadingSpinner text="Loading page..." />;
}
```

## Accessibility

- Uses `role="status"` for screen reader announcements
- Includes `aria-live="polite"` for dynamic updates
- Provides customizable `aria-label` for context
- Screen reader only text for additional context
- Spinning animation is marked as `aria-hidden="true"`

## Testing

The component includes comprehensive unit tests covering:

- Default rendering
- Size variants
- Color variants
- Text display
- Centered vs inline display
- Custom props
- Accessibility attributes

Run tests with:

```bash
pnpm test tests/unit/components/LoadingSpinner.test.tsx
```

## Examples

See `LoadingSpinner.example.tsx` for interactive examples of all features and use cases.
