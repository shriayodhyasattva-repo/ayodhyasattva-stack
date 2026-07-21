import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getCategories } from "@/lib/woocommerce";

export default async function Collections() {
  const categories = await getCategories();

  return (
    <section className="bg-background py-12 sm:py-20 border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold">The Treasures of Ayodhya</span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-foreground mt-2">
            Adorn Your Altar with Devotion
          </h2>
          <p className="text-sm text-muted-foreground mt-2 sm:mt-3 leading-relaxed">
            From the sacred banks of the Sarayu river to your personal shrine, discover items that resonate with the eternal chant of 'Jai Shri Ram'.
          </p>
        </div>

        {/* Collections Grid — 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              /* Shorter aspect ratio on mobile for better thumb-scroll UX */
              className="group relative flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-[#FAF8F3] aspect-[3/4] active:scale-[0.98] transition-all duration-200"
            >
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 z-10 transition-colors duration-300" />
              {category.image?.src ? (
                <Image
                  src={category.image.src}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-gold/40 to-amber-900/40 transition-transform duration-500 group-hover:scale-105 flex items-center justify-center">
                  <span className="text-4xl font-serif text-white/50">{category.name.charAt(0)}</span>
                </div>
              )}

              {/* Text Overlay */}
              <div className="relative z-20 mt-auto p-3 sm:p-6 text-white">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-soft-gold hidden sm:block">
                  Explore Collection
                </span>
                <h3 className="font-serif text-sm sm:text-xl font-bold mt-0.5 sm:mt-1 leading-tight">
                  {category.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-white/80 mt-1 line-clamp-2 leading-relaxed hidden sm:block">
                  {category.description || "Explore our collection"}
                </p>

                {/* Always visible arrow on mobile */}
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-soft-gold mt-2">
                  Shop <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
