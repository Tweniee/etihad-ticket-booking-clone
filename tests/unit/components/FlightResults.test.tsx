/**
 * Unit tests for FlightResults component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FlightResults } from "@/components/results/FlightResults";
import type { Flight, SearchCriteria } from "@/lib/types";

// Mock data
const mockSearchCriteria: SearchCriteria = {
  tripType: "one-way",
  segments: [
    {
      origin: {
        code: "JFK",
        name: "John F. Kennedy International Airport",
        city: "New York",
        country: "United States",
      },
      destination: {
        code: "LHR",
        name: "London Heathrow Airport",
        city: "London",
        country: "United Kingdom",
      },
      departureDate: new Date("2024-06-01"),
    },
  ],
  passengers: {
    adults: 1,
    children: 0,
    infants: 0,
  },
  cabinClass: "economy",
};

const createMockFlight = (id: string, price: number): Flight => ({
  id,
  airline: {
    code: "BA",
    name: "British Airways",
    logo: "/airlines/ba.png",
  },
  flightNumber: `BA${id}`,
  segments: [
    {
      departure: {
        airport: {
          code: "JFK",
          name: "John F. Kennedy International Airport",
          city: "New York",
          country: "United States",
        },
        dateTime: new Date("2024-06-01T20:00:00"),
        terminal: "7",
      },
      arrival: {
        airport: {
          code: "LHR",
          name: "London Heathrow Airport",
          city: "London",
          country: "United Kingdom",
        },
        dateTime: new Date("2024-06-02T08:00:00"),
        terminal: "5",
      },
      duration: 420,
      aircraft: "Boeing 777-300ER",
    },
  ],
  price: {
    amount: price,
    currency: "USD",
    breakdown: {
      baseFare: price * 0.8,
      taxes: price * 0.15,
      fees: price * 0.05,
    },
  },
  cabinClass: "economy",
  availableSeats: 15,
});

describe("FlightResults", () => {
  const mockOnSelectFlight = vi.fn();
  const mockOnModifySearch = vi.fn();
  const mockOnRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should display loading spinner when isLoading is true", () => {
      render(
        <FlightResults
          flights={[]}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
          isLoading={true}
        />,
      );

      expect(screen.getByTestId("flight-results-loading")).toBeInTheDocument();
      expect(
        screen.getByTestId("flight-results-loading-spinner"),
      ).toBeInTheDocument();
      expect(screen.getByText("Searching for flights...")).toBeInTheDocument();
    });

    it("should not display flights when loading", () => {
      const flights = [createMockFlight("1", 500)];

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
          isLoading={true}
        />,
      );

      expect(
        screen.queryByTestId("flight-results-list"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should display error message when error is provided", () => {
      const errorMessage = "Network error occurred";

      render(
        <FlightResults
          flights={[]}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
          error={errorMessage}
        />,
      );

      expect(screen.getByTestId("flight-results-error")).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it("should display retry button when onRetry is provided", () => {
      render(
        <FlightResults
          flights={[]}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
          error="Network error"
          onRetry={mockOnRetry}
        />,
      );

      const retryButton = screen.getByTestId(
        "flight-results-error-message-retry-button",
      );
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);
      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    it("should not display retry button when onRetry is not provided", () => {
      render(
        <FlightResults
          flights={[]}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
          error="Network error"
        />,
      );

      expect(
        screen.queryByTestId("flight-results-error-message-retry-button"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should display empty state when no flights are provided", () => {
      render(
        <FlightResults
          flights={[]}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      expect(screen.getByTestId("flight-results-empty")).toBeInTheDocument();
      expect(screen.getByText("No flights found")).toBeInTheDocument();
      expect(
        screen.getByText(
          /We couldn't find any flights matching your search criteria/,
        ),
      ).toBeInTheDocument();
    });

    it("should call onModifySearch when modify search button is clicked in empty state", () => {
      render(
        <FlightResults
          flights={[]}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      const modifyButton = screen.getByTestId(
        "flight-results-modify-search-button",
      );
      fireEvent.click(modifyButton);

      expect(mockOnModifySearch).toHaveBeenCalledTimes(1);
    });
  });

  describe("Flight Display", () => {
    it("should display flights when provided", () => {
      const flights = [createMockFlight("1", 500), createMockFlight("2", 600)];

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      expect(screen.getByTestId("flight-results")).toBeInTheDocument();
      expect(screen.getByTestId("flight-results-list")).toBeInTheDocument();
      expect(screen.getByText("Available Flights")).toBeInTheDocument();
    });

    it("should display correct flight count", () => {
      const flights = [
        createMockFlight("1", 500),
        createMockFlight("2", 600),
        createMockFlight("3", 700),
      ];

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      expect(screen.getByText("Showing 1-3 of 3 flights")).toBeInTheDocument();
    });

    it("should sort flights by price in ascending order (Requirement 3.3)", () => {
      const flights = [
        createMockFlight("1", 700),
        createMockFlight("2", 500),
        createMockFlight("3", 600),
      ];

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      // Check that the cheapest flight is displayed first
      expect(screen.getByTestId("flight-results-flight-2")).toBeInTheDocument();
      expect(screen.getByTestId("flight-results-flight-3")).toBeInTheDocument();
      expect(screen.getByTestId("flight-results-flight-1")).toBeInTheDocument();

      // Verify the order by checking the list container
      const listContainer = screen.getByTestId("flight-results-list");
      const flightCards = listContainer.querySelectorAll('[role="button"]');

      // First card should be the cheapest (flight-2 with price 500)
      expect(flightCards[0]).toHaveAttribute(
        "data-testid",
        "flight-results-flight-2",
      );

      // Second card should be flight-3 with price 600
      expect(flightCards[1]).toHaveAttribute(
        "data-testid",
        "flight-results-flight-3",
      );

      // Third card should be the most expensive (flight-1 with price 700)
      expect(flightCards[2]).toHaveAttribute(
        "data-testid",
        "flight-results-flight-1",
      );
    });

    it("should call onSelectFlight when a flight is clicked", () => {
      const flights = [createMockFlight("1", 500)];

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      const flightCard = screen.getByTestId("flight-results-flight-1");
      fireEvent.click(flightCard);

      expect(mockOnSelectFlight).toHaveBeenCalledTimes(1);
      expect(mockOnSelectFlight).toHaveBeenCalledWith(flights[0]);
    });

    it("should highlight selected flight", () => {
      const flights = [createMockFlight("1", 500), createMockFlight("2", 600)];

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
          selectedFlightId="2"
        />,
      );

      const selectedCard = screen.getByTestId("flight-results-flight-2");
      expect(selectedCard).toHaveClass("border-blue-600");
    });
  });

  describe("Pagination (Requirement 3.4)", () => {
    it("should display 20 flights per page by default", () => {
      const flights = Array.from({ length: 25 }, (_, i) =>
        createMockFlight(`${i + 1}`, 500 + i * 10),
      );

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      expect(
        screen.getByText("Showing 1-20 of 25 flights"),
      ).toBeInTheDocument();

      const listContainer = screen.getByTestId("flight-results-list");
      const flightCards = listContainer.querySelectorAll('[role="button"]');
      expect(flightCards).toHaveLength(20);
    });

    it("should not display pagination controls when flights fit on one page", () => {
      const flights = Array.from({ length: 15 }, (_, i) =>
        createMockFlight(`${i + 1}`, 500 + i * 10),
      );

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      expect(
        screen.queryByTestId("flight-results-pagination"),
      ).not.toBeInTheDocument();
    });

    it("should display pagination controls when flights exceed one page", () => {
      const flights = Array.from({ length: 25 }, (_, i) =>
        createMockFlight(`${i + 1}`, 500 + i * 10),
      );

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      expect(
        screen.getByTestId("flight-results-pagination"),
      ).toBeInTheDocument();
      expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    });

    it("should navigate to next page when next button is clicked", () => {
      const flights = Array.from({ length: 25 }, (_, i) =>
        createMockFlight(`${i + 1}`, 500 + i * 10),
      );

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      const nextButton = screen.getByTestId("flight-results-next-button");
      fireEvent.click(nextButton);

      expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
      expect(
        screen.getByText("Showing 21-25 of 25 flights"),
      ).toBeInTheDocument();
    });

    it("should navigate to previous page when previous button is clicked", () => {
      const flights = Array.from({ length: 25 }, (_, i) =>
        createMockFlight(`${i + 1}`, 500 + i * 10),
      );

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      // Go to page 2
      const nextButton = screen.getByTestId("flight-results-next-button");
      fireEvent.click(nextButton);

      // Go back to page 1
      const previousButton = screen.getByTestId(
        "flight-results-previous-button",
      );
      fireEvent.click(previousButton);

      expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
      expect(
        screen.getByText("Showing 1-20 of 25 flights"),
      ).toBeInTheDocument();
    });

    it("should disable previous button on first page", () => {
      const flights = Array.from({ length: 25 }, (_, i) =>
        createMockFlight(`${i + 1}`, 500 + i * 10),
      );

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      const previousButton = screen.getByTestId(
        "flight-results-previous-button",
      );
      expect(previousButton).toBeDisabled();
    });

    it("should disable next button on last page", () => {
      const flights = Array.from({ length: 25 }, (_, i) =>
        createMockFlight(`${i + 1}`, 500 + i * 10),
      );

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      // Go to last page
      const nextButton = screen.getByTestId("flight-results-next-button");
      fireEvent.click(nextButton);

      expect(nextButton).toBeDisabled();
    });

    it("should navigate to specific page when page number is clicked", () => {
      const flights = Array.from({ length: 45 }, (_, i) =>
        createMockFlight(`${i + 1}`, 500 + i * 10),
      );

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      const page2Button = screen.getByTestId("flight-results-page-2");
      fireEvent.click(page2Button);

      expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
      expect(
        screen.getByText("Showing 21-40 of 45 flights"),
      ).toBeInTheDocument();
    });

    it("should reset to page 1 when flights change", () => {
      const initialFlights = Array.from({ length: 25 }, (_, i) =>
        createMockFlight(`${i + 1}`, 500 + i * 10),
      );

      const { rerender } = render(
        <FlightResults
          flights={initialFlights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      // Go to page 2
      const nextButton = screen.getByTestId("flight-results-next-button");
      fireEvent.click(nextButton);
      expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();

      // Change flights
      const newFlights = Array.from({ length: 30 }, (_, i) =>
        createMockFlight(`new-${i + 1}`, 600 + i * 10),
      );

      rerender(
        <FlightResults
          flights={newFlights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      // Should be back on page 1
      expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    });

    it("should respect custom flightsPerPage prop", () => {
      const flights = Array.from({ length: 25 }, (_, i) =>
        createMockFlight(`${i + 1}`, 500 + i * 10),
      );

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
          flightsPerPage={10}
        />,
      );

      expect(
        screen.getByText("Showing 1-10 of 25 flights"),
      ).toBeInTheDocument();
      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for pagination", () => {
      const flights = Array.from({ length: 25 }, (_, i) =>
        createMockFlight(`${i + 1}`, 500 + i * 10),
      );

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      expect(screen.getByLabelText("Pagination")).toBeInTheDocument();
      expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
      expect(screen.getByLabelText("Next page")).toBeInTheDocument();
    });

    it("should have proper aria-current on current page", () => {
      const flights = Array.from({ length: 25 }, (_, i) =>
        createMockFlight(`${i + 1}`, 500 + i * 10),
      );

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      const page1Button = screen.getByTestId("flight-results-page-1");
      expect(page1Button).toHaveAttribute("aria-current", "page");
    });
  });

  describe("Edge Cases", () => {
    it("should handle exactly 20 flights without pagination", () => {
      const flights = Array.from({ length: 20 }, (_, i) =>
        createMockFlight(`${i + 1}`, 500 + i * 10),
      );

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      expect(
        screen.getByText("Showing 1-20 of 20 flights"),
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("flight-results-pagination"),
      ).not.toBeInTheDocument();
    });

    it("should handle exactly 21 flights with pagination", () => {
      const flights = Array.from({ length: 21 }, (_, i) =>
        createMockFlight(`${i + 1}`, 500 + i * 10),
      );

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      expect(
        screen.getByText("Showing 1-20 of 21 flights"),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("flight-results-pagination"),
      ).toBeInTheDocument();
      expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    });

    it("should handle single flight", () => {
      const flights = [createMockFlight("1", 500)];

      render(
        <FlightResults
          flights={flights}
          searchCriteria={mockSearchCriteria}
          onSelectFlight={mockOnSelectFlight}
          onModifySearch={mockOnModifySearch}
        />,
      );

      expect(screen.getByText("Showing 1-1 of 1 flights")).toBeInTheDocument();
      expect(
        screen.queryByTestId("flight-results-pagination"),
      ).not.toBeInTheDocument();
    });
  });
});
