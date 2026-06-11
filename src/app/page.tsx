"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default function Home() {
  const { addItem, totalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      mainImage: product.mainImage,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-white text-[11px] font-bold tracking-tight">eI</span>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">e.IcosSys</span>
          </Link>

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

      {/* Hero */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 sm:pb-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight leading-tight">
              Découvrez nos <span className="text-gray-500">produits</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-500 leading-relaxed max-w-lg">
              Paiement sécurisé, livraison rapide. Explorez notre sélection et commandez en quelques clics.
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-100 rounded-2xl" />
                <div className="mt-3 h-4 bg-gray-100 rounded-lg w-3/4" />
                <div className="mt-2 h-5 bg-gray-100 rounded-lg w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">Aucun produit disponible pour le moment.</p>
            <p className="text-gray-300 text-xs mt-1">Revenez bientôt !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {products.map((product, i) => (
              <div
                key={product.id}
                className="group animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Link href={`/produit/${product.id}`} className="block">
                  <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 group-hover:border-gray-200 group-hover:shadow-lg transition-all duration-300">
                    {product.mainImage ? (
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/produit/${product.id}`}>
                      <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-base font-bold text-gray-900 mt-0.5">{formatPrice(product.price)}</p>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addedId === product.id}
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 min-h-[44px] ${
                      addedId === product.id
                        ? "bg-emerald-100 text-emerald-600 scale-95"
                        : "bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 active:scale-95"
                    }`}
                  >
                    {addedId === product.id ? <CheckIcon /> : <PlusIcon />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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