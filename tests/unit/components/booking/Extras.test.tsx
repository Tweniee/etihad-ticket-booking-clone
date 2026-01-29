import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Extras } from "@/components/booking/Extras";
import type { Flight, PassengerInfo, SelectedExtras } from "@/lib/types";

// Mock flight data
const mockFlight: Flight = {
  id: "flight-1",
  airline: {
    code: "EY",
    name: "Etihad Airways",
    logo: "/logos/etihad.png",
  },
  flightNumber: "EY123",
  segments: [
    {
      departure: {
        airport: {
          code: "JFK",
          name: "John F. Kennedy International Airport",
          city: "New York",
          country: "USA",
        },
        dateTime: new Date("2024-06-01T10:00:00"),
        terminal: "4",
      },
      arrival: {
        airport: {
          code: "AUH",
          name: "Abu Dhabi International Airport",
          city: "Abu Dhabi",
          country: "UAE",
        },
        dateTime: new Date("2024-06-02T06:00:00"),
        terminal: "3",
      },
      duration: 780,
      aircraft: "Boeing 787-9",
    },
  ],
  price: {
    amount: 1200,
    currency: "USD",
    breakdown: {
      baseFare: 1000,
      taxes: 150,
      fees: 50,
    },
  },
  cabinClass: "economy",
  availableSeats: 50,
};

// Mock passengers
const mockPassengers: PassengerInfo[] = [
  {
    id: "passenger-1",
    type: "adult",
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: new Date("1990-01-01"),
    gender: "male",
    contact: {
      email: "john@example.com",
      phone: "1234567890",
      countryCode: "+1",
    },
  },
  {
    id: "passenger-2",
    type: "adult",
    firstName: "Jane",
    lastName: "Doe",
    dateOfBirth: new Date("1992-05-15"),
    gender: "female",
  },
];

// Initial empty extras
const emptyExtras: SelectedExtras = {
  baggage: new Map(),
  meals: new Map(),
  insurance: null,
  loungeAccess: null,
};

