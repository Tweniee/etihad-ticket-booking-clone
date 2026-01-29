/**
 * Cache Utility
 *
 * Provides caching functionality for API responses and static data
 * Uses Redis for distributed caching with fallback to in-memory cache
 *
 * Requirements: 1.8 (Performance optimization)
 */

import redis from "@/lib/redis";

// In-memory cache fallback
const memoryCache = new Map<string, { data: any; expiry: number }>();

/**
 * Cache configuration
 */
export const CACHE_TTL = {
  FLIGHT_SEARCH: 5 * 60, // 5 minutes
  AIRPORTS: 24 * 60 * 60, // 24 hours
  AIRLINES: 24 * 60 * 60, // 24 hours
  SEAT_MAP: 10 * 60, // 10 minutes
} as const;

/**
 * Generate cache key from object
 */
export function generateCacheKey(prefix: string, data: any): string {
  const sortedData = JSON.stringify(data, Object.keys(data).sort());
  return `${prefix}:${Buffer.from(sortedData).toString("base64")}`;
}

/**
 * Get data from cache
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    // Try Redis first
    if (redis) {
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached) as T;
      }
    }
  } catch (error) {
    console.warn(
      "Redis cache get failed, falling back to memory cache:",
      error,
    );
  }

  // Fallback to memory cache
  const memoryCached = memoryCache.get(key);
  if (memoryCached && memoryCached.expiry > Date.now()) {
    return memoryCached.data as T;
  }

  // Clean up expired memory cache entry
  if (memoryCached) {
    memoryCache.delete(key);
  }

  return null;
}

/**
 * Set data in cache
 */
export async function setInCache(
  key: string,
  data: any,
  ttlSeconds: number,
): Promise<void> {
  try {
    // Try Redis first
    if (redis) {
      await redis.setex(key, ttlSeconds, JSON.stringify(data));
      return;
    }
  } catch (error) {
    console.warn(
      "Redis cache set failed, falling back to memory cache:",
      error,
    );
  }

  // Fallback to memory cache
  memoryCache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Delete data from cache
 */
export async function deleteFromCache(key: string): Promise<void> {
  try {
    if (redis) {
      await redis.del(key);
    }
  } catch (error) {
    console.warn("Redis cache delete failed:", error);
  }

  memoryCache.delete(key);
}

/**
 * Clear all cache entries matching a pattern
 */
export async function clearCachePattern(pattern: string): Promise<void> {
  try {
    if (redis) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  } catch (error) {
    console.warn("Redis cache pattern clear failed:", error);
  }

  // Clear matching memory cache entries
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern.replace("*", ""))) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Wrapper function to cache API responses
 */
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>,
): Promise<T> {
  // Try to get from cache
  const cached = await getFromCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Store in cache
  await setInCache(key, data, ttlSeconds);

  return data;
}
