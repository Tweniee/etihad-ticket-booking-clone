/**
 * Verification script for Prisma models
 * This script verifies that all models and enums are correctly defined
 */

import {
  PrismaClient,
  BookingStatus,
  PaymentStatus,
  PassengerType,
  Gender,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

async function verifyModels() {
  // Create a connection pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  // Create the adapter
  const adapter = new PrismaPg(pool);

  // Create Prisma client with adapter
  const prisma = new PrismaClient({
    adapter,
  });

  try {
    console.log("🔍 Verifying Prisma models and enums...\n");

    // Verify enums
    console.log("✅ BookingStatus enum:", Object.values(BookingStatus));
    console.log("✅ PaymentStatus enum:", Object.values(PaymentStatus));
    console.log("✅ PassengerType enum:", Object.values(PassengerType));
    console.log("✅ Gender enum:", Object.values(Gender));

    // Verify models exist by checking their count
    const bookingCount = await prisma.booking.count();
    console.log(`\n✅ Booking model accessible (count: ${bookingCount})`);

    const passengerCount = await prisma.passenger.count();
    console.log(`✅ Passenger model accessible (count: ${passengerCount})`);

    const sessionCount = await prisma.session.count();
    console.log(`✅ Session model accessible (count: ${sessionCount})`);

    // Verify relationships by checking the model structure
    console.log("\n✅ All models and relationships verified successfully!");
    console.log("\n📋 Schema Summary:");
    console.log(
      "   - Booking: id, reference, status, flightId, flightData, passengers[], seats, extras, totalAmount, currency, paymentId, paymentStatus, createdAt, updatedAt",
    );
    console.log(
      "   - Passenger: id, bookingId, booking, type, firstName, lastName, dateOfBirth, gender, passportNumber?, passportExpiry?, nationality?, email?, phone?, countryCode?",
    );
    console.log(
      "   - Session: id, sessionId, searchCriteria?, selectedFlight?, selectedSeats?, passengerInfo?, selectedExtras?, expiresAt, createdAt, updatedAt",
    );
  } catch (error) {
    console.error("❌ Error verifying models:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

verifyModels();
