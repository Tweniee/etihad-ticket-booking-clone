import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation/auth";
import { createToken, setAuthCookie } from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 },
      );
    }

    const { category, name, citizenship, uaeResident, details } = result.data;

    // Check if user with same name already exists
    const existingUser = await prisma.userInfo.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this name already exists" },
        { status: 409 },
      );
    }

    // Create user
    const user = await prisma.userInfo.create({
      data: {
        category,
        name,
        citizenship,
        uaeResident,
        details: details || null,
      },
    });

    // Create token
    const token = await createToken({
      userId: user.id,
      name: user.name,
      category: user.category,
    });

    // Set cookie
    await setAuthCookie(token);

    // Return user data
    return NextResponse.json({
      user: {
        id: user.id,
        category: user.category,
        name: user.name,
        citizenship: user.citizenship,
        uaeResident: user.uaeResident,
        details: user.details,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
