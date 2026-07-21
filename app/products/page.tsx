import React from "react";
import Link from "next/link";
import { getProducts, getCategories } from "@/lib/woocommerce";
import ProductCard from "@/components/product/product-card";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import SortSelect from "./sort-select";
import StorePagination from "@/components/store-pagination";


export const metadata = {
  title: "Products | Ayodhya Store",
  description: "Browse our collection of sacred items, idols, and pooja essentials.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentCategory = (resolvedSearchParams.category as string) || "all";
  const currentSort = (resolvedSearchParams.sort as string) || "latest";
  const page = parseInt((resolvedSearchParams.page as string) || "1");

  // Map sort string to WC API params
  let orderby: "date" | "price" | "popularity" = "date";
  let order: "asc" | "desc" = "desc";
  if (currentSort === "price-asc") { orderby = "price"; order = "asc"; }
  if (currentSort === "price-desc") { orderby = "price"; order = "desc"; }
  if (currentSort === "popularity") { orderby = "popularity"; }

  // Fetch data
  const [{ data: products, totalPages }, categories] = await Promise.all([
    getProducts({
      category: currentCategory !== "all" ? currentCategory : undefined,
      orderby,
      order,
      page,
      per_page: 24,
    }),
    getCategories()
  ]);

  return (
    <div className="bg-[#FAF8F3] min-h-screen pt-28 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Sacred Collection
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">
              Authentic spiritual items handpicked for your devotion. Browse through our curated categories of premium products.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden md:flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            
            <div className="w-[180px]">
              <form>
                {currentCategory !== "all" && <input type="hidden" name="category" value={currentCategory} />}
                <SortSelect currentSort={currentSort} />
                <button type="submit" className="hidden" id="submit-sort">Sort</button>
              </form>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Categories */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="font-bold text-lg mb-4 text-foreground">Categories</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/products?sort=${currentSort}`}
                    className={`block py-1.5 text-sm transition-colors ${
                      currentCategory === "all" ? "text-gold font-semibold" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All Products
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}&sort=${currentSort}`}
                      className={`block py-1.5 text-sm transition-colors ${
                        currentCategory === cat.slug ? "text-gold font-semibold" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat.name} <span className="text-muted-foreground/60 text-xs ml-1">({cat.count})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-xl border border-border">
                <p className="text-lg font-medium text-foreground">No products found</p>
                <p className="text-muted-foreground text-sm mt-1">Try adjusting your filters or category selection.</p>
                <Link href="/products" className="text-gold font-medium mt-4 inline-block hover:underline">
                  Clear all filters
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10">
                  {products.map((product, idx) => (
                    <ProductCard key={product.id} product={product} priority={idx < 4} />
                  ))}
                </div>
                
                {/* Real Pagination Component */}
                <StorePagination totalPages={totalPages} />
              </>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
