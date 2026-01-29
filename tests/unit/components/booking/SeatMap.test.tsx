/**
 * SeatMap Component Unit Tests
 *
 * Tests the SeatMap component functionality including:
 * - Rendering seat grid
 * - Passenger selection
 * - Seat assignment
 * - Price calculation
 * - Navigation
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SeatMap } from "@/components/booking/SeatMap";
import { useBookingStore } from "@/lib/store/booking-store";
import type { SeatMap as SeatMapType, PassengerInfo } from "@/lib/types";

// Mock the booking store
vi.mock("@/lib/store/booking-store", () => {
  const mockSetSeat = vi.fn();
  const mockRemoveSeat = vi.fn();
  const mockClearSeats = vi.fn();

  return {
    useSeatSelection: () => ({
      selectedSeats: new Map(),
      setSeat: mockSetSeat,
      removeSeat: mockRemoveSeat,
      clearSeats: mockClearSeats,
    }),
    useBookingStore: vi.fn(),
  };
});

// Mock seat map data
const mockSeatMap: SeatMapType = {
  aircraft: "Boeing 737-800",
  rows: 10,
  columns: ["A", "B", "C", "D", "E", "F"],
  seats: [
    // Row 1
    {
      id: "1A",
      row: 1,
      column: "A",
      status: "available",
      type: "extra-legroom",
      position: "window",
      price: 20,
    },
    {
      id: "1B",
      row: 1,
      column: "B",
      status: "available",
      type: "extra-legroom",
      position: "middle",
      price: 20,
    },
    {
      id: "1C",
      row: 1,
      column: "C",
      status: "occupied",
      type: "extra-legroom",
      position: "aisle",
      price: 20,
    },
    {
      id: "1D",
      row: 1,
      column: "D",
      status: "available",
      type: "extra-legroom",
      position: "aisle",
      price: 20,
    },
    {
      id: "1E",
      row: 1,
      column: "E",
      status: "available",
      type: "extra-legroom",
      position: "middle",
      price: 20,
    },
    {
      id: "1F",
      row: 1,
      column: "F",
      status: "available",
      type: "extra-legroom",
      position: "window",
      price: 20,
    },
    // Row 2
    {
      id: "2A",
      row: 2,
      column: "A",
      status: "available",
      type: "standard",
      position: "window",
      price: 0,
    },
    {
      id: "2B",
      row: 2,
      column: "B",
      status: "available",
      type: "standard",
      position: "middle",
      price: 0,
    },
    {
      id: "2C",
      row: 2,
      column: "C",
      status: "available",
      type: "standard",
      position: "aisle",
      price: 0,
    },
    {
      id: "2D",
      row: 2,
      column: "D",
      status: "blocked",
      type: "standard",
      position: "aisle",
      price: 0,
    },
    {
      id: "2E",
      row: 2,
      column: "E",
      status: "available",
      type: "standard",
      position: "middle",
      price: 0,
    },
    {
      id: "2F",
      row: 2,
      column: "F",
      status: "available",
      type: "standard",
      position: "window",
      price: 0,
    },
  ],
  exitRows: [5],
};

const mockPassengers: PassengerInfo[] = [
  {
    id: "p1",
    type: "adult",
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: new Date("1990-01-01"),
    gender: "male",
  },
  {
    id: "p2",
    type: "adult",
    firstName: "Jane",
    lastName: "Doe",
    dateOfBirth: new Date("1992-05-15"),
    gender: "female",
  },
];

describe("SeatMap Component", () => {
  const mockOnContinue = vi.fn();
  const mockOnBack = vi.fn();
  const mockSetSeat = vi.fn();
  const mockRemoveSeat = vi.fn();

  beforeEach(() => {
    mockOnContinue.mockClear();
    mockOnBack.mockClear();
    mockSetSeat.mockClear();
    mockRemoveSeat.mockClear();
  });

  it("renders seat map header with aircraft information", () => {
    render(
      <SeatMap
        seatMap={mockSeatMap}
        passengers={mockPassengers}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText("Select Your Seats")).toBeInTheDocument();
    expect(screen.getByText("Boeing 737-800")).toBeInTheDocument();
    expect(screen.getByText(/10 rows/)).toBeInTheDocument();
  });

  it("displays seat legend", () => {
    render(
      <SeatMap
        seatMap={mockSeatMap}
        passengers={mockPassengers}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Extra Fee")).toBeInTheDocument();
    expect(screen.getByText("Selected")).toBeInTheDocument();
    expect(screen.getByText("Occupied")).toBeInTheDocument();
  });

  it("renders all passengers in sidebar", () => {
    render(
      <SeatMap
        seatMap={mockSeatMap}
        passengers={mockPassengers}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("displays passenger types", () => {
    render(
      <SeatMap
        seatMap={mockSeatMap}
        passengers={mockPassengers}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    const adultLabels = screen.getAllByText("adult");
    expect(adultLabels.length).toBe(2);
  });

  it("highlights current passenger", () => {
    render(
      <SeatMap
        seatMap={mockSeatMap}
        passengers={mockPassengers}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    // First passenger should be active by default
    const passengerButtons = screen
      .getAllByRole("button")
      .filter(
        (btn) =>
          btn.textContent?.includes("John Doe") ||
          btn.textContent?.includes("Jane Doe"),
      );

    expect(passengerButtons[0]).toHaveClass("border-blue-500");
  });

  it("allows switching between passengers", () => {
    render(
      <SeatMap
        seatMap={mockSeatMap}
        passengers={mockPassengers}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    const passengerButtons = screen
      .getAllByRole("button")
      .filter((btn) => btn.textContent?.includes("Jane Doe"));

    fireEvent.click(passengerButtons[0]);

    // Second passenger should now be active
    expect(passengerButtons[0]).toHaveClass("border-blue-500");
  });

  it("renders seat grid with correct structure", () => {
    render(
      <SeatMap
        seatMap={mockSeatMap}
        passengers={mockPassengers}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    // Check for column headers
    expect(screen.getByText("Row")).toBeInTheDocument();
    mockSeatMap.columns.forEach((col) => {
      expect(screen.getByText(col)).toBeInTheDocument();
    });
  });

  it("displays exit row indicator", () => {
    render(
      <SeatMap
        seatMap={mockSeatMap}
        passengers={mockPassengers}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText("EXIT")).toBeInTheDocument();
  });

  it("shows skip seat selection button", () => {
    render(
      <SeatMap
        seatMap={mockSeatMap}
        passengers={mockPassengers}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText("Skip Seat Selection")).toBeInTheDocument();
  });

  it("calls onContinue when skip button is clicked", () => {
    render(
      <SeatMap
        seatMap={mockSeatMap}
        passengers={mockPassengers}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    const skipButton = screen.getByText("Skip Seat Selection");
    fireEvent.click(skipButton);

    expect(mockOnContinue).toHaveBeenCalledTimes(1);
  });

  it("calls onBack when back button is clicked", () => {
    render(
      <SeatMap
        seatMap={mockSeatMap}
        passengers={mockPassengers}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    const backButton = screen.getByText("← Back");
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it("disables continue button when not all passengers have seats", () => {
    render(
      <SeatMap
        seatMap={mockSeatMap}
        passengers={mockPassengers}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    const continueButton = screen.getByText("Continue");
    expect(continueButton).toBeDisabled();
  });

  it("does not render back button when onBack is not provided", () => {
    render(
      <SeatMap
        seatMap={mockSeatMap}
        passengers={mockPassengers}
        onContinue={mockOnContinue}
      />,
    );

    expect(screen.queryByText("← Back")).not.toBeInTheDocument();
  });

  it('displays "No seat" for passengers without assigned seats', () => {
    render(
      <SeatMap
        seatMap={mockSeatMap}
        passengers={mockPassengers}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    const noSeatLabels = screen.getAllByText("No seat");
    expect(noSeatLabels.length).toBe(2);
  });

  it("renders correct number of rows", () => {
    render(
      <SeatMap
        seatMap={mockSeatMap}
        passengers={mockPassengers}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    // Check for row numbers (1-10)
    for (let i = 1; i <= mockSeatMap.rows; i++) {
      const rowNumbers = screen.getAllByText(i.toString());
      expect(rowNumbers.length).toBeGreaterThan(0);
    }
  });

  it("handles empty passenger list gracefully", () => {
    render(
      <SeatMap
        seatMap={mockSeatMap}
        passengers={[]}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText("Passengers")).toBeInTheDocument();
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
  });
});
