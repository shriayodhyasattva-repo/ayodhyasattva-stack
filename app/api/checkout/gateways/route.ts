import { NextResponse } from "next/server";
import { getPaymentGateways } from "@/lib/woocommerce";

export async function GET() {
  try {
    const allGateways = await getPaymentGateways();
    // Filter only enabled gateways
    const enabledGateways = allGateways.filter(g => g.enabled);
    return NextResponse.json({ gateways: enabledGateways });
  } catch (error: any) {
    console.error("Fetch Gateways Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to fetch payment gateways" },
      { status: 500 }
    );
  }
}
