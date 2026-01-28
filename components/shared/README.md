# Shared Components

This directory contains reusable UI components used throughout the Flight Booking System.

## Components

### AutocompleteInput

A fully accessible autocomplete input component with debounced search, keyboard navigation, and loading states.

**Features:**

- Debounced search with configurable delay
- Full keyboard navigation support
- Loading states and error handling
- WCAG 2.1 Level AA compliant
- Responsive design

**Validates Requirements:** 2.1, 2.2, 2.3, 2.4

[View Documentation](./AutocompleteInput.md) | [View Example](./AutocompleteInput.example.tsx)

### DatePicker

An accessible date picker component with calendar view, date range selection, and validation.

**Features:**

- Interactive calendar view
- Date range selection
- Disabled dates support
- Manual input option
- Keyboard navigation
- Responsive design

**Validates Requirements:** 18.1, 18.2, 18.3, 18.5, 18.6

[View Documentation](./DatePicker.md) | [View Example](./DatePicker.example.tsx)

### PriceDisplay

A comprehensive price display component with formatted currency and detailed breakdown tooltip.

**Features:**

- Formatted currency display (multiple currencies)
- Interactive breakdown tooltip
- Per-passenger pricing
- Highlight animation on changes
- Full accessibility support
- Responsive design

**Validates Requirements:** 9.1, 9.4, 9.5, 19.4

[View Documentation](./PriceDisplay.md) | [View Example](./PriceDisplay.example.tsx)

## Usage

Import components from the shared module:

```tsx
import {
  AutocompleteInput,
  DatePicker,
  PriceDisplay,
} from "@/components/shared";
```

## Testing

All shared components include comprehensive unit tests. Run tests with:

```bash
# Test all shared components
pnpm test tests/unit/

# Test specific component
pnpm test tests/unit/AutocompleteInput.test.tsx
pnpm test tests/unit/DatePicker.test.tsx
pnpm test tests/unit/PriceDisplay.test.tsx
```

## Design Principles

All shared components follow these principles:

1. **Accessibility First**: WCAG 2.1 Level AA compliance
2. **Responsive**: Mobile-first design approach
3. **Reusable**: Generic and configurable
4. **Tested**: Comprehensive unit test coverage
5. **Documented**: Clear documentation and examples
6. **Type-Safe**: Full TypeScript support

## Component Structure

Each component includes:

- **Component File** (`ComponentName.tsx`): Main implementation
- **Documentation** (`ComponentName.md`): Detailed documentation
- **Example File** (`ComponentName.example.tsx`): Interactive examples
- **Test File** (`tests/unit/ComponentName.test.tsx`): Unit tests

## Contributing

When adding new shared components:

1. Create the component file with proper TypeScript types
2. Add comprehensive documentation
3. Create an example file demonstrating usage
4. Write unit tests covering all functionality
5. Update this README with component information
6. Export the component from `index.ts`
