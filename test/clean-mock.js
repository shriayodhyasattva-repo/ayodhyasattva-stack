const fs = require('fs');
const file = 'c:/Users/Prem/Desktop/dev/repo/ayodhya-store/lib/woocommerce.ts';
let code = fs.readFileSync(file, 'utf8');

// Remove useMockData export
code = code.replace(/\/\/ Determine if we should use mock data[\s\S]*?export const useMockData.*?;/, '');

// Remove Mock Data section
code = code.replace(/\/\* ─── Mock Data Fallback[\s\S]*?\/\* ─── Products/m, '/* ─── Products');

// Replace getProducts
code = code.replace(/export async function getProducts[\s\S]*?export async function getProductBySlug/, `export async function getProducts(params?: WCProductsParams): Promise<Product[]> {
  const data = await fetchWCCached("/products", {
    status: "publish",
    per_page: params?.per_page || 12,
    page: params?.page || 1,
    category: params?.category,
    featured: params?.featured,
    search: params?.search,
    orderby: params?.orderby || "date",
    order: params?.order || "desc",
    stock_status: params?.stock_status,
    on_sale: params?.on_sale,
    min_price: params?.min_price,
    max_price: params?.max_price,
    include: params?.include?.join(','),
    exclude: params?.exclude?.join(','),
  }, ["products"]);
  
  return data;
}

export async function getProductBySlug`);

// Replace getProductBySlug
code = code.replace(/export async function getProductBySlug[\s\S]*?export async function getRelatedProducts/, `export async function getProductBySlug(slug: string): Promise<Product | null> {
  const data = await fetchWCCached("/products", {
    slug: slug,
    status: "publish",
  }, ["products", \`product-\${slug}\`]);

  if (data && data.length > 0) {
    return data[0];
  }
  return null;
}

export async function getRelatedProducts`);

// Replace getRelatedProducts
code = code.replace(/export async function getRelatedProducts[\s\S]*?\/\* ─── Categories/, `export async function getRelatedProducts(productIds: number[]): Promise<Product[]> {
  if (!productIds || productIds.length === 0) return [];
  
  const data = await fetchWCCached("/products", {
    include: productIds.slice(0, 4).join(','),
    status: "publish",
  }, ["products"]);
  
  return data;
}

/* ─── Categories`);

// Replace getCategories
code = code.replace(/export async function getCategories[\s\S]*?\/\* ─── Orders/, `export async function getCategories(): Promise<WCCategory[]> {
  const data = await fetchWCCached("/products/categories", {
    hide_empty: true,
    per_page: 100,
  }, ["categories"]);
  
  return data;
}

/* ─── Orders`);

// Remove single line if(useMockData) returns/throws
code = code.replace(/if \(useMockData\) throw new Error\(.*?\);\n/g, '');
code = code.replace(/if \(useMockData\) return \[\];?\n/g, '');
code = code.replace(/if \(useMockData\) return \[.*?\n/g, '');
// Specifically for the arrays that broke line: 
// if (useMockData) return [{ id: 0, name: "Rest of the World", order: 0 }];
code = code.replace(/if \(useMockData\) return \[.*?\n/g, '');

code = code.replace(/if \(useMockData\) return \[.*?\];\n/g, '');

// Fix createOrder which has a big if block
code = code.replace(/if \(useMockData\) \{[\s\S]*?\}\s*const response = await api\.post\("\/orders", data\);/m, 'const response = await api.post("/orders", data);');

fs.writeFileSync(file, code);
console.log('Done!');
