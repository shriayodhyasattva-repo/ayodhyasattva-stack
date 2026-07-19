import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createProductReview } from "@/lib/woocommerce";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, rating, review, reviewer, reviewerEmail } = body;

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
