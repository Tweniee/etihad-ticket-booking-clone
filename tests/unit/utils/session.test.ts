/**
 * Unit tests for session management utilities
 *
 * Tests session persistence, loading, and clearing functionality
 * Requirements: 16.1, 16.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  generateSessionId,
  saveSession,
  loadSession,
  clearSession,
  extendSession,
  isSessionValid,
  type SessionData,
} from "../../../lib/utils/session";
import { getRedisClient, closeRedisConnection } from "../../../lib/utils/redis";

// Mock data
const mockSessionData: SessionData = {
  searchCriteria: {
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
  },
  selectedFlight: {
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
          airport: {
            code: "JFK",
            name: "John F. Kennedy International Airport",
            city: "New York",
            country: "USA",
          },
          dateTime: new Date("2024-06-01T10:00:00"),
          terminal: "7",
        },
        arrival: {
          airport: {
            code: "LHR",
            name: "London Heathrow Airport",
            city: "London",
            country: "UK",
          },
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
  },
  selectedSeats: {
    "passenger-1": {
      id: "seat-12A",
      row: 12,
      column: "A",
      status: "available",
      type: "standard",
      position: "window",
      price: 0,
    },
  },
  passengers: [
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
  ],
  selectedExtras: {
    baggage: {
      "passenger-1": {
        weight: 20,
        price: 50,
      },
    },
    meals: {
      "passenger-1": {
        type: "vegetarian",
        price: 25,
      },
    },
    insurance: {
      type: "basic",
      coverage: 50000,
      price: 30,
    },
    loungeAccess: {
      airport: "JFK",
      price: 75,
    },
  },
};

describe("Session Management", () => {
  let sessionId: string;

  beforeEach(() => {
    sessionId = generateSessionId();
  });

  afterEach(async () => {
    // Clean up test sessions
    if (sessionId) {
      await clearSession(sessionId);
    }
  });

  describe("generateSessionId", () => {
    it("should generate a unique session ID", () => {
      const id1 = generateSessionId();
      const id2 = generateSessionId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it("should generate session ID with correct format", () => {
      const id = generateSessionId();

      expect(id).toMatch(/^session_\d+_[a-z0-9]+$/);
    });
  });

  describe("saveSession", () => {
    it("should save session data to Redis", async () => {
      await saveSession(sessionId, mockSessionData);

      // Verify data was saved
      const redis = getRedisClient();
      const key = `booking:session:${sessionId}`;
      const data = await redis.get(key);

      expect(data).toBeDefined();
      expect(data).not.toBeNull();
    });

    it("should serialize session data correctly", async () => {
      await saveSession(sessionId, mockSessionData);

      const redis = getRedisClient();
      const key = `booking:session:${sessionId}`;
      const data = await redis.get(key);

      expect(data).toBeDefined();
      if (data) {
        const parsed = JSON.parse(data);
        expect(parsed.searchCriteria).toBeDefined();
        expect(parsed.selectedFlight).toBeDefined();
        expect(parsed.selectedSeats).toBeDefined();
        expect(parsed.passengers).toBeDefined();
        expect(parsed.selectedExtras).toBeDefined();
      }
    });

    it("should set expiration on session data", async () => {
      await saveSession(sessionId, mockSessionData);

      const redis = getRedisClient();
      const key = `booking:session:${sessionId}`;
      const ttl = await redis.ttl(key);

      // TTL should be set (30 minutes = 1800 seconds)
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(1800);
    });

    it("should handle empty session data", async () => {
      const emptyData: SessionData = {
        searchCriteria: null,
        selectedFlight: null,
        selectedSeats: {},
        passengers: [],
        selectedExtras: {
          baggage: {},
          meals: {},
          insurance: null,
          loungeAccess: null,
        },
      };

      await expect(saveSession(sessionId, emptyData)).resolves.not.toThrow();
    });
  });

  describe("loadSession", () => {
    it("should load session data from Redis", async () => {
      await saveSession(sessionId, mockSessionData);

      const loaded = await loadSession(sessionId);

      expect(loaded).toBeDefined();
      expect(loaded).not.toBeNull();
    });

    it("should deserialize session data correctly", async () => {
      await saveSession(sessionId, mockSessionData);

      const loaded = await loadSession(sessionId);

      expect(loaded).toBeDefined();
      if (loaded) {
        expect(loaded.searchCriteria).toBeDefined();
        expect(loaded.searchCriteria?.tripType).toBe("one-way");
        expect(loaded.selectedFlight).toBeDefined();
        expect(loaded.selectedFlight?.id).toBe("flight-1");
        expect(loaded.passengers).toHaveLength(1);
        expect(loaded.passengers[0].firstName).toBe("John");
      }
    });

    it("should return null for non-existent session", async () => {
      const loaded = await loadSession("non-existent-session");

      expect(loaded).toBeNull();
    });

    it("should return null for expired session", async () => {
      // Save session with very short TTL
      const redis = getRedisClient();
      const key = `booking:session:${sessionId}`;
      await redis.setex(key, 1, JSON.stringify(mockSessionData));

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const loaded = await loadSession(sessionId);

      expect(loaded).toBeNull();
    });
  });

  describe("clearSession", () => {
    it("should delete session data from Redis", async () => {
      await saveSession(sessionId, mockSessionData);

      await clearSession(sessionId);

      const redis = getRedisClient();
      const key = `booking:session:${sessionId}`;
      const exists = await redis.exists(key);

      expect(exists).toBe(0);
    });

    it("should not throw error for non-existent session", async () => {
      await expect(clearSession("non-existent-session")).resolves.not.toThrow();
    });
  });

  describe("extendSession", () => {
    it("should extend session expiration", async () => {
      await saveSession(sessionId, mockSessionData);

      const redis = getRedisClient();
      const key = `booking:session:${sessionId}`;

      // Get initial TTL
      const initialTtl = await redis.ttl(key);

      // Wait a bit to let TTL decrease
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get TTL before extend
      const ttlBeforeExtend = await redis.ttl(key);

      // Extend session
      await extendSession(sessionId);

      // Get new TTL
      const newTtl = await redis.ttl(key);

      // New TTL should be greater than TTL before extend
      expect(newTtl).toBeGreaterThan(ttlBeforeExtend);
      // New TTL should be close to 1800 (30 minutes)
      expect(newTtl).toBeGreaterThanOrEqual(1795);
    });

    it("should not throw error for non-existent session", async () => {
      await expect(
        extendSession("non-existent-session"),
      ).resolves.not.toThrow();
    });
  });

  describe("isSessionValid", () => {
    it("should return true for valid session", async () => {
      await saveSession(sessionId, mockSessionData);

      const isValid = await isSessionValid(sessionId);

      expect(isValid).toBe(true);
    });

    it("should return false for non-existent session", async () => {
      const isValid = await isSessionValid("non-existent-session");

      expect(isValid).toBe(false);
    });

    it("should return false for expired session", async () => {
      // Save session with very short TTL
      const redis = getRedisClient();
      const key = `booking:session:${sessionId}`;
      await redis.setex(key, 1, JSON.stringify(mockSessionData));

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const isValid = await isSessionValid(sessionId);

      expect(isValid).toBe(false);
    });
  });

  describe("Session Persistence", () => {
    it("should persist and restore complete booking state", async () => {
      // Save session
      await saveSession(sessionId, mockSessionData);

      // Load session
      const loaded = await loadSession(sessionId);

      expect(loaded).toBeDefined();
      if (loaded) {
        // Verify all data is preserved
        expect(loaded.searchCriteria?.tripType).toBe(
          mockSessionData.searchCriteria?.tripType,
        );
        expect(loaded.selectedFlight?.id).toBe(
          mockSessionData.selectedFlight?.id,
        );
        expect(Object.keys(loaded.selectedSeats)).toHaveLength(1);
        expect(loaded.passengers).toHaveLength(1);
        expect(Object.keys(loaded.selectedExtras.baggage)).toHaveLength(1);
        expect(Object.keys(loaded.selectedExtras.meals)).toHaveLength(1);
        expect(loaded.selectedExtras.insurance).toBeDefined();
        expect(loaded.selectedExtras.loungeAccess).toBeDefined();
      }
    });

    it("should handle multiple save operations", async () => {
      // Save initial data
      await saveSession(sessionId, mockSessionData);

      // Update and save again
      const updatedData = {
        ...mockSessionData,
        passengers: [
          ...mockSessionData.passengers,
          {
            id: "passenger-2",
            type: "adult" as const,
            firstName: "Jane",
            lastName: "Smith",
            dateOfBirth: new Date("1992-05-15"),
            gender: "female" as const,
          },
        ],
      };

      await saveSession(sessionId, updatedData);

      // Load and verify
      const loaded = await loadSession(sessionId);

      expect(loaded).toBeDefined();
      if (loaded) {
        expect(loaded.passengers).toHaveLength(2);
        expect(loaded.passengers[1].firstName).toBe("Jane");
      }
    });
  });
});
