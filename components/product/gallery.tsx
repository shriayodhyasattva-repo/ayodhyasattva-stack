"use client";

import * as React from "react";
import { ProductImage } from "@/types/product";
import { cn } from "@/lib/utils";

interface GalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function Gallery({ images, productName }: GalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
        No images available
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="flex flex-col gap-4">
      
      {/* Main Large Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-white shadow-xs group">
        <img
          src={activeImage.src}
          alt={activeImage.alt || productName}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        {/* Decorative spiritual stamp */}
        <div className="absolute left-4 top-4 bg-background/80 backdrop-blur-xs px-2.5 py-1 border border-gold/20 rounded text-[9px] font-bold text-gold uppercase tracking-wider">
          🪔 Verified
        </div>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((image, idx) => (
            <button
              key={image.id || idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border bg-white transition-all",
                activeIndex === idx
                  ? "border-gold ring-2 ring-gold/10 scale-95"
                  : "border-border hover:border-gold/50"
              )}
            >
              <img
                src={image.src}
                alt={image.alt || `Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
