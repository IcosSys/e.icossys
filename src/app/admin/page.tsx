"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useCallback, useRef } from "react";

type StripeMode = "test" | "live";

// --- Types ---

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
  amountSubtotal: number | null;
  amountShipping: number | null;
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
  shippingMethod: string | null;
}

interface OrderDetail extends Order {
  customerPhone: string | null;
  shippingAddress: {
    line1: string | null; line2: string | null; city: string | null;
    state: string | null; postalCode: string | null; country: string | null;
  } | null;
  billingAddress: {
    line1: string | null; line2: string | null; city: string | null;
    state: string | null; postalCode: string | null; country: string | null;
  } | null;
  unitPrice: number | null;
  quantity: number | null;
}

interface Notification {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  amount: number;
  currency: string;
  productName: string | null;
  time: number;
  read: boolean;
}

// --- Config ---

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  paid:       { label: "Payé",          color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  processing: { label: "En préparation", color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",       dot: "bg-blue-500" },
  shipped:    { label: "Expédié",       color: "text-violet-700",  bg: "bg-violet-50 border-violet-200",   dot: "bg-violet-500" },
  delivered:  { label: "Livré",         color: "text-gray-700",    bg: "bg-gray-100 border-gray-200",      dot: "bg-gray-500" },
  cancelled:  { label: "Annulé",        color: "text-red-700",     bg: "bg-red-50 border-red-200",         dot: "bg-red-500" },
};

const STATUS_FLOW = ["paid", "processing", "shipped", "delivered"] as const;

// --- Helpers ---

function fmtDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric",
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

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

// --- Icons ---

function BellIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function PackageIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function TruckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}

