/**
 * Session Management Utilities
 *
 * Handles persistence of booking flow state to Redis
 * Requirements: 16.1, 16.5
 */

import { getRedisClient } from "./redis";
import type {
  SearchCriteria,
  Flight,
  Seat,
  PassengerInfo,
  SelectedExtras,
} from "../types";

/**
 * Session data structure stored in Redis
 */
export interface SessionData {
  searchCriteria: SearchCriteria | null;
  selectedFlight: Flight | null;
  selectedSeats: Record<string, Seat>; // Map converted to object for JSON
  passengers: PassengerInfo[];
  selectedExtras: {
    baggage: Record<string, any>;
    meals: Record<string, any>;
    insurance: any | null;
    loungeAccess: any | null;
  };
}

/**
 * Session timeout in seconds (30 minutes)
 * Requirement: 16.2
 */
const SESSION_TIMEOUT = 30 * 60; // 30 minutes

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Save session data to Redis
 *
 * Requirements: 16.1
 *
 * @param sessionId - Unique session identifier
 * @param data - Session data to persist
 */
export async function saveSession(
  sessionId: string,
  data: SessionData,
): Promise<void> {
  try {
    const redis = getRedisClient();
    const key = `booking:session:${sessionId}`;

    // Convert Maps to objects for JSON serialization
    const serializedData = JSON.stringify(data);

    // Save to Redis with expiration
    await redis.setex(key, SESSION_TIMEOUT, serializedData);
  } catch (error) {
    console.error("Failed to save session:", error);
    throw new Error("Failed to save session data");
  }
}

/**
 * Load session data from Redis
 *
 * Requirements: 16.1
 *
 * @param sessionId - Unique session identifier
 * @returns Session data or null if not found/expired
 */
export async function loadSession(
  sessionId: string,
): Promise<SessionData | null> {
  try {
    const redis = getRedisClient();
    const key = `booking:session:${sessionId}`;

    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    // Parse JSON and convert objects back to Maps
    const parsed = JSON.parse(data);

    return parsed;
  } catch (error) {
    console.error("Failed to load session:", error);
    return null;
  }
}

/**
 * Clear session data from Redis
 *
 * Requirements: 16.5
 *
 * @param sessionId - Unique session identifier
 */
export async function clearSession(sessionId: string): Promise<void> {
  try {
    const redis = getRedisClient();
    const key = `booking:session:${sessionId}`;

    await redis.del(key);
  } catch (error) {
    console.error("Failed to clear session:", error);
    // Don't throw error on clear failure
  }
}

/**
 * Extend session timeout
 *
 * Requirements: 16.2
 *
 * @param sessionId - Unique session identifier
 */
export async function extendSession(sessionId: string): Promise<void> {
  try {
    const redis = getRedisClient();
    const key = `booking:session:${sessionId}`;

    // Reset expiration to 30 minutes
    await redis.expire(key, SESSION_TIMEOUT);
  } catch (error) {
    console.error("Failed to extend session:", error);
    // Don't throw error on extend failure
  }
}

/**
 * Check if session exists and is valid
 *
 * Requirements: 16.3
 *
 * @param sessionId - Unique session identifier
 * @returns true if session exists and is valid
 */
export async function isSessionValid(sessionId: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const key = `booking:session:${sessionId}`;

    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error("Failed to check session validity:", error);
    return false;
  }
}
