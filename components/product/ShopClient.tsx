"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import type { Product, ProductCategory } from "@/types/product";

type ShopClientProps = {
  products: Product[];
};

const categories: Array<"All" | ProductCategory> = [
  "All",
  "Men",
  "Women",
  "Unisex",
  "Lab Coats",
];

type SortOption =
  | "featured"
  | "price-low"
  | "price-high"
  | "rating"
  | "newest";

export default function ShopClient({ products }: ShopClientProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<(typeof categories)[number]>("All");
  const [sort, setSort] = useState<SortOption>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || product.category === category;

      const matchesStock = !inStockOnly || product.inStock;

      return matchesSearch && matchesCategory && matchesStock;
    });

    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "newest") return Number(b.id) - Number(a.id);

      return 0;
    });
  }, [products, search, category, sort, inStockOnly]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSort("featured");
    setInStockOnly(false);
  };

  const filterContent = (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-950">Filters</h2>

        <button
          type="button"
          onClick={clearFilters}
          className="text-xs font-bold text-[#0b78bd] hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="mt-7 border-t border-slate-200 pt-6">
        <h3 className="text-sm font-bold text-slate-900">Category</h3>

        <div className="mt-4 space-y-3">
          {categories.map((item) => (
            <label
              key={item}
              className="flex cursor-pointer items-center gap-3 text-sm text-slate-600"
            >
              <input
                type="radio"
                name="category"
                value={item}
                checked={category === item}
                onChange={() => setCategory(item)}
                className="h-4 w-4 accent-[#063970]"
              />

              {item}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-7 border-t border-slate-200 pt-6">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-900">In stock only</p>
            <p className="mt-1 text-xs text-slate-500">
              Hide unavailable products
            </p>
          </div>

          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) => setInStockOnly(event.target.checked)}
            className="h-5 w-5 accent-[#063970]"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#0b78bd] focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 lg:hidden"
          >
            <SlidersHorizontal size={18} />
            Filters
          </button>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b78bd]"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden rounded-2xl border border-slate-200 bg-white p-6 lg:block">
          {filterContent}
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {filteredProducts.length}
              </span>{" "}
              products
            </p>

            {category !== "All" && (
              <span className="rounded-full bg-sky-50 px-4 py-2 text-xs font-bold text-[#0b78bd]">
                {category}
              </span>
            )}
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-20 text-center">
              <div className="text-5xl">🔍</div>

              <h2 className="mt-5 text-xl font-black text-slate-900">
                No products found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Search term ya selected filters change karke dekho.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-full bg-[#063970] px-6 py-3 text-sm font-bold text-white"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-slate-950/50"
          />

          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-950">
                Product Filters
              </h2>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-full p-2 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            {filterContent}

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-8 w-full rounded-full bg-[#063970] px-5 py-3 text-sm font-bold text-white"
            >
              Show {filteredProducts.length} Products
            </button>
          </div>
        </div>
      )}
    </div>
  );
}