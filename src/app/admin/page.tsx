"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useCallback, useRef } from "react";

type StripeMode = "test" | "live";

interface StripeStatus {
  connected: boolean;
  mode: StripeMode;
  testKey: boolean;
  liveKey: boolean;
  lastFour?: string;
  keyType: "test" | "live" | null;
}

interface Order {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail: string | null;
  customerName: string | null;
  paymentStatus: string;
  orderStatus: string;
  created: number;
  productName: string | null;
  shippingCity: string | null;
  shippingCountry: string | null;
  shippingName: string | null;
}

interface OrderDetail extends Order {
  customerPhone: string | null;
  shippingName: string | null;
  shippingAddress: {
    line1: string | null; line2: string | null; city: string | null;
    state: string | null; postalCode: string | null; country: string | null;
  } | null;
  billingAddress: {
    line1: string | null; line2: string | null; city: string | null;
    state: string | null; postalCode: string | null; country: string | null;
  } | null;
}

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: "Payé", color: "text-green-700", bg: "bg-green-100" },
  processing: { label: "En préparation", color: "text-blue-700", bg: "bg-blue-100" },
  shipped: { label: "Expédié", color: "text-purple-700", bg: "bg-purple-100" },
  delivered: { label: "Livré", color: "text-gray-700", bg: "bg-gray-100" },
  cancelled: { label: "Annulé", color: "text-red-700", bg: "bg-red-100" },
};

const STATUS_FLOW = ["paid", "processing", "shipped", "delivered"] as const;

function fmtDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function fmtAddress(addr: { line1: string | null; line2: string | null; city: string | null; state: string | null; postalCode: string | null; country: string | null } | null): string {
  if (!addr) return "Non renseignée";
  return [addr.line1, addr.line2, addr.postalCode, addr.city, addr.state, addr.country]
    .filter(Boolean).join(", ") || "Non renseignée";
}

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Stripe
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [keySuccess, setKeySuccess] = useState(false);
  const [editingKey, setEditingKey] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newNotification, setNewNotification] = useState<string | null>(null);
  const prevOrdersRef = useRef<string>("");

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const autoRefreshRef = useRef(true);
  autoRefreshRef.current = autoRefresh;

  const detectedMode = keyInput.trim().startsWith("sk_test_")
    ? "test" as StripeMode
    : keyInput.trim().startsWith("sk_live_")
      ? "live" as StripeMode
      : null;

  // --- Fetches ---
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
      .then((data) => {
        const newOrders = data.orders || [];
        const oldIds = prevOrdersRef.current;
        const newIds = newOrders.map((o: Order) => o.id).join(",");

        // Detect new orders
        if (oldIds && newIds !== oldIds) {
          const oldSet = new Set(oldIds.split(","));
          const fresh = newOrders.filter((o: Order) => !oldSet.has(o.id));
          if (fresh.length > 0 && autoRefreshRef.current) {
            const latest = fresh[0];
            setNewNotification(`Nouvelle commande de ${latest.customerName || latest.customerEmail || "client"} — ${fmtCurrency(latest.amount, latest.currency)}`);
            setTimeout(() => setNewNotification(null), 6000);
          }
        }
        prevOrdersRef.current = newIds;
        setOrders(newOrders);
      })
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);
  useEffect(() => {
    if (stripeStatus?.connected) fetchOrders();
  }, [stripeStatus?.connected, fetchOrders]);

  // Auto-refresh every 20s
  useEffect(() => {
    if (!stripeStatus?.connected || !autoRefresh) return;
    const interval = setInterval(() => {
      if (autoRefreshRef.current) fetchOrders();
    }, 20000);
    return () => clearInterval(interval);
  }, [stripeStatus?.connected, autoRefresh, fetchOrders]);

  // --- Handlers ---
  const handleSwitchMode = async (newMode: StripeMode) => {
    if (newMode === stripeStatus?.mode) return;
    setSwitching(true);
    try {
      const res = await fetch("/api/stripe/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      });
      if (res.ok) fetchStatus();
      else {
        const data = await res.json();
        alert(data.error || "Erreur de basculement.");
      }
    } catch { alert("Erreur de connexion."); }
    finally { setSwitching(false); }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError(""); setKeySuccess(false);
    const trimmed = keyInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("sk_test_") && !trimmed.startsWith("sk_live_")) {
      setKeyError("La clé doit commencer par sk_test_ ou sk_live_"); return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/stripe/configure", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey: trimmed }),
      });
      const data = await res.json();
      setSaving(false);
      if (res.ok) {
        setKeySuccess(true); setKeyInput(""); setEditingKey(false); fetchStatus();
        setTimeout(() => setKeySuccess(false), 3000);
      } else { setKeyError(data.error || "Erreur"); }
    } catch { setSaving(false); setKeyError("Erreur de connexion."); }
  };

  const handleDisconnect = async () => {
    if (!confirm("Déconnecter Stripe ? Les deux clés seront supprimées.")) return;
    await fetch("/api/stripe/disconnect", { method: "POST" });
    setEditingKey(true); fetchStatus();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const openOrderDetail = async (orderId: string) => {
    setSelectedOrder(null);
    setOrderDetailLoading(true);
    try {
      const res = await fetch(`/api/orders?session_id=${orderId}`);
      const data = await res.json();
      if (res.ok) setSelectedOrder(data);
    } catch { /* ignore */ }
    finally { setOrderDetailLoading(false); }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch("/api/orders/status", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: orderId, status: newStatus }),
      });
      if (res.ok) {
        // Update local state
        setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, orderStatus: newStatus } : null);
        }
      } else {
        const data = await res.json();
        alert(data.error || "Erreur");
      }
    } catch { alert("Erreur de connexion."); }
    finally { setUpdatingStatus(false); }
  };

  const isTest = stripeStatus?.mode === "test";
  const canSwitch = stripeStatus?.testKey && stripeStatus?.liveKey;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold">eI</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">e.IcosSys</h1>
              <span className="hidden sm:inline text-[11px] text-gray-400">Administration</span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50">
            Se déconnecter
          </button>
        </div>
      </header>

      {/* Toast notification */}
      {newNotification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-sm">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-green-400">Nouvelle commande</p>
              <p className="text-xs text-gray-300 mt-0.5">{newNotification}</p>
            </div>
            <button onClick={() => setNewNotification(null)} className="text-gray-400 hover:text-white ml-2">&times;</button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">

        {/* ===== PARAMÈTRES STRIPE ===== */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">Paramètres Stripe</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            {/* En-tête connexion */}
            <div className="flex items-start sm:items-center justify-between gap-3 mb-4 flex-col sm:flex-row">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stripeStatus?.connected ? "bg-green-100" : "bg-gray-100"}`}>
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : (
                    <svg className={`w-4 h-4 ${stripeStatus?.connected ? "text-green-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">Connexion Stripe</span>
                    {loading ? null : stripeStatus?.connected ? (
                      <>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${isTest ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"}`}>
                          {isTest ? "Test" : "Live"}
                        </span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">Connecté</span>
                      </>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Non connecté</span>
                    )}
                  </div>
                  {stripeStatus?.connected && (
                    <p className="text-[11px] text-gray-400 mt-0.5">sk_...{stripeStatus.lastFour}</p>
                  )}
                </div>
              </div>
              {stripeStatus?.connected && (
                <button onClick={handleDisconnect} className="text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  Déconnecter
                </button>
              )}
            </div>

            {/* Clé connectée */}
            {stripeStatus?.connected && !editingKey && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${isTest ? "bg-indigo-500" : "bg-green-500"}`} />
                  <span className="text-sm text-gray-700">Mode {isTest ? "Test" : "Production"} actif</span>
                </div>
                <button onClick={() => setEditingKey(true)} className="text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100">
                  Changer la clé
                </button>
              </div>
            )}

            {/* Input clé */}
            {(editingKey || !stripeStatus?.connected) && (
              <form onSubmit={handleSaveKey} className="space-y-2">
                <input type="password" value={keyInput} onChange={(e) => { setKeyInput(e.target.value); setKeyError(""); setKeySuccess(false); }}
                  placeholder="sk_test_... ou sk_live_..." autoFocus
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent min-h-[44px]" />
                {detectedMode && (
                  <p className="text-xs font-medium">{detectedMode === "test" ? <span className="text-indigo-600">Mode détecté : Test</span> : <span className="text-green-600">Mode détecté : Production</span>}</p>
                )}
                {keyError && <p className="text-xs text-red-600">{keyError}</p>}
                {keySuccess && <p className="text-xs text-green-600">Clé validée et enregistrée.</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={saving || !keyInput.trim()} className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 min-h-[44px]">
                    {saving ? "Validation..." : "Enregistrer"}
                  </button>
                  {stripeStatus?.connected && (
                    <button type="button" onClick={() => { setEditingKey(false); setKeyInput(""); setKeyError(""); }} className="px-4 py-2.5 text-sm text-gray-500">
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Switch Test/Live */}
            {stripeStatus?.connected && canSwitch && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${!isTest ? "text-gray-400" : "text-indigo-700"}`}>Test</span>
                    <button onClick={() => handleSwitchMode(isTest ? "live" : "test")} disabled={switching}
                      className="relative w-11 h-6 rounded-full transition-colors focus:outline-none disabled:opacity-40"
                      style={{ backgroundColor: isTest ? "#6366f1" : "#10b981" }}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${!isTest ? "translate-x-5" : ""}`} />
                    </button>
                    <span className={`text-xs font-semibold ${isTest ? "text-gray-400" : "text-green-700"}`}>Live</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===== GESTION ===== */}
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3 px-1">Gestion</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Produits</h3>
                  <p className="text-[11px] text-gray-400">1 produit actif</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Gestion du catalogue et tarification.</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">Stock</h3>
                  <p className="text-[11px] text-gray-400">Disponible</p>
                </div>
              </div>
              <p className="text-xs text-gray-500">Gestion des niveaux de stock et alertes.</p>
            </div>
          </div>
        </section>

        {/* ===== COMMANDES ===== */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Commandes</h2>
            {stripeStatus?.connected && orders.length > 0 && (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                  <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded border-gray-300" />
                  Auto (20s)
                </label>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${isTest ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"}`}>
                  {isTest ? "Test" : "Live"}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{orders.length}</span>
              </div>
            )}
          </div>

          {!stripeStatus?.connected ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <p className="text-sm text-gray-400">Connectez Stripe pour voir les commandes.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Toolbar */}
              <div className="px-4 sm:px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">Historique</h3>
                <button onClick={fetchOrders} disabled={ordersLoading} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  <svg className={`w-3.5 h-3.5 ${ordersLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Actualiser
                </button>
              </div>

              {ordersLoading && orders.length === 0 && (
                <div className="p-10 text-center text-gray-400 text-sm">Chargement...</div>
              )}

              {!ordersLoading && orders.length === 0 && (
                <div className="p-12 text-center">
                  <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <p className="text-gray-500 font-medium text-sm">Aucune commande pour le moment.</p>
                  <p className="text-gray-400 text-xs mt-1">Les commandes apparaîtront ici automatiquement.</p>
                </div>
              )}

              {orders.length > 0 && (
                <>
                  {/* Desktop table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/80 text-left">
                          <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Commande</th>
                          <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                          <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                          <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Paiement</th>
                          <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">État</th>
                          <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Livraison</th>
                          <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {orders.map((order) => {
                          const sc = ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG.paid;
                          return (
                            <tr key={order.id} className="hover:bg-gray-50/50 cursor-pointer transition-colors" onClick={() => openOrderDetail(order.id)}>
                              <td className="px-4 py-3">
                                <span className="font-mono text-xs text-gray-900">{order.id.slice(-8)}</span>
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-600">{fmtDate(order.created)}</td>
                              <td className="px-4 py-3">
                                <p className="text-xs font-medium text-gray-900 truncate max-w-[160px]">{order.customerName || "—"}</p>
                                <p className="text-[11px] text-gray-400 truncate max-w-[160px]">{order.customerEmail || ""}</p>
                              </td>
                              <td className="px-4 py-3 text-xs font-semibold text-gray-900">{fmtCurrency(order.amount, order.currency)}</td>
                              <td className="px-4 py-3">
                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                  {order.paymentStatus === "paid" ? "Payé" : "Attente"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  value={order.orderStatus}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  disabled={updatingStatus}
                                  className={`text-[11px] font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${sc.bg} ${sc.color}`}
                                >
                                  {Object.entries(ORDER_STATUS_CONFIG).map(([val, cfg]) => (
                                    <option key={val} value={val}>{cfg.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3 text-xs text-gray-500">
                                {order.shippingCity ? `${order.shippingCity}, ${order.shippingCountry}` : "—"}
                              </td>
                              <td className="px-4 py-3">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="lg:hidden divide-y divide-gray-100">
                    {orders.map((order) => {
                      const sc = ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG.paid;
                      return (
                        <div key={order.id} className="p-4 space-y-2.5 cursor-pointer active:bg-gray-50" onClick={() => openOrderDetail(order.id)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-gray-900">{order.id.slice(-8)}</span>
                              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>{sc.label}</span>
                            </div>
                            <span className="text-xs font-semibold text-gray-900">{fmtCurrency(order.amount, order.currency)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-600 truncate max-w-[60%]">{order.customerName || order.customerEmail || "—"}</p>
                            <p className="text-[11px] text-gray-400">{fmtDate(order.created)}</p>
                          </div>
                          {order.shippingCity && (
                            <p className="text-[11px] text-gray-400">Livraison : {order.shippingCity}, {order.shippingCountry}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ===== MODAL DÉTAIL COMMANDE ===== */}
      {(selectedOrder || orderDetailLoading) && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" onClick={() => setSelectedOrder(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
            {orderDetailLoading ? (
              <div className="p-10 text-center"><div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto" /><p className="text-sm text-gray-400 mt-3">Chargement...</p></div>
            ) : selectedOrder ? (
              <div>
                {/* Modal header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Commande {selectedOrder.id.slice(-8)}</h3>
                    <p className="text-xs text-gray-400">{fmtDate(selectedOrder.created)}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600">&times;</button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Produit + Montant */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedOrder.productName || "Produit"}</p>
                      <p className="text-xs text-gray-400">x1</p>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{fmtCurrency(selectedOrder.amount, selectedOrder.currency)}</span>
                  </div>

                  {/* Statuts */}
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 rounded-lg bg-gray-50 text-center">
                      <p className="text-[11px] text-gray-400 mb-1">Paiement</p>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${selectedOrder.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {selectedOrder.paymentStatus === "paid" ? "Payé" : "En attente"}
                      </span>
                    </div>
                    <div className="flex-1 p-3 rounded-lg bg-gray-50 text-center">
                      <p className="text-[11px] text-gray-400 mb-1">Commande</p>
                      <select
                        value={selectedOrder.orderStatus}
                        onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                        disabled={updatingStatus}
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-0 cursor-pointer ${
                          (ORDER_STATUS_CONFIG[selectedOrder.orderStatus] || ORDER_STATUS_CONFIG.paid).bg
                        } ${
                          (ORDER_STATUS_CONFIG[selectedOrder.orderStatus] || ORDER_STATUS_CONFIG.paid).color
                        }`}
                      >
                        {Object.entries(ORDER_STATUS_CONFIG).map(([val, cfg]) => (
                          <option key={val} value={val}>{cfg.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Pipeline visuel */}
                  <div className="flex items-center gap-1 px-2">
                    {STATUS_FLOW.map((step, i) => {
                      const isActive = STATUS_FLOW.indexOf(selectedOrder.orderStatus as typeof STATUS_FLOW[number]) >= i;
                      const isCurrent = selectedOrder.orderStatus === step;
                      const cfg = ORDER_STATUS_CONFIG[step];
                      return (
                        <div key={step} className="flex-1 flex items-center gap-1">
                          <div className={`flex-1 h-1.5 rounded-full ${isActive ? (isCurrent ? cfg.bg.replace("100", "500") : cfg.bg) : "bg-gray-100"} transition-colors`} title={cfg.label} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between px-1 -mt-1">
                    {STATUS_FLOW.map((step) => (
                      <span key={step} className="text-[10px] text-gray-400">{ORDER_STATUS_CONFIG[step].label}</span>
                    ))}
                  </div>

                  {/* Client */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Client</h4>
                    <div className="space-y-1.5 text-sm">
                      {selectedOrder.customerName && <p className="text-gray-900">{selectedOrder.customerName}</p>}
                      {selectedOrder.customerEmail && <p className="text-gray-600 text-xs">{selectedOrder.customerEmail}</p>}
                      {selectedOrder.customerPhone && <p className="text-gray-600 text-xs">{selectedOrder.customerPhone}</p>}
                    </div>
                  </div>

                  {/* Adresse de livraison */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Adresse de livraison</h4>
                    <p className="text-sm text-gray-700">{fmtAddress(selectedOrder.shippingAddress)}</p>
                    {selectedOrder.shippingName && selectedOrder.shippingName !== selectedOrder.customerName && (
                      <p className="text-xs text-gray-400 mt-1">Destinataire : {selectedOrder.shippingName}</p>
                    )}
                  </div>

                  {/* Adresse de facturation */}
                  {selectedOrder.billingAddress && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Adresse de facturation</h4>
                      <p className="text-sm text-gray-700">{fmtAddress(selectedOrder.billingAddress)}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return <Suspense><AdminDashboardContent /></Suspense>;
}