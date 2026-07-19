import axios from "axios";
import OAuth from "oauth-1.0a";
import crypto from "crypto";

const WOOCOMMERCE_URL = "http://woocommerce-dev.local";
const WOOCOMMERCE_KEY = "ck_c9299c6d3e17521dd08ac1d5731c1cda42b0b835";
const WOOCOMMERCE_SECRET = "cs_ec8d91833d58a71edeb187673f3da1e37ad42db6";

const oauth = new OAuth({
  consumer: { key: WOOCOMMERCE_KEY, secret: WOOCOMMERCE_SECRET },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});

async function main() {
  // Try to fetch variations for product ID 22 (socks)
  const url = `${WOOCOMMERCE_URL}/wp-json/wc/v3/products/22/variations`;
  const requestData = { url, method: "GET" };
  const authHeader = oauth.toHeader(oauth.authorize(requestData));

  try {
    console.log("Fetching variations...");
    const start = Date.now();
    const res = await axios.get(url, { headers: authHeader });
    console.log(`Success in ${Date.now() - start}ms. Received ${res.data.length} variations.`);
    console.log(JSON.stringify(res.data[0], null, 2));
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}
main();
