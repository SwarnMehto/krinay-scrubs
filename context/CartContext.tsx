"use client";

import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartContextType, CartItem } from "@/types/cart";
import { products } from "@/data/products";
import { trackEvent } from "@/lib/fbpixel";
import { getScrubSizeSurcharge } from "@/lib/size-pricing";
export const CartContext = createContext<CartContextType | undefined>(
  undefined,
);

const CART_STORAGE_KEY = "krinay-cart";

function normalizeCartItemSizePrice(item: CartItem): CartItem {
  const product = products.find(
    (catalogProduct) => catalogProduct.id === item.productId,
  );
  if (product?.productType !== "scrub") {
    return item;
  }

  const selectedSizes =
    item.purchaseType === "set"
      ? [item.topSize, item.bottomSize]
      : item.purchaseType === "top"
        ? [item.topSize || item.size]
        : item.purchaseType === "bottom"
          ? [item.bottomSize || item.size]
          : [item.size];
  const sizeSurcharge = getScrubSizeSurcharge(
    product.productType,
    ...selectedSizes,
  );
  const previousSurcharge = item.sizeSurcharge ?? 0;
  if (previousSurcharge === sizeSurcharge) {
    return item;
  }

  const embroideryPrice = item.embroidery?.enabled
    ? item.embroidery.price
    : 0;
  const previousBasePrice =
    item.basePrice ?? Math.max(item.price - embroideryPrice, 0);
  const basePrice = Math.max(
    previousBasePrice - previousSurcharge + sizeSurcharge,
    0,
  );

  return {
    ...item,
    basePrice,
    price: basePrice + embroideryPrice,
    sizeSurcharge,
  };
}

type CartProviderProps = {
  children: ReactNode;
};

function isSameCartItem(firstItem: CartItem, secondItem: CartItem) {
  /*
   * cartKey is the strongest identity because it also contains
   * embroidery configuration in the product page.
   */
  if (firstItem.cartKey || secondItem.cartKey) {
    return Boolean(
      firstItem.cartKey &&
        secondItem.cartKey &&
        firstItem.cartKey === secondItem.cartKey,
    );
  }

  /*
   * Backward-compatible fallback for old/localStorage cart items.
   *
   * purchaseType + topSize + bottomSize are included so:
   * - Top M
   * - Bottom M
   * - Set Top M / Bottom L
   *
   * never merge into the same cart line.
   */
  return (
    firstItem.productId === secondItem.productId &&
    firstItem.size === secondItem.size &&
    firstItem.color === secondItem.color &&
    (firstItem.purchaseType ?? "") ===
      (secondItem.purchaseType ?? "") &&
    (firstItem.topSize ?? "") ===
      (secondItem.topSize ?? "") &&
    (firstItem.bottomSize ?? "") ===
      (secondItem.bottomSize ?? "")
  );
}

export default function CartProvider({
  children,
}: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart.map(normalizeCartItemSizePrice));
        }
      }
    } catch (error) {
      console.error("Cart load error:", error);
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart),
      );
    } catch (error) {
      console.error("Cart save error:", error);
    }
  }, [cart, isLoaded]);

  const addToCart = (item: CartItem) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((cartItem) =>
        isSameCartItem(cartItem, item),
      );

      if (existingItem) {
        return currentCart.map((cartItem) =>
          isSameCartItem(cartItem, item)
            ? {
                ...cartItem,
                price: item.price,
                basePrice: item.basePrice,
                sizeSurcharge: item.sizeSurcharge,
                mrp: item.mrp,
                discountPercent: item.discountPercent,
                discountAmount: item.discountAmount,
                quantity: cartItem.quantity + item.quantity,
              }
            : cartItem,
        );
      }

      return [...currentCart, item];
    });
  };

  const removeFromCart = (
    productId: string,
    size: string,
    color: string,
    cartKey?: string,
  ) => {
    setCart((currentCart) =>
      currentCart.filter((item) => {
        if (cartKey) {
          return item.cartKey !== cartKey;
        }

        return !(
          item.productId === productId &&
          item.size === size &&
          item.color === color
        );
      }),
    );
  };

  const increaseQuantity = (
    productId: string,
    size: string,
    color: string,
    cartKey?: string,
  ) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        const matches = cartKey
          ? item.cartKey === cartKey
          : item.productId === productId &&
            item.size === size &&
            item.color === color;

        return matches
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item;
      }),
    );
  };

  const decreaseQuantity = (
    productId: string,
    size: string,
    color: string,
    cartKey?: string,
  ) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          const matches = cartKey
            ? item.cartKey === cartKey
            : item.productId === productId &&
              item.size === size &&
              item.color === color;

          return matches
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.quantity,
      0,
    );
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }, [cart]);

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    cartCount,
    subtotal,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}