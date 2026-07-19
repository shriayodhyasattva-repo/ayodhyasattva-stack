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

import OAuth from "oauth-1.0a";
import crypto from "crypto";

const oauth = new OAuth({
  consumer: { key: WOOCOMMERCE_KEY, secret: WOOCOMMERCE_SECRET },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});

// Configure Axios Client for WooCommerce REST API
const api = axios.create({
  baseURL: `${WOOCOMMERCE_URL}/wp-json/wc/v3`,
});

api.interceptors.request.use((config) => {
  const urlObj = new URL(config.baseURL! + (config.url || ""));
  if (config.params) {
    Object.entries(config.params).forEach(([k, v]) => {
      urlObj.searchParams.append(k, String(v));
    });
  }
  
  const requestData = {
    url: urlObj.toString(),
    method: (config.method || "GET").toUpperCase(),
  };

  const authHeader = oauth.toHeader(oauth.authorize(requestData));
  config.headers.Authorization = authHeader.Authorization;
  return config;
});

// WordPress JWT authentication API (requires JWT Authentication for WP REST API plugin)
const wpAuthApi = axios.create({
  baseURL: `${WOOCOMMERCE_URL}/wp-json/jwt-auth/v1`,
});

// Native Fetch wrapper for WooCommerce (Enables Next.js Data Cache & ISR)
async function fetchWCCached(endpoint: string, queryParams: Record<string, any> = {}, tags: string[] = []) {
  const url = new URL(`${WOOCOMMERCE_URL}/wp-json/wc/v3${endpoint}`);
  
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const requestData = {
    url: url.toString(),
    method: "GET",
  };
  
  const authHeader = oauth.toHeader(oauth.authorize(requestData));

  const res = await fetch(url.toString(), {
    headers: {
      ...authHeader,
      'Content-Type': 'application/json'
    },
    next: { tags },
  });

  if (!res.ok) {
    throw new Error(`WooCommerce API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}


/* ─── Products ──────────────────────────────────────────────────────────── */

export async function getProducts(params?: WCProductsParams): Promise<Product[]> {
  let categoryId = params?.category;
  
  if (typeof categoryId === 'string' && isNaN(Number(categoryId))) {
    const categories = await getCategories();
    const cat = categories.find(c => c.slug === categoryId);
    if (cat) {
      categoryId = String(cat.id);
    }
  }

  const data = await fetchWCCached("/products", {
    status: "publish",
    per_page: params?.per_page || 12,
    page: params?.page || 1,
    category: categoryId,
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

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const data = await fetchWCCached("/products", {
    slug: slug,
    status: "publish",
  }, ["products", `product-${slug}`]);

  if (data && data.length > 0) {
    return data[0];
  }
  return null;
}

export async function getRelatedProducts(productIds: number[]): Promise<Product[]> {
  if (!productIds || productIds.length === 0) return [];
  
  const data = await fetchWCCached("/products", {
    include: productIds.slice(0, 4).join(','),
    status: "publish",
  }, ["products"]);
  
  return data;
}

/* ─── Categories ────────────────────────────────────────────────────────── */

export async function getCategories(): Promise<WCCategory[]> {
  const data = await fetchWCCached("/products/categories", {
    hide_empty: true,
    per_page: 100,
  }, ["categories"]);
  
  return data;
}

/* ─── Orders ────────────────────────────────────────────────────────────── */

export async function createOrder(data: CreateOrderPayload): Promise<WCOrder> {
  const response = await api.post("/orders", data);
  return response.data;
}

export async function getOrder(orderId: number): Promise<WCOrder> {
    const response = await api.get(`/orders/${orderId}`);
  return response.data;
}

export async function updateOrder(orderId: number, data: Partial<WCOrder>): Promise<WCOrder> {
    const response = await api.put(`/orders/${orderId}`, data);
  return response.data;
}

export async function getCustomerOrders(customerId: number): Promise<WCOrder[]> {
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
    const response = await api.get("/coupons", {
    params: { code: code }
  });
  return response.data;
}

/* ─── Customers & Auth ──────────────────────────────────────────────────── */

export async function authenticateCustomer(username: string, password: string): Promise<{ token: string, user_email: string, user_nicename: string, user_display_name: string }> {
    
  const response = await wpAuthApi.post("/token", {
    username,
    password
  });
  return response.data;
}

export async function createCustomer(data: CreateCustomerPayload): Promise<WCCustomer> {
    const response = await api.post("/customers", data);
  return response.data;
}

export async function getCustomer(customerId: number): Promise<WCCustomer> {
    const response = await api.get(`/customers/${customerId}`);
  return response.data;
}

export async function getCustomerByEmail(email: string): Promise<WCCustomer[]> {
    const response = await api.get("/customers", {
    params: { email }
  });
  return response.data;
}

export async function updateCustomer(customerId: number, data: UpdateCustomerPayload): Promise<WCCustomer> {
    const response = await api.put(`/customers/${customerId}`, data);
  return response.data;
}

/* ─── Reviews ───────────────────────────────────────────────────────────── */

export async function getProductReviews(productId: number): Promise<WCReview[]> {
    const response = await api.get("/products/reviews", {
    params: { product: productId, status: "approved" }
  });
  return response.data;
}

export async function createProductReview(data: CreateReviewPayload): Promise<WCReview> {
    const response = await api.post("/products/reviews", data);
  return response.data;
}

/* ─── Shipping & Payment ────────────────────────────────────────────────── */

export async function getShippingZones(): Promise<WCShippingZone[]> {
    const response = await api.get("/shipping/zones");
  return response.data;
}

export async function getShippingMethods(zoneId: number): Promise<WCShippingMethod[]> {
    const response = await api.get(`/shipping/zones/${zoneId}/methods`);
  return response.data;
}

export async function getPaymentGateways(): Promise<WCPaymentGateway[]> {
    const response = await api.get("/payment_gateways");
  return response.data;
}
