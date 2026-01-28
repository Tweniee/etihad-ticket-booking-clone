# ErrorMessage Component

A comprehensive error message component for displaying errors with appropriate styling and actions.

## Features

- Multiple error types (validation, network, server, business, payment, session)
- Severity levels (error, warning, info)
- Optional retry action
- Dismissible errors
- Inline or block display variants
- Accessible with ARIA attributes
- Specialized inline field error component

## Requirements

**Validates Requirements:**

- 14.2: Display an error message explaining the issue when a network error occurs
- 14.3: Display a user-friendly error message and provide retry options when a server error occurs
- 14.4: Display inline error messages next to invalid fields when form validation fails

## Usage

### Basic Usage

```tsx
import { ErrorMessage } from "@/components/shared";

function MyComponent() {
  return <ErrorMessage message="An error occurred" />;
}
```

### Error Types

```tsx
<ErrorMessage message="Please enter a valid email" type="validation" />
<ErrorMessage message="Connection failed" type="network" />
<ErrorMessage message="Server error occurred" type="server" />
<ErrorMessage message="Flight unavailable" type="business" />
<ErrorMessage message="Payment declined" type="payment" />
<ErrorMessage message="Session expired" type="session" />
```

### Severity Levels

```tsx
<ErrorMessage message="Critical error" severity="error" />
<ErrorMessage message="Warning message" severity="warning" />
<ErrorMessage message="Information" severity="info" />
```

### Retryable Errors

```tsx
<ErrorMessage
  message="Failed to load data"
  type="network"
  retryable
  onRetry={() => refetchData()}
/>
```

### Dismissible Errors

```tsx
<ErrorMessage
  message="This can be dismissed"
  dismissible
  onDismiss={() => console.log("Dismissed")}
/>
```

### Display Variants

```tsx
<ErrorMessage message="Inline error" variant="inline" />
<ErrorMessage message="Block error" variant="block" /> {/* default */}
<ErrorMessage message="Banner error" variant="banner" />
```

### Inline Field Errors

```tsx
import { InlineFieldError } from "@/components/shared";

<div>
  <input
    id="email"
    type="email"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <InlineFieldError
    message="Please enter a valid email address"
    fieldId="email"
  />
</div>;
```

## Props

### ErrorMessage

| Prop          | Type                                                                            | Default           | Description                    |
| ------------- | ------------------------------------------------------------------------------- | ----------------- | ------------------------------ |
| `message`     | `string`                                                                        | _required_        | Error message to display       |
| `type`        | `"validation" \| "network" \| "server" \| "business" \| "payment" \| "session"` | `"error"`         | Error type                     |
| `severity`    | `"error" \| "warning" \| "info"`                                                | `"error"`         | Severity level                 |
| `retryable`   | `boolean`                                                                       | `false`           | Whether error can be retried   |
| `onRetry`     | `() => void`                                                                    | `undefined`       | Retry callback                 |
| `dismissible` | `boolean`                                                                       | `false`           | Whether error can be dismissed |
| `onDismiss`   | `() => void`                                                                    | `undefined`       | Dismiss callback               |
| `variant`     | `"inline" \| "block" \| "banner"`                                               | `"block"`         | Display variant                |
| `field`       | `string`                                                                        | `undefined`       | Field name for inline errors   |
| `className`   | `string`                                                                        | `""`              | Additional CSS classes         |
| `testId`      | `string`                                                                        | `"error-message"` | Test ID for testing            |

### InlineFieldError

| Prop      | Type     | Default         | Description                |
| --------- | -------- | --------------- | -------------------------- |
| `message` | `string` | _required_      | Error message              |
| `fieldId` | `string` | `undefined`     | Field ID for accessibility |
| `testId`  | `string` | `"field-error"` | Test ID for testing        |

## Common Use Cases

### Form Validation Error

```tsx
<ErrorMessage
  message="Please correct the errors below"
  type="validation"
  severity="error"
/>
```

### Network Error with Retry

```tsx
<ErrorMessage
  message="Failed to load flights. Please try again."
  type="network"
  retryable
  onRetry={refetch}
/>
```

### Payment Error

```tsx
<ErrorMessage
  message="Payment could not be processed. Please verify your card details."
  type="payment"
  severity="error"
  retryable
  onRetry={retryPayment}
/>
```

### Session Timeout Warning

```tsx
<ErrorMessage
  message="Your session will expire in 2 minutes"
  type="session"
  severity="warning"
  variant="banner"
/>
```

### Field Validation

```tsx
<div>
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    className={errors.email ? "border-red-300" : "border-gray-300"}
    aria-invalid={!!errors.email}
    aria-describedby="email-error"
  />
  {errors.email && (
    <InlineFieldError message={errors.email.message} fieldId="email" />
  )}
</div>
```

## Error Type Mapping

| Type         | Title            | Use Case                                           |
| ------------ | ---------------- | -------------------------------------------------- |
| `validation` | Validation Error | Form input validation failures                     |
| `network`    | Connection Error | Network connectivity issues                        |
| `server`     | Server Error     | 500-level server errors                            |
| `business`   | Error            | Business logic errors (e.g., unavailable resource) |
| `payment`    | Payment Error    | Payment processing failures                        |
| `session`    | Session Error    | Session expiration or invalid state                |

## Accessibility

- Uses `role="alert"` for immediate screen reader announcements
- Includes `aria-live="assertive"` for critical errors
- Provides `aria-atomic="true"` for complete message reading
- Icons are marked as `aria-hidden="true"`
- Buttons have proper `aria-label` attributes
- Field errors associate with inputs via `aria-describedby`

## Testing

The component includes comprehensive unit tests covering:

- Error types and titles
- Severity levels and colors
- Retry functionality
- Dismiss functionality
- Display variants
- Field-specific errors
- Accessibility attributes

Run tests with:

```bash
pnpm test tests/unit/components/ErrorMessage.test.tsx
```

## Examples

See `ErrorMessage.example.tsx` for interactive examples of all features and use cases.
