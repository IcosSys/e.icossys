"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart, CartItem } from "@/context/CartContext";
import { ALL_COUNTRIES } from "@/lib/countries";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function formatPrice(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function CartIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function CartItemRow({ item, onUpdateQty, onRemove, t, locale }: { item: CartItem; onUpdateQty: (id: string, q: number) => void; onRemove: (id: string) => void; t: ReturnType<typeof useTranslations>; locale: string }) {
  return (
    <div className="flex gap-3 sm:gap-4 py-5 border-b border-gray-100 last:border-0">
      {/* Image */}
      <Link href={`/produit/${item.productId}`} className="flex-shrink-0">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
          {item.mainImage ? (
            <img src={item.mainImage} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/produit/${item.productId}`} className="text-sm font-semibold text-gray-900 hover:text-gray-700 transition-colors line-clamp-2">
              {item.name}
            </Link>
            <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(item.price, locale)}</p>
          </div>
          <button
            onClick={() => onRemove(item.productId)}
            className="flex-shrink-0 w-9 h-9 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
            title={t("cart.remove")}
          >
            <TrashIcon />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity controls */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
              className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors text-sm"
            >
              −
            </button>
            <span className="w-10 text-center text-sm font-medium text-gray-900">{item.quantity}</span>
            <button
              onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
              className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors text-sm"
            >
              +
            </button>
          </div>

          {/* Line total */}
          <span className="text-sm font-bold text-gray-900">
            {formatPrice(item.price * item.quantity, locale)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PanierPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const router = useRouter();
  const [checkingOut, setCheckingOut] = useState(false);
  const [shippingCountries, setShippingCountries] = useState<string[] | null>(null);
  const [showAllCountries, setShowAllCountries] = useState(false);

  useEffect(() => {
    fetch("/api/countries")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.countries)) {
          setShippingCountries(data.countries);
        }
      })
      .catch(() => {
        /* silently ignore – section will be hidden */
      });
  }, []);

  const tc = useTranslations("countries");
  const deliveryCountryNames = shippingCountries
    ? shippingCountries
        .map((code) => {
          try {
            return tc(code as "FR");
          } catch {
            return ALL_COUNTRIES.find((c) => c.code === code)?.code ?? code;
          }
        })
        .filter(Boolean)
    : null;
  const MAX_VISIBLE = 5;
  const visibleCountries = deliveryCountryNames
    ? showAllCountries
      ? deliveryCountryNames
      : deliveryCountryNames.slice(0, MAX_VISIBLE)
    : null;
  const hiddenCount = deliveryCountryNames
    ? deliveryCountryNames.length - MAX_VISIBLE
    : 0;

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const lineItems = items.map(item => ({
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lineItems, locale }),
      });

      const data = await res.json();

      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        alert(t("cart.checkoutError", { error: data.error || "Unknown error" }));
      }
    } catch {
      alert(t("cart.connectionError"));
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all"
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="text-lg font-bold text-gray-900">{t("cart.title")}</h1>
            {items.length > 0 && (
              <span className="text-xs font-medium text-gray-400">({items.length} {t("cart.items")}{items.length > 1 ? "s" : ""})</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">eI</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {items.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
              <CartIcon className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{t("cart.empty")}</h2>
            <p className="text-sm text-gray-400 mb-6">{t("cart.emptySubtitle")}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              {t("cart.continueShopping")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/60 px-4 sm:px-6">
              {items.map(item => (
                <CartItemRow
                  key={item.productId}
                  item={item}
                  onUpdateQty={updateQuantity}
                  onRemove={removeItem}
                  t={t}
                  locale={locale}
                />
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200/60 p-5 sm:p-6 sticky top-24">
                <h3 className="text-sm font-bold text-gray-900 mb-4">{t("cart.orderSummary")}</h3>

                <div className="space-y-2 mb-4">
                  {items.map(item => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-gray-500 truncate mr-4">{item.name} × {item.quantity}</span>
                      <span className="text-gray-900 font-medium flex-shrink-0">{formatPrice(item.price * item.quantity, locale)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-3 mb-5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium text-gray-600">{t("cart.total")}</span>
                    <span className="text-xl font-bold text-gray-900">{formatPrice(totalPrice, locale)}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{t("cart.shippingCalcNext")}</p>
                </div>

                {visibleCountries && visibleCountries.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                      </svg>
                      <span className="text-[11px] font-semibold text-gray-500">{t("cart.deliveryZone")}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      {visibleCountries.join(" · ")}
                      {hiddenCount > 0 && (
                        <button
                          onClick={() => setShowAllCountries((v) => !v)}
                          className="text-gray-500 hover:text-gray-700 font-medium transition-colors ml-1"
                        >
                          {showAllCountries
                            ? t("cart.seeLess")
                            : t("cart.otherCountries", { count: hiddenCount })}
                        </button>
                      )}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full min-h-[48px] bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {checkingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    t("cart.checkout")
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4">
                  <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <span className="text-[11px] text-gray-400">{t("common.securePayment")}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}