import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  trapFocus,
  getFocusableElements,
  focusFirstElement,
  focusLastElement,
  announceToScreenReader,
  generateA11yId,
  isElementFocusable,
  handleListKeyboardNavigation,
  FocusManager,
  RovingTabindexManager,
  AnnouncementDebouncer,
  prefersReducedMotion,
  getAnimationDuration,
  ensureElementId,
} from "@/lib/utils/accessibility";

describe("Accessibility Utilities", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("getFocusableElements", () => {
    it("should find all focusable elements", () => {
      container.innerHTML = `
        <button>Button 1</button>
        <a href="#">Link</a>
        <input type="text" />
        <button disabled>Disabled Button</button>
        <div tabindex="-1">Not focusable</div>
        <div tabindex="0">Focusable div</div>
      `;

      const focusable = getFocusableElements(container);
      expect(focusable).toHaveLength(4); // button, link, input, focusable div
    });

    it("should exclude disabled elements", () => {
      container.innerHTML = `
        <button>Enabled</button>
        <button disabled>Disabled</button>
        <input type="text" disabled />
      `;

      const focusable = getFocusableElements(container);
      expect(focusable).toHaveLength(1);
    });
  });

  describe("focusFirstElement", () => {
    it("should focus the first focusable element", () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
      `;

      focusFirstElement(container);
      expect(document.activeElement?.id).toBe("first");
    });
  });

  describe("focusLastElement", () => {
    it("should focus the last focusable element", () => {
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
      `;

      focusLastElement(container);
      expect(document.activeElement?.id).toBe("second");
    });
  });

  describe("announceToScreenReader", () => {
    it("should create a live region if it doesn't exist", () => {
      announceToScreenReader("Test message");

      const liveRegion = document.getElementById("aria-live-region");
      expect(liveRegion).toBeTruthy();
      expect(liveRegion?.textContent).toBe("Test message");
      expect(liveRegion?.getAttribute("aria-live")).toBe("polite");
    });

    it("should use assertive priority when specified", () => {
      announceToScreenReader("Urgent message", "assertive");

      const liveRegion = document.getElementById("aria-live-region");
      expect(liveRegion?.getAttribute("aria-live")).toBe("assertive");
    });

    it("should clear message after delay", async () => {
      announceToScreenReader("Test message");

      const liveRegion = document.getElementById("aria-live-region");
      expect(liveRegion?.textContent).toBe("Test message");

      await new Promise((resolve) => setTimeout(resolve, 1100));
      expect(liveRegion?.textContent).toBe("");
    });
  });

  describe("generateA11yId", () => {
    it("should generate unique IDs with prefix", () => {
      const id1 = generateA11yId("test");
      const id2 = generateA11yId("test");

      expect(id1).toMatch(/^test-/);
      expect(id2).toMatch(/^test-/);
      expect(id1).not.toBe(id2);
    });
  });

  describe("isElementFocusable", () => {
    it("should return false for disabled elements", () => {
      const button = document.createElement("button");
      button.disabled = true;
      expect(isElementFocusable(button)).toBe(false);
    });

    it("should return false for elements with tabindex -1", () => {
      const div = document.createElement("div");
      div.setAttribute("tabindex", "-1");
      expect(isElementFocusable(div)).toBe(false);
    });

    it("should return false for hidden elements", () => {
      const div = document.createElement("div");
      div.style.display = "none";
      document.body.appendChild(div);
      expect(isElementFocusable(div)).toBe(false);
      document.body.removeChild(div);
    });

    it("should return true for visible, enabled elements", () => {
      const button = document.createElement("button");
      document.body.appendChild(button);
      expect(isElementFocusable(button)).toBe(true);
      document.body.removeChild(button);
    });
  });

  describe("handleListKeyboardNavigation", () => {
    it("should move to next item on ArrowDown", () => {
      const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
      const newIndex = handleListKeyboardNavigation(event, 0, 5);
      expect(newIndex).toBe(1);
    });

    it("should move to previous item on ArrowUp", () => {
      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
      const newIndex = handleListKeyboardNavigation(event, 2, 5);
      expect(newIndex).toBe(1);
    });

    it("should loop to start when at end", () => {
      const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
      const newIndex = handleListKeyboardNavigation(event, 4, 5);
      expect(newIndex).toBe(0);
    });

    it("should loop to end when at start", () => {
      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
      const newIndex = handleListKeyboardNavigation(event, 0, 5);
      expect(newIndex).toBe(4);
    });

    it("should move to first item on Home", () => {
      const event = new KeyboardEvent("keydown", { key: "Home" });
      const newIndex = handleListKeyboardNavigation(event, 3, 5);
      expect(newIndex).toBe(0);
    });

    it("should move to last item on End", () => {
      const event = new KeyboardEvent("keydown", { key: "End" });
      const newIndex = handleListKeyboardNavigation(event, 1, 5);
      expect(newIndex).toBe(4);
    });

    it("should support horizontal orientation", () => {
      const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
      const newIndex = handleListKeyboardNavigation(event, 0, 5, {
        orientation: "horizontal",
      });
      expect(newIndex).toBe(1);
    });

    it("should not loop when loop is false", () => {
      const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
      const newIndex = handleListKeyboardNavigation(event, 4, 5, {
        loop: false,
      });
      expect(newIndex).toBe(4);
    });
  });

  describe("FocusManager", () => {
    it("should save and restore focus", () => {
      const button1 = document.createElement("button");
      const button2 = document.createElement("button");
      document.body.appendChild(button1);
      document.body.appendChild(button2);

      button1.focus();
      expect(document.activeElement).toBe(button1);

      const manager = new FocusManager();
      manager.saveFocus();

      button2.focus();
      expect(document.activeElement).toBe(button2);

      manager.restoreFocus();
      expect(document.activeElement).toBe(button1);

      document.body.removeChild(button1);
      document.body.removeChild(button2);
    });

    it("should move focus and save previous", () => {
      const button1 = document.createElement("button");
      const button2 = document.createElement("button");
      document.body.appendChild(button1);
      document.body.appendChild(button2);

      button1.focus();

      const manager = new FocusManager();
      manager.moveFocus(button2);

      expect(document.activeElement).toBe(button2);

      manager.restoreFocus();
      expect(document.activeElement).toBe(button1);

      document.body.removeChild(button1);
      document.body.removeChild(button2);
    });
  });

  describe("RovingTabindexManager", () => {
    let buttons: HTMLButtonElement[];

    beforeEach(() => {
      buttons = [
        document.createElement("button"),
        document.createElement("button"),
        document.createElement("button"),
      ];
      buttons.forEach((button) => document.body.appendChild(button));
    });

    afterEach(() => {
      buttons.forEach((button) => document.body.removeChild(button));
    });

    it("should set initial tabindex correctly", () => {
      const manager = new RovingTabindexManager(buttons, 0);

      expect(buttons[0].getAttribute("tabindex")).toBe("0");
      expect(buttons[1].getAttribute("tabindex")).toBe("-1");
      expect(buttons[2].getAttribute("tabindex")).toBe("-1");
    });

    it("should move focus to next element", () => {
      const manager = new RovingTabindexManager(buttons, 0);
      manager.focusNext();

      expect(buttons[0].getAttribute("tabindex")).toBe("-1");
      expect(buttons[1].getAttribute("tabindex")).toBe("0");
      expect(document.activeElement).toBe(buttons[1]);
    });

    it("should move focus to previous element", () => {
      const manager = new RovingTabindexManager(buttons, 1);
      manager.focusPrevious();

      expect(buttons[0].getAttribute("tabindex")).toBe("0");
      expect(buttons[1].getAttribute("tabindex")).toBe("-1");
      expect(document.activeElement).toBe(buttons[0]);
    });

    it("should wrap around when moving next from last", () => {
      const manager = new RovingTabindexManager(buttons, 2);
      manager.focusNext();

      expect(buttons[0].getAttribute("tabindex")).toBe("0");
      expect(buttons[2].getAttribute("tabindex")).toBe("-1");
      expect(document.activeElement).toBe(buttons[0]);
    });

    it("should focus first element", () => {
      const manager = new RovingTabindexManager(buttons, 2);
      manager.focusFirst();

      expect(buttons[0].getAttribute("tabindex")).toBe("0");
      expect(document.activeElement).toBe(buttons[0]);
    });

    it("should focus last element", () => {
      const manager = new RovingTabindexManager(buttons, 0);
      manager.focusLast();

      expect(buttons[2].getAttribute("tabindex")).toBe("0");
      expect(document.activeElement).toBe(buttons[2]);
    });

    it("should focus specific index", () => {
      const manager = new RovingTabindexManager(buttons, 0);
      manager.focusIndex(1);

      expect(buttons[1].getAttribute("tabindex")).toBe("0");
      expect(document.activeElement).toBe(buttons[1]);
      expect(manager.getCurrentIndex()).toBe(1);
    });
  });

  describe("AnnouncementDebouncer", () => {
    beforeEach(() => {
      // Clean up any existing live region
      const existing = document.getElementById("aria-live-region");
      if (existing) {
        existing.remove();
      }
    });

    it("should debounce announcements", async () => {
      const debouncer = new AnnouncementDebouncer(100);

      debouncer.announce("Message 1");
      debouncer.announce("Message 2");
      debouncer.announce("Message 3");

      await new Promise((resolve) => setTimeout(resolve, 150));

      const liveRegion = document.getElementById("aria-live-region");
      expect(liveRegion?.textContent).toBe("Message 3");
    });

    it("should cancel pending announcements", async () => {
      const debouncer = new AnnouncementDebouncer(100);

      debouncer.announce("Message 1");
      debouncer.cancel();

      await new Promise((resolve) => setTimeout(resolve, 150));

      const liveRegion = document.getElementById("aria-live-region");
      // Should be empty or not exist since we cancelled
      expect(liveRegion?.textContent || "").toBe("");
    });
  });

  describe("ensureElementId", () => {
    it("should return existing ID if present", () => {
      const div = document.createElement("div");
      div.id = "existing-id";

      const id = ensureElementId(div);
      expect(id).toBe("existing-id");
    });

    it("should generate ID if not present", () => {
      const div = document.createElement("div");

      const id = ensureElementId(div, "test");
      expect(id).toMatch(/^test-/);
      expect(div.id).toBe(id);
    });
  });

  describe("getAnimationDuration", () => {
    it("should return 0 if reduced motion is preferred", () => {
      // Mock matchMedia to return reduced motion preference
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const duration = getAnimationDuration(300);
      expect(duration).toBe(0);
    });
  });
});
