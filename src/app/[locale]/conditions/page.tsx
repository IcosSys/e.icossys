"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function LegalContent({ locale }: { locale: string }) {
  const fr = (
    <>
      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 1 — Objet</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Les présentes Conditions Générales de Vente (CGV) régissent les ventes de produits effectuées par le biais du site internet e.IcosSys, exploité par e.IcosSys, société immatriculée au Registre du Commerce et des Sociétés. Elles s&apos;appliquent à toute commande passée par un consommateur ou un professionnel sur le site. e.IcosSys se réserve le droit de modifier les présentes CGV à tout moment. Les conditions applicables sont celles en vigueur à la date de la commande.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 2 — Prix</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Les prix des produits sont indiqués en euros toutes taxes comprises (TTC). e.IcosSys se réserve le droit de modifier ses prix à tout moment. Les produits sont facturés sur la base des tarifs en vigueur au moment de la validation de la commande. Les frais de livraison sont indiqués avant la validation définitive de la commande et sont à la charge de l&apos;acheteur, sauf mention contraire.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 3 — Commande</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Le client passe commande sur le site internet. Toute commande constitue un contrat conclu à distance entre le client et e.IcosSys. La validation de la commande implique l&apos;acceptation intégrale des présentes CGV. e.IcosSys se réserve le droit d&apos;annuler ou de refuser toute commande en cas de litige antérieur, d&apos;information inexacte ou de suspicion de fraude. Une confirmation de commande est envoyée par email à l&apos;adresse indiquée par le client.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 4 — Paiement</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Le paiement s&apos;effectue par carte bancaire via la plateforme de paiement sécurisée Stripe. Les données bancaires sont transmises de manière chiffrée et ne sont jamais stockées sur les serveurs de e.IcosSys. La commande est confirmée après autorisation de paiement par l&apos;établissement bancaire. e.IcosSys se réserve le droit de suspendre toute livraison en cas de problème de paiement.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 5 — Livraison</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Les produits sont livrés à l&apos;adresse indiquée par le client lors de la commande. Les délais de livraison sont donnés à titre indicatif et peuvent varier en fonction de la destination et du transporteur retenu. e.IcosSys s&apos;engage à expédier les commandes dans un délai raisonnable à compter de la réception du paiement. En cas de retard de livraison, le client peut contacter le service client. Le transfert des risques s&apos;opère au moment de la remise du colis au transporteur.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 6 — Droit de rétractation</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Conformément aux articles L.221-18 et suivants du Code de la consommation, le client dispose d&apos;un délai de 14 jours calendaires à compter de la réception des produits pour exercer son droit de rétractation, sans avoir à justifier de motif ni à payer de pénalité. Le client doit informer e.IcosSys de sa décision de rétractation par une déclaration dénuée d&apos;ambiguïté (par email ou par le formulaire de contact). Les produits doivent être retournés dans leur état d&apos;origine, complets, accompagnés de tous les accessoires et emballages d&apos;origine, dans un délai de 14 jours à compter de la notification de rétractation. Les frais de retour sont à la charge du client sauf si le produit livré n&apos;est pas conforme.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 7 — Garanties</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Tous les produits bénéficient de la garantie légale de conformité (articles L.217-4 à L.217-14 du Code de la consommation) et de la garantie légale des vices cachés (articles 1641 à 1649 du Code civil). Le client peut obtenir la réparation ou le remplacement du produit non conforme dans un délai de 2 ans à compter de la délivrance du bien. La garantie ne s&apos;applique pas aux dommages résultant d&apos;une utilisation non conforme, d&apos;une négligence, d&apos;un accident ou d&apos;une usure normale.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 8 — Responsabilité</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        e.IcosSys ne saurait être tenu responsable de l&apos;inexécution du contrat en cas de force majeure, de perturbation ou de grève totale ou partielle des services postaux et moyens de transport, de panne des réseaux de communication. e.IcosSys ne peut être tenu responsable des dommages directs ou indirects résultant de l&apos;utilisation du site internet. e.IcosSys met en œuvre tous les moyens raisonnables pour assurer l&apos;exactitude et la mise à jour des informations diffusées sur le site, mais ne saurait être tenu responsable des erreurs, omissions ou des résultats qui pourraient être obtenus par l&apos;utilisation de ces informations.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 9 — Données personnelles</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Le traitement des données personnelles est effectué conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée. Les données collectées lors de la commande (nom, prénom, adresse, email, numéro de téléphone, données de paiement) sont nécessaires au traitement de la commande et à la gestion de la relation client. Le client dispose d&apos;un droit d&apos;accès, de rectification, de suppression et de portabilité de ses données personnelles, qu&apos;il peut exercer en contactant le service client. Les données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 10 — Propriété intellectuelle</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        L&apos;ensemble des éléments composant le site internet (textes, images, graphismes, logos, icônes, sons, logiciels, etc.) sont la propriété exclusive de e.IcosSys ou de ses partenaires et sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle. Toute reproduction, représentation, modification, publication, adaptation, totale ou partielle, des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l&apos;autorisation écrite préalable de e.IcosSys.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 11 — Litiges</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        En cas de litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes CGV, le client peut recourir à une médiation conventionnelle ou à tout mode alternatif de règlement des différends. Conformément au décret n° 2015-1362 du 28 octobre 2015, le client peut, à titre gratuit, saisir le médiateur de la consommation en vue de la résolution amiable du litige. À défaut de résolution amiable, les tribunaux français compétents seront seuls compétents pour connaître du litige, sous réserve des dispositions impératives applicables en matière de compétence juridictionnelle.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 12 — Droit applicable</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Les présentes CGV sont soumises au droit français. Dans le cas où l&apos;une des clauses des présentes CGV serait tenue pour nulle ou inapplicable par une décision de justice, les autres clauses conserveront leur force et leur portée. Le fait que e.IcosSys ne se prévale pas d&apos;un manquement du client à l&apos;une de ses obligations ne saurait être interprété comme une renonciation à l&apos;obligation en cause.
      </p>
    </>
  );

  const en = (
    <>
      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 1 — Purpose</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        These General Terms and Conditions of Sale (GTCS) govern the sale of products carried out through the e.IcosSys website, operated by e.IcosSys, a company registered with the Trade and Companies Register. They apply to any order placed by a consumer or a professional on the website. e.IcosSys reserves the right to amend these GTCS at any time. The applicable conditions are those in effect on the date of the order.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 2 — Prices</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Product prices are indicated in euros, inclusive of all taxes (VAT included). e.IcosSys reserves the right to modify its prices at any time. Products are invoiced on the basis of the rates in effect at the time the order is confirmed. Shipping costs are indicated before the final validation of the order and are borne by the buyer, unless otherwise specified.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 3 — Orders</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The customer places an order on the website. Any order constitutes a distance contract concluded between the customer and e.IcosSys. Validation of the order implies full acceptance of these GTCS. e.IcosSys reserves the right to cancel or refuse any order in the event of a prior dispute, inaccurate information, or suspected fraud. An order confirmation is sent by email to the address provided by the customer.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 4 — Payment</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Payment is made by credit or debit card via the secure Stripe payment platform. Bank details are transmitted in encrypted form and are never stored on e.IcosSys&apos;s servers. The order is confirmed after payment authorisation is granted by the banking institution. e.IcosSys reserves the right to suspend any delivery in the event of a payment issue.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 5 — Delivery</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Products are delivered to the address provided by the customer when placing the order. Delivery times are given as an indication and may vary depending on the destination and the carrier selected. e.IcosSys undertakes to dispatch orders within a reasonable period from receipt of payment. In the event of a delivery delay, the customer may contact customer service. The transfer of risks occurs at the time the parcel is handed over to the carrier.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 6 — Right of withdrawal</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        In accordance with Articles L.221-18 et seq. of the French Consumer Code, the customer has a period of 14 calendar days from the receipt of the products to exercise the right of withdrawal, without having to provide a reason or pay any penalty. The customer must inform e.IcosSys of the decision to withdraw by means of an unambiguous statement (by email or via the contact form). Products must be returned in their original condition, complete, with all accessories and original packaging, within 14 days from the notification of withdrawal. Return shipping costs are borne by the customer unless the product delivered is not in conformity with the order.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 7 — Warranties</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        All products benefit from the statutory guarantee of conformity (Articles L.217-4 to L.217-14 of the French Consumer Code) and the statutory guarantee against hidden defects (Articles 1641 to 1649 of the French Civil Code). The customer may obtain the repair or replacement of a non-conforming product within a period of 2 years from the delivery of the good. The warranty does not cover damage resulting from non-conforming use, negligence, accident, or normal wear and tear.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 8 — Liability</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        e.IcosSys shall not be held liable for the non-performance of the contract in the event of force majeure, disruption or total or partial strike of postal services and means of transport, or failure of communication networks. e.IcosSys cannot be held liable for direct or indirect damage resulting from the use of the website. e.IcosSys implements all reasonable measures to ensure the accuracy and updating of information published on the website, but shall not be held liable for errors, omissions, or results that may be obtained through the use of such information.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 9 — Personal data</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The processing of personal data is carried out in accordance with the General Data Protection Regulation (GDPR) and the French Data Protection Act of 6 January 1978 as amended. Data collected during the ordering process (surname, first name, address, email, telephone number, payment data) are necessary for the processing of the order and the management of the customer relationship. The customer has a right of access, rectification, erasure and portability of their personal data, which may be exercised by contacting customer service. Data are retained for the duration necessary for the purposes for which they were collected.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 10 — Intellectual property</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        All elements comprising the website (texts, images, graphics, logos, icons, sounds, software, etc.) are the exclusive property of e.IcosSys or its partners and are protected by French and international laws relating to intellectual property. Any reproduction, representation, modification, publication, adaptation, whether in whole or in part, of the elements of the website, by any means or process whatsoever, is prohibited without the prior written authorisation of e.IcosSys.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 11 — Disputes</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        In the event of a dispute relating to the interpretation or performance of these GTCS, the customer may have recourse to conventional mediation or any alternative method of dispute resolution. In accordance with Decree No. 2015-1362 of 28 October 2015, the customer may, free of charge, refer the matter to a consumer mediator with a view to an amicable resolution of the dispute. Failing amicable resolution, the competent French courts shall have sole jurisdiction to hear the dispute, subject to any mandatory provisions applicable regarding jurisdiction.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Article 12 — Applicable law</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        These GTCS are governed by French law. In the event that one of the provisions of these GTCS is held to be null and void or unenforceable by a court decision, the other provisions shall retain their full force and effect. The fact that e.IcosSys does not invoke a breach by the customer of one of the customer&apos;s obligations shall not be interpreted as a waiver of the obligation in question.
      </p>
    </>
  );

  return locale === "fr" ? fr : en;
}

export default function ConditionsPage() {
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{t("legal.conditions.title")}</h1>
          <p className="text-sm text-gray-400 mt-2">{t("legal.conditions.subtitle")}</p>
        </div>

        <div className="prose prose-sm max-w-none">
          <LegalContent locale={locale} />
        </div>
      </main>

      <Footer />
    </div>
  );
}