/**
 * Accessibility Utilities
 *
 * Helper functions and utilities for implementing WCAG 2.1 Level AA accessibility.
 * Provides keyboard navigation, focus management, and ARIA utilities.
 *
 * Validates Requirements:
 * - 15.1: Comply with WCAG 2.1 Level AA accessibility standards
 * - 15.2: Provide keyboard navigation for all interactive elements
 * - 15.3: Provide ARIA labels for all form inputs and interactive components
 * - 15.4: Maintain a minimum contrast ratio of 4.5:1 for text content
 * - 15.5: Announce page changes and dynamic content updates
 * - 15.6: Provide skip navigation links to main content areas
 */

/**
 * Trap focus within a container element
 * Useful for modals, dialogs, and other overlay components
 */
export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== "Tab") return;

  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])',
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
}

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])',
  );

  return Array.from(elements);
}

/**
 * Focus the first focusable element in a container
 */
export function focusFirstElement(container: HTMLElement): void {
  const focusableElements = getFocusableElements(container);
  focusableElements[0]?.focus();
}

/**
 * Focus the last focusable element in a container
 */
export function focusLastElement(container: HTMLElement): void {
  const focusableElements = getFocusableElements(container);
  focusableElements[focusableElements.length - 1]?.focus();
}

/**
 * Announce a message to screen readers using ARIA live region
 */
export function announceToScreenReader(
  message: string,
  priority: "polite" | "assertive" = "polite",
): void {
  // Create or get existing live region
  let liveRegion = document.getElementById("aria-live-region");

  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = "aria-live-region";
    liveRegion.className = "sr-only";
    document.body.appendChild(liveRegion);
  }

  // Update the priority
  liveRegion.setAttribute("aria-live", priority);
  liveRegion.setAttribute("aria-atomic", "true");

  // Update the live region with the message
  liveRegion.textContent = message;

  // Clear the message after a delay to allow for repeated announcements
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = "";
    }
  }, 1000);
}

/**
 * Generate a unique ID for accessibility attributes
 */
export function generateA11yId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if an element is visible and focusable
 */
export function isElementFocusable(element: HTMLElement): boolean {
  if (element.hasAttribute("disabled")) return false;
  if (element.getAttribute("tabindex") === "-1") return false;

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") return false;

  return true;
}

/**
 * Handle keyboard navigation for a list of items
 * Returns the new focused index
 */
export function handleListKeyboardNavigation(
  event: KeyboardEvent,
  currentIndex: number,
  itemCount: number,
  options: {
    orientation?: "vertical" | "horizontal";
    loop?: boolean;
  } = {},
): number {
  const { orientation = "vertical", loop = true } = options;

  const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
  const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";

  let newIndex = currentIndex;

  switch (event.key) {
    case nextKey:
      event.preventDefault();
      newIndex = currentIndex + 1;
      if (newIndex >= itemCount) {
        newIndex = loop ? 0 : itemCount - 1;
      }
      break;

    case prevKey:
      event.preventDefault();
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = loop ? itemCount - 1 : 0;
      }
      break;

    case "Home":
      event.preventDefault();
      newIndex = 0;
      break;

    case "End":
      event.preventDefault();
      newIndex = itemCount - 1;
      break;
  }

  return newIndex;
}

/**
 * Create a skip link for keyboard navigation
 */
export function createSkipLink(
  targetId: string,
  label: string = "Skip to main content",
): HTMLAnchorElement {
  const skipLink = document.createElement("a");
  skipLink.href = `#${targetId}`;
  skipLink.textContent = label;
  skipLink.className =
    "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg";

  skipLink.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  return skipLink;
}

/**
 * Add skip links to the page
 */
export function addSkipLinks(
  links: Array<{ targetId: string; label: string }>,
): void {
  const container = document.createElement("div");
  container.className = "skip-links";

  links.forEach(({ targetId, label }) => {
    const skipLink = createSkipLink(targetId, label);
    container.appendChild(skipLink);
  });

  document.body.insertBefore(container, document.body.firstChild);
}

/**
 * Manage focus restoration after modal/dialog closes
 */
export class FocusManager {
  private previousActiveElement: HTMLElement | null = null;

  /**
   * Save the currently focused element
   */
  saveFocus(): void {
    this.previousActiveElement = document.activeElement as HTMLElement;
  }