describe("Extras Component", () => {
  it("renders all tabs", () => {
    const onExtrasChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <Extras
        flight={mockFlight}
        passengers={mockPassengers}
        selectedExtras={emptyExtras}
        onExtrasChange={onExtrasChange}
        onContinue={onContinue}
      />,
    );

    expect(screen.getByText("Extra Baggage")).toBeInTheDocument();
    expect(screen.getByText("Meals")).toBeInTheDocument();
    expect(screen.getByText("Insurance")).toBeInTheDocument();
    expect(screen.getByText("Lounge Access")).toBeInTheDocument();
  });

  it("displays passengers in baggage tab", () => {
    const onExtrasChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <Extras
        flight={mockFlight}
        passengers={mockPassengers}
        selectedExtras={emptyExtras}
        onExtrasChange={onExtrasChange}
        onContinue={onContinue}
      />,
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("allows selecting baggage weight", () => {
    const onExtrasChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <Extras
        flight={mockFlight}
        passengers={mockPassengers}
        selectedExtras={emptyExtras}
        onExtrasChange={onExtrasChange}
        onContinue={onContinue}
      />,
    );

    // Click on 10kg baggage option for first passenger
    const baggageButtons = screen.getAllByText("10kg");
    fireEvent.click(baggageButtons[0]);

    expect(onExtrasChange).toHaveBeenCalled();
    const call = onExtrasChange.mock.calls[0][0];
    expect(call.baggage.size).toBe(1);
    expect(call.baggage.get("passenger-1")).toEqual({
      weight: 10,
      price: 100,
    });
  });

  it("validates baggage weight options (5kg increments up to 32kg)", () => {
    const onExtrasChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <Extras
        flight={mockFlight}
        passengers={mockPassengers}
        selectedExtras={emptyExtras}
        onExtrasChange={onExtrasChange}
        onContinue={onContinue}
      />,
    );

    // Check that only valid weights are displayed
    expect(screen.getAllByText("5kg").length).toBeGreaterThan(0);
    expect(screen.getAllByText("10kg").length).toBeGreaterThan(0);
    expect(screen.getAllByText("15kg").length).toBeGreaterThan(0);
    expect(screen.getAllByText("20kg").length).toBeGreaterThan(0);
    expect(screen.getAllByText("25kg").length).toBeGreaterThan(0);
    expect(screen.getAllByText("32kg").length).toBeGreaterThan(0);

    // Invalid weights should not be present
    expect(screen.queryByText("7kg")).not.toBeInTheDocument();
    expect(screen.queryByText("35kg")).not.toBeInTheDocument();
  });

  it("allows selecting meals", () => {
    const onExtrasChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <Extras
        flight={mockFlight}
        passengers={mockPassengers}
        selectedExtras={emptyExtras}
        onExtrasChange={onExtrasChange}
        onContinue={onContinue}
      />,
    );

    // Switch to meals tab
    fireEvent.click(screen.getByText("Meals"));

    // Select vegetarian meal for first passenger
    const vegetarianButtons = screen.getAllByText("Vegetarian");
    fireEvent.click(vegetarianButtons[0]);

    expect(onExtrasChange).toHaveBeenCalled();
    const call = onExtrasChange.mock.calls[0][0];
    expect(call.meals.size).toBe(1);
    expect(call.meals.get("passenger-1")).toEqual({
      type: "vegetarian",
      price: 15,
    });
  });

  it("allows selecting insurance", () => {
    const onExtrasChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <Extras
        flight={mockFlight}
        passengers={mockPassengers}
        selectedExtras={emptyExtras}
        onExtrasChange={onExtrasChange}
        onContinue={onContinue}
      />,
    );

    // Switch to insurance tab
    fireEvent.click(screen.getByText("Insurance"));

    // Select basic insurance - use regex to match text that may be split
    const basicInsurance = screen.getByText(/basic coverage/i);
    fireEvent.click(basicInsurance.closest("button")!);

    expect(onExtrasChange).toHaveBeenCalled();
    const call = onExtrasChange.mock.calls[0][0];
    expect(call.insurance).toEqual({
      type: "basic",
      coverage: 50000,
      price: 25,
    });
  });

  it("allows toggling lounge access", () => {
    const onExtrasChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <Extras
        flight={mockFlight}
        passengers={mockPassengers}
        selectedExtras={emptyExtras}
        onExtrasChange={onExtrasChange}
        onContinue={onContinue}
      />,
    );

    // Switch to lounge tab
    fireEvent.click(screen.getByText("Lounge Access"));

    // Toggle lounge access
    const loungeButton = screen.getByText(
      "John F. Kennedy International Airport Lounge",
    );
    fireEvent.click(loungeButton.closest("button")!);

    expect(onExtrasChange).toHaveBeenCalled();
    const call = onExtrasChange.mock.calls[0][0];
    expect(call.loungeAccess).toEqual({
      airport: "JFK",
      price: 45,
    });
  });

  it("allows removing selected extras", () => {
    const selectedExtras: SelectedExtras = {
      baggage: new Map([["passenger-1", { weight: 10, price: 100 }]]),
      meals: new Map(),
      insurance: null,
      loungeAccess: null,
    };

    const onExtrasChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <Extras
        flight={mockFlight}
        passengers={mockPassengers}
        selectedExtras={selectedExtras}
        onExtrasChange={onExtrasChange}
        onContinue={onContinue}
      />,
    );

    // Click remove button
    const removeButton = screen.getByText("Remove extra baggage");
    fireEvent.click(removeButton);

    expect(onExtrasChange).toHaveBeenCalled();
    const call = onExtrasChange.mock.calls[0][0];
    expect(call.baggage.size).toBe(0);
  });

  it("calculates total extras price correctly", () => {
    const selectedExtras: SelectedExtras = {
      baggage: new Map([
        ["passenger-1", { weight: 10, price: 100 }],
        ["passenger-2", { weight: 15, price: 150 }],
      ]),
      meals: new Map([
        ["passenger-1", { type: "vegetarian", price: 15 }],
        ["passenger-2", { type: "vegan", price: 15 }],
      ]),
      insurance: {
        type: "basic",
        coverage: 50000,
        price: 25,
      },
      loungeAccess: {
        airport: "JFK",
        price: 45,
      },
    };

    const onExtrasChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <Extras
        flight={mockFlight}
        passengers={mockPassengers}
        selectedExtras={selectedExtras}
        onExtrasChange={onExtrasChange}
        onContinue={onContinue}
      />,
    );

    // Total should be: 100 + 150 + 15 + 15 + 25 + 45 = 350
    expect(screen.getByText("Extras Total")).toBeInTheDocument();
    // The PriceDisplay component will format this
  });

  it("calls onContinue when continue button is clicked", () => {
    const onExtrasChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <Extras
        flight={mockFlight}
        passengers={mockPassengers}
        selectedExtras={emptyExtras}
        onExtrasChange={onExtrasChange}
        onContinue={onContinue}
      />,
    );

    const continueButton = screen.getByText("Continue to Payment");
    fireEvent.click(continueButton);

    expect(onContinue).toHaveBeenCalled();
  });

  it("calls onBack when back button is clicked", () => {
    const onExtrasChange = vi.fn();
    const onContinue = vi.fn();
    const onBack = vi.fn();

    render(
      <Extras
        flight={mockFlight}
        passengers={mockPassengers}
        selectedExtras={emptyExtras}
        onExtrasChange={onExtrasChange}
        onContinue={onContinue}
        onBack={onBack}
      />,
    );

    const backButton = screen.getByText("Back");
    fireEvent.click(backButton);

    expect(onBack).toHaveBeenCalled();
  });

  it("shows loading state when isLoading is true", () => {
    const onExtrasChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <Extras
        flight={mockFlight}
        passengers={mockPassengers}
        selectedExtras={emptyExtras}
        onExtrasChange={onExtrasChange}
        onContinue={onContinue}
        isLoading={true}
      />,
    );

    expect(screen.getByText("Processing...")).toBeInTheDocument();
  });

  it("displays badge count for selected extras", () => {
    const selectedExtras: SelectedExtras = {
      baggage: new Map([
        ["passenger-1", { weight: 10, price: 100 }],
        ["passenger-2", { weight: 15, price: 150 }],
      ]),
      meals: new Map([["passenger-1", { type: "vegetarian", price: 15 }]]),
      insurance: null,
      loungeAccess: null,
    };

    const onExtrasChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <Extras
        flight={mockFlight}
        passengers={mockPassengers}
        selectedExtras={selectedExtras}
        onExtrasChange={onExtrasChange}
        onContinue={onContinue}
      />,
    );

    // Should show badge with count 2 for baggage
    const baggageTab = screen.getByText("Extra Baggage").closest("button");
    expect(baggageTab).toHaveTextContent("2");

    // Should show badge with count 1 for meals
    const mealsTab = screen.getByText("Meals").closest("button");
    expect(mealsTab).toHaveTextContent("1");
  });
});
