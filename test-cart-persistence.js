const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');

// Helper for WC REST API (admin keys)
const oauth = new OAuth({
  consumer: { key: "ck_c9299c6d3e17521dd08ac1d5731c1cda42b0b835", secret: "cs_ec8d91833d58a71edeb187673f3da1e37ad42db6" },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});

async function testNewUserCart() {
  try {
    const email = `testuser${Date.now()}@example.com`;
    const password = "SuperSecretPassword123!";
    
    console.log(`1. Creating user ${email}...`);
    const reqData = { url: "http://localhost:8080/wp-json/wc/v3/customers", method: 'POST' };
    const authHeader = oauth.toHeader(oauth.authorize(reqData));
    await axios.post(reqData.url, { email, password, username: email }, { headers: authHeader });
    
    console.log("2. Logging in to get JWT...");
    const jwtRes = await axios.post("http://localhost:8080/wp-json/jwt-auth/v1/token", {
      username: email, password
    });
    const token = jwtRes.data.token;
    
    console.log("3. Device A: Adding item to cart with JWT...");
    const addRes = await axios.post("http://localhost:8080/wp-json/wc/store/v1/cart/add-item", 
      { id: 15, quantity: 1 }, 
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    console.log(`Item added! Cart now has ${addRes.data.items.length} item(s).`);
    
    console.log("\n4. SIMULATING DEVICE B (New Incognito Window)...");
    // Only passing JWT, NO cart-token cookie!
    const deviceBRes = await axios.get("http://localhost:8080/wp-json/wc/store/v1/cart", {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`Device B Cart contains ${deviceBRes.data.items.length} item(s).`);
    deviceBRes.data.items.forEach(item => {
      console.log(`- ${item.name} (Qty: ${item.quantity})`);
    });
    
    if (deviceBRes.data.items.length > 0) {
      console.log("\nSUCCESS! Cross-device Cart Persistence is working flawlessly!");
    }
  } catch (error) {
    console.error("Test failed:", error.response?.data || error.message);
  }
}

testNewUserCart();
