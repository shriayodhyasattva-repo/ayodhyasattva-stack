import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  await clearSession();
  
  // Also clear cart session cookies so the next session starts fresh
  const cookieStore = await cookies();
  cookieStore.delete("cart_token");
  cookieStore.delete("nonce");
  
  return NextResponse.json({ success: true });
}
