export type ProductCategory =
  | "Men"
  | "Women"
  | "Unisex"
  | "Lab Coats";

export type ProductGender = "Men" | "Women" | "Unisex";

export type ProductStyle =
  | "classic"
  | "jogger"
  | "cargo"
  | "v-neck";

export type ProductType = "scrub" | "lab-coat";

export type ProductReview = {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;

  category: ProductCategory;
  gender: ProductGender;
  style: ProductStyle;
  productType: ProductType;

  price: number;
  originalPrice?: number;

  rating: number;
  reviewCount: number;

  colors: string[];
  sizes: string[];

  badge?: string;
  image: string;
  images?: string[];

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