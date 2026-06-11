"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useCallback } from "react";

interface StripeStatus {
  connected: boolean;
  lastFour?: string;
}

interface Order {
  id: string;
  amount: number;
  currency: string;
  customerEmail: string | null;
  paymentStatus: string;
  created: number;
  productName: string | null;
}

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // Commandes
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const notification = searchParams.get("stripe");

  const fetchStatus = useCallback(() => {
    fetch("/api/stripe/status")
      .then((r) => r.json())
      .then(setStripeStatus)
      .catch(() => setStripeStatus({ connected: false }))
      .finally(() => setLoading(false));
  }, []);

  const fetchOrders = useCallback(() => {
    setOrdersLoading(true);
    fetch("/api/orders?list=true")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (stripeStatus?.connected) fetchOrders();
  }, [stripeStatus?.connected, fetchOrders]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess(false);
    if (!keyInput.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/stripe/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey: keyInput.trim() }),
      });
      const data = await res.json();
      setSaving(false);
      if (res.ok) {
        setFormSuccess(true);
        setKeyInput("");
        fetchStatus();
      } else {
        setFormError(data.error || "Erreur");
      }
    } catch {
      setSaving(false);
      setFormError("Erreur de connexion au serveur.");
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Déconnecter Stripe ?")) return;
    await fetch("/api/stripe/disconnect", { method: "POST" });
    fetchStatus();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const clearNotification = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("stripe");
    window.history.replaceState({}, "", url.pathname);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Administration</h1>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 transition-colors">
            Se déconnecter
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-gray-700">Administrateur connecté</span>
        </div>

        {notification === "connected" && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-center justify-between">
            <p className="text-sm text-green-800 font-medium">Stripe connecté avec succès.</p>
            <button onClick={clearNotification} className="text-green-600 hover:text-green-800 text-lg leading-none">&times;</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
          <div className={`rounded-xl border p-6 ${stripeStatus?.connected ? "bg-white border-green-200" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stripeStatus?.connected ? "bg-green-100" : "bg-gray-100"}`}>
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
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">Connecté</span>
              ) : (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Non connecté</span>
              )}
            </div>

            {stripeStatus?.connected ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Les paiements vont directement sur votre compte Stripe.</p>
                <div className="text-xs text-gray-400"><p>Clé : sk_...{stripeStatus.lastFour}</p></div>
                <button onClick={handleDisconnect} className="text-sm text-red-500 hover:text-red-700 transition-colors">Déconnecter</button>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-3">
                <p className="text-sm text-gray-500">Collez votre clé secrète Stripe.</p>
                <input type="password" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} placeholder="sk_test_... ou sk_live_..." className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" required />
                {formError && <p className="text-xs text-red-600">{formError}</p>}
                {formSuccess && <p className="text-xs text-green-600">Clé validée et enregistrée.</p>}
                <button type="submit" disabled={saving || !keyInput.trim()} className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
                  {saving ? "Vérification..." : "Enregistrer la clé Stripe"}
                </button>
                <p className="text-xs text-gray-400">Stripe → Développeurs → Clés API.</p>
              </form>
            )}
          </div>

          {/* Commandes - résumé */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="font-semibold text-gray-900">Commandes</h2>
              {orders.length > 0 && (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">{orders.length}</span>
              )}
            </div>
            {stripeStatus?.connected ? (
              <div>
                <p className="text-sm text-gray-500 mb-3">Dernières commandes reçues.</p>
                <button onClick={fetchOrders} disabled={ordersLoading} className="text-sm text-indigo-600 hover:underline disabled:opacity-50">
                  {ordersLoading ? "Chargement..." : "Actualiser"}
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Connectez Stripe pour voir les commandes.</p>
            )}
          </div>
        </div>

        {/* Liste des commandes */}
        {stripeStatus?.connected && orders.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Historique des commandes</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="px-6 py-3 flex items-center justify-between text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-gray-900 text-xs">{order.id.slice(-12)}</p>
                    <p className="text-gray-500 text-xs truncate">
                      {order.customerEmail || "Email inconnu"} — {order.productName || "Produit"}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold text-gray-900">{(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}</p>
                    <p className="text-xs text-green-600">{order.paymentStatus}</p>
                    <p className="text-xs text-gray-400">{new Date(order.created * 1000).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stripeStatus?.connected && orders.length === 0 && !ordersLoading && (
          <p className="text-center text-gray-400 text-sm mt-4">Aucune commande pour le moment.</p>
        )}
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return <Suspense><AdminDashboardContent /></Suspense>;
}