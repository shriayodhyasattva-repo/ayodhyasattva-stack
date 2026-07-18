import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-wc-webhook-signature");
    
    // In a real production app, verify the signature using crypto and your webhook secret:
    // const expectedSignature = crypto.createHmac('sha256', process.env.WC_WEBHOOK_SECRET).update(rawBody).digest('base64');
    // if (signature !== expectedSignature) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

    // For now, we will trust the request or check a custom token in the URL if preferred:
    const token = req.nextUrl.searchParams.get("token");
    if (token !== process.env.REVALIDATE_TOKEN && process.env.REVALIDATE_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // Depending on the webhook topic, clear the relevant cache tag
    const topic = req.headers.get("x-wc-webhook-topic");

    if (topic?.startsWith("product.")) {
      revalidateTag("products");
      // If we had the specific product slug in the payload, we could clear it exactly:
      // revalidateTag(`product-${payload.slug}`);
      return NextResponse.json({ revalidated: true, tag: "products" });
    }

    if (topic?.startsWith("order.")) {
      // Revalidate user order history if needed
      return NextResponse.json({ message: "Order webhook received" });
    }

    // Default catch-all
    revalidateTag("products");
    return NextResponse.json({ revalidated: true, message: "Cache cleared" });

  } catch (error: any) {
    console.error("Webhook Error:", error.message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
