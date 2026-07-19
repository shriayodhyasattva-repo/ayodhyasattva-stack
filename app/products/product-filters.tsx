"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Heart, Sparkles, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface FilterProps {
  currentCategory: string;
  currentSearch: string;
  currentSort: string;
  categories: { name: string; slug: string }[];
}

/* ── Shared filter logic hook ───────────────────────────────────────────── */
function useFilterActions() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  return { updateParam, searchParams };
}

/* ── Sort Dropdown (header area) ────────────────────────────────────────── */
export function SortDropdown({ currentSort }: { currentSort: string }) {
  const { updateParam } = useFilterActions();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground hidden sm:inline">Sort By:</span>
      <select
        value={currentSort}
        onChange={(e) => updateParam("sort", e.target.value)}
        className="h-9 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground focus:border-gold outline-none cursor-pointer"
      >
        <option value="featured">Featured</option>
        <option value="price-asc">Price ↑</option>
        <option value="price-desc">Price ↓</option>
        <option value="rating">Rating</option>
      </select>
    </div>
  );
}

/* ── Filter panel content (used inside sidebar AND drawer) ─────────────── */
function FilterContent({
  currentCategory,
  currentSearch,
  categories,
  onClose,
}: {
  currentCategory: string;
  currentSearch: string;
  categories: { name: string; slug: string }[];
  onClose?: () => void;
}) {
  const { updateParam } = useFilterActions();
  const [searchValue, setSearchValue] = React.useState(currentSearch);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("search", searchValue.trim());
    onClose?.();
  };

  const handleCategoryClick = (slug: string) => {
    updateParam("category", slug);
    onClose?.();
  };

  return (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2.5">
          Search Products
        </h3>
        <form onSubmit={handleSearchSubmit} className="relative">
          <Input
            name="search"
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Type to search..."
            className="h-10 pr-9 bg-muted/20 text-sm focus-visible:border-gold"
          />
          <button type="submit" className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-gold">
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Categories
          </h3>
          {currentCategory && (
            <button
              onClick={() => handleCategoryClick("")}
              className="text-[10px] text-gold font-semibold hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          <button
            onClick={() => handleCategoryClick("")}
            className={`text-left text-xs py-2 px-3 rounded-lg border transition-colors ${
              !currentCategory
                ? "border-gold bg-soft-gold/15 text-gold font-bold"
                : "border-border text-muted-foreground hover:border-gold/50 hover:text-gold"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`text-left text-xs py-2 px-3 rounded-lg border transition-colors ${
                currentCategory === cat.slug
                  ? "border-gold bg-soft-gold/15 text-gold font-bold"
                  : "border-border text-muted-foreground hover:border-gold/50 hover:text-gold"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Flags */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-foreground mb-2.5">
          Quick Filters
        </h3>
        <div className="flex flex-col gap-1.5">
          <Link
            href="/products?sort=rating"
            onClick={onClose}
            className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-gold py-2 px-3 rounded-lg border border-border hover:border-gold/50 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-gold shrink-0" />
            <span>Highly Rated</span>
          </Link>
          <Link
            href="/products?wishlist=true"
            onClick={onClose}
            className="flex items-center gap-2.5 text-xs text-muted-foreground hover:text-gold py-2 px-3 rounded-lg border border-border hover:border-gold/50 transition-colors"
          >
            <Heart className="h-4 w-4 text-gold shrink-0" />
            <span>My Wishlist</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Mobile Filter Button + Drawer ─────────────────────────────────────── */
export function MobileFilterDrawer({
  currentCategory,
  currentSearch,
  categories,
}: {
  currentCategory: string;
  currentSearch: string;
  categories: { name: string; slug: string }[];
}) {
  const [open, setOpen] = React.useState(false);
  const activeFilterCount =
    (currentCategory ? 1 : 0) + (currentSearch ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="relative inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-border bg-background text-xs font-semibold text-foreground hover:border-gold transition-colors outline-none cursor-pointer">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-white">
            {activeFilterCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] bg-background rounded-t-2xl p-6 overflow-y-auto">
        <SheetHeader className="mb-5 flex flex-row items-center justify-between">
          <SheetTitle className="text-base font-bold text-foreground">Filter Products</SheetTitle>
        </SheetHeader>
        <FilterContent
          currentCategory={currentCategory}
          currentSearch={currentSearch}
          categories={categories}
          onClose={() => setOpen(false)}
        />
        <div className="mt-6">
          <Button className="w-full h-12 text-sm" onClick={() => setOpen(false)}>
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ── Desktop Sidebar ────────────────────────────────────────────────────── */
export function FilterSidebar({
  currentCategory,
  currentSearch,
  categories,
}: {
  currentCategory: string;
  currentSearch: string;
  categories: { name: string; slug: string }[];
}) {
  return (
    <aside className="hidden lg:block lg:col-span-1">
      <div className="bg-background rounded-xl border border-border p-5">
        <FilterContent
          currentCategory={currentCategory}
          currentSearch={currentSearch}
          categories={categories}
        />
      </div>
    </aside>
  );
}
