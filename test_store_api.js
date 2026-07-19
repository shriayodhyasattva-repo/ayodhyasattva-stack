const axios = require('axios');

const WOOCOMMERCE_URL = 'http://woocommerce-dev.local';
const storeApi = axios.create({
  baseURL: `${WOOCOMMERCE_URL}/wp-json/wc/store/v1`,
});

async function runTest() {
  try {
    console.log('1. Fetching products to find a variable product...');
    const productsRes = await storeApi.get('/products');
    const products = productsRes.data;
    
    const variableProduct = products.find(p => p.type === 'variable');
    
    
    if (!variableProduct) {
      console.log('No variable product found in the store.');
      return;
    }
    
    console.log(`Found variable product: ${variableProduct.id} - ${variableProduct.name}`);
    
    console.log('\n2. Fetching variations for product ID', variableProduct.id, '...');
    // In Store API, variations are not always listed inside the product unless queried? 
    // Wait, Store API /products returns variations or we can just try adding.
    // Actually let's use the REST API to get variations if needed, or we just try adding with the first variation ID.
    // We know product ID 22 from test_variations.ts is variable. Let's see if it's there.
    
    // 3. Let's try adding to cart with just variation_id
    console.log('\n3. Adding item to cart...');
    let cartToken = null;
    try {
      const addRes = await storeApi.post('/cart/add-item', {
        id: variableProduct.id,
        quantity: 1
      });
      console.log('Added without variation details (might fail if required):', addRes.data);
    } catch (e) {
      console.log('Failed to add without variation (Expected for variable products):', e.response?.data);
    }
    
    // We need to fetch the variation details to add it correctly.
    // Instead of doing full OAuth here, let's just inspect the cart if we add a simple product to see the schema.
    const simpleProduct = products.find(p => p.type === 'simple');
    if (simpleProduct) {
      console.log(`\n4. Adding simple product: ${simpleProduct.id} - ${simpleProduct.name}`);
      const addSimpleRes = await storeApi.post('/cart/add-item', {
        id: simpleProduct.id,
        quantity: 1
      });
      
      console.log('Response Status:', addSimpleRes.status);
      cartToken = addSimpleRes.headers['cart-token'];
      console.log('Cart Token:', cartToken);
      
      console.log('\n5. Cart Item Schema from add-item response:');
      const item = addSimpleRes.data.items[0];
      console.log(JSON.stringify(item, null, 2));
    }
    
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

runTest();
