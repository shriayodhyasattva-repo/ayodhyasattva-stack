import { cn } from "@/lib/utils";

interface PriceProps {
  price: string;
  regularPrice: string;
  salePrice?: string;
  onSale?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Price({
  price,
  regularPrice,
  salePrice,
  onSale,
  className,
  size = "md",
}: PriceProps) {
  const currentPrice = parseFloat(price || "0");
  const oldPrice = parseFloat(regularPrice || "0");

  const showSale = onSale && oldPrice > currentPrice;

  // Calculate discount percentage
  const discountPercent = showSale
    ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100)
    : 0;

  const sizeClasses = {
    sm: "text-xs gap-1.5",
    md: "text-sm gap-2",
    lg: "text-lg gap-2.5",
  };

  const textSizes = {
    sm: {
      current: "text-sm font-bold text-gold",
      old: "text-xs text-muted-foreground/75 line-through",
    },
    md: {
      current: "text-base font-bold text-gold",
      old: "text-xs text-muted-foreground/75 line-through",
    },
    lg: {
      current: "text-xl font-bold text-gold sm:text-2xl",
      old: "text-sm text-muted-foreground/75 line-through",
    },
  };

  return (
    <div className={cn("flex items-center", sizeClasses[size], className)}>
      <span className={cn(textSizes[size].current)}>
        ₹{currentPrice.toLocaleString("en-IN")}
      </span>
      
      {showSale && (
        <>
          <span className={cn(textSizes[size].old)}>
            ₹{oldPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] font-bold text-success bg-success/10 border border-success/20 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
            {discountPercent}% OFF
          </span>
        </>
      )}
    </div>
  );
}