// --- Main Component ---

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

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [bellRinging, setBellRinging] = useState(false);
  const [toastNotif, setToastNotif] = useState<string | null>(null);
  const prevOrdersRef = useRef<string>("");
  const notifPanelRef = useRef<HTMLDivElement>(null);

  // Auto-refresh (always on in background)
  const autoRefreshRef = useRef(true);

  const detectedMode = keyInput.trim().startsWith("sk_test_")
    ? "test" as StripeMode
    : keyInput.trim().startsWith("sk_live_")
      ? "live" as StripeMode
      : null;

  // Close notification panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
        const newOrders: Order[] = data.orders || [];
        const oldIds = prevOrdersRef.current;
        const newIds = newOrders.map((o: Order) => o.id).join(",");

        // Detect new orders
        if (oldIds && newIds !== oldIds) {
          const oldSet = new Set(oldIds.split(","));
          const fresh = newOrders.filter((o: Order) => !oldSet.has(o.id));
          if (fresh.length > 0) {
            // Add notifications for each new order
            fresh.forEach((order: Order) => {
              const notif: Notification = {
                id: order.id,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                amount: order.amount,
                currency: order.currency,
                productName: order.productName,
                time: Date.now(),
                read: false,
              };
              setNotifications((prev) => [notif, ...prev].slice(0, 50));
              setUnreadCount((prev) => prev + 1);
            });
            // Show toast for latest
            const latest = fresh[0];
            setToastNotif(
              `${latest.customerName || latest.customerEmail || "Client"} — ${latest.productName || "Commande"} — ${fmtCurrency(latest.amount, latest.currency)}`
            );
            setTimeout(() => setToastNotif(null), 5000);
            // Ring bell
            setBellRinging(true);
            setTimeout(() => setBellRinging(false), 800);
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

  // Auto-refresh every 15s in background
  useEffect(() => {
    if (!stripeStatus?.connected) return;
    const interval = setInterval(() => {
      if (autoRefreshRef.current) fetchOrders();
    }, 15000);
    return () => clearInterval(interval);
  }, [stripeStatus?.connected, fetchOrders]);

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

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // --- Derived values ---
  const isTest = stripeStatus?.mode === "test";
  const canSwitch = stripeStatus?.testKey && stripeStatus?.liveKey;
  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const lastOrder = orders.length > 0 ? orders[0] : null;

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">

      {/* ===== HEADER ===== */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-sm">
              <span className="text-white text-[11px] font-bold tracking-tight">eI</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">e.IcosSys</h1>
              <span className="text-[10px] text-gray-400 font-medium">Administration</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative" ref={notifPanelRef}>
              <button
                onClick={() => {
                  setShowNotifPanel(!showNotifPanel);
                  if (showNotifPanel) markAllRead();
                }}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
              >
                <span className={bellRinging ? "animate-bell-ring inline-block" : ""}>
                  <BellIcon className="w-[20px] h-[20px]" />
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse-dot">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Panel */}
              {showNotifPanel && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden animate-fade-scale-in z-50">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">{unreadCount} nouvelles</span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button onClick={markAllRead} className="text-[11px] text-gray-500 hover:text-gray-700 font-medium">
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                          <BellIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-400">Aucune notification</p>
                        <p className="text-[10px] text-gray-300 mt-0.5">Les nouvelles commandes apparaîtront ici</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => { openOrderDetail(n.id); setShowNotifPanel(false); markAllRead(); }}
                          className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50/80 transition-colors ${!n.read ? "bg-blue-50/30" : ""}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${!n.read ? "bg-blue-100" : "bg-gray-100"}`}>
                              <PackageIcon className={`w-4 h-4 ${!n.read ? "text-blue-600" : "text-gray-400"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-semibold text-gray-900 truncate">
                                  {n.customerName || n.customerEmail || "Client"}
                                </p>
                                <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(n.time)}</span>
                              </div>
                              {n.productName && (
                                <p className="text-[11px] text-gray-500 truncate mt-0.5">{n.productName}</p>
                              )}
                              <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">{fmtCurrency(n.amount, n.currency)}</p>
                            </div>
                            {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mode badge */}
            {stripeStatus?.connected && (
              <span className={`hidden sm:inline-flex text-[10px] font-bold px-2.5 py-1 rounded-lg ${isTest ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"}`}>
                {isTest ? "TEST" : "LIVE"}
              </span>
            )}

            {/* Logout */}
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 font-medium">
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* ===== TOAST NOTIFICATION ===== */}
      {toastNotif && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm border border-gray-700/50">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Nouvelle commande</p>
              <p className="text-xs text-gray-300 mt-0.5 truncate">{toastNotif}</p>
            </div>
            <button onClick={() => setToastNotif(null)} className="text-gray-500 hover:text-white ml-2 flex-shrink-0 text-lg leading-none">&times;</button>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* ===== KPI STATS ===== */}
        {stripeStatus?.connected && orders.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl border border-gray-200/60 p-4 animate-fade-up" style={{ animationDelay: "0ms" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-[11px] font-medium text-gray-400">Chiffre d&apos;affaires</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{fmtCurrency(totalRevenue, "eur")}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/60 p-4 animate-fade-up" style={{ animationDelay: "60ms" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <PackageIcon className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-[11px] font-medium text-gray-400">Commandes</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/60 p-4 animate-fade-up" style={{ animationDelay: "120ms" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                  <TruckIcon className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <span className="text-[11px] font-medium text-gray-400">En cours</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {orders.filter((o) => o.orderStatus === "paid" || o.orderStatus === "processing").length}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/60 p-4 animate-fade-up" style={{ animationDelay: "180ms" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-[11px] font-medium text-gray-400">Dernière</span>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {lastOrder ? fmtDate(lastOrder.created) : "—"}
              </p>
            </div>
          </div>
        )}

        {/* ===== STRIPE CONFIG ===== */}
        <section>
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2.5 px-1">Configuration Stripe</h2>
          <div className="bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-5">
            {/* Connection header */}
            <div className="flex items-start sm:items-center justify-between gap-3 mb-4 flex-col sm:flex-row">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${stripeStatus?.connected ? "bg-emerald-100" : "bg-gray-100"}`}>
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : (
                    <svg className={`w-5 h-5 ${stripeStatus?.connected ? "text-emerald-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">Connexion Stripe</span>
                    {loading ? null : stripeStatus?.connected ? (
                      <>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isTest ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {isTest ? "Test" : "Live"}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
                          Connecté
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">Non connecté</span>
                    )}
                  </div>
                  {stripeStatus?.connected && (
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">sk_...{stripeStatus.lastFour}</p>
                  )}
                </div>
              </div>
              {stripeStatus?.connected && (
                <button onClick={handleDisconnect} className="text-[11px] text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  Déconnecter
                </button>
              )}
            </div>

            {/* Active key display */}
            {stripeStatus?.connected && !editingKey && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${isTest ? "bg-indigo-500" : "bg-emerald-500"}`} />
                  <span className="text-sm text-gray-700 font-medium">Mode {isTest ? "Test" : "Production"} actif</span>
                </div>
                <button onClick={() => setEditingKey(true)} className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  Changer la clé
                </button>
              </div>
            )}

            {/* Key input */}
            {(editingKey || !stripeStatus?.connected) && (
              <form onSubmit={handleSaveKey} className="space-y-2">
                <input type="password" value={keyInput} onChange={(e) => { setKeyInput(e.target.value); setKeyError(""); setKeySuccess(false); }}
                  placeholder="sk_test_... ou sk_live_..." autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 min-h-[44px] bg-gray-50/50 transition-colors" />
                {detectedMode && (
                  <p className="text-[11px] font-semibold">
                    {detectedMode === "test"
                      ? <span className="text-indigo-600">Mode détecté : Test</span>
                      : <span className="text-emerald-600">Mode détecté : Production</span>}
                  </p>
                )}
                {keyError && <p className="text-[11px] text-red-600 font-medium">{keyError}</p>}
                {keySuccess && <p className="text-[11px] text-emerald-600 font-medium">Clé validée et enregistrée.</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={saving || !keyInput.trim()} className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-40 min-h-[44px] transition-colors">
                    {saving ? "Validation..." : "Enregistrer"}
                  </button>
                  {stripeStatus?.connected && (
                    <button type="button" onClick={() => { setEditingKey(false); setKeyInput(""); setKeyError(""); }} className="px-4 py-2.5 text-sm text-gray-500 font-medium">
                      Annuler
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Test/Live Switch */}
            {stripeStatus?.connected && canSwitch && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${!isTest ? "text-gray-400" : "text-indigo-700"}`}>Test</span>
                    <button onClick={() => handleSwitchMode(isTest ? "live" : "test")} disabled={switching}
                      className="relative w-11 h-6 rounded-full transition-colors focus:outline-none disabled:opacity-40"
                      style={{ backgroundColor: isTest ? "#6366f1" : "#10b981" }}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${!isTest ? "translate-x-5" : ""}`} />
                    </button>
                    <span className={`text-xs font-bold ${isTest ? "text-gray-400" : "text-emerald-700"}`}>Live</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===== ORDERS ===== */}
        <section>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Commandes</h2>
              {stripeStatus?.connected && orders.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-900 text-white">{orders.length}</span>
              )}
            </div>
            {stripeStatus?.connected && orders.length > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={fetchOrders} disabled={ordersLoading} className="text-[11px] text-gray-400 hover:text-gray-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 font-medium transition-colors">
                  <svg className={`w-3.5 h-3.5 ${ordersLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Actualiser
                </button>
              </div>
            )}
          </div>

          {!stripeStatus?.connected ? (
            <div className="bg-white rounded-2xl border border-gray-200/60 p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <p className="text-sm text-gray-400 font-medium">Connectez Stripe pour voir les commandes.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden">
              {ordersLoading && orders.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-gray-400 mt-3">Chargement des commandes...</p>
                </div>
              )}

              {!ordersLoading && orders.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <PackageIcon className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-semibold text-sm">Aucune commande pour le moment.</p>
                  <p className="text-gray-400 text-xs mt-1">Les commandes apparaîtront ici automatiquement en arrière-plan.</p>
                </div>
              )}

              {orders.length > 0 && (
                <>
                  {/* Desktop table */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/60 text-left">
                          <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Commande</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Produit</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Client</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Montant</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Livraison</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">État</th>
                          <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                          <th className="px-5 py-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => {
                          const sc = ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG.paid;
                          return (
                            <tr key={order.id} className="hover:bg-gray-50/50 cursor-pointer transition-colors group" onClick={() => openOrderDetail(order.id)}>
                              <td className="px-5 py-3.5">
                                <span className="font-mono text-xs text-gray-500 group-hover:text-gray-900 transition-colors">{order.id.slice(-8)}</span>
                              </td>
                              <td className="px-5 py-3.5">
                                <p className="text-xs font-medium text-gray-900 truncate max-w-[160px]">{order.productName || "—"}</p>
                                {order.shippingMethod && (
                                  <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                                    <TruckIcon className="w-3 h-3" />
                                    {order.shippingMethod}
                                  </p>
                                )}
                              </td>
                              <td className="px-5 py-3.5">
                                <p className="text-xs font-medium text-gray-900 truncate max-w-[160px]">{order.customerName || "—"}</p>
                                <p className="text-[10px] text-gray-400 truncate max-w-[160px]">{order.customerEmail || ""}</p>
                              </td>
                              <td className="px-5 py-3.5">
                                <p className="text-xs font-bold text-gray-900">{fmtCurrency(order.amount, order.currency)}</p>
                                {order.amountShipping !== null && order.amountShipping !== undefined && order.amountShipping > 0 && (
                                  <p className="text-[10px] text-gray-400">dont {fmtCurrency(order.amountShipping, order.currency)} livraison</p>
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-xs text-gray-500">
                                {order.shippingCity ? `${order.shippingCity}, ${order.shippingCountry}` : "—"}
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                                  <select
                                    value={order.orderStatus}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                    disabled={updatingStatus}
                                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer transition-colors hover:opacity-80 ${sc.bg} ${sc.color}`}
                                  >
                                    {Object.entries(ORDER_STATUS_CONFIG).map(([val, cfg]) => (
                                      <option key={val} value={val}>{cfg.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 text-xs text-gray-400">{fmtDate(order.created)}</td>
                              <td className="px-5 py-3.5">
                                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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
                        <div key={order.id} className="p-4 space-y-3 cursor-pointer active:bg-gray-50 transition-colors" onClick={() => openOrderDetail(order.id)}>
                          {/* Top row: ID, status, amount */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-gray-500">{order.id.slice(-8)}</span>
                              <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                <span className={`text-[10px] font-bold ${sc.color}`}>{sc.label}</span>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{fmtCurrency(order.amount, order.currency)}</span>
                          </div>

                          {/* Product */}
                          {order.productName && (
                            <p className="text-xs font-medium text-gray-700">{order.productName}</p>
                          )}

                          {/* Client + date */}
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 truncate max-w-[60%]">{order.customerName || order.customerEmail || "—"}</p>
                            <p className="text-[10px] text-gray-400">{fmtDate(order.created)}</p>
                          </div>

                          {/* Shipping info */}
                          {(order.shippingCity || order.shippingMethod) && (
                            <div className="flex items-center gap-3 text-[10px] text-gray-400">
                              {order.shippingMethod && (
                                <span className="flex items-center gap-1">
                                  <TruckIcon className="w-3 h-3" />
                                  {order.shippingMethod}
                                </span>
                              )}
                              {order.shippingCity && <span>{order.shippingCity}, {order.shippingCountry}</span>}
                            </div>
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

        {/* Footer info */}
        <div className="text-center py-4">
          <p className="text-[10px] text-gray-300">Actualisation automatique toutes les 15 secondes</p>
        </div>
      </main>

      {/* ===== ORDER DETAIL MODAL ===== */}
      {(selectedOrder || orderDetailLoading) && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" onClick={() => setSelectedOrder(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto animate-slide-up shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {orderDetailLoading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto" />
                <p className="text-sm text-gray-400 mt-3">Chargement des détails...</p>
              </div>
            ) : selectedOrder ? (
              <div>
                {/* Modal header */}
                <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">Commande {selectedOrder.id.slice(-8)}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">{fmtDate(selectedOrder.created)}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors text-lg">&times;</button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Product + Price breakdown */}
                  <div className="rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-4 flex items-center justify-between bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                          <PackageIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{selectedOrder.productName || "Produit"}</p>
                          <p className="text-[11px] text-gray-400">
                            {selectedOrder.quantity ? `x${selectedOrder.quantity}` : "x1"}
                            {selectedOrder.unitPrice ? ` — ${fmtCurrency(selectedOrder.unitPrice, selectedOrder.currency)}/unité` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{fmtCurrency(selectedOrder.amount, selectedOrder.currency)}</span>
                    </div>
                    {/* Price breakdown */}
                    {selectedOrder.amountSubtotal !== null && selectedOrder.amountShipping !== null && selectedOrder.amountShipping > 0 && (
                      <div className="px-4 py-2.5 border-t border-gray-100 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Sous-total</span>
                          <span className="text-gray-600">{fmtCurrency(selectedOrder.amountSubtotal, selectedOrder.currency)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400 flex items-center gap-1">
                            <TruckIcon className="w-3 h-3" />
                            {selectedOrder.shippingMethod || "Livraison"}
                          </span>
                          <span className="text-gray-600">{fmtCurrency(selectedOrder.amountShipping, selectedOrder.currency)}</span>
                        </div>
                        <div className="flex justify-between text-xs pt-1.5 border-t border-gray-50">
                          <span className="font-bold text-gray-700">Total</span>
                          <span className="font-bold text-gray-900">{fmtCurrency(selectedOrder.amount, selectedOrder.currency)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status section */}
                  <div className="space-y-3">
                    {/* Status badges */}
                    <div className="flex gap-2">
                      <div className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400 font-medium mb-1">Paiement</p>
                        <span className={`text-[11px] font-bold px-3 py-1 rounded-lg ${selectedOrder.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {selectedOrder.paymentStatus === "paid" ? "Payé" : "En attente"}
                        </span>
                      </div>
                      <div className="flex-1 p-3 rounded-xl bg-gray-50 border border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400 font-medium mb-1">Commande</p>
                        <select
                          value={selectedOrder.orderStatus}
                          onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                          disabled={updatingStatus}
                          className={`text-[11px] font-bold px-3 py-1 rounded-lg border-0 cursor-pointer ${
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

                    {/* Visual pipeline */}
                    <div className="px-1">
                      <div className="flex items-center gap-1">
                        {STATUS_FLOW.map((step, i) => {
                          const isActive = STATUS_FLOW.indexOf(selectedOrder.orderStatus as typeof STATUS_FLOW[number]) >= i;
                          const isCurrent = selectedOrder.orderStatus === step;
                          const cfg = ORDER_STATUS_CONFIG[step];
                          return (
                            <div key={step} className="flex-1 flex items-center gap-1">
                              <div className="flex-1 h-2 rounded-full transition-all duration-300" style={{
                                backgroundColor: isActive
                                  ? isCurrent
                                    ? cfg.dot.replace("500", "500")
                                    : cfg.dot.replace("500", "200")
                                  : "#f3f4f6"
                              }} title={cfg.label} />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-1.5">
                        {STATUS_FLOW.map((step) => {
                          const isCurrent = selectedOrder.orderStatus === step;
                          return (
                            <span key={step} className={`text-[9px] font-medium ${isCurrent ? "text-gray-900" : "text-gray-400"}`}>
                              {ORDER_STATUS_CONFIG[step].label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Customer info */}
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-2.5 bg-gray-50/50 border-b border-gray-100">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Informations client</h4>
                    </div>
                    <div className="p-4 space-y-2.5">
                      {selectedOrder.customerName && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Nom</span>
                          <span className="text-xs font-medium text-gray-900">{selectedOrder.customerName}</span>
                        </div>
                      )}
                      {selectedOrder.customerEmail && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Email</span>
                          <span className="text-xs font-medium text-gray-900">{selectedOrder.customerEmail}</span>
                        </div>
                      )}
                      {selectedOrder.customerPhone && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Téléphone</span>
                          <span className="text-xs font-medium text-gray-900">{selectedOrder.customerPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping address */}
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-2.5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Adresse de livraison</h4>
                      {selectedOrder.shippingMethod && (
                        <span className="text-[10px] font-semibold text-violet-600 flex items-center gap-1">
                          <TruckIcon className="w-3 h-3" />
                          {selectedOrder.shippingMethod}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      {selectedOrder.shippingName && selectedOrder.shippingName !== selectedOrder.customerName && (
                        <p className="text-xs font-medium text-gray-900 mb-1">{selectedOrder.shippingName}</p>
                      )}
                      <p className="text-xs text-gray-600 leading-relaxed">{fmtAddress(selectedOrder.shippingAddress)}</p>
                    </div>
                  </div>

                  {/* Billing address */}
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-4 py-2.5 bg-gray-50/50 border-b border-gray-100">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Adresse de facturation</h4>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-600 leading-relaxed">{fmtAddress(selectedOrder.billingAddress)}</p>
                    </div>
                  </div>
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