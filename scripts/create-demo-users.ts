/**
 * Script to create 5 demo users for testing
 * Usage: npx tsx scripts/create-demo-users.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

const demoUsers = [
  {
    email: "john.doe@example.com",
    password: "password123",
    firstName: "John",
    lastName: "Doe",
    phone: "+1234567890",
  },
  {
    email: "sarah.smith@example.com",
    password: "password123",
    firstName: "Sarah",
    lastName: "Smith",
    phone: "+1234567891",
  },
  {
    email: "ahmed.ali@example.com",
    password: "password123",
    firstName: "Ahmed",
    lastName: "Ali",
    phone: "+971501234567",
  },
  {
    email: "maria.garcia@example.com",
    password: "password123",
    firstName: "Maria",
    lastName: "Garcia",
    phone: "+34612345678",
  },
  {
    email: "david.chen@example.com",
    password: "password123",
    firstName: "David",
    lastName: "Chen",
    phone: "+8613812345678",
  },
];

async function main() {
  console.log("Creating 5 demo users...\n");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
  console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set\n");

  // Initialize Prisma with connection pool (same pattern as test-db-connection.ts)
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Test connection
    await prisma.$connect();
    console.log("✓ Database connected!\n");

    for (const userData of demoUsers) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email },
        });

        if (existingUser) {
          console.log(`✓ User already exists: ${userData.email}`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user
        const user = await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
          },
        });

        console.log(
          `✓ Created user: ${userData.firstName} ${userData.lastName}`,
        );
        console.log(`  Email: ${userData.email}`);
        console.log(`  Password: ${userData.password}`);
        console.log(`  ID: ${user.id}\n`);
      } catch (error) {
        console.error(`✗ Error creating user ${userData.email}:`, error);
      }
    }

    console.log("\n=== DEMO USERS SUMMARY ===\n");
    console.log("All users have the same password: password123\n");
    console.log("User Credentials:");
    console.log("─────────────────────────────────────────────────");
    demoUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Phone: ${user.phone}\n`);
    });

    await prisma.$disconnect();
    await pool.end();
  } catch (error) {
    console.error("Error in main function:", error);
    await prisma.$disconnect();
    await pool.end();
    throw error;
  }
}

main().catch((e) => {
  console.error("Error creating demo users:", e);
  process.exit(1);
});
