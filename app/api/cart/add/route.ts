import { NextResponse } from "next/server";
import { storeApi } from "@/lib/woocommerce";
import { getStoreApiHeaders, saveStoreHeaders } from "../route";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = await getStoreApiHeaders();
    
    // Store API accepts variation_id as the primary id for variable products
    const payload: any = {
      id: body.variationId || body.productId,
      quantity: body.quantity || 1,
    };
    if (body.variation) {
      payload.variation = body.variation;
    }

    const response = await storeApi.post("/cart/add-item", payload, { headers });
    
    await saveStoreHeaders(response.headers["cart-token"], response.headers["nonce"]);
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Cart Add Error:", error.response?.data || error.message);
    return NextResponse.json({ error: error.response?.data?.message || "Internal Server Error" }, { status: error.response?.status || 500 });
  }
}
