import type { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "1",
    name: "Classic V-Neck Medical Scrub Set",
    slug: "classic-v-neck-medical-scrub-set",

    category: "Unisex",
    gender: "Unisex",
    style: "v-neck",
    productType: "scrub",

    price: 1499,
    originalPrice: 1899,

    rating: 4.8,
    reviewCount: 36,

    colors: ["Navy Blue", "Sky Blue", "Black"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],

    badge: "Bestseller",
    image: "/images/products/classic-v-neck.jpg",
    images: [
      "/images/products/classic-v-neck.jpg",
      "/images/products/classic-v-neck-back.jpg",
      "/images/products/classic-v-neck-detail.jpg",
    ],

    inStock: true,
    stock: 24,

    isNewArrival: false,
    isBestseller: true,
    featuredRank: 1,
    createdAt: "2026-06-20",

    shortDescription:
      "A comfortable and practical V-neck scrub set designed for long healthcare shifts.",

    description:
      "The Classic V-Neck Medical Scrub Set combines professional styling with everyday comfort. It includes a practical V-neck scrub top and matching trousers with functional pockets.",

    features: [
      "Comfortable V-neck scrub top",
      "Multiple utility pockets",
      "Breathable fabric",
      "Suitable for long shifts",
      "Professional unisex fit",
    ],

    fabric: "Poly-cotton stretch fabric",
    fit: "Regular unisex fit",

    careInstructions: [
      "Machine wash with similar colours",
      "Use mild detergent",
      "Do not bleach",
      "Iron at low temperature",
    ],

    tags: [
      "doctor scrubs",
      "nurse scrubs",
      "v-neck",
      "unisex scrubs",
    ],

    reviews: [
      {
        id: "review-1",
        customerName: "Dr. Riya",
        rating: 5,
        comment:
          "The fabric is comfortable and the fitting is perfect for long hospital shifts.",
        date: "5 July 2026",
      },
      {
        id: "review-2",
        customerName: "Aman Verma",
        rating: 4,
        comment:
          "Good quality scrub set with useful pockets. Delivery was also quick.",
        date: "28 June 2026",
      },
    ],
  },

  {
    id: "2",
    name: "Women’s Modern Fit Scrub Set",
    slug: "womens-modern-fit-scrub-set",

    category: "Women",
    gender: "Women",
    style: "classic",
    productType: "scrub",

    /*
     * Complete-set launch price.
     * ₹1,699 MRP → 15% OFF → ₹1,444.
     */
    price: 1444,
    originalPrice: 1699,

    /*
     * Top / Bottom independent purchase pricing.
     */
    topPrice: 722,
    topOriginalPrice: 849,

    bottomPrice: 723,
    bottomOriginalPrice: 850,

    setPrice: 1444,
    setOriginalPrice: 1699,

    discountPercent: 15,
    purchaseOptions: true,

    rating: 4.7,
    reviewCount: 24,

    colors: [
      "Airforce Blue",
      "Black",
      "Royal Blue",
    ],

    sizes: [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ],

    topSizes: [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ],

    bottomSizes: [
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ],

    badge: "New",

    /*
     * Default shop/product-card image.
     */
    image:
      "/images/products/scrubs/women/airforce-blue/01-full-front.jpg",

    /*
     * Existing images field retained for compatibility.
     */
    images: [
      "/images/products/scrubs/women/airforce-blue/01-full-front.jpg",
      "/images/products/scrubs/women/airforce-blue/02-full-back.jpg",
      "/images/products/scrubs/women/airforce-blue/03-top-front.jpg",
      "/images/products/scrubs/women/airforce-blue/04-top-back.jpg",
      "/images/products/scrubs/women/airforce-blue/05-top-pocket.jpg",
      "/images/products/scrubs/women/airforce-blue/06-top-neck.jpg",
      "/images/products/scrubs/women/airforce-blue/07-bottom-front.jpg",
      "/images/products/scrubs/women/airforce-blue/09-bottom-pocket.jpg",
      "/images/products/scrubs/women/airforce-blue/10-fabric-detail.jpg",
    ],

    /*
     * Colour-wise product galleries.
     */
    colorImages: {
      "Airforce Blue": [
        "/images/products/scrubs/women/airforce-blue/01-full-front.jpg",
        "/images/products/scrubs/women/airforce-blue/02-full-back.jpg",
        "/images/products/scrubs/women/airforce-blue/03-top-front.jpg",
        "/images/products/scrubs/women/airforce-blue/04-top-back.jpg",
        "/images/products/scrubs/women/airforce-blue/05-top-pocket.jpg",
        "/images/products/scrubs/women/airforce-blue/06-top-neck.jpg",
        "/images/products/scrubs/women/airforce-blue/07-bottom-front.jpg",
        "/images/products/scrubs/women/airforce-blue/09-bottom-pocket.jpg",
        "/images/products/scrubs/women/airforce-blue/10-fabric-detail.jpg",
      ],

      Black: [
        "/images/products/scrubs/women/black/01-full-front.jpg",
        "/images/products/scrubs/women/black/02-full-back.jpg",
        "/images/products/scrubs/women/black/03-top-front.jpg",
        "/images/products/scrubs/women/black/05-top-pocket.jpg",
        "/images/products/scrubs/women/black/06-top-neck.jpg",
        "/images/products/scrubs/women/black/07-bottom-front.jpg",
        "/images/products/scrubs/women/black/09-bottom-pocket.jpg",
        "/images/products/scrubs/women/black/10-fabric-detail.jpg",
      ],

      "Royal Blue": [
        "/images/products/scrubs/women/royal-blue/01-full-front.jpg",
        "/images/products/scrubs/women/royal-blue/02-full-back.jpg",
        "/images/products/scrubs/women/royal-blue/03-top-front.jpg",
        "/images/products/scrubs/women/royal-blue/04-top-back.jpg",
        "/images/products/scrubs/women/royal-blue/05-top-pocket.jpg",
        "/images/products/scrubs/women/royal-blue/06-top-neck.jpg",
        "/images/products/scrubs/women/royal-blue/07-bottom-front.jpg",
        "/images/products/scrubs/women/royal-blue/09-bottom-pocket.jpg",
        "/images/products/scrubs/women/royal-blue/10-fabric-detail.jpg",
      ],
    },

    inStock: true,
    stock: 18,

    isNewArrival: true,
    isBestseller: false,
    featuredRank: 2,
    createdAt: "2026-07-08",

    shortDescription:
      "Premium women’s medical scrub set with a modern professional fit, stretch comfort and practical pockets for long healthcare shifts.",

    description:
      "Designed for female healthcare professionals, the Krinay Women’s Modern Fit Scrub Set combines a smart professional appearance with comfortable movement. Customers can purchase the complete set or choose the scrub top and bottom separately, with independent top and bottom size selection.",

    features: [
      "Modern women’s professional fit",
      "92% Polyester and 8% Lycra fabric",
      "Stretchable and comfortable construction",
      "Functional utility pockets",
      "Separate top and bottom size selection",
      "Top and bottom can be purchased separately",
      "Suitable for long healthcare shifts",
    ],

    fabric: "92% Polyester, 8% Lycra",
    fit: "Modern women’s fit",

    careInstructions: [
      "Machine wash in cold water",
      "Wash dark colours separately",
      "Use mild detergent",
      "Do not bleach",
      "Dry in shade",
      "Iron at low temperature if required",
    ],

    tags: [
      "women scrubs",
      "female doctor scrubs",
      "medical scrubs",
      "hospital uniform",
      "airforce blue scrubs",
      "black scrubs",
      "royal blue scrubs",
      "krinay scrubs",
    ],

    reviews: [
      {
        id: "review-3",
        customerName: "Neha Sharma",
        rating: 5,
        comment:
          "Very comfortable and stylish. The colour also looks exactly as shown.",
        date: "2 July 2026",
      },
    ],
  },

  {
    id: "3",
    name: "Men’s Performance Scrub Set",
    slug: "mens-performance-scrub-set",

    category: "Men",
    gender: "Men",
    style: "classic",
    productType: "scrub",

    /*
     * Complete-set launch price.
     */
    price: 1444,
    originalPrice: 1699,

    /*
     * Separate top / bottom purchase prices.
     */
    topPrice: 722,
    topOriginalPrice: 849,

    bottomPrice: 723,
    bottomOriginalPrice: 850,

    setPrice: 1444,
    setOriginalPrice: 1699,

    discountPercent: 15,
    purchaseOptions: true,

    rating: 4.9,
    reviewCount: 42,

    colors: [
      "Airforce Blue",
      "Black",
      "Royal Blue",
    ],

    sizes: [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ],

    topSizes: [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ],

    bottomSizes: [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ],

    badge: "Popular",

    image:
      "/images/products/scrubs/men/airforce-blue/01-full-front.jpg",

    images: [
      "/images/products/scrubs/men/airforce-blue/01-full-front.jpg",
      "/images/products/scrubs/men/airforce-blue/02-full-back.jpg",
      "/images/products/scrubs/men/airforce-blue/03-top-front.jpg",
      "/images/products/scrubs/men/airforce-blue/05-top-pocket.jpg",
      "/images/products/scrubs/men/airforce-blue/07-bottom-front.jpg",
      "/images/products/scrubs/men/airforce-blue/09-bottom-pocket.jpg",
      "/images/products/scrubs/men/airforce-blue/10-fabric-detail.jpg",
    ],

    colorImages: {
      "Airforce Blue": [
        "/images/products/scrubs/men/airforce-blue/01-full-front.jpg",
        "/images/products/scrubs/men/airforce-blue/02-full-back.jpg",
        "/images/products/scrubs/men/airforce-blue/03-top-front.jpg",
        "/images/products/scrubs/men/airforce-blue/05-top-pocket.jpg",
        "/images/products/scrubs/men/airforce-blue/07-bottom-front.jpg",
        "/images/products/scrubs/men/airforce-blue/09-bottom-pocket.jpg",
        "/images/products/scrubs/men/airforce-blue/10-fabric-detail.jpg",
      ],

      Black: [
        "/images/products/scrubs/men/black/01-full-front.jpg",
        "/images/products/scrubs/men/black/02-full-back.jpg",
        "/images/products/scrubs/men/black/03-top-front.jpg",
        "/images/products/scrubs/men/black/05-top-pocket.jpg",
        "/images/products/scrubs/men/black/06-top-neck.jpg",
        "/images/products/scrubs/men/black/07-bottom-front.jpg",
        "/images/products/scrubs/men/black/09-bottom-pocket.jpg",
        "/images/products/scrubs/men/black/10-fabric-detail.jpg",
      ],

      "Royal Blue": [
        "/images/products/scrubs/men/royal-blue/01-full-front.jpg",
        "/images/products/scrubs/men/royal-blue/02-full-back.jpg",
        "/images/products/scrubs/men/royal-blue/03-top-front.jpg",
        "/images/products/scrubs/men/royal-blue/05-top-pocket.jpg",
        "/images/products/scrubs/men/royal-blue/06-top-neck.jpg",
        "/images/products/scrubs/men/royal-blue/07-bottom-front.jpg",
        "/images/products/scrubs/men/royal-blue/10-fabric-detail.jpg",
      ],
    },

    inStock: true,
    stock: 30,

    isNewArrival: false,
    isBestseller: true,
    featuredRank: 3,
    createdAt: "2026-06-14",

    shortDescription:
      "Premium men’s performance medical scrub set designed for long shifts, practical movement and a clean professional appearance.",

    description:
      "The Krinay Men’s Performance Scrub Set combines flexible stretch fabric, practical storage and a professional healthcare fit. Customers can buy the complete scrub set or purchase the top and bottom separately, with independent top and bottom size selection.",

    features: [
      "Performance stretch fabric",
      "92% Polyester and 8% Lycra",
      "Breathable construction",
      "Secure utility pockets",
      "Separate top and bottom size selection",
      "Top and bottom can be purchased separately",
      "Professional men’s fit",
      "Easy movement throughout long shifts",
    ],

    fabric: "92% Polyester, 8% Lycra",
    fit: "Regular men’s performance fit",

    careInstructions: [
      "Machine wash",
      "Wash similar colours together",
      "Use mild detergent",
      "Do not use strong bleach",
      "Dry in shade",
      "Iron on low heat if required",
    ],

    tags: [
      "men scrubs",
      "doctor scrubs",
      "medical scrubs",
      "performance scrubs",
      "airforce blue scrubs",
      "black scrubs",
      "royal blue scrubs",
      "krinay scrubs",
    ],

    reviews: [
      {
        id: "review-4",
        customerName: "Dr. Mohit",
        rating: 5,
        comment:
          "Excellent fitting and fabric quality. Comfortable even during long duty hours.",
        date: "30 June 2026",
      },
    ],
  },

  {
    id: "4",
    name: "Premium Doctor Lab Coat",
    slug: "premium-doctor-lab-coat",

    category: "Lab Coats",
    gender: "Unisex",
    style: "classic",
    productType: "lab-coat",

    price: 1099,
    originalPrice: 1399,

    rating: 4.6,
    reviewCount: 18,

    colors: ["White"],
    sizes: ["S", "M", "L", "XL", "XXL"],

    image: "/images/products/doctor-lab-coat.jpg",

    inStock: true,
    stock: 20,

    isNewArrival: false,
    isBestseller: false,
    featuredRank: 20,
    createdAt: "2026-05-10",

    shortDescription:
      "A professional white lab coat with practical pockets and a smart clinical appearance.",

    description:
      "The Premium Doctor Lab Coat is designed for doctors, students and laboratory professionals who require a clean, polished and functional coat.",

    features: [
      "Professional white finish",
      "Front button closure",
      "Multiple utility pockets",
      "Comfortable full sleeves",
      "Suitable for doctors and students",
    ],

    fabric: "Premium poly-cotton fabric",
    fit: "Regular professional fit",

    careInstructions: [
      "Wash whites separately",
      "Use mild detergent",
      "Do not soak for long periods",
      "Iron at medium temperature",
    ],

    tags: ["doctor coat", "lab coat"],
    reviews: [],
  },

  {
    id: "5",
    name: "Women’s Jogger Scrub Set",
    slug: "womens-jogger-scrub-set",

    category: "Women",
    gender: "Women",
    style: "jogger",
    productType: "scrub",

    price: 1799,
    originalPrice: 2299,

    rating: 4.8,
    reviewCount: 31,

    colors: ["Teal", "Pink", "Black"],
    sizes: ["XS", "S", "M", "L", "XL"],

    badge: "Trending",
    image: "/images/products/women-jogger.jpg",

    inStock: true,
    stock: 16,

    isNewArrival: true,
    isBestseller: true,
    featuredRank: 4,
    createdAt: "2026-07-10",

    shortDescription:
      "A stylish women’s jogger scrub set designed for comfort, flexibility and modern healthcare workwear.",

    description:
      "This jogger-style scrub set combines a flattering top with comfortable cuffed trousers, making it suitable for active healthcare professionals.",

    features: [
      "Modern jogger trousers",
      "Comfortable stretch waistband",
      "Functional storage pockets",
      "Soft and breathable fabric",
      "Flexible fit",
    ],

    fabric: "Four-way stretch blend",
    fit: "Modern jogger fit",

    careInstructions: [
      "Machine wash gently",
      "Wash with similar colours",
      "Do not bleach",
      "Dry in shade",
    ],

    tags: [
      "women jogger scrubs",
      "nurse scrubs",
      "female scrubs",
    ],

    reviews: [],
  },

  {
    id: "6",
    name: "Men’s Cargo Pocket Scrub Set",
    slug: "mens-cargo-pocket-scrub-set",

    category: "Men",
    gender: "Men",
    style: "cargo",
    productType: "scrub",

    price: 1849,
    originalPrice: 2399,

    rating: 4.7,
    reviewCount: 27,

    colors: ["Navy Blue", "Olive", "Grey"],
    sizes: ["S", "M", "L", "XL", "XXL"],

    image: "/images/products/men-cargo.jpg",

    inStock: true,
    stock: 13,

    isNewArrival: false,
    isBestseller: true,
    featuredRank: 5,
    createdAt: "2026-06-28",

    shortDescription:
      "A practical men’s scrub set with multiple cargo pockets for essential medical tools.",

    description:
      "The Men’s Cargo Pocket Scrub Set is built for professionals who need additional storage and all-day comfort while working.",

    features: [
      "Multiple cargo pockets",
      "Durable stitching",
      "Breathable fabric",
      "Comfortable waistband",
      "Professional appearance",
    ],

    fabric: "Durable stretch poly-cotton",
    fit: "Regular cargo fit",

    careInstructions: [
      "Machine wash",
      "Close pockets before washing",
      "Do not bleach",
      "Iron at low temperature",
    ],

    tags: [
      "men cargo scrubs",
      "utility scrubs",
      "doctor scrubs",
    ],

    reviews: [],
  },

  {
    id: "7",
    name: "Unisex Everyday Scrub Set",
    slug: "unisex-everyday-scrub-set",

    category: "Unisex",
    gender: "Unisex",
    style: "classic",
    productType: "scrub",

    price: 1399,
    originalPrice: 1699,

    rating: 4.5,
    reviewCount: 15,

    colors: ["Sky Blue", "Green", "Navy Blue"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],

    image: "/images/products/unisex-everyday.jpg",

    inStock: true,
    stock: 40,

    isNewArrival: false,
    isBestseller: false,
    featuredRank: 6,
    createdAt: "2026-05-25",

    shortDescription:
      "An affordable everyday scrub set with a comfortable unisex design.",

    description:
      "The Unisex Everyday Scrub Set is a reliable option for medical students, clinics and healthcare teams requiring practical daily uniforms.",

    features: [
      "Simple unisex design",
      "Comfortable lightweight fabric",
      "Functional pockets",
      "Easy to maintain",
      "Suitable for teams and students",
    ],

    fabric: "Lightweight poly-cotton",
    fit: "Regular unisex fit",

    careInstructions: [
      "Machine wash",
      "Use mild detergent",
      "Do not bleach",
      "Dry naturally",
    ],

    tags: [
      "unisex scrubs",
      "student scrubs",
      "hospital uniform",
    ],

    reviews: [],
  },

  {
    id: "8",
    name: "Medical Student Lab Coat",
    slug: "medical-student-lab-coat",

    category: "Lab Coats",
    gender: "Unisex",
    style: "classic",
    productType: "lab-coat",

    price: 899,
    originalPrice: 1099,

    rating: 4.4,
    reviewCount: 12,

    colors: ["White"],
    sizes: ["S", "M", "L", "XL"],

    badge: "Value Deal",
    image: "/images/products/student-lab-coat.jpg",

    inStock: false,
    stock: 0,

    isNewArrival: false,
    isBestseller: false,
    featuredRank: 21,
    createdAt: "2026-04-20",

    shortDescription:
      "A practical and affordable white lab coat designed for medical students.",

    description:
      "The Medical Student Lab Coat provides a professional appearance and practical storage for classroom, laboratory and clinical training.",

    features: [
      "Student-friendly design",
      "Front button closure",
      "Three useful pockets",
      "Easy-care material",
      "Affordable professional wear",
    ],

    fabric: "Poly-cotton blend",
    fit: "Regular student fit",

    careInstructions: [
      "Wash whites separately",
      "Machine wash gently",
      "Do not bleach heavily",
      "Iron at medium heat",
    ],

    tags: [
      "student coat",
      "medical lab coat",
    ],

    reviews: [],
  },
];

export function getProductBySlug(
  slug: string,
) {
  return products.find(
    (product) =>
      product.slug === slug,
  );
}