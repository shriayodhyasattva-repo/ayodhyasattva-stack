import { NextResponse } from "next/server";
import { storeApi, getProducts } from "@/lib/woocommerce";
import { getStoreApiHeaders } from "@/app/api/cart/route";

export async function GET() {
  try {
    const headers = await getStoreApiHeaders();
    
    // 1. Get current cart from Store API
    const cartRes = await storeApi.get("/cart", { headers });
    const cartItems = cartRes.data.items || [];
    
    if (cartItems.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // 2. Extract product IDs from the cart
    const productIdsInCart = cartItems.map((item: any) => item.id);
    
    // 3. Fetch full product details from REST API to get cross_sell_ids
    // The Store API doesn't expose cross_sells by default.
    const { data: productsInCart } = await getProducts({ include: productIdsInCart });
    
    // 4. Aggregate all unique cross_sell_ids
    const crossSellIds = new Set<number>();
    productsInCart.forEach(p => {
      if (p.cross_sell_ids) {
        p.cross_sell_ids.forEach(id => {
          // Only add if it's not already in the cart
          if (!productIdsInCart.includes(id)) {
            crossSellIds.add(id);
          }
        });
      }
    });

    // 5. Fetch the actual cross-sell products if we have any
    if (crossSellIds.size === 0) {
      return NextResponse.json({ products: [] });
    }

    const { data: crossSells } = await getProducts({ include: Array.from(crossSellIds) });

    return NextResponse.json({ products: crossSells });
  } catch (error: any) {
    console.error("Cross Sells API Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: "Failed to fetch cross sells" },
      { status: 500 }
    );
  }
}
