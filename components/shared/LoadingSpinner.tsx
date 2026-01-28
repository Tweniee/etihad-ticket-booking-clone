"use client";

import { Loader2 } from "lucide-react";

/**
 * LoadingSpinner Component
 *
 * Displays a consistent loading indicator throughout the application.
 * Used to provide visual feedback during asynchronous operations.
 *
 * Features:
 * - Multiple size variants
 * - Optional loading text
 * - Accessible with ARIA labels
 * - Centered or inline display
 * - Customizable colors
 *
 * Validates Requirements:
 * - 14.1: Display a loading indicator when the System is processing a request
 */

export interface LoadingSpinnerProps {
  /**
   * Size variant
   * @default "medium"
   */
  size?: "small" | "medium" | "large";

  /**
   * Optional loading text to display below spinner
   */
  text?: string;

  /**
   * Whether to center the spinner in its container
   * @default false
   */
  centered?: boolean;

  /**
   * Color variant
   * @default "primary"
   */
  color?: "primary" | "white" | "gray";

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Test ID for testing
   */
  testId?: string;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
}

export function LoadingSpinner({
  size = "medium",
  text,
  centered = false,
  color = "primary",
  className = "",
  testId = "loading-spinner",
  ariaLabel = "Loading",
}: LoadingSpinnerProps) {
  // Size classes for the spinner icon
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  // Color classes for the spinner
  const colorClasses = {
    primary: "text-blue-600",
    white: "text-white",
    gray: "text-gray-600",
  };

  // Text size classes
  const textSizeClasses = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-base",
  };

  const containerClasses = centered
    ? "flex flex-col items-center justify-center"
    : "inline-flex flex-col items-center";

  return (
    <div
      className={`${containerClasses} ${className}`}
      data-testid={testId}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <Loader2
        className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
        aria-hidden="true"
        data-testid={`${testId}-icon`}
      />
      {text && (
        <span
          className={`mt-2 ${textSizeClasses[size]} ${colorClasses[color]}`}
          data-testid={`${testId}-text`}
        >
          {text}
        </span>
      )}
      {/* Screen reader only text */}
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
}

/**
 * FullPageLoadingSpinner Component
 *
 * A full-page loading overlay for major page transitions or operations.
 * Covers the entire viewport with a semi-transparent backdrop.
 */

export interface FullPageLoadingSpinnerProps {
  /**
   * Loading text to display
   */
  text?: string;

  /**
   * Test ID for testing
   */
  testId?: string;
}

export function FullPageLoadingSpinner({
  text = "Loading...",
  testId = "full-page-loading",
}: FullPageLoadingSpinnerProps) {
  return (
    <div
      className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50"
      data-testid={testId}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <LoadingSpinner
        size="large"
        text={text}
        color="primary"
        testId={`${testId}-spinner`}
      />
    </div>
  );
}
