import { NextResponse } from "next/server";
import { storeApi, updateCustomer } from "@/lib/woocommerce";
import { getStoreApiHeaders, saveStoreHeaders } from "../cart/route";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = await getStoreApiHeaders();
    
    // Store API requires billing_address and shipping_address
    const checkoutPayload = {
      billing_address: {
        first_name: body.billing?.first_name,
        last_name: body.billing?.last_name,
        address_1: body.billing?.address_1,
        city: body.billing?.city,
        state: body.billing?.state,
        postcode: body.billing?.postcode,
        country: body.billing?.country || "IN",
        email: body.billing?.email,
        phone: body.billing?.phone
      },
      shipping_address: {
        first_name: body.shipping?.first_name,
        last_name: body.shipping?.last_name,
        address_1: body.shipping?.address_1,
        city: body.shipping?.city,
        state: body.shipping?.state,
        postcode: body.shipping?.postcode,
        country: body.shipping?.country || "IN",
      },
      payment_method: body.payment_method, // "cod" or "razorpay" (requires a stub or config in WC)
      payment_data: body.payment_data || [],
      customer_note: body.customer_note || ""
    };

    const session = await getSession();
    
    // Actually, Store API Checkout links to user via the Bearer token in headers (handled by getStoreApiHeaders).
    
    const response = await storeApi.post("/checkout", checkoutPayload, { headers });
    
    // The cart will be cleared on WC side. Update tokens just in case.
    if (response.headers["cart-token"]) {
        await saveStoreHeaders(response.headers["cart-token"], response.headers["nonce"]);
    }
    
    // Auto-save the address to the user's profile for future reuse!
    if (session) {
      try {
        await updateCustomer(session.id, {
          billing: body.billing,
          shipping: body.shipping
        });
      } catch (e) {
        console.error("Failed to sync address to profile:", e);
      }
    }
    
    return NextResponse.json({ order: response.data });
  } catch (error: any) {
    console.error("Store Checkout API Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || "Failed to process checkout via Store API" }, 
      { status: error.response?.status || 500 }
    );
  }
}
