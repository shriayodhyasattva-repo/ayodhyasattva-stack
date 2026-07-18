export const STORE_NAME = "Ayodhya Store";
export const STORE_DESCRIPTION = "Premium Spiritual & Heritage Store";

export const NAVIGATION_LINKS = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/products" },
  { label: "Temple Idols", href: "/products?category=temple-idols" },
  { label: "Pooja Essentials", href: "/products?category=pooja-essentials" },
  { label: "Premium Incense", href: "/products?category=premium-incense" },
  { label: "Spiritual Books", href: "/products?category=spiritual-books" },
];

export const CATEGORIES = [
  {
    id: 1,
    name: "Temple Idols",
    slug: "temple-idols",
    description: "Exquisite handcrafted brass, marble, and wooden idols of deities.",
    image: "/images/category-idols.jpg"
  },
  {
    id: 2,
    name: "Pooja Essentials",
    slug: "pooja-essentials",
    description: "Premium copper and brass pooja thalis, diyas, and sacred utensils.",
    image: "/images/category-pooja.jpg"
  },
  {
    id: 3,
    name: "Premium Incense",
    slug: "premium-incense",
    description: "Natural temple-grade dhoop, agarbatti, and essential oils.",
    image: "/images/category-incense.jpg"
  },
  {
    id: 4,
    name: "Spiritual Books",
    slug: "spiritual-books",
    description: "Sacred scriptures, Ramayana, Bhagavad Gita, and spiritual literature.",
    image: "/images/category-books.jpg"
  }
];

export const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Temple Idols", href: "/products?category=temple-idols" },
    { label: "Pooja Essentials", href: "/products?category=pooja-essentials" },
    { label: "Incense & Oils", href: "/products?category=premium-incense" },
    { label: "Sacred Literature", href: "/products?category=spiritual-books" },
  ],
  support: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQs", href: "/faqs" },
    { label: "Shipping Policy", href: "/shipping-policy" },
    { label: "Returns & Refunds", href: "/returns-policy" },
    { label: "Track Order", href: "/track-order" },
  ],
  company: [
    { label: "Our Story", href: "/about" },
    { label: "Ayodhya Heritage", href: "/heritage" },
    { label: "Artisans & Crafts", href: "/artisans" },
    { label: "Sustainability", href: "/sustainability" },
  ],
};

export const CONTACT_INFO = {
  address: "Ram Path, Near Ram Mandir, Ayodhya, Uttar Pradesh, 224123",
  phone: "+91 800 RAM SEVA (726 7382)",
  email: "support@ayodhyastore.com",
  hours: "Mon - Sun: 9:00 AM - 8:00 PM IST",
};
