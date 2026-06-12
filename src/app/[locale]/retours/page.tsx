"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function LegalContent({ locale }: { locale: string }) {
  const fr = (
    <>
      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">1. Droit de rétractation</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Conformément aux articles L.221-18 et suivants du Code de la consommation, vous disposez d&apos;un délai de 14 jours calendaires à compter de la réception de votre commande pour nous informer de votre décision de rétractation. Vous n&apos;avez pas à justifier votre décision ni à payer de frais. Le délai est réputé respecté si vous expédiez la notification de rétractation avant l&apos;expiration du délai de 14 jours. La rétractation peut être exercée en envoyant un email à contact@eicosys.com indiquant clairement votre volonté de vous rétracter, ainsi que le numéro de commande et les produits concernés.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">2. Conditions de retour des produits</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Pour que le retour soit accepté, les produits doivent être retournés dans leur état d&apos;origine, complets, non utilisés, non lavés, non altérés, accompagnés de tous les accessoires, étiquettes et emballages d&apos;origine. Les produits personnalisés, confectionnés selon les spécifications du client ou clairement personnalisés, ne peuvent pas faire l&apos;objet d&apos;un retour, sauf en cas de défaut de conformité ou de vice caché. Les produits périssables ou susceptibles de se détériorer rapidement ne sont pas éligibles au retour.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">3. Procédure de retour</h2>
      <div className="text-sm text-gray-600 leading-relaxed mb-4 space-y-3">
        <div className="flex gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
          <div>
            <p className="font-medium text-gray-900">Demande de retour</p>
            <p>Contactez notre service client par email à contact@eicosys.com en indiquant votre numéro de commande et le motif du retour. Vous recevrez une confirmation et les instructions de retour sous 48 heures ouvrées.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">2</span>
          <div>
            <p className="font-medium text-gray-900">Préparation du colis</p>
            <p>Emballez soigneusement le ou les produit(s) dans leur emballage d&apos;origine ou dans un emballage adapté assurant une protection suffisante contre les chocs lors du transport. Incluez une copie de la facture ou du bon de commande ainsi que le bordereau de retour si fourni.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">3</span>
          <div>
            <p className="font-medium text-gray-900">Expédition du colis</p>
            <p>Expédiez le colis à l&apos;adresse indiquée dans les instructions de retour. Les frais de retour sont à votre charge, sauf si le produit est non conforme ou défectueux. Nous vous recommandons d&apos;utiliser un mode d&apos;envoi avec suivi et assurance. e.IcosSys ne peut être tenu responsable de la perte ou de l&apos;endommagement du colis pendant le transport de retour.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">4</span>
          <div>
            <p className="font-medium text-gray-900">Traitement du retour</p>
            <p>Dès réception du colis, nous procéderons à la vérification de l&apos;état du ou des produit(s). Le remboursement sera effectué dans un délai maximum de 14 jours à compter de la réception du retour, par le même moyen de paiement que celui utilisé lors de la commande. Les frais de livraison initiaux ne seront pas remboursés si le retour ne résulte pas d&apos;une non-conformité du produit.</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">4. Remboursement</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Le remboursement sera effectué sur le compte à partir duquel le paiement a été effectué. Le remboursement interviendra dans un délai de 14 jours à compter de la réception du ou des produit(s) retourné(s), sous réserve que le ou les produit(s) soient en parfait état et conformes aux conditions énoncées à l&apos;article 2. En cas de retour partiel, le remboursement portera uniquement sur les produits effectivement retournés et acceptés. Aucun frais de dossier ne sera facturé au client pour le traitement du retour.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">5. Échanges</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Les échanges sont possibles sous réserve de la disponibilité du produit souhaité en remplacement. Pour demander un échange, veuillez contacter notre service client dans les mêmes conditions que pour un retour. Le produit de remplacement sera expédié dès la réception et la vérification du produit retourné. En cas de différence de prix entre le produit retourné et le produit de remplacement, le solde sera soit facturé, soit remboursé selon le cas. Les frais de livraison du produit de remplacement restent à la charge du client.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">6. Produits non retournables</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Les catégories de produits suivantes ne sont pas éligibles au droit de rétractation et ne peuvent donc pas être retournées, sauf en cas de défaut de conformité ou de vice caché : les produits personnalisés ou fabriqués sur mesure selon les spécifications du client ; les produits scellés qui ne peuvent être renvoyés pour des raisons de protection de la santé ou d&apos;hygiène et qui ont été descellés par le client après la livraison ; les produits qui, par leur nature, sont inseparables et mélangés après la livraison ; les biens périssables ou dont la date de péremption est dépassée.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">7. Réclamations et litiges</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        En cas de réclamation relative à un produit défectueux, non conforme ou abîmé lors de la livraison, vous devez nous contacter dans les meilleurs délais, et au plus tard dans les 7 jours suivant la réception, en fournissant des photos du produit et de l&apos;emballage. Toute réclamation devra être accompagnée du numéro de commande et d&apos;une description précise du problème constaté. e.IcosSys s&apos;engage à traiter toute réclamation dans les plus brefs délais et à proposer une solution satisfaisante (remplacement, échange, remboursement ou réparation selon la nature du problème).
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">8. Informations de contact</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Pour toute question relative à notre politique de retour, n&apos;hésitez pas à contacter notre service client. Nous restons à votre disposition pour vous accompagner dans vos démarches de retour et répondre à toutes vos questions. Notre service client est accessible du lundi au vendredi, de 9h00 à 18h00 (heure de Paris).
      </p>
    </>
  );

  const en = (
    <>
      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">1. Right of withdrawal</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        In accordance with Articles L.221-18 et seq. of the French Consumer Code, you have a period of 14 calendar days from the receipt of your order to inform us of your decision to withdraw. You do not need to justify your decision or pay any fees. The period shall be deemed to have been complied with if you send the notification of withdrawal before the expiry of the 14-day period. Withdrawal may be exercised by sending an email to contact@eicosys.com clearly stating your intention to withdraw, along with the order number and the products concerned.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">2. Product return conditions</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        For a return to be accepted, the products must be returned in their original condition, complete, unused, unwashed, unaltered, accompanied by all accessories, labels and original packaging. Personalised products, made to the customer&apos;s specifications or clearly customised, cannot be returned, except in the event of a defect in conformity or a hidden defect. Perishable products or products liable to deteriorate rapidly are not eligible for return.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">3. Return procedure</h2>
      <div className="text-sm text-gray-600 leading-relaxed mb-4 space-y-3">
        <div className="flex gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
          <div>
            <p className="font-medium text-gray-900">Return request</p>
            <p>Contact our customer service by email at contact@eicosys.com, stating your order number and the reason for the return. You will receive a confirmation and return instructions within 48 business hours.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">2</span>
          <div>
            <p className="font-medium text-gray-900">Preparing the parcel</p>
            <p>Carefully pack the product(s) in their original packaging or in suitable packaging providing sufficient protection against shocks during transit. Include a copy of the invoice or order confirmation as well as the return slip if provided.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">3</span>
          <div>
            <p className="font-medium text-gray-900">Shipping the parcel</p>
            <p>Dispatch the parcel to the address indicated in the return instructions. Return shipping costs are borne by you, unless the product is non-conforming or defective. We recommend using a tracked and insured shipping method. e.IcosSys shall not be held liable for the loss or damage of the parcel during the return transit.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center mt-0.5">4</span>
          <div>
            <p className="font-medium text-gray-900">Processing the return</p>
            <p>Upon receipt of the parcel, we shall verify the condition of the product(s). The refund will be processed within a maximum of 14 days from receipt of the return, using the same payment method as that used when placing the order. Initial shipping costs will not be refunded if the return does not result from a product non-conformity.</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">4. Refund</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The refund shall be made to the account from which the payment was made. The refund shall be processed within a period of 14 days from the receipt of the returned product(s), provided that the product(s) are in perfect condition and comply with the conditions set out in Section 2. In the event of a partial return, the refund shall apply only to the products actually returned and accepted. No administrative fee shall be charged to the customer for processing the return.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">5. Exchanges</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Exchanges are possible subject to the availability of the desired replacement product. To request an exchange, please contact our customer service under the same conditions as for a return. The replacement product will be dispatched upon receipt and verification of the returned product. In the event of a price difference between the returned product and the replacement product, the balance shall be either charged or refunded as the case may be. Shipping costs for the replacement product remain the responsibility of the customer.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">6. Non-returnable products</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The following categories of products are not eligible for the right of withdrawal and therefore cannot be returned, except in the event of a defect in conformity or a hidden defect: personalised or custom-made products manufactured to the customer&apos;s specifications; sealed products that cannot be returned for reasons of health or hygiene protection and that have been unsealed by the customer after delivery; products that, by their nature, are inseparably mixed after delivery; perishable goods or goods whose expiry date has passed.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">7. Complaints and disputes</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        In the event of a complaint relating to a defective, non-conforming or damaged product upon delivery, you must contact us as soon as possible, and no later than 7 days following receipt, providing photographs of the product and the packaging. Any complaint must be accompanied by the order number and a precise description of the problem observed. e.IcosSys undertakes to process any complaint as promptly as possible and to propose a satisfactory solution (replacement, exchange, refund or repair depending on the nature of the problem).
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">8. Contact information</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        For any questions relating to our return policy, please do not hesitate to contact our customer service. We remain at your disposal to assist you with your return process and to answer all your questions. Our customer service is available from Monday to Friday, 9:00 AM to 6:00 PM (Paris time).
      </p>
    </>
  );

  return locale === "fr" ? fr : en;
}

