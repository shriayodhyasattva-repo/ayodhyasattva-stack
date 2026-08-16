import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import "./globals.css";
import { Suspense } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { getCategories } from "@/lib/woocommerce";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://ayodhyasattva.com'),
  title: {
    default: "Ayodhya Sattva - Premium Spiritual & Heritage Store",
    template: "%s | Ayodhya Sattva",
  },
  description: "Experience the divinity of Ayodhya with our premium collections of handcrafted temple idols, pooja essentials, spiritual items, and sacred decor.",
  keywords: [
    // Brand & Core Ayodhya
    "Ayodhya Sattva", "Ayodhya Spiritual Store", "Authentic Ayodhya Products", 
    "Ayodhya Ram Mandir Souvenirs", "Ram Lalla Murti Online", "Ram Darbar Brass Idol",
    
    // Origin & Authenticity
    "Made in Ayodhya", "Born in Ayodhya", "Inspired by Ayodhya", "Ayodhya Local Artisans",
    "Ayodhya me famous", "Ayodhya me bani", "अयोध्या में बनी", "अयोध्या की मशहूर", "अयोध्या के कारीगर",
    
    // Top Trending Indian E-commerce Terms
    "Pooja Samagri Online", "Buy Puja Items Online", "Premium Pooja Samagri", 
    "Puja Kits for Home", "Authentic Pooja Accessories",
    "पूजा का सामान ऑनलाइन", "पूजा की सामग्री खरीदें", "असली पूजा सामान",
    
    // Gifting & Decor Intent
    "Spiritual Gifts for Housewarming", "Devotional Return Gifts", "Divine Corporate Gifts India",
    "Spiritual Home Decor India", "Handcrafted Brass Idols", "Sacred Temple Relics",

    // Hinglish & Hindi Search Terms (Huge Market)
    "Pooja ka Saman", "Ram Ji ki Murti", "Ayodhya Ram Mandir Prasad", "Ghar ke Mandir ke liye Murti",
    "पूजा सामग्री", "राम लला की मूर्ति", "अयोध्या राम मंदिर", "पीतल की मूर्ति"
  ],
  authors: [{ name: "Ayodhya Sattva" }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://ayodhyasattva.com",
    title: "Ayodhya Sattva - Premium Spiritual & Heritage Store",
    description: "Experience the divinity of Ayodhya with our premium collections of handcrafted temple idols.",
    siteName: "Ayodhya Sattva",
    images: [{
      url: '/icon.png',
      width: 512,
      height: 512,
      alt: 'Ayodhya Sattva Logo'
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ayodhya Sattva",
    description: "Experience the divinity of Ayodhya.",
    images: ['/icon.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();
  const navCategories = categories.slice(0, 5).map(c => ({ name: c.name, slug: c.slug }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://ayodhyasattva.com/#organization',
        name: 'Ayodhya Sattva',
        url: 'https://ayodhyasattva.com',
        logo: 'https://ayodhyasattva.com/icon.png',
        description: 'Premium Spiritual & Heritage Store for Ayodhya relics, idols, and pooja essentials.',
      },
      {
        '@type': 'WebSite',
        '@id': 'https://ayodhyasattva.com/#website',
        url: 'https://ayodhyasattva.com',
        name: 'Ayodhya Sattva',
        publisher: {
          '@id': 'https://ayodhyasattva.com/#organization'
        },
      }
    ]
  };

  return (
    <html lang="en" className="h-full scroll-smooth antialiased" data-scroll-behavior="smooth">
      <body className={`${poppins.variable} font-sans min-h-full flex flex-col bg-[#FAF8F3] text-[#2D2A26]`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          <Suspense fallback={<div className="h-20 w-full" />}>
            <Navbar categories={navCategories} />
          </Suspense>
        <main className="flex-grow flex flex-col">{children}</main>
        <Footer />
        <Toaster position="bottom-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}

