/**
 * Centralized Error Handler
 *
 * Provides consistent error handling across the application.
 * Handles different error types with appropriate user-facing messages and actions.
 *
 * Validates Requirements:
 * - 14.2: Display error message explaining the issue when a network error occurs
 * - 14.3: Display user-friendly error message and provide retry options when a server error occurs
 * - 14.4: Display inline error messages next to invalid fields when form validation fails
 */

// Error types
export type ErrorType =
  | "validation"
  | "network"
  | "server"
  | "business"
  | "payment"
  | "session"
  | "unknown";

export type ErrorAction =
  | "correct-input"
  | "retry"
  | "select-alternative"
  | "contact-support"
  | "restart";

// Base error interface
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: unknown;
  field?: string;
  originalError?: Error;
}

// Error response interface
export interface ErrorResponse {
  message: string;
  field?: string;
  retryable: boolean;
  action: ErrorAction;
  severity: "error" | "warning" | "info";
}

// Validation error
export interface ValidationError extends AppError {
  type: "validation";
  field: string;
}

// Network error
export interface NetworkError extends AppError {
  type: "network";
  code?: "TIMEOUT" | "CONNECTION_FAILED" | "DNS_ERROR";
}

// Server error
export interface ServerError extends AppError {
  type: "server";
  code?: string;
  statusCode?: number;
}

// Business logic error
export interface BusinessError extends AppError {
  type: "business";
  code?:
    | "FLIGHT_UNAVAILABLE"
    | "SEAT_UNAVAILABLE"
    | "BOOKING_NOT_MODIFIABLE"
    | "INVALID_OPERATION";
}

// Payment error
export interface PaymentError extends AppError {
  type: "payment";
  code?:
    | "CARD_DECLINED"
    | "INSUFFICIENT_FUNDS"
    | "INVALID_CARD"
    | "PROCESSING_ERROR";
}

// Session error
export interface SessionError extends AppError {
  type: "session";
  code?: "EXPIRED" | "INVALID" | "NOT_FOUND";
}

// Error logging interface
export interface ErrorLog {
  timestamp: Date;
  errorType: ErrorType;
  message: string;
  code?: string;
  userId?: string;
  sessionId?: string;
  bookingReference?: string;
  context: {
    page: string;
    action: string;
    data?: unknown;
  };
  stackTrace?: string;
}

/**
 * Centralized Error Handler Class
 *
 * Handles all application errors and provides consistent error responses
 */
export class ErrorHandler {
  /**
   * Handle any application error and return appropriate error response
   */
  handle(error: AppError | Error): ErrorResponse {
    // Convert native Error to AppError if needed
    const appError = this.normalizeError(error);

    // Log the error
    this.logError(appError);

    // Handle based on error type
    switch (appError.type) {
      case "validation":
        return this.handleValidationError(appError as ValidationError);
      case "network":
        return this.handleNetworkError(appError as NetworkError);
      case "server":
        return this.handleServerError(appError as ServerError);
      case "business":
        return this.handleBusinessError(appError as BusinessError);
      case "payment":
        return this.handlePaymentError(appError as PaymentError);
      case "session":
        return this.handleSessionError(appError as SessionError);
      default:
        return this.handleUnknownError(appError);
    }
  }

  /**
   * Handle validation errors
   */
  private handleValidationError(error: ValidationError): ErrorResponse {
    return {
      message: error.message || "Please check your input and try again.",
      field: error.field,
      retryable: true,
      action: "correct-input",
      severity: "error",
    };
  }

  /**
   * Handle network errors
   */
  private handleNetworkError(error: NetworkError): ErrorResponse {
    let message =
      "Unable to connect. Please check your internet connection and try again.";

    if (error.code === "TIMEOUT") {
      message = "Request timed out. Please try again.";
    } else if (error.code === "DNS_ERROR") {
      message = "Unable to reach the server. Please check your connection.";
    }

    return {
      message: error.message || message,
      retryable: true,
      action: "retry",
      severity: "error",
    };
  }

  /**
   * Handle server errors
   */
  private handleServerError(error: ServerError): ErrorResponse {
    // Don't expose technical details to users
    const message =
      error.statusCode && error.statusCode >= 500
        ? "Something went wrong on our end. Please try again in a moment."
        : "We're experiencing technical difficulties. Please try again later.";

    return {
      message: error.message || message,
      retryable: true,
      action: "retry",
      severity: "error",
    };
  }

