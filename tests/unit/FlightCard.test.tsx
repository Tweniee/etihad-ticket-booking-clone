/**
 * Unit tests for FlightCard component
 *
 * Tests specific examples and edge cases for the FlightCard component.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlightCard } from "@/components/results/FlightCard";
import type { Flight } from "@/lib/types";

// Mock flight data
const createMockFlight = (overrides?: Partial<Flight>): Flight => ({
  id: "FL001",
  airline: {
    code: "EY",
    name: "Etihad Airways",
    logo: "https://example.com/logo.png",
  },
  flightNumber: "EY 101",
  segments: [
    {
      departure: {
        airport: {
          code: "AUH",
          name: "Abu Dhabi International Airport",
          city: "Abu Dhabi",
          country: "United Arab Emirates",
        },
        dateTime: new Date("2024-06-15T14:30:00Z"),
        terminal: "3",
      },
      arrival: {
        airport: {
          code: "LHR",
          name: "London Heathrow Airport",
          city: "London",
          country: "United Kingdom",
        },
        dateTime: new Date("2024-06-15T19:45:00Z"),
        terminal: "4",
      },
      duration: 435, // 7h 15m
      aircraft: "Boeing 787-9",
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
  cabinClass: "economy",
  availableSeats: 12,
  ...overrides,
});

describe("FlightCard", () => {
  describe("Rendering", () => {
    it("renders flight card with all required information", () => {
      const flight = createMockFlight();
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      // Check airline information
      expect(screen.getByText("Etihad Airways")).toBeInTheDocument();
      expect(screen.getByText("EY 101")).toBeInTheDocument();

      // Check departure and arrival airports
      expect(screen.getByText("AUH")).toBeInTheDocument();
      expect(screen.getByText("LHR")).toBeInTheDocument();

      // Check stops
      expect(screen.getByText("Direct")).toBeInTheDocument();

      // Check cabin class
      expect(screen.getByText("economy")).toBeInTheDocument();

      // Check available seats
      expect(screen.getByText("12 seats left")).toBeInTheDocument();
    });

    it("renders airline logo with correct src and alt text", () => {
      const flight = createMockFlight();
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      const logo = screen.getByAltText("Etihad Airways logo");
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute("src", "https://example.com/logo.png");
    });

    it("displays correct duration format", () => {
      const flight = createMockFlight();
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      expect(screen.getByTestId("flight-card-duration")).toHaveTextContent(
        "7h 15m",
      );
    });

    it("displays price using PriceDisplay component", () => {
      const flight = createMockFlight();
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      // PriceDisplay should render the price
      expect(
        screen.getByTestId("flight-card-price-amount"),
      ).toBeInTheDocument();
    });
  });

  describe("Stops Display", () => {
    it('displays "Direct" for flights with no stops', () => {
      const flight = createMockFlight();
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      expect(screen.getByText("Direct")).toBeInTheDocument();
    });

    it('displays "1 stop" for flights with one stop', () => {
      const flight = createMockFlight({
        segments: [
          {
            departure: {
              airport: {
                code: "JFK",
                name: "JFK Airport",
                city: "New York",
                country: "USA",
              },
              dateTime: new Date("2024-06-15T10:00:00Z"),
            },
            arrival: {
              airport: {
                code: "LHR",
                name: "Heathrow Airport",
                city: "London",
                country: "UK",
              },
              dateTime: new Date("2024-06-15T22:00:00Z"),
            },
            duration: 420,
            aircraft: "Boeing 777",
          },
          {
            departure: {
              airport: {
                code: "LHR",
                name: "Heathrow Airport",
                city: "London",
                country: "UK",
              },
              dateTime: new Date("2024-06-16T08:00:00Z"),
            },
            arrival: {
              airport: {
                code: "DXB",
                name: "Dubai Airport",
                city: "Dubai",
                country: "UAE",
              },
              dateTime: new Date("2024-06-16T19:00:00Z"),
            },
            duration: 420,
            aircraft: "Airbus A380",
          },
        ],
      });
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      expect(screen.getByText("1 stop")).toBeInTheDocument();
    });

    it('displays "2 stops" for flights with two stops', () => {
      const flight = createMockFlight({
        segments: [
          {
            departure: {
              airport: {
                code: "LAX",
                name: "LAX Airport",
                city: "Los Angeles",
                country: "USA",
              },
              dateTime: new Date("2024-06-15T10:00:00Z"),
            },
            arrival: {
              airport: {
                code: "DXB",
                name: "Dubai Airport",
                city: "Dubai",
                country: "UAE",
              },
              dateTime: new Date("2024-06-16T10:00:00Z"),
            },
            duration: 870,
            aircraft: "Airbus A380",
          },
          {
            departure: {
              airport: {
                code: "DXB",
                name: "Dubai Airport",
                city: "Dubai",
                country: "UAE",
              },
              dateTime: new Date("2024-06-16T14:00:00Z"),
            },
            arrival: {
              airport: {
                code: "BOM",
                name: "Mumbai Airport",
                city: "Mumbai",
                country: "India",
              },
              dateTime: new Date("2024-06-16T18:00:00Z"),
            },
            duration: 210,
            aircraft: "Boeing 777",
          },
          {
            departure: {
              airport: {
                code: "BOM",
                name: "Mumbai Airport",
                city: "Mumbai",
                country: "India",
              },
              dateTime: new Date("2024-06-16T22:00:00Z"),
            },
            arrival: {
              airport: {
                code: "SIN",
                name: "Singapore Airport",
                city: "Singapore",
                country: "Singapore",
              },
              dateTime: new Date("2024-06-17T05:00:00Z"),
            },
            duration: 330,
            aircraft: "Airbus A350",
          },
        ],
      });
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      expect(screen.getByText("2 stops")).toBeInTheDocument();
    });
  });

  describe("Duration Formatting", () => {
    it("formats duration with hours and minutes", () => {
      const flight = createMockFlight({
        segments: [
          {
            ...createMockFlight().segments[0],
            duration: 435, // 7h 15m
          },
        ],
      });
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      expect(screen.getByTestId("flight-card-duration")).toHaveTextContent(
        "7h 15m",
      );
    });

    it("formats duration with only hours when minutes are zero", () => {
      const flight = createMockFlight({
        segments: [
          {
            ...createMockFlight().segments[0],
            duration: 420, // 7h
          },
        ],
      });
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      expect(screen.getByTestId("flight-card-duration")).toHaveTextContent(
        "7h",
      );
    });

    it("formats duration with only minutes when less than an hour", () => {
      const flight = createMockFlight({
        segments: [
          {
            ...createMockFlight().segments[0],
            duration: 45, // 45m
          },
        ],
      });
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      expect(screen.getByTestId("flight-card-duration")).toHaveTextContent(
        "45m",
      );
    });
  });

  describe("Interaction", () => {
    it("calls onSelect when card is clicked", () => {
      const flight = createMockFlight();
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      const card = screen.getByTestId("flight-card");
      fireEvent.click(card);

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(flight);
    });

    it("calls onSelect when Enter key is pressed", () => {
      const flight = createMockFlight();
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      const card = screen.getByTestId("flight-card");
      fireEvent.keyDown(card, { key: "Enter" });

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(flight);
    });

    it("calls onSelect when Space key is pressed", () => {
      const flight = createMockFlight();
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      const card = screen.getByTestId("flight-card");
      fireEvent.keyDown(card, { key: " " });

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(flight);
    });

    it("does not call onSelect for other keys", () => {
      const flight = createMockFlight();
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      const card = screen.getByTestId("flight-card");
      fireEvent.keyDown(card, { key: "a" });

      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe("Selection State", () => {
    it("applies selected styling when isSelected is true", () => {
      const flight = createMockFlight();
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} isSelected />);

      const card = screen.getByTestId("flight-card");
      expect(card).toHaveClass("border-blue-600");
      expect(card).toHaveClass("bg-blue-50");
    });

    it("does not apply selected styling when isSelected is false", () => {
      const flight = createMockFlight();
      const onSelect = vi.fn();

      render(
        <FlightCard flight={flight} onSelect={onSelect} isSelected={false} />,
      );

      const card = screen.getByTestId("flight-card");
      expect(card).not.toHaveClass("border-blue-600");
      expect(card).not.toHaveClass("bg-blue-50");
    });
  });

  describe("Accessibility", () => {
    it("has role button", () => {
      const flight = createMockFlight();
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      const card = screen.getByTestId("flight-card");
      expect(card).toHaveAttribute("role", "button");
    });

    it("has tabIndex 0 for keyboard navigation", () => {
      const flight = createMockFlight();
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      const card = screen.getByTestId("flight-card");
      expect(card).toHaveAttribute("tabIndex", "0");
    });

    it("has descriptive aria-label", () => {
      const flight = createMockFlight();
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      const card = screen.getByTestId("flight-card");
      const ariaLabel = card.getAttribute("aria-label");

      expect(ariaLabel).toContain("EY 101");
      expect(ariaLabel).toContain("AUH");
      expect(ariaLabel).toContain("LHR");
      expect(ariaLabel).toContain("Direct");
      expect(ariaLabel).toContain("USD");
      expect(ariaLabel).toContain("1250");
    });
  });

  describe("Custom Props", () => {
    it("applies custom className", () => {
      const flight = createMockFlight();
      const onSelect = vi.fn();

      render(
        <FlightCard
          flight={flight}
          onSelect={onSelect}
          className="custom-class"
        />,
      );

      const card = screen.getByTestId("flight-card");
      expect(card).toHaveClass("custom-class");
    });

    it("uses custom testId", () => {
      const flight = createMockFlight();
      const onSelect = vi.fn();

      render(
        <FlightCard
          flight={flight}
          onSelect={onSelect}
          testId="custom-test-id"
        />,
      );

      expect(screen.getByTestId("custom-test-id")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles flights with very long airline names", () => {
      const flight = createMockFlight({
        airline: {
          code: "XX",
          name: "Very Long Airline Name That Should Not Break Layout",
          logo: "https://example.com/logo.png",
        },
      });
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      expect(
        screen.getByText("Very Long Airline Name That Should Not Break Layout"),
      ).toBeInTheDocument();
    });

    it("handles flights with 0 available seats", () => {
      const flight = createMockFlight({
        availableSeats: 0,
      });
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      expect(screen.getByText("0 seats left")).toBeInTheDocument();
    });

    it("handles flights with large number of available seats", () => {
      const flight = createMockFlight({
        availableSeats: 999,
      });
      const onSelect = vi.fn();

      render(<FlightCard flight={flight} onSelect={onSelect} />);

      expect(screen.getByText("999 seats left")).toBeInTheDocument();
    });

    it("handles different cabin classes", () => {
      const cabinClasses = ["economy", "business", "first"];

      cabinClasses.forEach((cabinClass) => {
        const flight = createMockFlight({
          cabinClass,
        });
        const onSelect = vi.fn();

        const { unmount } = render(
          <FlightCard flight={flight} onSelect={onSelect} />,
        );

        expect(screen.getByText(cabinClass)).toBeInTheDocument();

        unmount();
      });
    });
  });
});
