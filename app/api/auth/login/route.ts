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
      jwtToken: data.token,
    };

    await createSession(user);

    // Clear stale nonce from the previous anonymous/guest session.
    // We KEEP the cart_token so WooCommerce can merge the guest cart with the user's cart.
    // The next cart request will use the JWT token and old cart-token to establish a fresh
    // WooCommerce session and receive a new valid nonce + cart-token.
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.delete("nonce");

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Login Error:", error.response?.data || error.message);
    
    if (error.response?.data?.code === 'rest_no_route') {
      console.error("Server Configuration Error: The 'JWT Authentication for WP REST API' plugin is missing or misconfigured on the WordPress backend.");
      return NextResponse.json(
        { error: "Authentication service is currently unavailable. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }
}
