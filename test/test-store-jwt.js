const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');

const WOO = "http://woocommerce-dev.local";
const KEY = "ck_c9299c6d3e17521dd08ac1d5731c1cda42b0b835";
const SECRET = "cs_ec8d91833d58a71edeb187673f3da1e37ad42db6";

const oauth = new OAuth({
  consumer: { key: KEY, secret: SECRET },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});

async function test() {
  const timestamp = Date.now();
  const email = `teststore${timestamp}@example.com`;
  const password = "SuperSecretPassword123!";

  try {
    console.log("1. Creating User via Master API...");
    const requestData = { url: `${WOO}/wp-json/wc/v3/customers`, method: 'POST' };
    const authHeader = oauth.toHeader(oauth.authorize(requestData));
    const createRes = await axios.post(`${WOO}/wp-json/wc/v3/customers`, {
      email, password, first_name: "Test", last_name: "JWT"
    }, { headers: { ...authHeader, 'Content-Type': 'application/json' }});
    
    console.log("Created user ID:", createRes.data.id);

    console.log("2. Guest adds item to Cart...");
    const prodRes = await axios.get(`${WOO}/wp-json/wc/store/v1/products`);
    const prodId = prodRes.data[0].id;

    // Get Guest Nonce
    const guestCartRes = await axios.get(`${WOO}/wp-json/wc/store/v1/cart`);
    const guestCartToken = guestCartRes.headers['cart-token'];
    let guestNonce = guestCartRes.headers['nonce'];

    // Add Item as Guest
    const cartAddRes = await axios.post(`${WOO}/wp-json/wc/store/v1/cart/add-item`, {
      id: prodId,
      quantity: 1
    }, { headers: { 'Cart-Token': guestCartToken, 'Nonce': guestNonce } });

    console.log("3. User Logs in via JWT...");
    const regRes = await axios.post(`${WOO}/wp-json/jwt-auth/v1/token`, {
      username: email,
      password: password
    });
    const token = regRes.data.token;

    console.log("4. Simulating Next.js API getting new nonce for old cart...");
    // Pass JWT + Guest Cart-Token (simulate what Next.js does when it deletes nonce but keeps cart token)
    const userCartRes = await axios.get(`${WOO}/wp-json/wc/store/v1/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cart-Token': cartAddRes.headers['cart-token'] || guestCartToken
      }
    });

    const userCartToken = userCartRes.headers['cart-token'];
    const userNonce = userCartRes.headers['nonce'];

    console.log("5. Checkout via Store API...");
    const checkoutRes = await axios.post(`${WOO}/wp-json/wc/store/v1/checkout`, {
      billing_address: {
        first_name: "Test",
        last_name: "StoreAPI",
        address_1: "123 Street",
        city: "City",
        state: "UP",
        postcode: "224190",
        country: "IN",
        email: email,
        phone: "1234567890"
      },
      payment_method: "cod"
    }, { 
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cart-Token': userCartToken,
        'Nonce': userNonce
      } 
    });

    console.log("Customer ID on Order:", checkoutRes.data.customer_id || checkoutRes.data.order_id);
    if (checkoutRes.data.customer_id === 0 || !checkoutRes.data.customer_id) {
       console.log(checkoutRes.data);
    }
  } catch (e) {
    console.error("Error:", e.response?.data || e.message);
  }
}
test();
