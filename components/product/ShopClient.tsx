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

type CategoryFilter =
  | "All"
  | ProductCategory;

type SortOption =
  | "featured"
  | "price-low"
  | "price-high"
  | "rating"
  | "newest";

type CollectionFilter =
  | ""
  | "new-arrivals"
  | "bestsellers";

const categories: CategoryFilter[] = [
  "All",
  "Men",
  "Women",
  "Unisex",
  "Lab Coats",
];

const topCategoryButtons: CategoryFilter[] = [
  "All",
  "Women",
  "Men",
  "Lab Coats",
];

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalColour(value: string) {
  const colour = normalize(value);

  if (colour === "black") {
    return "black";
  }

  return colour;
}

/**
 * IMPORTANT:
 * Every colour-specific product card can still contain all available colours
 * inside product.colors. So filtering directly against product.colors would
 * incorrectly show Airforce Blue + Black + Royal Blue cards together.
 *
 * This helper identifies the ACTUAL colour represented by the card itself
 * using its name / slug / main image path.
 */
function getProductCardColour(product: Product) {
  const searchable = normalize(
    `${product.name} ${product.slug} ${product.image ?? ""}`,
  );

  const knownColours = [
    "airforce blue",
    "royal blue",
    "black",
    "black",
    "navy blue",
    "navy",
    "wine",
    "maroon",
    "teal",
    "forest green",
    "grey",
    "gray",
    "lavender",
    "olive",
    "eucalyptus",
    "ceil blue",
    "ciel blue",
    "galaxy blue",
    "steel grey",
    "steel gray",
    "heather grey",
    "heather gray",
    "pastel lilac",
  ];

  for (const colour of knownColours) {
    if (searchable.includes(colour)) {
      if (colour === "black") return "black";
      if (colour === "gray") return "grey";
      if (colour === "steel gray") return "steel grey";
      if (colour === "heather gray") return "heather grey";
      if (colour === "ciel blue") return "ceil blue";

      return colour;
    }
  }

  /*
   * Safe fallback:
   * only use product.colors when this product has exactly ONE colour.
   * We intentionally DO NOT use a multi-colour product.colors array here,
   * otherwise every colour variant would appear for every colour filter.
   */
  if (
    Array.isArray(product.colors) &&
    product.colors.length === 1
  ) {
    return canonicalColour(product.colors[0]);
  }

  return "";
}

function getDisplayColourName(colour: string) {
  const normalized = canonicalColour(colour);

  if (normalized === "black") {
    return colour.toLowerCase().includes("stealth")
      ? "black"
      : "Black";
  }

  return colour;
}

