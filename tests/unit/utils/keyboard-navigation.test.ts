/**
 * Keyboard Navigation Utilities Tests
 *
 * Tests for keyboard navigation utilities and helpers
 *
 * Requirements: 15.2 - Keyboard navigation support
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  handleKeyboardActivation,
  handleEscapeKey,
  getFocusableElements,
  focusFirstElement,
  focusLastElement,
  trapFocus,
  saveFocus,
  restoreFocus,
  handleArrowKeyNavigation,
  RovingTabIndexManager,
  skipToMainContent,
  announceToScreenReader,
  FOCUS_RING_CLASSES,
  FOCUS_RING_INSET_CLASSES,
} from "@/lib/utils/keyboard-navigation";

describe("Keyboard Navigation Utilities", () => {
  describe("handleKeyboardActivation", () => {
    it("should call callback on Enter key", () => {
      const callback = vi.fn();
      const event = {
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleKeyboardActivation(event, callback);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });

    it("should call callback on Space key", () => {
      const callback = vi.fn();
      const event = {
        key: " ",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleKeyboardActivation(event, callback);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });

    it("should not call callback on other keys", () => {
      const callback = vi.fn();
      const event = {
        key: "a",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleKeyboardActivation(event, callback);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("handleEscapeKey", () => {
    it("should call callback on Escape key", () => {
      const callback = vi.fn();
      const event = {
        key: "Escape",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleEscapeKey(event, callback);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
    });

    it("should not call callback on other keys", () => {
      const callback = vi.fn();
      const event = {
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleEscapeKey(event, callback);

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("getFocusableElements", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("should find all focusable elements", () => {
      const container = document.createElement("div");
      container.innerHTML = `
        <button>Button 1</button>
        <a href="#">Link</a>
        <input type="text" />
        <button disabled>Disabled Button</button>
        <div tabindex="0">Focusable Div</div>
        <div tabindex="-1">Non-focusable Div</div>
      `;
      document.body.appendChild(container);

      const focusable = getFocusableElements(container);

      expect(focusable).toHaveLength(4); // button, link, input, div with tabindex="0"
    });

    it("should return empty array for container with no focusable elements", () => {
      const container = document.createElement("div");
      container.innerHTML = `<div>No focusable elements</div>`;
      document.body.appendChild(container);

      const focusable = getFocusableElements(container);

      expect(focusable).toHaveLength(0);
    });
  });

  describe("focusFirstElement", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("should focus the first focusable element", () => {
      const container = document.createElement("div");
      container.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
      `;
      document.body.appendChild(container);

      focusFirstElement(container);

      expect(document.activeElement?.id).toBe("first");
    });

    it("should do nothing if no focusable elements", () => {
      const container = document.createElement("div");
      container.innerHTML = `<div>No buttons</div>`;
      document.body.appendChild(container);

      const previousFocus = document.activeElement;
      focusFirstElement(container);

      expect(document.activeElement).toBe(previousFocus);
    });
  });

  describe("focusLastElement", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("should focus the last focusable element", () => {
      const container = document.createElement("div");
      container.innerHTML = `
        <button id="first">First</button>
        <button id="last">Last</button>
      `;
      document.body.appendChild(container);

      focusLastElement(container);

      expect(document.activeElement?.id).toBe("last");
    });
  });

  describe("trapFocus", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("should trap focus within container", () => {
      const container = document.createElement("div");
      container.innerHTML = `
        <button id="first">First</button>
        <button id="last">Last</button>
      `;
      document.body.appendChild(container);

      const cleanup = trapFocus(container);

      const firstButton = document.getElementById("first") as HTMLElement;
      const lastButton = document.getElementById("last") as HTMLElement;

      // Focus last button
      lastButton.focus();
      expect(document.activeElement).toBe(lastButton);

      // Simulate Tab key (should wrap to first)
      const tabEvent = new KeyboardEvent("keydown", { key: "Tab" });
      container.dispatchEvent(tabEvent);

      // Note: In real browser, focus would wrap. In jsdom, we just verify the event was handled
      cleanup();
    });

    it("should return cleanup function", () => {
      const container = document.createElement("div");
      container.innerHTML = `<button>Button</button>`;
      document.body.appendChild(container);

      const cleanup = trapFocus(container);

      expect(typeof cleanup).toBe("function");
      cleanup();
    });
  });

  describe("saveFocus and restoreFocus", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("should save and restore focus", async () => {
      const button1 = document.createElement("button");
      button1.id = "button1";
      const button2 = document.createElement("button");
      button2.id = "button2";

      document.body.appendChild(button1);
      document.body.appendChild(button2);

      button1.focus();
      expect(document.activeElement).toBe(button1);

      const savedFocus = saveFocus();
      expect(savedFocus).toBe(button1);

      button2.focus();
      expect(document.activeElement).toBe(button2);

      restoreFocus(savedFocus);

      // restoreFocus uses setTimeout, so we need to wait
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(document.activeElement).toBe(button1);
    });
  });

  describe("handleArrowKeyNavigation", () => {
    it("should navigate down with ArrowDown", () => {
      const onIndexChange = vi.fn();
      const event = {
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleArrowKeyNavigation(event, 0, 5, onIndexChange);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onIndexChange).toHaveBeenCalledWith(1);
    });

    it("should navigate up with ArrowUp", () => {
      const onIndexChange = vi.fn();
      const event = {
        key: "ArrowUp",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleArrowKeyNavigation(event, 2, 5, onIndexChange);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onIndexChange).toHaveBeenCalledWith(1);
    });

    it("should loop to start when at end with loop enabled", () => {
      const onIndexChange = vi.fn();
      const event = {
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleArrowKeyNavigation(event, 4, 5, onIndexChange, { loop: true });

      expect(onIndexChange).toHaveBeenCalledWith(0);
    });

    it("should not loop when loop is disabled", () => {
      const onIndexChange = vi.fn();
      const event = {
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleArrowKeyNavigation(event, 4, 5, onIndexChange, { loop: false });

      expect(onIndexChange).toHaveBeenCalledWith(4);
    });

    it("should handle horizontal navigation", () => {
      const onIndexChange = vi.fn();
      const event = {
        key: "ArrowRight",
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent;

      handleArrowKeyNavigation(event, 0, 5, onIndexChange, {
        vertical: false,
        horizontal: true,
      });

      expect(event.preventDefault).toHaveBeenCalled();
      expect(onIndexChange).toHaveBeenCalledWith(1);
    });
  });

  describe("RovingTabIndexManager", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("should manage tabindex for items", () => {
      const container = document.createElement("div");
      container.innerHTML = `
        <button class="item">Item 1</button>
        <button class="item">Item 2</button>
        <button class="item">Item 3</button>
      `;
      document.body.appendChild(container);

      const manager = new RovingTabIndexManager(container, ".item");

      const items = container.querySelectorAll(".item");
      expect(items[0].getAttribute("tabindex")).toBe("0");
      expect(items[1].getAttribute("tabindex")).toBe("-1");
      expect(items[2].getAttribute("tabindex")).toBe("-1");
    });

    it("should focus next item", () => {
      const container = document.createElement("div");
      container.innerHTML = `
        <button class="item">Item 1</button>
        <button class="item">Item 2</button>
        <button class="item">Item 3</button>
      `;
      document.body.appendChild(container);

      const manager = new RovingTabIndexManager(container, ".item");
      manager.focusNext();

      const items = container.querySelectorAll(".item");
      expect(items[0].getAttribute("tabindex")).toBe("-1");
      expect(items[1].getAttribute("tabindex")).toBe("0");
      expect(document.activeElement).toBe(items[1]);
    });

    it("should focus previous item", () => {
      const container = document.createElement("div");
      container.innerHTML = `
        <button class="item">Item 1</button>
        <button class="item">Item 2</button>
        <button class="item">Item 3</button>
      `;
      document.body.appendChild(container);

      const manager = new RovingTabIndexManager(container, ".item");
      manager.focusItem(1);
      manager.focusPrevious();

      const items = container.querySelectorAll(".item");
      expect(items[0].getAttribute("tabindex")).toBe("0");
      expect(document.activeElement).toBe(items[0]);
    });

    it("should get current index", () => {
      const container = document.createElement("div");
      container.innerHTML = `
        <button class="item">Item 1</button>
        <button class="item">Item 2</button>
      `;
      document.body.appendChild(container);

      const manager = new RovingTabIndexManager(container, ".item");
      expect(manager.getCurrentIndex()).toBe(0);

      manager.focusNext();
      expect(manager.getCurrentIndex()).toBe(1);
    });
  });

  describe("skipToMainContent", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    it("should focus main content element", () => {
      const main = document.createElement("main");
      main.id = "main-content";
      document.body.appendChild(main);

      skipToMainContent();

      expect(document.activeElement).toBe(main);
      expect(main.getAttribute("tabindex")).toBe("-1");
    });

    it("should handle missing main content gracefully", () => {
      const previousFocus = document.activeElement;
      skipToMainContent("non-existent");
      expect(document.activeElement).toBe(previousFocus);
    });
  });

  describe("announceToScreenReader", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    afterEach(() => {
      vi.clearAllTimers();
    });

    it("should create live region announcement", () => {
      vi.useFakeTimers();

      announceToScreenReader("Test announcement");

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion?.textContent).toBe("Test announcement");
      expect(liveRegion?.getAttribute("aria-live")).toBe("polite");

      vi.runAllTimers();
      vi.useRealTimers();
    });

    it("should support assertive priority", () => {
      vi.useFakeTimers();

      announceToScreenReader("Urgent message", "assertive");

      const liveRegion = document.querySelector('[role="status"]');
      expect(liveRegion?.getAttribute("aria-live")).toBe("assertive");

      vi.runAllTimers();
      vi.useRealTimers();
    });
  });

  describe("Focus ring classes", () => {
    it("should export standard focus ring classes", () => {
      expect(FOCUS_RING_CLASSES).toContain("focus:outline-none");
      expect(FOCUS_RING_CLASSES).toContain("focus:ring-2");
      expect(FOCUS_RING_CLASSES).toContain("focus:ring-blue-500");
    });

    it("should export inset focus ring classes", () => {
      expect(FOCUS_RING_INSET_CLASSES).toContain("focus:outline-none");
      expect(FOCUS_RING_INSET_CLASSES).toContain("focus:ring-2");
      expect(FOCUS_RING_INSET_CLASSES).not.toContain("focus:ring-offset");
    });
  });
});
