import { NextResponse } from "next/server";
import { storeApi } from "@/lib/woocommerce";
import { getStoreApiHeaders, saveStoreHeaders } from "../route";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = await getStoreApiHeaders();
    
    // key -> item key
    const payload = {
      key: body.key,
    };

    const response = await storeApi.post("/cart/remove-item", payload, { headers });
    
    await saveStoreHeaders(response.headers["cart-token"], response.headers["nonce"]);
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Cart Remove Error:", error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data?.message || "Internal Server Error" }, { status: error.response?.status || 500 });
  }
}
