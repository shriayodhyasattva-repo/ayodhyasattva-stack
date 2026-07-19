"use client";

import * as React from "react";
import { Product, ProductVariation } from "@/types/product";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart, Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ClientDetailsActionsProps {
  product: Product;
  variations?: ProductVariation[];
}

export default function ClientDetailsActions({ product, variations }: ClientDetailsActionsProps) {
  const { addItem, toggleWishlist, isInWishlist } = useCart();
  const [quantity, setQuantity] = React.useState(1);
  const [selectedAttributes, setSelectedAttributes] = React.useState<Record<string, string>>({});
  
  const isWishlisted = isInWishlist(product.id);

  // Some WooCommerce configurations might omit `variation: true`, so we fallback to all attributes for variable products.
  const variationAttributes = product.attributes?.filter(a => a.variation || product.type === "variable") || [];
  const isVariable = product.type === "variable" && variationAttributes.length > 0;

  React.useEffect(() => {
    if (product.type === "variable") {
      console.log("Variations loaded:", variations);
      console.log("Product attributes:", product.attributes);
      console.log("Variation attributes:", variationAttributes);
    }
  }, [product, variations, variationAttributes]);

  // Attempt to find a matched variation based on selected attributes
  const matchedVariation = React.useMemo(() => {
    if (!isVariable || !variations || variations.length === 0) return null;
    
    // WooCommerce returns attributes array in the variation object
    return variations.find(v => {
      // Every variation attribute must match the user's selection
      return v.attributes.every(vAttr => {
        // vAttr.name might be something like "Size", and vAttr.option is "L"
        // Also it might be slug based depending on API format. Usually it matches exactly or lowercase.
        const userSelected = selectedAttributes[vAttr.name] || selectedAttributes[vAttr.name.toLowerCase()];
        
        // If the variation attribute option is empty (""), it means "Any" value matches.
        if (vAttr.option === "") return true;
        
        return userSelected === vAttr.option;
      });
    });
  }, [selectedAttributes, variations, isVariable]);

  // Derived states
  const priceToDisplay = matchedVariation ? matchedVariation.price : product.price;
  const regularPriceToDisplay = matchedVariation ? matchedVariation.regular_price : product.regular_price;
  
  const isOutOfStock = matchedVariation 
    ? matchedVariation.stock_status !== "instock"
    : product.stock_status !== "instock";
    
  // Button disabled state
  const isVariationMissing = isVariable && Object.keys(selectedAttributes).length < variationAttributes.length;
  const isAddToCartDisabled = isOutOfStock || isVariationMissing || (isVariable && !matchedVariation);

  const incrementQty = () => setQuantity((prev) => prev + 1);
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAttributeSelect = (attrName: string, option: string) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attrName]: option
    }));
    // Reset quantity to 1 when changing variations
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (isVariable && !matchedVariation) {
      toast.error("Please select product options before adding to cart.");
      return;
    }

    const attrsForCart = Object.entries(selectedAttributes).map(([name, option]) => ({ attribute: name, value: option }));
    
    addItem(product, quantity, matchedVariation?.id, attrsForCart as any);
    
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

  return (
    <div className="flex flex-col gap-4 pt-2">
      
      {/* Price Display */}
      <div className="flex items-end gap-3 mb-4">
        {(!isVariable || matchedVariation) ? (
          <>
            <p className="text-3xl font-bold text-foreground">
              ₹{parseFloat(priceToDisplay || "0").toLocaleString("en-IN")}
            </p>
            {regularPriceToDisplay && regularPriceToDisplay !== priceToDisplay && (
              <p className="text-lg text-muted-foreground line-through mb-1">
                ₹{parseFloat(regularPriceToDisplay).toLocaleString("en-IN")}
              </p>
            )}
          </>
        ) : (
          <p className="text-3xl font-bold text-foreground">
            {/* Range or generic if no variation selected yet */}
            ₹{parseFloat(product.price || "0").toLocaleString("en-IN")}
            <span className="text-lg text-muted-foreground ml-2 font-normal">Select options for final price</span>
          </p>
        )}
      </div>

      {/* Variation Selectors */}
      {isVariable && variationAttributes.map(attr => (
        <div key={attr.id} className="mb-4">
          <label className="block text-sm font-semibold text-foreground mb-2">
            {attr.name}
          </label>
          <div className="flex flex-wrap gap-2">
            {attr.options.map(option => {
              const isSelected = selectedAttributes[attr.name] === option || selectedAttributes[attr.name.toLowerCase()] === option;
              return (
                <button
                  key={option}
                  onClick={() => handleAttributeSelect(attr.name, option)}
                  className={cn(
                    "px-4 py-2 border text-sm rounded-lg transition-colors",
                    isSelected 
                      ? "border-gold bg-soft-gold/10 text-gold font-semibold" 
                      : "border-border bg-background text-foreground hover:border-gold/50"
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Quantity & Actions Row */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        {/* Quantity Select Panel */}
        <div className="flex h-11 items-center justify-between border border-border rounded-lg bg-background px-3 sm:w-32 shrink-0">
          <button
            onClick={decrementQty}
            disabled={isAddToCartDisabled}
            className="text-muted-foreground hover:text-gold disabled:opacity-50 p-1"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold text-foreground w-8 text-center">{quantity}</span>
          <button
            onClick={incrementQty}
            disabled={isAddToCartDisabled}
            className="text-muted-foreground hover:text-gold disabled:opacity-50 p-1"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Add to Cart button */}
        <Button
          onClick={handleAddToCart}
          disabled={isAddToCartDisabled}
          className="h-11 flex-1 gap-2 text-sm font-medium shadow-sm"
        >
          <ShoppingCart className="h-4 w-4" />
          {isOutOfStock 
            ? "Out of Stock" 
            : isVariationMissing 
              ? "Select Options" 
              : "Add to Sacred Cart"}
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
