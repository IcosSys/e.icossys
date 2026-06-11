"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  mainImage: string;
  images: string[];
  active: boolean;
}

function CartIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addItem, totalItems } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(d => {
        setProduct(d.product);
        if (d.product?.mainImage) setSelectedImage(-1); // -1 = main image
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const allImages = product
    ? [product.mainImage, ...product.images].filter(Boolean)
    : [];

  const currentImage = selectedImage === -1
    ? product?.mainImage || ""
    : allImages[selectedImage] || "";

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        mainImage: product.mainImage,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
            <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-100 rounded-lg w-1/3 animate-pulse" />
              <div className="h-8 bg-gray-100 rounded-lg w-2/3 animate-pulse" />
              <div className="h-10 bg-gray-100 rounded-lg w-1/4 animate-pulse" />
              <div className="space-y-2 mt-6">
                <div className="h-4 bg-gray-100 rounded-lg w-full animate-pulse" />
                <div className="h-4 bg-gray-100 rounded-lg w-5/6 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded-lg w-4/6 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm mb-4">Produit introuvable.</p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeftIcon /> Retour à la boutique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
            >
              <ArrowLeftIcon />
            </button>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">eI</span>
              </div>
              <span className="text-sm font-bold text-gray-900">e.IcosSys</span>
            </Link>
          </div>
          <Link
            href="/panier"
            className="relative flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 -mr-3 rounded-xl hover:bg-gray-50"
          >
            <CartIcon />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Product */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-14">
            {/* Images */}
            <div className="space-y-3">
              {/* Main Image */}
              <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                {currentImage && !imgError.has(selectedImage === -1 ? -1 : selectedImage) ? (
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(prev => new Set(prev).add(selectedImage === -1 ? -1 : selectedImage))}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-20 h-20 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => {
                    const realIdx = idx === 0 ? -1 : idx - 1;
                    const isSelected = selectedImage === realIdx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(realIdx)}
                        className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          isSelected ? "border-gray-900 ring-1 ring-gray-900" : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {!imgError.has(realIdx) ? (
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={() => setImgError(prev => new Set(prev).add(realIdx))}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  {product.name}
                </h1>

                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
                  {formatPrice(product.price)}
                </p>

                <div className="mt-1 text-xs text-gray-400">
                  TTC · Frais de port calculés à l&apos;étape suivante
                </div>

                {product.description && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.08em] mb-3">Description</h2>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Add to cart */}
              <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                {/* Quantity */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600">Quantité</span>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors text-lg"
                    >
                      −
                    </button>
                    <span className="w-12 text-center text-sm font-semibold text-gray-900">{qty}</span>
                    <button
                      onClick={() => setQty(q => q + 1)}
                      className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={added}
                    className={`flex-1 min-h-[48px] px-8 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                      added
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"
                    }`}
                  >
                    {added ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Ajouté au panier
                      </>
                    ) : (
                      <>
                        <CartIcon className="w-5 h-5" />
                        Ajouter au panier
                      </>
                    )}
                  </button>

                  {added && (
                    <Link
                      href="/panier"
                      className="sm:w-auto px-6 py-3.5 border border-gray-900 text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
                    >
                      Voir le panier
                    </Link>
                  )}
                </div>

                {/* Security badge */}
                <div className="flex items-center gap-2 pt-2">
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  <span className="text-[11px] text-gray-400">Paiement sécurisé par Stripe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50/50 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">eI</span>
            </div>
            <span className="text-xs text-gray-400">e.IcosSys</span>
          </div>
          <p className="text-xs text-gray-300">Paiement sécurisé par Stripe</p>
        </div>
      </footer>
    </div>
  );
}