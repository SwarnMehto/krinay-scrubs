export type ProductCategory = "Men" | "Women" | "Unisex" | "Lab Coats";

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
  shortDescription: string;
  description: string;
  features: string[];
  fabric: string;
  fit: string;
  careInstructions: string[];
  reviews: ProductReview[];
};