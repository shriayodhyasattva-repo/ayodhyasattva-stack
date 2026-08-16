const axios = require('axios');

async function runTest() {
  const timestamp = Date.now();
  const email = `testuser${timestamp}@example.com`;
  const password = "SuperSecretPassword123!";
  
  console.log(`1. Registering new user: ${email}`);
  try {
    const registerRes = await axios.post('http://localhost:3000/api/auth/register', {
      firstName: "Test",
      lastName: "User",
      email: email,
      phone: "1234567890",
      password: password
    });
    
    console.log("Registration Success! User ID:", registerRes.data.user.id);
    
    // Extract the session cookie
    const cookies = registerRes.headers['set-cookie'];
    const sessionCookie = cookies.find(c => c.startsWith('ayodhya_store_session='));
    
    if (!sessionCookie) {
      throw new Error("No session cookie returned from registration!");
    }
    
    console.log("\n2. Fetching Customer Profile using the JWT token pipeline...");
    const profileRes = await axios.get('http://localhost:3000/api/customer', {
      headers: {
        Cookie: sessionCookie
      }
    });
    console.log("Profile Fetch Success! First Name:", profileRes.data.customer.first_name);
    
    console.log("\n3. Fetching Customer Orders using the JWT token pipeline...");
    const ordersRes = await axios.get('http://localhost:3000/api/orders', {
      headers: {
        Cookie: sessionCookie
      }
    });
    console.log("Orders Fetch Success! Orders Count:", ordersRes.data.orders.length);
    
    console.log("\n4. Updating Customer Profile using the JWT token pipeline...");
    const updateRes = await axios.put('http://localhost:3000/api/customer', {
      first_name: "UpdatedFirstName"
    }, {
      headers: {
        Cookie: sessionCookie
      }
    });
    console.log("Profile Update Success! New First Name:", updateRes.data.customer.first_name);
    
    console.log("\n✅ ALL JWT PIPELINES VERIFIED SUCCESSFULLY!");
    
  } catch (error) {
    console.error("Test Failed:");
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

runTest();
