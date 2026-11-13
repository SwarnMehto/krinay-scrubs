import type { Product } from "@/types/product";

const CLASSIC_V_NECK_COLOURS = [
  "Fuchsia Berry",
  "Steel Grey",
  "Lavender",
  "Navy Blue",
  "Purple",
] as const;

const CLASSIC_V_NECK_PLACEHOLDER_IMAGES: Record<
  "Men" | "Women",
  string
> = {
  Men: "/images/products/scrubs/men/airforce-blue/01-full-front.jpg",
  Women: "/images/products/scrubs/women/airforce-blue/01-full-front.jpg",
};

const CLASSIC_V_NECK_PRODUCTS: Product[] = (
  ["Men", "Women"] as const
).flatMap((gender, genderIndex) =>
  CLASSIC_V_NECK_COLOURS.map((colour, colourIndex) => {
    const genderSlug = gender === "Men" ? "mens" : "womens";
    const colourSlug = colour
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const image =
      CLASSIC_V_NECK_PLACEHOLDER_IMAGES[gender];

    return {
      id: `classic-v-neck-${genderSlug}-${colourSlug}`,
      name: `Krinay ${gender === "Men" ? "Men's" : "Women's"} Classic V-Neck Scrub Set – ${colour}`,
      slug: `${genderSlug}-classic-v-neck-scrub-set-${colourSlug}`,
      category: gender,
      gender,
      style: "v-neck",
      productType: "scrub",
      price: 999,
      originalPrice: 1599,
      setPrice: 999,
      setOriginalPrice: 1599,
      discountPercent: 38,
      purchaseOptions: false,
      rating: 0,
      reviewCount: 0,
      colors: [colour],
      sizes:
        gender === "Women"
          ? ["XS", "S", "M", "L", "XL", "XXL"]
          : ["S", "M", "L", "XL", "XXL"],
      badge: "New",
      image,
      images: [image],
      colorImages: {
        [colour]: [image],
      },
      inStock: true,
      stock: 30,
      isNewArrival: true,
      isBestseller: false,
      featuredRank: 60 + genderIndex * 5 + colourIndex,
      createdAt: "2026-11-12",
      shortDescription: `Krinay ${gender === "Men" ? "men’s" : "women’s"} Classic V-Neck Scrub Set in ${colour}, designed for comfortable everyday wear by healthcare professionals.`,
      description: `The Krinay ${gender === "Men" ? "Men’s" : "Women’s"} Classic V-Neck Scrub Set in ${colour} features a professional V-neck design and a comfortable fit for healthcare shifts.`,
      features: [
        "Classic V-neck styling",
        "Complete scrub top and bottom set",
        "Comfortable professional fit",
        "Practical utility pockets",
        "Available in multiple sizes",
      ],
      fabric: "92% Polyester, 8% Lycra",
      fit: `Regular ${gender.toLowerCase()}’s fit`,
      careInstructions: [
        "Machine wash",
        "Wash similar colours together",
        "Use mild detergent",
        "Do not use strong bleach",
        "Dry in shade",
        "Iron on low heat if required",
      ],
      tags: [
        "classic v-neck scrubs",
        `${gender.toLowerCase()} scrubs`,
        `${colour.toLowerCase()} scrubs`,
        "medical scrubs",
        "krinay scrubs",
      ],
      reviews: [],
    };
  }),
);

