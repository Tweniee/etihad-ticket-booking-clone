import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  FilterSidebar,
  applyFilters,
  getInitialFilters,
  type FlightFilters,
} from "@/components/results/FilterSidebar";
import type { Flight } from "@/lib/types";

// Mock flight data
const mockFlights: Flight[] = [
  {
    id: "1",
    airline: { code: "AA", name: "American Airlines", logo: "/aa.png" },
    flightNumber: "AA100",
    segments: [
      {
        departure: {
          airport: {
            code: "JFK",
            name: "JFK Airport",
            city: "New York",
            country: "USA",
          },
          dateTime: new Date("2024-06-01T08:00:00"),
        },
        arrival: {
          airport: {
            code: "LHR",
            name: "Heathrow",
            city: "London",
            country: "UK",
          },
          dateTime: new Date("2024-06-01T20:00:00"),
        },
        duration: 420, // 7 hours
        aircraft: "Boeing 777",
      },
    ],
    price: {
      amount: 500,
      currency: "USD",
      breakdown: { baseFare: 400, taxes: 80, fees: 20 },
    },
    cabinClass: "economy",
    availableSeats: 50,
  },
  {
    id: "2",
    airline: { code: "BA", name: "British Airways", logo: "/ba.png" },
    flightNumber: "BA200",
    segments: [
      {
        departure: {
          airport: {
            code: "JFK",
            name: "JFK Airport",
            city: "New York",
            country: "USA",
          },
          dateTime: new Date("2024-06-01T14:00:00"),
        },
        arrival: {
          airport: {
            code: "LHR",
            name: "Heathrow",
            city: "London",
            country: "UK",
          },
          dateTime: new Date("2024-06-02T02:00:00"),
        },
        duration: 480, // 8 hours
        aircraft: "Airbus A380",
      },
    ],
    price: {
      amount: 800,
      currency: "USD",
      breakdown: { baseFare: 650, taxes: 120, fees: 30 },
    },
    cabinClass: "business",
    availableSeats: 20,
  },
  {
    id: "3",
    airline: { code: "AA", name: "American Airlines", logo: "/aa.png" },
    flightNumber: "AA300",
    segments: [
      {
        departure: {
          airport: {
            code: "JFK",
            name: "JFK Airport",
            city: "New York",
            country: "USA",
          },
          dateTime: new Date("2024-06-01T20:00:00"),
        },
        arrival: {
          airport: {
            code: "ORD",
            name: "O'Hare",
            city: "Chicago",
            country: "USA",
          },
          dateTime: new Date("2024-06-01T22:00:00"),
        },
        duration: 120, // 2 hours
        aircraft: "Boeing 737",
      },
      {
        departure: {
          airport: {
            code: "ORD",
            name: "O'Hare",
            city: "Chicago",
            country: "USA",
          },
          dateTime: new Date("2024-06-02T01:00:00"),
        },
        arrival: {
          airport: {
            code: "LHR",
            name: "Heathrow",
            city: "London",
            country: "UK",
          },
          dateTime: new Date("2024-06-02T13:00:00"),
        },
        duration: 480, // 8 hours
        aircraft: "Boeing 777",
      },
    ],
    price: {
      amount: 600,
      currency: "USD",
      breakdown: { baseFare: 480, taxes: 100, fees: 20 },
    },
    cabinClass: "economy",
    availableSeats: 30,
  },
];

describe("FilterSidebar", () => {
  it("renders filter sections", () => {
    const mockOnFiltersChange = vi.fn();
    const initialFilters = getInitialFilters(mockFlights);

    render(
      <FilterSidebar
        flights={mockFlights}
        filters={initialFilters}
        onFiltersChange={mockOnFiltersChange}
      />,
    );

    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByText("Price Range")).toBeInTheDocument();
    expect(screen.getByText("Flight Duration")).toBeInTheDocument();
    expect(screen.getByText("Number of Stops")).toBeInTheDocument();
    expect(screen.getByText("Airlines")).toBeInTheDocument();
    expect(screen.getByText("Departure Time")).toBeInTheDocument();
  });

  it("displays active filter count", () => {
    const mockOnFiltersChange = vi.fn();
    const filters: FlightFilters = {
      priceRange: { min: 500, max: 700 },
      durationRange: { min: 0, max: 1440 },
      stops: [0],
      airlines: ["AA"],
      departureTimeRanges: ["morning"],
    };

    render(
      <FilterSidebar
        flights={mockFlights}
        filters={filters}
        onFiltersChange={mockOnFiltersChange}
      />,
    );

    // Should show 4 active filters (price, stops, airlines, departure time)
    const activeCount = screen.getByTestId("filter-sidebar-active-count");
    expect(activeCount).toBeInTheDocument();
  });

  it("calls onFiltersChange when stop filter is changed", () => {
    const mockOnFiltersChange = vi.fn();
    const initialFilters = getInitialFilters(mockFlights);

    render(
      <FilterSidebar
        flights={mockFlights}
        filters={initialFilters}
        onFiltersChange={mockOnFiltersChange}
      />,
    );

    const directCheckbox = screen.getByTestId("filter-sidebar-stops-0");
    fireEvent.click(directCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        stops: [0],
      }),
    );
  });

  it("calls onFiltersChange when airline filter is changed", () => {
    const mockOnFiltersChange = vi.fn();
    const initialFilters = getInitialFilters(mockFlights);

    render(
      <FilterSidebar
        flights={mockFlights}
        filters={initialFilters}
        onFiltersChange={mockOnFiltersChange}
      />,
    );

    const aaCheckbox = screen.getByTestId("filter-sidebar-airline-AA");
    fireEvent.click(aaCheckbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        airlines: ["AA"],
      }),
    );
  });

  it("clears all filters when clear button is clicked", () => {
    const mockOnFiltersChange = vi.fn();
    const filters: FlightFilters = {
      priceRange: { min: 500, max: 700 },
      durationRange: { min: 0, max: 1440 },
      stops: [0],
      airlines: ["AA"],
      departureTimeRanges: ["morning"],
    };

    render(
      <FilterSidebar
        flights={mockFlights}
        filters={filters}
        onFiltersChange={mockOnFiltersChange}
      />,
    );

    const clearButton = screen.getByTestId("filter-sidebar-clear-all");
    fireEvent.click(clearButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        stops: [],
        airlines: [],
        departureTimeRanges: [],
      }),
    );
  });
});

