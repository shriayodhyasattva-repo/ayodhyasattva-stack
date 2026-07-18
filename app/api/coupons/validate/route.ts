import { NextResponse } from "next/server";
import { getCoupon } from "@/lib/woocommerce";

export async function POST(request: Request) {
  try {
    const { code, cartTotal } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupons = await getCoupon(code);
    
    if (!coupons || coupons.length === 0) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    const coupon = coupons[0];

    // Basic validations
    if (coupon.date_expires && new Date(coupon.date_expires) < new Date()) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }

    if (coupon.minimum_amount && cartTotal < parseFloat(coupon.minimum_amount)) {
      return NextResponse.json({ error: `Minimum order amount is ₹${coupon.minimum_amount}` }, { status: 400 });
    }
    
    if (coupon.maximum_amount && cartTotal > parseFloat(coupon.maximum_amount)) {
      return NextResponse.json({ error: `Maximum order amount is ₹${coupon.maximum_amount}` }, { status: 400 });
    }

    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
       return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    }

    // Calculate discount amount (simplified for client-side display)
    let discountAmount = 0;
    if (coupon.discount_type === "percent") {
      discountAmount = (cartTotal * parseFloat(coupon.amount)) / 100;
    } else {
      // Fixed cart discount
      discountAmount = parseFloat(coupon.amount);
    }

    return NextResponse.json({
      coupon: {
        code: coupon.code,
        discount_amount: discountAmount.toFixed(2),
        discount_type: coupon.discount_type,
        free_shipping: coupon.free_shipping
      }
    });
  } catch (error: any) {
    console.error("Coupon API Error:", error);
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
