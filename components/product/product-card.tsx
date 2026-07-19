"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Price from "./price";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const { addItem, toggleWishlist, isInWishlist } = useCart();
  const isWishlisted = isInWishlist(product.id);

  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.type === "variable") {
      router.push(`/product/${product.slug}`);
      return;
    }
    
    addItem(product, 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    toast[isWishlisted ? "info" : "success"](
      isWishlisted ? "Removed from wishlist" : "Saved to wishlist",
      { description: !isWishlisted ? product.name : undefined }
    );
  };

  const rating = parseFloat(product.average_rating || "0");

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-background transition-all hover:shadow-md active:scale-[0.99]",
        className
      )}
    >
      {/* Image container */}
      <Link
        href={`/product/${product.slug}`}
        className="relative block overflow-hidden bg-muted"
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* Wishlist — always visible, large tap target on mobile */}
        <button
          onClick={handleWishlist}
          className={cn(
            "absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-full border bg-background/90 shadow-sm backdrop-blur-xs transition-colors",
            isWishlisted
              ? "border-gold/40 bg-soft-gold/20 text-gold"
              : "border-border text-muted-foreground hover:text-gold"
          )}
        >
          <Heart className={cn("h-4 w-4", isWishlisted ? "fill-gold text-gold" : "")} />
          <span className="sr-only">Toggle wishlist</span>
        </button>

        {/* Sale badge */}
        {product.on_sale && (
          <span className="absolute left-2.5 top-2.5 z-20 bg-gold text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            Sale
          </span>
        )}

        <img
          src={
            product.images[0]?.src ||
            "https://images.unsplash.com/photo-1609137144814-7d5267b137d5?auto=format&fit=crop&q=80&w=400"
          }
          alt={product.images[0]?.alt || product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Desktop hover panel — hidden on mobile via sm: prefix */}
        <div className="hidden sm:flex absolute inset-x-0 bottom-0 z-10 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent">
          <Button
            onClick={handleAddToCart}
            className="w-full gap-1.5 shadow-sm font-medium"
            size="sm"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> 
            {product.type === "variable" ? "Select Options" : "Add to Cart"}
          </Button>
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {product.categories[0]?.name || "Spiritual"}
          </span>
          {rating > 0 && (
            <div className="flex items-center gap-0.5 text-gold shrink-0">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-[10px] font-semibold text-foreground">{rating}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-1 font-serif text-xs sm:text-sm font-bold text-foreground line-clamp-2 group-hover:text-gold transition-colors leading-snug">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Price */}
        <Price
          price={product.price}
          regularPrice={product.regular_price}
          salePrice={product.sale_price}
          onSale={product.on_sale}
          className="mt-auto pt-2.5 border-t border-border/40"
          size="sm"
        />

        {/* Mobile-only Add to Cart button — always visible */}
        <button
          onClick={handleAddToCart}
          className="sm:hidden mt-2.5 w-full h-10 flex items-center justify-center gap-1.5 rounded-lg bg-gold text-white text-xs font-semibold active:bg-gold-hover transition-colors"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {product.type === "variable" ? "Select Options" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
