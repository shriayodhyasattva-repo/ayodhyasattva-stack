import React from "react";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getProductReviews, getProductVariations } from "@/lib/woocommerce";
import ProductGallery from "@/components/product/product-gallery";
import ProductCard from "@/components/product/product-card";
import ClientActions from "./client-actions";
import { ShieldCheck, Truck, RotateCcw, Star } from "lucide-react";
import ReviewForm from "./review-form"; // We'll create this component

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | Ayodhya Store`,
    description: product.short_description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  // Ensure related_ids exists before calling getRelatedProducts
  const relatedIds = product.related_ids || [];
  
  const [relatedProducts, reviews, variations] = await Promise.all([
    relatedIds.length > 0 ? getRelatedProducts(relatedIds) : [],
    getProductReviews(product.id),
    product.type === "variable" ? getProductVariations(product.id) : []
  ]);

  return (
    <div className="bg-[#FAF8F3] min-h-screen pt-24">
      {/* Product Details Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left: Gallery */}
          <div className="lg:sticky lg:top-24 lg:h-max">
            <ProductGallery images={product.images} />
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            <nav className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
              <a href="/" className="hover:text-gold transition-colors">Home</a>
              <span>/</span>
              <a href="/products" className="hover:text-gold transition-colors">Products</a>
              <span>/</span>
              {product.categories?.[0] && (
                <>
                  <a href={`/products?category=${product.categories[0].slug}`} className="hover:text-gold transition-colors">
                    {product.categories[0].name}
                  </a>
                  <span>/</span>
                </>
              )}
            </nav>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              {product.name}
            </h1>
            
            {/* Reviews Summary */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-4 w-4 ${star <= Math.round(parseFloat(product.average_rating)) ? "fill-gold text-gold" : "text-muted-foreground/30"}`} 
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-foreground">{product.average_rating} Rating</span>
              <span className="text-sm text-muted-foreground">({product.rating_count} Reviews)</span>
            </div>

            <div 
              className="prose prose-sm text-muted-foreground mb-8 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.short_description || product.description }}
            />

            {/* Features list */}
            <ul className="space-y-3 mb-10 text-sm text-foreground">
              <li className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-gold" />
                <span>100% Authentic & Certified Quality</span>
              </li>
              <li className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-gold" />
                <span>Fast & Secure Shipping Pan-India</span>
              </li>
              <li className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-gold" />
                <span>Easy 7-Day Return Policy</span>
              </li>
            </ul>

            {/* Add to Cart Actions (Client Component) */}
            <ClientActions product={product} variations={variations} />

          </div>
        </div>
      </div>
      
      {/* Description & Details Tabs (Simplified) */}
      <div className="border-t border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-serif font-bold mb-8">Product Details</h2>
          <div 
            className="prose prose-lg max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="border-t border-border bg-[#FAF8F3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <h2 className="text-2xl font-serif font-bold mb-4">Customer Reviews</h2>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-4xl font-bold text-foreground">{product.average_rating}</span>
                <span className="text-muted-foreground">out of 5</span>
              </div>
              <p className="text-sm text-muted-foreground mb-8">Based on {product.rating_count} reviews</p>
              
              <ReviewForm productId={product.id} />
            </div>
            
            <div className="lg:col-span-8">
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-border">
                  <p className="text-foreground font-medium">No reviews yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Be the first to review this sacred item.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center font-bold text-gold">
                            {review.reviewer.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{review.reviewer}</p>
                            <p className="text-xs text-muted-foreground">{new Date(review.date_created).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-3 w-3 ${star <= review.rating ? "fill-gold text-gold" : "text-muted-foreground/30"}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <div 
                        className="text-sm text-muted-foreground prose prose-sm"
                        dangerouslySetInnerHTML={{ __html: review.review }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-border bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                You May Also Like
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
