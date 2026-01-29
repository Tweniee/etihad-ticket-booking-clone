/**
 * Booking Utility Functions
 *
 * Utilities for booking operations including reference generation
 *
 * Requirements: 11.1
 */

import { prisma } from "@/lib/prisma";

/**
 * Generate a 6-character alphanumeric booking reference
 * Requirements: 11.1
 *
 * @returns A random 6-character alphanumeric string
 */
export function generateBookingReference(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let reference = "";
  for (let i = 0; i < 6; i++) {
    reference += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return reference;
}

/**
 * Generate a unique booking reference by checking against database
 * Requirements: 11.1
 *
 * @param maxAttempts - Maximum number of attempts to generate unique reference
 * @returns A unique 6-character alphanumeric booking reference
 * @throws Error if unable to generate unique reference after maxAttempts
 */
export async function generateUniqueBookingReference(
  maxAttempts: number = 10,
): Promise<string> {
  let reference = generateBookingReference();
  let attempts = 0;

  while (attempts < maxAttempts) {
    const existing = await prisma.booking.findUnique({
      where: { reference },
    });

    if (!existing) {
      return reference;
    }

    reference = generateBookingReference();
    attempts++;
  }

  throw new Error(
    `Failed to generate unique booking reference after ${maxAttempts} attempts`,
  );
}

/**
 * Validate booking reference format
 *
 * @param reference - Booking reference to validate
 * @returns true if reference is valid format (6 alphanumeric characters)
 */
export function isValidBookingReference(reference: string): boolean {
  return /^[A-Z0-9]{6}$/.test(reference);
}
