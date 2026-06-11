import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="text-center w-full max-w-sm">
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Paiement annulé</h1>
          <p className="text-gray-500 text-sm mb-6">Votre commande n&apos;a pas été traitée.</p>
          <Link
            href="/"
            className="block w-full text-center px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors min-h-[44px] leading-[44px]"
          >
            Retour à la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
