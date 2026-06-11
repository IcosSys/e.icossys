"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface StripeStatus {
  connected: boolean;
  stripeAccountId?: string;
  connectedAt?: string;
}

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const stripeConnected = searchParams.get("stripe_connected");
  const stripeError = searchParams.get("stripe_error");

  useEffect(() => {
    fetch("/api/stripe/status")
      .then((r) => r.json())
      .then(setStripeStatus)
      .catch(() => setStripeStatus({ connected: false }))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const clearNotification = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("stripe_connected");
    url.searchParams.delete("stripe_error");
    window.history.replaceState({}, "", url.pathname);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Administration</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Statut admin */}
        <div className="mb-8 flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-gray-700">
            Administrateur connecté
          </span>
        </div>

        {/* Notification Stripe */}
        {stripeConnected && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between">
            <p className="text-sm text-green-800 font-medium">
              Stripe connecté avec succès.
            </p>
            <button
              onClick={clearNotification}
              className="text-green-600 hover:text-green-800 text-lg leading-none"
            >
              &times;
            </button>
          </div>
        )}

        {stripeError && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between">
            <p className="text-sm text-red-800">
              Erreur Stripe : {decodeURIComponent(stripeError)}
            </p>
            <button
              onClick={clearNotification}
              className="text-red-600 hover:text-red-800 text-lg leading-none"
            >
              &times;
            </button>
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Produits */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2 className="font-semibold text-gray-900">Produits</h2>
            </div>
            <p className="text-sm text-gray-500">Gestion des produits et du catalogue.</p>
          </div>

          {/* Commandes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="font-semibold text-gray-900">Commandes</h2>
            </div>
            <p className="text-sm text-gray-500">Suivi et historique des commandes.</p>
          </div>

          {/* Stock */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="font-semibold text-gray-900">Stock</h2>
            </div>
            <p className="text-sm text-gray-500">Gestion des niveaux de stock.</p>
          </div>

          {/* Stripe */}
          <div className={`rounded-xl border p-6 ${
            stripeStatus?.connected
              ? "bg-white border-green-200"
              : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stripeStatus?.connected ? "bg-green-100" : "bg-gray-100"
              }`}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <svg className={`w-5 h-5 ${stripeStatus?.connected ? "text-green-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                )}
              </div>
              <h2 className="font-semibold text-gray-900">Stripe</h2>
              {loading ? null : stripeStatus?.connected ? (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">
                  Connecté
                </span>
              ) : (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  Non connecté
                </span>
              )}
            </div>

            {stripeStatus?.connected ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Compte Stripe connecté. Les paiements seront reçus directement sur votre compte.
                </p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>ID : <span className="font-mono">{stripeStatus.stripeAccountId}</span></p>
                  <p>Connecté le : {stripeStatus.connectedAt ? new Date(stripeStatus.connectedAt).toLocaleDateString("fr-FR") : "—"}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Connectez votre compte Stripe pour recevoir les paiements de vos clients.
                </p>
                <a
                  href="/api/stripe/connect"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Connecter Stripe
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense>
      <AdminDashboardContent />
    </Suspense>
  );
}