export default function ShopClient({
  products,
}: ShopClientProps) {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState<CategoryFilter>("All");

  const [
    selectedColour,
    setSelectedColour,
  ] = useState("");

  const [sort, setSort] =
    useState<SortOption>("featured");

  const [
    collectionFilter,
    setCollectionFilter,
  ] = useState<CollectionFilter>("");

  const [
    inStockOnly,
    setInStockOnly,
  ] = useState(false);

  const [
    mobileFiltersOpen,
    setMobileFiltersOpen,
  ] = useState(false);

  /*
   * =========================================================
   * SYNC FILTER STATE FROM NEXT.JS SEARCH PARAMS
   * =========================================================
   *
   * IMPORTANT:
   * Do NOT patch window.history.pushState/replaceState.
   * Next.js can call history methods during React insertion
   * effects. Triggering setState synchronously from there causes:
   *
   * "useInsertionEffect must not schedule updates."
   *
   * useSearchParams is the correct App Router source of truth.
   */
  useEffect(() => {
    const urlColour =
      searchParams.get("colour") ??
      searchParams.get("color") ??
      "";

    const urlCategory =
      searchParams.get("category") ??
      "";

    const urlCollection =
      searchParams.get(
        "collection",
      ) ?? "";

    const urlSort =
      searchParams.get("sort") ??
      "";

    setSelectedColour(
      urlColour,
    );

    if (
      categories.includes(
        urlCategory as CategoryFilter,
      )
    ) {
      setCategory(
        urlCategory as CategoryFilter,
      );
    } else {
      setCategory("All");
    }

    if (
      urlCollection ===
        "new-arrivals" ||
      urlCollection ===
        "bestsellers"
    ) {
      setCollectionFilter(
        urlCollection as CollectionFilter,
      );
    } else {
      setCollectionFilter("");
    }

    if (
      [
        "featured",
        "price-low",
        "price-high",
        "rating",
        "newest",
      ].includes(urlSort)
    ) {
      setSort(
        urlSort as SortOption,
      );
    } else {
      setSort("featured");
    }
  }, [searchParams]);

  const updateUrl = ({
    nextCategory = category,
    nextColour = selectedColour,
  }: {
    nextCategory?: CategoryFilter;
    nextColour?: string;
  }) => {
    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    if (
      nextCategory &&
      nextCategory !== "All"
    ) {
      params.set(
        "category",
        nextCategory,
      );
    } else {
      params.delete("category");
    }

    /*
     * Keep one canonical query key: "colour".
     * Remove the older "color" key to avoid duplicate filters.
     */
    params.delete("color");

    if (nextColour) {
      params.set(
        "colour",
        nextColour,
      );
    } else {
      params.delete("colour");
    }

    const query =
      params.toString();

    const nextUrl = query
      ? `/shop?${query}`
      : "/shop";

    router.push(nextUrl);
  };

  const selectCategory = (
    nextCategory: CategoryFilter,
  ) => {
    /*
     * Switching Men/Women/All should immediately show that
     * category. Clear colour + collection filters so a filter
     * from the previous page cannot hide products.
     */
    setCategory(nextCategory);
    setSelectedColour("");
    setCollectionFilter("");

    const params =
      new URLSearchParams(
        searchParams.toString(),
      );

    params.delete("colour");
    params.delete("color");
    params.delete("collection");

    if (
      nextCategory !== "All"
    ) {
      params.set(
        "category",
        nextCategory,
      );
    } else {
      params.delete("category");
    }

    const query =
      params.toString();

    router.push(
      query
        ? `/shop?${query}`
        : "/shop",
    );
  };

  const selectColour = (
    nextColour: string,
  ) => {
    setSelectedColour(nextColour);

    updateUrl({
      nextCategory: category,
      nextColour,
    });
  };

  const availableColours =
    useMemo(() => {
      const colours = new Map<
        string,
        string
      >();

      products.forEach((product) => {
        const cardColour =
          getProductCardColour(product);

        if (cardColour) {
          const label =
            product.colors?.find(
              (colour) =>
                canonicalColour(
                  colour,
                ) === cardColour,
            ) ??
            (cardColour === "black"
              ? "Black"
              : cardColour
                  .split(" ")
                  .map(
                    (part) =>
                      part
                        .charAt(0)
                        .toUpperCase() +
                      part.slice(1),
                  )
                  .join(" "));

          colours.set(
            cardColour,
            label,
          );
        }
      });

      const preferredOrder = [
        "airforce blue",
        "royal blue",
        "black",
      ];

      return Array.from(
        colours.entries(),
      )
        .sort(([a], [b]) => {
          const ai =
            preferredOrder.indexOf(a);
          const bi =
            preferredOrder.indexOf(b);

          if (
            ai !== -1 ||
            bi !== -1
          ) {
            if (ai === -1) return 1;
            if (bi === -1) return -1;
            return ai - bi;
          }

          return a.localeCompare(b);
        })
        .map(
          ([value, label]) => ({
            value,
            label,
          }),
        );
    }, [products]);

  const filteredProducts =
    useMemo(() => {
      const normalizedSearch =
        normalize(search);

      const wantedColour =
        canonicalColour(
          selectedColour,
        );

      const result =
        products.filter(
          (product) => {
            const searchText =
              normalize(
                [
                  product.name,
                  product.category,
                  product.gender,
                  product.style,
                  ...(product.colors ??
                    []),
                  ...(product.tags ??
                    []),
                ].join(" "),
              );

            const matchesSearch =
              !normalizedSearch ||
              searchText.includes(
                normalizedSearch,
              );

            const matchesCategory =
              category === "All" ||
              product.category ===
                category;

            const matchesStock =
              !inStockOnly ||
              product.inStock;

            /*
             * This is the key fix:
             * match the colour represented by THIS card,
             * not every colour stored in product.colors.
             */
            const cardColour =
              getProductCardColour(
                product,
              );

            const matchesColour =
              !wantedColour ||
              cardColour ===
                wantedColour;

            /*
             * Mega-menu collection filters:
             *
             * New Arrivals:
             * /shop?category=Men&collection=new-arrivals
             *
             * Bestsellers:
             * /shop?category=Women&collection=bestsellers
             */
            const matchesCollection =
              collectionFilter ===
              "new-arrivals"
                ? product.isNewArrival ===
                  true
                : collectionFilter ===
                    "bestsellers"
                  ? product.isBestseller ===
                    true
                  : true;

            return (
              matchesSearch &&
              matchesCategory &&
              matchesStock &&
              matchesColour &&
              matchesCollection
            );
          },
        );

      return [...result].sort(
        (a, b) => {
          /*
           * Keep user-selected sorting untouched.
           */
          if (
            sort === "price-low"
          ) {
            return (
              a.price - b.price
            );
          }

          if (
            sort === "price-high"
          ) {
            return (
              b.price - a.price
            );
          }

          if (sort === "rating") {
            return (
              b.rating - a.rating
            );
          }

          if (sort === "newest") {
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
           * FEATURED ORDER
           *
           * Live scrub colour cards should appear:
           *
           * 1. Airforce Blue
           * 2. Royal Blue
           * 3. Black / Stealth Black
           *
           * Remaining products continue to use featuredRank.
           */
          const preferredCardColourOrder = [
            "airforce blue",
            "royal blue",
            "black",
          ];

          const aColour =
            getProductCardColour(a);

          const bColour =
            getProductCardColour(b);

          const aIndex =
            preferredCardColourOrder.indexOf(
              aColour,
            );

          const bIndex =
            preferredCardColourOrder.indexOf(
              bColour,
            );

          const aColourRank =
            aIndex === -1
              ? 999
              : aIndex;

          const bColourRank =
            bIndex === -1
              ? 999
              : bIndex;

          if (
            aColourRank !==
            bColourRank
          ) {
            return (
              aColourRank -
              bColourRank
            );
          }

          return (
            (a.featuredRank ??
              999) -
            (b.featuredRank ??
              999)
          );
        },
      );
    }, [
      products,
      search,
      category,
      selectedColour,
      sort,
      inStockOnly,
      collectionFilter,
    ]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSelectedColour("");
    setSort("featured");
    setCollectionFilter("");
    setInStockOnly(false);

    router.push("/shop");
  };

  const filterContent = (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-950">
          Filters
        </h2>

        <button
          type="button"
          onClick={clearFilters}
          className="text-xs font-bold text-[#922424] transition hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* CATEGORY */}
      <div className="mt-7 border-t border-slate-200 pt-6">
        <h3 className="text-sm font-bold text-slate-900">
          Category
        </h3>

        <div className="mt-4 space-y-3">
          {categories.map(
            (item) => (
              <label
                key={item}
                className="flex cursor-pointer items-center gap-3 text-sm text-slate-600"
              >
                <input
                  type="radio"
                  name="category"
                  value={item}
                  checked={
                    category === item
                  }
                  onChange={() =>
                    selectCategory(
                      item,
                    )
                  }
                  className="h-4 w-4 accent-[#922424]"
                />

                {item}
              </label>
            ),
          )}
        </div>
      </div>

      {/* COLOUR */}
      <div className="mt-7 border-t border-slate-200 pt-6">
        <h3 className="text-sm font-bold text-slate-900">
          Colour
        </h3>

        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
            <input
              type="radio"
              name="colour"
              checked={
                selectedColour === ""
              }
              onChange={() =>
                selectColour("")
              }
              className="h-4 w-4 accent-[#922424]"
            />

            All Colours
          </label>

          {availableColours.map(
            (colour) => (
              <label
                key={colour.value}
                className="flex cursor-pointer items-center gap-3 text-sm text-slate-600"
              >
                <input
                  type="radio"
                  name="colour"
                  checked={
                    canonicalColour(
                      selectedColour,
                    ) === colour.value
                  }
                  onChange={() =>
                    selectColour(
                      colour.label,
                    )
                  }
                  className="h-4 w-4 accent-[#922424]"
                />

                {colour.label}
              </label>
            ),
          )}
        </div>
      </div>

      {/* STOCK */}
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
            checked={inStockOnly}
            onChange={(event) =>
              setInStockOnly(
                event.target
                  .checked,
              )
            }
            className="h-5 w-5 accent-[#922424]"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* SEARCH + SORT */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search scrubs, colours..."
            className="w-full rounded-full border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#922424] focus:ring-2 focus:ring-red-100"
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
            onChange={(event) =>
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

      {/* RESTORED TOP CATEGORY BUTTONS */}
      <div className="mt-6 flex flex-wrap gap-3">
        {topCategoryButtons.map(
          (item) => {
            const active =
              category === item;

            return (
              <button
                key={item}
                type="button"
                onClick={() =>
                  selectCategory(
                    item,
                  )
                }
                className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
                  active
                    ? "border-[#922424] bg-[#922424] text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-[#922424] hover:text-[#922424]"
                }`}
              >
                {item}
              </button>
            );
          },
        )}
      </div>

      {/* ACTIVE FILTER CHIPS */}
      {(selectedColour ||
        category !== "All" ||
        collectionFilter) && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-slate-500">
            Showing:
          </span>

          {category !== "All" && (
            <button
              type="button"
              onClick={() =>
                selectCategory("All")
              }
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white"
            >
              {category}
              <X size={14} />
            </button>
          )}

          {selectedColour && (
            <button
              type="button"
              onClick={() =>
                selectColour("")
              }
              className="inline-flex items-center gap-2 rounded-full bg-[#922424] px-4 py-2 text-xs font-bold text-white"
            >
              {getDisplayColourName(
                selectedColour,
              )}
              <X size={14} />
            </button>
          )}

          {collectionFilter && (
            <button
              type="button"
              onClick={() => {
                setCollectionFilter("");

                const params =
                  new URLSearchParams(
                    searchParams.toString(),
                  );

                params.delete(
                  "collection",
                );

                const query =
                  params.toString();

                router.push(
                  query
                    ? `/shop?${query}`
                    : "/shop",
                );
              }}
              className="inline-flex items-center gap-2 rounded-full bg-[#922424] px-4 py-2 text-xs font-bold text-white"
            >
              {collectionFilter ===
              "new-arrivals"
                ? "New Arrivals"
                : "Our Bestsellers"}
              <X size={14} />
            </button>
          )}
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        {/* DESKTOP FILTERS */}
        <aside className="hidden rounded-2xl border border-slate-200 bg-white p-6 lg:block">
          {filterContent}
        </aside>

        {/* PRODUCTS */}
        <div className="min-w-0">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-900">
                  {
                    filteredProducts.length
                  }
                </span>{" "}
                {selectedColour
                  ? `${getDisplayColourName(
                      selectedColour,
                    )} ${
                      category !== "All"
                        ? `${category} `
                        : ""
                    }products`
                  : category !== "All"
                    ? `${category} products`
                    : "products"}
              </p>

              {selectedColour && (
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {getDisplayColourName(
                    selectedColour,
                  )} Scrubs
                </h2>
              )}
            </div>
          </div>

          {filteredProducts.length >
          0 ? (
            <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
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

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {selectedColour
                  ? `${getDisplayColourName(
                      selectedColour,
                    )} colour me selected category ka product available nahi hai.`
                  : "Search term ya selected filters change karke dekho."}
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-full bg-[#922424] px-6 py-3 text-sm font-bold text-white"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
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
              >
                <X size={22} />
              </button>
            </div>

            {filterContent}

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