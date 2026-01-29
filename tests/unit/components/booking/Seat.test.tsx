/**
 * Seat Component Unit Tests
 *
 * Tests the Seat component functionality including:
 * - Rendering seat information
 * - Visual indicators for seat status
 * - Seat selection interaction
 * - Accessibility features
 * - Tooltip display
 *
 * Requirements: 6.2, 6.3, 6.5
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Seat } from "@/components/booking/Seat";
import type { Seat as SeatType } from "@/lib/types";

// Mock seat data
const mockAvailableSeat: SeatType = {
  id: "12A",
  row: 12,
  column: "A",
  status: "available",
  type: "standard",
  position: "window",
  price: 0,
};

const mockPremiumSeat: SeatType = {
  id: "5B",
  row: 5,
  column: "B",
  status: "available",
  type: "extra-legroom",
  position: "middle",
  price: 20,
};

const mockOccupiedSeat: SeatType = {
  id: "10C",
  row: 10,
  column: "C",
  status: "occupied",
  type: "standard",
  position: "aisle",
  price: 0,
};

const mockBlockedSeat: SeatType = {
  id: "15D",
  row: 15,
  column: "D",
  status: "blocked",
  type: "standard",
  position: "middle",
  price: 0,
};

describe("Seat Component", () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it("renders seat with column letter", () => {
    render(
      <Seat
        seat={mockAvailableSeat}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("displays available seat with correct styling", () => {
    render(
      <Seat
        seat={mockAvailableSeat}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-gray-100");
    expect(button).not.toHaveClass("cursor-not-allowed");
  });

  it("displays premium seat with extra fee styling", () => {
    render(
      <Seat
        seat={mockPremiumSeat}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-green-100");
  });

  it("displays selected seat with correct styling", () => {
    render(
      <Seat
        seat={mockAvailableSeat}
        isSelected={true}
        onSelect={mockOnSelect}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-blue-600");
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("displays occupied seat as disabled", () => {
    render(
      <Seat
        seat={mockOccupiedSeat}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("cursor-not-allowed");
  });

  it("displays blocked seat as disabled", () => {
    render(
      <Seat
        seat={mockBlockedSeat}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("cursor-not-allowed");
  });

  it("calls onSelect when available seat is clicked", () => {
    render(
      <Seat
        seat={mockAvailableSeat}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(mockAvailableSeat);
  });

  it("does not call onSelect when occupied seat is clicked", () => {
    render(
      <Seat
        seat={mockOccupiedSeat}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it("does not call onSelect when disabled prop is true", () => {
    render(
      <Seat
        seat={mockAvailableSeat}
        isSelected={false}
        onSelect={mockOnSelect}
        disabled={true}
      />,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it("supports keyboard navigation with Enter key", () => {
    render(
      <Seat
        seat={mockAvailableSeat}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );

    const button = screen.getByRole("button");
    fireEvent.keyDown(button, { key: "Enter" });

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard navigation with Space key", () => {
    render(
      <Seat
        seat={mockAvailableSeat}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );

    const button = screen.getByRole("button");
    fireEvent.keyDown(button, { key: " " });

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it("has proper ARIA label with seat information", () => {
    render(
      <Seat
        seat={mockAvailableSeat}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label");
    expect(button.getAttribute("aria-label")).toContain("12A");
    expect(button.getAttribute("aria-label")).toContain("Standard");
    expect(button.getAttribute("aria-label")).toContain("available");
  });

  it("includes price in ARIA label for premium seats", () => {
    render(
      <Seat
        seat={mockPremiumSeat}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );

    const button = screen.getByRole("button");
    expect(button.getAttribute("aria-label")).toContain("$20 extra");
  });

  it("has correct test id", () => {
    render(
      <Seat
        seat={mockAvailableSeat}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );

    expect(screen.getByTestId("seat-12A")).toBeInTheDocument();
  });

  it("applies focus ring for keyboard navigation", () => {
    render(
      <Seat
        seat={mockAvailableSeat}
        isSelected={false}
        onSelect={mockOnSelect}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("focus:ring-2");
    expect(button).toHaveClass("focus:ring-blue-500");
  });
});
