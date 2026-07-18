import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SessionUser } from "@/types/product";

const secretKey = process.env.JWT_SECRET || "default_ayodhya_secret_key_123!";
const key = new TextEncoder().encode(secretKey);

const SESSION_COOKIE_NAME = "ayodhya_store_session";

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createSession(user: SessionUser) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ user, expires });

  (await cookies()).set(SESSION_COOKIE_NAME, session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const session = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!session) return null;

  const parsed = await decrypt(session);
  if (!parsed || !parsed.user) return null;

  // Check if expired
  if (parsed.expires && new Date(parsed.expires) < new Date()) {
    await clearSession();
    return null;
  }

  return parsed.user as SessionUser;
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}
