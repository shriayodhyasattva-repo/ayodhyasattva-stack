import axios from "axios";
import {
  Product,
  WCProductsParams,
  WCCategory,
  WCOrder,
  CreateOrderPayload,
  WCShippingZone,
  WCShippingMethod,
  WCCoupon,
  WCReview,
  CreateReviewPayload,
  WCCustomer,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  WCPaymentGateway
} from "@/types/product";

const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL || "";
const WOOCOMMERCE_KEY = process.env.WOOCOMMERCE_KEY || "";
const WOOCOMMERCE_SECRET = process.env.WOOCOMMERCE_SECRET || "";

// Determine if we should use mock data (if credentials are missing)
export const useMockData = !WOOCOMMERCE_URL || !WOOCOMMERCE_KEY || !WOOCOMMERCE_SECRET;

// Configure Axios Client for WooCommerce REST API
const api = axios.create({
  baseURL: `${WOOCOMMERCE_URL}/wp-json/wc/v3`,
  params: {
    consumer_key: WOOCOMMERCE_KEY,
    consumer_secret: WOOCOMMERCE_SECRET,
  },
});

// WordPress JWT authentication API (requires JWT Authentication for WP REST API plugin)
const wpAuthApi = axios.create({
  baseURL: `${WOOCOMMERCE_URL}/wp-json/jwt-auth/v1`,
});

