"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface OrderDetails {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerEmail?: string;
  paymentStatus: string;
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

  if (loading) return <p className="text-center text-gray-500 mt-20">Chargement...</p>;

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-green-600 text-lg font-semibold mb-2">Paiement reçu !</p>
          <p className="text-gray-500 text-sm">Merci pour votre commande.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Commande confirmée</h1>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Commande</span>
            <span className="font-mono text-gray-900">{order.id.slice(-8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Montant</span>
            <span className="font-semibold text-gray-900">{(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Statut paiement</span>
            <span className="text-green-700 font-medium">{order.paymentStatus}</span>
          </div>
          {order.customerEmail && (
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-900">{order.customerEmail}</span>
            </div>
          )}
        </div>

        <a href="/" className="block text-center mt-6 text-indigo-600 text-sm hover:underline">
          Retour à la boutique
        </a>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return <Suspense><SuccessContent /></Suspense>;
}