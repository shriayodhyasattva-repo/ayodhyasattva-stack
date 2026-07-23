import { NextResponse } from "next/server";
import { getCustomer, updateCustomer } from "@/lib/woocommerce";
import { getSession, createSession } from "@/lib/auth";

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

    // Sanitize WooCommerce strict fields
    if (updateData.billing?.email === "") {
      delete updateData.billing.email;
    }

    const customer = await updateCustomer(session.id, updateData);
    
    // Update the session cookie so the UI instantly reflects the new name without requiring a re-login
    if (updateData.first_name !== undefined || updateData.last_name !== undefined) {
      const updatedSession = {
        ...session,
        firstName: updateData.first_name !== undefined ? updateData.first_name : session.firstName,
        lastName: updateData.last_name !== undefined ? updateData.last_name : session.lastName,
      };
      await createSession(updatedSession);
    }
    
    return NextResponse.json({ customer });
  } catch (error: any) {
    console.error("Customer API Error:", error.response?.data || error.message);
    
    if (error.response?.data?.code === "rest_invalid_param") {
      return NextResponse.json(
        { error: error.response.data.message, details: error.response.data.data },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to update customer profile" }, { status: 500 });
  }
}
