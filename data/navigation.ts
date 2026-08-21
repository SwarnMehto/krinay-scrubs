export type NavigationColour = {
  name: string;
  hex: string;
  href: string;
};

export type NavigationItem = {
  name: string;
  href: string;
  description: string;
  image: string;
};

export type NavigationPromo = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  image: string;
};

export type NavigationSection = {
  label: string;
  href: string;
  colours: NavigationColour[];
  items: NavigationItem[];
  extraLinks: {
    name: string;
    href: string;
  }[];
  promo: NavigationPromo;
};

const commonColours: NavigationColour[] = [
  {
    name: "All Blues",
    hex: "#1F2A44",
    href: "/shop?color=Navy%20Blue",
  },
  {
    name: "All Reds",
    hex: "#922424",
    href: "/shop?color=Wine",
  },
  {
    name: "All Greens",
    hex: "#176B70",
    href: "/shop?color=Teal",
  },
  {
    name: "All Pastels",
    hex: "#CAB8D9",
    href: "/shop?color=Lavender",
  },
  {
    name: "All Greys",
    hex: "#6B7280",
    href: "/shop?color=Grey",
  },
  {
    name: "All Blacks",
    hex: "#111111",
    href: "/shop?color=Black",
  },
];

export const navigationSections: NavigationSection[] = [
  {
    label: "Women",
    href: "/shop?category=Women",

    colours: commonColours.map((colour) => ({
      ...colour,
      href: `${colour.href}&category=Women`,
    })),

    items: [
      {
        name: "All Women Scrubs",
        href: "/shop?category=Women",
        description: "Explore the complete women’s scrub collection.",
        image: "/images/navigation/women-all.jpg",
      },
      {
        name: "Classic Scrubs",
        href: "/shop?category=Women&style=classic",
        description: "Professional everyday scrub sets.",
        image: "/images/navigation/women-classic.jpg",
      },
      {
        name: "Jogger Scrubs",
        href: "/shop?category=Women&style=jogger",
        description: "Modern jogger-style scrub sets.",
        image: "/images/navigation/women-jogger.jpg",
      },
      {
        name: "V-Neck Scrubs",
        href: "/shop?category=Women&style=v-neck",
        description: "Comfortable V-neck scrub designs.",
        image: "/images/navigation/women-v-neck.jpg",
      },
    ],

    extraLinks: [
      {
        name: "Plus Size Scrubs",
        href: "/shop?category=Women&size=XXL",
      },
      {
        name: "New Arrivals",
        href: "/shop?category=Women&sort=newest",
      },
      {
        name: "Our Bestsellers",
        href: "/shop?category=Women&sort=rating",
      },
      {
        name: "Shop All Women",
        href: "/shop?category=Women",
      },
    ],

    promo: {
      eyebrow: "Sizes XS to 5XL",
      title: "Scrubs made for every body",
      description:
        "Comfortable women’s medical scrubs designed for movement and long shifts.",
      href: "/shop?category=Women",
      buttonLabel: "Shop Women",
      image: "/images/navigation/women-promo.jpg",
    },
  },

  {
    label: "Men",
    href: "/shop?category=Men",

    colours: commonColours.map((colour) => ({
      ...colour,
      href: `${colour.href}&category=Men`,
    })),

    items: [
      {
        name: "All Men Scrubs",
        href: "/shop?category=Men",
        description: "Explore the complete men’s scrub collection.",
        image: "/images/navigation/men-all.jpg",
      },
      {
        name: "Classic Scrubs",
        href: "/shop?category=Men&style=classic",
        description: "Professional scrubs for everyday use.",
        image: "/images/navigation/men-classic.jpg",
      },
      {
        name: "Cargo Scrubs",
        href: "/shop?category=Men&style=cargo",
        description: "Functional scrubs with utility pockets.",
        image: "/images/navigation/men-cargo.jpg",
      },
      {
        name: "V-Neck Scrubs",
        href: "/shop?category=Men&style=v-neck",
        description: "Comfortable V-neck scrub sets.",
        image: "/images/navigation/men-v-neck.jpg",
      },
    ],

    extraLinks: [
      {
        name: "Plus Size Scrubs",
        href: "/shop?category=Men&size=XXL",
      },
      {
        name: "New Arrivals",
        href: "/shop?category=Men&sort=newest",
      },
      {
        name: "Our Bestsellers",
        href: "/shop?category=Men&sort=rating",
      },
      {
        name: "Shop All Men",
        href: "/shop?category=Men",
      },
    ],

    promo: {
      eyebrow: "Professional performance",
      title: "Built for demanding shifts",
      description:
        "Functional men’s scrubs with comfortable fits and practical storage.",
      href: "/shop?category=Men",
      buttonLabel: "Shop Men",
      image: "/images/navigation/men-promo.jpg",
    },
  },
];

export const simpleNavigation = [
  {
    name: "New Arrivals",
    href: "/shop?sort=newest",
  },
  {
    name: "Bulk Order",
    href: "/bulk-order",
  },
  {
    name: "Track Order",
    href: "/track-order",
  },
];