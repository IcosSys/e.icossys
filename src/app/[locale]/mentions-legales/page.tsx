"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Footer from "@/components/Footer";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function LegalContent({ locale }: { locale: string }) {
  const fr = (
    <>
      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">1. Éditeur du site</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-2">
        Le site e.IcosSys est édité par :
      </p>
      <ul className="text-sm text-gray-600 leading-relaxed mb-4 list-none space-y-1 pl-0">
        <li><span className="font-medium">Raison sociale :</span> e.IcosSys</li>
        <li><span className="font-medium">Forme juridique :</span> Société par actions simplifiée (SAS)</li>
        <li><span className="font-medium">Capital social :</span> 10 000 €</li>
        <li><span className="font-medium">Siège social :</span> 12 Rue de la Paix, 75002 Paris, France</li>
        <li><span className="font-medium">SIRET :</span> 123 456 789 00012</li>
        <li><span className="font-medium">RCS :</span> Paris B 123 456 789</li>
        <li><span className="font-medium">Numéro TVA intracommunautaire :</span> FR 12 345678901</li>
        <li><span className="font-medium">Email :</span> contact@eicosys.com</li>
        <li><span className="font-medium">Directeur de la publication :</span> M. Jean Dupont</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">2. Hébergeur</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-2">
        Le site est hébergé par :
      </p>
      <ul className="text-sm text-gray-600 leading-relaxed mb-4 list-none space-y-1 pl-0">
        <li><span className="font-medium">Société :</span> Vercel Inc.</li>
        <li><span className="font-medium">Adresse :</span> 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</li>
        <li><span className="font-medium">Site internet :</span> vercel.com</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">3. Propriété intellectuelle</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        L&apos;ensemble des contenus du site e.IcosSys (textes, images, vidéos, logos, icônes, sons, logiciels, éléments graphiques, mises en page, etc.) est protégé par le droit d&apos;auteur et le droit des marques en vertu des lois françaises et internationales. Toute reproduction, représentation, modification, publication, adaptation, totale ou partielle, des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l&apos;autorisation écrite préalable de e.IcosSys. Toute exploitation non autorisée du site ou de l&apos;un quelconque des éléments qu&apos;il contient sera considérée comme constitutive d&apos;une contrefaçon et poursuivie conformément aux dispositions des articles L.335-2 et suivants du Code de la propriété intellectuelle.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">4. Données personnelles et RGPD</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Le site e.IcosSys collecte des données personnelles dans le cadre de la passation de commandes et de la gestion de la relation client. Les données collectées comprennent : nom, prénom, adresse postale, adresse électronique, numéro de téléphone, données de paiement traitées par le prestataire Stripe. Le responsable du traitement des données est e.IcosSys, dont le siège social est situé au 12 Rue de la Paix, 75002 Paris. Les données sont collectées pour les finalités suivantes : traitement des commandes, gestion de la relation client, envoi d&apos;informations commerciales (avec consentement préalable), respect des obligations légales. La base légale du traitement est l&apos;exécution du contrat (article 6.1.b du RGPD) et, le cas échéant, le consentement (article 6.1.a du RGPD).
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression, de limitation, de portabilité et d&apos;opposition concernant vos données personnelles. Vous pouvez exercer ces droits en adressant votre demande à contact@eicosys.com ou par courrier à l&apos;adresse du siège social. Vous avez également le droit d&apos;introduire une réclamation auprès de la Commission Nationale de l&apos;Informatique et des Libertés (CNIL), 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">5. Cookies</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Le site e.IcosSys utilise des cookies pour améliorer l&apos;expérience de navigation. Les cookies nécessaires au fonctionnement du site (cookies de session, cookies de sécurité) sont exemptés de consentement conformément à l&apos;avis de la CNIL. Les cookies de mesure d&apos;audience et de personnalisation sont soumis au consentement préalable de l&apos;utilisateur conformément à la directive ePrivacy et à la recommandation CNIL. L&apos;utilisateur peut à tout moment modifier ses préférences en matière de cookies via les paramètres de son navigateur. Le refus des cookies peut toutefois limiter l&apos;accès à certaines fonctionnalités du site.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">6. Conditions générales de vente</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Les ventes réalisées sur le site sont régies par les Conditions Générales de Vente (CGV) accessibles à la page Conditions. Le client est invité à les consulter avant toute commande. La passation d&apos;une commande implique l&apos;acceptation sans réserve des CGV en vigueur au moment de la commande. e.IcosSys se réserve le droit de modifier les CGV à tout moment. En cas de litige, les CGV applicables sont celles en vigueur à la date de la commande.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">7. Médiation des litiges</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Conformément aux articles L.612-1 et suivants du Code de la consommation et au décret n° 2015-1362 du 28 octobre 2015, le client peut recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable du litige. Le médiateur compétent est le Médiateur de la consommation ( Médiateur du e-commerce de la FEVAD ). La démarche de médiation n&apos;exclut pas le droit pour le consommateur de saisir les juridictions compétentes. Pour exercer ce droit, le client doit s&apos;adresser au médiateur directement ou par l&apos;intermédiaire de e.IcosSys.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">8. Paiement sécurisé</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Les paiements sur le site sont sécurisés par la plateforme Stripe, qui est conforme à la norme PCI DSS (Payment Card Industry Data Security Standard). Les données bancaires sont chiffrées et transmises directement aux serveurs de Stripe sans transiter par les serveurs de e.IcosSys. e.IcosSys ne conserve aucune donnée bancaire de ses clients. Les cartes bancaires acceptées sont : Visa, Mastercard, Carte Bancaire, American Express. En cas de paiement refusé, le client est invité à vérifier les informations saisies ou à contacter son établissement bancaire.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">9. Limitation de responsabilité</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        e.IcosSys s&apos;efforce d&apos;assurer au mieux l&apos;exactitude et la mise à jour des informations diffusées sur son site. Toutefois, e.IcosSys ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à disposition sur le site. En conséquence, e.IcosSys décline toute responsabilité pour toute imprécision, inexactitude ou omission portant sur des informations disponibles sur le site, ainsi que pour tout dommage résultant d&apos;une intrusion frauduleuse d&apos;un tiers ayant entraîné une modification des informations mises à disposition sur le site. e.IcosSys ne saurait être tenu responsable des interruptions du site, que celles-ci soient dues à une opération de maintenance, une mise à jour, un cas de force majeure ou tout autre événement indépendant de sa volonté.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">10. Droit applicable et juridiction compétente</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Les présentes mentions légales sont régies par le droit français. En cas de litige, et après tentative de médiation, les tribunaux français compétents seront seuls compétents pour connaître du différend, sous réserve des dispositions impératives applicables en matière de compétence juridictionnelle, notamment en matière de droit de la consommation. La langue de référence pour l&apos;interprétation des présentes est le français.
      </p>
    </>
  );

  const en = (
    <>
      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">1. Website publisher</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-2">
        The e.IcosSys website is published by:
      </p>
      <ul className="text-sm text-gray-600 leading-relaxed mb-4 list-none space-y-1 pl-0">
        <li><span className="font-medium">Company name:</span> e.IcosSys</li>
        <li><span className="font-medium">Legal form:</span> Simplified joint-stock company (SAS)</li>
        <li><span className="font-medium">Share capital:</span> €10,000</li>
        <li><span className="font-medium">Registered office:</span> 12 Rue de la Paix, 75002 Paris, France</li>
        <li><span className="font-medium">SIRET number:</span> 123 456 789 00012</li>
        <li><span className="font-medium">RCS number:</span> Paris B 123 456 789</li>
        <li><span className="font-medium">VAT identification number:</span> FR 12 345678901</li>
        <li><span className="font-medium">Email:</span> contact@eicosys.com</li>
        <li><span className="font-medium">Publication director:</span> Mr. Jean Dupont</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">2. Hosting provider</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-2">
        The website is hosted by:
      </p>
      <ul className="text-sm text-gray-600 leading-relaxed mb-4 list-none space-y-1 pl-0">
        <li><span className="font-medium">Company:</span> Vercel Inc.</li>
        <li><span className="font-medium">Address:</span> 440 N Barranca Ave #4133, Covina, CA 91723, United States</li>
        <li><span className="font-medium">Website:</span> vercel.com</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">3. Intellectual property</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        All content on the e.IcosSys website (texts, images, videos, logos, icons, sounds, software, graphic elements, layouts, etc.) is protected by copyright and trademark law under French and international legislation. Any reproduction, representation, modification, publication, adaptation, whether in whole or in part, of the elements of the website, by any means or process whatsoever, is prohibited without the prior written authorisation of e.IcosSys. Any unauthorised exploitation of the website or of any of the elements it contains shall be considered as constituting an infringement and shall be pursued in accordance with the provisions of Articles L.335-2 et seq. of the French Intellectual Property Code.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">4. Personal data and GDPR</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The e.IcosSys website collects personal data in connection with the placement of orders and the management of customer relations. The data collected includes: surname, first name, postal address, email address, telephone number, and payment data processed by the Stripe service provider. The data controller is e.IcosSys, whose registered office is located at 12 Rue de la Paix, 75002 Paris. The data is collected for the following purposes: processing of orders, management of customer relations, sending of commercial information (with prior consent), and compliance with legal obligations. The legal basis for the processing is the performance of the contract (Article 6.1.b of the GDPR) and, where applicable, consent (Article 6.1.a of the GDPR).
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        In accordance with the General Data Protection Regulation (GDPR) and the French Data Protection Act of 6 January 1978 as amended, you have a right of access, rectification, erasure, restriction, portability and objection with regard to your personal data. You may exercise these rights by sending your request to contact@eicosys.com or by post to the registered office address. You also have the right to lodge a complaint with the French Data Protection Authority (CNIL), 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">5. Cookies</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        The e.IcosSys website uses cookies to enhance the browsing experience. Cookies that are necessary for the operation of the website (session cookies, security cookies) are exempt from consent in accordance with the CNIL opinion. Analytics and personalisation cookies are subject to the prior consent of the user in accordance with the ePrivacy Directive and the CNIL recommendation. The user may at any time modify cookie preferences via the browser settings. However, refusing cookies may limit access to certain features of the website.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">6. General terms and conditions of sale</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Sales made on the website are governed by the General Terms and Conditions of Sale (GTCS), accessible on the Terms page. The customer is invited to consult them before placing any order. Placing an order implies unconditional acceptance of the GTCS in force at the time of the order. e.IcosSys reserves the right to amend the GTCS at any time. In the event of a dispute, the applicable GTCS are those in force on the date of the order.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">7. Dispute mediation</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        In accordance with Articles L.612-1 et seq. of the French Consumer Code and Decree No. 2015-1362 of 28 October 2015, the customer may have recourse, free of charge, to a consumer mediator with a view to the amicable resolution of the dispute. The competent mediator is the Consumer Mediator (FEVAD E-commerce Mediator). The mediation process does not exclude the consumer&apos;s right to refer the matter to the competent courts. To exercise this right, the customer must contact the mediator directly or through e.IcosSys.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">8. Secure payment</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        Payments on the website are secured by the Stripe platform, which complies with the PCI DSS (Payment Card Industry Data Security Standard). Bank details are encrypted and transmitted directly to Stripe&apos;s servers without passing through e.IcosSys&apos;s servers. e.IcosSys does not store any bank details of its customers. Accepted credit and debit cards are: Visa, Mastercard, Carte Bancaire, and American Express. In the event of a declined payment, the customer is invited to verify the information entered or to contact their banking institution.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">9. Limitation of liability</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        e.IcosSys endeavours to ensure, to the best of its ability, the accuracy and updating of the information published on its website. However, e.IcosSys cannot guarantee the accuracy, precision or exhaustiveness of the information made available on the website. Accordingly, e.IcosSys disclaims all liability for any inaccuracy, imprecision or omission relating to information available on the website, as well as for any damage resulting from a fraudulent intrusion by a third party having led to a modification of the information made available on the website. e.IcosSys shall not be held liable for interruptions to the website, whether due to maintenance operations, updates, a case of force majeure, or any other event beyond its control.
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">10. Applicable law and competent jurisdiction</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        These legal notices are governed by French law. In the event of a dispute, and following an attempt at mediation, the competent French courts shall have sole jurisdiction to hear the dispute, subject to any mandatory provisions applicable regarding jurisdiction, particularly in the field of consumer law. The reference language for the interpretation of these legal notices is French.
      </p>
    </>
  );

  return locale === "fr" ? fr : en;
}

export default function MentionsLegalesPage() {
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{t("legal.mentionsLegales.title")}</h1>
          <p className="text-sm text-gray-400 mt-2">{t("legal.mentionsLegales.subtitle")}</p>
        </div>

        <div className="prose prose-sm max-w-none">
          <LegalContent locale={locale} />
        </div>
      </main>

      <Footer />
    </div>
  );
}