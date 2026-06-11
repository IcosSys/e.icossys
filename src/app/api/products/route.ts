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
  // Vérifier la taille du cookie (limite ~4KB)
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
  if (searchParams.get("admin") === "all") {
    return NextResponse.json({ allProducts: products, products });
  }
  const active = products.filter(p => p.active);
  return NextResponse.json({ products: active });
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