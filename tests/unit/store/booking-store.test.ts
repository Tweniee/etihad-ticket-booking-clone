/**
 * Unit tests for booking store
 *
 * Tests the core functionality of the booking store including:
 * - State initialization
 * - Search criteria management
 * - Flight selection
 * - Seat selection
 * - Passenger management
 * - Extras management
 * - Price calculation
 * - Navigation
 */

import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useBookingStore } from "../../../lib/store/booking-store";
import type {
  SearchCriteria,
  Flight,
  Seat,
  PassengerInfo,
  BaggageExtra,
  MealExtra,
} from "../../../lib/types";

// Mock data
const mockSearchCriteria: SearchCriteria = {
  tripType: "one-way",
  segments: [
    {
      origin: {
        code: "JFK",
        name: "John F. Kennedy International Airport",
        city: "New York",
        country: "USA",
      },
      destination: {
        code: "LHR",
        name: "London Heathrow Airport",
        city: "London",
        country: "UK",
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

const mockFlight: Flight = {
  id: "flight-1",
  airline: {
    code: "BA",
    name: "British Airways",
    logo: "/logos/ba.png",
  },
  flightNumber: "BA178",
  segments: [
    {
      departure: {
        airport: mockSearchCriteria.segments[0].origin,
        dateTime: new Date("2024-06-01T10:00:00"),
        terminal: "7",
      },
      arrival: {
        airport: mockSearchCriteria.segments[0].destination,
        dateTime: new Date("2024-06-01T22:00:00"),
        terminal: "5",
      },
      duration: 420,
      aircraft: "Boeing 777-300ER",
    },
  ],
  price: {
    amount: 850,
    currency: "USD",
    breakdown: {
      baseFare: 650,
      taxes: 150,
      fees: 50,
    },
  },
  cabinClass: "economy",
  availableSeats: 45,
};

const mockSeat: Seat = {
  id: "seat-12A",
  row: 12,
  column: "A",
  status: "available",
  type: "standard",
  position: "window",
  price: 0,
};

const mockPaidSeat: Seat = {
  id: "seat-1A",
  row: 1,
  column: "A",
  status: "available",
  type: "extra-legroom",
  position: "window",
  price: 50,
};

const mockPassenger: PassengerInfo = {
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
};

const mockBaggage: BaggageExtra = {
  weight: 20,
  price: 50,
};

const mockMeal: MealExtra = {
  type: "vegetarian",
  price: 25,
};

describe("BookingStore", () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useBookingStore());
    act(() => {
      result.current.reset();
    });
  });

  describe("Initial State", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useBookingStore());

      expect(result.current.searchCriteria).toBeNull();
      expect(result.current.selectedFlight).toBeNull();
      expect(result.current.selectedSeats.size).toBe(0);
      expect(result.current.passengers).toEqual([]);
      expect(result.current.selectedExtras.baggage.size).toBe(0);
      expect(result.current.selectedExtras.meals.size).toBe(0);
      expect(result.current.selectedExtras.insurance).toBeNull();
      expect(result.current.selectedExtras.loungeAccess).toBeNull();
      expect(result.current.totalPrice).toBe(0);
      expect(result.current.currentStep).toBe("search");
      expect(result.current.sessionId).toBeNull();
    });
  });

  describe("Search Criteria", () => {
    it("should set search criteria", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSearchCriteria(mockSearchCriteria);
      });

      expect(result.current.searchCriteria).toEqual(mockSearchCriteria);
    });

    it("should clear search criteria", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSearchCriteria(mockSearchCriteria);
        result.current.clearSearchCriteria();
      });

      expect(result.current.searchCriteria).toBeNull();
    });
  });

  describe("Flight Selection", () => {
    it("should set selected flight", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSelectedFlight(mockFlight);
      });

      expect(result.current.selectedFlight).toEqual(mockFlight);
    });

    it("should calculate price when flight is selected", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSelectedFlight(mockFlight);
      });

      expect(result.current.totalPrice).toBe(850);
      expect(result.current.priceBreakdown.baseFare).toBe(650);
      expect(result.current.priceBreakdown.taxes).toBe(150);
      expect(result.current.priceBreakdown.fees).toBe(50);
    });

    it("should clear selected flight", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSelectedFlight(mockFlight);
        result.current.clearSelectedFlight();
      });

      expect(result.current.selectedFlight).toBeNull();
      expect(result.current.totalPrice).toBe(0);
    });
  });

  describe("Seat Selection", () => {
    it("should add seat for passenger", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSeat("passenger-1", mockSeat);
      });

      expect(result.current.selectedSeats.get("passenger-1")).toEqual(mockSeat);
    });

    it("should remove seat for passenger", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSeat("passenger-1", mockSeat);
        result.current.removeSeat("passenger-1");
      });

      expect(result.current.selectedSeats.has("passenger-1")).toBe(false);
    });

    it("should update price when paid seat is selected", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSelectedFlight(mockFlight);
        result.current.setSeat("passenger-1", mockPaidSeat);
      });

      expect(result.current.priceBreakdown.seatFees).toBe(50);
      expect(result.current.totalPrice).toBe(900); // 850 + 50
    });

    it("should clear all seats", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSeat("passenger-1", mockSeat);
        result.current.setSeat("passenger-2", mockPaidSeat);
        result.current.clearSeats();
      });

      expect(result.current.selectedSeats.size).toBe(0);
    });
  });

  describe("Passenger Management", () => {
    it("should set passengers", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setPassengers([mockPassenger]);
      });

      expect(result.current.passengers).toEqual([mockPassenger]);
    });

    it("should update specific passenger", () => {
      const { result } = renderHook(() => useBookingStore());
      const updatedPassenger = { ...mockPassenger, firstName: "Jane" };

      act(() => {
        result.current.setPassengers([mockPassenger]);
        result.current.updatePassenger("passenger-1", updatedPassenger);
      });

      expect(result.current.passengers[0].firstName).toBe("Jane");
    });

    it("should clear passengers", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setPassengers([mockPassenger]);
        result.current.clearPassengers();
      });

      expect(result.current.passengers).toEqual([]);
    });
  });

  describe("Extras Management", () => {
    it("should add baggage for passenger", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSelectedFlight(mockFlight);
        result.current.updateBaggage("passenger-1", mockBaggage);
      });

      expect(result.current.selectedExtras.baggage.get("passenger-1")).toEqual(
        mockBaggage,
      );
      expect(result.current.priceBreakdown.extraBaggage).toBe(50);
      expect(result.current.totalPrice).toBe(900); // 850 + 50
    });

    it("should remove baggage for passenger", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSelectedFlight(mockFlight);
        result.current.updateBaggage("passenger-1", mockBaggage);
        result.current.updateBaggage("passenger-1", null);
      });

      expect(result.current.selectedExtras.baggage.has("passenger-1")).toBe(
        false,
      );
      expect(result.current.priceBreakdown.extraBaggage).toBe(0);
    });

    it("should add meal for passenger", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSelectedFlight(mockFlight);
        result.current.updateMeal("passenger-1", mockMeal);
      });

      expect(result.current.selectedExtras.meals.get("passenger-1")).toEqual(
        mockMeal,
      );
      expect(result.current.priceBreakdown.meals).toBe(25);
      expect(result.current.totalPrice).toBe(875); // 850 + 25
    });

    it("should set insurance", () => {
      const { result } = renderHook(() => useBookingStore());
      const insurance = { type: "basic" as const, coverage: 50000, price: 30 };

      act(() => {
        result.current.setSelectedFlight(mockFlight);
        result.current.setInsurance(insurance);
      });

      expect(result.current.selectedExtras.insurance).toEqual(insurance);
      expect(result.current.priceBreakdown.insurance).toBe(30);
      expect(result.current.totalPrice).toBe(880); // 850 + 30
    });

    it("should set lounge access", () => {
      const { result } = renderHook(() => useBookingStore());
      const lounge = { airport: "JFK", price: 75 };

      act(() => {
        result.current.setSelectedFlight(mockFlight);
        result.current.setLoungeAccess(lounge);
      });

      expect(result.current.selectedExtras.loungeAccess).toEqual(lounge);
      expect(result.current.priceBreakdown.loungeAccess).toBe(75);
      expect(result.current.totalPrice).toBe(925); // 850 + 75
    });

    it("should clear all extras", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSelectedFlight(mockFlight);
        result.current.updateBaggage("passenger-1", mockBaggage);
        result.current.updateMeal("passenger-1", mockMeal);
        result.current.clearExtras();
      });

      expect(result.current.selectedExtras.baggage.size).toBe(0);
      expect(result.current.selectedExtras.meals.size).toBe(0);
      expect(result.current.selectedExtras.insurance).toBeNull();
      expect(result.current.selectedExtras.loungeAccess).toBeNull();
    });
  });

  describe("Price Calculation", () => {
    it("should calculate total price with all components", () => {
      const { result } = renderHook(() => useBookingStore());
      const insurance = { type: "basic" as const, coverage: 50000, price: 30 };
      const lounge = { airport: "JFK", price: 75 };

      act(() => {
        result.current.setSelectedFlight(mockFlight);
        result.current.setSeat("passenger-1", mockPaidSeat);
        result.current.updateBaggage("passenger-1", mockBaggage);
        result.current.updateMeal("passenger-1", mockMeal);
        result.current.setInsurance(insurance);
        result.current.setLoungeAccess(lounge);
      });

      // 650 (base) + 150 (taxes) + 50 (fees) + 50 (seat) + 50 (baggage) + 25 (meal) + 30 (insurance) + 75 (lounge) = 1080
      expect(result.current.totalPrice).toBe(1080);
      expect(result.current.priceBreakdown.baseFare).toBe(650);
      expect(result.current.priceBreakdown.taxes).toBe(150);
      expect(result.current.priceBreakdown.fees).toBe(50);
      expect(result.current.priceBreakdown.seatFees).toBe(50);
      expect(result.current.priceBreakdown.extraBaggage).toBe(50);
      expect(result.current.priceBreakdown.meals).toBe(25);
      expect(result.current.priceBreakdown.insurance).toBe(30);
      expect(result.current.priceBreakdown.loungeAccess).toBe(75);
      expect(result.current.priceBreakdown.total).toBe(1080);
    });

    it("should recalculate price when components change", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSelectedFlight(mockFlight);
      });
      expect(result.current.totalPrice).toBe(850);

      act(() => {
        result.current.updateBaggage("passenger-1", mockBaggage);
      });
      expect(result.current.totalPrice).toBe(900);

      act(() => {
        result.current.updateBaggage("passenger-1", null);
      });
      expect(result.current.totalPrice).toBe(850);
    });
  });

  describe("Navigation", () => {
    it("should navigate to specific step", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.goToStep("passengers");
      });

      expect(result.current.currentStep).toBe("passengers");
    });

    it("should navigate to next step", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.goToStep("search");
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe("results");
    });

    it("should navigate to previous step", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.goToStep("results");
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe("search");
    });

    it("should not go beyond last step", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.goToStep("confirmation");
        result.current.nextStep();
      });

      expect(result.current.currentStep).toBe("confirmation");
    });

    it("should not go before first step", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.goToStep("search");
        result.current.previousStep();
      });

      expect(result.current.currentStep).toBe("search");
    });
  });

  describe("Can Proceed Validation", () => {
    it("should not allow proceeding from search without criteria", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.goToStep("search");
      });

      expect(result.current.canProceed()).toBe(false);
    });

    it("should allow proceeding from search with criteria", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.goToStep("search");
        result.current.setSearchCriteria(mockSearchCriteria);
      });

      expect(result.current.canProceed()).toBe(true);
    });

    it("should not allow proceeding from results without flight", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.goToStep("results");
      });

      expect(result.current.canProceed()).toBe(false);
    });

    it("should allow proceeding from results with flight", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.goToStep("results");
        result.current.setSelectedFlight(mockFlight);
      });

      expect(result.current.canProceed()).toBe(true);
    });

    it("should allow proceeding from seats without selection (optional)", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.goToStep("seats");
      });

      expect(result.current.canProceed()).toBe(true);
    });

    it("should not allow proceeding from passengers without data", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.goToStep("passengers");
      });

      expect(result.current.canProceed()).toBe(false);
    });

    it("should allow proceeding from passengers with data", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.goToStep("passengers");
        result.current.setPassengers([mockPassenger]);
      });

      expect(result.current.canProceed()).toBe(true);
    });

    it("should not allow proceeding from confirmation", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.goToStep("confirmation");
      });

      expect(result.current.canProceed()).toBe(false);
    });
  });

  describe("Session Management", () => {
    it("should set session ID", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSessionId("session-123");
      });

      expect(result.current.sessionId).toBe("session-123");
    });

    it("should clear session ID", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSessionId("session-123");
        result.current.clearSession();
      });

      expect(result.current.sessionId).toBeNull();
    });
  });

  describe("Reset", () => {
    it("should reset entire store to initial state", () => {
      const { result } = renderHook(() => useBookingStore());

      act(() => {
        result.current.setSearchCriteria(mockSearchCriteria);
        result.current.setSelectedFlight(mockFlight);
        result.current.setSeat("passenger-1", mockSeat);
        result.current.setPassengers([mockPassenger]);
        result.current.updateBaggage("passenger-1", mockBaggage);
        result.current.goToStep("payment");
        result.current.setSessionId("session-123");
        result.current.reset();
      });

      expect(result.current.searchCriteria).toBeNull();
      expect(result.current.selectedFlight).toBeNull();
      expect(result.current.selectedSeats.size).toBe(0);
      expect(result.current.passengers).toEqual([]);
      expect(result.current.selectedExtras.baggage.size).toBe(0);
      expect(result.current.totalPrice).toBe(0);
      expect(result.current.currentStep).toBe("search");
      expect(result.current.sessionId).toBeNull();
    });
  });
});
