"use client";

import React from "react";

export default function SortSelect({ currentSort }: { currentSort: string }) {
  return (
    <select 
      name="sort"
      defaultValue={currentSort}
      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      onChange={(e) => e.target.form?.submit()}
    >
      <option value="latest">Latest Arrivals</option>
      <option value="popularity">Popularity</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
    </select>
  );
}