describe("applyFilters", () => {
  it("filters flights by price range", () => {
    const filters: FlightFilters = {
      priceRange: { min: 0, max: 600 },
      durationRange: { min: 0, max: 1440 },
      stops: [],
      airlines: [],
      departureTimeRanges: [],
    };

    const filtered = applyFilters(mockFlights, filters);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((f) => f.price.amount <= 600)).toBe(true);
  });

  it("filters flights by duration", () => {
    const filters: FlightFilters = {
      priceRange: { min: 0, max: 1000 },
      durationRange: { min: 0, max: 500 },
      stops: [],
      airlines: [],
      departureTimeRanges: [],
    };

    const filtered = applyFilters(mockFlights, filters);
    expect(filtered).toHaveLength(2); // Flights with total duration <= 500 minutes
    expect(
      filtered.every((f) => {
        const totalDuration = f.segments.reduce(
          (sum, seg) => sum + seg.duration,
          0,
        );
        return totalDuration <= 500;
      }),
    ).toBe(true);
  });

  it("filters flights by number of stops", () => {
    const filters: FlightFilters = {
      priceRange: { min: 0, max: 1000 },
      durationRange: { min: 0, max: 1440 },
      stops: [0], // Direct flights only
      airlines: [],
      departureTimeRanges: [],
    };

    const filtered = applyFilters(mockFlights, filters);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((f) => f.segments.length === 1)).toBe(true);
  });

  it("filters flights by airline", () => {
    const filters: FlightFilters = {
      priceRange: { min: 0, max: 1000 },
      durationRange: { min: 0, max: 1440 },
      stops: [],
      airlines: ["AA"],
      departureTimeRanges: [],
    };

    const filtered = applyFilters(mockFlights, filters);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((f) => f.airline.code === "AA")).toBe(true);
  });

  it("filters flights by departure time range", () => {
    const filters: FlightFilters = {
      priceRange: { min: 0, max: 1000 },
      durationRange: { min: 0, max: 1440 },
      stops: [],
      airlines: [],
      departureTimeRanges: ["morning"], // 6am - 12pm
    };

    const filtered = applyFilters(mockFlights, filters);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("1");
  });

  it("applies multiple filters with AND logic (Requirement 4.3)", () => {
    const filters: FlightFilters = {
      priceRange: { min: 0, max: 600 },
      durationRange: { min: 0, max: 450 },
      stops: [0],
      airlines: ["AA"],
      departureTimeRanges: ["morning"],
    };

    const filtered = applyFilters(mockFlights, filters);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("1");
  });

  it("returns empty array when no flights match filters (Requirement 4.6)", () => {
    const filters: FlightFilters = {
      priceRange: { min: 1000, max: 2000 },
      durationRange: { min: 0, max: 1440 },
      stops: [],
      airlines: [],
      departureTimeRanges: [],
    };

    const filtered = applyFilters(mockFlights, filters);
    expect(filtered).toHaveLength(0);
  });
});

describe("getInitialFilters", () => {
  it("returns filters with full price range", () => {
    const filters = getInitialFilters(mockFlights);

    expect(filters.priceRange.min).toBe(500);
    expect(filters.priceRange.max).toBe(800);
  });

  it("returns filters with full duration range", () => {
    const filters = getInitialFilters(mockFlights);

    expect(filters.durationRange.min).toBe(420);
    expect(filters.durationRange.max).toBe(600);
  });

  it("returns filters with empty selections", () => {
    const filters = getInitialFilters(mockFlights);

    expect(filters.stops).toEqual([]);
    expect(filters.airlines).toEqual([]);
    expect(filters.departureTimeRanges).toEqual([]);
  });
});
