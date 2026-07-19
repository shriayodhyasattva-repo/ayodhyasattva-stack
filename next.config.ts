import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "woocommerce-dev.local",
      },
      // When connecting your actual WooCommerce store, 
      // replace this with your actual WordPress hostname
      // {
      //   protocol: "https",
      //   hostname: "yourstore.com",
      // }
    ],
  },
};

export default nextConfig;