  /**
   * Handle business logic errors
   */
  private handleBusinessError(error: BusinessError): ErrorResponse {
    let message = error.message;
    let action: ErrorAction = "select-alternative";

    switch (error.code) {
      case "FLIGHT_UNAVAILABLE":
        message =
          message ||
          "This flight is no longer available. Please select another flight.";
        break;
      case "SEAT_UNAVAILABLE":
        message =
          message ||
          "Selected seats are no longer available. Please choose different seats.";
        break;
      case "BOOKING_NOT_MODIFIABLE":
        message =
          message ||
          "This booking cannot be modified due to fare restrictions.";
        action = "contact-support";
        break;
      case "INVALID_OPERATION":
        message = message || "This operation is not allowed.";
        break;
    }

    return {
      message,
      retryable: false,
      action,
      severity: "warning",
    };
  }

  /**
   * Handle payment errors
   */
  private handlePaymentError(error: PaymentError): ErrorResponse {
    let message = error.message;

    switch (error.code) {
      case "CARD_DECLINED":
        message =
          message ||
          "Payment declined. Please check your card details and try again.";
        break;
      case "INSUFFICIENT_FUNDS":
        message =
          message ||
          "Insufficient funds. Please use a different payment method.";
        break;
      case "INVALID_CARD":
        message =
          message || "Invalid card details. Please check and try again.";
        break;
      case "PROCESSING_ERROR":
        message =
          message ||
          "Payment processing failed. Please try again or contact your bank.";
        break;
    }

    return {
      message,
      retryable: true,
      action: "retry",
      severity: "error",
    };
  }

  /**
   * Handle session errors
   */
  private handleSessionError(error: SessionError): ErrorResponse {
    let message = error.message;
    let action: ErrorAction = "restart";

    switch (error.code) {
      case "EXPIRED":
        message =
          message ||
          "Your session has expired due to inactivity. Please start a new search.";
        break;
      case "INVALID":
      case "NOT_FOUND":
        message =
          message ||
          "Your booking session is no longer valid. Please start over.";
        break;
    }

    return {
      message,
      retryable: false,
      action,
      severity: "warning",
    };
  }

  /**
   * Handle unknown errors
   */
  private handleUnknownError(error: AppError): ErrorResponse {
    return {
      message:
        error.message || "An unexpected error occurred. Please try again.",
      retryable: true,
      action: "retry",
      severity: "error",
    };
  }

  /**
   * Normalize any error to AppError format
   */
  private normalizeError(error: AppError | Error): AppError {
    if ("type" in error) {
      return error;
    }

    // Convert native Error to AppError
    return {
      type: "unknown",
      message: error.message,
      originalError: error,
    };
  }

  /**
   * Log error for debugging
   */
  private logError(error: AppError): void {
    // In production, this would send to a logging service
    // For now, just console.error
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorHandler]", {
        type: error.type,
        message: error.message,
        code: error.code,
        details: error.details,
        field: error.field,
        originalError: error.originalError,
      });
    }
  }

  /**
   * Create error log entry
   */
  createErrorLog(
    error: AppError,
    context: {
      page: string;
      action: string;
      data?: unknown;
      userId?: string;
      sessionId?: string;
      bookingReference?: string;
    },
  ): ErrorLog {
    return {
      timestamp: new Date(),
      errorType: error.type,
      message: error.message,
      code: error.code,
      userId: context.userId,
      sessionId: context.sessionId,
      bookingReference: context.bookingReference,
      context: {
        page: context.page,
        action: context.action,
        data: context.data,
      },
      stackTrace: error.originalError?.stack,
    };
  }
}

// Singleton instance
export const errorHandler = new ErrorHandler();

/**
 * Helper functions to create specific error types
 */

export function createValidationError(
  message: string,
  field: string,
  details?: unknown,
): ValidationError {
  return {
    type: "validation",
    message,
    field,
    details,
  };
}

export function createNetworkError(
  message?: string,
  code?: NetworkError["code"],
  originalError?: Error,
): NetworkError {
  return {
    type: "network",
    message: message || "Network error occurred",
    code,
    originalError,
  };
}

export function createServerError(
  message?: string,
  statusCode?: number,
  code?: string,
  originalError?: Error,
): ServerError {
  return {
    type: "server",
    message: message || "Server error occurred",
    statusCode,
    code,
    originalError,
  };
}

export function createBusinessError(
  message: string,
  code?: BusinessError["code"],
  details?: unknown,
): BusinessError {
  return {
    type: "business",
    message,
    code,
    details,
  };
}

export function createPaymentError(
  message: string,
  code?: PaymentError["code"],
  details?: unknown,
): PaymentError {
  return {
    type: "payment",
    message,
    code,
    details,
  };
}

export function createSessionError(
  message?: string,
  code?: SessionError["code"],
): SessionError {
  return {
    type: "session",
    message: message || "Session error occurred",
    code,
  };
}

/**
 * Utility to check if an error is retryable
 */
export function isRetryableError(error: AppError): boolean {
  const response = errorHandler.handle(error);
  return response.retryable;
}

/**
 * Utility to get user-friendly error message
 */
export function getUserErrorMessage(error: AppError | Error): string {
  const response = errorHandler.handle(error);
  return response.message;
}
