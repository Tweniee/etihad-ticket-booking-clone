# PriceDisplay Component

A comprehensive price display component with formatted currency and detailed breakdown tooltip.

## Overview

The PriceDisplay component provides a user-friendly way to display prices throughout the flight booking system. It supports multiple currencies, shows per-passenger pricing, and includes an interactive breakdown tooltip that explains how the total price is calculated.

## Features

- **Formatted Currency Display**: Uses `Intl.NumberFormat` for proper currency formatting
- **Breakdown Tooltip**: Interactive tooltip showing detailed price breakdown
- **Per-Passenger Pricing**: Automatically calculates and displays price per person
- **Highlight Animation**: Visual feedback when prices change
- **Multiple Currencies**: Supports USD, EUR, GBP, AED, and other currencies
- **Accessibility**: Full keyboard navigation and ARIA labels
- **Responsive**: Works seamlessly on all device sizes

## Requirements Validated

This component validates the following requirements:

- **Requirement 9.1**: Display base fare, taxes, fees, and extras as separate line items
- **Requirement 9.4**: Display all prices in the user's selected currency
- **Requirement 9.5**: Display price per passenger and total price for all passengers
- **Requirement 19.4**: Display a price breakdown showing how the total is calculated

## Props

| Prop             | Type                                       | Required | Default           | Description                                   |
| ---------------- | ------------------------------------------ | -------- | ----------------- | --------------------------------------------- |
| `amount`         | `number`                                   | Yes      | -                 | Total price amount                            |
| `currency`       | `string`                                   | Yes      | -                 | Currency code (e.g., "USD", "EUR")            |
| `breakdown`      | `PriceBreakdown \| DetailedPriceBreakdown` | No       | -                 | Price breakdown to show in tooltip            |
| `passengerCount` | `number`                                   | No       | -                 | Number of passengers (for per-passenger calc) |
| `showBreakdown`  | `boolean`                                  | No       | `true`            | Whether to show the breakdown tooltip         |
| `size`           | `"small" \| "medium" \| "large"`           | No       | `"medium"`        | Size variant                                  |
| `highlight`      | `boolean`                                  | No       | `false`           | Whether to highlight the price (on change)    |
| `className`      | `string`                                   | No       | `""`              | Additional CSS classes                        |
| `label`          | `string`                                   | No       | -                 | Label to display before the price             |
| `testId`         | `string`                                   | No       | `"price-display"` | Test ID for testing                           |

## Type Definitions

### PriceBreakdown

Simple price breakdown with basic components:

```typescript
interface PriceBreakdown {
  baseFare: number;
  taxes: number;
  fees: number;
}
```

### DetailedPriceBreakdown

Extended breakdown including optional extras:

```typescript
interface DetailedPriceBreakdown {
  baseFare: number;
  taxes: number;
  fees: number;
  seatFees: number;
  extraBaggage: number;
  meals: number;
  insurance: number;
  loungeAccess: number;
  total: number;
}
```

## Usage Examples

### Basic Usage

```tsx
import { PriceDisplay } from "@/components/shared";

function BookingSummary() {
  return <PriceDisplay amount={550.0} currency="USD" />;
}
```

### With Simple Breakdown

```tsx
import { PriceDisplay } from "@/components/shared";

function FlightCard() {
  const breakdown = {
    baseFare: 450.0,
    taxes: 75.5,
    fees: 24.5,
  };

  return (
    <PriceDisplay
      amount={550.0}
      currency="USD"
      breakdown={breakdown}
      label="Total Price"
    />
  );
}
```

### With Per-Passenger Pricing

```tsx
import { PriceDisplay } from "@/components/shared";

function FamilyBooking() {
  const breakdown = {
    baseFare: 1800.0,
    taxes: 302.0,
    fees: 98.0,
  };

  return (
    <PriceDisplay
      amount={2200.0}
      currency="USD"
      breakdown={breakdown}
      passengerCount={4}
      size="large"
      label="Total for Family"
    />
  );
}
```

### With Detailed Breakdown

```tsx
import { PriceDisplay } from "@/components/shared";

function CheckoutSummary() {
  const detailedBreakdown = {
    baseFare: 450.0,
    taxes: 75.5,
    fees: 24.5,
    seatFees: 50.0,
    extraBaggage: 30.0,
    meals: 15.0,
    insurance: 25.0,
    loungeAccess: 40.0,
    total: 710.0,
  };

  return (
    <PriceDisplay
      amount={710.0}
      currency="USD"
      breakdown={detailedBreakdown}
      size="large"
      label="Total Booking Cost"
    />
  );
}
```

### With Highlight Animation

