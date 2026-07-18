import { NextResponse } from "next/server";
import { getCustomer, updateCustomer } from "@/lib/woocommerce";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await getCustomer(session.id);
    return NextResponse.json({ customer });
  } catch (error: any) {
    console.error("Customer API Error:", error);
    return NextResponse.json({ error: "Failed to fetch customer profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Only allow updating specific fields
    const updateData = {
      first_name: body.first_name,
      last_name: body.last_name,
      billing: body.billing,
      shipping: body.shipping,
    };

    const customer = await updateCustomer(session.id, updateData);
    
    // We should technically update the session JWT here if first/last name changed, 
    // but for simplicity we rely on the DB source of truth for full profile fetches.
    
    return NextResponse.json({ customer });
  } catch (error: any) {
    console.error("Customer API Error:", error);
    return NextResponse.json({ error: "Failed to update customer profile" }, { status: 500 });
  }
}
