"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY = "krinay_wishlist_v1";

type WishlistContextValue = {
  productIds: string[];
  wishlistCount: number;
  hydrated: boolean;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<void>;
};

export const WishlistContext = createContext<WishlistContextValue | null>(null);

function readLocalWishlist() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [] as string[];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [] as string[];
    }

    return Array.from(
      new Set(parsed.filter((value): value is string => typeof value === "string")),
    );
  } catch {
    return [] as string[];
  }
}

export default function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const persistLocal = useCallback((ids: string[]) => {
    setProductIds(ids);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, []);

  useEffect(() => {
    const local = readLocalWishlist();
    setProductIds(local);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || authLoading || !user) {
      return;
    }

    let cancelled = false;

    async function syncWishlist() {
      try {
        const response = await fetch("/api/account/wishlist", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as {
          success: boolean;
          productIds?: string[];
        };

        if (!data.success || cancelled) {
          return;
        }

        const merged = Array.from(
          new Set([...(data.productIds ?? []), ...readLocalWishlist()]),
        );

        persistLocal(merged);

        await fetch("/api/account/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "set",
            productIds: merged,
          }),
        });
      } catch (error) {
        console.error("Wishlist sync failed:", error);
      }
    }

    void syncWishlist();

    return () => {
      cancelled = true;
    };
  }, [hydrated, authLoading, user, persistLocal]);

  const updateServer = useCallback(
    async (action: "add" | "remove", productId: string) => {
      if (!user) {
        return;
      }

      try {
        await fetch("/api/account/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
            productId,
          }),
        });
      } catch (error) {
        console.error("Wishlist server update failed:", error);
      }
    },
    [user],
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      const exists = productIds.includes(productId);
      const next = exists
        ? productIds.filter((id) => id !== productId)
        : [...productIds, productId];

      persistLocal(next);
      await updateServer(exists ? "remove" : "add", productId);

      return !exists;
    },
    [productIds, persistLocal, updateServer],
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      const next = productIds.filter((id) => id !== productId);
      persistLocal(next);
      await updateServer("remove", productId);
    },
    [productIds, persistLocal, updateServer],
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      productIds,
      wishlistCount: productIds.length,
      hydrated,
      isWishlisted: (productId: string) => productIds.includes(productId),
      toggleWishlist,
      removeFromWishlist,
    }),
    [productIds, hydrated, toggleWishlist, removeFromWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
