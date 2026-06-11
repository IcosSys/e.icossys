export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Paiement annulé</h1>
        <p className="text-gray-500 text-sm mb-6">Votre commande n'a pas été traitée.</p>
        <a href="/" className="text-indigo-600 text-sm hover:underline">
          Retour à la boutique
        </a>
      </div>
    </div>
  );
}