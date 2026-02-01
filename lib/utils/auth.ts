import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_EXPIRY = "7d"; // 7 days

function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || "eyhackathonteam34";
  return new TextEncoder().encode(secret);
}

function getJWTAlgorithm(): "HS256" | "HS384" | "HS512" {
  const algorithm = process.env.JWT_ALGORITHM || "HS256";
  if (algorithm === "HS256" || algorithm === "HS384" || algorithm === "HS512") {
    return algorithm;
  }
  return "HS256";
}

export interface JWTPayload {
  user_id: number;
  name: string;
  category: string;
  [key: string]: unknown;
}

/**
 * Create a JWT token
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: getJWTAlgorithm() })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getJWTSecret());
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJWTSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Get the current user from the auth cookie
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

/**
 * Set the auth cookie
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

/**
 * Clear the auth cookie
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
}
