const axios = require('axios');

async function test() {
  const timestamp = Date.now();
  const email = `testwoo${timestamp}@example.com`;
  const password = "SuperSecretPassword123!";
  
  try {
    console.log(`1. Registering user ${email} via Next.js to get JWT...`);
    const registerRes = await axios.post('http://localhost:3000/api/auth/register', {
      firstName: "Test", lastName: "Woo", email: email, phone: "1234567890", password: password
    });
    
    const user = registerRes.data.user;
    console.log("Registration Success! User ID:", user.id);
    
    const token = user.jwtToken;
    if (!token) {
      throw new Error("No JWT token returned from registration API!");
    }
    console.log("JWT Token obtained from Next.js API.");
    
    console.log("2. Fetching customer profile directly from local WooCommerce using JWT...");
    // Using the local environment URL to match the signature
    const customerRes = await axios.get(`http://woocommerce-dev.local/wp-json/wc/v3/customers/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("Success! Customer Data fetched via JWT:", customerRes.data.email);
    console.log("Verified: WooCommerce accepts the JWT token for v3 endpoints!");
    
  } catch (err) {
    if (err.response) {
      console.error("Error:", err.response.status, err.response.data);
    } else {
      console.error("Error:", err.message);
    }
  }
}
test();
