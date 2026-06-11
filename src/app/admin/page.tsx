"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useCallback, useRef, useMemo } from "react";

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
  trackingNumber: string | null;
  // Live tracking from AfterShip
  trackTag: string | null;
  trackLabel: string | null;
  trackBg: string | null;
  trackColor: string | null;
  trackLastUpdate: string | null;
}

interface TrackingCheckpoint {
  time: string;
  location: string;
  tag: string;
  message: string;
}

interface TrackingData {
  tag: string;
  label: string;
  color: string;
  bg: string;
  lastUpdate: string;
  checkpoints: TrackingCheckpoint[];
  signedBy: string | null;
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

interface ShippingOpt {
  id: string;
  name: string;
  price: number;
  currency: string;
  active: boolean;
  minDays: number;
  maxDays: number;
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

const ORDERS_PER_PAGE = 10;

const NOTIF_STORAGE_KEY = "e-icossys-notifications";

// --- Tracking link helpers ---

function getTrackingUrl(method: string | null, trackingNumber: string): string | null {
  if (!trackingNumber.trim()) return null;
  const m = (method || "").toLowerCase();
  if (m.includes("chronopost")) return `https://www.chronopost.fr/tracking-cargo?listeNumerosLT=${encodeURIComponent(trackingNumber)}`;
  if (m.includes("colissimo") || m.includes("la poste") || m.includes("lettre")) {
    return `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(trackingNumber)}`;
  }
  // Default: La Poste
  return `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(trackingNumber)}`;
}

function detectCarrierLabel(method: string | null): string {
  const m = (method || "").toLowerCase();
  if (m.includes("chronopost")) return "Chronopost";
  if (m.includes("colissimo")) return "Colissimo";
  if (m.includes("lettre")) return "La Poste";
  if (m.includes("mondial")) return "Mondial Relay";
  return "Transporteur";
}

// --- Helpers ---

function fmtDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("fr-FR", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function fmtCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: currency.toUpperCase() }).format(amount / 100);
}

function fmtAddress(addr: { line1: string | null; line2: string | null; city: string | null; state: string | null; postalCode: string | null; country: string | null } | null): string {
  if (!addr) return "Non renseignée";
  return [addr.line1, addr.line2, addr.postalCode, addr.city, addr.state, addr.country].filter(Boolean).join(", ") || "Non renseignée";
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
}

// --- Icons ---

function BellIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>;
}
function PackageIcon({ className = "w-5 h-5" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>;
}
function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
}
function FilterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>;
}
function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
}
function ExternalLinkIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>;
}
function ChevronLeftIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
}
function ChevronRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;
}

