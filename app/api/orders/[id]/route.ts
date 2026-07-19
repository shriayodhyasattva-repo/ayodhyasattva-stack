import { NextResponse } from "next/server";
import { getOrder, getOrderNotes } from "@/lib/woocommerce";
import { getSession } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    const { id } = await params;
    
    const [order, notes] = await Promise.all([
      getOrder(Number(id)),
      getOrderNotes(Number(id)).catch(() => []) // Catch in case notes fail, don't break order
    ]);

    // Ensure the user owns this order, or allow guest orders if customer_id is 0
    // (In a real app, you might use an order key for guest access)
    if (order.customer_id !== 0) {
      if (!session || session.id !== order.customer_id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    return NextResponse.json({ order, notes });
  } catch (error: any) {
    console.error("Order API Error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
