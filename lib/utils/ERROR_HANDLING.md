# Error Handling System

This document describes the centralized error handling system implemented in the flight booking application.

## Overview

The error handling system provides consistent error handling across the application with:

- **Centralized error handler** for all error types
- **Error boundaries** for React component errors
- **API error handlers** for API route errors
- **Custom hooks** for async error handling in components
- **Type-safe error definitions** with TypeScript

## Error Types

The system handles six types of errors:

### 1. Validation Errors

- **Scope**: User input validation failures
- **HTTP Status**: 400 Bad Request
- **Action**: User corrects input
- **Example**: "Email address is invalid"

### 2. Network Errors

- **Scope**: Connection failures, timeouts
- **HTTP Status**: 503 Service Unavailable
- **Action**: Retry with exponential backoff
- **Example**: "Unable to connect. Please check your internet connection."

### 3. Server Errors

- **Scope**: 500-level HTTP errors, API failures
- **HTTP Status**: 500 Internal Server Error
- **Action**: Retry or contact support
- **Example**: "Something went wrong on our end. Please try again."

### 4. Business Logic Errors

- **Scope**: Invalid operations, unavailable resources
- **HTTP Status**: 409 Conflict
- **Action**: Select alternative or contact support
- **Example**: "This flight is no longer available."

### 5. Payment Errors

- **Scope**: Payment processing failures
- **HTTP Status**: 402 Payment Required
- **Action**: Retry with same or different payment method
- **Example**: "Payment declined. Please check your card details."

### 6. Session Errors

- **Scope**: Session expiration, invalid session
- **HTTP Status**: 401 Unauthorized
- **Action**: Restart booking process
- **Example**: "Your session has expired. Please start a new search."

## Usage

### In Components

#### Using Error Boundary

Wrap components with ErrorBoundary to catch React errors:

```tsx
import { ErrorBoundary } from "@/components/shared";

function MyPage() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

#### Using useAsyncError Hook

Handle async operations with automatic error handling:

```tsx
import { useAsyncError } from "@/lib/hooks/useAsyncError";

function MyComponent() {
  const { error, isLoading, execute, retry } = useAsyncError({
    autoRetry: true,
    maxRetries: 3,
  });

  const handleSearch = async () => {
    const result = await execute(async () => {
      const response = await fetch("/api/flights/search", {
        method: "POST",
        body: JSON.stringify(searchCriteria),
      });

      if (!response.ok) {
        await handleFetchError(response);
      }

      return response.json();
    });

    if (result) {
      // Handle success
    }
  };

  if (error) {
    return (
      <ErrorMessage
        message={error.message}
        retryable={error.retryable}
        onRetry={retry}
      />
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <div>...</div>;
}
```

#### Using useFormError Hook

Handle form validation errors:

```tsx
import { useFormError } from "@/lib/hooks/useAsyncError";

function MyForm() {
  const { fieldErrors, setFieldError, clearFieldError } = useFormError();

  const handleSubmit = async (data) => {
    // Validate
    if (!data.email) {
      setFieldError("email", "Email is required");
      return;
    }

    // Submit
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" onChange={() => clearFieldError("email")} />
      {fieldErrors.email && <InlineFieldError message={fieldErrors.email} />}
    </form>
  );
}
```

### In API Routes

#### Using withErrorHandler

Wrap API route handlers with automatic error handling:

```tsx
import { withErrorHandler } from "@/lib/utils/api-error-handler";
import { createValidationError } from "@/lib/utils/error-handler";

async function handler(request: NextRequest) {
  const body = await request.json();

  // Validate
  if (!body.email) {
    throw createValidationError("Email is required", "email");
  }

  // Process request
  return NextResponse.json({ success: true });
}

export const POST = withErrorHandler(handler);
```

#### Using Error Response Helpers

Create specific error responses:

```tsx
import {
  validationErrorResponse,
  businessErrorResponse,
  serverErrorResponse,
} from "@/lib/utils/api-error-handler";

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.email) {
    return validationErrorResponse("Email is required", "email");
  }

  const flight = await getFlightById(body.flightId);

  if (!flight.available) {
    return businessErrorResponse(
      "This flight is no longer available",
      "FLIGHT_UNAVAILABLE",
    );
  }

  try {
    // Process booking
  } catch (error) {
    return serverErrorResponse("Failed to create booking");
  }
}
```

### Creating Custom Errors

Use helper functions to create typed errors:

```tsx
import {
  createValidationError,
  createNetworkError,
  createServerError,
  createBusinessError,
  createPaymentError,
  createSessionError,
} from "@/lib/utils/error-handler";

// Validation error
throw createValidationError("Invalid email format", "email");

// Network error
throw createNetworkError("Connection timeout", "TIMEOUT");

// Server error
throw createServerError("Database connection failed", 500);

// Business error
throw createBusinessError("Flight no longer available", "FLIGHT_UNAVAILABLE");

// Payment error
throw createPaymentError("Card declined", "CARD_DECLINED");

// Session error
throw createSessionError("Session expired", "EXPIRED");
```

## Error Response Format

All errors return a consistent format:

```typescript
{
  error: {
    type: "validation" | "network" | "server" | "business" | "payment" | "session",
    message: "User-friendly error message",
    field?: "fieldName", // For validation errors
    retryable: boolean,
    action: "correct-input" | "retry" | "select-alternative" | "contact-support" | "restart",
    code?: "ERROR_CODE"
  }
}
```

## Error Logging

Errors are automatically logged in development mode. In production, integrate with an error tracking service:

```tsx
import { errorHandler } from "@/lib/utils/error-handler";

// Create error log
const errorLog = errorHandler.createErrorLog(error, {
  page: "/payment",
  action: "process-payment",
  userId: "user-123",
  sessionId: "session-456",
  bookingReference: "ABC123",
  data: { amount: 1000 },
});

// Send to error tracking service
// await sendToSentry(errorLog);
```

## Best Practices

1. **Always use typed errors**: Use helper functions to create errors with proper types
2. **Provide context**: Include relevant context when logging errors
3. **User-friendly messages**: Never expose technical details to users
4. **Preserve user data**: Maintain form data when displaying errors
5. **Retry logic**: Implement retry for transient errors (network, server)
6. **Error boundaries**: Wrap major sections with error boundaries
7. **Consistent handling**: Use the centralized error handler everywhere

## Testing

Test error handling in your components:

```tsx
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "@/components/shared";

test("displays error boundary on error", () => {
  const ThrowError = () => {
    throw new Error("Test error");
  };

  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>,
  );

  expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  expect(screen.getByTestId("error-boundary-reset")).toBeInTheDocument();
});
```

## Requirements Validation

This error handling system validates the following requirements:

- **14.1**: Display loading indicator when processing requests
- **14.2**: Display error message for network errors
- **14.3**: Display user-friendly error message with retry options for server errors
- **14.4**: Display inline error messages for validation failures
- **14.5**: Maintain user-entered data when displaying errors
