"use client";

import { useState } from "react";

export default function Home() {
  const [buying, setBuying] = useState(false);

  const handleBuy = async () => {
    setBuying(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: "Produit Test",
          price: 1000, // 10.00 EUR en centimes
          quantity: 1,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Erreur : " + (data.error || "Impossible de créer la session de paiement."));
        setBuying(false);
      }
    } catch {
      alert("Erreur de connexion au serveur.");
      setBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">eI</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">e.IcosSys</h1>
          </div>
          <a
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-2"
          >
            Administration
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg sm:max-w-xl">
          {/* Product card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Image placeholder */}
            <div className="w-full h-48 sm:h-56 bg-gray-100 flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <div className="p-5 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Produit Test</h1>
              <p className="text-gray-500 text-sm mb-5">
                Description du produit de test pour vérifier le flux de paiement.
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">10,00 &euro;</span>
                <button
                  onClick={handleBuy}
                  disabled={buying}
                  className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2"
                >
                  {buying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    "Acheter"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 text-center">
          <p className="text-xs text-gray-400">e.IcosSys — Boutique en ligne</p>
        </div>
      </footer>
    </div>
  );
}
