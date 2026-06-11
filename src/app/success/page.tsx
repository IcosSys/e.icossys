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
  currency: string;
  status: string;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  paymentStatus: string;
  created: number;
  productName: string | null;
  shippingAddress: Address | null;
  billingAddress: Address | null;
}

function formatAddress(addr: Address | null): string {
  if (!addr) return "Non renseignée";
  const parts = [addr.line1, addr.line2, addr.postalCode, addr.city, addr.country].filter(Boolean) as string[];
  return parts.join(", ") || "Non renseignée";
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
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-3 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Chargement de votre commande...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-600 text-lg font-semibold mb-2">Paiement reçu !</p>
          <p className="text-gray-500 text-sm mb-6">Merci pour votre commande.</p>
          <a href="/" className="inline-block px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors min-w-[200px] text-center">
            Retour à la boutique
          </a>
        </div>
      </div>
    );
  }

  const firstName = order.customerName?.split(" ")[0] || null;
  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: order.currency.toUpperCase(),
  }).format(order.amount / 100);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">
          {/* Confirmation header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
            {/* Summary */}
            <div className="p-4 sm:p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Résumé de la commande</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Commande</span>
                  <span className="font-mono text-gray-900">{order.id.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Produit</span>
                  <span className="text-gray-900 font-medium">{order.productName || "Produit"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Montant</span>
                  <span className="font-semibold text-gray-900">{formattedAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Statut</span>
                  <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {order.paymentStatus === "paid" ? "Payé" : "En attente"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Customer info */}
            <div className="p-4 sm:p-6 space-y-3">
              <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Informations client</h2>
              <div className="space-y-2 text-sm">
                {order.customerName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nom</span>
                    <span className="text-gray-900">{order.customerName}</span>
                  </div>
                )}
                {order.customerEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="text-gray-900">{order.customerEmail}</span>
                  </div>
                )}
                {order.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Téléphone</span>
                    <span className="text-gray-900">{order.customerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping address */}
            <div className="border-t border-gray-100" />
            <div className="p-4 sm:p-6 space-y-3">
              <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Adresse de livraison</h2>
              <p className="text-sm text-gray-700">
                {formatAddress(order.shippingAddress)}
              </p>
            </div>

            {/* Billing address */}
            {order.billingAddress && (
              <>
                <div className="border-t border-gray-100" />
                <div className="p-4 sm:p-6 space-y-3">
                  <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Adresse de facturation</h2>
                  <p className="text-sm text-gray-700">
                    {formatAddress(order.billingAddress)}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Back button */}
          <a
            href="/"
            className="block w-full text-center px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors min-h-[44px] leading-[44px]"
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
