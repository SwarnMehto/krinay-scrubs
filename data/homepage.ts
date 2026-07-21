export type HomeColour = {
  name: string;
  label: string;
  hex: string;
  href: string;
};

export type HomeCollection = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  image: string;
  imagePosition?: string;
};

export type HomeTestimonial = {
  id: string;
  name: string;
  role: string;
  rating: number;
  review: string;
};

export const homeColours: HomeColour[] = [
  {
    name: "Navy Blue",
    label: "All Blues",
    hex: "#1f2a44",
    href: "/shop?color=Navy%20Blue",
  },
  {
    name: "Wine",
    label: "All Reds",
    hex: "#922424",
    href: "/shop?color=Wine",
  },
  {
    name: "Teal",
    label: "All Greens",
    hex: "#176b70",
    href: "/shop?color=Teal",
  },
  {
    name: "Lavender",
    label: "All Pastels",
    hex: "#c8b6d8",
    href: "/shop?color=Lavender",
  },
  {
    name: "Grey",
    label: "All Greys",
    hex: "#6b7280",
    href: "/shop?color=Grey",
  },
  {
    name: "Black",
    label: "All Blacks",
    hex: "#111111",
    href: "/shop?color=Black",
  },
];

export const homeCollections: HomeCollection[] = [
  {
    eyebrow: "Designed for her",
    title: "Women’s Scrubs",
    description:
      "Modern fits, jogger styles and professional medical scrubs designed for long shifts.",
    href: "/shop?category=Women",
    image: "/images/home/women-collection.jpg",
    imagePosition: "center",
  },
  {
    eyebrow: "Built for him",
    title: "Men’s Scrubs",
    description:
      "Comfortable, practical and functional scrubs with professional fits and utility pockets.",
    href: "/shop?category=Men",
    image: "/images/home/men-collection.jpg",
    imagePosition: "center",
  },
];

export const homeTestimonials: HomeTestimonial[] = [
  {
    id: "review-1",
    name: "Dr. Riya Sharma",
    role: "Dentist",
    rating: 5,
    review:
      "The scrub fabric feels soft and comfortable even during long working hours. The fitting also looks professional.",
  },
  {
    id: "review-2",
    name: "Dr. Mohit Verma",
    role: "Resident Doctor",
    rating: 5,
    review:
      "Good quality, useful pockets and a clean professional design. The scrub set feels easy to move in.",
  },
  {
    id: "review-3",
    name: "Neha Singh",
    role: "Nursing Professional",
    rating: 5,
    review:
      "The colour and fitting were exactly what I expected. Comfortable enough for a complete hospital shift.",
  },
];

export const communityImages = [
  {
    id: "community-1",
    image: "/images/home/community-1.jpg",
    label: "Comfort for every shift",
  },
  {
    id: "community-2",
    image: "/images/home/community-2.jpg",
    label: "Professional medical wear",
  },
  {
    id: "community-3",
    image: "/images/home/community-3.jpg",
    label: "Designed for movement",
  },
  {
    id: "community-4",
    image: "/images/home/community-4.jpg",
    label: "Made for healthcare teams",
  },
];