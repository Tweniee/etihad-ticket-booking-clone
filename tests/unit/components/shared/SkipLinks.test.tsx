import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkipLinks } from "@/components/shared/SkipLinks";

describe("SkipLinks", () => {
  beforeEach(() => {
    // Create target elements
    const main = document.createElement("main");
    main.id = "main-content";
    document.body.appendChild(main);

    const nav = document.createElement("nav");
    nav.id = "navigation";
    document.body.appendChild(nav);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should render skip links", () => {
    const links = [
      { targetId: "main-content", label: "Skip to main content" },
      { targetId: "navigation", label: "Skip to navigation" },
    ];

    render(<SkipLinks links={links} />);

    expect(screen.getByText("Skip to main content")).toBeInTheDocument();
    expect(screen.getByText("Skip to navigation")).toBeInTheDocument();
  });

  it("should have proper ARIA attributes", () => {
    const links = [{ targetId: "main-content", label: "Skip to main content" }];

    const { container } = render(<SkipLinks links={links} />);
    const nav = container.querySelector("nav");

    expect(nav).toHaveAttribute("aria-label", "Skip navigation links");
  });

  it("should focus target element when clicked", async () => {
    const user = userEvent.setup();
    const links = [{ targetId: "main-content", label: "Skip to main content" }];

    render(<SkipLinks links={links} />);

    const skipLink = screen.getByText("Skip to main content");
    await user.click(skipLink);

    const target = document.getElementById("main-content");
    expect(document.activeElement).toBe(target);
  });

  it("should have sr-only class by default", () => {
    const links = [{ targetId: "main-content", label: "Skip to main content" }];

    render(<SkipLinks links={links} />);

    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toHaveClass("sr-only");
  });

  it("should become visible on focus", () => {
    const links = [{ targetId: "main-content", label: "Skip to main content" }];

    render(<SkipLinks links={links} />);

    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toHaveClass("focus:not-sr-only");
  });

  it("should render multiple skip links", () => {
    const links = [
      { targetId: "main-content", label: "Skip to main content" },
      { targetId: "navigation", label: "Skip to navigation" },
      { targetId: "footer", label: "Skip to footer" },
    ];

    render(<SkipLinks links={links} />);

    expect(screen.getByText("Skip to main content")).toBeInTheDocument();
    expect(screen.getByText("Skip to navigation")).toBeInTheDocument();
    expect(screen.getByText("Skip to footer")).toBeInTheDocument();
  });

  it("should have correct href attributes", () => {
    const links = [
      { targetId: "main-content", label: "Skip to main content" },
      { targetId: "navigation", label: "Skip to navigation" },
    ];

    render(<SkipLinks links={links} />);

    const mainLink = screen.getByText("Skip to main content");
    const navLink = screen.getByText("Skip to navigation");

    expect(mainLink).toHaveAttribute("href", "#main-content");
    expect(navLink).toHaveAttribute("href", "#navigation");
  });
});
