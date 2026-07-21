export interface ProductImage {
  id: number;
  src: string;
  name: string;
  alt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  totalCount: number;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  image?: { src: string; alt?: string };
}

export interface ProductAttribute {
  id: number;
  name: string;
  slug: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface ProductVariation {
  id: number;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  stock_status: "instock" | "outofstock" | "onbackorder";
  stock_quantity: number | null;
  attributes: { id: number; name: string; option: string }[];
  image?: ProductImage;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  type: "simple" | "grouped" | "external" | "variable";
  status: string;
  featured: boolean;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  purchasable: boolean;
  stock_status: "instock" | "outofstock" | "onbackorder";
  stock_quantity: number | null;
  images: ProductImage[];
  categories: ProductCategory[];
  attributes: ProductAttribute[];
  default_attributes?: { id: number; name: string; option: string }[];
  variations?: number[];
  related_ids?: number[];
  upsell_ids?: number[];
  cross_sell_ids?: number[];
  average_rating: string;
  rating_count: number;
  weight?: string;
  dimensions?: { length: string; width: string; height: string };
  tags?: { id: number; name: string; slug: string }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedAttributes?: { name: string; option: string }[];
  selectedVariationId?: number;
}

/* ─── WooCommerce Order Types ───────────────────────────────────────────── */

export interface WCOrderLineItem {
  product_id: number;
  variation_id?: number;
  quantity: number;
  meta_data?: { key: string; value: string }[];
}

export interface WCAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface CreateOrderPayload {
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  status: "pending" | "processing" | "on-hold" | "completed";
  billing: WCAddress & { email: string; phone: string };
  shipping: WCAddress;
  line_items: WCOrderLineItem[];
  shipping_lines?: {
    method_id: string;
    method_title: string;
    total: string;
  }[];
  coupon_lines?: {
    code: string;
  }[];
  meta_data?: { key: string; value: string }[];
  customer_note?: string;
  customer_id?: number;
}

export interface WCOrder {
  id: number;
  number: string;
  status: string;
  currency: string;
  total: string;
  subtotal?: string;
  discount_total: string;
  shipping_total: string;
  billing: WCAddress & { email: string; phone: string };
  shipping: WCAddress;
  line_items: {
    id: number;
    product_id: number;
    name: string;
    quantity: number;
    price: string;
    total: string;
    image?: { src: string };
    sku?: string;
  }[];
  coupon_lines?: {
    id: number;
    code: string;
    discount: string;
  }[];
  payment_method: string;
  payment_method_title: string;
  date_created: string;
  date_created_gmt: string;
  date_modified?: string;
  date_completed?: string | null;
  meta_data: { id: number; key: string; value: string }[];
  customer_id: number;
  customer_note?: string;
}

export interface WCProductsParams {
  category?: string;          // category slug or ID
  featured?: boolean;
  search?: string;
  per_page?: number;
  page?: number;
  orderby?: "date" | "id" | "title" | "price" | "popularity" | "rating";
  order?: "asc" | "desc";
  stock_status?: "instock" | "outofstock" | "onbackorder";
  on_sale?: boolean;
  min_price?: string;
  max_price?: string;
  slug?: string;
  include?: number[];
  exclude?: number[];
  tag?: string;
}

/* ─── WooCommerce Category (full response) ──────────────────────────────── */

export interface WCCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: { id: number; src: string; alt: string } | null;
  menu_order: number;
  count: number;
}

/* ─── WooCommerce Reviews ───────────────────────────────────────────────── */

export interface WCReview {
  id: number;
  date_created: string;
  product_id: number;
  status: string;
  reviewer: string;
  reviewer_email: string;
  review: string;         // HTML content
  rating: number;
  verified: boolean;
  reviewer_avatar_urls?: Record<string, string>;
}

export interface CreateReviewPayload {
  product_id: number;
  review: string;
  reviewer: string;
  reviewer_email: string;
  rating: number;
}

/* ─── WooCommerce Shipping ──────────────────────────────────────────────── */

export interface WCShippingZone {
  id: number;
  name: string;
  order: number;
}

export interface WCShippingMethod {
  instance_id: number;
  title: string;
  order: number;
  enabled: boolean;
  method_id: string;      // "flat_rate" | "free_shipping" | "local_pickup"
  method_title: string;
  method_description: string;
  settings: {
    cost?: { value: string };
    min_amount?: { value: string };
    [key: string]: { value: string } | undefined;
  };
}

/* ─── WooCommerce Coupons ───────────────────────────────────────────────── */

export interface WCCoupon {
  id: number;
  code: string;
  amount: string;
  discount_type: "percent" | "fixed_cart" | "fixed_product";
  description: string;
  date_expires: string | null;
  usage_count: number;
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  individual_use: boolean;
  minimum_amount: string;
  maximum_amount: string;
  free_shipping: boolean;
  product_ids: number[];
  excluded_product_ids: number[];
  category_ids: number[];
  excluded_category_ids: number[];
}

/* ─── WooCommerce Customer ──────────────────────────────────────────────── */

export interface WCCustomer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  billing: WCAddress & { email: string; phone: string };
  shipping: WCAddress;
  avatar_url: string;
  date_created: string;
  orders_count?: number;
  total_spent?: string;
  role?: string;
}

export interface CreateCustomerPayload {
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  password: string;
  billing?: Partial<WCAddress>;
  shipping?: Partial<WCAddress>;
}

export interface UpdateCustomerPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  billing?: Partial<WCAddress & { email: string; phone: string }>;
  shipping?: Partial<WCAddress>;
}

/* ─── WooCommerce Payment Gateways ──────────────────────────────────────── */

export interface WCPaymentGateway {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  method_title: string;
  method_description: string;
}

/* ─── Razorpay Types ────────────────────────────────────────────────────── */

export interface RazorpayOrderResponse {
  id: string;              // Razorpay order ID (order_xxx)
  amount: number;          // Amount in paise
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  wc_order_id: number;
}

/* ─── Session / Auth Types ──────────────────────────────────────────────── */

export interface SessionUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  jwtToken?: string;
}

export interface AuthState {
  user: SessionUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}
