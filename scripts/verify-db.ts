import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

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

async function verifyDatabase() {
  console.log("🔍 Verifying database schema...\n");

  try {
    // Test 1: Check database connection
    console.log("✓ Testing database connection...");
    await prisma.$connect();
    console.log("  ✓ Database connection successful\n");

    // Test 2: Verify Booking table
    console.log("✓ Verifying Booking table...");
    const bookingCount = await prisma.booking.count();
    console.log(`  ✓ Booking table exists (${bookingCount} records)\n`);

    // Test 3: Verify Passenger table
    console.log("✓ Verifying Passenger table...");
    const passengerCount = await prisma.passenger.count();
    console.log(`  ✓ Passenger table exists (${passengerCount} records)\n`);

    // Test 4: Verify Session table
    console.log("✓ Verifying Session table...");
    const sessionCount = await prisma.session.count();
    console.log(`  ✓ Session table exists (${sessionCount} records)\n`);

    // Test 5: Verify enums by creating a test booking
    console.log("✓ Verifying enums and relationships...");
    const testBooking = await prisma.booking.create({
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
        passengers: {
          create: {
            type: "ADULT",
            firstName: "John",
            lastName: "Doe",
            dateOfBirth: new Date("1990-01-01"),
            gender: "MALE",
            email: "john.doe@example.com",
            phone: "+1234567890",
          },
        },
      },
      include: {
        passengers: true,
      },
    });
    console.log("  ✓ Successfully created test booking with passenger");
    console.log(`  ✓ Booking reference: ${testBooking.reference}`);
    console.log(`  ✓ Passenger count: ${testBooking.passengers.length}\n`);

    // Clean up test data
    console.log("✓ Cleaning up test data...");
    await prisma.booking.delete({
      where: { id: testBooking.id },
    });
    console.log("  ✓ Test data cleaned up\n");

    console.log("✅ All database schema verifications passed!");
    console.log("\nDatabase Schema Summary:");
    console.log("  • Booking table: ✓");
    console.log("  • Passenger table: ✓");
    console.log("  • Session table: ✓");
    console.log("  • BookingStatus enum: ✓");
    console.log("  • PaymentStatus enum: ✓");
    console.log("  • PassengerType enum: ✓");
    console.log("  • Gender enum: ✓");
    console.log("  • Foreign key relationships: ✓");
    console.log("  • Cascade delete: ✓");
  } catch (error) {
    console.error("❌ Database verification failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

verifyDatabase();
