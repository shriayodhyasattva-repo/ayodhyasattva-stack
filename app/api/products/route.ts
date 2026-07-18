import { NextResponse } from "next/server";
import { getProducts } from "@/lib/woocommerce";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Convert search params to an object
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      // Map basic string boolean to actual boolean where needed
      if (value === "true") params[key] = true;
      else if (value === "false") params[key] = false;
      else params[key] = value;
    });

    const products = await getProducts(params);
    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Products API Error:", error);
    return NextResponse.json({ error: "Failed to fetch products", details: error.message }, { status: 500 });
  }
}
