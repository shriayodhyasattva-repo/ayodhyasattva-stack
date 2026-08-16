const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');

const url = "http://localhost:8080/wp-json/wc/v3/orders/31";

const oauth = new OAuth({
  consumer: { key: "ck_c9299c6d3e17521dd08ac1d5731c1cda42b0b835", secret: "cs_ec8d91833d58a71edeb187673f3da1e37ad42db6" },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});

const requestData = { url, method: 'GET' };
const authHeader = oauth.toHeader(oauth.authorize(requestData));

axios.get(url, { headers: authHeader })
  .then(res => {
    console.log("Payment Method:", res.data.payment_method);
    console.log("Payment Method Title:", res.data.payment_method_title);
    console.log("Meta Data:", JSON.stringify(res.data.meta_data, null, 2));
  })
  .catch(err => console.error(err.message));
