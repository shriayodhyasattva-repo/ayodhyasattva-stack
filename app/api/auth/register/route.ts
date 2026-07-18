import { NextResponse } from "next/server";
import { createCustomer, authenticateCustomer } from "@/lib/woocommerce";
import { createSession } from "@/lib/auth";
import { SessionUser } from "@/types/product";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName } = body;

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create WooCommerce customer
    const wcCustomer = await createCustomer({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      username: email.split("@")[0], // Basic username generation
    });

    // Authenticate newly created customer
    const authData = await authenticateCustomer(wcCustomer.username, password);

    // Create our internal session
    const user: SessionUser = {
      id: wcCustomer.id,
      email: wcCustomer.email,
      firstName: wcCustomer.first_name,
      lastName: wcCustomer.last_name,
      displayName: authData.user_display_name,
    };

    await createSession(user);

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Registration Error:", error.response?.data || error.message);
    
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
