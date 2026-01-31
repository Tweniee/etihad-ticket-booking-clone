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

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // Clear existing data
  await prisma.travelHistory.deleteMany();
  await prisma.userInfo.deleteMany();

  // Reset sequence for user_id
  await prisma.$executeRaw`ALTER SEQUENCE user_info_user_id_seq RESTART WITH 1`;

  // Insert User Data
  const users = await Promise.all([
    prisma.userInfo.create({
      data: {
        category: "New Traveller",
        name: "John Smith",
        citizenship: "UK",
        uaeResident: true,
        details: "New to travel",
      },
    }),
    prisma.userInfo.create({
      data: {
        category: "Family with kids",
        name: "David Brown",
        citizenship: "France",
        uaeResident: false,
        details:
          "Family of four - mom, dad and 2 children. Child 1 - 1 year; Child 2 - 3 years",
      },
    }),
    prisma.userInfo.create({
      data: {
        category: "Frequent Flyer",
        name: "Salman Khan",
        citizenship: "India",
        uaeResident: true,
        details: "Couple traveller, for leisure",
      },
    }),
    prisma.userInfo.create({
      data: {
        category: "Frequent Flyer",
        name: "Rishi Patel",
        citizenship: "India",
        uaeResident: false,
        details: "Single traveller, more for business purpose",
      },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  // Insert Travel History Data
  const travelHistoryData = [
    // David Brown (User 2) - Family with kids
    { userId: 2, destination: "UK", travelDate: "2024-11-15", purpose: "Leisure" },
    { userId: 2, destination: "UK", travelDate: "2024-10-20", purpose: "Leisure" },
    { userId: 2, destination: "Spain", travelDate: "2024-08-10", purpose: "Leisure" },
    { userId: 2, destination: "UAE", travelDate: "2024-05-15", purpose: "Leisure" },
    { userId: 2, destination: "UAE", travelDate: "2024-03-20", purpose: "Leisure" },
    { userId: 2, destination: "UAE", travelDate: "2024-01-10", purpose: "Leisure" },
    { userId: 2, destination: "France", travelDate: "2023-12-25", purpose: "Leisure" },
    { userId: 2, destination: "Italy", travelDate: "2023-09-10", purpose: "Leisure" },
    { userId: 2, destination: "Germany", travelDate: "2023-07-15", purpose: "Leisure" },
    { userId: 2, destination: "Switzerland", travelDate: "2023-05-20", purpose: "Leisure" },

    // Salman Khan (User 3) - Frequent Flyer
    { userId: 3, destination: "Spain", travelDate: "2024-11-05", purpose: "Leisure" },
    { userId: 3, destination: "Austria", travelDate: "2024-10-15", purpose: "Leisure" },
    { userId: 3, destination: "India", travelDate: "2024-09-20", purpose: "Leisure" },
    { userId: 3, destination: "India", travelDate: "2024-07-10", purpose: "Leisure" },
    { userId: 3, destination: "India", travelDate: "2024-05-15", purpose: "Leisure" },
    { userId: 3, destination: "India", travelDate: "2024-02-20", purpose: "Leisure" },
    { userId: 3, destination: "Thailand", travelDate: "2023-12-10", purpose: "Leisure" },
    { userId: 3, destination: "Singapore", travelDate: "2023-10-05", purpose: "Leisure" },
    { userId: 3, destination: "Malaysia", travelDate: "2023-08-15", purpose: "Leisure" },
    { userId: 3, destination: "India", travelDate: "2023-06-20", purpose: "Leisure" },
    { userId: 3, destination: "UAE", travelDate: "2023-04-10", purpose: "Leisure" },
    { userId: 3, destination: "Maldives", travelDate: "2023-02-14", purpose: "Leisure" },

    // Rishi Patel (User 4) - Frequent Flyer Business
    { userId: 4, destination: "UK", travelDate: "2024-11-01", purpose: "Business" },
    { userId: 4, destination: "UAE", travelDate: "2024-09-15", purpose: "Business" },
    { userId: 4, destination: "US", travelDate: "2024-08-10", purpose: "Business" },
    { userId: 4, destination: "US", travelDate: "2024-06-20", purpose: "Business" },
    { userId: 4, destination: "UAE", travelDate: "2024-04-15", purpose: "Business" },
    { userId: 4, destination: "Germany", travelDate: "2024-03-10", purpose: "Business" },
    { userId: 4, destination: "Singapore", travelDate: "2024-02-05", purpose: "Business" },
    { userId: 4, destination: "India", travelDate: "2023-12-25", purpose: "Leisure" },
    { userId: 4, destination: "UAE", travelDate: "2023-11-10", purpose: "Business" },
    { userId: 4, destination: "UK", travelDate: "2023-09-15", purpose: "Business" },
    { userId: 4, destination: "Canada", travelDate: "2023-07-20", purpose: "Business" },
    { userId: 4, destination: "Australia", travelDate: "2023-05-10", purpose: "Business" },
  ];

  const travelHistory = await prisma.travelHistory.createMany({
    data: travelHistoryData.map((item) => ({
      userId: item.userId,
      destination: item.destination,
      travelDate: new Date(item.travelDate),
      purpose: item.purpose,
    })),
  });

  console.log(`Created ${travelHistory.count} travel history records`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
