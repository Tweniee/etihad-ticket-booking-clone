import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/utils/auth";
import { cookies } from "next/headers";

/**
 * GET /api/auth/token
 * Returns the JWT token for client-side use (e.g., chatbot)
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get the token from the httpOnly cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 401 });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error getting token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
