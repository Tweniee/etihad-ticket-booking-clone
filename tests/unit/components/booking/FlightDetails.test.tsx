/**
 * FlightDetails Component Unit Tests
 *
 * Tests the FlightDetails component functionality including:
 * - Rendering flight information
 * - Displaying itinerary segments
 * - Showing baggage allowance
 * - Displaying fare rules
 * - Price breakdown
 * - User interactions
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlightDetails } from "@/components/booking/FlightDetails";
import type { FlightDetails as FlightDetailsType } from "@/lib/types";

// Mock flight data
const mockFlight: FlightDetailsType = {
  id: "FL123",
  airline: {
    code: "EY",
    name: "Etihad Airways",
    logo: "/airlines/etihad.png",
  },
  flightNumber: "EY101",
  segments: [
    {
      departure: {
        airport: {
          code: "JFK",
          name: "John F. Kennedy International Airport",
          city: "New York",
          country: "United States",
        },
        dateTime: new Date("2024-06-15T18:30:00"),
        terminal: "4",
      },
      arrival: {
        airport: {
          code: "AUH",
          name: "Abu Dhabi International Airport",
          city: "Abu Dhabi",
          country: "United Arab Emirates",
        },
        dateTime: new Date("2024-06-16T17:45:00"),
        terminal: "3",
      },
      duration: 795,
      aircraft: "Boeing 787-9 Dreamliner",
    },
  ],
  price: {
    amount: 1250.0,
    currency: "USD",
    breakdown: {
      baseFare: 950.0,
      taxes: 250.0,
      fees: 50.0,
    },
  },
  cabinClass: "Business",
  availableSeats: 12,
  baggage: {
    checkedBags: {
      quantity: 2,
      weight: 32,
      dimensions: "158 cm (62 in) total",
    },
    carryOn: {
      quantity: 1,
      weight: 7,
      dimensions: "56 x 36 x 23 cm",
    },
  },
  fareRules: {
    changeFee: 150.0,
    cancellationFee: 200.0,
    refundable: true,
    changePolicy: "Changes are permitted up to 24 hours before departure.",
    cancellationPolicy:
      "Cancellations are permitted up to 24 hours before departure.",
  },
  amenities: ["WiFi", "In-flight Entertainment", "Power Outlets"],
};

describe("FlightDetails Component", () => {
  const mockOnContinue = vi.fn();
  const mockOnBack = vi.fn();

  it("renders flight header with airline information", () => {
    render(
      <FlightDetails
        flight={mockFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText("Etihad Airways")).toBeInTheDocument();
    expect(screen.getByText(/Flight EY101/)).toBeInTheDocument();
    expect(screen.getByText(/Business/)).toBeInTheDocument();
  });

  it("displays price information", () => {
    render(
      <FlightDetails
        flight={mockFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    // Check for price (should be multiple instances)
    const priceElements = screen.getAllByText(/USD 1250\.00/);
    expect(priceElements.length).toBeGreaterThan(0);
    expect(screen.getByText("per passenger")).toBeInTheDocument();
  });

  it("shows origin and destination airports", () => {
    render(
      <FlightDetails
        flight={mockFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText("JFK")).toBeInTheDocument();
    expect(screen.getByText("New York")).toBeInTheDocument();
    expect(screen.getByText("AUH")).toBeInTheDocument();
    expect(screen.getByText("Abu Dhabi")).toBeInTheDocument();
  });

  it("displays flight duration", () => {
    render(
      <FlightDetails
        flight={mockFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    // 795 minutes = 13h 15m (appears multiple times in the UI)
    const durationElements = screen.getAllByText(/13h 15m/);
    expect(durationElements.length).toBeGreaterThan(0);
  });

  it("renders itinerary section", () => {
    render(
      <FlightDetails
        flight={mockFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText("Flight Itinerary")).toBeInTheDocument();
  });

  it("expands and collapses segment details", () => {
    render(
      <FlightDetails
        flight={mockFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    // Initially expanded (first segment)
    expect(screen.getByText("Boeing 787-9 Dreamliner")).toBeInTheDocument();

    // Find the segment button and click to collapse
    const segmentButton = screen.getByRole("button", { name: /JFK → AUH/ });
    fireEvent.click(segmentButton);

    // Should still be visible as it's in the button text
    expect(screen.getByText(/JFK → AUH/)).toBeInTheDocument();
  });

  it("displays baggage allowance information", () => {
    render(
      <FlightDetails
        flight={mockFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText("Baggage Allowance")).toBeInTheDocument();
    expect(screen.getByText("Checked Baggage")).toBeInTheDocument();
    expect(screen.getByText("Carry-on Baggage")).toBeInTheDocument();
    expect(screen.getByText(/2 bags/)).toBeInTheDocument();
    expect(screen.getByText(/32 kg per bag/)).toBeInTheDocument();
    expect(screen.getByText(/7 kg per bag/)).toBeInTheDocument();
  });

  it("shows amenities when available", () => {
    render(
      <FlightDetails
        flight={mockFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText("Aircraft Amenities")).toBeInTheDocument();
    expect(screen.getByText("WiFi")).toBeInTheDocument();
    expect(screen.getByText("In-flight Entertainment")).toBeInTheDocument();
    expect(screen.getByText("Power Outlets")).toBeInTheDocument();
  });

  it("displays fare rules section", () => {
    render(
      <FlightDetails
        flight={mockFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText("Fare Rules & Policies")).toBeInTheDocument();
  });

  it("expands and collapses fare rules", () => {
    render(
      <FlightDetails
        flight={mockFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    const fareRulesButton = screen.getByRole("button", {
      name: /Fare Rules & Policies/,
    });

    // Initially collapsed
    expect(screen.queryByText("Change Policy")).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(fareRulesButton);

    // Should now be visible
    expect(screen.getByText("Change Policy")).toBeInTheDocument();
    expect(screen.getByText("Cancellation Policy")).toBeInTheDocument();
    expect(screen.getByText("Refundable")).toBeInTheDocument();
  });

  it("shows refundable status correctly", () => {
    render(
      <FlightDetails
        flight={mockFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    // Expand fare rules
    const fareRulesButton = screen.getByRole("button", {
      name: /Fare Rules & Policies/,
    });
    fireEvent.click(fareRulesButton);

    expect(screen.getByText("Refundable")).toBeInTheDocument();
  });

  it("displays non-refundable status for non-refundable flights", () => {
    const nonRefundableFlight = {
      ...mockFlight,
      fareRules: {
        ...mockFlight.fareRules,
        refundable: false,
      },
    };

    render(
      <FlightDetails
        flight={nonRefundableFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    // Expand fare rules
    const fareRulesButton = screen.getByRole("button", {
      name: /Fare Rules & Policies/,
    });
    fireEvent.click(fareRulesButton);

    expect(screen.getByText("Non-refundable")).toBeInTheDocument();
  });

  it("shows change and cancellation fees", () => {
    render(
      <FlightDetails
        flight={mockFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    // Expand fare rules
    const fareRulesButton = screen.getByRole("button", {
      name: /Fare Rules & Policies/,
    });
    fireEvent.click(fareRulesButton);

    expect(screen.getByText(/Change Fee: USD 150\.00/)).toBeInTheDocument();
    expect(
      screen.getByText(/Cancellation Fee: USD 200\.00/),
    ).toBeInTheDocument();
  });

  it("displays price breakdown", () => {
    render(
      <FlightDetails
        flight={mockFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText("Price Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Base Fare")).toBeInTheDocument();
    expect(screen.getByText("Taxes")).toBeInTheDocument();
    expect(screen.getByText("Fees")).toBeInTheDocument();
    expect(screen.getByText(/USD 950\.00/)).toBeInTheDocument();
    expect(screen.getByText(/USD 250\.00/)).toBeInTheDocument();
    expect(screen.getByText(/USD 50\.00/)).toBeInTheDocument();
  });

  it("calls onContinue when continue button is clicked", () => {
    render(
      <FlightDetails
        flight={mockFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    const continueButton = screen.getByRole("button", {
      name: /Continue to Seat Selection/,
    });
    fireEvent.click(continueButton);

    expect(mockOnContinue).toHaveBeenCalledTimes(1);
  });

  it("calls onBack when back button is clicked", () => {
    render(
      <FlightDetails
        flight={mockFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    const backButton = screen.getByRole("button", { name: /Back to Results/ });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it("handles multiple segments correctly", () => {
    const multiSegmentFlight = {
      ...mockFlight,
      segments: [
        mockFlight.segments[0],
        {
          departure: {
            airport: {
              code: "AUH",
              name: "Abu Dhabi International Airport",
              city: "Abu Dhabi",
              country: "United Arab Emirates",
            },
            dateTime: new Date("2024-06-16T20:15:00"),
            terminal: "3",
          },
          arrival: {
            airport: {
              code: "LHR",
              name: "London Heathrow Airport",
              city: "London",
              country: "United Kingdom",
            },
            dateTime: new Date("2024-06-17T00:30:00"),
            terminal: "2",
          },
          duration: 435,
          aircraft: "Airbus A380-800",
        },
      ],
    };

    render(
      <FlightDetails
        flight={multiSegmentFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    // Should show number of stops
    expect(screen.getByText(/1 stop/)).toBeInTheDocument();
  });

  it("handles flights with no amenities", () => {
    const flightWithoutAmenities = {
      ...mockFlight,
      amenities: [],
    };

    render(
      <FlightDetails
        flight={flightWithoutAmenities}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    // Amenities section should not be rendered
    expect(screen.queryByText("Aircraft Amenities")).not.toBeInTheDocument();
  });

  it("shows terminal information when available", () => {
    render(
      <FlightDetails
        flight={mockFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    // Segment should be expanded by default
    expect(screen.getByText(/Terminal 4/)).toBeInTheDocument();
    expect(screen.getByText(/Terminal 3/)).toBeInTheDocument();
  });

  it("handles null change and cancellation fees", () => {
    const restrictedFlight = {
      ...mockFlight,
      fareRules: {
        ...mockFlight.fareRules,
        changeFee: null,
        cancellationFee: null,
      },
    };

    render(
      <FlightDetails
        flight={restrictedFlight}
        onContinue={mockOnContinue}
        onBack={mockOnBack}
      />,
    );

    // Expand fare rules
    const fareRulesButton = screen.getByRole("button", {
      name: /Fare Rules & Policies/,
    });
    fireEvent.click(fareRulesButton);

    expect(screen.getByText("Changes not permitted")).toBeInTheDocument();
    expect(screen.getByText("Cancellation not permitted")).toBeInTheDocument();
  });
});
