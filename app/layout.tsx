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
  title: "Ayodhya Store - Premium Spiritual & Heritage Store",
  description: "Experience the divinity of Ayodhya with our premium collections of handcrafted temple idols, pooja essentials, spiritual items, and sacred decor.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();
  const navCategories = categories.slice(0, 5).map(c => ({ name: c.name, slug: c.slug }));

  return (
    <html lang="en" className="h-full scroll-smooth antialiased" data-scroll-behavior="smooth">
      <body className={`${poppins.variable} font-sans min-h-full flex flex-col bg-[#FAF8F3] text-[#2D2A26]`}>
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

