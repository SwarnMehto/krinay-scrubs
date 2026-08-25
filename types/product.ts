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
  | "v-neck"
  | "athletic"
  | "jogger"
  | "cargo"
  | "mandarin"
  | "ecoflex";

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
 * =========================================================
 * SCRUB PURCHASE TYPE
 * =========================================================
 *
 * Customer can purchase:
 *
 * - Complete Set
 * - Top Only
 * - Bottom Only
 */

export type ScrubPurchaseType =
  | "set"
  | "top"
  | "bottom";

/*
 * =========================================================
 * PRODUCT TYPE
 * =========================================================
 */

export type Product = {
  /*
   * -------------------------------------------------------
   * BASIC PRODUCT INFORMATION
   * -------------------------------------------------------
   */

  id: string;

  name: string;

  slug: string;

  category: ProductCategory;

  gender: ProductGender;

  /*
   * Product style examples:
   *
   * classic
   * v-neck
   * athletic
   * jogger
   * cargo
   * mandarin
   * ecoflex
   */

  style: ProductStyle;

  productType: ProductType;

  /*
   * -------------------------------------------------------
   * MAIN PRODUCT PRICING
   * -------------------------------------------------------
   *
   * For scrub products:
   *
   * price = Complete Set selling price
   */

  price: number;

  /*
   * MRP / original price
   */

  originalPrice?: number;

  /*
   * -------------------------------------------------------
   * SCRUB TOP / BOTTOM / SET PRICING
   * -------------------------------------------------------
   *
   * Optional fields so older products continue working.
   */

  topPrice?: number;

  topOriginalPrice?: number;

  bottomPrice?: number;

  bottomOriginalPrice?: number;

  setPrice?: number;

  setOriginalPrice?: number;

  /*
   * -------------------------------------------------------
   * DISCOUNT
   * -------------------------------------------------------
   *
   * Example:
   *
   * 15 = 15% OFF
   * 32 = 32% OFF
   */

  discountPercent?: number;

  /*
   * -------------------------------------------------------
   * PURCHASE OPTIONS
   * -------------------------------------------------------
   *
   * true:
   *
   * Complete Set
   * Top Only
   * Bottom Only
   *
   * options can be displayed on product page.
   */

  purchaseOptions?: boolean;

  /*
   * -------------------------------------------------------
   * PRODUCT RATING
   * -------------------------------------------------------
   */

  rating: number;

  reviewCount: number;

  /*
   * -------------------------------------------------------
   * COLOURS
   * -------------------------------------------------------
   */

  colors: string[];

  /*
   * -------------------------------------------------------
   * PRODUCT SIZES
   * -------------------------------------------------------
   *
   * Main/default sizes.
   */

  sizes: string[];

  /*
   * Independent Top and Bottom sizes.
   *
   * Example:
   *
   * Top = M
   * Bottom = L
   */

  topSizes?: string[];

  bottomSizes?: string[];

  /*
   * -------------------------------------------------------
   * PRODUCT BADGE
   * -------------------------------------------------------
   *
   * Examples:
   *
   * New
   * Bestseller
   * Limited
   */

  badge?: string;

  /*
   * -------------------------------------------------------
   * MAIN PRODUCT IMAGE
   * -------------------------------------------------------
   *
   * Used as fallback image on:
   *
   * Shop
   * Search
   * Wishlist
   * Product cards
   */

  image: string;

  /*
   * -------------------------------------------------------
   * PRODUCT IMAGE GALLERY
   * -------------------------------------------------------
   */

  images?: string[];

  /*
   * -------------------------------------------------------
   * COLOUR-SPECIFIC IMAGE GALLERIES
   * -------------------------------------------------------
   *
   * Example:
   *
   * colorImages: {
   *
   *   "Airforce Blue": [
   *     "/images/products/.../01-full-front.jpg",
   *     "/images/products/.../02-full-back.jpg",
   *   ],
   *
   *   "Royal Blue": [
   *     "/images/products/.../01-full-front.jpg",
   *     "/images/products/.../02-full-back.jpg",
   *   ],
   *
   *   Black: [
   *     "/images/products/.../01-full-front.jpg",
   *     "/images/products/.../02-full-back.jpg",
   *   ],
   * }
   */

  colorImages?: Record<string, string[]>;

  /*
   * -------------------------------------------------------
   * INVENTORY
   * -------------------------------------------------------
   */

  inStock: boolean;

  stock: number;

  /*
   * -------------------------------------------------------
   * COLLECTION FLAGS
   * -------------------------------------------------------
   *
   * Used for:
   *
   * /shop?collection=new-arrivals
   *
   * /shop?collection=bestsellers
   */

  isNewArrival: boolean;

  isBestseller: boolean;

  /*
   * Lower number can be used for higher featured priority.
   */

  featuredRank: number;

  /*
   * -------------------------------------------------------
   * CREATED DATE
   * -------------------------------------------------------
   *
   * Useful for newest sorting.
   *
   * Recommended format:
   *
   * YYYY-MM-DD
   */

  createdAt: string;

  /*
   * -------------------------------------------------------
   * PRODUCT DESCRIPTION
   * -------------------------------------------------------
   */

  shortDescription: string;

  description: string;

  /*
   * -------------------------------------------------------
   * PRODUCT FEATURES
   * -------------------------------------------------------
   */

  features: string[];

  /*
   * -------------------------------------------------------
   * FABRIC + FIT
   * -------------------------------------------------------
   */

  fabric: string;

  fit: string;

  /*
   * -------------------------------------------------------
   * CARE INSTRUCTIONS
   * -------------------------------------------------------
   */

  careInstructions: string[];

  /*
   * -------------------------------------------------------
   * SEARCH / SEO TAGS
   * -------------------------------------------------------
   */

  tags?: string[];

  /*
   * -------------------------------------------------------
   * REVIEWS
   * -------------------------------------------------------
   */

  reviews: ProductReview[];
};