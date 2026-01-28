import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "@/lib/prisma";

describe("Prisma Integration", () => {
  let testBookingId: string;

  afterAll(async () => {
    // Clean up test data
    if (testBookingId) {
      await prisma.booking.delete({
        where: { id: testBookingId },
      });
    }
    await prisma.$disconnect();
  });

  it("should connect to database", async () => {
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    expect(result).toBeDefined();
  });

  it("should create a booking", async () => {
    const booking = await prisma.booking.create({
      data: {
        reference: "TEST01",
        status: "PENDING",
        flightId: "test-flight-1",
        flightData: {
          airline: "Test Airlines",
          flightNumber: "TA123",
        },
        seats: {},
        extras: {},
        totalAmount: 500.0,
        currency: "USD",
        paymentStatus: "PENDING",
      },
    });

    testBookingId = booking.id;

    expect(booking).toBeDefined();
    expect(booking.reference).toBe("TEST01");
    expect(booking.status).toBe("PENDING");
  });

  it("should retrieve a booking by reference", async () => {
    const booking = await prisma.booking.findUnique({
      where: { reference: "TEST01" },
    });

    expect(booking).toBeDefined();
    expect(booking?.reference).toBe("TEST01");
  });
});
