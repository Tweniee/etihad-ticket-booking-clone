import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation/auth";

// GET all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const citizenship = searchParams.get("citizenship");
    const uaeResident = searchParams.get("uaeResident");

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (citizenship) where.citizenship = citizenship;
    if (uaeResident !== null) where.uaeResident = uaeResident === "true";

    const users = await prisma.userInfo.findMany({
      where,
      include: {
        travelHistory: {
          orderBy: { travelDate: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 },
      );
    }

    const { category, name, citizenship, uaeResident, details } = result.data;

    const user = await prisma.userInfo.create({
      data: {
        category,
        name,
        citizenship,
        uaeResident,
        details: details || null,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
