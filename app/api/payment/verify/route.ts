import { NextResponse } from "next/server";
import { updateOrder } from "@/lib/woocommerce";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, wc_order_id } = await request.json();

    const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

    if (!RAZORPAY_SECRET) {
      return NextResponse.json({ error: "Razorpay secret not configured" }, { status: 500 });
    }

    // Verify signature
    const hmac = crypto.createHmac("sha256", RAZORPAY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Mark WooCommerce order as processing (paid)
    const order = await updateOrder(wc_order_id, {
      status: "processing",
      meta_data: [
        {
          id: 0,
          key: "_razorpay_payment_id",
          value: razorpay_payment_id
        }
      ]
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
