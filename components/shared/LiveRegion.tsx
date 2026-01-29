/**
 * LiveRegion Component
 *
 * ARIA live region for announcing dynamic content changes to screen readers.
 * Used for search results updates, price changes, error messages, and other dynamic content.
 *
 * Validates Requirements:
 * - 15.5: Announce page changes and dynamic content updates to screen readers
 */

"use client";

import React, { useEffect, useRef } from "react";

export interface LiveRegionProps {
  /**
   * Message to announce to screen readers
   */
  message: string;

  /**
   * Priority level for announcements
   * - "polite": Wait for user to finish current activity
   * - "assertive": Interrupt user immediately
   * @default "polite"
   */
  priority?: "polite" | "assertive";

  /**
   * Whether to clear the message after announcing
   * @default true
   */
  clearAfterAnnounce?: boolean;

  /**
   * Delay before clearing the message (ms)
   * @default 1000
   */
  clearDelay?: number;

  /**
   * Whether the entire region should be announced when changed
   * @default true
   */
  atomic?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Test ID for testing
   */
  testId?: string;
}

/**
 * LiveRegion Component
 *
 * Provides an ARIA live region for announcing dynamic content changes.
 * The component is visually hidden but accessible to screen readers.
 */
export function LiveRegion({
  message,
  priority = "polite",
  clearAfterAnnounce = true,
  clearDelay = 1000,
  atomic = true,
  className = "",
  testId = "live-region",
}: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = React.useState(message);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Update the message
    setCurrentMessage(message);

    // Clear the message after delay if enabled
    if (clearAfterAnnounce && message) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setCurrentMessage("");
      }, clearDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfterAnnounce, clearDelay]);

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      className={`sr-only ${className}`}
      data-testid={testId}
    >
      {currentMessage}
    </div>
  );
}

/**
 * useLiveRegion Hook
 *
 * Custom hook for managing live region announcements.
 * Returns a function to announce messages and the current message.
 */
export function useLiveRegion(priority: "polite" | "assertive" = "polite"): {
  announce: (message: string) => void;
  message: string;
  LiveRegionComponent: React.FC;
} {
  const [message, setMessage] = React.useState("");

  const announce = React.useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

  const LiveRegionComponent = React.useCallback(
    () => <LiveRegion message={message} priority={priority} />,
    [message, priority],
  );

  return { announce, message, LiveRegionComponent };
}

export default LiveRegion;
