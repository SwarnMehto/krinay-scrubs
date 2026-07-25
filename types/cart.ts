export type EmbroideryType =
  | "name"
  | "logo";

export type EmbroideryPlacement =
  | "left-chest"
  | "right-chest"
  | "left-sleeve"
  | "right-sleeve"
  | "other";

export interface CartEmbroidery {
  enabled: boolean;

  type: EmbroideryType;

  placement: EmbroideryPlacement;

  /**
   * Used when customer chooses Name / Text embroidery.
   * Example: "Dr. Rahul Sharma"
   */
  text: string;

  /**
   * Any additional customer instructions.
   * Example: "Use white thread"
   */
  instructions: string;

  /**
   * Original uploaded artwork filename.
   * Example: clinic-logo.png
   */
  fileName: string;

  /**
   * Cloudinary secure URL.
   * Raw File object cart/localStorage me save nahi hoga.
   */
  fileUrl: string;

  /**
   * Cloudinary public ID.
   * Future me artwork manage/delete karne ke kaam aa sakta hai.
   */
  publicId?: string;
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

  /**
   * Optional hai, isliye old normal scrub orders
   * bilkul same tarah work karenge.
   */
  embroidery?: CartEmbroidery;
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