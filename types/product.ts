export type ProductCategory =
  | "Men"
  | "Women"
  | "Unisex"
  | "Lab Coats";

export type ProductGender =
  | "Men"
  | "Women"
  | "Unisex";

export type ProductStyle =
  | "classic"
  | "jogger"
  | "cargo"
  | "v-neck";

export type ProductType =
  | "scrub"
  | "lab-coat";

export type ProductReview = {
  id: string;

  customerName: string;

  rating: number;

  comment: string;

  date: string;
};

/*
 * New purchase mode for products
 * where customer can buy:
 * - complete set
 * - top only
 * - bottom only
 */
export type ScrubPurchaseType =
  | "set"
  | "top"
  | "bottom";

export type Product = {
  id: string;

  name: string;

  slug: string;

  category: ProductCategory;

  gender: ProductGender;

  style: ProductStyle;

  productType: ProductType;

  /*
   * Existing main price.
   *
   * For new scrub products:
   * price = complete set selling price
   */
  price: number;

  /*
   * Existing MRP.
   *
   * For new scrub products:
   * originalPrice = complete set MRP
   */
  originalPrice?: number;

  /*
   * =========================================
   * NEW SCRUB TOP / BOTTOM PRICING
   * =========================================
   *
   * Optional rakha hai so old products
   * without separate top/bottom pricing
   * continue working.
   */

  topPrice?: number;

  topOriginalPrice?: number;

  bottomPrice?: number;

  bottomOriginalPrice?: number;

  setPrice?: number;

  setOriginalPrice?: number;

  /*
   * Current launch discount.
   *
   * Example:
   * 15 = 15% OFF
   */
  discountPercent?: number;

  /*
   * true hone par product page:
   *
   * Complete Set
   * Top Only
   * Bottom Only
   *
   * options show kar sakta hai.
   */
  purchaseOptions?: boolean;

  rating: number;

  reviewCount: number;

  colors: string[];

  /*
   * Existing sizes field retained.
   *
   * Old products still use this.
   */
  sizes: string[];

  /*
   * New independent size lists.
   *
   * Example:
   * top = M
   * bottom = L
   */
  topSizes?: string[];

  bottomSizes?: string[];

  badge?: string;

  /*
   * Default image used on:
   * shop card
   * search
   * wishlist fallback
   */
  image: string;

  /*
   * Existing gallery support retained.
   */
  images?: string[];

  /*
   * =========================================
   * NEW COLOUR-SPECIFIC GALLERIES
   * =========================================
   *
   * Example:
   *
   * {
   *   "Airforce Blue": [
   *     "/images/.../01-full-front.jpg",
   *     "/images/.../02-full-back.jpg"
   *   ],
   *
   *   Black: [
   *     ...
   *   ]
   * }
   *
   * ProductDetailsClient selected colour
   * ke according gallery change karega.
   */
  colorImages?: Record<
    string,
    string[]
  >;

  inStock: boolean;

  stock: number;

  isNewArrival: boolean;

  isBestseller: boolean;

  featuredRank: number;

  createdAt: string;

  shortDescription: string;

  description: string;

  features: string[];

  fabric: string;

  fit: string;

  careInstructions: string[];

  tags?: string[];

  reviews: ProductReview[];
};