"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { AdminProvider, useAdmin } from "@/context/AdminContext";
import { NAV_ITEMS } from "@/types/admin";
import { BellIcon, PackageIcon, XIcon, ExternalLinkIcon, NavIcon } from "@/components/admin/Icons";
import { timeAgo, fmtCurrency } from "@/lib/admin-utils";

// ─── Inner layout content ─────────────────────────────────────────────

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations("admin");
  const tTimeAgo = useTranslations("timeAgo");
  const locale = useLocale();
  const {
    orders, handleLogout, stripeStatus,
    notifications, unreadCount, showNotifPanel, setShowNotifPanel,
    bellRinging, toastNotif, setToastNotif,
    markNotificationRead, markAllRead, clearAllNotifications,
    openOrderDetailFromNotif,
  } = useAdmin();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const notifPanelRef = useRef<HTMLDivElement>(null);

  // Close notif panel on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)) setShowNotifPanel(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [setShowNotifPanel]);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const isTest = stripeStatus?.mode === "test";
  const currentNav = NAV_ITEMS.find(n => pathname === n.href || (n.href === "/admin" && pathname === "/admin")) || NAV_ITEMS[0];
  const pageLabel = currentNav ? t("nav." + (currentNav.id as "dashboard" | "paiement" | "livraison" | "pays" | "produits")) : t("nav.dashboard");

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex">

      {/* ===== MOBILE SIDEBAR OVERLAY ===== */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        </div>
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 lg:z-20 h-screen w-60 bg-white border-r border-gray-200/60 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Sidebar header */}
        <div className="px-5 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-sm">
            <span className="text-white text-[11px] font-bold tracking-tight">eI</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">e.IcosSys</h1>
            <span className="text-[10px] text-gray-400 font-medium">{t("title")}</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100">
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || (item.href === "/admin" && pathname === "/admin");
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <NavIcon d={item.icon} />
                <span>{t("nav." + (item.id as "dashboard" | "paiement" | "livraison" | "pays" | "produits"))}</span>
                {item.id === "dashboard" && orders.length > 0 && (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}>{orders.length}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="px-4 py-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="flex-1 flex flex-col min-w-0">

      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-30">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <h2 className="text-sm sm:text-base font-bold text-gray-900">{pageLabel}</h2>
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
                      <h3 className="text-sm font-semibold text-gray-900">{t("notifications")}</h3>
                      {unreadCount > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">{t("unread", { count: unreadCount })}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold">{t("markAllRead")}</button>
                      )}
                      {notifications.length > 0 && (
                        <button onClick={clearAllNotifications} className="text-[11px] text-gray-400 hover:text-red-500 font-medium">{t("clear")}</button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2"><BellIcon className="w-5 h-5 text-gray-400" /></div>
                        <p className="text-xs text-gray-400">{t("noNotifications")}</p>
                      </div>
                    ) : notifications.map(n => (
                      <button key={n.id} onClick={() => { openOrderDetailFromNotif(n.id); setShowNotifPanel(false); markNotificationRead(n.id); }}
                        className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50/80 transition-colors ${!n.read ? "bg-blue-50/40" : ""}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${!n.read ? "bg-blue-100" : "bg-gray-100"}`}>
                            <PackageIcon className={`w-4 h-4 ${!n.read ? "text-blue-600" : "text-gray-400"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-gray-900 truncate">{n.customerName || n.customerEmail || t("client")}</p>
                              <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(n.time, tTimeAgo)}</span>
                            </div>
                            {n.productName && <p className="text-[11px] text-gray-500 truncate mt-0.5">{n.productName}</p>}
                            <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">{fmtCurrency(n.amount, n.currency, locale)}</p>
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
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 font-medium flex items-center gap-1.5">
              <ExternalLinkIcon />
              <span className="hidden sm:inline">{t("viewShop")}</span>
            </a>
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 font-medium flex items-center gap-1.5 min-h-[44px]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
              <span className="hidden sm:inline">{t("logout")}</span>
            </button>
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
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{t("newOrder")}</p>
              <p className="text-xs text-gray-300 mt-0.5 truncate">{toastNotif}</p>
            </div>
            <button onClick={() => setToastNotif(null)} className="text-gray-500 hover:text-white ml-2 text-lg leading-none">&times;</button>
          </div>
        </div>
      )}

      {/* PAGE CONTENT */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 space-y-6 overflow-y-auto">
        {children}
      </main>

      </div>{/* END MAIN AREA */}
    </div>
  );
}

// ─── Layout Export ─────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      <Suspense>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </Suspense>
    </AdminProvider>
  );
}