  /**
   * Restore focus to the previously focused element
   */
  restoreFocus(): void {
    if (this.previousActiveElement && this.previousActiveElement.focus) {
      this.previousActiveElement.focus();
    }
    this.previousActiveElement = null;
  }

  /**
   * Focus an element and save the previous focus
   */
  moveFocus(element: HTMLElement): void {
    this.saveFocus();
    element.focus();
  }
}

/**
 * Create a roving tabindex manager for a group of elements
 * Useful for toolbars, menus, and other composite widgets
 */
export class RovingTabindexManager {
  private elements: HTMLElement[];
  private currentIndex: number = 0;

  constructor(elements: HTMLElement[], initialIndex: number = 0) {
    this.elements = elements;
    this.currentIndex = initialIndex;
    this.updateTabindices();
  }

  /**
   * Update tabindex attributes for all elements
   */
  private updateTabindices(): void {
    this.elements.forEach((element, index) => {
      element.setAttribute(
        "tabindex",
        index === this.currentIndex ? "0" : "-1",
      );
    });
  }

  /**
   * Move focus to the next element
   */
  focusNext(): void {
    this.currentIndex = (this.currentIndex + 1) % this.elements.length;
    this.updateTabindices();
    this.elements[this.currentIndex].focus();
  }

  /**
   * Move focus to the previous element
   */
  focusPrevious(): void {
    this.currentIndex =
      (this.currentIndex - 1 + this.elements.length) % this.elements.length;
    this.updateTabindices();
    this.elements[this.currentIndex].focus();
  }

  /**
   * Move focus to the first element
   */
  focusFirst(): void {
    this.currentIndex = 0;
    this.updateTabindices();
    this.elements[this.currentIndex].focus();
  }

  /**
   * Move focus to the last element
   */
  focusLast(): void {
    this.currentIndex = this.elements.length - 1;
    this.updateTabindices();
    this.elements[this.currentIndex].focus();
  }

  /**
   * Focus a specific element by index
   */
  focusIndex(index: number): void {
    if (index >= 0 && index < this.elements.length) {
      this.currentIndex = index;
      this.updateTabindices();
      this.elements[this.currentIndex].focus();
    }
  }

  /**
   * Get the current focused index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }
}

/**
 * Debounce announcements to screen readers to avoid overwhelming users
 */
export class AnnouncementDebouncer {
  private timeout: NodeJS.Timeout | null = null;
  private delay: number;

  constructor(delay: number = 500) {
    this.delay = delay;
  }

  /**
   * Announce a message with debouncing
   */
  announce(message: string, priority: "polite" | "assertive" = "polite"): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      announceToScreenReader(message, priority);
      this.timeout = null;
    }, this.delay);
  }

  /**
   * Cancel any pending announcement
   */
  cancel(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Get appropriate animation duration based on user preferences
 */
export function getAnimationDuration(defaultDuration: number): number {
  return prefersReducedMotion() ? 0 : defaultDuration;
}

/**
 * Ensure an element has a unique ID for ARIA relationships
 */
export function ensureElementId(
  element: HTMLElement,
  prefix: string = "element",
): string {
  if (!element.id) {
    element.id = generateA11yId(prefix);
  }
  return element.id;
}

/**
 * Create ARIA description for complex UI elements
 */
export function createAriaDescription(
  element: HTMLElement,
  description: string,
): void {
  const descId = generateA11yId("desc");
  const descElement = document.createElement("div");
  descElement.id = descId;
  descElement.className = "sr-only";
  descElement.textContent = description;

  element.setAttribute("aria-describedby", descId);
  element.appendChild(descElement);
}

/**
 * Validate ARIA attributes on an element
 */
export function validateAriaAttributes(element: HTMLElement): string[] {
  const errors: string[] = [];

  // Check for required ARIA attributes based on role
  const role = element.getAttribute("role");

  if (
    role === "button" &&
    !element.hasAttribute("aria-label") &&
    !element.textContent?.trim()
  ) {
    errors.push("Button must have aria-label or text content");
  }

  if (
    role === "dialog" &&
    !element.hasAttribute("aria-label") &&
    !element.hasAttribute("aria-labelledby")
  ) {
    errors.push("Dialog must have aria-label or aria-labelledby");
  }

  if (
    role === "listbox" &&
    !element.hasAttribute("aria-label") &&
    !element.hasAttribute("aria-labelledby")
  ) {
    errors.push("Listbox must have aria-label or aria-labelledby");
  }

  return errors;
}
