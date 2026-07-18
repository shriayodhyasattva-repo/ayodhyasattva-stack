import { NextResponse } from "next/server";
import { getProductReviews, createProductReview, getProductBySlug } from "@/lib/woocommerce";
import { getSession } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    const reviews = await getProductReviews(product.id);
    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error("Reviews API Error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    // Only authenticated users can review
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in to leave a review." }, { status: 401 });
    }

    const { slug } = await params;
    const product = await getProductBySlug(slug);
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await request.json();
    const { rating, review } = body;

    if (!rating || !review) {
      return NextResponse.json({ error: "Rating and review content are required" }, { status: 400 });
    }

    const newReview = await createProductReview({
      product_id: product.id,
      rating,
      review,
      reviewer: session.displayName || session.firstName,
      reviewer_email: session.email,
    });

    return NextResponse.json({ review: newReview });
  } catch (error: any) {
    console.error("Reviews API Error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
