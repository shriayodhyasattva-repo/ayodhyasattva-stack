import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createProductReview } from "@/lib/woocommerce";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { productId, rating, review } = body;

    // Securely pull reviewer info from server session if logged in
    // Fallback to body ONLY for guests (if guest reviews are allowed)
    const reviewer = session ? (session.displayName || `${session.firstName} ${session.lastName}`) : body.reviewer;
    const reviewerEmail = session ? session.email : body.reviewerEmail;

    if (!productId || !rating || !review || !reviewer || !reviewerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const payload = {
      product_id: productId,
      rating,
      review,
      reviewer,
      reviewer_email: reviewerEmail,
    };

    const response = await createProductReview(payload);
    
    // @ts-expect-error - Next.js 16 typings require 2 arguments, but runtime expects 1
    revalidateTag("products");
    return NextResponse.json({ success: true, data: response });
  } catch (error: any) {
    console.error("Create Review Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.message || "Failed to create review" },
      { status: error.response?.status || 500 }
    );
  }
}
