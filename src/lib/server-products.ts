import { cookies } from "next/headers";

export interface ServerProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  mainImage: string;
  images: string[];
  active: boolean;
  createdAt: number;
}

const PRODUCTS_KEY = "products_config";

const DEMO_PRODUCTS: ServerProduct[] = [
  {
    id: "demo_1",
    name: "Air Runner Pro",
    price: 12990,
    description: "Sneakers de running ultra-légers avec semelle en mousse réactive.",
    mainImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop&auto=format",
    ],
    active: true,
    createdAt: 1,
  },
  {
    id: "demo_2",
    name: "Chrono Noir",
    price: 24900,
    description: "Montre chronographe automatique avec boîtier en acier inoxydable 42mm.",
    mainImage: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=800&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&h=800&fit=crop&auto=format",
    ],
    active: true,
    createdAt: 2,
  },
  {
    id: "demo_3",
    name: "Nomad Backpack",
    price: 8990,
    description: "Sac à dos urbain en polyester recyclé avec compartiment laptop rembourré.",
    mainImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=800&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1581605405669-fcdf81165b0c?w=800&h=800&fit=crop&auto=format",
    ],
    active: true,
    createdAt: 3,
  },
  {
    id: "demo_4",
    name: "SoundWave ANC",
    price: 17990,
    description: "Casque audio sans fil à réduction de bruit active (ANC) adaptative.",
    mainImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop&auto=format",
    ],
    active: true,
    createdAt: 4,
  },
];

/**
 * Returns all products (from cookie or demo fallback).
 * Shared between API routes and checkout to avoid duplication.
 */
export async function getProducts(): Promise<ServerProduct[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PRODUCTS_KEY)?.value;
  if (!raw) return DEMO_PRODUCTS;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch { /* ignore */ }
  return DEMO_PRODUCTS;
}

export { DEMO_PRODUCTS };