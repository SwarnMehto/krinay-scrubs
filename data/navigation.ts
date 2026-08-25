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

/*
 * =========================================================
 * COMMON COLOUR NAVIGATION
 * =========================================================
 */

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

/*
 * =========================================================
 * MAIN NAVIGATION
 * =========================================================
 */

export const navigationSections: NavigationSection[] = [
  /*
   * =======================================================
   * WOMEN
   * =======================================================
   */

  {
    label: "Women",

    href: "/shop?category=Women",

    /*
     * -----------------------------------------------------
     * SHOP BY COLOUR
     * -----------------------------------------------------
     */

    colours: commonColours.map((colour) => ({
      ...colour,

      href: `${colour.href}&category=Women`,
    })),

    /*
     * -----------------------------------------------------
     * WOMEN COLLECTION CARDS
     *
     * LIVE:
     * V-Neck Athletic Scrubs
     *
     * COMING SOON:
     * Classic
     * Jogger
     * -----------------------------------------------------
     */

    items: [
      {
        name: "All Women Scrubs",

        href: "/shop?category=Women",

        description:
          "Explore all currently available women’s medical scrubs.",

        image:
          "/images/products/scrubs/women/airforce-blue/01-full-front.jpg",
      },

      {
        name: "Classic Scrubs",

        href:
          "/coming-soon?category=Women&type=classic",

        description:
          "Classic women’s scrub collection coming soon.",

        image:
          "/images/products/scrubs/women/black/01-full-front.jpg",
      },

      {
        name: "Jogger Scrubs",

        href:
          "/coming-soon?category=Women&type=jogger",

        description:
          "Modern women’s jogger scrub collection coming soon.",

        image:
          "/images/products/scrubs/women/airforce-blue/07-bottom-front.jpg",
      },

      {
        name: "V-Neck Scrubs",

        href:
          "/shop?category=Women&style=athletic",

        description:
          "Shop available V-Neck Athletic Scrubs.",

        image:
          "/images/products/scrubs/women/royal-blue/01-full-front.jpg",
      },
    ],

    /*
     * -----------------------------------------------------
     * WOMEN EXTRA LINKS
     * -----------------------------------------------------
     */

    extraLinks: [
      {
        name: "Plus Size Scrubs",

        href:
          "/coming-soon?category=Women&type=plus-size",
      },

      {
        name: "New Arrivals",

        href:
          "/shop?category=Women&collection=new-arrivals",
      },

      {
        name: "Our Bestsellers",

        href:
          "/shop?category=Women&collection=bestsellers",
      },

      {
        name: "Shop All Women",

        href:
          "/shop?category=Women",
      },
    ],

    /*
     * -----------------------------------------------------
     * WOMEN PROMO
     * -----------------------------------------------------
     */

    promo: {
      eyebrow:
        "Sizes XS to 5XL",

      title:
        "Scrubs made for every body",

      description:
        "Comfortable women’s medical scrubs designed for movement and long shifts.",

      href:
        "/shop?category=Women",

      buttonLabel:
        "Shop Her",

      image:
        "/images/navigation/women-promo.jpg",
    },
  },

  /*
   * =======================================================
   * MEN
   * =======================================================
   */

  {
    label: "Men",

    href: "/shop?category=Men",

    /*
     * -----------------------------------------------------
     * SHOP BY COLOUR
     * -----------------------------------------------------
     */

    colours: commonColours.map((colour) => ({
      ...colour,

      href: `${colour.href}&category=Men`,
    })),

    /*
     * -----------------------------------------------------
     * MEN COLLECTION CARDS
     *
     * LIVE:
     * V-Neck Athletic Scrubs
     *
     * COMING SOON:
     * Classic
     * Cargo
     * -----------------------------------------------------
     */

    items: [
      {
        name: "All Men Scrubs",

        href:
          "/shop?category=Men",

        description:
          "Explore all currently available men’s medical scrubs.",

        image:
          "/images/products/scrubs/men/airforce-blue/01-full-front.jpg",
      },

      {
        name: "Classic Scrubs",

        href:
          "/coming-soon?category=Men&type=classic",

        description:
          "Classic men’s scrub collection coming soon.",

        image:
          "/images/products/scrubs/men/black/01-full-front.jpg",
      },

      {
        name: "Cargo Scrubs",

        href:
          "/coming-soon?category=Men&type=cargo",

        description:
          "Functional men’s cargo scrub collection coming soon.",

        image:
          "/images/products/scrubs/men/airforce-blue/07-bottom-front.jpg",
      },

      {
        name: "V-Neck Scrubs",

        href:
          "/shop?category=Men&style=athletic",

        description:
          "Shop available V-Neck Athletic Scrubs.",

        image:
          "/images/products/scrubs/men/royal-blue/01-full-front.jpg",
      },
    ],

    /*
     * -----------------------------------------------------
     * MEN EXTRA LINKS
     * -----------------------------------------------------
     */

    extraLinks: [
      {
        name: "Plus Size Scrubs",

        href:
          "/coming-soon?category=Men&type=plus-size",
      },

      {
        name: "New Arrivals",

        href:
          "/shop?category=Men&collection=new-arrivals",
      },

      {
        name: "Our Bestsellers",

        href:
          "/shop?category=Men&collection=bestsellers",
      },

      {
        name: "Shop All Men",

        href:
          "/shop?category=Men",
      },
    ],

    /*
     * -----------------------------------------------------
     * MEN PROMO
     * -----------------------------------------------------
     */

    promo: {
      eyebrow:
        "Professional performance",

      title:
        "Built for demanding shifts",

      description:
        "Functional men’s scrubs with comfortable fits and practical storage.",

      href:
        "/shop?category=Men",

      buttonLabel:
        "Shop Him",

      image:
        "/images/navigation/men-promo.jpg",
    },
  },
];

/*
 * =========================================================
 * SIMPLE NAVIGATION
 * =========================================================
 */

export const simpleNavigation = [
  {
    name: "New Arrivals",

    href:
      "/shop?collection=new-arrivals",
  },

  {
    name: "Bulk Order",

    href:
      "/bulk-order",
  },

  {
    name: "Track Order",

    href:
      "/track-order",
  },
];