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
  const [selectedAttributes, setSelectedAttributes] = React.useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (product.default_attributes && product.default_attributes.length > 0) {
      product.default_attributes.forEach(attr => {
        // WooCommerce default_attributes often return the slug (e.g. 'green') instead of the label ('Green')
        const productAttr = product.attributes?.find(a => a.name.toLowerCase() === attr.name.toLowerCase());
        
        let optionLabel = attr.option;
        if (productAttr) {
          // Find the exact label from the options array
          const exactMatch = productAttr.options.find(
            opt => opt.toLowerCase().replace(/\s+/g, '-') === attr.option.toLowerCase().replace(/\s+/g, '-') 
                || opt.toLowerCase() === attr.option.toLowerCase()
          );
          if (exactMatch) optionLabel = exactMatch;
        }
        
        initial[productAttr?.name || attr.name] = optionLabel;
      });
    }
    return initial;
  });
  
  const isWishlisted = isInWishlist(product.id);

  // Some WooCommerce configurations might omit `variation: true`, so we fallback to all attributes for variable products.
  const variationAttributes = product.attributes?.filter(a => a.variation || product.type === "variable") || [];
  const isVariable = product.type === "variable" && variationAttributes.length > 0;
  const hasVariations = isVariable && variations && variations.length > 0;

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
        
        // WooCommerce often returns the slug in vAttr.option (e.g. 'green') but the label in product.attributes.options (e.g. 'Green').
        // Therefore, we must do a case-insensitive comparison, and ideally a slugified comparison if it contains spaces.
        const normalizedUser = userSelected?.toLowerCase().replace(/\s+/g, '-');
        const normalizedOption = vAttr.option?.toLowerCase().replace(/\s+/g, '-');

        return normalizedUser === normalizedOption || userSelected?.toLowerCase() === vAttr.option?.toLowerCase();
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
  
  // Disable Add To Cart if out of stock, variation missing, or if it's a variable product but no match/no variations exist.
  const isAddToCartDisabled = isOutOfStock || isVariationMissing || (isVariable && !matchedVariation);

  // Helper to check if an option actually exists in the available variations backend
  const isOptionAvailable = React.useCallback((attrName: string, optionValue: string) => {
    if (!hasVariations) return false;
    
    return variations!.some(v => {
      const vAttr = v.attributes.find(a => a.name.toLowerCase() === attrName.toLowerCase());
      if (!vAttr) return false;
      
      // If WooCommerce returns "" for option, it means "Any [Attribute]" so all options are valid.
      if (vAttr.option === "") return true;
      
      const normalizedOption = vAttr.option.toLowerCase().replace(/\s+/g, '-');
      const normalizedValue = optionValue.toLowerCase().replace(/\s+/g, '-');
      
      return normalizedOption === normalizedValue || vAttr.option.toLowerCase() === optionValue.toLowerCase();
    });
  }, [variations, hasVariations]);

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
      toast.error("Please select available product options before adding to cart.");
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
      {isVariable && !hasVariations ? (
        <div className="mb-4 p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
          <p className="text-sm font-medium text-destructive">This product is currently unavailable.</p>
        </div>
      ) : isVariable && hasVariations ? (
        variationAttributes.map(attr => (
          <div key={attr.id} className="mb-4">
            <label className="block text-sm font-semibold text-foreground mb-2">
              {attr.name}
            </label>
            <div className="flex flex-wrap gap-2">
              {attr.options.map(option => {
                const isSelected = selectedAttributes[attr.name] === option || selectedAttributes[attr.name.toLowerCase()] === option;
                const available = isOptionAvailable(attr.name, option);
                
                return (
                  <button
                    key={option}
                    onClick={() => available && handleAttributeSelect(attr.name, option)}
                    disabled={!available}
                    className={cn(
                      "px-4 py-2 border text-sm rounded-lg transition-colors",
                      !available && "opacity-40 cursor-not-allowed bg-muted",
                      isSelected && available
                        ? "border-gold bg-soft-gold/10 text-gold font-semibold" 
                        : available && "border-border bg-background text-foreground hover:border-gold/50"
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))
      ) : null}

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