// ==================== MAIN ====================

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

  // Search, Filter, Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [shippingFilter, setShippingFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Notifications (persistent via localStorage)
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [bellRinging, setBellRinging] = useState(false);
  const [toastNotif, setToastNotif] = useState<string | null>(null);
  const prevOrdersRef = useRef<string>("");
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const notifLoadedRef = useRef(false);

  // Shipping config
  const [shippingOpts, setShippingOpts] = useState<ShippingOpt[]>([]);
  const [shippingSaving, setShippingSaving] = useState(false);
  const [shippingLoaded, setShippingLoaded] = useState(false);

  // Tracking number input in modal
  const [trackingInput, setTrackingInput] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);

  // Live tracking (AfterShip)
  const [trackData, setTrackData] = useState<TrackingData | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const checkingOrdersRef = useRef<Set<string>>(new Set());
  // Per-order tracking summaries in the list view
  const [orderTrackStatus, setOrderTrackStatus] = useState<Record<string, { tag: string; label: string; bg: string; color: string; lastUpdate: string }>>({});
  const [checkingOrders, setCheckingOrders] = useState<Set<string>>(new Set());

  // Auto-refresh + sync protection
  const lastStatusChangeAt = useRef<number>(0);

  const detectedMode = keyInput.trim().startsWith("sk_test_") ? "test" as StripeMode
    : keyInput.trim().startsWith("sk_live_") ? "live" as StripeMode : null;

  // --- Persistent notifications ---

  const loadNotifications = useCallback(() => {
    try {
      const stored = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
          notifLoadedRef.current = true;
        }
      }
    } catch {}
  }, []);

  const saveNotifications = useCallback((notifs: Notification[]) => {
    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifs.slice(0, 100)));
    } catch {}
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // Close notif panel on outside click (NO auto-mark-read)
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)) setShowNotifPanel(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // --- Fetches ---
  const fetchStatus = useCallback(() => {
    fetch("/api/stripe/status").then(r => r.json()).then(d => {
      setStripeStatus(d);
      if (!d.connected) setEditingKey(true);
    }).catch(() => setStripeStatus({ connected: false, mode: "test", testKey: false, liveKey: false, keyType: null }))
    .finally(() => setLoading(false));
  }, []);

  const fetchOrders = useCallback(() => {
    setOrdersLoading(true);
    fetch("/api/orders?list=true").then(r => r.json()).then(data => {
      const newOrders: Order[] = data.orders || [];
      const oldIds = prevOrdersRef.current;
      const newIds = newOrders.map((o: Order) => o.id).join(",");
      if (oldIds && newIds !== oldIds) {
        const oldSet = new Set(oldIds.split(","));
        const fresh = newOrders.filter((o: Order) => !oldSet.has(o.id));
        if (fresh.length > 0) {
          setNotifications(prev => {
            const updated = [
              ...fresh.map((order: Order) => ({
                id: order.id, customerName: order.customerName, customerEmail: order.customerEmail,
                amount: order.amount, currency: order.currency, productName: order.productName,
                time: Date.now(), read: false,
              })),
              ...prev,
            ].slice(0, 100);
            saveNotifications(updated);
            return updated;
          });
          const latest = fresh[0];
          setToastNotif(`${latest.customerName || latest.customerEmail || "Client"} — ${latest.productName || "Commande"} — ${fmtCurrency(latest.amount, latest.currency)}`);
          setTimeout(() => setToastNotif(null), 5000);
          setBellRinging(true);
          setTimeout(() => setBellRinging(false), 800);
        }
      }
      prevOrdersRef.current = newIds;
      setOrders(newOrders);
    }).catch(() => setOrders([]))
    .finally(() => setOrdersLoading(false));
  }, [saveNotifications]);

  const fetchShippingConfig = useCallback(() => {
    fetch("/api/shipping/config").then(r => r.json()).then(d => {
      setShippingOpts(d.options || []);
      setShippingLoaded(true);
    }).catch(() => {});
  }, []);

  // Load notifications from localStorage on mount
  useEffect(() => { loadNotifications(); }, [loadNotifications]);
  useEffect(() => { fetchStatus(); }, [fetchStatus]);
  useEffect(() => { if (stripeStatus?.connected) { fetchOrders(); fetchShippingConfig(); } }, [stripeStatus?.connected, fetchOrders, fetchShippingConfig]);

  // Auto-refresh 15s avec cooldown 10s après changement de statut
  useEffect(() => {
    if (!stripeStatus?.connected) return;
    const interval = setInterval(() => {
      if (Date.now() - lastStatusChangeAt.current < 10000) return;
      fetchOrders();
    }, 15000);
    return () => clearInterval(interval);
  }, [stripeStatus?.connected, fetchOrders]);

  // Reset page when search/filter changes
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, shippingFilter]);

  // --- Derived: filtered + paginated orders ---

  const filteredOrders = useMemo(() => {
    let result = orders;
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(o =>
        (o.customerName || "").toLowerCase().includes(q) ||
        (o.customerEmail || "").toLowerCase().includes(q) ||
        (o.productName || "").toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        (o.shippingCity || "").toLowerCase().includes(q) ||
        (o.shippingName || "").toLowerCase().includes(q)
      );
    }
    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(o => o.orderStatus === statusFilter);
    }
    // Shipping filter
    if (shippingFilter !== "all") {
      result = result.filter(o => o.shippingMethod === shippingFilter);
    }
    return result;
  }, [orders, searchQuery, statusFilter, shippingFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  // Unique shipping methods for filter
  const uniqueShippingMethods = useMemo(() => {
    const methods = new Set(orders.map(o => o.shippingMethod).filter(Boolean) as string[]);
    return Array.from(methods).sort();
  }, [orders]);

  // --- Handlers ---
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {}, 300);
  };

  const handleSwitchMode = async (newMode: StripeMode) => {
    if (newMode === stripeStatus?.mode) return;
    setSwitching(true);
    try {
      const res = await fetch("/api/stripe/mode", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: newMode }) });
      if (res.ok) fetchStatus(); else alert((await res.json()).error || "Erreur");
    } catch { alert("Erreur de connexion."); }
    finally { setSwitching(false); }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError(""); setKeySuccess(false);
    const trimmed = keyInput.trim();
    if (!trimmed || (!trimmed.startsWith("sk_test_") && !trimmed.startsWith("sk_live_"))) {
      if (trimmed) setKeyError("La clé doit commencer par sk_test_ ou sk_live_");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/stripe/configure", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secretKey: trimmed }) });
      const data = await res.json();
      setSaving(false);
      if (res.ok) { setKeySuccess(true); setKeyInput(""); setEditingKey(false); fetchStatus(); setTimeout(() => setKeySuccess(false), 3000); }
      else setKeyError(data.error || "Erreur");
    } catch { setSaving(false); setKeyError("Erreur de connexion."); }
  };

  const handleDisconnect = async () => {
    if (!confirm("Déconnecter Stripe ?")) return;
    await fetch("/api/stripe/disconnect", { method: "POST" });
    setEditingKey(true); fetchStatus();
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const openOrderDetail = async (orderId: string) => {
    setSelectedOrder(null);
    setTrackingInput("");
    setTrackData(null);
    setTrackError(null);
    setTrackLoading(false);
    setOrderDetailLoading(true);
    try {
      const res = await fetch(`/api/orders?session_id=${orderId}`);
      const data = await res.json();
      if (res.ok) {
        setSelectedOrder(data);
        setTrackingInput(data.trackingNumber || "");
      }
    } catch {}
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
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
        if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, orderStatus: newStatus } : null);
        lastStatusChangeAt.current = Date.now();
      } else alert((await res.json()).error || "Erreur");
    } catch { alert("Erreur de connexion."); }
    finally { setUpdatingStatus(false); }
  };

  const handleSaveTrackingNumber = async (orderId: string) => {
    if (!trackingInput.trim()) return;
    setSavingTracking(true);
    try {
      const res = await fetch("/api/orders/status", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: orderId, status: "shipped", trackingNumber: trackingInput.trim() }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: "shipped", trackingNumber: trackingInput.trim() } : o));
        if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, orderStatus: "shipped", trackingNumber: trackingInput.trim() } : null);
        lastStatusChangeAt.current = Date.now();
        // Auto-register with AfterShip
        const method = selectedOrder?.shippingMethod || orders.find(o => o.id === orderId)?.shippingMethod || null;
        fetch("/api/tracking", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackingNumber: trackingInput.trim(), shippingMethod: method, orderId }),
        }).catch(() => {});
      } else alert((await res.json()).error || "Erreur");
    } catch { alert("Erreur de connexion."); }
    finally { setSavingTracking(false); }
  };

  const handleCheckTracking = async (orderId: string, trackingNumber: string, shippingMethod: string | null, isModal = false) => {
    setTrackError(null);
    if (isModal) {
      setTrackLoading(true);
      setTrackData(null);
    } else {
      setCheckingOrders(prev => new Set(prev).add(orderId));
    }
    try {
      const params = new URLSearchParams({ tracking_number: trackingNumber });
      if (shippingMethod) params.set("shipping_method", shippingMethod);
      const res = await fetch(`/api/tracking?${params}`);
      const data = await res.json();
      if (res.ok && data.tracking) {
        const t = data.tracking;
        if (isModal) {
          setTrackData(t);
        }
        // Update list view status
        setOrderTrackStatus(prev => ({
          ...prev,
          [orderId]: { tag: t.tag, label: t.label, bg: t.bg, color: t.color, lastUpdate: t.lastUpdate },
        }));
        // Auto-update to "delivered" if AfterShip says so
        if (t.tag === "Delivered") {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: "delivered" } : o));
          if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, orderStatus: "delivered" } : null);
        }
      } else {
        if (isModal) setTrackError(data.error || "Aucun suivi trouvé.");
      }
    } catch {
      if (isModal) setTrackError("Erreur de connexion.");
    } finally {
      if (isModal) setTrackLoading(false);
      else setCheckingOrders(prev => { const n = new Set(prev); n.delete(orderId); return n; });
    }
  };

  const handleCheckTrackingModal = async () => {
    if (!selectedOrder?.trackingNumber) return;
    await handleCheckTracking(selectedOrder.id, selectedOrder.trackingNumber, selectedOrder.shippingMethod, true);
  };

  // Auto-check tracking when opening modal if tracking exists
  useEffect(() => {
    if (selectedOrder?.trackingNumber && !trackData && !trackLoading) {
      handleCheckTracking(selectedOrder.id, selectedOrder.trackingNumber, selectedOrder.shippingMethod, true);
    }
  }, [selectedOrder?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const markNotificationRead = (notifId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notifId ? { ...n, read: true } : n);
      saveNotifications(updated);
      return updated;
    });
  };

  const markAllRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  // Shipping handlers
  const updateShipping = (idx: number, patch: Partial<ShippingOpt>) => {
    setShippingOpts(prev => prev.map((o, i) => i === idx ? { ...o, ...patch } : o));
  };
  const addShipping = () => {
    setShippingOpts(prev => [...prev, {
      id: `custom-${Date.now()}`, name: "Nouveau mode", price: 500,
      currency: "eur", active: true, minDays: 2, maxDays: 5,
    }]);
  };
  const removeShipping = (idx: number) => {
    if (shippingOpts.length <= 1) { alert("Au moins un mode de livraison est requis."); return; }
    setShippingOpts(prev => prev.filter((_, i) => i !== idx));
  };
  const saveShipping = async () => {
    setShippingSaving(true);
    try {
      const res = await fetch("/api/shipping/config", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options: shippingOpts }),
      });
      if (!res.ok) alert((await res.json()).error || "Erreur");
    } catch { alert("Erreur de connexion."); }
    finally { setShippingSaving(false); }
  };

  // --- Derived ---
  const isTest = stripeStatus?.mode === "test";
  const canSwitch = stripeStatus?.testKey && stripeStatus?.liveKey;
  const totalRevenue = orders.reduce((s, o) => s + o.amount, 0);
  const avgOrder = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const pendingCount = orders.filter(o => o.orderStatus === "paid").length;
  const activeShipCount = shippingOpts.filter(o => o.active).length;

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">

      {/* HEADER */}
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
          <div className="flex items-center gap-1.5">
            {/* Notification Bell */}
            <div className="relative" ref={notifPanelRef}>
              <button onClick={() => setShowNotifPanel(!showNotifPanel)}
                className="relative w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
                <span className={bellRinging ? "animate-bell-ring inline-block" : ""}><BellIcon className="w-[20px] h-[20px]" /></span>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse-dot">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifPanel && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden animate-fade-scale-in z-50">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      {unreadCount > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold">Tout lire</button>
                      )}
                      {notifications.length > 0 && (
                        <button onClick={clearAllNotifications} className="text-[11px] text-gray-400 hover:text-red-500 font-medium">Vider</button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2"><BellIcon className="w-5 h-5 text-gray-400" /></div>
                        <p className="text-xs text-gray-400">Aucune notification</p>
                      </div>
                    ) : notifications.map(n => (
                      <button key={n.id} onClick={() => { openOrderDetail(n.id); setShowNotifPanel(false); markNotificationRead(n.id); }}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50/80 transition-colors ${!n.read ? "bg-blue-50/40" : ""}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${!n.read ? "bg-blue-100" : "bg-gray-100"}`}>
                            <PackageIcon className={`w-4 h-4 ${!n.read ? "text-blue-600" : "text-gray-400"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-gray-900 truncate">{n.customerName || n.customerEmail || "Client"}</p>
                              <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(n.time)}</span>
                            </div>
                            {n.productName && <p className="text-[11px] text-gray-500 truncate mt-0.5">{n.productName}</p>}
                            <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">{fmtCurrency(n.amount, n.currency)}</p>
                          </div>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {stripeStatus?.connected && (
              <span className={`hidden sm:inline-flex text-[10px] font-bold px-2.5 py-1 rounded-lg ${isTest ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"}`}>
                {isTest ? "TEST" : "LIVE"}
              </span>
            )}
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 font-medium">Déconnexion</button>
          </div>
        </div>
      </header>

      {/* TOAST */}
      {toastNotif && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
          <div className="bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm border border-gray-700/50">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Nouvelle commande</p>
              <p className="text-xs text-gray-300 mt-0.5 truncate">{toastNotif}</p>
            </div>
            <button onClick={() => setToastNotif(null)} className="text-gray-500 hover:text-white ml-2 text-lg leading-none">&times;</button>
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* KPI */}
        {stripeStatus?.connected && orders.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: "Chiffre d'affaires", value: fmtCurrency(totalRevenue, "eur"), icon: <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, bg: "bg-emerald-100" },
              { label: "Commandes", value: String(orders.length), icon: <PackageIcon className="w-3.5 h-3.5 text-blue-600" />, bg: "bg-blue-100" },
              { label: "Panier moyen", value: orders.length > 0 ? fmtCurrency(avgOrder, "eur") : "-", icon: <svg className="w-3.5 h-3.5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>, bg: "bg-violet-100" },
              { label: "En attente", value: String(pendingCount), icon: <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, bg: "bg-amber-100" },
            ].map((kpi, i) => (
              <div key={kpi.label} className="bg-white rounded-2xl border border-gray-200/60 p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${kpi.bg} flex items-center justify-center`}>{kpi.icon}</div>
                  <span className="text-[11px] font-medium text-gray-400">{kpi.label}</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{kpi.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* STRIPE CONFIG */}
        <section>
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2.5 px-1">Configuration Stripe</h2>
          <div className="bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-5">
            <div className="flex items-start sm:items-center justify-between gap-3 mb-4 flex-col sm:flex-row">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stripeStatus?.connected ? "bg-emerald-100" : "bg-gray-100"}`}>
                  {loading ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <svg className={`w-5 h-5 ${stripeStatus?.connected ? "text-emerald-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 text-sm">Connexion Stripe</span>
                    {loading ? null : stripeStatus?.connected ? (
                      <>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isTest ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}>{isTest ? "Test" : "Live"}</span>
                        <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />Connecté
                        </span>
                      </>
                    ) : <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">Non connecté</span>}
                  </div>
                  {stripeStatus?.connected && <p className="text-[10px] text-gray-400 mt-0.5 font-mono">sk_...{stripeStatus.lastFour}</p>}
                </div>
              </div>
              {stripeStatus?.connected && <button onClick={handleDisconnect} className="text-[11px] text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">Déconnecter</button>}
            </div>
            {stripeStatus?.connected && !editingKey && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${isTest ? "bg-indigo-500" : "bg-emerald-500"}`} />
                  <span className="text-sm text-gray-700 font-medium">Mode {isTest ? "Test" : "Production"}</span>
                </div>
                <button onClick={() => setEditingKey(true)} className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">Changer</button>
              </div>
            )}
            {(editingKey || !stripeStatus?.connected) && (
              <form onSubmit={handleSaveKey} className="space-y-2">
                <input type="password" value={keyInput} onChange={e => { setKeyInput(e.target.value); setKeyError(""); setKeySuccess(false); }}
                  placeholder="sk_test_... ou sk_live_..." autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 min-h-[44px] bg-gray-50/50" />
                {detectedMode && <p className="text-[11px] font-semibold">{detectedMode === "test" ? <span className="text-indigo-600">Mode détecté : Test</span> : <span className="text-emerald-600">Mode détecté : Production</span>}</p>}
                {keyError && <p className="text-[11px] text-red-600 font-medium">{keyError}</p>}
                {keySuccess && <p className="text-[11px] text-emerald-600 font-medium">Clé validée et enregistrée.</p>}
                <div className="flex gap-2">
                  <button type="submit" disabled={saving || !keyInput.trim()} className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-40 min-h-[44px]">{saving ? "Validation..." : "Enregistrer"}</button>
                  {stripeStatus?.connected && <button type="button" onClick={() => { setEditingKey(false); setKeyInput(""); setKeyError(""); }} className="px-4 py-2.5 text-sm text-gray-500 font-medium">Annuler</button>}
                </div>
              </form>
            )}
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

        {/* SHIPPING CONFIG */}
        {stripeStatus?.connected && (
          <section>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Modes de livraison</h2>
              {shippingLoaded && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{activeShipCount} actif{activeShipCount > 1 ? "s" : ""}</span>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200/60 p-4 sm:p-5">
              <p className="text-[11px] text-gray-400 mb-4">Activez ou désactivez les modes de livraison proposés au checkout. Modifiez les prix et délais.</p>
              <div className="space-y-2.5">
                {shippingOpts.map((opt, idx) => (
                  <div key={opt.id} className={`rounded-xl border p-3 sm:p-4 transition-colors ${opt.active ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50/50 opacity-60"}`}>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateShipping(idx, { active: !opt.active })}
                        className="relative w-10 h-[22px] rounded-full transition-colors flex-shrink-0 focus:outline-none"
                        style={{ backgroundColor: opt.active ? "#7c3aed" : "#d1d5db" }}>
                        <span className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${opt.active ? "translate-x-[18px]" : ""}`} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <input type="text" value={opt.name} onChange={e => updateShipping(idx, { name: e.target.value, id: slugify(e.target.value) || opt.id })}
                          className="w-full text-sm font-semibold text-gray-900 bg-transparent border-0 focus:outline-none focus:ring-0 p-0 truncate" />
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400">Prix :</span>
                            <input type="number" step="0.10" min="0" value={(opt.price / 100).toFixed(2)} onChange={e => updateShipping(idx, { price: Math.round(parseFloat(e.target.value) * 100) || 0 })}
                              className="w-16 text-xs font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-md px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-violet-300" />
                            <span className="text-[10px] text-gray-400">EUR</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400">Delai :</span>
                            <input type="number" min="1" max="30" value={opt.minDays} onChange={e => updateShipping(idx, { minDays: parseInt(e.target.value) || 1 })}
                              className="w-10 text-xs font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-md px-1.5 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-violet-300" />
                            <span className="text-[10px] text-gray-400">a</span>
                            <input type="number" min={opt.minDays} max="60" value={opt.maxDays} onChange={e => updateShipping(idx, { maxDays: Math.max(parseInt(e.target.value) || 1, opt.minDays) })}
                              className="w-10 text-xs font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-md px-1.5 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-violet-300" />
                            <span className="text-[10px] text-gray-400">jours</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeShipping(idx)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <button onClick={addShipping} className="text-[11px] font-semibold text-violet-600 hover:text-violet-700 px-3 py-1.5 rounded-lg hover:bg-violet-50 transition-colors">
                  + Ajouter un mode
                </button>
                <button onClick={saveShipping} disabled={shippingSaving}
                  className="px-5 py-2 bg-violet-600 text-white text-xs font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-40 transition-colors min-h-[38px]">
                  {shippingSaving ? "Sauvegarde..." : "Sauvegarder"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ORDERS SECTION */}
        <section>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Commandes</h2>
              {stripeStatus?.connected && orders.length > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-900 text-white">{orders.length}</span>}
            </div>
            {stripeStatus?.connected && orders.length > 0 && (
              <button onClick={fetchOrders} disabled={ordersLoading} className="text-[11px] text-gray-400 hover:text-gray-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 font-medium transition-colors">
                <svg className={`w-3.5 h-3.5 ${ordersLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Actualiser
              </button>
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
                <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto" /><p className="text-sm text-gray-400 mt-3">Chargement...</p></div>
              )}
              {!ordersLoading && orders.length === 0 && (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3"><PackageIcon className="w-6 h-6 text-gray-300" /></div>
                  <p className="text-gray-500 font-semibold text-sm">Aucune commande.</p>
                  <p className="text-gray-400 text-xs mt-1">Les commandes apparaitront automatiquement.</p>
                </div>
              )}
              {orders.length > 0 && (<>

                {/* ===== SEARCH & FILTER BAR ===== */}
                <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-gray-50/40 space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><SearchIcon className="w-4 h-4" /></div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => handleSearchChange(e.target.value)}
                      placeholder="Rechercher par nom, email, produit, ref commande, ville..."
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><XIcon className="w-4 h-4" /></button>
                    )}
                  </div>
                  {/* Filters row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-gray-400"><FilterIcon className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold uppercase tracking-wider">Filtres</span></div>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 cursor-pointer"
                    >
                      <option value="all">Tous les statuts</option>
                      {Object.entries(ORDER_STATUS_CONFIG).map(([key, cfg]) => (
                        <option key={key} value={key}>{cfg.label}</option>
                      ))}
                    </select>
                    {uniqueShippingMethods.length > 0 && (
                      <select
                        value={shippingFilter}
                        onChange={e => setShippingFilter(e.target.value)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 cursor-pointer"
                      >
                        <option value="all">Tous les transporteurs</option>
                        {uniqueShippingMethods.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    )}
                    {(statusFilter !== "all" || shippingFilter !== "all" || searchQuery) && (
                      <button onClick={() => { setStatusFilter("all"); setShippingFilter("all"); setSearchQuery(""); }}
                        className="text-[11px] text-red-500 hover:text-red-600 font-medium px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        Reinitialiser
                      </button>
                    )}
                    <span className="text-[10px] text-gray-400 ml-auto">{filteredOrders.length} resultat{filteredOrders.length > 1 ? "s" : ""}</span>
                  </div>
                </div>

                {/* ===== DESKTOP TABLE ===== */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/60 text-left">
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Commande</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Produit</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Client</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Montant</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Livraison</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Suivi</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Etat</th>
                        <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-5 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedOrders.map(order => {
                        const sc = ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG.paid;
                        const trackingUrl = getTrackingUrl(order.shippingMethod, order.trackingNumber || "");
                        return (
                          <tr key={order.id} className="hover:bg-gray-50/50 cursor-pointer transition-colors group" onClick={() => openOrderDetail(order.id)}>
                            <td className="px-5 py-3.5"><span className="font-mono text-xs text-gray-500 group-hover:text-gray-900">{order.id.slice(-8)}</span></td>
                            <td className="px-5 py-3.5"><span className="text-xs text-gray-900 font-medium truncate block max-w-[180px]">{order.productName || "—"}</span></td>
                            <td className="px-5 py-3.5">
                              <p className="text-xs text-gray-900 font-medium truncate max-w-[160px]">{order.shippingName || order.customerName || "—"}</p>
                              <p className="text-[10px] text-gray-400 truncate max-w-[160px]">{order.customerEmail || ""}</p>
                            </td>
                            <td className="px-5 py-3.5"><span className="text-xs font-semibold text-gray-900">{fmtCurrency(order.amount, order.currency)}</span></td>
                            <td className="px-5 py-3.5">
                              {order.shippingMethod ? (
                                <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">{order.shippingMethod}</span>
                              ) : <span className="text-xs text-gray-400">—</span>}
                            </td>
                            <td className="px-5 py-3.5">
                              {order.trackingNumber ? (
                                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                                  <a href={trackingUrl || "#"} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                                    {order.trackingNumber.length > 12 ? order.trackingNumber.slice(0, 12) + "..." : order.trackingNumber}
                                    <ExternalLinkIcon className="w-3 h-3" />
                                  </a>
                                  <button
                                    onClick={() => handleCheckTracking(order.id, order.trackingNumber!, order.shippingMethod)}
                                    disabled={checkingOrders.has(order.id)}
                                    className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40"
                                    title="Vérifier le statut en temps réel">
                                    {checkingOrders.has(order.id) ? (
                                      <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                                    ) : (
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                                    )}
                                  </button>
                                  {orderTrackStatus[order.id] && (
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${orderTrackStatus[order.id].bg} ${orderTrackStatus[order.id].color}`}>
                                      {orderTrackStatus[order.id].label}
                                    </span>
                                  )}
                                </div>
                              ) : <span className="text-xs text-gray-300">—</span>}
                            </td>
                            <td className="px-5 py-3.5">
                              <select
                                value={order.orderStatus}
                                onChange={e => { e.stopPropagation(); handleStatusChange(order.id, e.target.value); }}
                                onClick={e => e.stopPropagation()}
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-300 ${sc.bg} ${sc.color}`}
                              >
                                {Object.entries(ORDER_STATUS_CONFIG).map(([key, cfg]) => (
                                  <option key={key} value={key}>{cfg.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-5 py-3.5"><span className="text-[11px] text-gray-500 whitespace-nowrap">{fmtDate(order.created)}</span></td>
                            <td className="px-5 py-3.5">
                              <button onClick={e => { e.stopPropagation(); openOrderDetail(order.id); }}
                                className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ===== MOBILE CARDS ===== */}
                <div className="lg:hidden divide-y divide-gray-100">
                  {paginatedOrders.map(order => {
                    const sc = ORDER_STATUS_CONFIG[order.orderStatus] || ORDER_STATUS_CONFIG.paid;
                    return (
                      <button key={order.id} onClick={() => openOrderDetail(order.id)} className="w-full text-left p-4 hover:bg-gray-50/50 transition-colors space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-[11px] text-gray-400">{order.id.slice(-8)}</span>
                            <select
                              value={order.orderStatus}
                              onChange={e => { e.stopPropagation(); handleStatusChange(order.id, e.target.value); }}
                              onClick={e => e.stopPropagation()}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer focus:outline-none ${sc.bg} ${sc.color}`}
                            >
                              {Object.entries(ORDER_STATUS_CONFIG).map(([key, cfg]) => (
                                <option key={key} value={key}>{cfg.label}</option>
                              ))}
                            </select>
                          </div>
                          <span className="text-xs font-bold text-gray-900 flex-shrink-0">{fmtCurrency(order.amount, order.currency)}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <PackageIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-700 truncate">{order.productName || "Produit"}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-gray-500 truncate">{order.shippingName || order.customerName || ""}</span>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">{fmtDate(order.created)}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {order.shippingMethod && <span className="text-[9px] font-semibold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">{order.shippingMethod}</span>}
                          {order.trackingNumber && (
                            <span className="text-[9px] font-mono text-blue-600 font-semibold truncate max-w-[120px]">{order.trackingNumber}</span>
                          )}
                          {order.trackingNumber && (
                            <button
                              onClick={e => { e.stopPropagation(); handleCheckTracking(order.id, order.trackingNumber!, order.shippingMethod); }}
                              disabled={checkingOrders.has(order.id)}
                              className="text-[9px] font-semibold text-gray-400 hover:text-blue-600 flex items-center gap-0.5">
                              {checkingOrders.has(order.id) ? (
                                <div className="w-2.5 h-2.5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                              ) : (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                              )}
                            </button>
                          )}
                          {orderTrackStatus[order.id] && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${orderTrackStatus[order.id].bg} ${orderTrackStatus[order.id].color}`}>
                              {orderTrackStatus[order.id].label}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* ===== PAGINATION ===== */}
                {filteredOrders.length > ORDERS_PER_PAGE && (
                  <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
                    <p className="text-[11px] text-gray-500">
                      {(currentPage - 1) * ORDERS_PER_PAGE + 1}–{Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length)} sur {filteredOrders.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ChevronLeftIcon />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                          if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) => typeof p === "string" ? (
                          <span key={`dots-${i}`} className="w-8 h-8 flex items-center justify-center text-[10px] text-gray-400">...</span>
                        ) : (
                          <button key={p} onClick={() => setCurrentPage(p)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold transition-colors ${
                              currentPage === p ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-200/60"
                            }`}>
                            {p}
                          </button>
                        ))
                      }
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                        <ChevronRightIcon />
                      </button>
                    </div>
                  </div>
                )}

                {filteredOrders.length === 0 && orders.length > 0 && (
                  <div className="p-12 text-center">
                    <SearchIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold text-sm">Aucun resultat.</p>
                    <p className="text-gray-400 text-xs mt-1">Essayez de modifier vos criteres de recherche.</p>
                  </div>
                )}
              </>)}
            </div>
          )}
        </section>
      </main>

      {/* ===== ORDER DETAIL MODAL ===== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setSelectedOrder(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-5 sm:px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center"><PackageIcon className="w-4 h-4 text-gray-600" /></div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Commande {selectedOrder.id.slice(-8)}</p>
                  <p className="text-[10px] text-gray-400">{fmtDate(selectedOrder.created)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-5 sm:px-6 py-5 space-y-5">
              {/* Status pipeline */}
              <div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Statut de la commande</h3>
                <div className="flex items-center gap-1">
                  {STATUS_FLOW.map((step, idx) => {
                    const isActive = STATUS_FLOW.indexOf(selectedOrder.orderStatus as any) >= idx;
                    const isCurrent = selectedOrder.orderStatus === step;
                    const cfg = ORDER_STATUS_CONFIG[step];
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
                        <button onClick={() => handleStatusChange(selectedOrder.id, step)} disabled={updatingStatus}
                          className={`w-full flex items-center gap-1 ${idx < STATUS_FLOW.length - 1 ? "flex-col" : ""}`}>
                          <div className={`w-full flex items-center ${idx < STATUS_FLOW.length - 1 ? "" : ""}`}>
                            {idx > 0 && <div className={`h-0.5 flex-1 ${isActive ? "bg-gray-900" : "bg-gray-200"}`} />}
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                              isCurrent ? "border-gray-900 bg-gray-900 animate-status-glow" : isActive ? "border-gray-900 bg-white" : "border-gray-200 bg-white"
                            }`}>
                              {isActive && <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? "bg-white" : "bg-gray-900"}`} />}
                            </div>
                            {idx < STATUS_FLOW.length - 1 && <div className={`h-0.5 flex-1 ${STATUS_FLOW.indexOf(selectedOrder.orderStatus as any) > idx ? "bg-gray-900" : "bg-gray-200"}`} />}
                          </div>
                        </button>
                        <span className={`text-[9px] font-semibold ${isCurrent ? "text-gray-900" : isActive ? "text-gray-600" : "text-gray-400"}`}>{cfg.label}</span>
                      </div>
                    );
                  })}
                </div>
                {/* Cancel */}
                <div className="flex justify-end mt-2">
                  <button onClick={() => handleStatusChange(selectedOrder.id, "cancelled")} disabled={updatingStatus}
                    className="text-[10px] font-semibold text-red-500 hover:text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                    Annuler la commande
                  </button>
                </div>
              </div>

              {/* Tracking number */}
              {(selectedOrder.orderStatus === "shipped" || selectedOrder.orderStatus === "delivered") && (
                <div className={`rounded-xl border p-4 ${selectedOrder.trackingNumber ? "border-blue-200 bg-blue-50/30" : "border-amber-200 bg-amber-50/30"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Numero de suivi</h3>
                    {selectedOrder.trackingNumber && (
                      <button onClick={handleCheckTrackingModal} disabled={trackLoading}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50">
                        {trackLoading ? (
                          <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                        )}
                        Actualiser
                      </button>
                    )}
                  </div>
                  {selectedOrder.trackingNumber ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{detectCarrierLabel(selectedOrder.shippingMethod)}</span>
                        <span className="font-mono text-xs font-bold text-gray-900">{selectedOrder.trackingNumber}</span>
                        {trackData && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${trackData.bg} ${trackData.color}`}>
                            {trackData.label}
                          </span>
                        )}
                      </div>
                      {trackData && trackData.tag === "Delivered" && trackData.signedBy && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="text-[11px] text-emerald-700 font-medium">Signé par : {trackData.signedBy}</span>
                        </div>
                      )}
                      {trackError && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                          <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                          <span className="text-[11px] text-red-600">{trackError}</span>
                        </div>
                      )}
                      {/* Live tracking timeline */}
                      {trackData && trackData.checkpoints.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200/60">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Historique du suivi</h4>
                          <div className="relative space-y-0">
                            {trackData.checkpoints.map((cp, idx) => {
                              const isFirst = idx === 0;
                              const isLast = idx === trackData.checkpoints.length - 1;
                              const isActive = isFirst;
                              return (
                                <div key={idx} className="relative flex gap-3 pb-3 last:pb-0">
                                  {/* Dot + line */}
                                  <div className="flex flex-col items-center">
                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ring-2 ring-white ${isActive ? "bg-blue-500" : "bg-gray-300"}`} />
                                    {!isLast && <div className={`w-0.5 flex-1 min-h-[24px] ${isActive ? "bg-blue-200" : "bg-gray-200"}`} />}
                                  </div>
                                  {/* Content */}
                                  <div className="flex-1 min-w-0 -mt-0.5">
                                    <p className={`text-[11px] font-medium ${isActive ? "text-gray-900" : "text-gray-600"}`}>{cp.message || cp.tag}</p>
                                    {cp.location && <p className="text-[10px] text-gray-400 mt-0.5">{cp.location}</p>}
                                    <p className="text-[9px] text-gray-400 mt-0.5">
                                      {cp.time ? new Date(cp.time).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {trackData.lastUpdate && (
                            <p className="text-[9px] text-gray-400 mt-2">Dernière maj : {new Date(trackData.lastUpdate).toLocaleString("fr-FR")}</p>
                          )}
                        </div>
                      )}
                      {trackLoading && !trackData && (
                        <div className="flex items-center gap-2 py-4 justify-center">
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                          <span className="text-[11px] text-gray-400">Verification du statut en cours...</span>
                        </div>
                      )}
                      {!trackLoading && !trackData && !trackError && (
                        <p className="text-[10px] text-gray-400 italic">Cliquez sur "Actualiser" pour vérifier le statut en temps réel.</p>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        {getTrackingUrl(selectedOrder.shippingMethod, selectedOrder.trackingNumber) && (
                          <a href={getTrackingUrl(selectedOrder.shippingMethod, selectedOrder.trackingNumber)!} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 border border-blue-200 transition-colors">
                            <ExternalLinkIcon className="w-3 h-3" />
                            Suivre le colis
                          </a>
                        )}
                        <input type="text" value={trackingInput} onChange={e => setTrackingInput(e.target.value)}
                          placeholder="Modifier le numero..."
                          className="flex-1 text-xs font-mono px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300" />
                        <button onClick={() => handleSaveTrackingNumber(selectedOrder.id)} disabled={savingTracking || !trackingInput.trim()}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 border border-blue-200 disabled:opacity-50 transition-colors whitespace-nowrap">
                          {savingTracking ? "..." : "Mettre a jour"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input type="text" value={trackingInput} onChange={e => setTrackingInput(e.target.value)}
                        placeholder="Entrez le numero de suivi..."
                        className="flex-1 text-xs font-mono px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-300" />
                      <button onClick={() => handleSaveTrackingNumber(selectedOrder.id)} disabled={savingTracking || !trackingInput.trim()}
                        className="text-[11px] font-semibold text-white bg-amber-500 hover:bg-amber-600 px-3 py-2 rounded-lg disabled:opacity-50 transition-colors">
                        {savingTracking ? "..." : "Enregistrer"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Price breakdown */}
              <div className="rounded-xl border border-gray-100 p-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Details de la commande</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <PackageIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{selectedOrder.productName || "Produit"}</p>
                      <p className="text-[11px] text-gray-400">
                        {selectedOrder.quantity ? `x${selectedOrder.quantity}` : "x1"}
                        {selectedOrder.unitPrice ? ` — ${fmtCurrency(selectedOrder.unitPrice, selectedOrder.currency)}/unite` : ""}
                      </p>
                    </div>
                  </div>
                  {(selectedOrder.amountSubtotal !== null && selectedOrder.amountShipping !== null && selectedOrder.amountShipping > 0) ? (
                    <div className="space-y-1.5 pt-2 border-t border-gray-50">
                      <div className="flex justify-between text-xs"><span className="text-gray-400">Sous-total</span><span className="text-gray-600">{fmtCurrency(selectedOrder.amountSubtotal, selectedOrder.currency)}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-400">{selectedOrder.shippingMethod || "Livraison"}</span><span className="text-gray-600">{fmtCurrency(selectedOrder.amountShipping, selectedOrder.currency)}</span></div>
                      <div className="flex justify-between text-sm pt-1.5 border-t border-gray-100"><span className="font-bold text-gray-700">Total</span><span className="font-bold text-gray-900">{fmtCurrency(selectedOrder.amount, selectedOrder.currency)}</span></div>
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-50"><span className="font-bold text-gray-700">Total</span><span className="font-bold text-gray-900">{fmtCurrency(selectedOrder.amount, selectedOrder.currency)}</span></div>
                  )}
                </div>
              </div>

              {/* Customer info */}
              <div className="rounded-xl border border-gray-100 p-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Informations client</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {selectedOrder.customerName && <div><span className="text-gray-400 block">Nom</span><span className="text-gray-900 font-medium">{selectedOrder.customerName}</span></div>}
                  {selectedOrder.customerEmail && <div><span className="text-gray-400 block">Email</span><a href={`mailto:${selectedOrder.customerEmail}`} className="text-blue-600 font-medium hover:underline">{selectedOrder.customerEmail}</a></div>}
                  {selectedOrder.customerPhone && <div><span className="text-gray-400 block">Telephone</span><a href={`tel:${selectedOrder.customerPhone}`} className="text-blue-600 font-medium hover:underline">{selectedOrder.customerPhone}</a></div>}
                  {selectedOrder.shippingMethod && <div><span className="text-gray-400 block">Transporteur</span><span className="text-violet-600 font-semibold">{selectedOrder.shippingMethod}</span></div>}
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 p-4">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Adresse de livraison</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{fmtAddress(selectedOrder.shippingAddress)}</p>
                </div>
                <div className="rounded-xl border border-gray-100 p-4">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Adresse de facturation</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{fmtAddress(selectedOrder.billingAddress)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay for order detail */}
      {orderDetailLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500 mt-3">Chargement...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense>
      <AdminDashboardContent />
    </Suspense>
  );
}