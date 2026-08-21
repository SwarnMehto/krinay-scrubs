import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { products } from "@/data/products";

type GenderSlug = "men" | "women";

type CategoryPageProps = {
  params: Promise<{
    gender: string;
  }>;

  searchParams: Promise<{
    style?: string;
    color?: string;
    size?: string;
    sort?: string;
  }>;
};

const categoryDetails: Record<
  GenderSlug,
  {
    title: string;
    categoryName: "Men" | "Women";
    description: string;
    styles: Array<{
      name: string;
      value: string;
    }>;
  }
> = {
  women: {
    title: "Women’s Medical Scrubs",
    categoryName: "Women",
    description:
      "Explore comfortable and professional women’s scrub sets designed for long healthcare shifts.",
    styles: [
      { name: "All Women Scrubs", value: "all" },
      { name: "Classic Scrubs", value: "classic" },
      { name: "Jogger Scrubs", value: "jogger" },
      { name: "V-Neck Scrubs", value: "v-neck" },
    ],
  },

  men: {
    title: "Men’s Medical Scrubs",
    categoryName: "Men",
    description:
      "Explore practical and professional men’s scrub sets with comfortable fits and functional pockets.",
    styles: [
      { name: "All Men Scrubs", value: "all" },
      { name: "Classic Scrubs", value: "classic" },
      { name: "Cargo Scrubs", value: "cargo" },
      { name: "V-Neck Scrubs", value: "v-neck" },
    ],
  },
};

function isGenderSlug(value: string): value is GenderSlug {
  return value === "men" || value === "women";
}

function normalizeValue(value?: string) {
  if (!value) return "";

  return decodeURIComponent(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function productMatchesStyle(
  productName: string,
  productSlug: string,
  style?: string,
) {
  const normalizedStyle = normalizeValue(style);

  if (!normalizedStyle || normalizedStyle === "all") {
    return true;
  }

  const searchableProductText = `${productName} ${productSlug}`
    .toLowerCase()
    .replace(/\s+/g, "-");

  return searchableProductText.includes(normalizedStyle);
}

function productMatchesColor(
  productColors: string[],
  requestedColor?: string,
) {
  if (!requestedColor) {
    return true;
  }

  const normalizedRequestedColor = decodeURIComponent(requestedColor)
    .trim()
    .toLowerCase();

  return productColors.some((productColor) => {
    const normalizedProductColor = productColor.trim().toLowerCase();

    return (
      normalizedProductColor === normalizedRequestedColor ||
      normalizedProductColor.includes(normalizedRequestedColor) ||
      normalizedRequestedColor.includes(normalizedProductColor)
    );
  });
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { gender } = await params;

  if (!isGenderSlug(gender)) {
    return {
      title: "Scrub Category Not Found",
    };
  }

  const details = categoryDetails[gender];

  return {
    title: details.title,
    description: details.description,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { gender } = await params;
  const filters = await searchParams;

  if (!isGenderSlug(gender)) {
    notFound();
  }

  const details = categoryDetails[gender];

  const selectedStyle = normalizeValue(filters.style) || "all";
  const selectedColor = filters.color
    ? decodeURIComponent(filters.color)
    : "";
  const selectedSize = filters.size
    ? decodeURIComponent(filters.size).toUpperCase()
    : "";
  const selectedSort = filters.sort ?? "featured";

  const filteredProducts = products
    .filter((product) => product.category === details.categoryName)
    .filter((product) =>
      productMatchesStyle(product.name, product.slug, selectedStyle),
    )
    .filter((product) =>
      productMatchesColor(product.colors, selectedColor),
    )
    .filter((product) => {
      if (!selectedSize) {
        return true;
      }

      return product.sizes.includes(selectedSize);
    })
    .sort((firstProduct, secondProduct) => {
      if (selectedSort === "price-low") {
        return firstProduct.price - secondProduct.price;
      }

      if (selectedSort === "price-high") {
        return secondProduct.price - firstProduct.price;
      }

      if (selectedSort === "rating") {
        return secondProduct.rating - firstProduct.rating;
      }

      if (selectedSort === "newest") {
        return Number(secondProduct.id) - Number(firstProduct.id);
      }

      return 0;
    });

  return (
    <>
      <section className="bg-[#922424] px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="text-sm text-white/70">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>

            <span className="mx-2">/</span>

            <Link href="/shop" className="transition hover:text-white">
              Shop
            </Link>

            <span className="mx-2">/</span>

            <span className="text-white">
              {gender === "women" ? "Women" : "Men"}
            </span>
          </nav>

          <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-white/75">
            Krinay Scrubs Collection
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            {details.title}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
            {details.description}
          </p>
        </div>
      </section>

      <section className="border-b border-[#eadada] bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto pb-1">
          {details.styles.map((style) => {
            const isActive = selectedStyle === style.value;

            const href =
              style.value === "all"
                ? `/category/${gender}`
                : `/category/${gender}?style=${style.value}`;

            return (
              <Link
                key={style.value}
                href={href}
                className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-bold transition ${
                  isActive
                    ? "border-[#922424] bg-[#922424] text-white"
                    : "border-[#decaca] bg-white text-black hover:border-[#922424] hover:text-[#922424]"
                }`}
              >
                {style.name}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-[#fffafa] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 border-b border-[#eadada] pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-black/55">
                Showing{" "}
                <span className="font-black text-black">
                  {filteredProducts.length}
                </span>{" "}
                products
              </p>

              {(selectedColor || selectedSize) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedColor && (
                    <span className="rounded-full bg-[#f5dddd] px-4 py-2 text-xs font-bold text-[#922424]">
                      Colour: {selectedColor}
                    </span>
                  )}

                  {selectedSize && (
                    <span className="rounded-full bg-[#f5dddd] px-4 py-2 text-xs font-bold text-[#922424]">
                      Size: {selectedSize}
                    </span>
                  )}

                  <Link
                    href={`/category/${gender}`}
                    className="rounded-full border border-[#decaca] bg-white px-4 py-2 text-xs font-bold text-black transition hover:border-[#922424] hover:text-[#922424]"
                  >
                    Clear Filters
                  </Link>
                </div>
              )}
            </div>

            <form method="GET">
              {selectedStyle !== "all" && (
                <input
                  type="hidden"
                  name="style"
                  value={selectedStyle}
                />
              )}

              {selectedColor && (
                <input
                  type="hidden"
                  name="color"
                  value={selectedColor}
                />
              )}

              {selectedSize && (
                <input
                  type="hidden"
                  name="size"
                  value={selectedSize}
                />
              )}

              <select
                name="sort"
                defaultValue={selectedSort}
                className="rounded-full border border-[#decaca] bg-white px-5 py-3 text-sm font-bold text-black outline-none focus:border-[#922424]"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <button
                type="submit"
                className="ml-2 rounded-full bg-[#922424] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#701a1a]"
              >
                Apply
              </button>
            </form>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="mt-9 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-dashed border-[#d9bebe] bg-white px-6 py-20 text-center">
              <div className="text-5xl">🥼</div>

              <h2 className="mt-5 text-2xl font-black text-black">
                No matching scrubs found
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-black/55">
                Is category ya selected filter me abhi koi product available
                nahi hai.
              </p>

              <Link
                href={`/category/${gender}`}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#922424] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#701a1a]"
              >
                View All {gender === "women" ? "Women" : "Men"} Scrubs
                <ArrowRight size={17} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}