export const products: Product[] = [
  // =========================================================
  // WOMEN — LIVE — 3 COLOUR CARDS
  // =========================================================
  {
    id: "2-airforce",

    name: "Women’s Athletic Scrub Set – Airforce Blue",

    slug: "womens-athletic-scrub-set-airforce-blue",

    category: "Women",

    gender: "Women",

    style: "athletic",

    productType: "scrub",

    /*
     * FINAL KRINAY SCRUB PRICING
     *
     * MRP ₹2,499
     * Offer ₹1,699
     */
    price: 1899,

    originalPrice: 2499,

    /*
     * Complete Set
     */
    setPrice: 1899,

    setOriginalPrice: 2499,

    /*
     * Top Only
     */
    topPrice: 949,

    topOriginalPrice: 1250,

    /*
     * Bottom Only
     */
    bottomPrice: 950,

    bottomOriginalPrice: 1250,

    discountPercent: 24,

    purchaseOptions: true,

    rating: 5.0,

    reviewCount: 24,

    colors: [
      "Airforce Blue",
      "Royal Blue",
      "Black",
      "Wine",
      "Olive",
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

    image:
      "/images/products/scrubs/women/airforce-blue/01-full-front.jpg",

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

    featuredRank: 1,

    createdAt: "2026-07-08",

    shortDescription:
      "Premium women’s medical scrub set with a modern professional fit, stretch comfort and practical pockets for long healthcare shifts.",

    description:
      "Designed for female healthcare professionals, the Krinay Women’s Modern Fit Scrub Set combines professional styling with comfortable movement. Choose the complete scrub set or purchase the top and bottom separately with independent size selection.",

    features: [
      "Modern women’s professional fit",

      "92% Polyester and 8% Lycra",

      "Stretchable and comfortable fabric",

      "Functional utility pockets",

      "Independent top and bottom sizes",

      "Top and bottom available separately",

      "Suitable for long healthcare shifts",
    ],

    fabric:
      "92% Polyester, 8% Lycra",

    fit:
      "Modern women’s fit",

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

      "female scrubs",

      "doctor scrubs",

      "nurse scrubs",

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

        customerName:
          "Neha Sharma",

        rating: 5,

        comment:
          "Very comfortable and stylish. The colour also looks exactly as shown.",

        date:
          "2 July 2026",
      },
    ],
  },
  {
    id: "2-black",

    name: "Women’s Athletic Scrub Set – Black",

    slug: "womens-athletic-scrub-set-black",

    category: "Women",

    gender: "Women",

    style: "athletic",

    productType: "scrub",

    /*
     * FINAL KRINAY SCRUB PRICING
     *
     * MRP ₹2,499
     * Offer ₹1,699
     */
    price: 1899,

    originalPrice: 2499,

    /*
     * Complete Set
     */
    setPrice: 1899,

    setOriginalPrice: 2499,

    /*
     * Top Only
     */
    topPrice: 949,

    topOriginalPrice: 1250,

    /*
     * Bottom Only
     */
    bottomPrice: 950,

    bottomOriginalPrice: 1250,

    discountPercent: 24,

    purchaseOptions: true,

    rating: 5.0,

    reviewCount: 24,

    colors: [
      "Airforce Blue",
      "Royal Blue",
      "Black",
      "Wine",
      "Olive",
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

    image:
      "/images/products/scrubs/women/black/01-full-front.jpg",

    images: [
      "/images/products/scrubs/women/black/01-full-front.jpg",

      "/images/products/scrubs/women/black/02-full-back.jpg",

      "/images/products/scrubs/women/black/03-top-front.jpg",

      "/images/products/scrubs/women/black/05-top-pocket.jpg",

      "/images/products/scrubs/women/black/06-top-neck.jpg",

      "/images/products/scrubs/women/black/07-bottom-front.jpg",

      "/images/products/scrubs/women/black/09-bottom-pocket.jpg",

      "/images/products/scrubs/women/black/10-fabric-detail.jpg",
    ],

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

    isNewArrival: false,

    isBestseller: true,

    featuredRank: 2,

    createdAt: "2026-07-08",

    shortDescription:
      "Premium women’s medical scrub set with a modern professional fit, stretch comfort and practical pockets for long healthcare shifts.",

    description:
      "Designed for female healthcare professionals, the Krinay Women’s Modern Fit Scrub Set combines professional styling with comfortable movement. Choose the complete scrub set or purchase the top and bottom separately with independent size selection.",

    features: [
      "Modern women’s professional fit",

      "92% Polyester and 8% Lycra",

      "Stretchable and comfortable fabric",

      "Functional utility pockets",

      "Independent top and bottom sizes",

      "Top and bottom available separately",

      "Suitable for long healthcare shifts",
    ],

    fabric:
      "92% Polyester, 8% Lycra",

    fit:
      "Modern women’s fit",

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

      "female scrubs",

      "doctor scrubs",

      "nurse scrubs",

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

        customerName:
          "Neha Sharma",

        rating: 5,

        comment:
          "Very comfortable and stylish. The colour also looks exactly as shown.",

        date:
          "2 July 2026",
      },
    ],
  },
  {
    id: "2-royal",

    name: "Women’s Athletic Scrub Set – Royal Blue",

    slug: "womens-athletic-scrub-set-royal-blue",

    category: "Women",

    gender: "Women",

    style: "athletic",

    productType: "scrub",

    /*
     * FINAL KRINAY SCRUB PRICING
     *
     * MRP ₹2,499
     * Offer ₹1,699
     */
    price: 1599,

    originalPrice: 2499,

    /*
     * Complete Set
     */
    setPrice: 1599,

    setOriginalPrice: 2499,

    /*
     * Top Only
     */
    topPrice: 799,

    topOriginalPrice: 1250,

    /*
     * Bottom Only
     */
    bottomPrice: 800,

    bottomOriginalPrice: 1250,

    discountPercent: 36,

    purchaseOptions: true,

    rating: 5.0,

    reviewCount: 24,

    colors: [
      "Airforce Blue",
      "Royal Blue",
      "Black",
      "Wine",
      "Olive",
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

    badge: "Bestseller",

    image:
      "/images/products/scrubs/women/royal-blue/01-full-front.jpg",

    images: [
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

    featuredRank: 3,

    createdAt: "2026-07-08",

    shortDescription:
      "Premium women’s medical scrub set with a modern professional fit, stretch comfort and practical pockets for long healthcare shifts.",

    description:
      "Designed for female healthcare professionals, the Krinay Women’s Modern Fit Scrub Set combines professional styling with comfortable movement. Choose the complete scrub set or purchase the top and bottom separately with independent size selection.",

    features: [
      "Modern women’s professional fit",

      "92% Polyester and 8% Lycra",

      "Stretchable and comfortable fabric",

      "Functional utility pockets",

      "Independent top and bottom sizes",

      "Top and bottom available separately",

      "Suitable for long healthcare shifts",
    ],

    fabric:
      "92% Polyester, 8% Lycra",

    fit:
      "Modern women’s fit",

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

      "female scrubs",

      "doctor scrubs",

      "nurse scrubs",

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

        customerName:
          "Neha Sharma",

        rating: 5,

        comment:
          "Very comfortable and stylish. The colour also looks exactly as shown.",

        date:
          "2 July 2026",
      },
    ],
  },
  // =========================================================
  // MEN — LIVE — 3 COLOUR CARDS
  // =========================================================
  {
    id: "3-airforce",

    name: "Men’s Athletic Scrub Set – Airforce Blue",

    slug: "mens-athletic-scrub-set-airforce-blue",

    category: "Men",

    gender: "Men",

    style: "athletic",

    productType: "scrub",

    price: 1899,

    originalPrice: 2499,

    setPrice: 1899,

    setOriginalPrice: 2499,

    topPrice: 949,

    topOriginalPrice: 1250,

    bottomPrice: 950,

    bottomOriginalPrice: 1250,

    discountPercent: 24,

    purchaseOptions: true,

    rating: 5.0,

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

    badge: "New",

    image:
      "/images/products/scrubs/men/airforce-blue/01-full-front.jpg",

    images: [
      "/images/products/scrubs/men/airforce-blue/01-full-front.jpg",

      "/images/products/scrubs/men/airforce-blue/02-full-back.jpg",

      "/images/products/scrubs/men/airforce-blue/03-top-front.jpg",

      "/images/products/scrubs/men/airforce-blue/05-top-pocket.jpg",

      "/images/products/scrubs/men/airforce-blue/06-top-neck.jpg",

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

    isNewArrival: true,

    isBestseller: false,

    featuredRank: 4,

    createdAt:
      "2026-06-14",

    shortDescription:
      "Premium men’s performance medical scrub set designed for long shifts, practical movement and a clean professional appearance.",

    description:
      "The Krinay Men’s Performance Scrub Set combines flexible stretch fabric, practical storage and a professional healthcare fit. Choose the complete set or purchase the scrub top and bottom separately with independent sizing.",

    features: [
      "Professional men’s fit",

      "92% Polyester and 8% Lycra",

      "Performance stretch fabric",

      "Breathable construction",

      "Secure utility pockets",

      "Independent top and bottom size selection",

      "Top and bottom available separately",
    ],

    fabric:
      "92% Polyester, 8% Lycra",

    fit:
      "Regular men’s performance fit",

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

        customerName:
          "Dr. Mohit",

        rating: 5,

        comment:
          "Excellent fitting and fabric quality. Comfortable even during long duty hours.",

        date:
          "30 June 2026",
      },
    ],
  },
  {
    id: "3-black",

    name: "Men’s Athletic Scrub Set – Black",

    slug: "mens-athletic-scrub-set-black",

    category: "Men",

    gender: "Men",

    style: "athletic",

    productType: "scrub",

    price: 1899,

    originalPrice: 2499,

    setPrice: 1899,

    setOriginalPrice: 2499,

    topPrice: 949,

    topOriginalPrice: 1250,

    bottomPrice: 950,

    bottomOriginalPrice: 1250,

    discountPercent: 24,

    purchaseOptions: true,

    rating: 5.0,

    reviewCount: 42,

    colors: [
      "Airforce Blue",
      "Royal Blue",
      "Black",
      "Wine",
      "Olive",
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

    badge: "New",

    image:
      "/images/products/scrubs/men/black/01-full-front.jpg",

    images: [
      "/images/products/scrubs/men/black/01-full-front.jpg",

      "/images/products/scrubs/men/black/02-full-back.jpg",

      "/images/products/scrubs/men/black/03-top-front.jpg",

      "/images/products/scrubs/men/black/05-top-pocket.jpg",

      "/images/products/scrubs/men/black/06-top-neck.jpg",

      "/images/products/scrubs/men/black/07-bottom-front.jpg",

      "/images/products/scrubs/men/black/09-bottom-pocket.jpg",

      "/images/products/scrubs/men/black/10-fabric-detail.jpg",
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

    isNewArrival: true,

    isBestseller: false,

    featuredRank: 5,

    createdAt:
      "2026-06-14",

    shortDescription:
      "Premium men’s performance medical scrub set designed for long shifts, practical movement and a clean professional appearance.",

    description:
      "The Krinay Men’s Performance Scrub Set combines flexible stretch fabric, practical storage and a professional healthcare fit. Choose the complete set or purchase the scrub top and bottom separately with independent sizing.",

    features: [
      "Professional men’s fit",

      "92% Polyester and 8% Lycra",

      "Performance stretch fabric",

      "Breathable construction",

      "Secure utility pockets",

      "Independent top and bottom size selection",

      "Top and bottom available separately",
    ],

    fabric:
      "92% Polyester, 8% Lycra",

    fit:
      "Regular men’s performance fit",

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

        customerName:
          "Dr. Mohit",

        rating: 5,

        comment:
          "Excellent fitting and fabric quality. Comfortable even during long duty hours.",

        date:
          "30 June 2026",
      },
    ],
  },
  {
    id: "3-royal",

    name: "Men’s Athletic Scrub Set – Royal Blue",

    slug: "mens-athletic-scrub-set-royal-blue",

    category: "Men",

    gender: "Men",

    style: "athletic",

    productType: "scrub",

    price: 1599,

    originalPrice: 2499,

    setPrice: 1599,

    setOriginalPrice: 2499,

    topPrice: 799,

    topOriginalPrice: 1250,

    bottomPrice: 800,

    bottomOriginalPrice: 1250,

    discountPercent: 36,

    purchaseOptions: true,

    rating: 5.0,

    reviewCount: 42,

    colors: [
      "Airforce Blue",
      "Royal Blue",
      "Black",
      "Wine",
      "Olive",
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

    badge: "Bestseller",

    image:
      "/images/products/scrubs/men/royal-blue/01-full-front.jpg",

    images: [
      "/images/products/scrubs/men/royal-blue/01-full-front.jpg",

      "/images/products/scrubs/men/royal-blue/02-full-back.jpg",

      "/images/products/scrubs/men/royal-blue/03-top-front.jpg",

      "/images/products/scrubs/men/royal-blue/05-top-pocket.jpg",

      "/images/products/scrubs/men/royal-blue/06-top-neck.jpg",

      "/images/products/scrubs/men/royal-blue/07-bottom-front.jpg",

      "/images/products/scrubs/men/royal-blue/09-bottom-pocket.jpg",

      "/images/products/scrubs/men/royal-blue/10-fabric-detail.jpg",
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

    featuredRank: 6,

    createdAt:
      "2026-06-14",

    shortDescription:
      "Premium men’s performance medical scrub set designed for long shifts, practical movement and a clean professional appearance.",

    description:
      "The Krinay Men’s Performance Scrub Set combines flexible stretch fabric, practical storage and a professional healthcare fit. Choose the complete set or purchase the scrub top and bottom separately with independent sizing.",

    features: [
      "Professional men’s fit",

      "92% Polyester and 8% Lycra",

      "Performance stretch fabric",

      "Breathable construction",

      "Secure utility pockets",

      "Independent top and bottom size selection",

      "Top and bottom available separately",
    ],

    fabric:
      "92% Polyester, 8% Lycra",

    fit:
      "Regular men’s performance fit",

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

        customerName:
          "Dr. Mohit",

        rating: 5,

        comment:
          "Excellent fitting and fabric quality. Comfortable even during long duty hours.",

        date:
          "30 June 2026",
      },
    ],
  },
  // =========================================================
  // WOMEN — LIVE — WINE
  // =========================================================
  {
    id: "2-wine",
    name: "Women’s Athletic Scrub Set – Wine",
    slug: "womens-athletic-scrub-set-wine",
    category: "Women",
    gender: "Women",
    style: "athletic",
    productType: "scrub",

    price: 1899,
    originalPrice: 2499,
    setPrice: 1899,
    setOriginalPrice: 2499,
    topPrice: 949,
    topOriginalPrice: 1250,
    bottomPrice: 950,
    bottomOriginalPrice: 1250,
    discountPercent: 24,
    purchaseOptions: true,

    rating: 5.0,
    reviewCount: 24,

    colors: [
      "Airforce Blue",
      "Royal Blue",
      "Black",
      "Wine",
      "Olive",
    ],

    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    topSizes: ["XS", "S", "M", "L", "XL", "XXL"],
    bottomSizes: ["XS", "S", "M", "L", "XL", "XXL"],

    badge: "New",

    image:
      "/images/products/scrubs/women/wine/01-full-front.jpg",

    images: [
      "/images/products/scrubs/women/wine/01-full-front.jpg",
      "/images/products/scrubs/women/wine/02-full-back.jpg",
      "/images/products/scrubs/women/wine/03-top-front.jpg",
      "/images/products/scrubs/women/wine/04-top-back.jpg",
      "/images/products/scrubs/women/wine/05-top-pocket.jpg",
      "/images/products/scrubs/women/wine/06-top-neck.jpg",
      "/images/products/scrubs/women/wine/10-fabric-detail.jpg",
    ],

    colorImages: {
      Wine: [
        "/images/products/scrubs/women/wine/01-full-front.jpg",
        "/images/products/scrubs/women/wine/02-full-back.jpg",
        "/images/products/scrubs/women/wine/03-top-front.jpg",
        "/images/products/scrubs/women/wine/04-top-back.jpg",
        "/images/products/scrubs/women/wine/05-top-pocket.jpg",
        "/images/products/scrubs/women/wine/06-top-neck.jpg",
        "/images/products/scrubs/women/wine/10-fabric-detail.jpg",
      ],
    },

    inStock: true,
    stock: 18,
    isNewArrival: true,
    isBestseller: false,
    featuredRank: 7,
    createdAt: "2026-09-27",

    shortDescription:
      "Premium women’s medical scrub set in a rich wine colour with a modern professional fit, stretch comfort and practical pockets for long healthcare shifts.",

    description:
      "Designed for female healthcare professionals, the Krinay Women’s Modern Fit Scrub Set in Wine combines professional styling with comfortable movement. Choose the complete scrub set or purchase the top and bottom separately with independent size selection.",

    features: [
      "Modern women’s professional fit",
      "Stretchable and comfortable fabric",
      "Functional utility pockets",
      "Independent top and bottom sizes",
      "Top and bottom available separately",
      "Suitable for long healthcare shifts",
    ],

    fabric:
      "92% Polyester, 8% Lycra",

    fit:
      "Modern women’s fit",

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
      "female scrubs",
      "doctor scrubs",
      "nurse scrubs",
      "medical scrubs",
      "hospital uniform",
      "wine scrubs",
      "wine medical scrubs",
      "krinay scrubs",
    ],

    reviews: [],
  },

  // =========================================================
  // WOMEN — LIVE — OLIVE
  // =========================================================
  {
    id: "2-olive",
    name: "Women’s Athletic Scrub Set – Mediterranean Olive",
    slug: "womens-athletic-scrub-set-mediterranean-olive",
    category: "Women",
    gender: "Women",
    style: "athletic",
    productType: "scrub",

    price: 1899,
    originalPrice: 2499,
    setPrice: 1899,
    setOriginalPrice: 2499,
    topPrice: 949,
    topOriginalPrice: 1250,
    bottomPrice: 950,
    bottomOriginalPrice: 1250,
    discountPercent: 24,
    purchaseOptions: true,

    rating: 5.0,
    reviewCount: 24,

    colors: [
      "Airforce Blue",
      "Royal Blue",
      "Black",
      "Wine",
      "Olive",
    ],

    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    topSizes: ["XS", "S", "M", "L", "XL", "XXL"],
    bottomSizes: ["XS", "S", "M", "L", "XL", "XXL"],

    badge: "New",

    image:
      "/images/products/scrubs/women/olive/01-full-front.jpg",

    images: [
      "/images/products/scrubs/women/olive/01-full-front.jpg",
      "/images/products/scrubs/women/olive/02-full-back.jpg",
      "/images/products/scrubs/women/olive/03-top-front.jpg",
      "/images/products/scrubs/women/olive/05-top-pocket.jpg",
      "/images/products/scrubs/women/olive/06-top-neck.jpg",
      "/images/products/scrubs/women/olive/07-bottom-front.jpg",
      "/images/products/scrubs/women/olive/10-fabric-detail.jpg",
    ],

    colorImages: {
      Olive: [
        "/images/products/scrubs/women/olive/01-full-front.jpg",
        "/images/products/scrubs/women/olive/02-full-back.jpg",
        "/images/products/scrubs/women/olive/03-top-front.jpg",
        "/images/products/scrubs/women/olive/05-top-pocket.jpg",
        "/images/products/scrubs/women/olive/06-top-neck.jpg",
        "/images/products/scrubs/women/olive/07-bottom-front.jpg",
        "/images/products/scrubs/women/olive/10-fabric-detail.jpg",
      ],
    },

    inStock: true,
    stock: 18,
    isNewArrival: true,
    isBestseller: false,
    featuredRank: 8,
    createdAt: "2026-09-27",

    shortDescription:
      "Premium women’s medical scrub set in an elegant olive colour with a modern professional fit, stretch comfort and practical pockets for long healthcare shifts.",

    description:
      "Designed for female healthcare professionals, the Krinay Women’s Modern Fit Scrub Set in Olive combines professional styling with comfortable movement. Choose the complete scrub set or purchase the top and bottom separately with independent size selection.",

    features: [
      "Modern women’s professional fit",
      "Stretchable and comfortable fabric",
      "Functional utility pockets",
      "Independent top and bottom sizes",
      "Top and bottom available separately",
      "Suitable for long healthcare shifts",
    ],

    fabric:
      "92% Polyester, 8% Lycra",

    fit:
      "Modern women’s fit",

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
      "female scrubs",
      "doctor scrubs",
      "nurse scrubs",
      "medical scrubs",
      "hospital uniform",
      "olive scrubs",
      "olive medical scrubs",
      "krinay scrubs",
    ],

    reviews: [],
  },

  // =========================================================
  // MEN — LIVE — WINE
  // =========================================================
  {
    id: "3-wine",
    name: "Men’s Athletic Scrub Set – Wine",
    slug: "mens-athletic-scrub-set-wine",
    category: "Men",
    gender: "Men",
    style: "athletic",
    productType: "scrub",

    price: 1899,
    originalPrice: 2499,
    setPrice: 1899,
    setOriginalPrice: 2499,
    topPrice: 949,
    topOriginalPrice: 1250,
    bottomPrice: 950,
    bottomOriginalPrice: 1250,
    discountPercent: 24,
    purchaseOptions: true,

    rating: 5.0,
    reviewCount: 42,

    colors: [
      "Airforce Blue",
      "Royal Blue",
      "Black",
      "Wine",
      "Olive",
    ],

    sizes: ["S", "M", "L", "XL", "XXL"],
    topSizes: ["S", "M", "L", "XL", "XXL"],
    bottomSizes: ["S", "M", "L", "XL", "XXL"],

    badge: "New",

    image:
      "/images/products/scrubs/men/wine/01-full-front.jpg",

    images: [
      "/images/products/scrubs/men/wine/01-full-front.jpg",
      "/images/products/scrubs/men/wine/02-full-back.jpg",
      "/images/products/scrubs/men/wine/03-top-front.jpg",
      "/images/products/scrubs/men/wine/05-top-pocket.jpg",
      "/images/products/scrubs/men/wine/06-top-neck.jpg",
      "/images/products/scrubs/men/wine/07-bottom-front.jpg",
      "/images/products/scrubs/men/wine/09-bottom-pocket.jpg",
    ],

    colorImages: {
      Wine: [
        "/images/products/scrubs/men/wine/01-full-front.jpg",
        "/images/products/scrubs/men/wine/02-full-back.jpg",
        "/images/products/scrubs/men/wine/03-top-front.jpg",
        "/images/products/scrubs/men/wine/05-top-pocket.jpg",
        "/images/products/scrubs/men/wine/06-top-neck.jpg",
        "/images/products/scrubs/men/wine/07-bottom-front.jpg",
        "/images/products/scrubs/men/wine/09-bottom-pocket.jpg",
      ],
    },

    inStock: true,
    stock: 30,
    isNewArrival: true,
    isBestseller: false,
    featuredRank: 10,
    createdAt: "2026-09-27",

    shortDescription:
      "Premium men’s performance medical scrub set in a rich wine colour, designed for long shifts, practical movement and a clean professional appearance.",

    description:
      "The Krinay Men’s Performance Scrub Set in Wine combines flexible stretch fabric, practical storage and a professional healthcare fit. Choose the complete set or purchase the scrub top and bottom separately with independent sizing.",

    features: [
      "Professional men’s fit",
      "Performance stretch fabric",
      "Breathable construction",
      "Secure utility pockets",
      "Independent top and bottom size selection",
      "Top and bottom available separately",
    ],

    fabric:
      "92% Polyester, 8% Lycra",

    fit:
      "Regular men’s performance fit",

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
      "wine scrubs",
      "wine medical scrubs",
      "krinay scrubs",
    ],

    reviews: [],
  },

  // =========================================================
  // MEN — LIVE — OLIVE
  // =========================================================
  {
    id: "3-olive",
    name: "Men’s Athletic Scrub Set – Mediterranean Olive",
    slug: "mens-athletic-scrub-set-mediterranean-olive",
    category: "Men",
    gender: "Men",
    style: "athletic",
    productType: "scrub",

    price: 1899,
    originalPrice: 2499,
    setPrice: 1899,
    setOriginalPrice: 2499,
    topPrice: 949,
    topOriginalPrice: 1250,
    bottomPrice: 950,
    bottomOriginalPrice: 1250,
    discountPercent: 24,
    purchaseOptions: true,

    rating: 5.0,
    reviewCount: 42,

    colors: [
      "Airforce Blue",
      "Royal Blue",
      "Black",
      "Wine",
      "Olive",
    ],

    sizes: ["S", "M", "L", "XL", "XXL"],
    topSizes: ["S", "M", "L", "XL", "XXL"],
    bottomSizes: ["S", "M", "L", "XL", "XXL"],

    badge: "New",

    image:
      "/images/products/scrubs/men/olive/01-full-front.jpg",

    images: [
      "/images/products/scrubs/men/olive/01-full-front.jpg",
      "/images/products/scrubs/men/olive/02-full-back.jpg",
      "/images/products/scrubs/men/olive/03-top-front.jpg",
      "/images/products/scrubs/men/olive/05-top-pocket.jpg",
      "/images/products/scrubs/men/olive/07-bottom-front.jpg",
      "/images/products/scrubs/men/olive/09-bottom-pocket.jpg",
      "/images/products/scrubs/men/olive/10-fabric-detail.jpg",
    ],

    colorImages: {
      Olive: [
        "/images/products/scrubs/men/olive/01-full-front.jpg",
        "/images/products/scrubs/men/olive/02-full-back.jpg",
        "/images/products/scrubs/men/olive/03-top-front.jpg",
        "/images/products/scrubs/men/olive/05-top-pocket.jpg",
        "/images/products/scrubs/men/olive/07-bottom-front.jpg",
        "/images/products/scrubs/men/olive/09-bottom-pocket.jpg",
        "/images/products/scrubs/men/olive/10-fabric-detail.jpg",
      ],
    },

    inStock: true,
    stock: 30,
    isNewArrival: true,
    isBestseller: false,
    featuredRank: 11,
    createdAt: "2026-09-27",

    shortDescription:
      "Premium men’s performance medical scrub set in an elegant olive colour, designed for long shifts, practical movement and a clean professional appearance.",

    description:
      "The Krinay Men’s Performance Scrub Set in Olive combines flexible stretch fabric, practical storage and a professional healthcare fit. Choose the complete set or purchase the scrub top and bottom separately with independent sizing.",

    features: [
      "Professional men’s fit",
      "Performance stretch fabric",
      "Breathable construction",
      "Secure utility pockets",
      "Independent top and bottom size selection",
      "Top and bottom available separately",
    ],

    fabric:
      "92% Polyester, 8% Lycra",

    fit:
      "Regular men’s performance fit",

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
      "olive scrubs",
      "olive medical scrubs",
      "krinay scrubs",
    ],

    reviews: [],
  },

  // =========================================================
  // V-NECK SCRUBS — COMING SOON
  // =========================================================
  {
    id: "101",

    name:
      "Classic V-Neck Scrub Collection",

    slug:
      "v-neck-scrub-collection",

    category:
      "Unisex",

    gender:
      "Unisex",

    style:
      "v-neck",

    productType:
      "scrub",

    price: 1699,

    originalPrice: 2499,

    setPrice: 1699,

    setOriginalPrice: 2499,

    topPrice: 849,

    topOriginalPrice: 1250,

    bottomPrice: 850,

    bottomOriginalPrice: 1250,

    discountPercent: 32,

    purchaseOptions: true,

    rating: 0,

    reviewCount: 0,

    colors: [
      "More Colours Coming Soon",
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

    badge:
      "Coming Soon",

    /*
     * Existing real image used only as temporary preview.
     * Replace later when V-Neck shoot is available.
     */
    image:
      "/images/products/scrubs/men/airforce-blue/01-full-front.jpg",

    inStock: false,

    stock: 0,

    isNewArrival: false,

    isBestseller: true,

    featuredRank: 20,

    createdAt:
      "2026-08-23",

    shortDescription:
      "Krinay V-Neck medical scrubs are coming soon.",

    description:
      "A dedicated V-Neck Krinay Scrub Collection is currently under development and will be available soon.",

    features: [
      "V-neck styling",

      "Professional healthcare design",

      "Multiple colours planned",

      "Coming soon",
    ],

    fabric:
      "92% Polyester, 8% Lycra",

    fit:
      "Coming soon",

    careInstructions: [
      "Product details will be announced soon",
    ],

    tags: [
      "v neck scrubs",

      "coming soon",
    ],

    reviews: [],
  },

  // =========================================================
  // ATHLETIC SCRUBS — COMING SOON
  // =========================================================
  {
    id: "102",

    name:
      "Krinay Apex Scrub",

    slug:
      "krinay-apex-scrub",

    category:
      "Unisex",

    gender:
      "Unisex",

    style:
      "classic",

    productType:
      "scrub",

    price: 1699,

    originalPrice: 2499,

    setPrice: 1699,

    setOriginalPrice: 2499,

    topPrice: 849,

    topOriginalPrice: 1250,

    bottomPrice: 850,

    bottomOriginalPrice: 1250,

    discountPercent: 32,

    purchaseOptions: true,

    rating: 0,

    reviewCount: 0,

    colors: [
      "More Colours Coming Soon",
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

    badge:
      "Coming Soon",

    image:
      "/images/products/scrubs/men/airforce-blue/01-full-front.jpg",

    inStock: false,

    stock: 0,

    isNewArrival: true,

    isBestseller: false,

    featuredRank: 21,

    createdAt:
      "2026-08-23",

    shortDescription:
      "Performance-inspired Krinay Athletic Scrubs are coming soon.",

    description:
      "The Krinay Athletic Scrub Collection is being developed for healthcare professionals who want enhanced mobility and a sporty performance fit.",

    features: [
      "Athletic styling",

      "Performance-focused fit",

      "Stretch movement",

      "Coming soon",
    ],

    fabric:
      "92% Polyester, 8% Lycra",

    fit:
      "Athletic fit",

    careInstructions: [
      "Product details will be announced soon",
    ],

    tags: [
      "athletic scrubs",

      "performance scrubs",

      "coming soon",
    ],

    reviews: [],
  },

  // =========================================================
  // MANDARIN SCRUBS — COMING SOON
  // =========================================================
  {
    id: "103",

    name:
      "Mandarin Collar Scrub Collection",

    slug:
      "mandarin-collar-scrub-collection",

    category:
      "Unisex",

    gender:
      "Unisex",

    style:
      "classic",

    productType:
      "scrub",

    price: 1699,

    originalPrice: 2499,

    setPrice: 1699,

    setOriginalPrice: 2499,

    topPrice: 849,

    topOriginalPrice: 1250,

    bottomPrice: 850,

    bottomOriginalPrice: 1250,

    discountPercent: 32,

    purchaseOptions: true,

    rating: 0,

    reviewCount: 0,

    colors: [
      "More Colours Coming Soon",
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

    badge:
      "Coming Soon",

    image:
      "/images/products/scrubs/women/airforce-blue/01-full-front.jpg",

    inStock: false,

    stock: 0,

    isNewArrival: true,

    isBestseller: false,

    featuredRank: 22,

    createdAt:
      "2026-08-23",

    shortDescription:
      "Premium Mandarin Collar medical scrubs are coming soon.",

    description:
      "Krinay Mandarin Collar Scrubs will bring a sharp contemporary professional look to healthcare workwear.",

    features: [
      "Mandarin collar styling",

      "Modern professional appearance",

      "Stretch comfort",

      "Coming soon",
    ],

    fabric:
      "92% Polyester, 8% Lycra",

    fit:
      "Modern professional fit",

    careInstructions: [
      "Product details will be announced soon",
    ],

    tags: [
      "mandarin scrubs",

      "doctor scrubs",

      "coming soon",
    ],

    reviews: [],
  },

  // =========================================================
  // JOGGER SCRUBS — COMING SOON
  // =========================================================
  {
    id: "104",

    name:
      "Jogger Scrub Collection",

    slug:
      "jogger-scrub-collection",

    category:
      "Unisex",

    gender:
      "Unisex",

    style:
      "jogger",

    productType:
      "scrub",

    price: 1699,

    originalPrice: 2499,

    setPrice: 1699,

    setOriginalPrice: 2499,

    topPrice: 849,

    topOriginalPrice: 1250,

    bottomPrice: 850,

    bottomOriginalPrice: 1250,

    discountPercent: 32,

    purchaseOptions: true,

    rating: 0,

    reviewCount: 0,

    colors: [
      "More Colours Coming Soon",
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

    badge:
      "Coming Soon",

    image:
      "/images/products/scrubs/women/airforce-blue/01-full-front.jpg",

    inStock: false,

    stock: 0,

    isNewArrival: true,

    isBestseller: false,

    featuredRank: 23,

    createdAt:
      "2026-08-23",

    shortDescription:
      "Modern Krinay Jogger Scrubs are coming soon.",

    description:
      "A contemporary jogger scrub collection with sporty trousers and healthcare-focused functionality is coming soon.",

    features: [
      "Jogger styling",

      "Modern healthcare fit",

      "Flexible movement",

      "Coming soon",
    ],

    fabric:
      "92% Polyester, 8% Lycra",

    fit:
      "Jogger fit",

    careInstructions: [
      "Product details will be announced soon",
    ],

    tags: [
      "jogger scrubs",

      "coming soon",
    ],

    reviews: [],
  },

  // =========================================================
  // CLASSIC SCRUBS — COMING SOON
  // =========================================================
  {
    id: "105",

    name:
      "Classic Scrub Collection",

    slug:
      "classic-scrub-collection",

    category:
      "Unisex",

    gender:
      "Unisex",

    style:
      "classic",

    productType:
      "scrub",

    price: 1699,

    originalPrice: 2499,

    setPrice: 1699,

    setOriginalPrice: 2499,

    topPrice: 849,

    topOriginalPrice: 1250,

    bottomPrice: 850,

    bottomOriginalPrice: 1250,

    discountPercent: 32,

    purchaseOptions: true,

    rating: 0,

    reviewCount: 0,

    colors: [
      "More Colours Coming Soon",
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

    badge:
      "Coming Soon",

    image:
      "/images/products/scrubs/men/airforce-blue/01-full-front.jpg",

    inStock: false,

    stock: 0,

    isNewArrival: false,

    isBestseller: true,

    featuredRank: 24,

    createdAt:
      "2026-08-23",

    shortDescription:
      "Krinay Classic Scrubs are coming soon.",

    description:
      "The upcoming Krinay Classic Scrub Collection will focus on clean styling, professional comfort and practical healthcare functionality.",

    features: [
      "Classic professional styling",

      "Healthcare-focused construction",

      "Multiple colours planned",

      "Coming soon",
    ],

    fabric:
      "92% Polyester, 8% Lycra",

    fit:
      "Classic fit",

    careInstructions: [
      "Product details will be announced soon",
    ],

    tags: [
      "classic scrubs",

      "coming soon",
    ],

    reviews: [],
  },

  // =========================================================
  // FLEX-U PREMIUM MEDICAL APRON — FEMALE
  // =========================================================
  {
    id: "4-female",

    name:
      "Flex-U Premium Medical Apron",

    slug:
      "flex-u-premium-medical-apron-female",

    category:
      "Lab Coats",

    gender:
      "Women",

    style:
      "classic",

    productType:
      "lab-coat",

    // MRP ₹1,599 | Offer ₹1,299
    price: 1299,

    originalPrice: 1599,

    setPrice: 1299,

    setOriginalPrice: 1599,

    discountPercent: 19,

    rating: 4.8,

    reviewCount: 18,

    colors: [
      "White",
    ],

    sizes: [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ],

    badge:
      "Premium",

    // Female primary image
    image:
      "/images/products/lab-coats/female/01-full-front-v2.jpg",

    // Exactly 5 FEMALE photos
    images: [
      "/images/products/lab-coats/female/01-full-front-v2.jpg",
      "/images/products/lab-coats/female/02-full-back.jpg",
      "/images/products/lab-coats/female/03-front-detail.jpg",
      "/images/products/lab-coats/female/04-pocket-detail.jpg",
      "/images/products/lab-coats/female/05-fabric-detail.jpg",
    ],

    colorImages: {
      White: [
        "/images/products/lab-coats/female/01-full-front-v2.jpg",
        "/images/products/lab-coats/female/02-full-back.jpg",
        "/images/products/lab-coats/female/03-front-detail.jpg",
        "/images/products/lab-coats/female/04-pocket-detail.jpg",
        "/images/products/lab-coats/female/05-fabric-detail.jpg",
      ],
    },

    inStock:
      true,

    stock:
      10,

    isNewArrival:
      true,

    isBestseller:
      false,

    featuredRank:
      50,

    createdAt:
      "2026-09-28",

    shortDescription:
      "Flex-U Premium Medical Apron for female doctors, medical students and healthcare professionals with a clean professional look and comfortable everyday fit.",

    description:
      "The Flex-U Premium Medical Apron is designed for female healthcare professionals who want a clean, professional and comfortable medical uniform. Ideal for doctors, medical students, clinicians and healthcare staff, with a practical design and premium professional finish.",

    features: [
      "Premium professional medical apron",
      "Designed for female healthcare professionals",
      "Clean white professional finish",
      "Comfortable everyday medical wear",
      "Functional utility pockets",
      "Full sleeves",
      "Available in multiple sizes",
    ],

    fabric:
      "Premium poly-cotton fabric",

    fit:
      "Regular professional fit",

    careInstructions: [
      "Wash whites separately",
      "Use mild detergent",
      "Machine wash gently",
      "Do not bleach",
      "Dry in shade",
      "Iron at medium temperature",
    ],

    tags: [
      "Flex-U medical apron",
      "premium medical apron",
      "female medical apron",
      "women doctor apron",
      "doctor coat",
      "medical lab coat",
      "white medical apron",
      "medical student apron",
      "healthcare apron",
      "Krinay apron",
      "Krinay lab coat",
    ],

    reviews: [],
  },

  // =========================================================
  // FLEX-U PREMIUM MEDICAL APRON — MALE
  // =========================================================
  {
    id: "4-male",

    name:
      "Flex-U Premium Medical Apron",

    slug:
      "flex-u-premium-medical-apron-male",

    category:
      "Lab Coats",

    gender:
      "Men",

    style:
      "classic",

    productType:
      "lab-coat",

    // MRP ₹1,599 | Offer ₹1,299
    price: 1299,

    originalPrice: 1599,

    setPrice: 1299,

    setOriginalPrice: 1599,

    discountPercent: 19,

    rating: 4.8,

    reviewCount: 18,

    colors: [
      "White",
    ],

    sizes: [
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ],

    badge:
      "Premium",

    // Male primary image
    image:
      "/images/products/lab-coats/male/01-full-front.jpg",

    // Exactly 5 MALE photos
    images: [
      "/images/products/lab-coats/male/01-full-front.jpg",
      "/images/products/lab-coats/male/02-full-back.jpg",
      "/images/products/lab-coats/male/03-front-detail.jpg",
      "/images/products/lab-coats/male/04-pocket-detail.jpg",
      "/images/products/lab-coats/male/05-fabric-detail.jpg",
    ],

    colorImages: {
      White: [
        "/images/products/lab-coats/male/01-full-front.jpg",
        "/images/products/lab-coats/male/02-full-back.jpg",
        "/images/products/lab-coats/male/03-front-detail.jpg",
        "/images/products/lab-coats/male/04-pocket-detail.jpg",
        "/images/products/lab-coats/male/05-fabric-detail.jpg",
      ],
    },

    inStock:
      true,

    stock:
      10,

    isNewArrival:
      true,

    isBestseller:
      false,

    featuredRank:
      51,

    createdAt:
      "2026-09-28",

    shortDescription:
      "Flex-U Premium Medical Apron for male doctors, medical students and healthcare professionals with a clean professional look and comfortable everyday fit.",

    description:
      "The Flex-U Premium Medical Apron is designed for male healthcare professionals who want a clean, professional and comfortable medical uniform. Ideal for doctors, medical students, clinicians and healthcare staff, with a practical design and premium professional finish.",

    features: [
      "Premium professional medical apron",
      "Designed for male healthcare professionals",
      "Clean white professional finish",
      "Comfortable everyday medical wear",
      "Functional utility pockets",
      "Full sleeves",
      "Available in multiple sizes",
    ],

    fabric:
      "Premium poly-cotton fabric",

    fit:
      "Regular professional fit",

    careInstructions: [
      "Wash whites separately",
      "Use mild detergent",
      "Machine wash gently",
      "Do not bleach",
      "Dry in shade",
      "Iron at medium temperature",
    ],

    tags: [
      "Flex-U medical apron",
      "premium medical apron",
      "male medical apron",
      "men doctor apron",
      "doctor coat",
      "medical lab coat",
      "white medical apron",
      "medical student apron",
      "healthcare apron",
      "Krinay apron",
      "Krinay lab coat",
    ],

    reviews: [],
  },
  ...CLASSIC_V_NECK_PRODUCTS,
];

/*
 * ===========================================================
 * LOOKUP
 * ===========================================================
 */
export function getProductBySlug(
  slug: string,
) {
  const legacySlugMap: Record<string, string> = {
    "womens-modern-fit-scrub-set":
      "womens-modern-fit-scrub-set-airforce-blue",
    "mens-performance-scrub-set":
      "mens-performance-scrub-set-airforce-blue",
  };

  const resolvedSlug =
    legacySlugMap[slug] ?? slug;

  return products.find(
    (product) =>
      product.slug === resolvedSlug,
  );
}

/*
 * ===========================================================
 * LIVE SCRUB CARD COLOUR ORDER
 * ===========================================================
 *
 * Required display order on both Women and Men collection pages:
 *
 * 1. Airforce Blue
 * 2. Royal Blue
 * 3. Black / Stealth Black
 */
const LIVE_SCRUB_COLOUR_ORDER: Record<string, number> = {
  Airforce: 1,
  "Airforce Blue": 1,
  "Royal Blue": 2,
  Black: 3,
  "Stealth Black": 3,
  Wine: 4,
  Olive: 5,
};

function getLiveScrubColourOrder(
  product: Product,
) {
  const primaryColour =
    product.colors?.[0] ?? "";

  const directOrder =
    LIVE_SCRUB_COLOUR_ORDER[
      primaryColour
    ];

  if (directOrder !== undefined) {
    return directOrder;
  }

  const searchable =
    `${product.name} ${product.slug}`.toLowerCase();

  if (searchable.includes("airforce")) {
    return 1;
  }

  if (
    searchable.includes("royal-blue") ||
    searchable.includes("royal blue")
  ) {
    return 2;
  }

  if (
    searchable.includes("stealth-black") ||
    searchable.includes("stealth black") ||
    searchable.includes("black")
  ) {
    return 3;
  }

  return 999;
}

/*
 * ===========================================================
 * ONLY LIVE WOMEN SCRUBS
 * ===========================================================
 */
export function getWomenProducts() {
  return products
    .filter(
      (product) =>
        product.productType === "scrub" &&
        product.gender === "Women" &&
        product.inStock,
    )
    .sort(
      (a, b) =>
        getLiveScrubColourOrder(a) -
        getLiveScrubColourOrder(b),
    );
}

/*
 * ===========================================================
 * ONLY LIVE MEN SCRUBS
 * ===========================================================
 */
export function getMenProducts() {
  return products
    .filter(
      (product) =>
        product.productType === "scrub" &&
        product.gender === "Men" &&
        product.inStock,
    )
    .sort(
      (a, b) =>
        getLiveScrubColourOrder(a) -
        getLiveScrubColourOrder(b),
    );
}

/*
 * ===========================================================
 * ALL SCRUBS
 * ===========================================================
 */
export function getScrubProducts() {
  return products.filter(
    (product) =>
      product.productType === "scrub",
  );
}

/*
 * ===========================================================
 * COMING SOON SCRUBS
 * ===========================================================
 */
export function getComingSoonScrubs() {
  return products.filter(
    (product) =>
      product.productType === "scrub" &&
      !product.inStock,
  );
}

/*
 * ===========================================================
 * LAB COATS
 * ===========================================================
 */
export function getLabCoats() {
  return products.filter(
    (product) =>
      product.productType ===
      "lab-coat",
  );
}