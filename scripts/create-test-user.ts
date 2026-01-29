/**
 * Script to create a test user for development
 * Usage: npx tsx scripts/create-test-user.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const testUser = {
    email: "test@example.com",
    password: "password123",
    firstName: "Test",
    lastName: "User",
    phone: "+1234567890",
  };

  console.log("Creating test user...");

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: testUser.email },
  });

  if (existingUser) {
    console.log("Test user already exists!");
    console.log("Email:", testUser.email);
    console.log("Password:", testUser.password);
    return;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(testUser.password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: testUser.email,
      password: hashedPassword,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      phone: testUser.phone,
    },
  });

  console.log("Test user created successfully!");
  console.log("Email:", testUser.email);
  console.log("Password:", testUser.password);
  console.log("User ID:", user.id);
}

main()
  .catch((e) => {
    console.error("Error creating test user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
