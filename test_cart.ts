import { storeApi } from "./lib/woocommerce";

async function testCart() {
  try {
    console.log("1. Fetching Cart to get tokens...");
    const res = await storeApi.get("/cart");
    
    const nonce = res.headers["nonce"];
    const token = res.headers["cart-token"];
    console.log("Nonce:", nonce, "Cart-Token:", token);
    
    // Add simple product
    console.log("\n2. Adding simple product (ID 30) to cart...");
    const addRes = await storeApi.post("/cart/add-item", {
      id: 30, // Assuming 30 is a valid simple product in your sample data
      quantity: 1
    }, {
      headers: {
        "Nonce": nonce,
        "Cart-Token": token
      }
    });
    console.log("Add Success! Items in cart:", addRes.data.items.length);
    
    // Check item data for structure (especially images)
    if (addRes.data.items.length > 0) {
      console.log("\nCart Item details (first item):");
      const item = addRes.data.items[0];
      console.log("- ID:", item.id);
      console.log("- Name:", item.name);
      console.log("- Key:", item.key);
      console.log("- Images sample:", item.images[0]); // Check image structure
    }

  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
}

testCart();
