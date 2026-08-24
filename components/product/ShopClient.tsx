"use client";

import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import ProductCard from "@/components/product/ProductCard";

import type {
  Product,
  ProductCategory,
} from "@/types/product";

type ShopClientProps = {
  products: Product[];
};

const categories: Array<
  "All" | ProductCategory
> = [
  "All",
  "Men",
  "Women",
  "Lab Coats",
];

type SortOption =
  | "featured"
  | "price-low"
  | "price-high"
  | "rating"
  | "newest";

function getValidCategory(
  value: string | null,
): (typeof categories)[number] {
  if (value === "Men") {
    return "Men";
  }

  if (value === "Women") {
    return "Women";
  }

  if (value === "Lab Coats") {
    return "Lab Coats";
  }

  return "All";
}

export default function ShopClient({
  products,
}: ShopClientProps) {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  /*
   * =========================================
   * URL CATEGORY
   * =========================================
   *
   * /shop?category=Women
   * /shop?category=Men
   * /shop?category=Lab%20Coats
   */

  const categoryFromUrl =
    getValidCategory(
      searchParams.get(
        "category",
      ),
    );

  const [search, setSearch] =
    useState("");

  const [
    category,
    setCategory,
  ] = useState<
    (typeof categories)[number]
  >(categoryFromUrl);

  const [sort, setSort] =
    useState<SortOption>(
      "featured",
    );

  const [
    inStockOnly,
    setInStockOnly,
  ] = useState(false);

  const [
    mobileFiltersOpen,
    setMobileFiltersOpen,
  ] = useState(false);

  /*
   * =========================================
   * URL CHANGE → FILTER CHANGE
   * =========================================
   *
   * Header se Women / Men click hone par
   * same ShopClient URL ko read karega.
   */

  useEffect(() => {
    const value =
      getValidCategory(
        searchParams.get(
          "category",
        ),
      );

    setCategory(value);
  }, [searchParams]);

  /*
   * =========================================
   * CATEGORY CHANGE
   * =========================================
   *
   * Sidebar radio click karne par URL bhi
   * update hoga.
   */

  const handleCategoryChange = (
    nextCategory:
      (typeof categories)[number],
  ) => {
    setCategory(
      nextCategory,
    );

    if (
      nextCategory === "All"
    ) {
      router.push(
        "/shop",
      );

      return;
    }

    router.push(
      `/shop?category=${encodeURIComponent(
        nextCategory,
      )}`,
    );
  };

  /*
   * =========================================
   * PRODUCT FILTERING
   * =========================================
   */

  const filteredProducts =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      const result =
        products.filter(
          (product) => {
            /*
             * SEARCH
             */

            const matchesSearch =
              !normalizedSearch ||
              product.name
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              product.category
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              product.gender
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              product.colors.some(
                (color) =>
                  color
                    .toLowerCase()
                    .includes(
                      normalizedSearch,
                    ),
              ) ||
              Boolean(
                product.tags?.some(
                  (tag) =>
                    tag
                      .toLowerCase()
                      .includes(
                        normalizedSearch,
                      ),
                ),
              );

            /*
             * STRICT CATEGORY FILTER
             *
             * Women:
             * ONLY product.gender === "Women"
             *
             * Men:
             * ONLY product.gender === "Men"
             *
             * Lab Coats:
             * ONLY productType === "lab-coat"
             *
             * This prevents Men/Women mixing.
             */

            let matchesCategory =
              true;

            if (
              category ===
              "Women"
            ) {
              matchesCategory =
                product.productType ===
                  "scrub" &&
                product.gender ===
                  "Women";
            }

            if (
              category ===
              "Men"
            ) {
              matchesCategory =
                product.productType ===
                  "scrub" &&
                product.gender ===
                  "Men";
            }

            if (
              category ===
              "Lab Coats"
            ) {
              matchesCategory =
                product.productType ===
                "lab-coat";
            }

            /*
             * STOCK
             */

            const matchesStock =
              !inStockOnly ||
              product.inStock;

            return (
              matchesSearch &&
              matchesCategory &&
              matchesStock
            );
          },
        );

      /*
       * =====================================
       * SORT
       * =====================================
       */

      return [
        ...result,
      ].sort(
        (a, b) => {
          if (
            sort ===
            "price-low"
          ) {
            return (
              (a.setPrice ??
                a.price) -
              (b.setPrice ??
                b.price)
            );
          }

          if (
            sort ===
            "price-high"
          ) {
            return (
              (b.setPrice ??
                b.price) -
              (a.setPrice ??
                a.price)
            );
          }

          if (
            sort ===
            "rating"
          ) {
            return (
              b.rating -
              a.rating
            );
          }

          if (
            sort ===
            "newest"
          ) {
            return (
              new Date(
                b.createdAt,
              ).getTime() -
              new Date(
                a.createdAt,
              ).getTime()
            );
          }

          /*
           * Featured
           */

          return (
            a.featuredRank -
            b.featuredRank
          );
        },
      );
    }, [
      products,
      search,
      category,
      sort,
      inStockOnly,
    ]);

  /*
   * =========================================
   * CLEAR FILTERS
   * =========================================
   */

  const clearFilters =
    () => {
      setSearch("");

      setSort(
        "featured",
      );

      setInStockOnly(
        false,
      );

      setCategory(
        "All",
      );

      router.push(
        "/shop",
      );
    };

  /*
   * =========================================
   * FILTER SIDEBAR
   * =========================================
   */

  const filterContent = (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-950">
          Filters
        </h2>

        <button
          type="button"
          onClick={
            clearFilters
          }
          className="text-xs font-bold text-[#922424] hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* =====================================
          CATEGORY
      ===================================== */}

      <div className="mt-7 border-t border-slate-200 pt-6">
        <h3 className="text-sm font-bold text-slate-900">
          Category
        </h3>

        <div className="mt-4 space-y-3">
          {categories.map(
            (item) => (
              <label
                key={
                  item
                }
                className="flex cursor-pointer items-center gap-3 text-sm text-slate-600"
              >
                <input
                  type="radio"
                  name="category"
                  value={
                    item
                  }
                  checked={
                    category ===
                    item
                  }
                  onChange={() =>
                    handleCategoryChange(
                      item,
                    )
                  }
                  className="h-4 w-4 accent-[#922424]"
                />

                <span>
                  {item}
                </span>
              </label>
            ),
          )}
        </div>
      </div>

      {/* =====================================
          STOCK
      ===================================== */}

      <div className="mt-7 border-t border-slate-200 pt-6">
        <label className="flex cursor-pointer items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-900">
              In stock only
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Hide unavailable
              products
            </p>
          </div>

          <input
            type="checkbox"
            checked={
              inStockOnly
            }
            onChange={(
              event,
            ) =>
              setInStockOnly(
                event.target
                  .checked,
              )
            }
            className="h-5 w-5 accent-[#922424]"
          />
        </label>
      </div>

      {/* =====================================
          SCRUB INFO
      ===================================== */}

      <div className="mt-7 border-t border-slate-200 pt-6">
        <div className="rounded-2xl bg-[#fff7f7] p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#922424]">
            Scrub Options
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-600">
            Complete Set ₹1,699.
            Top ₹849 and Bottom
            ₹850 with separate size
            selection.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* =====================================
          SEARCH + SORT
      ===================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(
              event,
            ) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search scrubs, colours..."
            className="w-full rounded-full border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-[#922424]/10"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setMobileFiltersOpen(
                true,
              )
            }
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 lg:hidden"
          >
            <SlidersHorizontal
              size={18}
            />

            Filters
          </button>

          <select
            value={sort}
            onChange={(
              event,
            ) =>
              setSort(
                event.target
                  .value as SortOption,
              )
            }
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#922424]"
          >
            <option value="featured">
              Featured
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="rating">
              Highest Rated
            </option>

            <option value="newest">
              Newest
            </option>
          </select>
        </div>
      </div>

      {/* =====================================
          QUICK CATEGORY BUTTONS
      ===================================== */}

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            handleCategoryChange(
              "All",
            )
          }
          className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
            category ===
            "All"
              ? "border-[#922424] bg-[#922424] text-white"
              : "border-slate-300 bg-white text-slate-700"
          }`}
        >
          All
        </button>

        <button
          type="button"
          onClick={() =>
            handleCategoryChange(
              "Women",
            )
          }
          className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
            category ===
            "Women"
              ? "border-[#922424] bg-[#922424] text-white"
              : "border-slate-300 bg-white text-slate-700"
          }`}
        >
          Women
        </button>

        <button
          type="button"
          onClick={() =>
            handleCategoryChange(
              "Men",
            )
          }
          className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
            category ===
            "Men"
              ? "border-[#922424] bg-[#922424] text-white"
              : "border-slate-300 bg-white text-slate-700"
          }`}
        >
          Men
        </button>

        <button
          type="button"
          onClick={() =>
            handleCategoryChange(
              "Lab Coats",
            )
          }
          className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
            category ===
            "Lab Coats"
              ? "border-[#922424] bg-[#922424] text-white"
              : "border-slate-300 bg-white text-slate-700"
          }`}
        >
          Lab Coats
        </button>
      </div>

      {/* =====================================
          SHOP BODY
      ===================================== */}

      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden self-start rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24 lg:block">
          {
            filterContent
          }
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {
                  filteredProducts.length
                }
              </span>{" "}
              {filteredProducts.length ===
              1
                ? "product"
                : "products"}
            </p>

            {category !==
              "All" && (
              <span className="rounded-full bg-[#fff0f0] px-4 py-2 text-xs font-bold text-[#922424]">
                {
                  category
                }
              </span>
            )}
          </div>

          {/* =====================================
              PRODUCTS
          ===================================== */}

          {filteredProducts.length >
          0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map(
                (
                  product,
                ) => (
                  <ProductCard
                    key={
                      product.id
                    }
                    product={
                      product
                    }
                  />
                ),
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-20 text-center">
              <div className="text-5xl">
                🔍
              </div>

              <h2 className="mt-5 text-xl font-black text-slate-900">
                No products found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Selected category me
                abhi koi matching
                product available nahi
                hai.
              </p>

              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="mt-6 rounded-full bg-[#922424] px-6 py-3 text-sm font-bold text-white"
              >
                View All Products
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =====================================
          MOBILE FILTER DRAWER
      ===================================== */}

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() =>
              setMobileFiltersOpen(
                false,
              )
            }
            className="absolute inset-0 bg-slate-950/50"
          />

          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-950">
                Product Filters
              </h2>

              <button
                type="button"
                onClick={() =>
                  setMobileFiltersOpen(
                    false,
                  )
                }
                className="rounded-full p-2 hover:bg-slate-100"
                aria-label="Close"
              >
                <X
                  size={22}
                />
              </button>
            </div>

            {
              filterContent
            }

            <button
              type="button"
              onClick={() =>
                setMobileFiltersOpen(
                  false,
                )
              }
              className="mt-8 w-full rounded-full bg-[#922424] px-5 py-3 text-sm font-bold text-white"
            >
              Show{" "}
              {
                filteredProducts.length
              }{" "}
              Products
            </button>
          </div>
        </div>
      )}
    </div>
  );
}