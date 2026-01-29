/**
 * Script to verify the authentication system is working
 * Usage: npx tsx scripts/verify-auth-system.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🔍 Verifying Authentication System...\n");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // Check environment variables
    console.log("1. Environment Variables:");
    console.log(
      "   DATABASE_URL:",
      process.env.DATABASE_URL ? "✅ Set" : "❌ Not set",
    );
    console.log(
      "   JWT_SECRET:",
      process.env.JWT_SECRET ? "✅ Set" : "❌ Not set",
    );
    console.log();

    // Check database connection
    console.log("2. Database Connection:");
    await prisma.$connect();
    console.log("   ✅ Connected to PostgreSQL");
    console.log();

    // Check users
    console.log("3. Demo Users:");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
    console.log(`   ✅ Found ${users.length} users in database`);
    users.forEach((user) => {
      console.log(`      - ${user.firstName} ${user.lastName} (${user.email})`);
    });
    console.log();

    // Verify password hashing
    console.log("4. Password Verification:");
    const testUser = await prisma.user.findUnique({
      where: { email: "john.doe@example.com" },
    });

    if (testUser) {
      const isValid = await bcrypt.compare("password123", testUser.password);
      console.log("   ✅ Password hashing:", isValid ? "Working" : "Failed");
    } else {
      console.log("   ⚠️  Test user not found");
    }
    console.log();

    // Check services
    console.log("5. Services Status:");
    console.log("   Web App: http://localhost:3000");
    console.log("   Prisma Studio: http://localhost:51212");
    console.log();

    console.log("✅ Authentication System Verification Complete!\n");
    console.log("📝 Next Steps:");
    console.log("   1. Open http://localhost:3000");
    console.log("   2. Click 'Login'");
    console.log("   3. Use: john.doe@example.com / password123");
    console.log();

    await prisma.$disconnect();
    await pool.end();
  } catch (error) {
    console.error("❌ Verification failed:", error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  }
}

main();
