export type EmbroideryType =
  | "name"
  | "logo";

export type EmbroideryMode =
  | "bundle"
  | "top"
  | "bottom";

export type EmbroideryPlacement =
  | "top"
  | "bottom"
  | "left-chest"
  | "right-chest"
  | "left-sleeve"
  | "right-sleeve"
  | "other";

export type EmbroideryFont =
  | "block"
  | "script";

export type EmbroideryTextColor =
  | "white"
  | "black"
  | "gold"
  | "grey"
  | "lime"
  | "pink";

/*
 * New scrub purchase mode.
 *
 * set    = top + bottom
 * top    = top only
 * bottom = bottom only
 */
export type ScrubPurchaseType =
  | "set"
  | "top"
  | "bottom";

export interface CartEmbroidery {
  enabled: true;

  mode: EmbroideryMode;

  placement: EmbroideryPlacement;

  line1: string;

  line2: string;

  font: EmbroideryFont;

  textColor: EmbroideryTextColor;

  addBottomName: boolean;

  selectedIconId: string;

  selectedIconLabel: string;

  selectedIconSymbol: string;

  fileName: string;

  fileUrl: string;

  publicId?: string;

  basePrice: number;

  logoPrice: number;

  bottomNamePrice: number;

  /**
   * Total embroidery charge per scrub unit.
   */
  price: number;

  /**
   * Backward-compatible fields from
   * the earlier embroidery flow.
   */
  type?: EmbroideryType;

  text?: string;

  instructions?: string;
}

export interface CartItem {
  /**
   * Unique cart-line ID.
   *
   * Same product / colour / size can exist
   * multiple times when:
   *
   * - embroidery is different
   * - top/bottom purchase type is different
   * - top/bottom sizes are different
   */
  cartKey?: string;

  productId: string;

  name: string;

  slug: string;

  image: string;

  /**
   * Final per-unit selling price.
   *
   * Product price
   * + XXL surcharge if applicable
   * + embroidery
   */
  price: number;

  /**
   * Selling price before embroidery.
   *
   * Includes XXL surcharge when applicable.
   */
  basePrice?: number;

  /**
   * XXL size surcharge.
   *
   * Complete Set:
   * Top OR Bottom XXL = +₹150
   *
   * Bottom Only:
   * XXL = +₹90
   *
   * Top Only:
   * XXL = +₹0
   */
  sizeSurcharge?: number;

  /**
   * Existing field retained for
   * backward compatibility.
   *
   * Old item:
   * "M"
   *
   * Complete scrub set:
   * "Top M / Bottom L"
   */
  size: string;

  color: string;

  quantity: number;

  /*
   * =====================================
   * NEW TOP / BOTTOM PURCHASE DATA
   * =====================================
   */

  /**
   * Complete set / top only / bottom only.
   *
   * Optional so existing products
   * continue working.
   */
  purchaseType?: ScrubPurchaseType;

  /**
   * Selected scrub top size.
   *
   * Example:
   * "M"
   */
  topSize?: string;

  /**
   * Selected scrub bottom size.
   *
   * Example:
   * "L"
   */
  bottomSize?: string;

  /**
   * Original MRP before discount.
   */
  mrp?: number;

  /**
   * Discount percentage shown to
   * customer.
   */
  discountPercent?: number;

  /**
   * Optional explicit discount amount.
   */
  discountAmount?: number;

  /**
   * Embroidery configuration.
   *
   * Existing embroidery system remains
   * fully supported.
   */
  embroidery?: CartEmbroidery;
}

export interface CartContextType {
  cart: CartItem[];

  addToCart: (
    item: CartItem,
  ) => void;

  removeFromCart: (
    productId: string,
    size: string,
    color: string,
    cartKey?: string,
  ) => void;

  increaseQuantity: (
    productId: string,
    size: string,
    color: string,
    cartKey?: string,
  ) => void;

  decreaseQuantity: (
    productId: string,
    size: string,
    color: string,
    cartKey?: string,
  ) => void;

  clearCart: () => void;

  cartCount: number;

  subtotal: number;
}