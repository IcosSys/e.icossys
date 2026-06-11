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
  const products = await getProducts();
  const product = products.find(p => p.id === id);
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