import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LiveRegion, useLiveRegion } from "@/components/shared/LiveRegion";
import { renderHook, act } from "@testing-library/react";

describe("LiveRegion", () => {
  it("should render with message", () => {
    render(<LiveRegion message="Test message" />);

    const liveRegion = screen.getByTestId("live-region");
    expect(liveRegion).toHaveTextContent("Test message");
  });

  it("should have proper ARIA attributes", () => {
    render(<LiveRegion message="Test message" priority="polite" />);

    const liveRegion = screen.getByTestId("live-region");
    expect(liveRegion).toHaveAttribute("role", "status");
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
    expect(liveRegion).toHaveAttribute("aria-atomic", "true");
  });

  it("should support assertive priority", () => {
    render(<LiveRegion message="Urgent message" priority="assertive" />);

    const liveRegion = screen.getByTestId("live-region");
    expect(liveRegion).toHaveAttribute("aria-live", "assertive");
  });

  it("should have sr-only class", () => {
    render(<LiveRegion message="Test message" />);

    const liveRegion = screen.getByTestId("live-region");
    expect(liveRegion).toHaveClass("sr-only");
  });

  it("should clear message after delay", async () => {
    const { rerender } = render(
      <LiveRegion message="Test message" clearDelay={100} />,
    );

    const liveRegion = screen.getByTestId("live-region");
    expect(liveRegion).toHaveTextContent("Test message");

    await waitFor(
      () => {
        expect(liveRegion).toHaveTextContent("");
      },
      { timeout: 200 },
    );
  });

  it("should not clear message when clearAfterAnnounce is false", async () => {
    render(
      <LiveRegion
        message="Test message"
        clearAfterAnnounce={false}
        clearDelay={100}
      />,
    );

    const liveRegion = screen.getByTestId("live-region");
    expect(liveRegion).toHaveTextContent("Test message");

    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(liveRegion).toHaveTextContent("Test message");
  });

  it("should update message when prop changes", () => {
    const { rerender } = render(<LiveRegion message="First message" />);

    const liveRegion = screen.getByTestId("live-region");
    expect(liveRegion).toHaveTextContent("First message");

    rerender(<LiveRegion message="Second message" />);
    expect(liveRegion).toHaveTextContent("Second message");
  });

  it("should support custom test ID", () => {
    render(<LiveRegion message="Test message" testId="custom-live-region" />);

    expect(screen.getByTestId("custom-live-region")).toBeInTheDocument();
  });

  it("should support custom className", () => {
    render(<LiveRegion message="Test message" className="custom-class" />);

    const liveRegion = screen.getByTestId("live-region");
    expect(liveRegion).toHaveClass("custom-class");
  });
});

describe("useLiveRegion", () => {
  it("should provide announce function and message", () => {
    const { result } = renderHook(() => useLiveRegion());

    expect(result.current.announce).toBeInstanceOf(Function);
    expect(result.current.message).toBe("");
    expect(result.current.LiveRegionComponent).toBeInstanceOf(Function);
  });

  it("should update message when announce is called", () => {
    const { result } = renderHook(() => useLiveRegion());

    act(() => {
      result.current.announce("Test announcement");
    });

    expect(result.current.message).toBe("Test announcement");
  });

  it("should support different priorities", () => {
    const { result } = renderHook(() => useLiveRegion("assertive"));

    act(() => {
      result.current.announce("Urgent message");
    });

    expect(result.current.message).toBe("Urgent message");
  });

  it("should render LiveRegionComponent", () => {
    const { result } = renderHook(() => useLiveRegion());

    act(() => {
      result.current.announce("Test message");
    });

    const { LiveRegionComponent } = result.current;
    render(<LiveRegionComponent />);

    const liveRegion = screen.getByTestId("live-region");
    expect(liveRegion).toHaveTextContent("Test message");
  });
});
