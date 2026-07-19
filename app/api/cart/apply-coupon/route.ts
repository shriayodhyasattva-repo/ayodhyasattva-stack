import { NextResponse } from "next/server";
import { storeApi } from "@/lib/woocommerce";
import { getStoreApiHeaders, saveStoreHeaders } from "../route";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const headers = await getStoreApiHeaders();
    
    const response = await storeApi.post("/cart/apply-coupon", { code }, { headers });
    
    await saveStoreHeaders(response.headers["cart-token"], response.headers["nonce"]);
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Cart Apply Coupon Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || "Failed to apply coupon" }, 
      { status: error.response?.status || 500 }
    );
  }
}
