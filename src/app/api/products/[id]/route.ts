import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export interface Product {
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

const DEMO_PRODUCTS: Product[] = [
  {
    id: "demo_1", name: "Air Runner Pro", price: 12990,
    description: "Sneakers de running ultra-légers avec semelle en mousse réactive. Conçus pour un confort maximal lors de vos sessions de course quotidienne. Tige en mesh respirant, maintien optimal du pied, et design épuré qui se porte aussi bien au sport qu'en ville.",
    mainImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&auto=format",
    images: ["https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=800&fit=crop&auto=format"],
    active: true, createdAt: 1,
  },
  {
    id: "demo_2", name: "Chrono Noir", price: 24900,
    description: "Montre chronographe automatique avec boîtier en acier inoxydable 42mm. Verre saphir anti-reflet, bracelet en cuir véritable cousu main. Étanche jusqu'à 100 mètres.",
    mainImage: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=800&fit=crop&auto=format",
    images: ["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&h=800&fit=crop&auto=format"],
    active: true, createdAt: 2,
  },
  {
    id: "demo_3", name: "Nomad Backpack", price: 8990,
    description: "Sac à dos urbain en polyester recyclé avec compartiment laptop rembourré (jusqu'à 15,6 pouces). Sangles ergonomiques respirantes, pochette de transport pour accessoires.",
    mainImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&auto=format",
    images: ["https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=800&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1581605405669-fcdf81165b0c?w=800&h=800&fit=crop&auto=format"],
    active: true, createdAt: 3,
  },
  {
    id: "demo_4", name: "SoundWave ANC", price: 17990,
    description: "Casque audio sans fil à réduction de bruit active (ANC) adaptative. Son Hi-Res certifié, 40 heures d'autonomie, et coussinets en mousse à mémoire de forme.",
    mainImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&auto=format",
    images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop&auto=format"],
    active: true, createdAt: 4,
  },
];

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
    throw new Error("Limite de produits atteinte.");
  }
  cookieStore.set(PRODUCTS_KEY, json, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

// GET /api/products/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let products = await getProducts();
  // Fallback vers les démos si le cookie est vide
  const source = products.length > 0 ? products : DEMO_PRODUCTS;
  const product = source.find(p => p.id === id);
  if (!product) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
  return NextResponse.json({ product });
}

// PUT /api/products/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const products = await getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });

  // Mise à jour partielle
  if (body.name !== undefined) products[idx].name = String(body.name).trim();
  if (body.price !== undefined) {
    if (typeof body.price !== "number" || body.price <= 0) {
      return NextResponse.json({ error: "Prix invalide." }, { status: 400 });
    }
    products[idx].price = body.price;
  }
  if (body.description !== undefined) products[idx].description = String(body.description).trim();
  if (body.mainImage !== undefined) products[idx].mainImage = String(body.mainImage).trim();
  if (body.images !== undefined) products[idx].images = Array.isArray(body.images) ? body.images.filter((u: string) => u.trim()) : [];
  if (body.active !== undefined) products[idx].active = Boolean(body.active);

  try {
    await saveProducts(products);
    console.log(`[Products] Mis à jour: ${products[idx].name}`);
    return NextResponse.json({ product: products[idx], products });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const products = await getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });

  const removed = products.splice(idx, 1)[0];
  await saveProducts(products);
  console.log(`[Products] Supprimé: ${removed.name} (${products.length} restants)`);
  return NextResponse.json({ success: true, products });
}