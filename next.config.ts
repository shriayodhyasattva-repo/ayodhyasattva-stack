import type { NextConfig } from "next";

const wcUrl = process.env.WOOCOMMERCE_URL || "http://woocommerce-dev.local";
let wcProtocol: "http" | "https" = "http";
let wcHostname = "woocommerce-dev.local";
let wcPort = "";

try {
  const url = new URL(wcUrl);
  wcProtocol = url.protocol.replace(':', '') as "http" | "https";
  wcHostname = url.hostname;
  if (url.port) wcPort = url.port;
} catch (e) {
  console.warn("Invalid WOOCOMMERCE_URL, falling back to defaults for images");
}

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: wcProtocol,
        hostname: wcHostname,
        ...(wcPort ? { port: wcPort } : {}),
      },
    ],
  },
};

export default nextConfig;
