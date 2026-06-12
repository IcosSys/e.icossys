"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useAdmin } from "@/context/AdminContext";
import { type OrderDetail, type TrackingData, ORDER_STATUS_CONFIG, STATUS_FLOW, ORDERS_PER_PAGE } from "@/types/admin";
import { fmtDate, fmtCurrency, fmtAddress, getTrackingUrl, detectCarrierLabel } from "@/lib/admin-utils";
import { PackageIcon, SearchIcon, FilterIcon, XIcon, ExternalLinkIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/admin/Icons";

export default function DashboardPage() {
  const t = useTranslations("admin");
  const ts = useTranslations("admin.dashboard");
  const tStatus = useTranslations("orderStatus");
  const locale = useLocale();
  const { stripeStatus, orders, fetchOrders, ordersLoading, setOrders } = useAdmin();

  // Local order detail state
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Search, Filter, Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [shippingFilter, setShippingFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tracking number input in modal
  const [trackingInput, setTrackingInput] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);

  // Live tracking (AfterShip)
  const [trackData, setTrackData] = useState<TrackingData | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Per-order tracking summaries in the list view
  const [orderTrackStatus, setOrderTrackStatus] = useState<Record<string, { tag: string; label: string; bg: string; color: string; lastUpdate: string }>>({});
  const [checkingOrders, setCheckingOrders] = useState<Set<string>>(new Set());

  // Auto-refresh + sync protection
  const lastStatusChangeAt = useRef<number>(0);

  // Reset page when search/filter changes
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, shippingFilter]);

  // --- Derived: filtered + paginated orders ---

  const filteredOrders = useMemo(() => {
    let result = orders;
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
    if (statusFilter !== "all") result = result.filter(o => o.orderStatus === statusFilter);
    if (shippingFilter !== "all") result = result.filter(o => o.shippingMethod === shippingFilter);
    return result;
  }, [orders, searchQuery, statusFilter, shippingFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const uniqueShippingMethods = useMemo(() => {
    const methods = new Set(orders.map(o => o.shippingMethod).filter(Boolean) as string[]);
    return Array.from(methods).sort();
  }, [orders]);

  // --- KPIs ---

  const totalRevenue = orders.reduce((s, o) => s + o.amount, 0);
  const avgOrder = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const pendingCount = orders.filter(o => o.orderStatus === "paid").length;

  // --- Handlers ---

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {}, 300);
  };

  const openOrderDetail = useCallback(async (orderId: string) => {
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
  }, []);

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
        const tr = data.tracking;
        if (isModal) setTrackData(tr);
        setOrderTrackStatus(prev => ({
          ...prev,
          [orderId]: { tag: tr.tag, label: tr.label, bg: tr.bg, color: tr.color, lastUpdate: tr.lastUpdate },
        }));
        if (tr.tag === "Delivered") {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: "delivered" } : o));
          if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, orderStatus: "delivered" } : null);
        }
      } else if (data.planRequired) {
        if (isModal) setTrackError(null);
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

  // Auto-refresh 15s avec cooldown 10s après changement de statut
  useEffect(() => {
    if (!stripeStatus?.connected) return;
    const interval = setInterval(() => {
      if (Date.now() - lastStatusChangeAt.current < 10000) return;
      fetchOrders();
    }, 15000);
    return () => clearInterval(interval);
  }, [stripeStatus?.connected, fetchOrders]);

  // Auto-check tracking when opening modal if tracking exists
  useEffect(() => {
    if (selectedOrder?.trackingNumber && !trackData && !trackLoading) {
      handleCheckTracking(selectedOrder.id, selectedOrder.trackingNumber, selectedOrder.shippingMethod, true);
    }
  }, [selectedOrder?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for notification-based order open events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.orderId) openOrderDetail(detail.orderId);
    };
    window.addEventListener("admin:openOrder", handler);
    return () => window.removeEventListener("admin:openOrder", handler);
  }, [openOrderDetail]);

  // ==================== RENDER ====================

  return (
    <>
      {/* KPI */}
      {stripeStatus?.connected && orders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: ts("revenue"), value: fmtCurrency(totalRevenue, "eur", locale), icon: <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, bg: "bg-emerald-100" },
            { label: ts("orders"), value: String(orders.length), icon: <PackageIcon className="w-3.5 h-3.5 text-blue-600" />, bg: "bg-blue-100" },
            { label: ts("avgCart"), value: orders.length > 0 ? fmtCurrency(avgOrder, "eur", locale) : "-", icon: <svg className="w-3.5 h-3.5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>, bg: "bg-violet-100" },
            { label: ts("pending"), value: String(pendingCount), icon: <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, bg: "bg-amber-100" },
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

      {/* ORDERS SECTION */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">{ts("ordersTitle")}</h2>
          {stripeStatus?.connected && orders.length > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-900 text-white">{orders.length}</span>}
        </div>
        {stripeStatus?.connected && orders.length > 0 && (
          <button onClick={fetchOrders} disabled={ordersLoading} className="text-[11px] text-gray-400 hover:text-gray-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 font-medium transition-colors">
            <svg className={`w-3.5 h-3.5 ${ordersLoading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {ts("refresh")}
          </button>
        )}
      </div>

      {!stripeStatus?.connected ? (
        <div className="bg-white rounded-2xl border border-gray-200/60 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
          </div>
          <p className="text-sm text-gray-400 font-medium">{ts("connectStripe")}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden">
          {ordersLoading && orders.length === 0 && (
            <div className="p-12 text-center"><div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto" /><p className="text-sm text-gray-400 mt-3">{ts("loading")}</p></div>
          )}
          {!ordersLoading && orders.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3"><PackageIcon className="w-6 h-6 text-gray-300" /></div>
              <p className="text-gray-500 font-semibold text-sm">{ts("noOrders")}</p>
              <p className="text-gray-400 text-xs mt-1">{ts("ordersWillAppear")}</p>
            </div>
          )}
          {orders.length > 0 && (<>

            {/* ===== SEARCH & FILTER BAR ===== */}
            <div className="px-4 sm:px-5 py-3 border-b border-gray-100 bg-gray-50/40 space-y-3">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><SearchIcon className="w-4 h-4" /></div>
                <input
                  type="text" value={searchQuery} onChange={e => handleSearchChange(e.target.value)}
                  placeholder={ts("searchPlaceholder")}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><XIcon className="w-4 h-4" /></button>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-gray-400"><FilterIcon className="w-3.5 h-3.5" /><span className="text-[10px] font-semibold uppercase tracking-wider">{ts("filters")}</span></div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 cursor-pointer">
                  <option value="all">{ts("allStatuses")}</option>
                  {Object.entries(ORDER_STATUS_CONFIG).map(([key, cfg]) => (
                    <option key={key} value={key}>{tStatus(cfg.label as "paid" | "processing" | "shipped" | "delivered" | "cancelled")}</option>
                  ))}
                </select>
                {uniqueShippingMethods.length > 0 && (
                  <select value={shippingFilter} onChange={e => setShippingFilter(e.target.value)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 cursor-pointer">
                    <option value="all">{ts("allCarriers")}</option>
                    {uniqueShippingMethods.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                )}
                {(statusFilter !== "all" || shippingFilter !== "all" || searchQuery) && (
                  <button onClick={() => { setStatusFilter("all"); setShippingFilter("all"); setSearchQuery(""); }}
                    className="text-[11px] text-red-500 hover:text-red-600 font-medium px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    {ts("reset")}
                  </button>
                )}
                <span className="text-[10px] text-gray-400 ml-auto">{filteredOrders.length} {filteredOrders.length === 1 ? ts("result") : ts("results")}</span>
              </div>
            </div>

            {/* ===== DESKTOP TABLE ===== */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/60 text-left">
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ts("th_order")}</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ts("th_product")}</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ts("th_customer")}</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ts("th_amount")}</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ts("th_shipping")}</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ts("th_tracking")}</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ts("th_status")}</th>
                    <th className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ts("th_date")}</th>
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
                        <td className="px-5 py-3.5"><span className="text-xs font-semibold text-gray-900">{fmtCurrency(order.amount, order.currency, locale)}</span></td>
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
                              <button onClick={() => handleCheckTracking(order.id, order.trackingNumber!, order.shippingMethod)}
                                disabled={checkingOrders.has(order.id)}
                                className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40"
                                title={ts("verifyRealtime")}>
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
                          <select value={order.orderStatus} onChange={e => { e.stopPropagation(); handleStatusChange(order.id, e.target.value); }}
                            onClick={e => e.stopPropagation()}
                            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-300 ${sc.bg} ${sc.color}`}>
                            {Object.entries(ORDER_STATUS_CONFIG).map(([key, cfg]) => (
                              <option key={key} value={key}>{tStatus(cfg.label as "paid" | "processing" | "shipped" | "delivered" | "cancelled")}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3.5"><span className="text-[11px] text-gray-500 whitespace-nowrap">{fmtDate(order.created, locale)}</span></td>
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
                        <select value={order.orderStatus} onChange={e => { e.stopPropagation(); handleStatusChange(order.id, e.target.value); }}
                          onClick={e => e.stopPropagation()}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer focus:outline-none ${sc.bg} ${sc.color}`}>
                          {Object.entries(ORDER_STATUS_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key}>{tStatus(cfg.label as "paid" | "processing" | "shipped" | "delivered" | "cancelled")}</option>
                          ))}
                        </select>
                      </div>
                      <span className="text-xs font-bold text-gray-900 flex-shrink-0">{fmtCurrency(order.amount, order.currency, locale)}</span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <PackageIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-700 truncate">{order.productName || t("order")}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-500 truncate">{order.shippingName || order.customerName || ""}</span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">{fmtDate(order.created, locale)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {order.shippingMethod && <span className="text-[9px] font-semibold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">{order.shippingMethod}</span>}
                      {order.trackingNumber && (
                        <span className="text-[9px] font-mono text-blue-600 font-semibold truncate max-w-[120px]">{order.trackingNumber}</span>
                      )}
                      {order.trackingNumber && (
                        <button onClick={e => { e.stopPropagation(); handleCheckTracking(order.id, order.trackingNumber!, order.shippingMethod); }}
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
                <p className="text-gray-500 font-semibold text-sm">{ts("noResults")}</p>
                <p className="text-gray-400 text-xs mt-1">{ts("tryModifySearch")}</p>
              </div>
            )}
          </>)}
        </div>
      )}

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
                  <p className="text-sm font-bold text-gray-900">{ts("orderOf", { id: selectedOrder.id.slice(-8) })}</p>
                  <p className="text-[10px] text-gray-400">{fmtDate(selectedOrder.created, locale)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-5 sm:px-6 py-5 space-y-5">
              {/* Status pipeline */}
              <div>
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">{ts("orderStatus")}</h3>
                <div className="flex items-center gap-1">
                  {STATUS_FLOW.map((step, idx) => {
                    const isActive = STATUS_FLOW.indexOf(selectedOrder.orderStatus as typeof STATUS_FLOW[number]) >= idx;
                    const isCurrent = selectedOrder.orderStatus === step;
                    const cfg = ORDER_STATUS_CONFIG[step];
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center gap-1 sm:gap-1.5">
                        <button onClick={() => handleStatusChange(selectedOrder.id, step)} disabled={updatingStatus}
                          className={`w-full flex items-center gap-1 ${idx < STATUS_FLOW.length - 1 ? "flex-col" : ""}`}>
                          <div className={`w-full flex items-center`}>
                            {idx > 0 && <div className={`h-0.5 flex-1 ${isActive ? "bg-gray-900" : "bg-gray-200"}`} />}
                            <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                              isCurrent ? "border-gray-900 bg-gray-900 animate-status-glow" : isActive ? "border-gray-900 bg-white" : "border-gray-200 bg-white"
                            }`}>
                              {isActive && <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${isCurrent ? "bg-white" : "bg-gray-900"}`} />}
                            </div>
                            {idx < STATUS_FLOW.length - 1 && <div className={`h-0.5 flex-1 ${STATUS_FLOW.indexOf(selectedOrder.orderStatus as typeof STATUS_FLOW[number]) > idx ? "bg-gray-900" : "bg-gray-200"}`} />}
                          </div>
                        </button>
                        <span className={`text-[8px] sm:text-[9px] font-semibold leading-tight text-center ${isCurrent ? "text-gray-900" : isActive ? "text-gray-600" : "text-gray-400"}`}>{tStatus(cfg.label as "paid" | "processing" | "shipped" | "delivered")}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end mt-2">
                  <button onClick={() => handleStatusChange(selectedOrder.id, "cancelled")} disabled={updatingStatus}
                    className="text-[10px] font-semibold text-red-500 hover:text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                    {ts("cancelOrder")}
                  </button>
                </div>
              </div>

              {/* Tracking number */}
              {(selectedOrder.orderStatus === "shipped" || selectedOrder.orderStatus === "delivered") && (
                <div className={`rounded-xl border p-4 ${selectedOrder.trackingNumber ? "border-blue-200 bg-blue-50/30" : "border-amber-200 bg-amber-50/30"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{ts("trackingNumber")}</h3>
                    {selectedOrder.trackingNumber && (
                      <button onClick={handleCheckTrackingModal} disabled={trackLoading}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50">
                        {trackLoading ? (
                          <div className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                        )}
                        {ts("refreshTracking")}
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
                      {trackData && trackData.checkpoints.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200/60">
                          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">{ts("trackingHistory")}</h4>
                          <div className="relative space-y-0">
                            {trackData.checkpoints.map((cp, idx) => {
                              const isFirst = idx === 0;
                              const isLast = idx === trackData.checkpoints.length - 1;
                              const isActive = isFirst;
                              return (
                                <div key={idx} className="relative flex gap-3 pb-3 last:pb-0">
                                  <div className="flex flex-col items-center">
                                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ring-2 ring-white ${isActive ? "bg-blue-500" : "bg-gray-300"}`} />
                                    {!isLast && <div className={`w-0.5 flex-1 min-h-[24px] ${isActive ? "bg-blue-200" : "bg-gray-200"}`} />}
                                  </div>
                                  <div className="flex-1 min-w-0 -mt-0.5">
                                    <p className={`text-[11px] font-medium ${isActive ? "text-gray-900" : "text-gray-600"}`}>{cp.message || cp.tag}</p>
                                    {cp.location && <p className="text-[10px] text-gray-400 mt-0.5">{cp.location}</p>}
                                    <p className="text-[9px] text-gray-400 mt-0.5">
                                      {cp.time ? new Date(cp.time).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {trackData.lastUpdate && (
                            <p className="text-[9px] text-gray-400 mt-2">{ts("lastUpdate", { date: new Date(trackData.lastUpdate).toLocaleString(locale === "en" ? "en-US" : "fr-FR") })}</p>
                          )}
                        </div>
                      )}
                      {trackLoading && !trackData && (
                        <div className="flex items-center gap-2 py-4 justify-center">
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                          <span className="text-[11px] text-gray-400">...</span>
                        </div>
                      )}
                      {!trackLoading && !trackData && !trackError && (
                        <p className="text-[10px] text-gray-400 italic">{ts("verifyRealtime")}</p>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                        {getTrackingUrl(selectedOrder.shippingMethod, selectedOrder.trackingNumber) && (
                          <a href={getTrackingUrl(selectedOrder.shippingMethod, selectedOrder.trackingNumber)!} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 border border-blue-200 transition-colors min-h-[44px]">
                            <ExternalLinkIcon className="w-3 h-3" />
                            Suivre le colis
                          </a>
                        )}
                        <input type="text" value={trackingInput} onChange={e => setTrackingInput(e.target.value)}
                          placeholder="..."
                          className="flex-1 text-xs font-mono px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 min-h-[44px]" />
                        <button onClick={() => handleSaveTrackingNumber(selectedOrder.id)} disabled={savingTracking || !trackingInput.trim()}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 border border-blue-200 disabled:opacity-50 transition-colors whitespace-nowrap min-h-[44px]">
                          {savingTracking ? "..." : "Mettre à jour"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <input type="text" value={trackingInput} onChange={e => setTrackingInput(e.target.value)}
                        placeholder="..."
                        className="flex-1 text-xs font-mono px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-300 min-h-[44px]" />
                      <button onClick={() => handleSaveTrackingNumber(selectedOrder.id)} disabled={savingTracking || !trackingInput.trim()}
                        className="text-[11px] font-semibold text-white bg-amber-500 hover:bg-amber-600 px-3 py-2 rounded-lg disabled:opacity-50 transition-colors min-h-[44px]">
                        {savingTracking ? "..." : "Enregistrer"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Price breakdown */}
              <div className="rounded-xl border border-gray-100 p-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">{ts("orderDetails")}</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <PackageIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{selectedOrder.productName || t("order")}</p>
                      <p className="text-[11px] text-gray-400">
                        {selectedOrder.quantity ? `x${selectedOrder.quantity}` : "x1"}
                        {selectedOrder.unitPrice ? ` — ${fmtCurrency(selectedOrder.unitPrice, selectedOrder.currency, locale)}${ts("perUnit")}` : ""}
                      </p>
                    </div>
                  </div>
                  {(selectedOrder.amountSubtotal !== null && selectedOrder.amountShipping !== null && selectedOrder.amountShipping > 0) ? (
                    <div className="space-y-1.5 pt-2 border-t border-gray-50">
                      <div className="flex justify-between text-xs"><span className="text-gray-400">{ts("subtotal")}</span><span className="text-gray-600">{fmtCurrency(selectedOrder.amountSubtotal, selectedOrder.currency, locale)}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-gray-400">{selectedOrder.shippingMethod || ts("shipping")}</span><span className="text-gray-600">{fmtCurrency(selectedOrder.amountShipping, selectedOrder.currency, locale)}</span></div>
                      <div className="flex justify-between text-sm pt-1.5 border-t border-gray-100"><span className="font-bold text-gray-700">{ts("total")}</span><span className="font-bold text-gray-900">{fmtCurrency(selectedOrder.amount, selectedOrder.currency, locale)}</span></div>
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-50"><span className="font-bold text-gray-700">{ts("total")}</span><span className="font-bold text-gray-900">{fmtCurrency(selectedOrder.amount, selectedOrder.currency, locale)}</span></div>
                  )}
                </div>
              </div>

              {/* Customer info */}
              <div className="rounded-xl border border-gray-100 p-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">{ts("customerInfo")}</h3>
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
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{ts("shippingAddress")}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{fmtAddress(selectedOrder.shippingAddress)}</p>
                </div>
                <div className="rounded-xl border border-gray-100 p-4">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{ts("billingAddress")}</h3>
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
            <p className="text-sm text-gray-500 mt-3">{ts("loading")}</p>
          </div>
        </div>
      )}
    </>
  );
}