```tsx
import { useState } from "react";
import { PriceDisplay } from "@/components/shared";

function DynamicPricing() {
  const [price, setPrice] = useState(550.0);
  const [highlight, setHighlight] = useState(false);

  const updatePrice = (newPrice: number) => {
    setPrice(newPrice);
    setHighlight(true);
    setTimeout(() => setHighlight(false), 100);
  };

  return <PriceDisplay amount={price} currency="USD" highlight={highlight} />;
}
```

## Size Variants

The component supports three size variants:

- **Small**: `text-sm` - Compact display for cards or lists
- **Medium**: `text-lg` - Default size for general use
- **Large**: `text-2xl font-bold` - Prominent display for checkout or confirmation

## Currency Support

The component uses `Intl.NumberFormat` for proper currency formatting, supporting:

- **USD**: $1,234.56
- **EUR**: €1,234.56
- **GBP**: £1,234.56
- **AED**: AED 1,234.56
- And many more...

If an invalid currency code is provided, it falls back to a simple format: `CURRENCY AMOUNT`.

## Breakdown Tooltip

The breakdown tooltip appears when the user clicks the info icon next to the price. It shows:

### Simple Breakdown

- Base Fare
- Taxes
- Fees
- Total

### Detailed Breakdown

- Base Fare
- Taxes
- Fees
- Seat Fees (if > 0)
- Extra Baggage (if > 0)
- Meals (if > 0)
- Insurance (if > 0)
- Lounge Access (if > 0)
- Total

The tooltip can be closed by:

- Clicking the info icon again
- Clicking outside the tooltip
- Pressing the Escape key

## Accessibility

The component is fully accessible with:

- **ARIA Labels**: Proper labels for screen readers
  - `aria-label` on price amount
  - `aria-label` on per-passenger price
  - `aria-label` on breakdown button
- **ARIA Attributes**:
  - `aria-expanded` to indicate tooltip state
  - `aria-haspopup` to indicate tooltip presence
  - `role="tooltip"` on the breakdown tooltip
- **Keyboard Navigation**: Full keyboard support
  - Tab to focus the breakdown button
  - Enter/Space to open tooltip
  - Escape to close tooltip
- **Focus Management**: Proper focus indicators and management

## Testing

The component includes comprehensive unit tests covering:

- Basic rendering with various props
- Size variants
- Per-passenger pricing calculations
- Price breakdown display (simple and detailed)
- Tooltip interactions (open, close, click outside)
- Highlight animation
- Accessibility features
- Currency formatting
- Edge cases (zero, negative, large amounts)

Run tests with:

```bash
pnpm test tests/unit/PriceDisplay.test.tsx
```

## Example File

See `PriceDisplay.example.tsx` for a complete interactive example demonstrating all features and use cases.

## Implementation Notes

### Currency Formatting

The component uses `Intl.NumberFormat` for currency formatting:

```typescript
new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: currency,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(amount);
```

This ensures proper formatting with:

- Correct currency symbol placement
- Thousands separators
- Two decimal places
- Locale-appropriate formatting

### Highlight Animation

The highlight animation uses a temporary state change:

1. When `highlight` prop becomes `true`, the price turns green
2. After 1 second, the highlight is automatically removed
3. This provides visual feedback when prices change

### Tooltip Positioning

The tooltip is positioned:

- Absolutely positioned relative to the info icon
- Appears below the icon with a small margin
- Right-aligned to prevent overflow on the right side
- Has a z-index of 50 to appear above other content

### Click Outside Detection

The component uses a `useEffect` hook to detect clicks outside the tooltip:

```typescript
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      tooltipRef.current &&
      !tooltipRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setShowTooltip(false);
    }
  }

  if (showTooltip) {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }
}, [showTooltip]);
```

## Best Practices

1. **Always provide currency**: The currency prop is required for proper formatting
2. **Use breakdown for transparency**: Show the breakdown tooltip to help users understand pricing
3. **Show per-passenger pricing**: For multi-passenger bookings, always provide `passengerCount`
4. **Use appropriate size**: Choose the size based on context (small for cards, large for checkout)
5. **Highlight on changes**: Use the `highlight` prop when prices update to draw attention
6. **Provide labels**: Use the `label` prop to clarify what the price represents

## Related Components

- **AutocompleteInput**: For airport selection
- **DatePicker**: For date selection
- **LoadingSpinner**: For loading states
- **ErrorMessage**: For error display

## Future Enhancements

Potential improvements for future versions:

- Support for multiple currencies displayed simultaneously
- Animated transitions between price changes
- Customizable tooltip positioning
- Support for discount codes and promotions
- Price comparison with other options
- Historical price tracking
