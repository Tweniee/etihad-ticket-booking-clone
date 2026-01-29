/**
 * Script to create 5 demo users for testing
 * Usage: npx tsx scripts/create-demo-users.ts
 */

import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

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

      console.log(`✓ Created user: ${userData.firstName} ${userData.lastName}`);
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
}

main()
  .catch((e) => {
    console.error("Error creating demo users:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
