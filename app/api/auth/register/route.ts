import { NextResponse } from "next/server";
import { createCustomer, authenticateCustomer } from "@/lib/woocommerce";
import { createSession } from "@/lib/auth";
import { SessionUser } from "@/types/product";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, phone } = body;

    if (!email || !password || !firstName || !lastName || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create WooCommerce customer
    let wcCustomer;
    try {
      wcCustomer = await createCustomer({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        username: email.split("@")[0], // Basic username generation
        billing: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
        }
      });
    } catch (err: any) {
      console.error("createCustomer failed:", err.response?.data || err.message);
      throw err;
    }

    // Authenticate newly created customer
    let authData;
    try {
      authData = await authenticateCustomer(wcCustomer.username, password);
    } catch (err: any) {
      console.error("authenticateCustomer failed:", err.response?.data || err.message);
      if (err.response?.data?.code === 'rest_no_route') {
        console.error("Server Configuration Error: The 'JWT Authentication for WP REST API' plugin is missing or misconfigured on the WordPress backend.");
        return NextResponse.json(
          { error: "Authentication service is currently unavailable. Please try again later." },
          { status: 500 }
        );
      }
      throw err;
    }

    // Create our internal session
    const user: SessionUser = {
      id: wcCustomer.id,
      email: wcCustomer.email,
      firstName: wcCustomer.first_name,
      lastName: wcCustomer.last_name,
      displayName: authData.user_display_name,
      jwtToken: authData.token,
    };

    await createSession(user);

    // Clear stale nonce from the guest session so the cart can refresh and merge
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    cookieStore.delete("nonce");

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Registration Error Final Block:", error.response?.data || error.message);
    
    // Check if user already exists
    if (error.response?.data?.code === "registration-error-email-exists") {
       return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
