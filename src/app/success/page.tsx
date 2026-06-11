"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface Address {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
}

interface OrderDetails {
  id: string;
  amount: number;
  amountSubtotal: number | null;
  amountShipping: number | null;
  currency: string;
  status: string;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  paymentStatus: string;
  orderStatus: string;
  created: number;
  productName: string | null;
  shippingMethod: string | null;
  shippingAddress: Address | null;
  billingAddress: Address | null;
  unitPrice: number | null;
  quantity: number | null;
  trackingNumber: string | null;
}

function formatAddress(addr: Address | null): string {
  if (!addr) return "Non renseignée";
  const parts = [addr.line1, addr.line2, addr.postalCode, addr.city, addr.country].filter(Boolean) as string[];
  return parts.join(", ") || "Non renseignée";
}

function fmtCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function fmtDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function TrackingBlock({ method, number }: { method: string | null; number: string }) {
  const m = (method || "").toLowerCase();
  const trackingUrl = m.includes("chronopost")
    ? `https://www.chronopost.fr/tracking-cargo?listeNumerosLT=${encodeURIComponent(number)}`
    : `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(number)}`;

  const [trackData, setTrackData] = useState<{
    tag: string; label: string; bg: string; color: string;
    lastUpdate: string; checkpoints: { time: string; location: string; tag: string; message: string }[];
    signedBy: string | null;
  } | null>(null);
  const [trackLoading, setTrackLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ tracking_number: number });
    if (method) params.set("shipping_method", method);
    fetch(`/api/tracking?${params}`)
      .then(r => r.json())
      .then(data => { if (data.tracking) setTrackData(data.tracking); })
      .catch(() => {})
      .finally(() => setTrackLoading(false));
  }, [number, method]);

  return (
    <>
      <div className="border-t border-gray-100" />
      <div className="p-4 sm:p-5">
        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Suivi de livraison</h2>

        {/* Live status badge */}
        {trackLoading && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3.5 h-3.5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-[11px] text-gray-400">Verification du statut...</span>
          </div>
        )}
        {trackData && !trackLoading && (
          <div className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg mb-3 ${trackData.bg} ${trackData.color}`}>
            <span className={`w-2 h-2 rounded-full ${trackData.tag === "Delivered" ? "bg-emerald-500" : trackData.tag === "InTransit" || trackData.tag === "OutForDelivery" ? "bg-blue-500 animate-pulse" : "bg-gray-400"}`} />
            {trackData.label}
          </div>
        )}
        {!trackData && !trackLoading && (
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg mb-3 bg-blue-50 text-blue-700">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Expédié
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="font-mono text-sm font-bold text-gray-900">{number}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {method || "Transporteur"}
            </p>
            {trackData?.lastUpdate && (
              <p className="text-[9px] text-gray-400 mt-0.5">
                Dernière maj : {new Date(trackData.lastUpdate).toLocaleString("fr-FR")}
              </p>
            )}
          </div>
          <a href={trackingUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-colors min-h-[44px] flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Suivre
          </a>
        </div>

        {/* Customer-facing tracking timeline (last 3 events) */}
        {trackData && trackData.checkpoints.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            {trackData.checkpoints.slice(0, 3).map((cp, idx) => (
              <div key={idx} className="flex gap-3 pb-2.5 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${idx === 0 ? "bg-blue-500" : "bg-gray-300"}`} />
                  {idx < Math.min(trackData.checkpoints.length, 3) - 1 && <div className={`w-0.5 flex-1 min-h-[16px] ${idx === 0 ? "bg-blue-200" : "bg-gray-200"}`} />}
                </div>
                <div className="flex-1 min-w-0 -mt-0.5">
                  <p className={`text-[11px] font-medium ${idx === 0 ? "text-gray-900" : "text-gray-500"}`}>{cp.message || cp.tag}</p>
                  {cp.location && <p className="text-[10px] text-gray-400">{cp.location}</p>}
                  <p className="text-[9px] text-gray-400">
                    {cp.time ? new Date(cp.time).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    fetch(`/api/orders?session_id=${sessionId}`)
      .then((r) => r.json())
      .then((data) => setOrder(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f9fb]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Chargement de votre commande...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8f9fb]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-emerald-600 text-lg font-bold mb-2">Paiement recu !</p>
          <p className="text-gray-500 text-sm mb-6">Merci pour votre commande.</p>
          <a href="/" className="inline-block px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors min-w-[200px] text-center">
            Retour a la boutique
          </a>
        </div>
      </div>
    );
  }

  const firstName = order.customerName?.split(" ")[0] || null;

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex flex-col">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
              <span className="text-white text-[11px] font-bold tracking-tight">eI</span>
            </div>
            <h1 className="text-sm font-bold text-gray-900">e.IcosSys</h1>
          </div>
          <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium">
            Boutique
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">
          {/* Confirmation header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {firstName ? `Merci, ${firstName} !` : "Commande confirmée"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Votre commande a été enregistrée avec succès.
            </p>
          </div>

          {/* Order details card */}
          <div className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden mb-6">
            {/* Summary */}
            <div className="p-4 sm:p-5 space-y-4">
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Résumé de la commande</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Commande</span>
                  <span className="font-mono text-gray-900 text-xs">{order.id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Date</span>
                  <span className="text-gray-900 text-xs">{fmtDate(order.created)}</span>
                </div>
              </div>
            </div>

            {/* Product + Price breakdown */}
            <div className="border-t border-gray-100 p-4 sm:p-5 space-y-3">
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Détails</h2>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{order.productName || "Produit"}</p>
                  <p className="text-xs text-gray-400">
                    {order.quantity ? `x${order.quantity}` : "x1"}
                    {order.unitPrice ? ` — ${fmtCurrency(order.unitPrice, order.currency)}/unité` : ""}
                  </p>
                </div>
              </div>

              {/* Price breakdown */}
              {order.amountSubtotal !== null && order.amountShipping !== null && order.amountShipping > 0 ? (
                <div className="space-y-2 pt-2 border-t border-gray-50">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Sous-total</span>
                    <span className="text-gray-600">{fmtCurrency(order.amountSubtotal, order.currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">
                      {order.shippingMethod || "Livraison"}
                    </span>
                    <span className="text-gray-600">{fmtCurrency(order.amountShipping, order.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                    <span className="font-bold text-gray-700">Total</span>
                    <span className="font-bold text-gray-900">{fmtCurrency(order.amount, order.currency)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between text-sm pt-2 border-t border-gray-50">
                  <span className="font-bold text-gray-700">Total</span>
                  <span className="font-bold text-gray-900">{fmtCurrency(order.amount, order.currency)}</span>
                </div>
              )}

              {/* Status */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-gray-400 text-xs">Statut</span>
                <span className={`inline-flex text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                  order.paymentStatus === "paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {order.paymentStatus === "paid" ? "Payé" : "En attente"}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Customer info */}
            <div className="p-4 sm:p-5 space-y-3">
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Informations client</h2>
              <div className="space-y-2 text-sm">
                {order.customerName && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Nom</span>
                    <span className="text-gray-900 text-xs font-medium">{order.customerName}</span>
                  </div>
                )}
                {order.customerEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Email</span>
                    <span className="text-gray-900 text-xs font-medium">{order.customerEmail}</span>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Téléphone</span>
                    <span className="text-gray-900 text-xs font-medium">{order.customerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping address */}
            <div className="border-t border-gray-100" />
            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Adresse de livraison</h2>
                {order.shippingMethod && (
                  <span className="text-[10px] font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md">
                    {order.shippingMethod}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {formatAddress(order.shippingAddress)}
              </p>
            </div>

            {/* Tracking number */}
            {order.trackingNumber && <TrackingBlock method={order.shippingMethod} number={order.trackingNumber} />}

            {/* Billing address */}
            <div className="border-t border-gray-100" />
            <div className="p-4 sm:p-5 space-y-3">
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Adresse de facturation</h2>
              <p className="text-xs text-gray-600 leading-relaxed">
                {formatAddress(order.billingAddress)}
              </p>
            </div>
          </div>

          {/* Back button */}
          <a
            href="/"
            className="block w-full text-center px-6 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors min-h-[48px] leading-[48px]"
          >
            Retour à la boutique
          </a>
        </div>
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}