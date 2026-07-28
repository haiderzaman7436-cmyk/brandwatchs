// src/data/products.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  stock: number;
  image: string;
  images?: string[];
  selectedImage?: string;

  // All fields from your database
  brand?: string;
  createdAt?: string;
  deliveryCharges?: number;
  deliveryDays?: number;
  discountPercent?: number;
  discountedPrice?: number;
  freeDelivery?: boolean;
  imageAlt?: Record<number, string>;
  rating?: number;
  reviewCount?: number;
  reviewRating?: number;
  reviews?: any[];
  slug?: string;
  updatedAt?: string;
  warrantyDetails?: string;
  warrantyPeriod?: string;
  warrantyType?: string;
  warrantyUnit?: string;

  // Return Policy
  isReturnable?: boolean;
  returnWindow?: number;
  returnConditions?: string;
  refundType?: string;
  returnPolicyNote?: string;
}

// ─── SUBCATEGORY INTERFACE ────────────────────────────────────────────────────
export interface SubCategory {
  id: string;
  name: string;
}

// ─── CATEGORY INTERFACE ───────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  subcategories: SubCategory[];
}

// ─── FULL CATEGORY + SUBCATEGORY LIST (Daraz-style) ──────────────────────────
export const categories: Category[] = [
  {
    id: "mens-watches",
    name: "Men Watches",
    subcategories: [
      { id: "mens-tissot", name: "Tissot" },
      { id: "mens-rado", name: "Rado" },
      { id: "mens-matturi", name: "Matturi" },
      { id: "mens-tomi", name: "Tomi" },
      { id: "mens-rolex", name: "Rolex" },
      { id: "mens-omega", name: "Omega" }
    ],
  },
  {
    id: "womens-watches",
    name: "Women Watches",
    subcategories: [
      { id: "womens-sea-star", name: "SEA STAR" },
      { id: "womens-rolex", name: "Rolex" },
      { id: "womens-cartier", name: "Cartier" },
      { id: "womens-tissot", name: "Tissot" }
    ],
  },
  {
    id: "wallets",
    name: "Wallets",
    subcategories: [
      { id: "mens-wallets", name: "Men's Wallets" },
      { id: "womens-wallets", name: "Women's Wallets" }
    ],
  },
  {
    id: "perfumes",
    name: "Perfumes",
    subcategories: [
      { id: "mens-perfumes", name: "Men's Perfumes" },
      { id: "womens-perfumes", name: "Women's Perfumes" },
      { id: "unisex-perfumes", name: "Unisex Perfumes" }
    ],
  },
  {
    id: "leather-belts",
    name: "Leather Belts",
    subcategories: [
      { id: "mens-belts", name: "Men's Belts" },
      { id: "womens-belts", name: "Women's Belts" }
    ],
  },
  {
    id: "chains",
    name: "Chains",
    subcategories: [
      { id: "silver-chains", name: "Silver Chains" },
      { id: "gold-chains", name: "Gold Chains" },
      { id: "casual-chains", name: "Casual Chains" }
    ],
  }
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Flat list of category names — for simple dropdowns
export const categoryNames: string[] = categories.map((c) => c.name);

// Get subcategories for a given category name or id
export const getSubcategories = (categoryName: string): SubCategory[] => {
  const found = categories.find(
    (c) => c.name === categoryName || c.id === categoryName
  );
  return found?.subcategories ?? [];
};