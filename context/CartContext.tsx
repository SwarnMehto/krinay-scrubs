"use client";

import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartContextType, CartItem } from "@/types/cart";

export const CartContext = createContext<CartContextType | undefined>(
  undefined,
);

const CART_STORAGE_KEY = "krinay-cart";

type CartProviderProps = {
  children: ReactNode;
};

function isSameCartItem(firstItem: CartItem, secondItem: CartItem) {
  return (
    firstItem.productId === secondItem.productId &&
    firstItem.size === secondItem.size &&
    firstItem.color === secondItem.color
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
          setCart(parsedCart);
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
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          !(
            item.productId === productId &&
            item.size === size &&
            item.color === color
          ),
      ),
    );
  };

  const increaseQuantity = (
    productId: string,
    size: string,
    color: string,
  ) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.productId === productId &&
        item.size === size &&
        item.color === color
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  const decreaseQuantity = (
    productId: string,
    size: string,
    color: string,
  ) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.productId === productId &&
          item.size === size &&
          item.color === color
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
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