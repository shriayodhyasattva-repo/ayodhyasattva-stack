import * as React from "react";
import Hero from "@/components/home/hero";
import Collections from "@/components/home/collections";
import TestimonialSection from "@/components/home/testimonials";
import ProductCard from "@/components/product/product-card";
import { getProducts } from "@/lib/woocommerce";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function Home() {
  // Fetch featured products for the homepage highlight grid
  const { data: featuredProducts } = await getProducts({ featured: true });

  return (
    <div className="bg-[#FAF8F3]/40 min-h-screen">
      
      {/* Hero Header Banner */}
      <Hero />

      {/* Categories Showcase Grid */}
      <Collections />

      {/* Featured Products Highlighting */}
      <section className="bg-background py-16 sm:py-24 border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-gold inline-flex items-center gap-1">
                <Sparkles className="h-3 w-3 fill-gold" /> Sanjeevani for the Soul
              </span>
              <h2 className="font-serif text-3xl font-bold text-foreground mt-2">
                Sacred Relics of Devotion
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-xl">
                Immaculate artistry crafted by generations of metalworkers, embodying the virtues of Lord Rama, Mother Sita, Lakshman, and Hanuman.
              </p>
            </div>
            <div>
              <Link href="/products">
                <Button variant="link" className="text-gold font-semibold hover:text-gold-hover inline-flex items-center gap-1.5 p-0">
                  View All Products <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Featured Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

        </div>
      </section>

      {/* Testimonials Review Slider / Grid */}
      <TestimonialSection />

    </div>
  );
}