export default function RetoursPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="text-white text-[11px] font-bold tracking-tight">eI</span>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">e.IcosSys</span>
          </Link>

          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-xl hover:bg-gray-50 text-sm font-medium"
            >
              {locale === "fr" ? "Boutique" : "Shop"}
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {t("common.backToShop")}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{t("legal.retours.title")}</h1>
          <p className="text-sm text-gray-400 mt-2">{t("legal.retours.updatedDate")}</p>
        </div>

        {/* Highlight box */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 mb-8">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-amber-900">{t("legal.retours.highlightTitle")}</h2>
              <p className="text-sm text-amber-800 mt-1 leading-relaxed">{t("legal.retours.highlightText")}</p>
            </div>
          </div>
        </div>

        <div className="prose prose-sm max-w-none">
          <LegalContent locale={locale} />
        </div>

        {/* Contact info box */}
        <div className="mt-10 p-5 bg-gray-50 rounded-xl border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t("legal.retours.contactEmail")}</h3>
          <a href={`mailto:${t("legal.retours.contactEmailValue")}`} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            {t("legal.retours.contactEmailValue")}
          </a>
          <div className="mt-3">
            <span className="text-sm text-gray-400">{t("legal.retours.responseTime")} : </span>
            <span className="text-sm font-medium text-gray-700">{t("legal.retours.responseTimeValue")}</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}