import { NextResponse } from "next/server";
import {
  AppError,
  errorHandler,
  createValidationError,
  createNetworkError,
  createServerError,
  createBusinessError,
  createPaymentError,
  createSessionError,
} from "./error-handler";

/**
 * API Error Handler
 *
 * Handles errors in API routes and returns appropriate HTTP responses
 *
 * Validates Requirements:
 * - 14.2: Display error message explaining the issue when a network error occurs
 * - 14.3: Display user-friendly error message and provide retry options when a server error occurs
 */

/**
 * Handle API errors and return appropriate NextResponse
 */
export function handleApiError(error: AppError | Error): NextResponse {
  let appError: AppError;

  // Convert to AppError if needed
  if ("type" in error) {
    appError = error;
  } else {
    appError = createServerError(error.message, 500, undefined, error);
  }

  // Get error response
  const errorResponse = errorHandler.handle(appError);

  // Determine HTTP status code
  const statusCode = getStatusCode(appError);

  // Return JSON response
  return NextResponse.json(
    {
      error: {
        type: appError.type,
        message: errorResponse.message,
        field: errorResponse.field,
        retryable: errorResponse.retryable,
        action: errorResponse.action,
        code: appError.code,
      },
    },
    { status: statusCode },
  );
}

/**
 * Get HTTP status code for error type
 */
function getStatusCode(error: AppError): number {
  switch (error.type) {
    case "validation":
      return 400; // Bad Request
    case "network":
      return 503; // Service Unavailable
    case "server":
      return (error as any).statusCode || 500; // Internal Server Error
    case "business":
      return 409; // Conflict
    case "payment":
      return 402; // Payment Required
    case "session":
      return 401; // Unauthorized
    default:
      return 500; // Internal Server Error
  }
}

/**
 * Wrap API route handler with error handling
 */
export function withErrorHandler<
  T extends (...args: any[]) => Promise<NextResponse>,
>(handler: T): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error as Error);
    }
  }) as T;
}

/**
 * Create error response helpers
 */

export function validationErrorResponse(
  message: string,
  field?: string,
): NextResponse {
  const error = createValidationError(message, field || "");
  return handleApiError(error);
}

export function networkErrorResponse(message?: string): NextResponse {
  const error = createNetworkError(message);
  return handleApiError(error);
}

export function serverErrorResponse(
  message?: string,
  statusCode?: number,
): NextResponse {
  const error = createServerError(message, statusCode);
  return handleApiError(error);
}

export function businessErrorResponse(
  message: string,
  code?: string,
): NextResponse {
  const error = createBusinessError(message, code as any);
  return handleApiError(error);
}

export function paymentErrorResponse(
  message: string,
  code?: string,
): NextResponse {
  const error = createPaymentError(message, code as any);
  return handleApiError(error);
}

export function sessionErrorResponse(
  message?: string,
  code?: string,
): NextResponse {
  const error = createSessionError(message, code as any);
  return handleApiError(error);
}

/**
 * Parse and handle fetch errors
 */
export async function handleFetchError(response: Response): Promise<never> {
  let errorData: any;

  try {
    errorData = await response.json();
  } catch {
    errorData = { message: response.statusText };
  }

  // Create appropriate error based on status code
  let error: AppError;

  if (response.status >= 500) {
    error = createServerError(
      errorData.message || "Server error",
      response.status,
    );
  } else if (response.status === 400) {
    error = createValidationError(
      errorData.message || "Validation error",
      errorData.field,
    );
  } else if (response.status === 401 || response.status === 403) {
    error = createSessionError(errorData.message || "Session error");
  } else if (response.status === 402) {
    error = createPaymentError(errorData.message || "Payment error");
  } else if (response.status === 409) {
    error = createBusinessError(errorData.message || "Business logic error");
  } else {
    error = createServerError(
      errorData.message || "Unknown error",
      response.status,
    );
  }

  throw error;
}

/**
 * Validate request body
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: { parse: (data: unknown) => T },
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error: any) {
    if (error.issues) {
      // Zod validation error
      const firstError = error.issues[0];
      throw createValidationError(
        firstError.message,
        firstError.path.join("."),
      );
    }
    throw createValidationError("Invalid request body", "body");
  }
}
