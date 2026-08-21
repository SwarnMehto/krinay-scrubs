"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";

import ProductCard from "@/components/product/ProductCard";
import { products } from "@/data/products";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";

export default function WishlistPage() {
  const { productIds, hydrated } = useWishlist();
  const { user } = useAuth();

  const wishlistProducts = productIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is (typeof products)[number] => Boolean(product));

  return (
    <section className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#922424]">Saved for later</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Your Wishlist</h1>
            <p className="mt-3 text-sm text-slate-500">{wishlistProducts.length} saved {wishlistProducts.length === 1 ? "product" : "products"}</p>
          </div>
          {!user && (
            <Link href="/login?next=/wishlist" className="rounded-full border border-[#922424] px-5 py-3 text-sm font-black text-[#922424]">Login to sync across devices</Link>
          )}
        </div>

        {!hydrated ? (
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading wishlist...</div>
        ) : wishlistProducts.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff0f0] text-[#922424]"><Heart size={34} /></div>
            <h2 className="mt-6 text-2xl font-black text-slate-950">Your wishlist is empty</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">Add products to your wishlist to see them here.</p>
            <Link href="/shop" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#922424] px-6 py-3.5 text-sm font-black text-white"><ShoppingBag size={18} /> Explore Scrubs</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </section>
  );
}
