import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { storeApi } from "@/lib/woocommerce";

// Helper to interact with WooCommerce Store API
export async function getStoreApiHeaders() {
  const cookieStore = await cookies();
  const cartToken = cookieStore.get("cart_token")?.value;
  const nonce = cookieStore.get("nonce")?.value;
  const headers: any = {
    "Content-Type": "application/json",
  };
  
  if (cartToken) {
    headers["Cart-Token"] = cartToken;
  }
  if (nonce) {
    headers["Nonce"] = nonce;
  }
  
  const session = await getSession();
  if (session && (session as any).jwtToken) {
    headers["Authorization"] = `Bearer ${(session as any).jwtToken}`;
  }
  
  return headers;
}

export async function saveStoreHeaders(cartToken?: string, nonce?: string) {
  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  };

  if (cartToken) {
    cookieStore.set("cart_token", cartToken, cookieOptions);
  }
  if (nonce) {
    cookieStore.set("nonce", nonce, cookieOptions);
  }
}

export async function GET() {
  try {
    const headers = await getStoreApiHeaders();
    
    // Call WooCommerce Store API using our axios instance
    const response = await storeApi.get("/cart", { headers });
    
    await saveStoreHeaders(response.headers["cart-token"], response.headers["nonce"]);
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Cart GET Error:", error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data?.message || "Internal Server Error" }, { status: error.response?.status || 500 });
  }
}
