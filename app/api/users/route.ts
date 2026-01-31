import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/users
 * Returns list of users from user_info table for login selection
 */
export async function GET() {
  try {
    const users = await prisma.userInfo.findMany({
      select: {
        id: true,
        name: true,
        category: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users", users: [] },
      { status: 500 },
    );
  }
}
