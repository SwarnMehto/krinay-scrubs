export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];

  addToCart: (item: CartItem) => void;

  removeFromCart: (productId: string, size: string, color: string) => void;

  increaseQuantity: (
    productId: string,
    size: string,
    color: string
  ) => void;

  decreaseQuantity: (
    productId: string,
    size: string,
    color: string
  ) => void;

  clearCart: () => void;

  cartCount: number;

  subtotal: number;
}
export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (
    productId: string,
    size: string,
    color: string,
  ) => void;
  increaseQuantity: (
    productId: string,
    size: string,
    color: string,
  ) => void;
  decreaseQuantity: (
    productId: string,
    size: string,
    color: string,
  ) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
}