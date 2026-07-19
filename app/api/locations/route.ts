import { NextResponse } from "next/server";
import { getStates, getCountries } from "@/lib/woocommerce";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");
    const fetchCountries = searchParams.get("countries") === "true";
    
    let countries = [];
    let states = [];
    
    if (fetchCountries) {
      countries = await getCountries();
    }
    
    if (country) {
      states = await getStates(country);
    }
    
    return NextResponse.json({ states, countries });
  } catch (error: any) {
    console.error("Locations API Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
