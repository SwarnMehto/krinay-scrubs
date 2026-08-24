"use client";

import {
  ChevronDown,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import CollectionProductCard from "@/components/product/CollectionProductCard";

import type {
  Product,
  ProductGender,
} from "@/types/product";

type Props = {
  products: Product[];

  gender: Extract<
    ProductGender,
    "Men" | "Women"
  >;
};

type SortOption =
  | "featured"
  | "popular"
  | "price-low"
  | "price-high"
  | "az"
  | "za"
  | "newest"
  | "oldest";

const categories = [
  "Scrubs",
  "Lab Coats",
  "DRIFT Jacket",
  "Underscrubs",
];

const fabricTechnologies = [
  "Classic Scrubs",
  "Athletic Scrubs",
  "Ecoflex Lite Scrubs",
  "Ecoflex Scrubs",
  "Fleece",
];

const womenStyles = [
  "Hijab",
  "6sense",
  "6sense Lite",
  "DRIFT Jacket",
  "Joggers",
  "Long Sleeves",
  "Mandarin Collar",
  "Nurse Scrub",
  "Short Sleeves",
  "V-neck",
];

const menStyles = [
  "6sense",
  "6sense Lite",
  "DRIFT Jacket",
  "Joggers",
  "Long Sleeves",
  "Mandarin Collar",
  "Short Sleeves",
  "V-neck",
];

const colours = [
  {
    name: "Airforce Blue",
    hex: "#607d9d",
  },

  {
    name: "Black",
    hex: "#111827",
  },

  {
    name: "Royal Blue",
    hex: "#1265d8",
  },

  {
    name: "Navy",
    hex: "#082f59",
  },

  {
    name: "Wine",
    hex: "#5f263d",
  },

  {
    name: "Forest Green",
    hex: "#426650",
  },

  {
    name: "Ceil Blue",
    hex: "#74b8e3",
  },

  {
    name: "Heather Grey",
    hex: "#64748b",
  },

  {
    name: "Galaxy Blue",
    hex: "#0668b8",
  },

  {
    name: "Olive",
    hex: "#6b806b",
  },

  {
    name: "Steel Grey",
    hex: "#555b66",
  },

  {
    name: "Pastel Lilac",
    hex: "#bca8df",
  },

  {
    name: "Eucalyptus",
    hex: "#789a8f",
  },

  {
    name: "Maroon",
    hex: "#811f2c",
  },
];

const pockets = [
  "5 Pockets",
  "8 Pockets",
  "10 Pockets",
];

export default function GenderCollectionClient({
  products,
  gender,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [sort, setSort] =
    useState<SortOption>(
      "featured",
    );

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("Scrubs");

  const [
    selectedFabric,
    setSelectedFabric,
  ] = useState<string[]>([]);

  const [
    selectedStyles,
    setSelectedStyles,
  ] = useState<string[]>([]);

  const [
    selectedColours,
    setSelectedColours,
  ] = useState<string[]>([]);

  const [
    selectedPockets,
    setSelectedPockets,
  ] = useState<string[]>([]);

  const [
    mobileFilters,
    setMobileFilters,
  ] = useState(false);

  const styles =
    gender === "Women"
      ? womenStyles
      : menStyles;

  /*
   * =========================================
   * ONLY CORRECT GENDER
   * =========================================
   */

  const genderProducts =
    useMemo(() => {
      return products.filter(
        (product) =>
          product.gender ===
            gender &&
          product.productType ===
            "scrub",
      );
    }, [products, gender]);

  /*
   * =========================================
   * FILTERS
   * =========================================
   */

  const filteredProducts =
    useMemo(() => {
      let list = [
        ...genderProducts,
      ];

      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      if (normalizedSearch) {
        list = list.filter(
          (product) =>
            product.name
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            product.colors.some(
              (colour) =>
                colour
                  .toLowerCase()
                  .includes(
                    normalizedSearch,
                  ),
            ) ||
            product.tags?.some(
              (tag) =>
                tag
                  .toLowerCase()
                  .includes(
                    normalizedSearch,
                  ),
            ),
        );
      }

      /*
       * Colours
       */

      if (
        selectedColours.length >
        0
      ) {
        list = list.filter(
          (product) =>
            selectedColours.some(
              (colour) =>
                product.colors.includes(
                  colour,
                ),
            ),
        );
      }

      /*
       * Style
       *
       * Works through product.style
       * and tags.
       */

      if (
        selectedStyles.length >
        0
      ) {
        list = list.filter(
          (product) => {
            const searchable = [
              product.style,
              ...(product.tags ??
                []),
            ]
              .join(" ")
              .toLowerCase();

            return selectedStyles.some(
              (style) =>
                searchable.includes(
                  style.toLowerCase(),
                ),
            );
          },
        );
      }

      /*
       * Fabric Technology
       */

      if (
        selectedFabric.length >
        0
      ) {
        list = list.filter(
          (product) => {
            const searchable = [
              product.fabric,
              ...(product.tags ??
                []),
            ]
              .join(" ")
              .toLowerCase();

            return selectedFabric.some(
              (fabric) =>
                searchable.includes(
                  fabric.toLowerCase(),
                ),
            );
          },
        );
      }

      /*
       * Pockets from tags/features.
       */

      if (
        selectedPockets.length >
        0
      ) {
        list = list.filter(
          (product) => {
            const searchable = [
              ...product.features,
              ...(product.tags ??
                []),
            ]
              .join(" ")
              .toLowerCase();

            return selectedPockets.some(
              (value) =>
                searchable.includes(
                  value.toLowerCase(),
                ),
            );
          },
        );
      }

      /*
       * SORT
       */

      list.sort((a, b) => {
        if (
          sort === "price-low"
        ) {
          return (
            (a.setPrice ??
              a.price) -
            (b.setPrice ??
              b.price)
          );
        }

        if (
          sort === "price-high"
        ) {
          return (
            (b.setPrice ??
              b.price) -
            (a.setPrice ??
              a.price)
          );
        }

        if (sort === "az") {
          return a.name.localeCompare(
            b.name,
          );
        }

        if (sort === "za") {
          return b.name.localeCompare(
            a.name,
          );
        }

        if (
          sort === "newest"
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

        if (
          sort === "oldest"
        ) {
          return (
            new Date(
              a.createdAt,
            ).getTime() -
            new Date(
              b.createdAt,
            ).getTime()
          );
        }

        if (
          sort === "popular"
        ) {
          return (
            b.reviewCount -
            a.reviewCount
          );
        }

        return (
          a.featuredRank -
          b.featuredRank
        );
      });

      return list;
    }, [
      genderProducts,
      search,
      sort,
      selectedColours,
      selectedStyles,
      selectedFabric,
      selectedPockets,
    ]);

  function toggleValue(
    value: string,
    setter: React.Dispatch<
      React.SetStateAction<
        string[]
      >
    >,
  ) {
    setter((current) =>
      current.includes(value)
        ? current.filter(
            (item) =>
              item !== value,
          )
        : [
            ...current,
            value,
          ],
    );
  }

  const filterSidebar = (
    <div>
      {/* GENDER */}

      <FilterHeading>
        Gender
      </FilterHeading>

      <div className="space-y-3">
        <FilterCheckbox
          label="Women"
          checked={
            gender === "Women"
          }
          disabled
        />

        <FilterCheckbox
          label="Men"
          checked={
            gender === "Men"
          }
          disabled
        />
      </div>

      {/* CATEGORY */}

      <FilterHeading>
        Category
      </FilterHeading>

      <div className="space-y-3">
        {categories.map(
          (category) => (
            <FilterCheckbox
              key={category}
              label={category}
              checked={
                selectedCategory ===
                category
              }
              onChange={() =>
                setSelectedCategory(
                  category,
                )
              }
            />
          ),
        )}
      </div>

      {/* FABRIC */}

      <FilterHeading>
        Fabric Technology
      </FilterHeading>

      <div className="space-y-3">
        {fabricTechnologies.map(
          (item) => (
            <FilterCheckbox
              key={item}
              label={item}
              checked={selectedFabric.includes(
                item,
              )}
              onChange={() =>
                toggleValue(
                  item,
                  setSelectedFabric,
                )
              }
            />
          ),
        )}
      </div>

      {/* STYLE */}

      <FilterHeading>
        Style
      </FilterHeading>

      <div className="space-y-3">
        {styles.map(
          (style) => (
            <FilterCheckbox
              key={style}
              label={style}
              checked={selectedStyles.includes(
                style,
              )}
              onChange={() =>
                toggleValue(
                  style,
                  setSelectedStyles,
                )
              }
            />
          ),
        )}
      </div>

      {/* COLOUR */}

      <FilterHeading>
        Colour
      </FilterHeading>

      <div className="space-y-3">
        {colours.map(
          (colour) => (
            <label
              key={
                colour.name
              }
              className="flex cursor-pointer items-center justify-between gap-3 text-sm"
            >
              <span className="flex items-center gap-3">
                <span
                  className="h-4 w-4 rounded-full border border-slate-300"
                  style={{
                    backgroundColor:
                      colour.hex,
                  }}
                />

                {
                  colour.name
                }
              </span>

              <input
                type="checkbox"
                checked={selectedColours.includes(
                  colour.name,
                )}
                onChange={() =>
                  toggleValue(
                    colour.name,
                    setSelectedColours,
                  )
                }
                className="h-5 w-5 accent-[#922424]"
              />
            </label>
          ),
        )}
      </div>

      {/* POCKETS */}

      <FilterHeading>
        Pockets
      </FilterHeading>

      <div className="space-y-3">
        {pockets.map(
          (item) => (
            <FilterCheckbox
              key={item}
              label={item}
              checked={selectedPockets.includes(
                item,
              )}
              onChange={() =>
                toggleValue(
                  item,
                  setSelectedPockets,
                )
              }
            />
          ),
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* =============================
          CATEGORY BUTTONS
      ============================= */}

      <div className="mx-auto max-w-[1240px] px-4 pt-10 sm:px-6">
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    item,
                  )
                }
                className={`rounded-lg border px-6 py-2.5 text-sm font-medium transition ${
                  selectedCategory ===
                  item
                    ? "border-[#922424] bg-[#922424] text-white"
                    : "border-[#922424] bg-white text-slate-900 hover:bg-[#fff5f5]"
                }`}
              >
                {item}
              </button>
            ),
          )}
        </div>
      </div>

      {/* =============================
          SEARCH MOBILE
      ============================= */}

      <div className="mx-auto mt-8 flex max-w-[1240px] gap-3 px-4 sm:px-6 lg:hidden">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value,
              )
            }
            placeholder="Search products"
            className="w-full rounded-lg border py-3 pl-10 pr-3 text-sm"
          />
        </div>

        <button
          onClick={() =>
            setMobileFilters(
              true,
            )
          }
          className="rounded-lg border px-4"
        >
          <SlidersHorizontal
            size={19}
          />
        </button>
      </div>

      {/* =============================
          MAIN
      ============================= */}

      <section className="mx-auto grid max-w-[1240px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[170px_1fr]">
        {/* FILTER */}

        <aside className="hidden lg:block">
          <h2 className="mb-5 text-2xl font-semibold">
            Filters
          </h2>

          {filterSidebar}
        </aside>

        {/* PRODUCTS */}

        <div>
          {/* SORT BAR */}

          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <p className="text-sm text-slate-600">
              {
                filteredProducts.length
              }{" "}
              items
            </p>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) =>
                  setSort(
                    e.target
                      .value as SortOption,
                  )
                }
                className="appearance-none bg-transparent py-2 pl-3 pr-9 text-sm font-semibold uppercase tracking-[0.1em] outline-none"
              >
                <option value="featured">
                  Sort By: Featured
                </option>

                <option value="popular">
                  Most Popular
                </option>

                <option value="az">
                  Alphabetically,
                  A-Z
                </option>

                <option value="za">
                  Alphabetically,
                  Z-A
                </option>

                <option value="price-low">
                  Price, low to
                  high
                </option>

                <option value="price-high">
                  Price, high to
                  low
                </option>

                <option value="oldest">
                  Date, old to
                  new
                </option>

                <option value="newest">
                  Date, new to
                  old
                </option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
              />
            </div>
          </div>

          {/* PRODUCT GRID */}

          {filteredProducts.length >
          0 ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
  {filteredProducts.map((product) => (
    <CollectionProductCard
      key={product.id}
      product={product}
    />
  ))}
</div>
          ) : (
            <div className="flex min-h-[350px] items-center justify-center border border-dashed border-slate-300">
              <div className="text-center">
                <p className="text-xl font-semibold">
                  No products
                  found
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Selected filters
                  change karke
                  dekho.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =============================
          MOBILE FILTER
      ============================= */}

      {mobileFilters && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            onClick={() =>
              setMobileFilters(
                false,
              )
            }
            className="absolute inset-0 bg-black/40"
          />

          <div className="absolute left-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Filters
              </h2>

              <button
                onClick={() =>
                  setMobileFilters(
                    false,
                  )
                }
              >
                <X size={23} />
              </button>
            </div>

            {filterSidebar}
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================
   SMALL COMPONENTS
========================================= */

function FilterHeading({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="mb-4 mt-7 flex items-center justify-between border-t border-slate-200 pt-5">
      <h3 className="text-[15px] font-semibold uppercase tracking-[0.12em]">
        {children}
      </h3>

      <ChevronDown
        size={15}
      />
    </div>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;

  checked: boolean;

  onChange?: () => void;

  disabled?: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span>
        {label}
      </span>

      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={
          onChange
        }
        className="h-5 w-5 accent-[#922424]"
      />
    </label>
  );
}