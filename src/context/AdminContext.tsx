"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { type StripeStatus, type StripeMode, type Order, type Notification, type ShippingOpt, NOTIF_STORAGE_KEY } from "@/types/admin";
import { fmtCurrency } from "@/lib/admin-utils";

// ─── Context Shape ────────────────────────────────────────────────────

interface AdminContextValue {
  // Stripe
  stripeStatus: StripeStatus | null;
  fetchStatus: () => void;
  loading: boolean;
  editingKey: boolean;
  setEditingKey: React.Dispatch<React.SetStateAction<boolean>>;
  keyInput: string;
  setKeyInput: React.Dispatch<React.SetStateAction<string>>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  keyError: string;
  setKeyError: React.Dispatch<React.SetStateAction<string>>;
  keySuccess: boolean;
  setKeySuccess: React.Dispatch<React.SetStateAction<boolean>>;
  handleSaveKey: (e: React.FormEvent) => void;
  handleDisconnect: () => void;
  handleSwitchMode: (newMode: StripeMode) => void;
  detectedMode: StripeMode | null;

  // Orders
  orders: Order[];
  fetchOrders: () => void;
  ordersLoading: boolean;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;

  // Notifications
  notifications: Notification[];
  unreadCount: number;
  showNotifPanel: boolean;
  setShowNotifPanel: React.Dispatch<React.SetStateAction<boolean>>;
  bellRinging: boolean;
  setBellRinging: React.Dispatch<React.SetStateAction<boolean>>;
  toastNotif: string | null;
  setToastNotif: React.Dispatch<React.SetStateAction<string | null>>;
  markNotificationRead: (notifId: string) => void;
  markAllRead: () => void;
  clearAllNotifications: () => void;
  openOrderDetailFromNotif: (orderId: string) => void;

  // Webhook
  webhookConfigured: boolean;
  setWebhookConfigured: React.Dispatch<React.SetStateAction<boolean>>;
  fetchWebhookConfig: () => void;
  webhookHint: string | null;
  setWebhookHint: React.Dispatch<React.SetStateAction<string | null>>;

  // Shipping
  shippingOpts: ShippingOpt[];
  setShippingOpts: React.Dispatch<React.SetStateAction<ShippingOpt[]>>;
  fetchShippingConfig: (force?: boolean) => void;
  shippingLoaded: boolean;

  // Countries
  selectedCountries: string[];
  setSelectedCountries: React.Dispatch<React.SetStateAction<string[]>>;
  countriesLoaded: boolean;
  fetchCountries: () => void;

  // Auth
  handleLogout: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Stripe
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyInput, setKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [keySuccess, setKeySuccess] = useState(false);
  const [editingKey, setEditingKey] = useState(false);
  const switchingRef = useRef(false);

  const detectedMode = keyInput.trim().startsWith("sk_test_") ? "test" as StripeMode
    : keyInput.trim().startsWith("sk_live_") ? "live" as StripeMode : null;

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const prevOrdersRef = useRef<string>("");

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [bellRinging, setBellRinging] = useState(false);
  const [toastNotif, setToastNotif] = useState<string | null>(null);
  const notifLoadedRef = useRef(false);
  const webhookNotifIdsRef = useRef<Set<string>>(new Set());

  // Webhook
  const [webhookConfigured, setWebhookConfigured] = useState(false);
  const [webhookHint, setWebhookHint] = useState<string | null>(null);

  // Shipping
  const [shippingOpts, setShippingOpts] = useState<ShippingOpt[]>([]);
  const [shippingLoaded, setShippingLoaded] = useState(false);
  const shippingInitializedRef = useRef(false);

  // Countries
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [countriesLoaded, setCountriesLoaded] = useState(false);

  // --- Notification persistence ---

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

  const markNotificationRead = useCallback((notifId: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notifId ? { ...n, read: true } : n);
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, [saveNotifications]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, [saveNotifications]);

