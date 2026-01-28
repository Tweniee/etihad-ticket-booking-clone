import { describe, it, expect, beforeAll, afterAll } from "vitest";
import redis from "@/lib/redis";

describe("Redis Integration", () => {
  beforeAll(async () => {
    // Wait for Redis to be ready
    await redis.ping();
  });

  afterAll(async () => {
    // Clean up test data
    await redis.del("test:key");
    await redis.quit();
  });

  it("should connect to Redis", async () => {
    const result = await redis.ping();
    expect(result).toBe("PONG");
  });

  it("should set and get values", async () => {
    await redis.set("test:key", "test:value");
    const value = await redis.get("test:key");
    expect(value).toBe("test:value");
  });

  it("should handle expiration", async () => {
    await redis.set("test:expiring", "value", "EX", 1);
    const value = await redis.get("test:expiring");
    expect(value).toBe("value");

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const expiredValue = await redis.get("test:expiring");
    expect(expiredValue).toBeNull();
  });
});
