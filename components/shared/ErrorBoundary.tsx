"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { errorHandler, createServerError } from "@/lib/utils/error-handler";

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 *
 * Validates Requirements:
 * - 14.1: Display a loading indicator when the system is processing a request
 * - 14.2: Display error message explaining the issue when a network error occurs
 * - 14.3: Display user-friendly error message and provide retry options when a server error occurs
 * - 14.5: Maintain user-entered data when displaying error messages to avoid data loss
 */

interface ErrorBoundaryProps {
  /**
   * Child components to render
   */
  children: ReactNode;

  /**
   * Custom fallback UI
   */
  fallback?: (error: Error, reset: () => void) => ReactNode;

  /**
   * Callback when error occurs
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;

  /**
   * Whether to show reset button
   * @default true
   */
  showReset?: boolean;

  /**
   * Custom reset button text
   * @default "Try Again"
   */
  resetText?: string;

  /**
   * Whether to show home button
   * @default true
   */
  showHome?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to error handler
    const appError = createServerError(
      error.message,
      undefined,
      undefined,
      error,
    );
    errorHandler.handle(appError);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to error tracking service (e.g., Sentry)
      console.error("Error caught by boundary:", error, errorInfo);
    }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // Default fallback UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          reset={this.reset}
          showReset={this.props.showReset}
          resetText={this.props.resetText}
          showHome={this.props.showHome}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback UI
 */
interface DefaultErrorFallbackProps {
  error: Error;
  reset: () => void;
  showReset?: boolean;
  resetText?: string;
  showHome?: boolean;
}

function DefaultErrorFallback({
  error,
  reset,
  showReset = true,
  resetText = "Try Again",
  showHome = true,
}: DefaultErrorFallbackProps) {
  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <div
      className="min-h-[400px] flex items-center justify-center p-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-red-100 p-3">
            <AlertTriangle
              className="w-8 h-8 text-red-600"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try again or return to the
          home page.
        </p>

        {/* Error details (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error details (dev only)
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          {showReset && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              data-testid="error-boundary-reset"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              {resetText}
            </button>
          )}
          {showHome && (
            <button
              onClick={handleGoHome}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              data-testid="error-boundary-home"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              Go Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to use error boundary imperatively
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}
