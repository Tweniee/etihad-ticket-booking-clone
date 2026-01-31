import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTravelHistorySchema } from "@/lib/validation/auth";

// GET all travel history (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const destination = searchParams.get("destination");
    const purpose = searchParams.get("purpose");

    const where: Record<string, unknown> = {};
    if (userId) where.userId = parseInt(userId, 10);
    if (destination) where.destination = { contains: destination, mode: "insensitive" };
    if (purpose) where.purpose = purpose;

    const travelHistory = await prisma.travelHistory.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            category: true,
            citizenship: true,
          },
        },
      },
      orderBy: { travelDate: "desc" },
    });

    return NextResponse.json({ travelHistory });
  } catch (error) {
    console.error("Get travel history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create new travel history entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = createTravelHistorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 },
      );
    }

    const { userId, destination, travelDate, purpose } = result.data;

    // Verify user exists
    const user = await prisma.userInfo.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    const travelHistory = await prisma.travelHistory.create({
      data: {
        userId,
        destination,
        travelDate: new Date(travelDate),
        purpose: purpose || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json({ travelHistory }, { status: 201 });
  } catch (error) {
    console.error("Create travel history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
