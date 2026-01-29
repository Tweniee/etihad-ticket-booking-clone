/**
 * useKeyboardNavigation Hook
 *
 * Custom React hook for managing keyboard navigation in lists and grids
 *
 * Requirements: 15.2 - Keyboard navigation support
 */

import { useState, useEffect, useCallback, useRef } from "react";

export interface UseKeyboardNavigationOptions {
  /**
   * Total number of items
   */
  itemCount: number;

  /**
   * Initial selected index
   */
  initialIndex?: number;

  /**
   * Whether to loop when reaching the end
   */
  loop?: boolean;

  /**
   * Enable vertical navigation (ArrowUp/ArrowDown)
   */
  vertical?: boolean;

  /**
   * Enable horizontal navigation (ArrowLeft/ArrowRight)
   */
  horizontal?: boolean;

  /**
   * Callback when index changes
   */
  onIndexChange?: (index: number) => void;

  /**
   * Callback when Enter is pressed
   */
  onSelect?: (index: number) => void;
}

export function useKeyboardNavigation({
  itemCount,
  initialIndex = 0,
  loop = true,
  vertical = true,
  horizontal = false,
  onIndexChange,
  onSelect,
}: UseKeyboardNavigationOptions) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Update current index when item count changes
  useEffect(() => {
    if (currentIndex >= itemCount && itemCount > 0) {
      setCurrentIndex(itemCount - 1);
    }
  }, [itemCount, currentIndex]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      let newIndex = currentIndex;
      let handled = false;

      if (vertical) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= itemCount) {
            newIndex = loop ? 0 : itemCount - 1;
          }
          handled = true;
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = loop ? itemCount - 1 : 0;
          }
          handled = true;
        }
      }

      if (horizontal) {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= itemCount) {
            newIndex = loop ? 0 : itemCount - 1;
          }
          handled = true;
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = loop ? itemCount - 1 : 0;
          }
          handled = true;
        }
      }

      if (event.key === "Home") {
        event.preventDefault();
        newIndex = 0;
        handled = true;
      } else if (event.key === "End") {
        event.preventDefault();
        newIndex = itemCount - 1;
        handled = true;
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (onSelect) {
          onSelect(currentIndex);
        }
        handled = true;
      }

      if (handled && newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        if (onIndexChange) {
          onIndexChange(newIndex);
        }
      }
    },
    [
      currentIndex,
      itemCount,
      loop,
      vertical,
      horizontal,
      onIndexChange,
      onSelect,
    ],
  );

  const setIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < itemCount) {
        setCurrentIndex(index);
        if (onIndexChange) {
          onIndexChange(index);
        }
      }
    },
    [itemCount, onIndexChange],
  );

  return {
    currentIndex,
    setIndex,
    handleKeyDown,
  };
}

/**
 * useFocusTrap Hook
 *
 * Traps focus within a container (useful for modals, dialogs)
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const previousActiveElement = document.activeElement as HTMLElement;

    // Focus first element in container
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])',
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusable = Array.from(focusableElements);
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      // Restore focus to previous element
      if (
        previousActiveElement &&
        typeof previousActiveElement.focus === "function"
      ) {
        previousActiveElement.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * useFocusManagement Hook
 *
 * Manages focus state and provides utilities for focus management
 */
export function useFocusManagement() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (
      previousFocusRef.current &&
      typeof previousFocusRef.current.focus === "function"
    ) {
      setTimeout(() => {
        previousFocusRef.current?.focus();
      }, 0);
    }
  }, []);

  const focusElement = useCallback((element: HTMLElement | null) => {
    if (element && typeof element.focus === "function") {
      setTimeout(() => {
        element.focus();
      }, 0);
    }
  }, []);

  return {
    saveFocus,
    restoreFocus,
    focusElement,
  };
}
