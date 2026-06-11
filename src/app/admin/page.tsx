"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useCallback } from "react";

type StripeMode = "test" | "live";

interface StripeStatus {
  connected: boolean;
  mode: StripeMode;
  testKey: boolean;
  liveKey: boolean;
  lastFour?: string;
  keyType: "test" | "live" | null;
}

interface Address {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
}

interface Order {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail: string | null;
  customerName: string | null;
  paymentStatus: string;
  created: number;
  productName: string | null;
  shippingCity: string | null;
  shippingCountry: string | null;
}

function formatFrenchDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  // Smart key input
  const [keyInput, setKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [keySuccess, setKeySuccess] = useState(false);
  const [editingKey, setEditingKey] = useState(false);

  // Commandes
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const notification = searchParams.get("stripe");

  const detectedMode = keyInput.trim().startsWith("sk_test_")
    ? "test" as StripeMode
    : keyInput.trim().startsWith("sk_live_")
      ? "live" as StripeMode
      : null;

  const fetchStatus = useCallback(() => {
    fetch("/api/stripe/status")
      .then((r) => r.json())
      .then((data) => {
        setStripeStatus(data);
        if (!data.connected) setEditingKey(true);
      })
      .catch(() => setStripeStatus({ connected: false, mode: "test", testKey: false, liveKey: false, keyType: null }))
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

  // --- Switch mode ---
  const handleSwitchMode = async (newMode: StripeMode) => {
    if (newMode === stripeStatus?.mode) return;
    setSwitching(true);
    try {
      const res = await fetch("/api/stripe/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchStatus();
      } else {
        alert(data.error || "Erreur de basculement.");
      }
    } catch {
      alert("Erreur de connexion.");
    } finally {
      setSwitching(false);
    }
  };

  // --- Sauvegarder une clé (smart) ---
  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError("");
    setKeySuccess(false);
    const trimmed = keyInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith("sk_test_") && !trimmed.startsWith("sk_live_")) {
      setKeyError("La clé doit commencer par sk_test_ ou sk_live_");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/stripe/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey: trimmed }),
      });
      const data = await res.json();
      setSaving(false);
      if (res.ok) {
        setKeySuccess(true);
        setKeyInput("");
        setEditingKey(false);
        fetchStatus();
        setTimeout(() => setKeySuccess(false), 3000);
      } else {
        setKeyError(data.error || "Erreur");
      }
    } catch {
      setSaving(false);
      setKeyError("Erreur de connexion au serveur.");
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Déconnecter Stripe ? Les deux clés seront supprimées.")) return;
    await fetch("/api/stripe/disconnect", { method: "POST" });
    setEditingKey(true);
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

  const isTest = stripeStatus?.mode === "test";
  const canSwitch = stripeStatus?.testKey && stripeStatus?.liveKey;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-gray-900">e.IcosSys</h1>
            <span className="hidden sm:inline text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">Administration</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Connecté
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
        {/* Notification */}
        {notification === "connected" && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center justify-between">
            <p className="text-sm text-green-800 font-medium">Stripe connecté avec succès.</p>
            <button onClick={clearNotification} className="text-green-600 hover:text-green-800 text-lg leading-none">&times;</button>
          </div>
        )}

        {/* ===== SECTION 1: Paramètres Stripe ===== */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Paramètres Stripe</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stripeStatus?.connected ? "bg-green-100" : "bg-gray-100"}`}>
                {loading ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                  <svg className={`w-5 h-5 ${stripeStatus?.connected ? "text-green-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">Connexion Stripe</h3>
                  {loading ? null : stripeStatus?.connected ? (
                    <>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        isTest ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"
                      }`}>
                        {isTest ? "Test" : "Production"}
                      </span>
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">Connecté</span>
                    </>
                  ) : (
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Non connecté</span>
                  )}
                </div>
                {stripeStatus?.connected && (
                  <p className="text-xs text-gray-400 mt-0.5">Clé active : sk_...{stripeStatus.lastFour}</p>
                )}
              </div>
              {stripeStatus?.connected && (
                <button onClick={handleDisconnect} className="text-sm text-red-500 hover:text-red-700 transition-colors px-3 py-2 rounded-lg hover:bg-red-50">
                  Déconnecter
                </button>
              )}
            </div>

            {/* --- État connecté : résumé + bouton changer --- */}
            {stripeStatus?.connected && !editingKey && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isTest ? "bg-indigo-500" : "bg-green-500"}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Mode {isTest ? "Test" : "Production"} actif
                    </p>
                    <p className="text-xs text-gray-500">
                      Clé : sk_...{stripeStatus.lastFour}
                      {stripeStatus.testKey && stripeStatus.liveKey && " • Test & Live configurés"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingKey(true)}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  Changer la clé
                </button>
              </div>
            )}

            {/* --- Input intelligent --- */}
            {(editingKey || !stripeStatus?.connected) && (
              <form onSubmit={handleSaveKey} className="space-y-3">
                <div>
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => { setKeyInput(e.target.value); setKeyError(""); setKeySuccess(false); }}
                    placeholder="sk_test_... ou sk_live_..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent min-h-[44px]"
                    autoFocus
                  />
                  {detectedMode && (
                    <p className="text-xs mt-2 font-medium">
                      {detectedMode === "test" ? (
                        <span className="text-indigo-600">Mode détecté : Test</span>
                      ) : (
                        <span className="text-green-600">Mode détecté : Production</span>
                      )}
                    </p>
                  )}
                </div>
                {keyError && <p className="text-xs text-red-600">{keyError}</p>}
                {keySuccess && <p className="text-xs text-green-600">Clé validée et enregistrée avec succès.</p>}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving || !keyInput.trim()}
                    className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 min-h-[44px]"
                  >
                    {saving ? "Validation..." : "Enregistrer"}
                  </button>
                  {stripeStatus?.connected && (
                    <button
                      type="button"
                      onClick={() => { setEditingKey(false); setKeyInput(""); setKeyError(""); }}
                      className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* --- Switch Test / Live (visible seulement si les deux clés configurées) --- */}
            {stripeStatus?.connected && canSwitch && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold transition-colors ${!isTest ? "text-gray-400" : "text-indigo-700"}`}>Test</span>
                    <button
                      onClick={() => handleSwitchMode(isTest ? "live" : "test")}
                      disabled={switching}
                      className="relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ backgroundColor: isTest ? "#6366f1" : "#10b981" }}
                      aria-label="Basculer entre mode test et production"
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${!isTest ? "translate-x-6" : ""}`}
                      />
                    </button>
                    <span className={`text-sm font-semibold transition-colors ${isTest ? "text-gray-400" : "text-green-700"}`}>Live</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      isTest ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"
                    }`}>
                      {switching ? "Basculement..." : isTest ? "Mode Test" : "Mode Production"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-400 mt-4">Stripe → Développeurs → Clés API. Les paiements vont directement sur votre compte.</p>
          </div>
        </section>

        {/* ===== SECTION 2 & 3: Produits + Stock (placeholder cards) ===== */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Gestion</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Produits */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Produits</h3>
                  <p className="text-xs text-gray-500">1 produit actif</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">Gestion du catalogue de produits et tarification.</p>
            </div>

            {/* Stock */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Stock</h3>
                  <p className="text-xs text-gray-500">Disponible</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">Gestion des niveaux de stock et alertes.</p>
            </div>
          </div>
        </section>

        {/* ===== SECTION 4: Commandes ===== */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Commandes</h2>

          {!stripeStatus?.connected ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">Connectez Stripe pour voir les commandes.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Orders header */}
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">Historique des commandes</h3>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    isTest ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"
                  }`}>
                    {isTest ? "Test" : "Live"}
                  </span>
                  {orders.length > 0 && (
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {orders.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={fetchOrders}
                  disabled={ordersLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 min-h-[44px]"
                >
                  <svg className={`w-4 h-4 ${ordersLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Actualiser
                </button>
              </div>

              {/* Orders list */}
              {ordersLoading && (
                <div className="p-8 text-center text-gray-400 text-sm">Chargement des commandes...</div>
              )}

              {!ordersLoading && orders.length === 0 && (
                <div className="p-12 text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <p className="text-gray-500 font-medium">Aucune commande pour le moment.</p>
                  <p className="text-gray-400 text-sm mt-1">Les commandes apparaîtront ici après un premier achat.</p>
                </div>
              )}

              {!ordersLoading && orders.length > 0 && (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Commande</th>
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Produit</th>
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paiement</th>
                          <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Livraison</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs text-gray-900">{order.id.slice(-8)}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatFrenchDate(order.created)}
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-900">{order.customerName || "—"}</p>
                              <p className="text-xs text-gray-500">{order.customerEmail || ""}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {order.productName || "Produit"}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-gray-900">
                                {formatCurrency(order.amount, order.currency)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${
                                order.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}>
                                {order.paymentStatus === "paid" ? "Payé" : "En attente"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {order.shippingCity && order.shippingCountry
                                ? `${order.shippingCity}, ${order.shippingCountry}`
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile card list */}
                  <div className="md:hidden divide-y divide-gray-100">
                    {orders.map((order) => (
                      <div key={order.id} className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-gray-900">{order.id.slice(-8)}</span>
                          <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${
                            order.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {order.paymentStatus === "paid" ? "Payé" : "En attente"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(order.amount, order.currency)}
                          </span>
                          <span className="text-xs text-gray-500">{formatFrenchDate(order.created)}</span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-700">
                            <span className="text-gray-500">Client : </span>
                            {order.customerName || "—"}
                            {order.customerEmail && (
                              <span className="text-gray-500 ml-2">{order.customerEmail}</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="text-gray-500">Produit : </span>
                            {order.productName || "Produit"}
                          </p>
                          {(order.shippingCity || order.shippingCountry) && (
                            <p className="text-sm text-gray-700">
                              <span className="text-gray-500">Livraison : </span>
                              {order.shippingCity}{order.shippingCity && order.shippingCountry && ", "}{order.shippingCountry}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center">
          <p className="text-xs text-gray-400">e.IcosSys — Plateforme e-commerce</p>
        </div>
      </footer>
    </div>
  );
}

export default function AdminDashboard() {
  return <Suspense><AdminDashboardContent /></Suspense>;
}
