const axios = require('axios');
const url = "http://localhost:8080/wp-json/wc/store/v1/cart/update-customer";

async function test() {
  try {
    const res = await axios.post(url, {
      shipping_address: { country: "IN", state: "MH", postcode: "invalid" }
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response?.data);
  }
}
test();
