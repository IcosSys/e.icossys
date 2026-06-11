import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export interface Product {
  id: string;
  name: string;
  price: number;        // en centimes
  description: string;
  mainImage: string;    // URL
  images: string[];     // URLs supplémentaires
  active: boolean;
  createdAt: number;
}

const PRODUCTS_KEY = "products_config";

// Produits démo tendance — affichés uniquement si aucun produit n'existe
const DEMO_PRODUCTS: Product[] = [
  {
    id: "demo_1",
    name: "Air Runner Pro",
    price: 12990,
    description: "Sneakers de running ultra-légers avec semelle en mousse réactive. Conçus pour un confort maximal lors de vos sessions de course quotidienne. Tige en mesh respirant, maintien optimal du pied, et design épuré qui se porte aussi bien au sport qu'en ville. Disponible dans une coloris noir/anthracite intemporel.",
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
    description: "Montre chronographe automatique avec boîtier en acier inoxydable 42mm. Verre saphir anti-reflet, bracelet en cuir véritable cousu main. Étanche jusqu'à 100 mètres. Un classique revisité avec un cadran noir mat et aiguilles luminescentes pour une lisibilité parfaite, jour comme nuit. Idéale pour les amateurs d'horlogerie comme pour le quotidien.",
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
    description: "Sac à dos urbain en polyester recyclé avec compartiment laptop rembourré (jusqu'à 15,6 pouces). Sangles ergonomiques respirantes, pochette de transport pour accessoires, et ouverture zip complète pour un accès facile. Fabriqué à partir de matériaux durables et résistants à l'eau. Le compagnon idéal pour vos déplacements quotidiens, que ce soit au bureau ou en voyage.",
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
    description: "Casque audio sans fil à réduction de bruit active (ANC) adaptative. Son Hi-Res certifié, 40 heures d'autonomie, et coussinets en mousse à mémoire de forme pour un confort prolongé. Microphones intégrés pour les appels mains libres avec réduction de bruit environnementale. Pliable et livré avec étui de transport rigide. Compatible Bluetooth 5.3.",
    mainImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format",
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop&auto=format",
    ],
    active: true,
    createdAt: 4,
  },
];

function generateId(): string {
  return "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

async function getProducts(): Promise<Product[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PRODUCTS_KEY)?.value;
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

async function saveProducts(products: Product[]): Promise<void> {
  const cookieStore = await cookies();
  const json = JSON.stringify(products);
  if (json.length > 3800) {
    throw new Error("Limite de produits atteinte. Supprimez-en un ou réduisez les descriptions/images.");
  }
  cookieStore.set(PRODUCTS_KEY, json, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

// GET /api/products — retourne les produits actifs (public) ou tous (admin=all)
export async function GET(req: NextRequest) {
  const products = await getProducts();
  const { searchParams } = new URL(req.url);
  const isAdmin = searchParams.get("admin") === "all";

  // Fallback : si aucun produit en cookie, retourner les démos
  const source = products.length > 0 ? products : DEMO_PRODUCTS;
  const isDemo = products.length === 0;

  if (isAdmin) {
    return NextResponse.json({ allProducts: source, products: source, isDemo });
  }

  const active = source.filter(p => p.active);
  return NextResponse.json({ products: active, isDemo });
}

// POST /api/products — créer un produit (admin)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, price, description, mainImage, images } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Le nom est requis." }, { status: 400 });
  if (typeof price !== "number" || price <= 0) return NextResponse.json({ error: "Le prix doit être un nombre positif." }, { status: 400 });

  try {
    const products = await getProducts();
    const newProduct: Product = {
      id: generateId(),
      name: name.trim(),
      price,
      description: (description || "").trim(),
      mainImage: (mainImage || "").trim(),
      images: Array.isArray(images) ? images.filter((u: string) => u.trim()) : [],
      active: true,
      createdAt: Date.now(),
    };
    products.push(newProduct);
    await saveProducts(products);
    console.log(`[Products] Créé: ${newProduct.name} (${products.length} produits)`);
    return NextResponse.json({ product: newProduct, products });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}