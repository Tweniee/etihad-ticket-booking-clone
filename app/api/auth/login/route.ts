import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation/auth";
import { createToken, setAuthCookie } from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 },
      );
    }

    const { userId, name } = result.data;

    // Find user by ID or name
    let user;
    if (userId) {
      user = await prisma.userInfo.findUnique({
        where: { id: userId },
      });
    } else if (name) {
      user = await prisma.userInfo.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 },
      );
    }

    // Create token
    const token = await createToken({
      user_id: user.id,
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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
