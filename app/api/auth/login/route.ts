import { NextResponse } from "next/server";
import { authenticateCustomer, getCustomerByEmail } from "@/lib/woocommerce";
import { createSession } from "@/lib/auth";
import { SessionUser } from "@/types/product";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    // Authenticate with WordPress JWT
    const data = await authenticateCustomer(username, password);

    // Get WooCommerce customer data
    const customers = await getCustomerByEmail(data.user_email);
    if (!customers || customers.length === 0) {
      return NextResponse.json({ error: "Customer not found in WooCommerce" }, { status: 404 });
    }

    const wcCustomer = customers[0];

    // Create our internal session
    const user: SessionUser = {
      id: wcCustomer.id,
      email: wcCustomer.email,
      firstName: wcCustomer.first_name,
      lastName: wcCustomer.last_name,
      displayName: data.user_display_name,
    };

    await createSession(user);

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Login Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }
}
