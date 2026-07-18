"use client";

import * as React from "react";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart, Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ClientDetailsActionsProps {
  product: Product;
}

export default function ClientDetailsActions({ product }: ClientDetailsActionsProps) {
  const { addItem, toggleWishlist, isInWishlist } = useCart();
  const [quantity, setQuantity] = React.useState(1);
  const isWishlisted = isInWishlist(product.id);

  const incrementQty = () => setQuantity((prev) => prev + 1);
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.name} added to cart`, {
      description: `Quantity: ${quantity}. Packaged securely with care.`,
    });
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    if (!isWishlisted) {
      toast.success("Saved to your Wishlist", {
        description: `${product.name} added.`,
      });
    } else {
      toast.info("Removed from your Wishlist");
    }
  };

  const isOutOfStock = product.stock_status !== "instock";

  return (
    <div className="flex flex-col gap-4 pt-2">
      
      {/* Quantity & Actions Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Quantity Select Panel */}
        <div className="flex h-11 items-center justify-between border border-border rounded-lg bg-background px-3 sm:w-32 shrink-0">
          <button
            onClick={decrementQty}
            disabled={isOutOfStock}
            className="text-muted-foreground hover:text-gold disabled:opacity-50 p-1"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-foreground w-8 text-center">{quantity}</span>
          <button
            onClick={incrementQty}
            disabled={isOutOfStock}
            className="text-muted-foreground hover:text-gold disabled:opacity-50 p-1"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Add to Cart button */}
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="h-11 flex-1 gap-2 text-sm font-medium shadow-sm"
        >
          <ShoppingCart className="h-4 w-4" />
          {isOutOfStock ? "Out of Stock" : "Add to Sacred Cart"}
        </Button>

        {/* Wishlist Button */}
        <Button
          onClick={handleToggleWishlist}
          variant="secondary"
          className={cn(
            "h-11 w-11 px-0 shrink-0",
            isWishlisted ? "border-gold/50 bg-soft-gold/20 text-gold" : ""
          )}
        >
          <Heart className={cn("h-5 w-5", isWishlisted ? "fill-gold text-gold" : "")} />
          <span className="sr-only">Toggle Wishlist</span>
        </Button>
      </div>

    </div>
  );
}
