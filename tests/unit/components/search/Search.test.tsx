/**
 * Unit tests for Search component
 *
 * Tests specific examples and edge cases for the flight search form
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Search } from "@/components/search/Search";
import type { Airport, SearchCriteria } from "@/lib/types";

// Mock airports for testing
const mockAirports: Airport[] = [
  {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
  },
  {
    code: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    country: "United Kingdom",
  },
  {
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
  },
];

// Mock airport search function
const mockAirportSearch = vi.fn(async (query: string): Promise<Airport[]> => {
  const lowerQuery = query.toLowerCase();
  return mockAirports.filter(
    (airport) =>
      airport.code.toLowerCase().includes(lowerQuery) ||
      airport.name.toLowerCase().includes(lowerQuery) ||
      airport.city.toLowerCase().includes(lowerQuery),
  );
});

describe("Search Component", () => {
  describe("Trip Type Selection", () => {
    it("renders with round-trip selected by default", () => {
      const onSearch = vi.fn();
      render(
        <Search onSearch={onSearch} onAirportSearch={mockAirportSearch} />,
      );

      const roundTripButton = screen.getByRole("button", {
        name: /round trip/i,
      });
      expect(roundTripButton).toHaveAttribute("aria-pressed", "true");
    });

    it("switches to one-way when one-way button is clicked", async () => {
      const onSearch = vi.fn();
      render(
        <Search onSearch={onSearch} onAirportSearch={mockAirportSearch} />,
      );

      const oneWayButton = screen.getByRole("button", { name: /one way/i });
      await userEvent.click(oneWayButton);

      expect(oneWayButton).toHaveAttribute("aria-pressed", "true");
    });

    it("switches to multi-city when multi-city button is clicked", async () => {
      const onSearch = vi.fn();
      render(
        <Search onSearch={onSearch} onAirportSearch={mockAirportSearch} />,
      );

      const multiCityButton = screen.getByRole("button", {
        name: /multi-city/i,
      });
      await userEvent.click(multiCityButton);

      expect(multiCityButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("Passenger Counter", () => {
    it("starts with 1 adult by default", () => {
      const onSearch = vi.fn();
      render(
        <Search onSearch={onSearch} onAirportSearch={mockAirportSearch} />,
      );

      // Find the adults counter value - look for the parent container
      const adultsSection = screen
        .getByText("Adults")
        .closest("div")?.parentElement;
      expect(adultsSection).toHaveTextContent("1");
    });

    it("increments adult count when plus button is clicked", async () => {
      const onSearch = vi.fn();
      render(
        <Search onSearch={onSearch} onAirportSearch={mockAirportSearch} />,
      );

      const increaseAdultsButton = screen.getByLabelText("Increase adults");
      await userEvent.click(increaseAdultsButton);

      const adultsSection = screen
        .getByText("Adults")
        .closest("div")?.parentElement;
      expect(adultsSection).toHaveTextContent("2");
    });

    it("decrements adult count when minus button is clicked", async () => {
      const onSearch = vi.fn();
      render(
        <Search onSearch={onSearch} onAirportSearch={mockAirportSearch} />,
      );

      // First increase to 2
      const increaseAdultsButton = screen.getByLabelText("Increase adults");
      await userEvent.click(increaseAdultsButton);

      // Then decrease back to 1
      const decreaseAdultsButton = screen.getByLabelText("Decrease adults");
      await userEvent.click(decreaseAdultsButton);

      const adultsSection = screen
        .getByText("Adults")
        .closest("div")?.parentElement;
      expect(adultsSection).toHaveTextContent("1");
    });

    it("does not allow adult count below 1", async () => {
      const onSearch = vi.fn();
      render(
        <Search onSearch={onSearch} onAirportSearch={mockAirportSearch} />,
      );

      const decreaseAdultsButton = screen.getByLabelText("Decrease adults");
      expect(decreaseAdultsButton).toBeDisabled();
    });

    it("does not allow total passengers above 9", async () => {
      const onSearch = vi.fn();
      render(
        <Search onSearch={onSearch} onAirportSearch={mockAirportSearch} />,
      );

      // Increase adults to 9
      const increaseAdultsButton = screen.getByLabelText("Increase adults");
      for (let i = 0; i < 8; i++) {
        await userEvent.click(increaseAdultsButton);
      }

      // Try to add a child - should be disabled
      const increaseChildrenButton = screen.getByLabelText("Increase children");
      expect(increaseChildrenButton).toBeDisabled();
    });

    it("does not allow infants to exceed adults", async () => {
      const onSearch = vi.fn();
      render(
        <Search onSearch={onSearch} onAirportSearch={mockAirportSearch} />,
      );

      // With 1 adult, try to add 2 infants
      const increaseInfantsButton = screen.getByLabelText("Increase infants");
      await userEvent.click(increaseInfantsButton);

      // Second click should be disabled
      expect(increaseInfantsButton).toBeDisabled();
    });
  });

  describe("Cabin Class Selection", () => {
    it("selects economy by default", () => {
      const onSearch = vi.fn();
      render(
        <Search onSearch={onSearch} onAirportSearch={mockAirportSearch} />,
      );

      const economyRadio = screen.getByRole("radio", { name: /economy/i });
      expect(economyRadio).toBeChecked();
    });

    it("allows selecting business class", async () => {
      const onSearch = vi.fn();
      render(
        <Search onSearch={onSearch} onAirportSearch={mockAirportSearch} />,
      );

      const businessRadio = screen.getByRole("radio", { name: /business/i });
      await userEvent.click(businessRadio);

      expect(businessRadio).toBeChecked();
    });

    it("allows selecting first class", async () => {
      const onSearch = vi.fn();
      render(
        <Search onSearch={onSearch} onAirportSearch={mockAirportSearch} />,
      );

      const firstRadio = screen.getByRole("radio", { name: /first class/i });
      await userEvent.click(firstRadio);

      expect(firstRadio).toBeChecked();
    });
  });

  describe("Multi-City Segments", () => {
    it("allows adding flight segments up to 5", async () => {
      const onSearch = vi.fn();
      render(
        <Search onSearch={onSearch} onAirportSearch={mockAirportSearch} />,
      );

      // Switch to multi-city
      const multiCityButton = screen.getByRole("button", {
        name: /multi-city/i,
      });
      await userEvent.click(multiCityButton);

      // Should start with 2 segments
      expect(screen.getByText("Flight 1")).toBeInTheDocument();
      expect(screen.getByText("Flight 2")).toBeInTheDocument();

      // Add more flights
      const addFlightButton = screen.getByRole("button", {
        name: /add another flight/i,
      });

      await userEvent.click(addFlightButton);
      expect(screen.getByText("Flight 3")).toBeInTheDocument();

      await userEvent.click(addFlightButton);
      expect(screen.getByText("Flight 4")).toBeInTheDocument();

      await userEvent.click(addFlightButton);
      expect(screen.getByText("Flight 5")).toBeInTheDocument();

      // Button should disappear after 5 segments
      expect(
        screen.queryByRole("button", { name: /add another flight/i }),
      ).not.toBeInTheDocument();
    });

    it("allows removing flight segments", async () => {
      const onSearch = vi.fn();
      render(
        <Search onSearch={onSearch} onAirportSearch={mockAirportSearch} />,
      );

      // Switch to multi-city
      const multiCityButton = screen.getByRole("button", {
        name: /multi-city/i,
      });
      await userEvent.click(multiCityButton);

      // Add a third flight
      const addFlightButton = screen.getByRole("button", {
        name: /add another flight/i,
      });
      await userEvent.click(addFlightButton);

      expect(screen.getByText("Flight 3")).toBeInTheDocument();

      // Remove the third flight
      const removeButton = screen.getByLabelText("Remove flight 3");
      await userEvent.click(removeButton);

      expect(screen.queryByText("Flight 3")).not.toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("disables submit button when loading", () => {
      const onSearch = vi.fn();
      render(
        <Search
          onSearch={onSearch}
          onAirportSearch={mockAirportSearch}
          isLoading={true}
        />,
      );

      const submitButton = screen.getByRole("button", { name: /searching/i });
      expect(submitButton).toBeDisabled();
    });

    it("shows loading spinner when loading", () => {
      const onSearch = vi.fn();
      render(
        <Search
          onSearch={onSearch}
          onAirportSearch={mockAirportSearch}
          isLoading={true}
        />,
      );

      expect(screen.getByText("Searching...")).toBeInTheDocument();
    });
  });

  describe("Initial Values", () => {
    it("renders with provided initial values", () => {
      const onSearch = vi.fn();
      const initialValues = {
        tripType: "one-way" as const,
        segments: [
          {
            origin: mockAirports[0],
            destination: mockAirports[1],
            departureDate: new Date("2024-06-15"),
          },
        ],
        passengers: {
          adults: 2,
          children: 1,
          infants: 0,
        },
        cabinClass: "business" as const,
      };

      render(
        <Search
          initialValues={initialValues}
          onSearch={onSearch}
          onAirportSearch={mockAirportSearch}
        />,
      );

      // Check trip type
      const oneWayButton = screen.getByRole("button", { name: /one way/i });
      expect(oneWayButton).toHaveAttribute("aria-pressed", "true");

      // Check passengers
      const adultsSection = screen
        .getByText("Adults")
        .closest("div")?.parentElement;
      expect(adultsSection).toHaveTextContent("2");

      const childrenSection = screen
        .getByText("Children")
        .closest("div")?.parentElement;
      expect(childrenSection).toHaveTextContent("1");

      // Check cabin class
      const businessRadio = screen.getByRole("radio", { name: /business/i });
      expect(businessRadio).toBeChecked();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels on buttons", () => {
      const onSearch = vi.fn();
      render(
        <Search onSearch={onSearch} onAirportSearch={mockAirportSearch} />,
      );

      expect(screen.getByLabelText("Increase adults")).toBeInTheDocument();
      expect(screen.getByLabelText("Decrease adults")).toBeInTheDocument();
      expect(screen.getByLabelText("Increase children")).toBeInTheDocument();
      expect(screen.getByLabelText("Decrease children")).toBeInTheDocument();
      expect(screen.getByLabelText("Increase infants")).toBeInTheDocument();
      expect(screen.getByLabelText("Decrease infants")).toBeInTheDocument();
    });

    it("has proper aria-pressed attributes on trip type buttons", () => {
      const onSearch = vi.fn();
      render(
        <Search onSearch={onSearch} onAirportSearch={mockAirportSearch} />,
      );

      const roundTripButton = screen.getByRole("button", {
        name: /round trip/i,
      });
      const oneWayButton = screen.getByRole("button", { name: /one way/i });
      const multiCityButton = screen.getByRole("button", {
        name: /multi-city/i,
      });

      expect(roundTripButton).toHaveAttribute("aria-pressed", "true");
      expect(oneWayButton).toHaveAttribute("aria-pressed", "false");
      expect(multiCityButton).toHaveAttribute("aria-pressed", "false");
    });
  });
});
