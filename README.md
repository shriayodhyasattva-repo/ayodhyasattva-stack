# Ayodhya Sattva

A premium ecommerce storefront built with Next.js 16, utilizing WooCommerce as a headless backend for products, orders, customers, and business logic.

## 🚀 Getting Started

### Prerequisites

Before starting the frontend, you need to set up your backend on Hostinger (or any host):

1. **Install WordPress & WooCommerce** on your hosting provider.
2. **Enable the REST API**: In your WordPress dashboard, go to WooCommerce > Settings > Advanced > REST API.
3. **Create API Keys**: Add a key with **Read/Write** permissions. You will get a Consumer Key (`ck_...`) and a Consumer Secret (`cs_...`).
4. **Permalinks**: Ensure WordPress permalinks are set to "Post name" (Settings > Permalinks).
5. **JWT Authentication**: Install and activate the **JWT Authentication for WP REST API** plugin in WordPress to enable customer login.
6. **Razorpay Account**: Set up a Razorpay account and get your Test API keys from the Razorpay dashboard.

### Local Setup

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure your environment variables:
   Copy `.env.local.example` to `.env.local` (or create `.env.local` directly) and fill in your keys:
   ```env
   # WooCommerce Backend Details
   WOOCOMMERCE_URL=https://your-wordpress-domain.com
   WOOCOMMERCE_KEY=ck_your_consumer_key
   WOOCOMMERCE_SECRET=cs_your_consumer_secret

   # Razorpay Gateway
   NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_your_key
   RAZORPAY_SECRET=your_razorpay_secret

   # Session Encryption Key (Generate any long random string)
   JWT_SECRET=your_super_secret_key_123!
   ```

3. Update `next.config.ts`:
   Add your WordPress domain to the `images.remotePatterns` list so Next.js can load your product images.

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 💡 Fallback Mode
If you start the application *without* providing the WooCommerce credentials in `.env.local`, the store will run in **Mock Data Fallback** mode. It will use local static data for products and categories so you can still work on the UI.

---

## 🏗️ Architecture

- **Frontend**: Next.js 16 (App Router), React, TailwindCSS, Shadcn UI
- **State Management**: Zustand (for Cart)
- **Backend API**: Next.js Route Handlers (`app/api/*`) proxy requests to hide API keys from the browser.
- **Ecommerce Engine**: WooCommerce REST API v3
- **Authentication**: JWT stored in an HttpOnly cookie
- **Payments**: Razorpay Gateway Integration
