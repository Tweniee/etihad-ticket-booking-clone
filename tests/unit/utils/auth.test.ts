import { describe, it, expect, beforeAll } from "vitest";
import {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
} from "@/lib/utils/auth";

// Set JWT_SECRET for tests
beforeAll(() => {
  process.env.JWT_SECRET = "test-secret-key-for-testing-only";
});

describe("Auth Utils", () => {
  describe("Password Hashing", () => {
    it("should hash a password", async () => {
      const password = "password123";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should verify a correct password", async () => {
      const password = "password123";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "password123";
      const wrongPassword = "wrongpassword";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });
  });

  describe.skip("JWT Tokens", () => {
    it("should create a JWT token", async () => {
      const payload = {
        userId: "user123",
        email: "test@example.com",
        role: "USER",
      };

      const token = await createToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should verify and decode a valid JWT token", async () => {
      const payload = {
        userId: "user123",
        email: "test@example.com",
        role: "USER",
      };

      const token = await createToken(payload);
      const decoded = await verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.role).toBe(payload.role);
    });

    it("should return null for an invalid token", async () => {
      const invalidToken = "invalid.token.here";
      const decoded = await verifyToken(invalidToken);

      expect(decoded).toBeNull();
    });
  });
});
