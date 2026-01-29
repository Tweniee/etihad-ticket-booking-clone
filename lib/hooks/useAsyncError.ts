"use client";

import { useState, useCallback } from "react";
import {
  errorHandler,
  AppError,
  ErrorResponse,
  createNetworkError,
  createServerError,
} from "@/lib/utils/error-handler";

/**
 * Hook for handling async errors in components
 *
 * Provides utilities for error handling, loading states, and retry logic
 *
 * Validates Requirements:
 * - 14.1: Display a loading indicator when the system is processing a request
 * - 14.2: Display error message explaining the issue when a network error occurs
 * - 14.3: Display user-friendly error message and provide retry options when a server error occurs
 * - 14.5: Maintain user-entered data when displaying error messages to avoid data loss
 */

interface UseAsyncErrorOptions {
  /**
   * Callback when error occurs
   */
  onError?: (error: AppError, errorResponse: ErrorResponse) => void;

  /**
   * Whether to automatically retry on network errors
   * @default false
   */
  autoRetry?: boolean;

  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;

  /**
   * Delay between retries in milliseconds
   * @default 1000
   */
  retryDelay?: number;
}

interface UseAsyncErrorReturn {
  /**
   * Current error
   */
  error: ErrorResponse | null;

  /**
   * Whether an async operation is in progress
   */
  isLoading: boolean;

  /**
   * Clear the current error
   */
  clearError: () => void;

  /**
   * Execute an async function with error handling
   */
  execute: <T>(
    fn: () => Promise<T>,
    options?: { preserveData?: boolean },
  ) => Promise<T | null>;

  /**
   * Retry the last failed operation
   */
  retry: () => Promise<void>;

  /**
   * Number of retry attempts made
   */
  retryCount: number;
}

export function useAsyncError(
  options: UseAsyncErrorOptions = {},
): UseAsyncErrorReturn {
  const {
    onError,
    autoRetry = false,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  const [error, setError] = useState<ErrorResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastOperation, setLastOperation] = useState<
    (() => Promise<any>) | null
  >(null);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  const handleError = useCallback(
    (err: Error | AppError) => {
      let appError: AppError;

      // Convert to AppError if needed
      if ("type" in err) {
        appError = err;
      } else {
        // Try to determine error type from error properties
        if (err.message.includes("fetch") || err.message.includes("network")) {
          appError = createNetworkError(err.message, undefined, err);
        } else {
          appError = createServerError(err.message, undefined, undefined, err);
        }
      }

      const errorResponse = errorHandler.handle(appError);
      setError(errorResponse);

      // Call custom error handler
      onError?.(appError, errorResponse);

      return errorResponse;
    },
    [onError],
  );

  const executeWithRetry = useCallback(
    async <T>(
      fn: () => Promise<T>,
      currentRetry: number = 0,
    ): Promise<T | null> => {
      try {
        setIsLoading(true);
        const result = await fn();
        setIsLoading(false);
        clearError();
        return result;
      } catch (err) {
        const errorResponse = handleError(err as Error);

        // Auto retry for network errors if enabled
        if (autoRetry && errorResponse.retryable && currentRetry < maxRetries) {
          setRetryCount(currentRetry + 1);
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * (currentRetry + 1)),
          );
          return executeWithRetry(fn, currentRetry + 1);
        }

        setIsLoading(false);
        return null;
      }
    },
    [autoRetry, maxRetries, retryDelay, handleError, clearError],
  );

  const execute = useCallback(
    async <T>(
      fn: () => Promise<T>,
      options?: { preserveData?: boolean },
    ): Promise<T | null> => {
      // Store operation for retry
      setLastOperation(() => fn);

      // Clear previous error unless preserving data
      if (!options?.preserveData) {
        clearError();
      }

      return executeWithRetry(fn);
    },
    [executeWithRetry, clearError],
  );

  const retry = useCallback(async () => {
    if (lastOperation) {
      return execute(lastOperation);
    }
  }, [lastOperation, execute]);

  return {
    error,
    isLoading,
    clearError,
    execute,
    retry,
    retryCount,
  };
}

/**
 * Hook for handling form errors with field-level error tracking
 */

interface UseFormErrorReturn {
  /**
   * Field-level errors
   */
  fieldErrors: Record<string, string>;

  /**
   * General form error
   */
  formError: string | null;

  /**
   * Set error for a specific field
   */
  setFieldError: (field: string, message: string) => void;

  /**
   * Set general form error
   */
  setFormError: (message: string) => void;

  /**
   * Clear error for a specific field
   */
  clearFieldError: (field: string) => void;

  /**
   * Clear all errors
   */
  clearAllErrors: () => void;

  /**
   * Check if form has any errors
   */
  hasErrors: boolean;
}

export function useFormError(): UseFormErrorReturn {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const setFieldErrorHandler = useCallback((field: string, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    setFormError(null);
  }, []);

  const hasErrors = Object.keys(fieldErrors).length > 0 || formError !== null;

  return {
    fieldErrors,
    formError,
    setFieldError: setFieldErrorHandler,
    setFormError,
    clearFieldError,
    clearAllErrors,
    hasErrors,
  };
}
