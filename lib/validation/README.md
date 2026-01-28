# Validation Schemas

This directory contains Zod validation schemas for the Flight Booking System.

## Overview

All validation schemas are built using [Zod](https://zod.dev/), a TypeScript-first schema validation library. These schemas provide runtime type checking and validation for user inputs throughout the application.

## Search Validation (`search.ts`)

Validates flight search form inputs according to Requirements 1.3, 1.4, and 1.7.

### Schemas

#### `airportSchema`

Validates airport selection with IATA code, name, city, and country.

**Rules:**

- Code must be exactly 3 uppercase letters
- All fields are required

**Example:**

```typescript
import { airportSchema } from "@/lib/validation";

const result = airportSchema.safeParse({
  code: "JFK",
  name: "John F. Kennedy International Airport",
  city: "New York",
  country: "United States",
});
```

#### `departureDateSchema`

Validates departure dates, ensuring they are not in the past.

**Rules:**

- Date cannot be in the past
- Today's date is valid
- Coerces string dates to Date objects

**Validates:** Requirement 18.2 (Past Date Disabling)

#### `passengerCountSchema`

Validates passenger counts for adults, children, and infants.

**Rules:**

- Adults: 1-9 (at least 1 required)
- Children: 0-9
- Infants: 0-9
- Total passengers: 1-9
- Infants cannot exceed adults (each infant needs an accompanying adult)

**Validates:** Requirement 1.5 (Passenger Count Acceptance)

#### `oneWaySearchSchema`

Validates one-way flight searches.

**Rules:**

- Must have exactly 1 flight segment
- Valid passenger counts
- Valid cabin class (economy, business, first)

**Validates:** Requirement 1.2 (Trip Type Support)

#### `roundTripSearchSchema`

Validates round-trip flight searches with additional date validation.

**Rules:**

- Must have exactly 2 flight segments
- Return date must be after departure date
- Return origin must match departure destination
- Return destination must match departure origin
- Valid passenger counts
- Valid cabin class

**Validates:** Requirements 1.3, 18.3 (Round-trip Date Validation)

#### `multiCitySearchSchema`

Validates multi-city flight searches.

**Rules:**

- Must have 1-5 flight segments
- Valid passenger counts
- Valid cabin class

**Validates:** Requirement 1.4 (Multi-city Segment Limits)

#### `searchCriteriaSchema`

Main search validation schema using discriminated union based on trip type.

**Validates:** Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7

### Helper Functions

#### `validateSearchCriteria(data: unknown)`

Validates complete search criteria and returns typed result.

**Returns:** `SafeParseReturnType` with typed data or validation errors

**Example:**

```typescript
import { validateSearchCriteria } from "@/lib/validation";

const result = validateSearchCriteria(formData);
if (result.success) {
  // result.data is typed as SearchCriteriaInput
  console.log(result.data);
} else {
  // result.error contains validation errors
  console.error(result.error.issues);
}
```

#### `validatePassengerCount(data: unknown)`

Validates passenger count data.

#### `validateAirport(data: unknown)`

Validates airport selection data.

#### `validateDepartureDate(data: unknown)`

Validates departure date.

## Type Exports

All schemas export inferred TypeScript types for use in components:

- `AirportInput`
- `FlightSegmentInput`
- `PassengerCountInput`
- `OneWaySearchInput`
- `RoundTripSearchInput`
- `MultiCitySearchInput`
- `SearchCriteriaInput`

## Usage in React Hook Form

These schemas integrate seamlessly with React Hook Form using `@hookform/resolvers/zod`:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { searchCriteriaSchema, type SearchCriteriaInput } from '@/lib/validation';

function SearchForm() {
  const form = useForm<SearchCriteriaInput>({
    resolver: zodResolver(searchCriteriaSchema),
    defaultValues: {
      tripType: 'one-way',
      segments: [{
        origin: null,
        destination: null,
        departureDate: new Date()
      }],
      passengers: {
        adults: 1,
        children: 0,
        infants: 0
      },
      cabinClass: 'economy'
    }
  });

  const onSubmit = (data: SearchCriteriaInput) => {
    // data is fully typed and validated
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  );
}
```

## Testing

All validation schemas have comprehensive unit tests in `tests/unit/validation/search.test.ts`.

Tests cover:

- Valid inputs
- Invalid inputs
- Edge cases
- Boundary values
- Error messages

Run tests with:

```bash
pnpm test tests/unit/validation/search.test.ts
```

## Future Schemas

Additional validation schemas will be added for:

- Passenger information (Task 4.2)
- Payment information (Task 4.3)
- Booking management
- Extras selection

## References

- [Zod Documentation](https://zod.dev/)
- [React Hook Form with Zod](https://react-hook-form.com/get-started#SchemaValidation)
- Design Document: `.kiro/specs/flight-booking-system/design.md`
- Requirements Document: `.kiro/specs/flight-booking-system/requirements.md`
