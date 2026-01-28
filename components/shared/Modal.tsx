"use client";

import { useEffect, useRef, ReactNode } from "react";
import { X } from "lucide-react";

/**
 * Modal Component
 *
 * An accessible dialog component for displaying content in an overlay.
 * Implements proper focus management and keyboard navigation.
 *
 * Features:
 * - Focus trap (keeps focus within modal)
 * - Close on Escape key
 * - Close on backdrop click (optional)
 * - Accessible with ARIA attributes
 * - Multiple size variants
 * - Customizable header and footer
 * - Scroll handling for long content
 *
 * Validates Requirements:
 * - 15.2: Provide keyboard navigation for all interactive elements
 * - 15.3: Provide ARIA labels for all form inputs and interactive components
 */

export interface ModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Callback when modal should close
   */
  onClose: () => void;

  /**
   * Modal title
   */
  title?: string;

  /**
   * Modal content
   */
  children: ReactNode;

  /**
   * Optional footer content (typically action buttons)
   */
  footer?: ReactNode;

  /**
   * Size variant
   * @default "medium"
   */
  size?: "small" | "medium" | "large" | "full";

  /**
   * Whether clicking the backdrop closes the modal
   * @default true
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether the close button is shown
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Whether the modal can be closed (affects Escape key and backdrop click)
   * @default true
   */
  closeable?: boolean;

  /**
   * Additional CSS classes for the modal content
   */
  className?: string;

  /**
   * Test ID for testing
   */
  testId?: string;

  /**
   * ARIA label for the modal
   */
  ariaLabel?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "medium",
  closeOnBackdropClick = true,
  showCloseButton = true,
  closeable = true,
  className = "",
  testId = "modal",
  ariaLabel,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Size classes
  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-lg",
    large: "max-w-2xl",
    full: "max-w-full mx-4",
  };

  // Handle Escape key
  useEffect(() => {
    if (!isOpen || !closeable) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, closeable, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the modal
      modalRef.current?.focus();

      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      // Restore focus to previous element
      previousActiveElement.current?.focus();

      // Restore body scroll
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      closeable &&
      closeOnBackdropClick &&
      event.target === event.currentTarget
    ) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      data-testid={testId}
      aria-labelledby={title ? `${testId}-title` : undefined}
      aria-label={ariaLabel || title}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
        data-testid={`${testId}-backdrop`}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal content */}
        <div
          ref={modalRef}
          className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full ${className}`}
          tabIndex={-1}
          data-testid={`${testId}-content`}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div
              className="flex items-center justify-between p-6 border-b border-gray-200"
              data-testid={`${testId}-header`}
            >
              {title && (
                <h2
                  id={`${testId}-title`}
                  className="text-xl font-semibold text-gray-900"
                  data-testid={`${testId}-title`}
                >
                  {title}
                </h2>
              )}
              {showCloseButton && closeable && (
                <button
                  type="button"
                  onClick={onClose}
                  className="ml-auto text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
                  data-testid={`${testId}-close-button`}
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-6" data-testid={`${testId}-body`}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg"
              data-testid={`${testId}-footer`}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