// Native Fetch wrapper for WooCommerce (Enables Next.js Data Cache & ISR)
async function fetchWCCached(endpoint: string, queryParams: Record<string, any> = {}, tags: string[] = []) {
  const url = new URL(`${WOOCOMMERCE_URL}/wp-json/wc/v3${endpoint}`);
  url.searchParams.append("consumer_key", WOOCOMMERCE_KEY);
  url.searchParams.append("consumer_secret", WOOCOMMERCE_SECRET);
  
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const res = await fetch(url.toString(), {
    next: { tags },
  });

  if (!res.ok) {
    throw new Error(`WooCommerce API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}


/* ─── Mock Data Fallback (from original code) ───────────────────────────── */

const MOCK_PRODUCTS: Product[] = [
  {
    id: 101,
    name: "Maharaja Brass Ram Darbar Idol",
    slug: "maharaja-brass-ram-darbar-idol",
    permalink: "/product/maharaja-brass-ram-darbar-idol",
    type: "simple",
    status: "publish",
    featured: true,
    description: "<p>Elevate your spiritual space with this magnificent, museum-quality brass idol representing the divine assembly of Lord Rama, Goddess Sita, Lakshmana, and Lord Hanuman. Handcrafted by master artisans in Uttar Pradesh, this idol features exquisite detailing, ornate crown carvings, and a beautiful golden lustre that deepens gracefully with time. The perfect spiritual centerpiece for your home temple.</p><ul><li>Material: Premium Grade Brass</li><li>Weight: 4.8 kg</li><li>Height: 12 inches</li><li>Handcrafted under fair trade practices</li></ul>",
    short_description: "Exquisite 12-inch handcrafted brass idol of Lord Rama, Sita, Lakshmana, and Hanuman. A masterpiece of spiritual craftsmanship.",
    sku: "AY-RD-BRASS-12",
    price: "8500",
    regular_price: "9999",
    sale_price: "8500",
    on_sale: true,
    purchasable: true,
    stock_status: "instock",
    stock_quantity: 15,
    images: [
      {
        id: 1,
        src: "https://images.unsplash.com/photo-1609137144814-7d5267b137d5?auto=format&fit=crop&q=80&w=800",
        name: "Brass Ram Darbar front",
        alt: "Maharaja Brass Ram Darbar Idol front view"
      },
      {
        id: 2,
        src: "https://images.unsplash.com/photo-1544924405-b106f4b0db06?auto=format&fit=crop&q=80&w=800",
        name: "Brass Ram Darbar detail",
        alt: "Detail carving of Brass Ram Darbar"
      }
    ],
    categories: [
      { id: 1, name: "Temple Idols", slug: "temple-idols" }
    ],
    attributes: [],
    average_rating: "4.9",
    rating_count: 24
  },
  {
    id: 102,
    name: "Gilded Peacock Brass Diya",
    slug: "gilded-peacock-brass-diya",
    permalink: "/product/gilded-peacock-brass-diya",
    type: "simple",
    status: "publish",
    featured: true,
    description: "<p>Illuminate your home with divine radiance. This beautiful single-step peacock diya is cast from pure brass and finished with a subtle antiqued gilding. It features a detailed peacock backplate, representing beauty and protection, and a deep oil well that burns continuously for hours. Perfect for daily pooja, festivals, and festive decor.</p>",
    short_description: "Premium antiqued brass oil lamp featuring an intricately detailed peacock design. Ideal for home temple lighting.",
    sku: "AY-DIYA-PK-01",
    price: "1850",
    regular_price: "1850",
    sale_price: "",
    on_sale: false,
    purchasable: true,
    stock_status: "instock",
    stock_quantity: 45,
    images: [
      {
        id: 3,
        src: "https://images.unsplash.com/photo-1505935428862-770b6f24f629?auto=format&fit=crop&q=80&w=800",
        name: "Peacock Diya detail",
        alt: "Gilded Peacock Brass Diya light"
      }
    ],
    categories: [
      { id: 2, name: "Pooja Essentials", slug: "pooja-essentials" }
    ],
    attributes: [],
    average_rating: "4.8",
    rating_count: 12
  },
  {
    id: 103,
    name: "Natural Mysore Sandalwood Dhoop",
    slug: "natural-mysore-sandalwood-dhoop",
    permalink: "/product/natural-mysore-sandalwood-dhoop",
    type: "simple",
    status: "publish",
    featured: true,
    description: "<p>Experience temple-grade aromatherapy. Our natural sandalwood dhoop sticks are crafted using pure Mysore sandalwood paste, organic resins, and essential oils. Completely charcoal-free and non-toxic, they release a soothing, warm woody fragrance that purifies the air, eases stress, and creates a serene environment for meditation and prayer. Each box contains 30 sticks and a brass holder.</p>",
    short_description: "Charcoal-free, natural temple-grade dhoop sticks made with pure Mysore Sandalwood. Purifying and soothing.",
    sku: "AY-DH-SANDAL-30",
    price: "450",
    regular_price: "550",
    sale_price: "450",
    on_sale: true,
    purchasable: true,
    stock_status: "instock",
    stock_quantity: 120,
    images: [
      {
        id: 4,
        src: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800",
        name: "Sandalwood Dhoop package",
        alt: "Natural Mysore Sandalwood Dhoop Sticks"
      }
    ],
    categories: [
      { id: 3, name: "Premium Incense", slug: "premium-incense" }
    ],
    attributes: [],
    average_rating: "4.7",
    rating_count: 38
  },
  {
    id: 104,
    name: "Shrimad Bhagavad Gita - Deluxe Edition",
    slug: "shrimad-bhagavad-gita-deluxe",
    permalink: "/product/shrimad-bhagavad-gita-deluxe",
    type: "simple",
    status: "publish",
    featured: false,
    description: "<p>A timeless treasure for your library. This deluxe edition of the Shrimad Bhagavad Gita features the original Sanskrit verses alongside clear English translations, transliterations, and elaborate commentaries. Bound in premium gold-embossed silk hardcover with gilded page edges and a ribbon bookmark, this edition includes 24 beautiful full-color illustrations of historical paintings.</p>",
    short_description: "Luxurious silk-bound edition of the Bhagavad Gita with gold foil printing, illustrations, Sanskrit shlokas, and English translation.",
    sku: "AY-BK-GITA-DLX",
    price: "2499",
    regular_price: "2999",
    sale_price: "2499",
    on_sale: true,
    purchasable: true,
    stock_status: "instock",
    stock_quantity: 20,
    images: [
      {
        id: 5,
        src: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
        name: "Bhagavad Gita Deluxe Cover",
        alt: "Shrimad Bhagavad Gita Deluxe Silk Bound Edition"
      }
    ],
    categories: [
      { id: 4, name: "Spiritual Books", slug: "spiritual-books" }
    ],
    attributes: [],
    average_rating: "5.0",
    rating_count: 57
  },
  {
    id: 105,
    name: "Handcarved Teakwood Ram Mandir Model",
    slug: "handcarved-teakwood-ram-mandir-model",
    permalink: "/product/handcarved-teakwood-ram-mandir-model",
    type: "simple",
    status: "publish",
    featured: true,
    description: "<p>Bring the grandeur of Ayodhya's Ram Mandir into your home. This exquisite replica is handcrafted out of premium seasoned teakwood by hereditary woodcarvers. Every dome, pillar, and intricate shikhara has been modeled carefully to match the architecture of the grand temple. Sealed with a protective matte finish that highlights the natural beauty of the wood grain.</p>",
    short_description: "Fine detailed 3D miniature model of the Ayodhya Ram Mandir, handcarved from premium seasoned teakwood.",
    sku: "AY-MD-TEAK-RM",
    price: "12500",
    regular_price: "15000",
    sale_price: "12500",
    on_sale: true,
    purchasable: true,
    stock_status: "instock",
    stock_quantity: 8,
    images: [
      {
        id: 6,
        src: "https://images.unsplash.com/photo-1609137144933-28682e825a07?auto=format&fit=crop&q=80&w=800",
        name: "Ram Mandir Wooden Model",
        alt: "Handcarved Teakwood Ram Mandir Replica"
      }
    ],
    categories: [
      { id: 1, name: "Temple Idols", slug: "temple-idols" }
    ],
    attributes: [],
    average_rating: "4.9",
    rating_count: 19
  },
  {
    id: 106,
    name: "Sacred Copper Panchpatra Thali Set",
    slug: "sacred-copper-panchpatra-thali-set",
    permalink: "/product/sacred-copper-panchpatra-thali-set",
    type: "simple",
    status: "publish",
    featured: false,
    description: "<p>Perform your daily rituals with pure copper utensils as prescribed by ancient shastras. This elegant 5-piece Pooja set is handmade from 99.8% pure copper. The set includes a pooja plate, a panchpatra (sacred water cup), an achmani (spoon), a small bell, and a matching incense holder. Copper is naturally antimicrobial and is believed to accumulate spiritual energy.</p>",
    short_description: "Artisanal 5-piece pure copper pooja set including thali, water vessel, achmani, bell, and dhoop stand.",
    sku: "AY-PJ-COPPER-05",
    price: "1550",
    regular_price: "1800",
    sale_price: "1550",
    on_sale: true,
    purchasable: true,
    stock_status: "instock",
    stock_quantity: 30,
    images: [
      {
        id: 7,
        src: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
        name: "Copper Panchpatra set",
        alt: "Sacred Copper Pooja Set"
      }
    ],
    categories: [
      { id: 2, name: "Pooja Essentials", slug: "pooja-essentials" }
    ],
    attributes: [],
    average_rating: "4.6",
    rating_count: 9
  }
];

const MOCK_CATEGORIES: WCCategory[] = [
  { id: 1, name: "Temple Idols", slug: "temple-idols", count: 2, parent: 0, description: "", display: "default", image: null, menu_order: 0 },
  { id: 2, name: "Pooja Essentials", slug: "pooja-essentials", count: 2, parent: 0, description: "", display: "default", image: null, menu_order: 0 },
  { id: 3, name: "Premium Incense", slug: "premium-incense", count: 1, parent: 0, description: "", display: "default", image: null, menu_order: 0 },
  { id: 4, name: "Spiritual Books", slug: "spiritual-books", count: 1, parent: 0, description: "", display: "default", image: null, menu_order: 0 }
];

/* ─── Products ──────────────────────────────────────────────────────────── */

export async function getProducts(params?: WCProductsParams): Promise<Product[]> {
  try {
    if (useMockData) {
      let filtered = [...MOCK_PRODUCTS];
      if (params?.featured) {
        filtered = filtered.filter(p => p.featured);
      }
      if (params?.category) {
        filtered = filtered.filter(p => 
          p.categories.some(c => c.slug === params.category || c.name.toLowerCase() === params.category?.toLowerCase())
        );
      }
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.short_description.toLowerCase().includes(query));
      }
      return filtered;
    }

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
  } catch (error) {
    console.error("WooCommerce API Error (getProducts) - Falling back to local data:", error);
    let filtered = [...MOCK_PRODUCTS];
    if (params?.featured) {
      filtered = filtered.filter(p => p.featured);
    }
    if (params?.category) {
      filtered = filtered.filter(p => 
        p.categories.some(c => c.slug === params.category || c.name.toLowerCase() === params.category?.toLowerCase())
      );
    }
    return filtered;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    if (useMockData) {
      const match = MOCK_PRODUCTS.find(p => p.slug === slug);
      return match || null;
    }

    const data = await fetchWCCached("/products", {
      slug: slug,
      status: "publish",
    }, ["products", `product-${slug}`]);

    if (data && data.length > 0) {
      return data[0];
    }
    return null;
  } catch (error) {
    console.error("WooCommerce API Error (getProductBySlug) - Falling back to local data:", error);
    const match = MOCK_PRODUCTS.find(p => p.slug === slug);
    return match || null;
  }
}

export async function getRelatedProducts(productIds: number[]): Promise<Product[]> {
  try {
    if (useMockData) {
      return MOCK_PRODUCTS.slice(0, 4);
    }
    if (!productIds || productIds.length === 0) return [];
    
    const data = await fetchWCCached("/products", {
      include: productIds.slice(0, 4).join(','),
      status: "publish",
    }, ["products"]);
    
    return data;
  } catch (error) {
    console.error("WooCommerce API Error (getRelatedProducts)", error);
    return MOCK_PRODUCTS.slice(0, 4);
  }
}

/* ─── Categories ────────────────────────────────────────────────────────── */

export async function getCategories(): Promise<WCCategory[]> {
  try {
    if (useMockData) {
      return MOCK_CATEGORIES;
    }
    const data = await fetchWCCached("/products/categories", {
      hide_empty: true,
      per_page: 100,
    }, ["categories"]);
    
    return data;
  } catch (error) {
    console.error("WooCommerce API Error (getCategories)", error);
    return MOCK_CATEGORIES;
  }
}

/* ─── Orders ────────────────────────────────────────────────────────────── */

export async function createOrder(data: CreateOrderPayload): Promise<WCOrder> {
  if (useMockData) {
    // Return a mock order object for testing without a backend
    return {
      id: Math.floor(Math.random() * 10000),
      number: `AYO-${Math.floor(Math.random() * 900000)}`,
      status: data.status || "pending",
      currency: "INR",
      total: data.shipping_lines?.[0]?.total || "0", // simplistic mock
      discount_total: "0",
      shipping_total: data.shipping_lines?.[0]?.total || "0",
      billing: data.billing,
      shipping: data.shipping,
      line_items: data.line_items.map(item => ({
        id: Math.floor(Math.random() * 10000),
        product_id: item.product_id,
        name: "Mock Product Name",
        quantity: item.quantity,
        price: "100",
        total: "100",
      })),
      payment_method: data.payment_method,
      payment_method_title: data.payment_method_title,
      date_created: new Date().toISOString(),
      date_created_gmt: new Date().toISOString(),
      meta_data: (data.meta_data || []).map((meta, index) => ({ id: index + 1, ...meta })),
      customer_id: data.customer_id || 0,
      customer_note: data.customer_note
    };
  }
  const response = await api.post("/orders", data);
  return response.data;
}

export async function getOrder(orderId: number): Promise<WCOrder> {
  if (useMockData) throw new Error("Orders not supported in mock mode");
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
}

export async function updateOrder(orderId: number, data: Partial<WCOrder>): Promise<WCOrder> {
  if (useMockData) throw new Error("Orders not supported in mock mode");
  const response = await api.put(`/orders/${orderId}`, data);
  return response.data;
}

export async function getCustomerOrders(customerId: number): Promise<WCOrder[]> {
  if (useMockData) return [];
  const response = await api.get("/orders", {
    params: {
      customer: customerId,
      per_page: 20,
    }
  });
  return response.data;
}

/* ─── Coupons ───────────────────────────────────────────────────────────── */

export async function getCoupon(code: string): Promise<WCCoupon[]> {
  if (useMockData) return [];
  const response = await api.get("/coupons", {
    params: { code: code }
  });
  return response.data;
}

/* ─── Customers & Auth ──────────────────────────────────────────────────── */

export async function authenticateCustomer(username: string, password: string): Promise<{ token: string, user_email: string, user_nicename: string, user_display_name: string }> {
  if (useMockData) throw new Error("Auth not supported in mock mode");
  
  const response = await wpAuthApi.post("/token", {
    username,
    password
  });
  return response.data;
}

export async function createCustomer(data: CreateCustomerPayload): Promise<WCCustomer> {
  if (useMockData) throw new Error("Auth not supported in mock mode");
  const response = await api.post("/customers", data);
  return response.data;
}

export async function getCustomer(customerId: number): Promise<WCCustomer> {
  if (useMockData) throw new Error("Auth not supported in mock mode");
  const response = await api.get(`/customers/${customerId}`);
  return response.data;
}

export async function getCustomerByEmail(email: string): Promise<WCCustomer[]> {
  if (useMockData) return [];
  const response = await api.get("/customers", {
    params: { email }
  });
  return response.data;
}

export async function updateCustomer(customerId: number, data: UpdateCustomerPayload): Promise<WCCustomer> {
  if (useMockData) throw new Error("Auth not supported in mock mode");
  const response = await api.put(`/customers/${customerId}`, data);
  return response.data;
}

/* ─── Reviews ───────────────────────────────────────────────────────────── */

export async function getProductReviews(productId: number): Promise<WCReview[]> {
  if (useMockData) return [];
  const response = await api.get("/products/reviews", {
    params: { product: productId, status: "approved" }
  });
  return response.data;
}

export async function createProductReview(data: CreateReviewPayload): Promise<WCReview> {
  if (useMockData) throw new Error("Reviews not supported in mock mode");
  const response = await api.post("/products/reviews", data);
  return response.data;
}

/* ─── Shipping & Payment ────────────────────────────────────────────────── */

export async function getShippingZones(): Promise<WCShippingZone[]> {
  if (useMockData) return [{ id: 0, name: "Rest of the World", order: 0 }];
  const response = await api.get("/shipping/zones");
  return response.data;
}

export async function getShippingMethods(zoneId: number): Promise<WCShippingMethod[]> {
  if (useMockData) return [{ instance_id: 1, title: "Free shipping", order: 1, enabled: true, method_id: "free_shipping", method_title: "Free shipping", method_description: "", settings: {} }];
  const response = await api.get(`/shipping/zones/${zoneId}/methods`);
  return response.data;
}

export async function getPaymentGateways(): Promise<WCPaymentGateway[]> {
  if (useMockData) return [{ id: "razorpay", title: "Razorpay", description: "Pay via Razorpay", enabled: true, method_title: "Razorpay", method_description: "" }];
  const response = await api.get("/payment_gateways");
  return response.data;
}
