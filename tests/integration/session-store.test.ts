/**
 * Integration tests for session management with booking store
 *
 * Tests the integration between booking store and Redis session persistence
 * Requirements: 16.1, 16.2, 16.3, 16.5
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { useBookingStore } from "../../lib/store/booking-store";
import {
  clearSession,
  isSessionValid,
  loadSession as loadSessionData,
} from "../../lib/utils/session";
import type {
  SearchCriteria,
  Flight,
  Seat,
  PassengerInfo,
  BaggageExtra,
  MealExtra,
} from "../../lib/types";

// Mock data
const mockSearchCriteria: SearchCriteria = {
  tripType: "round-trip",
  segments: [
    {
      origin: {
        code: "DXB",
        name: "Dubai International Airport",
        city: "Dubai",
        country: "UAE",
      },
      destination: {
        code: "LHR",
        name: "London Heathrow Airport",
        city: "London",
        country: "UK",
      },
      departureDate: new Date("2024-07-15"),
    },
    {
      origin: {
        code: "LHR",
        name: "London Heathrow Airport",
        city: "London",
        country: "UK",
      },
      destination: {
        code: "DXB",
        name: "Dubai International Airport",
        city: "Dubai",
        country: "UAE",
      },
      departureDate: new Date("2024-07-22"),
    },
  ],
  passengers: {
    adults: 2,
    children: 1,
    infants: 0,
  },
  cabinClass: "business",
};

const mockFlight: Flight = {
  id: "flight-ey-123",
  airline: {
    code: "EY",
    name: "Etihad Airways",
    logo: "/logos/ey.png",
  },
  flightNumber: "EY11",
  segments: [
    {
      departure: {
        airport: mockSearchCriteria.segments[0].origin,
        dateTime: new Date("2024-07-15T14:30:00"),
        terminal: "3",
      },
      arrival: {
        airport: mockSearchCriteria.segments[0].destination,
        dateTime: new Date("2024-07-15T19:00:00"),
        terminal: "4",
      },
      duration: 450,
      aircraft: "Boeing 787-9",
    },
  ],
  price: {
    amount: 2500,
    currency: "USD",
    breakdown: {
      baseFare: 2000,
      taxes: 350,
      fees: 150,
    },
  },
  cabinClass: "business",
  availableSeats: 28,
};

const mockSeats: Record<string, Seat> = {
  "passenger-1": {
    id: "seat-5A",
    row: 5,
    column: "A",
    status: "available",
    type: "extra-legroom",
    position: "window",
    price: 100,
  },
  "passenger-2": {
    id: "seat-5B",
    row: 5,
    column: "B",
    status: "available",
    type: "extra-legroom",
    position: "aisle",
    price: 100,
  },
};

const mockPassengers: PassengerInfo[] = [
  {
    id: "passenger-1",
    type: "adult",
    firstName: "Ahmed",
    lastName: "Al-Mansoori",
    dateOfBirth: new Date("1985-03-20"),
    gender: "male",
    contact: {
      email: "ahmed@example.com",
      phone: "501234567",
      countryCode: "+971",
    },
    passport: {
      number: "A12345678",
      expiryDate: new Date("2028-03-20"),
      nationality: "UAE",
      issuingCountry: "UAE",
    },
  },
  {
    id: "passenger-2",
    type: "adult",
    firstName: "Fatima",
    lastName: "Al-Mansoori",
    dateOfBirth: new Date("1987-06-15"),
    gender: "female",
    passport: {
      number: "B87654321",
      expiryDate: new Date("2029-06-15"),
      nationality: "UAE",
      issuingCountry: "UAE",
    },
  },
];

const mockBaggage: BaggageExtra = { weight: 32, price: 100 };
const mockMeal: MealExtra = { type: "halal", price: 30 };

describe("Session Store Integration", () => {
  let sessionId: string | null = null;

  beforeEach(() => {
    // Reset store state
    sessionId = null;
    useBookingStore.getState().reset();
  });

  afterEach(async () => {
    // Clean up test sessions
    if (sessionId) {
      await clearSession(sessionId);
    }
  });

  describe("Session Initialization", () => {
    it("should initialize a new session with unique ID", () => {
      useBookingStore.getState().initializeSession();

      sessionId = useBookingStore.getState().sessionId;
      expect(sessionId).toBeDefined();
      expect(sessionId).not.toBeNull();
      expect(sessionId).toMatch(/^session_/);
    });

    it("should generate different session IDs for multiple initializations", () => {
      useBookingStore.getState().initializeSession();
      const sessionId1 = useBookingStore.getState().sessionId;

      useBookingStore.getState().initializeSession();
      const sessionId2 = useBookingStore.getState().sessionId;

      expect(sessionId1).not.toBe(sessionId2);

      // Clean up both sessions
      if (sessionId1) {
        clearSession(sessionId1);
      }
      if (sessionId2) {
        clearSession(sessionId2);
      }
    });
  });

  describe("Session Persistence - Save", () => {
    it("should save search criteria to session", async () => {
      const store = useBookingStore.getState();
      store.setSearchCriteria(mockSearchCriteria);
      await store.saveSession();

      sessionId = store.sessionId;
      expect(sessionId).toBeDefined();

      // Verify data was saved to Redis
      const savedData = await loadSessionData(sessionId!);
      expect(savedData).toBeDefined();
      expect(savedData?.searchCriteria?.tripType).toBe("round-trip");
      expect(savedData?.searchCriteria?.passengers.adults).toBe(2);
    });

    it("should save complete booking state to session", async () => {
      const store = useBookingStore.getState();

      store.setSearchCriteria(mockSearchCriteria);
      store.setSelectedFlight(mockFlight);
      store.setSeat("passenger-1", mockSeats["passenger-1"]);
      store.setSeat("passenger-2", mockSeats["passenger-2"]);
      store.setPassengers(mockPassengers);
      store.updateBaggage("passenger-1", mockBaggage);
      store.updateMeal("passenger-1", mockMeal);
      store.setInsurance({
        type: "comprehensive",
        coverage: 100000,
        price: 75,
      });
      store.setLoungeAccess({ airport: "DXB", price: 150 });

      await store.saveSession();

      sessionId = store.sessionId;
      expect(sessionId).toBeDefined();

      // Verify all data was saved
      const savedData = await loadSessionData(sessionId!);
      expect(savedData).toBeDefined();
      expect(savedData?.searchCriteria).toBeDefined();
      expect(savedData?.selectedFlight?.id).toBe("flight-ey-123");
      expect(Object.keys(savedData?.selectedSeats || {})).toHaveLength(2);
      expect(savedData?.passengers).toHaveLength(2);
      expect(Object.keys(savedData?.selectedExtras.baggage || {})).toHaveLength(
        1,
      );
      expect(Object.keys(savedData?.selectedExtras.meals || {})).toHaveLength(
        1,
      );
      expect(savedData?.selectedExtras.insurance).toBeDefined();
      expect(savedData?.selectedExtras.loungeAccess).toBeDefined();
    });

    it("should update existing session on multiple saves", async () => {
      const store = useBookingStore.getState();

      store.setSearchCriteria(mockSearchCriteria);
      await store.saveSession();

      sessionId = store.sessionId;

      // Update and save again
      store.setSelectedFlight(mockFlight);
      await store.saveSession();

      // Verify updated data
      const savedData = await loadSessionData(sessionId!);
      expect(savedData?.searchCriteria).toBeDefined();
      expect(savedData?.selectedFlight?.id).toBe("flight-ey-123");
    });

    it("should handle empty booking state", async () => {
      const store = useBookingStore.getState();
      await store.saveSession();

      sessionId = store.sessionId;
      expect(sessionId).toBeDefined();

      const savedData = await loadSessionData(sessionId!);
      expect(savedData).toBeDefined();
      expect(savedData?.searchCriteria).toBeNull();
      expect(savedData?.selectedFlight).toBeNull();
      expect(savedData?.passengers).toEqual([]);
    });
  });

  describe("Session Persistence - Load", () => {
    it("should load search criteria from session", async () => {
      // Save session
      const store = useBookingStore.getState();
      store.setSearchCriteria(mockSearchCriteria);
      await store.saveSession();

      sessionId = store.sessionId!;

      // Reset store to simulate new instance
      store.reset();

      // Load session
      await store.loadSession(sessionId!);

      const state = useBookingStore.getState();
      expect(state.searchCriteria).toBeDefined();
      expect(state.searchCriteria?.tripType).toBe("round-trip");
      expect(state.searchCriteria?.passengers.adults).toBe(2);
      expect(state.searchCriteria?.cabinClass).toBe("business");
    });

    it("should load complete booking state from session", async () => {
      // Save complete booking state
      const store = useBookingStore.getState();
      store.setSearchCriteria(mockSearchCriteria);
      store.setSelectedFlight(mockFlight);
      store.setSeat("passenger-1", mockSeats["passenger-1"]);
      store.setSeat("passenger-2", mockSeats["passenger-2"]);
      store.setPassengers(mockPassengers);
      store.updateBaggage("passenger-1", mockBaggage);
      store.updateMeal("passenger-1", mockMeal);
      store.setInsurance({
        type: "comprehensive",
        coverage: 100000,
        price: 75,
      });

      await store.saveSession();
      sessionId = store.sessionId!;

      // Reset and load
      store.reset();
      await store.loadSession(sessionId!);

      const state = useBookingStore.getState();
      expect(state.searchCriteria).toBeDefined();
      expect(state.selectedFlight?.id).toBe("flight-ey-123");
      expect(state.selectedSeats.size).toBe(2);
      expect(state.passengers).toHaveLength(2);
      expect(state.selectedExtras.baggage.size).toBe(1);
      expect(state.selectedExtras.meals.size).toBe(1);
      expect(state.selectedExtras.insurance).toBeDefined();
    });

    it("should recalculate price after loading session", async () => {
      // Save booking with price components
      const store = useBookingStore.getState();
      store.setSelectedFlight(mockFlight);
      store.setSeat("passenger-1", mockSeats["passenger-1"]);
      store.updateBaggage("passenger-1", mockBaggage);
      await store.saveSession();

      const savedPrice = store.totalPrice;
      sessionId = store.sessionId!;

      // Reset and load
      store.reset();
      await store.loadSession(sessionId!);

      const state = useBookingStore.getState();
      expect(state.totalPrice).toBe(savedPrice);
      expect(state.totalPrice).toBeGreaterThan(0);
      expect(state.priceBreakdown.baseFare).toBe(2000);
      expect(state.priceBreakdown.seatFees).toBe(100);
      expect(state.priceBreakdown.extraBaggage).toBe(100);
    });

    it("should throw error for non-existent session", async () => {
      const store = useBookingStore.getState();

      await expect(
        store.loadSession("non-existent-session-id"),
      ).rejects.toThrow("Session not found or expired");
    });

    it("should preserve Maps structure after load", async () => {
      const store = useBookingStore.getState();
      store.setSeat("passenger-1", mockSeats["passenger-1"]);
      store.setSeat("passenger-2", mockSeats["passenger-2"]);
      store.updateBaggage("passenger-1", mockBaggage);
      store.updateMeal("passenger-1", mockMeal);
      await store.saveSession();

      sessionId = store.sessionId!;

      // Reset and load
      store.reset();
      await store.loadSession(sessionId!);

      const state = useBookingStore.getState();
      expect(state.selectedSeats).toBeInstanceOf(Map);
      expect(state.selectedSeats.size).toBe(2);
      expect(state.selectedSeats.get("passenger-1")).toBeDefined();

      expect(state.selectedExtras.baggage).toBeInstanceOf(Map);
      expect(state.selectedExtras.baggage.size).toBe(1);

      expect(state.selectedExtras.meals).toBeInstanceOf(Map);
      expect(state.selectedExtras.meals.size).toBe(1);
    });
  });

  describe("Session Timeout", () => {
    it("should validate session exists after save", async () => {
      const store = useBookingStore.getState();
      store.setSearchCriteria(mockSearchCriteria);
      await store.saveSession();

      sessionId = store.sessionId!;

      const isValid = await isSessionValid(sessionId);
      expect(isValid).toBe(true);
    });

    it("should detect expired session", async () => {
      const store = useBookingStore.getState();
      store.setSearchCriteria(mockSearchCriteria);
      await store.saveSession();

      sessionId = store.sessionId!;

      // Manually expire the session by clearing it
      await clearSession(sessionId);

      const isValid = await isSessionValid(sessionId);
      expect(isValid).toBe(false);
    });
  });

  describe("Session Clearing", () => {
    it("should clear session from Redis", async () => {
      const store = useBookingStore.getState();
      store.setSearchCriteria(mockSearchCriteria);
      store.setSelectedFlight(mockFlight);
      await store.saveSession();

      sessionId = store.sessionId!;

      // Verify session exists
      let isValid = await isSessionValid(sessionId);
      expect(isValid).toBe(true);

      // Clear session
      store.clearSession();

      // Wait a bit for async clear to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify session is cleared from Redis
      isValid = await isSessionValid(sessionId);
      expect(isValid).toBe(false);

      // Verify session ID is cleared from store
      expect(store.sessionId).toBeNull();

      sessionId = null; // Prevent cleanup attempt
    });

    it("should clear session after successful booking", async () => {
      const store = useBookingStore.getState();
      store.setSearchCriteria(mockSearchCriteria);
      store.setSelectedFlight(mockFlight);
      await store.saveSession();

      sessionId = store.sessionId!;

      // Simulate booking completion
      store.clearSession();

      expect(store.sessionId).toBeNull();

      sessionId = null;
    });

    it("should not throw error when clearing non-existent session", () => {
      const store = useBookingStore.getState();

      expect(() => {
        store.clearSession();
      }).not.toThrow();
    });
  });

  describe("Session Workflow", () => {
    it("should support complete booking flow with session persistence", async () => {
      const store = useBookingStore.getState();

      // Step 1: Search
      store.setSearchCriteria(mockSearchCriteria);
      store.goToStep("results");
      await store.saveSession();

      sessionId = store.sessionId!;
      expect(store.currentStep).toBe("results");

      // Step 2: Select flight
      store.setSelectedFlight(mockFlight);
      store.goToStep("seats");
      await store.saveSession();

      // Step 3: Select seats
      store.setSeat("passenger-1", mockSeats["passenger-1"]);
      store.setSeat("passenger-2", mockSeats["passenger-2"]);
      store.goToStep("passengers");
      await store.saveSession();

      // Step 4: Add passengers
      store.setPassengers(mockPassengers);
      store.goToStep("extras");
      await store.saveSession();

      // Step 5: Add extras
      store.updateBaggage("passenger-1", mockBaggage);
      store.updateMeal("passenger-1", mockMeal);
      store.goToStep("payment");
      await store.saveSession();

      // Verify complete state
      expect(store.searchCriteria).toBeDefined();
      expect(store.selectedFlight).toBeDefined();
      expect(store.selectedSeats.size).toBe(2);
      expect(store.passengers).toHaveLength(2);
      expect(store.selectedExtras.baggage.size).toBe(1);
      expect(store.totalPrice).toBeGreaterThan(0);

      // Simulate page refresh - reset and load session
      const savedPrice = store.totalPrice;
      store.reset();
      await store.loadSession(sessionId);

      // Verify all state is restored
      const state = useBookingStore.getState();
      expect(state.searchCriteria?.tripType).toBe("round-trip");
      expect(state.selectedFlight?.id).toBe("flight-ey-123");
      expect(state.selectedSeats.size).toBe(2);
      expect(state.passengers).toHaveLength(2);
      expect(state.selectedExtras.baggage.size).toBe(1);
      expect(state.totalPrice).toBe(savedPrice);
    });

    it("should handle session recovery after navigation", async () => {
      const store = useBookingStore.getState();

      // User starts booking
      store.setSearchCriteria(mockSearchCriteria);
      store.setSelectedFlight(mockFlight);
      store.goToStep("seats");
      await store.saveSession();

      sessionId = store.sessionId!;

      // User navigates away and comes back (reset store)
      store.reset();
      await store.loadSession(sessionId);

      // User should be able to continue from where they left off
      const state = useBookingStore.getState();
      expect(state.searchCriteria).toBeDefined();
      expect(state.selectedFlight).toBeDefined();
      expect(state.canProceed()).toBe(true);

      // Continue booking
      state.setSeat("passenger-1", mockSeats["passenger-1"]);
      state.goToStep("passengers");
      await state.saveSession();

      expect(state.selectedSeats.size).toBe(1);
    });
  });
});
