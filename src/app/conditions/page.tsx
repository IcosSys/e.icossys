"use client";

import Link from "next/link";

export default function ConditionsPage() {
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

          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium"
          >
            Boutique
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">
          {/* Page Title */}
          <div className="mb-10">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Conditions Générales de Vente
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Les présentes conditions régissent toute commande passée sur la plateforme e.IcosSys.
            </p>
          </div>

          {/* 1. Éditeur du site */}
          <section className="border-b border-gray-100 pb-5 mb-5 sm:pb-6 sm:mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              1 — Éditeur du site
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Le site e.IcosSys est édité par la société e.IcosSys, société à responsabilité limitée (SARL) au capital social de 10 000 €, immatriculée au Registre du Commerce et des Sociétés de Paris sous le numéro RCS Paris B 123 456 789.
              </p>
              <p>
                <span className="font-medium text-gray-700">Siège social :</span> 12 rue de la Paix, 75002 Paris, France
              </p>
              <p>
                <span className="font-medium text-gray-700">Adresse e-mail :</span>{" "}
                <a href="mailto:contact@e-icossys.fr" className="underline hover:text-gray-900 transition-colors">
                  contact@e-icossys.fr
                </a>
              </p>
              <p>
                <span className="font-medium text-gray-700">Numéro de téléphone :</span> +33 (0)1 23 45 67 89
              </p>
              <p>
                <span className="font-medium text-gray-700">N° TVA intracommunautaire :</span> FR 12 345678901
              </p>
              <p>
                <span className="font-medium text-gray-700">Directeur de la publication :</span> Jean Dupont, gérant
              </p>
              <p>
                Le site est hébergé par OVH SAS, 2 rue Kellermann, 59100 Roubaix, France. L&apos;hébergeur est joignable au +33 (0)9 72 10 10 07.
              </p>
            </div>
          </section>

          {/* 2. Objet */}
          <section className="border-b border-gray-100 pb-5 mb-5 sm:pb-6 sm:mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              2 — Objet
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Les présentes Conditions Générales de Vente (ci-après « CGV ») ont pour objet de définir les droits et obligations des parties dans le cadre de la vente en ligne de produits (ci-après les « Produits ») proposés sur le site e.IcosSys accessible à l&apos;adresse URL du site (ci-après le « Site »).
              </p>
              <p>
                Elles régissent l&apos;ensemble des relations contractuelles entre l&apos;éditeur du Site, ci-après dénommé le « Vendeur », et toute personne physique ou morale, consommateur ou professionnel, procédant à un achat de Produits via le Site, ci-après dénommée l&apos;« Acheteur » ou le « Client ».
              </p>
              <p>
                Le Vendeur se réserve le droit de modifier les présentes CGV à tout moment. Les CGV applicables sont celles en vigueur à la date de validation de la commande par l&apos;Acheteur. L&apos;Acheteur est invité à consulter régulièrement les présentes CGV afin de prendre connaissance des éventuelles modifications.
              </p>
              <p>
                Toute commande passée sur le Site implique l&apos;acceptation sans réserve des présentes CGV par l&apos;Acheteur. Le Vendeur conseille à l&apos;Acheteur de lire attentivement les présentes CGV avant toute commande et de les imprimer ou de les sauvegarder sur un support informatique.
              </p>
            </div>
          </section>

          {/* 3. Prix */}
          <section className="border-b border-gray-100 pb-5 mb-5 sm:pb-6 sm:mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              3 — Prix
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Les prix des Produits sont indiqués en euros (€), toutes taxes comprises (TTC). La TVA appliquée est le taux normal en vigueur en France métropolitaine, soit 20 % conformément à l&apos;article 278 du Code général des impôts, sauf mention contraire pour les produits relevant de taux spécifiques (taux réduit ou intermédiaire).
              </p>
              <p>
                Les prix affichés sur le Site comprennent le prix des Produits, les taxes applicables ainsi que la contribution au financement de la collecte sélective des déchets d&apos;équipements électriques et électroniques (DEEE) le cas échéant. En revanche, les frais de livraison sont calculés séparément et ajoutés au montant total de la commande lors du processus de paiement, avant la confirmation définitive de celle-ci.
              </p>
              <p>
                Le Vendeur se réserve le droit de modifier ses prix à tout moment. Les Produits sont facturés sur la base des tarifs en vigueur au moment de la validation de la commande, sous réserve de disponibilité. Le Vendeur s&apos;engage à afficher de manière claire et lisible les prix de chaque Produit sur les fiches produit correspondantes, conformément aux articles L. 112-1 et suivants du Code de la consommation.
              </p>
              <p>
                Le cas échéant, toute promotion ou offre spéciale sera soumise aux conditions particulières qui seront précisées sur le Site. Ces offres promotionnelles sont valables pour la durée et selon les modalités indiquées. Le Vendeur se réserve le droit d&apos;annuler ou de retirer toute offre promotionnelle sans préavis ni indemnité.
              </p>
            </div>
          </section>

          {/* 4. Commande */}
          <section className="border-b border-gray-100 pb-5 mb-5 sm:pb-6 sm:mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              4 — Commande
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                L&apos;Acheteur peut passer commande sur le Site en suivant les étapes décrites ci-après : sélection du ou des Produits, ajout au panier, vérification du contenu du panier, saisie des informations de livraison, saisie des informations de facturation, choix du mode de livraison, puis validation du paiement.
              </p>
              <p>
                Avant toute validation définitive, l&apos;Acheteur a la possibilité de vérifier le détail de sa commande, le montant total TTC, et de corriger d&apos;éventuelles erreurs. L&apos;Acheteur est informé, par un clic obligatoire, de l&apos;obligation de payer pour valider sa commande, conformément à l&apos;article L. 221-18 du Code de la consommation.
              </p>
              <p>
                La commande est définitivement formée dès lors que le paiement est accepté par les services de paiement sécurisé Stripe. Un e-mail de confirmation de commande, reprenant le récapitulatif de celle-ci (désignation des Produits, quantités, prix unitaires et totaux, adresse de livraison, numéro de commande), est adressé à l&apos;Acheteur à l&apos;adresse électronique communiquée lors de la commande. Cet e-mail vaut preuve de la transaction.
              </p>
              <p>
                Le Vendeur se réserve le droit d&apos;annuler ou de refuser toute commande d&apos;un Acheteur avec lequel il existerait un litige relatif au paiement d&apos;une commande antérieure, ou en cas de suspicion de fraude. Dans cette hypothèse, l&apos;Acheteur sera informé par e-mail de l&apos;annulation de sa commande et, le cas échéant, du remboursement des sommes déjà perçues.
              </p>
              <p>
                Les informations relatives aux commandes passées sont accessibles par l&apos;Acheteur via le lien de suivi contenu dans l&apos;e-mail de confirmation. Le Vendeur conserve les données de commande pendant la durée nécessaire à l&apos;exécution du contrat et aux obligations légales.
              </p>
            </div>
          </section>

          {/* 5. Paiement */}
          <section className="border-b border-gray-100 pb-5 mb-5 sm:pb-6 sm:mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              5 — Paiement
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Le paiement s&apos;effectue en ligne par carte bancaire (Visa, Mastercard, American Express, et autres cartes acceptées par Stripe) au moment de la validation de la commande. Les transactions sont sécurisées par le prestataire de paiement Stripe, Inc., dont le siège social est situé 510 Townsend Street, San Francisco, CA 94103, États-Unis.
              </p>
              <p>
                Conformément à la réglementation européenne applicable (Directive (UE) 2015/2366 dite « DSP2 »), le paiement est soumis au protocole d&apos;authentification forte (3D Secure / Secure Customer Authentication). L&apos;Acheteur pourra être invité, par sa banque émettrice, à s&apos;authentifier par une méthode à double facteur (code SMS, notification push, etc.) lors de la transaction.
              </p>
              <p>
                Le Site e.IcosSys ne stocke, à aucun moment, les données de carte bancaire de l&apos;Acheteur. L&apos;ensemble des flux financiers est traité de bout en bout par l&apos;infrastructure certifiée PCI-DSS de niveau 1 de Stripe. Les numéros de carte sont chiffrés et transitent exclusivement sur les serveurs sécurisés de Stripe, sans jamais transiter par les serveurs du Vendeur.
              </p>
              <p>
                Le paiement par carte bancaire est débité immédiatement lors de la confirmation de la commande. En cas de rejet du paiement par l&apos;établissement bancaire de l&apos;Acheteur, la commande ne sera pas enregistrée et le Vendeur ne pourra être tenu pour responsable de l&apos;impossibilité de débiter le compte de l&apos;Acheteur.
              </p>
              <p>
                La propriété des Produits vendus ne sera transférée à l&apos;Acheteur qu&apos;après le paiement intégral du prix, conformément à l&apos;article 1583 du Code civil. Le Vendeur se réserve le droit de demander un acompte ou un paiement intégral anticipé pour les commandes d&apos;un montant particulièrement élevé ou pour les commandes personnalisées.
              </p>
            </div>
          </section>

          {/* 6. Livraison */}
          <section className="border-b border-gray-100 pb-5 mb-5 sm:pb-6 sm:mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              6 — Livraison
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Les Produits sont livrés à l&apos;adresse de livraison indiquée par l&apos;Acheteur lors de la commande. Le Vendeur propose différents modes de livraison, dont les détails (délais, tarifs, zones géographiques couvertes) sont précisés lors du processus de commande et sur la page de sélection du mode de livraison. Les délais de livraison communiqués sont indicatifs et courent à compter de l&apos;expédition de la commande.
              </p>
              <p>
                Les délais de livraison habituels sont les suivants : livraison standard en France métropolitaine sous 3 à 5 jours ouvrés ; livraison express sous 24 à 48 heures ouvrées ; livraison vers les départements et territoires d&apos;outre-mer (DOM-TOM) et les pays de l&apos;Union européenne sous 5 à 10 jours ouvrés. Ces délais peuvent varier en fonction de la destination, du transporteur choisi et des conditions de transport.
              </p>
              <p>
                Le Vendeur s&apos;engage à expédier les Produits dans un délai maximum de 30 jours à compter de la commande, conformément à l&apos;article L. 216-2 du Code de la consommation. À défaut de livraison dans ce délai, l&apos;Acheteur dispose du droit de résoudre le contrat dans les conditions prévues par l&apos;article L. 216-3 du même code.
              </p>
              <p>
                Un numéro de suivi de colis (numéro de tracking) est communiqué à l&apos;Acheteur par e-mail dès l&apos;expédition de la commande. Ce numéro permet de suivre l&apos;acheminement du colis en temps réel sur le site du transporteur. En cas de retard de livraison, l&apos;Acheteur est invité à vérifier le statut de son colis à l&apos;aide de ce numéro de suivi et, le cas échéant, à contacter le service client du Vendeur.
              </p>
              <p>
                Conformément à l&apos;article L. 216-4 du Code de la consommation, le risque de perte ou d&apos;endommagement des Produits est transféré à l&apos;Acheteur au moment où ce dernier (ou un tiers désigné par lui, autre que le transporteur proposé par le Vendeur) prend physiquement possession des Produits. Pour les contrats de vente portant sur des biens, le transfert des risques intervient à la livraison.
              </p>
              <p>
                L&apos;Acheteur est tenu de vérifier l&apos;état des Produits livrés dès la réception. En cas de dommage apparent lors de la livraison, l&apos;Acheteur doit signaler toute anomalie sur le bon de livraison du transporteur, formuler des réserves écrites et en informer le Vendeur dans les 48 heures suivant la réception par e-mail à contact@e-icossys.fr, faute de quoi aucune réclamation ne pourra être acceptée.
              </p>
            </div>
          </section>

          {/* 7. Droit de rétractation */}
          <section className="border-b border-gray-100 pb-5 mb-5 sm:pb-6 sm:mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              7 — Droit de rétractation
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Conformément à l&apos;article L. 221-18 du Code de la consommation et à la Directive 2011/83/UE du Parlement européen et du Conseil du 25 octobre 2011 (article 9), l&apos;Acheteur dispose d&apos;un délai de quatorze (14) jours calendaires à compter de la réception des Produits pour exercer son droit de rétractation, sans avoir à justifier de motif ni à payer de pénalité.
              </p>
              <p>
                Pour exercer ce droit, l&apos;Acheteur doit notifier au Vendeur sa décision de rétractation de manière non équivoque, par tout moyen adapté (e-mail à contact@e-icossys.fr, courrier recommandé avec accusé de réception), en indiquant son nom, son adresse, le numéro de commande et, le cas échéant, les références du ou des Produits concernés. Un modèle de formulaire de rétractation est mis à la disposition de l&apos;Acheteur en annexe des présentes CGV et sur demande au service client.
              </p>
              <p>
                Le délai de rétractation est réputé respecté si l&apos;Acheteur envoie la notification de rétractation avant l&apos;expiration du délai de quatorze jours. L&apos;Acheteur doit ensuite renvoyer les Produits au Vendeur dans un délai de quatorze (14) jours à compter de la date à laquelle il a notifié sa décision de rétractation. Les Produits doivent être retournés dans leur emballage d&apos;origine, en parfait état, complets (accessoires, notices, étiquettes) et non utilisés.
              </p>
              <p>
                Le droit de rétractation ne peut être exercé pour les catégories de biens suivantes, conformément à l&apos;article L. 221-28 du Code de la consommation : les biens confectionnés selon les spécifications de l&apos;Acheteur ou nettement personnalisés ; les biens susceptibles de se détériorer ou de se périmer rapidement (produits alimentaires, cosmétiques ouverts) ; les biens scellés qui ne peuvent être renvoyés pour des raisons de protection de la santé ou d&apos;hygiène et qui ont été descellés par l&apos;Acheteur après la livraison ; les biens qui, par leur nature, sont inseparablesment mêlés à d&apos;autres articles.
              </p>
              <p>
                En cas d&apos;exercice du droit de rétractation, le Vendeur rembourse l&apos;intégralité des sommes versées par l&apos;Acheteur, y compris les frais de livraison (à l&apos;exception des frais supplémentaires découlant du choix par l&apos;Acheteur d&apos;un mode de livraison autre que le mode de livraison standard le moins coûteux), sans retard injustifié et au plus tard dans les quatorze (14) jours à compter de la date à laquelle le Vendeur est informé de la décision de rétractation de l&apos;Acheteur. Le remboursement sera effectué par le même moyen de paiement que celui utilisé pour la transaction initiale, sauf accord exprès de l&apos;Acheteur pour un autre moyen.
              </p>
            </div>
          </section>

          {/* 8. Retours et remboursements */}
          <section className="border-b border-gray-100 pb-5 mb-5 sm:pb-6 sm:mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              8 — Retours et remboursements
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                En cas d&apos;exercice du droit de rétractation, l&apos;Acheteur doit retourner les Produits au Vendeur à l&apos;adresse suivante : e.IcosSys, Service Retours, 12 rue de la Paix, 75002 Paris, France. Les Produits doivent être retournés dans un état permettant leur remise en vente : emballage d&apos;origine intact, Produit non utilisé, non lavé, non endommagé, avec l&apos;ensemble de ses accessoires et étiquettes. Le Vendeur se réserve le droit de refuser un retour ou de déduire une somme proportionnelle à la dépréciation du Produit si la valeur de celui-ci a été diminuée en raison de manipulations excessives par l&apos;Acheteur, conformément à l&apos;article L. 221-35 du Code de la consommation.
              </p>
              <p>
                Conformément à l&apos;article L. 221-24 du Code de la consommation, les frais de retour sont à la charge de l&apos;Acheteur, sauf si le Vendeur a accepté de les prendre en charge ou si le Vendeur n&apos;a pas informé l&apos;Acheteur de l&apos;obligation de supporter ces frais. L&apos;Acheteur est responsable de la perte ou de l&apos;endommagement des Produits jusqu&apos;à leur réception effective par le Vendeur. Il est donc vivement recommandé d&apos;utiliser un transporteur avec suivi et assurance.
              </p>
              <p>
                Le remboursement sera effectué dans les quatorze (14) jours calendaires suivant la réception des Produits retournés par le Vendeur, après vérification de leur état. Le Vendeur informera l&apos;Acheteur par e-mail de la bonne réception du retour et de l&apos;intervention du remboursement. Le remboursement interviendra sur le moyen de paiement utilisé lors de la commande initiale.
              </p>
              <p>
                En cas de retour d&apos;un Produit défectueux ou non conforme (cf. article 9 — Responsabilité), les frais de retour sont intégralement à la charge du Vendeur. L&apos;Acheteur devra contacter préalablement le service client afin d&apos;obtenir une étiquette de retour prépayée et les instructions de renvoi.
              </p>
              <p>
                Le Vendeur pourra différer le remboursement jusqu&apos;à réception du bien retourné ou jusqu&apos;à ce que l&apos;Acheteur ait fourni une preuve de l&apos;expédition du bien, la date retenue étant celle du premier de ces événements, conformément à l&apos;article L. 221-22 du Code de la consommation.
              </p>
            </div>
          </section>

          {/* 9. Responsabilité */}
          <section className="border-b border-gray-100 pb-5 mb-5 sm:pb-6 sm:mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              9 — Responsabilité
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Le Vendeur garantit la conformité des Produits vendus au contrat tel que défini par les articles L. 217-4 à L. 217-14 du Code de la consommation. Conformément à l&apos;article L. 217-4, le vendeur d&apos;un bien doit le livrer conforme au contrat. Le bien est conforme au contrat s&apos;il est propre à l&apos;usage habituellement attendu d&apos;un bien semblable, s&apos;il correspond à la description donnée par le Vendeur et possède les qualités que le Vendeur a présentées à l&apos;Acheteur sous forme d&apos;échantillon ou de modèle, et s&apos;il présente les qualités qu&apos;un Acheteur peut légitimement attendre eu égard aux déclarations publiques faites par le Vendeur, par le producteur ou par son représentant.
              </p>
              <p>
                Conformément à l&apos;article L. 217-5, le bien est défectueux s&apos;il n&apos;est pas conforme au contrat au sens de l&apos;article L. 217-4. Conformément à l&apos;article L. 217-6, pour être conforme au contrat, le bien doit notamment correspondre à la quantité, à la qualité et aux caractéristiques mentionnées dans la commande, et être adapté à tout usage spécifique que l&apos;Acheteur a porté à la connaissance du Vendeur au plus tard au moment de la conclusion du contrat et que le Vendeur a accepté.
              </p>
              <p>
                L&apos;action résultant du défaut de conformité se prescrit par deux ans à compter de la délivrance du bien (article L. 217-12). L&apos;Acheteur peut choisir entre la réparation ou le remplacement du bien, sous réserve des conditions de coût prévues à l&apos;article L. 217-10. Ces actions sont sans frais pour l&apos;Acheteur (article L. 217-11).
              </p>
              <p>
                Le Vendeur ne saurait être tenu responsable de l&apos;inexécution ou de la mauvaise exécution du contrat en cas de force majeure, de perturbation ou de grève totale ou partielle des services postaux et moyens de transport, d&apos;inondation, d&apos;incendie, ou de tout autre événement indépendant de sa volonté. Le Vendeur informera l&apos;Acheteur de l&apos;occurrence d&apos;un tel événement dans les meilleurs délais.
              </p>
              <p>
                La responsabilité du Vendeur ne pourra être engagée pour tous les dommages indirects, tels que, de manière non limitative, la perte de profit, la perte de chance, le préjudice commercial, les dommages résultant d&apos;une utilisation non conforme du Produit, ou d&apos;une négligence de l&apos;Acheteur dans l&apos;entretien ou l&apos;utilisation du Produit. Le Vendeur ne saurait être tenu responsable des erreurs, omissions ou inexactitudes pouvant figurer sur le Site, y compris en ce qui concerne la disponibilité, le prix, la description ou les caractéristiques des Produits.
              </p>
              <p>
                Le Vendeur met en œuvre tous les moyens raisonnables pour assurer la disponibilité et le bon fonctionnement du Site. Néanmoins, il ne saurait être tenu pour responsable des interruptions, des bugs, des erreurs, des défaillances techniques ou de toute autre cause extérieure qui pourraient affecter l&apos;accès ou le bon fonctionnement du Site, y compris les opérations de maintenance, les mises à jour ou les interventions nécessaires.
              </p>
            </div>
          </section>

          {/* 10. Données personnelles */}
          <section className="border-b border-gray-100 pb-5 mb-5 sm:pb-6 sm:mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              10 — Données personnelles
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Le Vendeur s&apos;engage à respecter la confidentialité des données personnelles de l&apos;Acheteur collectées dans le cadre de la commande et de l&apos;utilisation du Site, conformément au Règlement (UE) 2016/679 du Parlement européen et du Conseil du 27 avril 2016 relatif à la protection des personnes physiques à l&apos;égard du traitement des données à caractère personnel et à la libre circulation de ces données (ci-après le « RGPD »), ainsi qu&apos;à la loi n° 78-17 du 6 janvier 1978 relative à l&apos;informatique, aux fichiers et aux libertés, modifiée.
              </p>
              <p>
                Les données personnelles collectées lors de la passation de commande comprennent notamment : le nom et le prénom, l&apos;adresse postale de livraison et de facturation, l&apos;adresse électronique, le numéro de téléphone, les données de paiement traitées par Stripe (qui agit en tant que sous-traitant conformément à l&apos;article 28 du RGPD), ainsi que l&apos;historique des commandes. Ces données sont nécessaires à l&apos;exécution du contrat de vente, à la gestion de la relation client et, le cas échéant, à l&apos;envoi d&apos;informations commerciales avec le consentement préalable de l&apos;Acheteur.
              </p>
              <p>
                Les données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles sont collectées, et au maximum pendant la durée de prescription légale applicable. Les données relatives aux commandes sont conservées pendant cinq (5) ans à compter de la clôture de l&apos;exercice comptable concerné, conformément aux obligations du Code de commerce.
              </p>
              <p>
                Conformément aux articles 15 à 22 du RGPD, l&apos;Acheteur dispose d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation du traitement, de portabilité de ses données, ainsi que d&apos;un droit d&apos;opposition au traitement de ses données personnelles. L&apos;Acheteur peut exercer ces droits en adressant sa demande par e-mail à contact@e-icossys.fr ou par courrier à l&apos;adresse du siège social. Le Vendeur s&apos;engage à répondre à la demande dans un délai d&apos;un mois à compter de sa réception.
              </p>
              <p>
                L&apos;Acheteur est informé de son droit d&apos;introduire une réclamation auprès de la Commission Nationale de l&apos;Informatique et des Libertés (CNIL), 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, si elle estime que le traitement de ses données personnelles n&apos;est pas conforme à la réglementation. L&apos;Acheteur peut également déposer une réclamation en ligne sur le site de la CNIL (www.cnil.fr).
              </p>
            </div>
          </section>

          {/* 11. Litiges */}
          <section className="border-b border-gray-100 pb-5 mb-5 sm:pb-6 sm:mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              11 — Litiges
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                En cas de litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes CGV, l&apos;Acheteur est invité à contacter en priorité le service client du Vendeur par e-mail à l&apos;adresse contact@e-icossys.fr afin de rechercher une solution amiable. Le Vendeur s&apos;engage à traiter toute réclamation dans un délai raisonnable et à répondre à l&apos;Acheteur dans un délai d&apos;un mois.
              </p>
              <p>
                Conformément aux articles L. 612-1 et suivants du Code de la consommation et au Règlement (UE) n° 524/2013 du Parlement européen et du Conseil du 21 mai 2013, l&apos;Acheteur peut recourir à un médiateur de la consommation en vue de la résolution amiable du litige. Le Vendeur adhère au service de médiation de la consommation (le nom et les coordonnées du médiateur sont communiqués sur demande auprès du service client ou figurent dans les conditions générales de vente). La procédure de médiation est gratuite pour l&apos;Acheteur.
              </p>
              <p>
                L&apos;Acheteur peut également utiliser la plateforme de règlement en ligne des litiges mise en place par la Commission européenne, accessible à l&apos;adresse suivante : https://ec.europa.eu/consumers/odr/. Cette plateforme permet aux consommateurs de l&apos;Union européenne de soumettre les litiges liés à des achats en ligne à un médiateur agréé.
              </p>
              <p>
                Les présentes CGV sont soumises au droit français. En cas de litige non résolu par voie amiable ou par médiation, les tribunaux français compétents seront seuls compétents pour connaître du différend, conformément aux règles de compétence en matière de droit de la consommation. Le for attributif de compétence sera celui du tribunal judiciaire du ressort du siège social du Vendeur.
              </p>
              <p>
                Nonobstant ce qui précède, si l&apos;Acheteur est un professionnel ou un consommateur résidant dans un État membre de l&apos;Union européenne autre que la France, les dispositions impératives du droit de l&apos;État membre de résidence de l&apos;Acheteur pourront trouver application en vertu des règles de conflit de lois pertinentes.
              </p>
            </div>
          </section>

          {/* 12. Modification des CGV */}
          <section className="border-b border-gray-100 pb-5 mb-5 sm:pb-6 sm:mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              12 — Modification des CGV
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Le Vendeur se réserve le droit de modifier les présentes Conditions Générales de Vente à tout moment, afin de les adapter aux évolutions législatives et réglementaires, aux modifications des pratiques commerciales ou pour toute autre raison jugée nécessaire. Les modifications peuvent porter sur tout ou partie des clauses des présentes CGV.
              </p>
              <p>
                Les nouvelles CGV entreront en vigueur à compter de leur publication sur le Site. Il appartient à l&apos;Acheteur de consulter régulièrement les présentes CGV afin de prendre connaissance des éventuelles modifications. La date de « dernière mise à jour » figurant en bas de page des CGV permettra à l&apos;Acheteur de vérifier s&apos;il s&apos;agit de la version la plus récente.
              </p>
              <p>
                Les CGV applicables à une commande donnée sont celles en vigueur et accessibles sur le Site à la date à laquelle l&apos;Acheteur valide sa commande. Les commandes passées antérieurement à une modification des CGV restent soumises aux CGV applicables au moment de leur passation. Le Vendeur ne pourra en aucun cas invoquer une modification postérieure des CGV à l&apos;encontre d&apos;une commande déjà en cours d&apos;exécution.
              </p>
              <p>
                En cas de désaccord de l&apos;Acheteur avec les nouvelles CGV, celui-ci est libre de cesser d&apos;utiliser le Site et de ne pas passer de nouvelle commande. La poursuite de l&apos;utilisation du Site et la passation de nouvelles commandes après l&apos;entrée en vigueur des CGV modifiées vaudront acceptation sans réserve de ces dernières par l&apos;Acheteur.
              </p>
            </div>
          </section>

          {/* Last updated */}
          <p className="text-xs text-gray-400 mb-10">
            Dernière mise à jour : 1ᵉʳ juillet 2025
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50/50 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">eI</span>
            </div>
            <span className="text-xs text-gray-400">e.IcosSys</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
            <Link href="/conditions" className="text-[11px] text-gray-300 hover:text-gray-500 transition-colors">Conditions</Link>
            <Link href="/retours" className="text-[11px] text-gray-300 hover:text-gray-500 transition-colors">Retours</Link>
            <Link href="/mentions-legales" className="text-[11px] text-gray-300 hover:text-gray-500 transition-colors">Mentions légales</Link>
            <span className="text-[11px] text-gray-200">·</span>
            <p className="text-[11px] text-gray-300">Paiement sécurisé par Stripe</p>
          </div>
        </div>
      </footer>
    </div>
  );
}