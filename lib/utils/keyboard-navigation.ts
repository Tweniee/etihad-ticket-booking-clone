/**
 * Keyboard Navigation Utilities
 *
 * Provides utilities for implementing keyboard navigation and focus management
 * throughout the application.
 *
 * Requirements: 15.2 - Keyboard navigation support for all interactive elements
 */

/**
 * Standard focus ring classes for consistent keyboard navigation styling
 */
export const FOCUS_RING_CLASSES =
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

/**
 * Focus ring classes for elements within containers (no offset)
 */
export const FOCUS_RING_INSET_CLASSES =
  "focus:outline-none focus:ring-2 focus:ring-blue-500";

/**
 * Focus ring classes for dark backgrounds
 */
export const FOCUS_RING_DARK_CLASSES =
  "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900";

/**
 * Handle keyboard activation (Enter or Space key)
 * Common pattern for making non-button elements keyboard accessible
 */
export function handleKeyboardActivation(
  event: React.KeyboardEvent,
  callback: () => void,
): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    callback();
  }
}

/**
 * Handle Escape key press
 */
export function handleEscapeKey(
  event: React.KeyboardEvent,
  callback: () => void,
): void {
  if (event.key === "Escape") {
    event.preventDefault();
    callback();
  }
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';

  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

/**
 * Focus the first focusable element in a container
 */
export function focusFirstElement(container: HTMLElement): void {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[0].focus();
  }
}

/**
 * Focus the last focusable element in a container
 */
export function focusLastElement(container: HTMLElement): void {
  const focusableElements = getFocusableElements(container);
  if (focusableElements.length > 0) {
    focusableElements[focusableElements.length - 1].focus();
  }
}

/**
 * Trap focus within a container (for modals, dialogs, etc.)
 * Returns a cleanup function to remove the event listener
 */
export function trapFocus(container: HTMLElement): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;

    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab: moving backwards
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: moving forwards
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener("keydown", handleKeyDown);

  return () => {
    container.removeEventListener("keydown", handleKeyDown);
  };
}

/**
 * Restore focus to a previously focused element
 */
export function restoreFocus(element: HTMLElement | null): void {
  if (element && typeof element.focus === "function") {
    // Use setTimeout to ensure the element is ready to receive focus
    setTimeout(() => {
      element.focus();
    }, 0);
  }
}

/**
 * Save the currently focused element
 */
export function saveFocus(): HTMLElement | null {
  return document.activeElement as HTMLElement;
}

/**
 * Handle arrow key navigation in a list
 */
export function handleArrowKeyNavigation(
  event: React.KeyboardEvent,
  currentIndex: number,
  itemCount: number,
  onIndexChange: (newIndex: number) => void,
  options: {
    vertical?: boolean;
    horizontal?: boolean;
    loop?: boolean;
  } = {},
): void {
  const { vertical = true, horizontal = false, loop = true } = options;

  let newIndex = currentIndex;

  if (vertical) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      newIndex = currentIndex + 1;
      if (newIndex >= itemCount) {
        newIndex = loop ? 0 : itemCount - 1;
      }
      onIndexChange(newIndex);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = loop ? itemCount - 1 : 0;
      }
      onIndexChange(newIndex);
    }
  }

  if (horizontal) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      newIndex = currentIndex + 1;
      if (newIndex >= itemCount) {
        newIndex = loop ? 0 : itemCount - 1;
      }
      onIndexChange(newIndex);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = loop ? itemCount - 1 : 0;
      }
      onIndexChange(newIndex);
    }
  }
}

/**
 * Create a roving tabindex manager for a list of items
 * Only one item in the list should be tabbable at a time
 */
export class RovingTabIndexManager {
  private items: HTMLElement[] = [];
  private currentIndex: number = 0;

  constructor(container: HTMLElement, itemSelector: string) {
    this.items = Array.from(
      container.querySelectorAll<HTMLElement>(itemSelector),
    );
    this.updateTabIndices();
  }

  private updateTabIndices(): void {
    this.items.forEach((item, index) => {
      item.setAttribute("tabindex", index === this.currentIndex ? "0" : "-1");
    });
  }

  public focusItem(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
      this.updateTabIndices();
      this.items[index].focus();
    }
  }

  public focusNext(loop: boolean = true): void {
    let newIndex = this.currentIndex + 1;
    if (newIndex >= this.items.length) {
      newIndex = loop ? 0 : this.items.length - 1;
    }
    this.focusItem(newIndex);
  }

  public focusPrevious(loop: boolean = true): void {
    let newIndex = this.currentIndex - 1;
    if (newIndex < 0) {
      newIndex = loop ? this.items.length - 1 : 0;
    }
    this.focusItem(newIndex);
  }

  public focusFirst(): void {
    this.focusItem(0);
  }

  public focusLast(): void {
    this.focusItem(this.items.length - 1);
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getItemCount(): number {
    return this.items.length;
  }
}

/**
 * Skip to main content link handler
 * Focuses the main content area when activated
 */
export function skipToMainContent(
  mainContentId: string = "main-content",
): void {
  const mainContent = document.getElementById(mainContentId);
  if (mainContent) {
    mainContent.setAttribute("tabindex", "-1");
    mainContent.focus();
    // Remove tabindex after focus to restore normal tab order
    mainContent.addEventListener(
      "blur",
      () => {
        mainContent.removeAttribute("tabindex");
      },
      { once: true },
    );
  }
}

/**
 * Announce to screen readers (for dynamic content)
 * Creates a live region announcement
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite",
): void {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
