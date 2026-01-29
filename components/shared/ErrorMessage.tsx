"use client";

import {
  AlertCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { useState } from "react";

/**
 * ErrorMessage Component
 *
 * Displays error messages with appropriate styling and actions.
 * Supports different error types and severity levels.
 *
 * Features:
 * - Multiple error types (validation, network, server, business, payment, session)
 * - Severity levels (error, warning, info)
 * - Optional retry action
 * - Dismissible errors
 * - Inline or block display
 * - Accessible with ARIA attributes
 *
 * Validates Requirements:
 * - 14.2: Display an error message explaining the issue when a network error occurs
 * - 14.3: Display a user-friendly error message and provide retry options when a server error occurs
 * - 14.4: Display inline error messages next to invalid fields when form validation fails
 */

export interface ErrorMessageProps {
  /**
   * Error message to display
   */
  message: string;

  /**
   * Error type
   * @default "validation"
   */
  type?:
    | "validation"
    | "network"
    | "server"
    | "business"
    | "payment"
    | "session";

  /**
   * Severity level
   * @default "error"
   */
  severity?: "error" | "warning" | "info";

  /**
   * Whether the error can be retried
   * @default false
   */
  retryable?: boolean;

  /**
   * Callback when retry button is clicked
   */
  onRetry?: () => void;

  /**
   * Whether the error can be dismissed
   * @default false
   */
  dismissible?: boolean;

  /**
   * Callback when error is dismissed
   */
  onDismiss?: () => void;

  /**
   * Display variant
   * @default "block"
   */
  variant?: "inline" | "block" | "banner";

  /**
   * Field name for inline validation errors
   */
  field?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Test ID for testing
   */
  testId?: string;
}

export function ErrorMessage({
  message,
  type = "validation",
  severity = "error",
  retryable = false,
  onRetry,
  dismissible = false,
  onDismiss,
  variant = "block",
  field,
  className = "",
  testId = "error-message",
}: ErrorMessageProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't render if dismissed
  if (isDismissed) {
    return null;
  }

  // Handle dismiss
  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Icon based on severity
  const Icon = {
    error: XCircle,
    warning: AlertTriangle,
    info: AlertCircle,
  }[severity];

  // Color classes based on severity
  const colorClasses = {
    error: {
      container: "bg-red-50 border-red-200",
      icon: "text-red-500",
      text: "text-red-800",
      button: "text-red-600 hover:text-red-800 focus:ring-red-500",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200",
      icon: "text-yellow-500",
      text: "text-yellow-800",
      button: "text-yellow-600 hover:text-yellow-800 focus:ring-yellow-500",
    },
    info: {
      container: "bg-blue-50 border-blue-200",
      icon: "text-blue-500",
      text: "text-blue-800",
      button: "text-blue-600 hover:text-blue-800 focus:ring-blue-500",
    },
  }[severity];

  // Variant-specific classes
  const variantClasses = {
    inline: "text-sm py-1",
    block: "p-4 rounded-md border",
    banner: "p-4 border-l-4",
  };

  // Get user-friendly error title based on type
  const errorTitle = {
    validation: "Validation Error",
    network: "Connection Error",
    server: "Server Error",
    business: "Error",
    payment: "Payment Error",
    session: "Session Error",
  }[type];

  return (
    <div
      className={`${variantClasses[variant]} ${colorClasses.container} ${className}`}
      data-testid={testId}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start">
        {/* Icon */}
        <div className="flex-shrink-0">
          <Icon
            className={`${variant === "inline" ? "w-4 h-4" : "w-5 h-5"} ${colorClasses.icon}`}
            aria-hidden="true"
            data-testid={`${testId}-icon`}
          />
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          {variant !== "inline" && (
            <h3
              className={`text-sm font-medium ${colorClasses.text}`}
              data-testid={`${testId}-title`}
            >
              {errorTitle}
            </h3>
          )}
          <div
            className={`${variant === "inline" ? "text-sm" : "text-sm mt-1"} ${colorClasses.text}`}
            data-testid={`${testId}-message`}
          >
            {field && <span className="font-medium">{field}: </span>}
            {message}
          </div>

          {/* Actions */}
          {(retryable || dismissible) && (
            <div className="mt-3 flex gap-3">
              {retryable && onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className={`inline-flex items-center gap-1 text-sm font-medium ${colorClasses.button} focus:outline-none focus:ring-2 focus:ring-offset-2 rounded`}
                  data-testid={`${testId}-retry-button`}
                  aria-label="Retry action"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Try Again
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={handleDismiss}
              className={`inline-flex rounded-md p-1.5 ${colorClasses.button} focus:outline-none focus:ring-2 focus:ring-offset-2`}
              data-testid={`${testId}-dismiss-button`}
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * InlineFieldError Component
 *
 * A specialized error message component for form field validation errors.
 * Displays below form inputs with minimal styling.
 */

export interface InlineFieldErrorProps {
  /**
   * Error message
   */
  message: string;

  /**
   * Field ID for accessibility
   */
  fieldId?: string;

  /**
   * Test ID for testing
   */
  testId?: string;
}

export function InlineFieldError({
  message,
  fieldId,
  testId = "field-error",
}: InlineFieldErrorProps) {
  return (
    <p
      id={fieldId ? `${fieldId}-error` : undefined}
      className="mt-1 text-sm text-red-600 flex items-center gap-1"
      role="alert"
      data-testid={testId}
    >
      <XCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
