import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ user: null });
    }

    // Fetch full user data with travel history
    const user = await prisma.userInfo.findUnique({
      where: { id: currentUser.user_id },
      include: {
        travelHistory: {
          orderBy: { travelDate: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        category: user.category,
        name: user.name,
        citizenship: user.citizenship,
        uaeResident: user.uaeResident,
        details: user.details,
        createdAt: user.createdAt,
        travelHistory: user.travelHistory,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
