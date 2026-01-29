import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Testing database connection...\n");
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  console.log("✓ Database connected!\n");
  client.release();

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const existing = await prisma.user.findUnique({
    where: { email: "test@example.com" },
  });

  if (existing) {
    console.log("✓ User exists:", existing.email);
  } else {
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        password: hashedPassword,
        firstName: "Test",
        lastName: "User",
        phone: "+1234567890",
      },
    });
    console.log("✓ User created:", user.email);
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
