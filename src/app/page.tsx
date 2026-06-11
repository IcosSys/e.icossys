"use client";

export default function Home() {
  const handleBuy = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productName: "Produit Test",
        price: 1000, // 10.00 EUR en centimes
        quantity: 1,
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert(data.error || "Erreur");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Image placeholder */}
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
          Image du produit
        </div>

        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Produit Test</h1>
          <p className="text-gray-500 text-sm mb-4">
            Description du produit de test pour vérifier le flux de paiement.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">10,00 &euro;</span>
            <button
              onClick={handleBuy}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Acheter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}