  const openOrderDetailFromNotif = useCallback((orderId: string) => {
    // Navigate to dashboard when clicking a notification (the dashboard handles the modal)
    // We'll use a custom event or simply navigate
    const event = new CustomEvent("admin:openOrder", { detail: { orderId } });
    window.dispatchEvent(event);
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

      let fresh: Order[] = [];
      let referenceIds = oldIds;

      if (!oldIds) {
        try {
          const savedIds = localStorage.getItem("e-icossys-last-order-ids");
          referenceIds = savedIds || "";
        } catch {}
      }

      if (referenceIds && newIds !== referenceIds) {
        const oldSet = new Set(referenceIds.split(","));
        fresh = newOrders.filter((o: Order) => !oldSet.has(o.id));
      }

      try { localStorage.setItem("e-icossys-last-order-ids", newIds); } catch {}

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
      prevOrdersRef.current = newIds;
      setOrders(newOrders);
    }).catch(() => setOrders([]))
    .finally(() => setOrdersLoading(false));
  }, [saveNotifications]);

  const fetchWebhookConfig = useCallback(() => {
    fetch("/api/webhook/config").then(r => r.json()).then(d => {
      setWebhookConfigured(d.configured);
      setWebhookHint(d.hint || null);
    }).catch(() => {});
  }, []);

  const fetchShippingConfig = useCallback((force = false) => {
    if (shippingInitializedRef.current && !force) return;
    fetch("/api/shipping/config").then(r => r.json()).then(d => {
      setShippingOpts(d.options || []);
      setShippingLoaded(true);
      shippingInitializedRef.current = true;
    }).catch(() => {});
  }, []);

  const fetchCountries = useCallback(() => {
    fetch("/api/countries").then(r => r.json()).then(d => {
      setSelectedCountries(d.countries || []);
      setCountriesLoaded(true);
    }).catch(() => {});
  }, []);

  // --- Stripe handlers ---

  const handleSaveKey = useCallback(async (e: React.FormEvent) => {
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
  }, [keyInput, fetchStatus]);

  const handleDisconnect = useCallback(async () => {
    if (!confirm("Déconnecter Stripe ?")) return;
    await fetch("/api/stripe/disconnect", { method: "POST" });
    setEditingKey(true); fetchStatus();
  }, [fetchStatus]);

  const handleSwitchMode = useCallback(async (newMode: StripeMode) => {
    if (newMode === stripeStatus?.mode) return;
    switchingRef.current = true;
    try {
      const res = await fetch("/api/stripe/mode", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: newMode }) });
      if (res.ok) fetchStatus(); else alert((await res.json()).error || "Erreur");
    } catch { alert("Erreur de connexion."); }
    finally { switchingRef.current = false; }
  }, [stripeStatus?.mode, fetchStatus]);

  const handleLogout = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }, [router]);

  // --- Effects ---

  // Load notifications from localStorage on mount
  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  // Fetch stripe status on mount
  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Fetch orders, shipping config, webhook config, countries when stripe is connected
  useEffect(() => {
    if (stripeStatus?.connected) {
      fetchOrders();
      fetchShippingConfig();
      fetchWebhookConfig();
      fetchCountries();
    }
  }, [stripeStatus?.connected, fetchOrders, fetchShippingConfig, fetchWebhookConfig, fetchCountries]);

  // Polling rapide des notifications webhook (5s) quand Stripe est connecté
  useEffect(() => {
    if (!stripeStatus?.connected || !webhookConfigured) return;
    let isFirstPoll = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        const serverNotifs: Array<{ id: string; orderId: string; customerName: string | null; customerEmail: string | null; amount: number; currency: string; productName: string | null; timestamp: number; read: boolean }> = data.notifications || [];

        if (serverNotifs.length === 0) return;

        const fresh = serverNotifs.filter(n => !webhookNotifIdsRef.current.has(n.id));

        serverNotifs.forEach(n => webhookNotifIdsRef.current.add(n.id));

        if (isFirstPoll) {
          isFirstPoll = false;
          if (fresh.length > 0) {
            setNotifications(prev => {
              const existingIds = new Set(prev.map(p => p.id));
              const newNotifs = fresh
                .filter(n => !existingIds.has(n.id))
                .map(n => ({
                  id: n.id, customerName: n.customerName, customerEmail: n.customerEmail,
                  amount: n.amount, currency: n.currency, productName: n.productName,
                  time: n.timestamp, read: n.read,
                }));
              if (newNotifs.length === 0) return prev;
              const updated = [...newNotifs, ...prev].slice(0, 100);
              saveNotifications(updated);
              return updated;
            });
          }
          return;
        }

        if (fresh.length > 0) {
          setNotifications(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newNotifs = fresh
              .filter(n => !existingIds.has(n.id))
              .map(n => ({
                id: n.id, customerName: n.customerName, customerEmail: n.customerEmail,
                amount: n.amount, currency: n.currency, productName: n.productName,
                time: n.timestamp, read: n.read,
              }));
            if (newNotifs.length === 0) return prev;
            const updated = [...newNotifs, ...prev].slice(0, 100);
            saveNotifications(updated);
            return updated;
          });

          const latest = fresh[0];
          setToastNotif(`${latest.customerName || latest.customerEmail || "Client"} — ${latest.productName || "Commande"} — ${fmtCurrency(latest.amount, latest.currency)}`);
          setTimeout(() => setToastNotif(null), 5000);
          setBellRinging(true);
          setTimeout(() => setBellRinging(false), 800);
        }
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [stripeStatus?.connected, webhookConfigured, saveNotifications]);

  const value: AdminContextValue = {
    stripeStatus, fetchStatus, loading, editingKey, setEditingKey,
    keyInput, setKeyInput, saving, setSaving, keyError, setKeyError, keySuccess, setKeySuccess,
    handleSaveKey, handleDisconnect, handleSwitchMode, detectedMode,
    orders, fetchOrders, ordersLoading, setOrders,
    notifications, unreadCount, showNotifPanel, setShowNotifPanel,
    bellRinging, setBellRinging, toastNotif, setToastNotif,
    markNotificationRead, markAllRead, clearAllNotifications, openOrderDetailFromNotif,
    webhookConfigured, setWebhookConfigured, fetchWebhookConfig, webhookHint, setWebhookHint,
    shippingOpts, setShippingOpts, fetchShippingConfig, shippingLoaded,
    selectedCountries, setSelectedCountries, countriesLoaded, fetchCountries,
    handleLogout,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}