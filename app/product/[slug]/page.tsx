import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getProductReviews, getProductVariations, getProductReplies } from "@/lib/woocommerce";
import ProductGallery from "@/components/product/product-gallery";
import ProductCard from "@/components/product/product-card";
import ClientActions from "./client-actions";
import { ShieldCheck, Truck, RotateCcw, Star } from "lucide-react";
import ReviewForm from "./review-form";

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

  const relatedIds = (product.upsell_ids && product.upsell_ids.length > 0) 
    ? product.upsell_ids 
    : (product.related_ids || []);
  const isUpsell = product.upsell_ids && product.upsell_ids.length > 0;
  
  // Only block on variations (critical for add to cart)
  const variations = product.type === "variable" ? await getProductVariations(product.id) : [];

  return (
    <div className="bg-[#FAF8F3] min-h-screen pt-24">
      {/* Product Details Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:h-max">
            <ProductGallery images={product.images} />
          </div>

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

            <ClientActions product={product} variations={variations} />

          </div>
        </div>
      </div>
      
      <div className="border-t border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-8">
            Product Details
          </h2>
          <div 
            className="prose prose-lg max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      </div>
      
      <Suspense fallback={<div className="py-16 text-center text-muted-foreground">Loading reviews...</div>}>
        <ProductReviews productId={product.id} averageRating={product.average_rating} ratingCount={product.rating_count} />
      </Suspense>

      {relatedIds.length > 0 && (
        <Suspense fallback={<div className="py-16 text-center text-muted-foreground">Loading related products...</div>}>
          <RelatedProducts relatedIds={relatedIds} isUpsell={isUpsell} />
        </Suspense>
      )}
    </div>
  );
}

async function ProductReviews({ productId, averageRating, ratingCount }: { productId: number, averageRating: string, ratingCount: number }) {
  const [reviews, replies] = await Promise.all([
    getProductReviews(productId),
    getProductReplies(productId)
  ]);

  const reviewsWithReplies = reviews.map(review => {
    const reviewReplies = replies.filter(reply => reply.parent === review.id).map(reply => ({
      id: reply.id,
      author: reply.author_name,
      content: reply.content.rendered,
      date: reply.date
    }));
    return { ...review, replies: reviewReplies };
  });

  return (
    <div className="border-t border-border bg-[#FAF8F3]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <h2 className="text-2xl font-serif font-bold mb-4">Customer Reviews</h2>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-4xl font-bold text-foreground">{averageRating}</span>
              <span className="text-muted-foreground">out of 5</span>
            </div>
            <p className="text-sm text-muted-foreground mb-8">Based on {ratingCount} reviews</p>
            
            <ReviewForm productId={productId} />
          </div>
          
          <div className="lg:col-span-8">
            {reviewsWithReplies.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-border">
                <p className="text-foreground font-medium">No reviews yet</p>
                <p className="text-sm text-muted-foreground mt-1">Be the first to review this sacred item.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviewsWithReplies.map((review) => (
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
                    
                    {review.replies && review.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gold/30 bg-[#FAF8F3] p-4 rounded-r-lg">
                        {review.replies.map((reply: any) => (
                          <div key={reply.id} className="mb-3 last:mb-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-xs text-foreground bg-gold/10 px-2 py-0.5 rounded text-gold">Store Owner</span>
                              <span className="text-[10px] text-muted-foreground">{new Date(reply.date).toLocaleDateString()}</span>
                            </div>
                            <div 
                              className="text-xs text-muted-foreground prose prose-sm prose-p:my-1"
                              dangerouslySetInnerHTML={{ __html: reply.content }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

async function RelatedProducts({ relatedIds, isUpsell }: { relatedIds: number[], isUpsell: boolean }) {
  const relatedProducts = await getRelatedProducts(relatedIds);
  
  if (relatedProducts.length === 0) return null;

  return (
    <div className="border-t border-border bg-[#FAF8F3]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-serif font-bold text-foreground mb-8">
          {isUpsell ? "You May Also Like" : "Related Products"}
        </h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 sm:gap-x-6 lg:gap-x-8">
          {relatedProducts.map((related) => (
            <ProductCard key={related.id} product={related} />
          ))}
        </div>
      </div>
    </div>
  );
}
