import { NextResponse } from "next/server";
import { createOrder, getCustomerOrders } from "@/lib/woocommerce";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await getSession();

    // If logged in, attach customer ID to the order
    if (session) {
      body.customer_id = session.id;
    }

    const order = await createOrder(body);
    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Orders API Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await getCustomerOrders(session.id);
    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Orders API Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
