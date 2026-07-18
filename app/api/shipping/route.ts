import { NextResponse } from "next/server";
import { getShippingZones, getShippingMethods } from "@/lib/woocommerce";

export async function POST(request: Request) {
  try {
    const { state, postcode, country } = await request.json();

    // In a real implementation, you would match the address against WC shipping zones.
    // For Ayodhya Store, we simplify to return a default free shipping or flat rate.
    // We'll fetch zones and methods as requested, but logic is simulated.
    
    const zones = await getShippingZones();
    let selectedZone = zones[0]; // fallback to first zone
    
    // Find matching zone if possible (simplified)
    // ... logic to match state/postcode ...

    const methods = await getShippingMethods(selectedZone?.id || 0);

    const availableMethods = methods.filter(m => m.enabled).map(m => ({
      id: m.method_id,
      instance_id: m.instance_id,
      title: m.method_title,
      cost: m.settings?.cost?.value || "0",
    }));

    // If no methods found, provide a fallback free shipping
    if (availableMethods.length === 0) {
      availableMethods.push({
        id: "free_shipping",
        instance_id: 1,
        title: "Free Delivery",
        cost: "0"
      });
    }

    return NextResponse.json({ methods: availableMethods });
  } catch (error: any) {
    console.error("Shipping API Error:", error);
    return NextResponse.json({ error: "Failed to calculate shipping" }, { status: 500 });
  }
}
