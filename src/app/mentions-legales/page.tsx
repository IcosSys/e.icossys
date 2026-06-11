"use client";

import Link from "next/link";

export default function MentionsLegalesPage() {
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Mentions L&eacute;gales
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Informations l&eacute;gales relatives au site e.IcosSys, conform&eacute;ment &agrave; la l&eacute;gislation fran&ccedil;aise et europ&eacute;enne en vigueur.
            </p>
          </div>

          {/* 1. Éditeur du site */}
          <section className="border-b border-gray-100 pb-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              1 — &Eacute;diteur du site
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Le site e.IcosSys est &eacute;dit&eacute; par la soci&eacute;t&eacute; e.IcosSys, soci&eacute;t&eacute; &agrave; responsabilit&eacute; limit&eacute;e (SARL) au capital social de 10&nbsp;000&nbsp;&euro;, immatricul&eacute;e au Registre du Commerce et des Soci&eacute;t&eacute;s de Paris sous le num&eacute;ro RCS Paris B 123&nbsp;456&nbsp;789.
              </p>
              <p>
                <span className="font-medium text-gray-700">Si&egrave;ge social :</span> 12 rue de la Paix, 75002 Paris, France
              </p>
              <p>
                <span className="font-medium text-gray-700">Adresse e-mail :</span>{" "}
                <a href="mailto:contact@e-icossys.fr" className="underline hover:text-gray-900 transition-colors">
                  contact@e-icossys.fr
                </a>
              </p>
              <p>
                <span className="font-medium text-gray-700">Num&eacute;ro de t&eacute;l&eacute;phone :</span> +33 (0)1 23 45 67 89
              </p>
              <p>
                <span className="font-medium text-gray-700">N&deg; TVA intracommunautaire :</span> FR 12 345678901
              </p>
            </div>
          </section>

          {/* 2. Directeur de la publication */}
          <section className="border-b border-gray-100 pb-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              2 — Directeur de la publication
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Conform&eacute;ment &agrave; la loi n&deg;&nbsp;2000-516 du 15 juin 2000 relative &agrave; la responsabilit&eacute; p&eacute;nale des personnes morales et &agrave; la loi n&deg;&nbsp;2004-575 du 21 juin 2004 pour la confiance dans l&apos;&eacute;conomie num&eacute;rique (LCEN), le directeur de la publication du site e.IcosSys est :
              </p>
              <p>
                <span className="font-medium text-gray-700">M. Jean Dupont</span>, g&eacute;rant de la SARL e.IcosSys.
              </p>
              <p>
                &Agrave; ce titre, il est responsable de la d&eacute;termination du contenu &eacute;ditorial publi&eacute; sur le site et peut &ecirc;tre contact&eacute; aux coordonn&eacute;es indiqu&eacute;es &agrave; la section pr&eacute;c&eacute;dente. Toute demande relative au contenu du site peut lui &ecirc;tre adress&eacute;e par courrier au si&egrave;ge social ou par e-mail &agrave; contact@e-icossys.fr.
              </p>
            </div>
          </section>

          {/* 3. Hébergement */}
          <section className="border-b border-gray-100 pb-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              3 — H&eacute;bergement
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Le site e.IcosSys est h&eacute;berg&eacute; par la soci&eacute;t&eacute; <span className="font-medium text-gray-700">OVH SAS</span>, au capital de 10&nbsp;069&nbsp;020&nbsp;&euro;, immatricul&eacute;e au Registre du Commerce et des Soci&eacute;t&eacute;s de Lille M&eacute;tropole sous le num&eacute;ro RCS Lille M&eacute;tropole 424&nbsp;761&nbsp;419&nbsp;00045.
              </p>
              <p>
                <span className="font-medium text-gray-700">Adresse :</span> 2 rue Kellermann, 59100 Roubaix, France
              </p>
              <p>
                <span className="font-medium text-gray-700">T&eacute;l&eacute;phone :</span> +33 (0)9 72 10 10 07
              </p>
              <p>
                L&apos;h&eacute;bergeur assure le stockage des donn&eacute;es du site sur des serveurs s&eacute;curis&eacute;s situ&eacute;s sur le territoire de l&apos;Union europ&eacute;enne. Conform&eacute;ment &agrave; l&apos;article 6 de la loi n&deg;&nbsp;2004-575 du 21 juin 2004, l&apos;h&eacute;bergeur conserve les donn&eacute;es de connexion et d&apos;identification des contributeurs du site dans les conditions pr&eacute;vues par la l&eacute;gislation applicable. OVH SAS est joignable directement pour toute question relative &agrave; l&apos;h&eacute;bergement du site.
              </p>
            </div>
          </section>

          {/* 4. Propriété intellectuelle */}
          <section className="border-b border-gray-100 pb-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              4 — Propri&eacute;t&eacute; intellectuelle
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                L&apos;ensemble des contenus pr&eacute;sents sur le site e.IcosSys, incluant de mani&egrave;re non limitative les textes, les images, les photographies, les logos, les graphismes, les ic&ocirc;nes, les sons, les vid&eacute;os, les marques, les dessins et mod&egrave;les, ainsi que toute autre cr&eacute;ation intellectuelle, est la propri&eacute;t&eacute; exclusive de la SARL e.IcosSys ou de ses partenaires, et est prot&eacute;g&eacute; par les dispositions du Code fran&ccedil;ais de la propri&eacute;t&eacute; intellectuelle.
              </p>
              <p>
                Toute reproduction, repr&eacute;sentation, modification, distribution ou exploitation, m&ecirc;me partielle, de tout ou partie des &eacute;l&eacute;ments du site, par quelque proc&eacute;d&eacute; que ce soit, sans l&apos;autorisation &eacute;crite pr&eacute;alable de l&apos;&eacute;diteur, est strictement interdite et constitue une contrefa&ccedil;on sanctionn&eacute;e par les articles L.&nbsp;335-2 et L.&nbsp;335-3 du Code de la propri&eacute;t&eacute; intellectuelle. L&apos;article L.&nbsp;335-2 pr&eacute;voit une peine de trois ans d&apos;emprisonnement et de 300&nbsp;000&nbsp;&euro; d&apos;amende pour toute &eacute;dition d&apos;une &oelig;uvre de l&apos;esprit en violation des droits de l&apos;auteur.
              </p>
              <p>
                Conform&eacute;ment &agrave; l&apos;article L.&nbsp;335-3 du m&ecirc;me code, la diffusion d&apos;une &oelig;uvre de l&apos;esprit mise &agrave; disposition du public sur un r&eacute;seau de communications &eacute;lectroniques, lorsque cette diffusion n&apos;a pas &eacute;t&eacute; autoris&eacute;e par les titulaires de droits, est &eacute;galement punie des m&ecirc;mes peines. Les noms de marques et de produits cit&eacute;s sur ce site sont la propri&eacute;t&eacute; de leurs d&eacute;posants respectifs et ne peuvent &ecirc;tre utilis&eacute;s sans leur accord pr&eacute;alable.
              </p>
              <p>
                La mise en place de liens hypertextes vers le site e.IcosSys est autoris&eacute;e sans autorisation pr&eacute;alable, &agrave; la condition que ces liens ne portent pas atteinte &agrave; l&apos;image ou aux int&eacute;r&ecirc;ts de l&apos;&eacute;diteur. L&apos;utilisation de la technique du &laquo; framing &raquo; ou de l&apos;incorporation de pages du site dans les pages d&apos;un autre site est strictement interdite sans accord &eacute;crit pr&eacute;alable.
              </p>
            </div>
          </section>

          {/* 5. Limitation de responsabilité */}
          <section className="border-b border-gray-100 pb-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              5 — Limitation de responsabilit&eacute;
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                L&apos;&eacute;diteur du site e.IcosSys s&apos;efforce de fournir des informations aussi pr&eacute;cises que possible sur le site. Toutefois, il ne pourra &ecirc;tre tenu responsable des omissions, des inexactitudes et des carences dans la mise &agrave; jour, qu&apos;elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations. Toutes les informations indiqu&eacute;es sur le site sont donn&eacute;es &agrave; titre indicatif et sont susceptibles d&apos;&eacute;voluer.
              </p>
              <p>
                L&apos;&eacute;diteur ne saurait &ecirc;tre tenu responsable de l&apos;utilisation qui pourrait &ecirc;tre faite des informations et contenus disponibles sur le site, de quelque mani&egrave;re que ce soit. L&apos;&eacute;diteur fournit les contenus du site &laquo; en l&apos;&eacute;tat &raquo; et ne donne aucune garantie, expresse ou implicite, quant &agrave; leur exactitude, leur compl&eacute;tude, leur pertinence ou leur ad&eacute;quation &agrave; un usage particulier.
              </p>
              <p>
                L&apos;&eacute;diteur du site ne saurait &ecirc;tre tenu responsable des interruptions temporaires ou permanentes du service, qu&apos;elles soient dues &agrave; des op&eacute;rations de maintenance, des mises &agrave; jour, des pannes techniques, des actes de malveillance ou &agrave; tout autre &eacute;v&eacute;nement ind&eacute;pendant de sa volont&eacute;. L&apos;utilisateur reconna&icirc;t que le site n&apos;est pas accessible en permanence de mani&egrave;re ininterrompue et exempte d&apos;erreurs.
              </p>
              <p>
                Conform&eacute;ment &agrave; l&apos;article 6 de la loi n&deg;&nbsp;2004-575 du 21 juin 2004 pour la confiance dans l&apos;&eacute;conomie num&eacute;rique, l&apos;&eacute;diteur n&apos;est pas soumis &agrave; une obligation g&eacute;n&eacute;rale de surveillance des contenus qu&apos;il h&eacute;berge ou auxquels il donne acc&egrave;s, mais il doit mettre en place un m&eacute;canisme de notification et de retrait rapide des contenus illicites d&eacute;nonc&eacute;s conform&eacute;ment &agrave; l&apos;article 6-I-5 de la m&ecirc;me loi.
              </p>
            </div>
          </section>

          {/* 6. Liens hypertextes */}
          <section className="border-b border-gray-100 pb-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              6 — Liens hypertextes
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Le site e.IcosSys peut contenir des liens hypertextes vers d&apos;autres sites internet. Ces liens sont fournis &agrave; titre informatif uniquement et ne constituent en aucun cas une approbation, un partenariat ou un parrainage de ces sites par l&apos;&eacute;diteur. L&apos;&eacute;diteur n&apos;exerce aucun contr&ocirc;le sur le contenu de ces sites tiers et d&eacute;cline toute responsabilit&eacute; quant &agrave; leur contenu, leurs pratiques en mati&egrave;re de protection des donn&eacute;es personnelles ou leur disponibilit&eacute;.
              </p>
              <p>
                L&apos;utilisateur acc&egrave;de aux sites tiers li&eacute;s sous sa seule et unique responsabilit&eacute;. L&apos;&eacute;diteur du site e.IcosSys ne saurait &ecirc;tre tenu responsable de tout dommage r&eacute;sultant de la consultation ou de l&apos;utilisation des sites tiers accessibles par l&apos;interm&eacute;diaire de liens hypertextes. Il appartient &agrave; l&apos;utilisateur de prendre toutes les mesures appropri&eacute;es pour prot&eacute;ger ses propres donn&eacute;es et &eacute;quipements contre les virus ou tout &eacute;l&eacute;ment de nature nuisible pouvant &ecirc;tre pr&eacute;sent sur ces sites.
              </p>
              <p>
                L&apos;insertion de liens hypertextes vers le site e.IcosSys, &agrave; l&apos;exclusion de toute technique de &laquo; deep linking &raquo;, de &laquo; framing &raquo; ou d&apos;incorporation, est autoris&eacute;e sans autorisation pr&eacute;alable, sous r&eacute;serve que le lien ne porte pas atteinte aux droits de l&apos;&eacute;diteur et que la page source affiche clairement le lien vers le site. Toute demande d&apos;autorisation de lien doit &ecirc;tre adress&eacute;e &agrave; contact@e-icossys.fr.
              </p>
            </div>
          </section>

          {/* 7. Cookies et technologie de suivi */}
          <section className="border-b border-gray-100 pb-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              7 — Cookies et technologie de suivi
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Le site e.IcosSys utilise des cookies et technologies similaires (tels que les pixels de suivi ou le stockage local) afin d&apos;assurer le bon fonctionnement du site, de s&eacute;curiser les transactions et d&apos;am&eacute;liorer l&apos;exp&eacute;rience de l&apos;utilisateur. Conform&eacute;ment aux articles 6-5 et 82 de la loi n&deg;&nbsp;78-17 du 6 janvier 1978 relative &agrave; l&apos;informatique, aux fichiers et aux libert&eacute;s, modifi&eacute;e, ainsi qu&apos;au R&egrave;glement G&eacute;n&eacute;ral sur la Protection des Donn&eacute;es (RGPD) et aux recommandations de la Commission Nationale de l&apos;Informatique et des Libert&eacute;s (CNIL), l&apos;&eacute;diteur informe les utilisateurs de l&apos;utilisation de ces technologies.
              </p>
              <p>
                <span className="font-medium text-gray-700">Cookies strictement n&eacute;cessaires :</span> ces cookies sont indispensables au fonctionnement du site et ne peuvent pas &ecirc;tre d&eacute;sactiv&eacute;s. Ils incluent notamment les cookies de session utilis&eacute;s par le prestataire de paiement Stripe pour le traitement s&eacute;curis&eacute; des transactions bancaires (conform&eacute;ment &agrave; la Directive (UE) 2015/2366 dite &laquo; DSP2 &raquo;) ainsi que les cookies n&eacute;cessaires au fonctionnement du panier d&apos;achat et &agrave; la navigation sur le site. Ces cookies ne n&eacute;cessitent pas le consentement pr&eacute;alable de l&apos;utilisateur conform&eacute;ment &agrave; l&apos;article 82 de la loi Informatique et Libert&eacute;s.
              </p>
              <p>
                <span className="font-medium text-gray-700">Cookies de mesure d&apos;audience et d&apos;analyse :</span> le site peut &ecirc;tre amen&eacute; &agrave; utiliser des cookies d&apos;analyse (tels que Google Analytics ou des outils similaires) permettant de collecter des informations anonymis&eacute;es sur la fr&eacute;quentation du site, les pages visit&eacute;es et le comportement de navigation. Ces cookies sont soumis au consentement pr&eacute;alable de l&apos;utilisateur et peuvent &ecirc;tre d&eacute;sactiv&eacute;s &agrave; tout moment par l&apos;interm&eacute;diaire des param&egrave;tres du navigateur ou de la banni&egrave;re de consentement.
              </p>
              <p>
                L&apos;utilisateur peut &agrave; tout moment configurer son navigateur pour refuser les cookies ou &ecirc;tre alert&eacute; de leur d&eacute;p&ocirc;t. Les proc&eacute;dures de d&eacute;sactivation varient selon le navigateur utilis&eacute;. Toutefois, la d&eacute;sactivation des cookies strictement n&eacute;cessaires est susceptible d&apos;alt&eacute;rer le fonctionnement du site et de rendre impossibles certaines op&eacute;rations, notamment le paiement en ligne. Pour en savoir plus sur la gestion des cookies, l&apos;utilisateur est invit&eacute; &agrave; consulter le site de la CNIL (www.cnil.fr).
              </p>
              <p>
                La dur&eacute;e de conservation des cookies est fix&eacute;e au strict n&eacute;cessaire aux finalit&eacute;s pour lesquelles ils sont &eacute;mis. Les cookies de session sont supprim&eacute;s automatiquement &agrave; la fermeture du navigateur. Les cookies persistants ont une dur&eacute;e de vie maximale de treize (13) mois &agrave; compter de leur premier d&eacute;p&ocirc;t sur l&apos;&eacute;quipement terminal de l&apos;utilisateur, conform&eacute;ment aux recommandations de la CNIL.
              </p>
            </div>
          </section>

          {/* 8. Données personnelles */}
          <section className="border-b border-gray-100 pb-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              8 — Donn&eacute;es personnelles
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                L&apos;&eacute;diteur du site e.IcosSys s&apos;engage &agrave; prot&eacute;ger les donn&eacute;es &agrave; caract&egrave;re personnel des utilisateurs conform&eacute;ment au R&egrave;glement (UE) 2016/679 du Parlement europ&eacute;en et du Conseil du 27 avril 2016 relatif &agrave; la protection des personnes physiques &agrave; l&apos;&eacute;gard du traitement des donn&eacute;es &agrave; caract&egrave;re personnel et &agrave; la libre circulation de ces donn&eacute;es (ci-apr&egrave;s le &laquo; RGPD &raquo;), ainsi qu&apos;&agrave; la loi n&deg;&nbsp;78-17 du 6 janvier 1978 relative &agrave; l&apos;informatique, aux fichiers et aux libert&eacute;s, modifi&eacute;e.
              </p>
              <p>
                Les donn&eacute;es personnelles collect&eacute;es sur le site comprennent notamment les donn&eacute;es d&apos;identification (nom, pr&eacute;nom, adresse e-mail, num&eacute;ro de t&eacute;l&eacute;phone), les donn&eacute;es de livraison et de facturation (adresse postale), les donn&eacute;es de paiement trait&eacute;es par Stripe (conform&eacute;ment &agrave; l&apos;article 28 du RGPD, Stripe agit en qualit&eacute; de sous-traitant), ainsi que les donn&eacute;es de navigation (adresses IP, cookies). Ces donn&eacute;es sont n&eacute;cessaires &agrave; l&apos;ex&eacute;cution du contrat de vente, &agrave; la gestion de la relation client et, le cas &eacute;ch&eacute;ant, &agrave; l&apos;envoi d&apos;informations commerciales avec le consentement pr&eacute;alable de l&apos;utilisateur.
              </p>
              <p>
                Conform&eacute;ment aux articles 15 &agrave; 22 du RGPD, chaque utilisateur dispose d&apos;un droit d&apos;acc&egrave;s (article 15), de rectification (article 16), d&apos;effacement (article 17, dit &laquo; droit &agrave; l&apos;oubli &raquo;), de limitation du traitement (article 18), de portabilit&eacute; (article 20), ainsi que d&apos;un droit d&apos;opposition au traitement (article 21). L&apos;utilisateur peut &eacute;galement d&eacute;finir des directives post-mortem relatives &agrave; la conservation, l&apos;effacement et la communication de ses donn&eacute;es personnelles (article 85 de la loi Informatique et Libert&eacute;s).
              </p>
              <p>
                Pour exercer ses droits, l&apos;utilisateur peut adresser sa demande par e-mail &agrave; <a href="mailto:contact@e-icossys.fr" className="underline hover:text-gray-900 transition-colors">contact@e-icossys.fr</a> ou par courrier &agrave; l&apos;adresse du si&egrave;ge social (e.IcosSys, 12 rue de la Paix, 75002 Paris, France), en joignant une copie d&apos;un titre d&apos;identit&eacute;. L&apos;&eacute;diteur s&apos;engage &agrave; r&eacute;pondre &agrave; toute demande dans un d&eacute;lai d&apos;un mois &agrave; compter de sa r&eacute;ception, conform&eacute;ment &agrave; l&apos;article 12 du RGPD. Ce d&eacute;lai peut &ecirc;tre prolong&eacute; de deux mois suppl&eacute;mentaires pour les demandes complexes, auquel cas l&apos;int&eacute;ress&eacute; en sera inform&eacute; dans le d&eacute;lai d&apos;un mois.
              </p>
              <p>
                L&apos;utilisateur est inform&eacute; de son droit d&apos;introduire une r&eacute;clamation aupr&egrave;s de la Commission Nationale de l&apos;Informatique et des Libert&eacute;s (CNIL), 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07, s&apos;il estime que le traitement de ses donn&eacute;es personnelles n&apos;est pas conforme &agrave; la r&eacute;glementation. La r&eacute;clamation peut &eacute;galement &ecirc;tre d&eacute;pos&eacute;e en ligne sur le site de la CNIL (www.cnil.fr). Les donn&eacute;es sont conserv&eacute;es pendant la dur&eacute;e n&eacute;cessaire aux finalit&eacute;s pour lesquelles elles ont &eacute;t&eacute; collect&eacute;es, et au maximum pendant la dur&eacute;e de prescription l&eacute;gale applicable.
              </p>
            </div>
          </section>

          {/* 9. Médiation des litiges */}
          <section className="border-b border-gray-100 pb-6 mb-6">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              9 — M&eacute;diation des litiges
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Conform&eacute;ment aux articles L.&nbsp;612-1 et suivants du Code de la consommation, ainsi qu&apos;au R&egrave;glement (UE) n&deg;&nbsp;524/2013 du Parlement europ&eacute;en et du Conseil du 21 mai 2013 relatif au r&egrave;glement en ligne des litiges de consommation, l&apos;&eacute;diteur informe les consommateurs de l&apos;existence de la plateforme de r&egrave;glement en ligne des litiges mise en place par la Commission europ&eacute;enne. Cette plateforme est accessible &agrave; l&apos;adresse suivante :{" "}
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-900 transition-colors">
                  https://ec.europa.eu/consumers/odr/
                </a>.
              </p>
              <p>
                Cette plateforme europ&eacute;enne permet aux consommateurs r&eacute;sidant dans l&apos;Union europ&eacute;enne de soumettre en ligne tout litige li&eacute; &agrave; des contrats de vente en ligne &agrave; un m&eacute;diateur agr&eacute;&eacute;, sans n&eacute;cessiter le recours &agrave; un tribunal. La proc&eacute;dure de m&eacute;diation est gratuite pour le consommateur. Il est pr&eacute;cis&eacute; que l&apos;&eacute;diteur n&apos;est pas oblig&eacute; de participer &agrave; la proc&eacute;dure de m&eacute;diation de la plateforme ODR.
              </p>
              <p>
                En outre, conform&eacute;ment au d&eacute;cret n&deg;&nbsp;2015-1382 du 30 octobre 2015 relatif &agrave; la m&eacute;diation des litiges de la consommation, l&apos;&eacute;diteur adh&egrave;re &agrave; un dispositif de m&eacute;diation de la consommation. Le consommateur peut, en cas de litige non r&eacute;solu par le service client, saisir gratuitement le m&eacute;diateur de la consommation d&eacute;sign&eacute; par l&apos;&eacute;diteur. Les coordonn&eacute;es du m&eacute;diateur sont communiqu&eacute;es sur demande aupr&egrave;s du service client &agrave; l&apos;adresse contact@e-icossys.fr ou lors de la r&eacute;ception de la commande.
              </p>
              <p>
                Le consommateur est invit&eacute;, en pr&eacute;alable &agrave; toute saisine du m&eacute;diateur, &agrave; contacter le service client de l&apos;&eacute;diteur par e-mail &agrave; contact@e-icossys.fr afin de rechercher une solution amiable au litige. Le d&eacute;lai raisonnable pour le traitement d&apos;une r&eacute;clamation par le service client est d&apos;un mois &agrave; compter de sa r&eacute;ception.
              </p>
            </div>
          </section>

          {/* 10. Droit applicable */}
          <section className="pb-8">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              10 — Droit applicable
            </h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-2">
              <p>
                Les pr&eacute;sentes mentions l&eacute;gales, ainsi que l&apos;ensemble des relations n&eacute;es de l&apos;utilisation du site e.IcosSys, sont r&eacute;gies par le droit fran&ccedil;ais. En cas de litige relatif &agrave; l&apos;interpr&eacute;tation ou &agrave; l&apos;ex&eacute;cution des pr&eacute;sentes, les parties s&apos;efforceront de trouver une solution amiable avant de recourir &agrave; une proc&eacute;dure contentieuse.
              </p>
              <p>
                &Agrave; d&eacute;faut de r&eacute;solution amiable, et conform&eacute;ment aux dispositions du Code de la consommation relatives &agrave; la comp&eacute;tence juridictionnelle en mati&egrave;re de droit de la consommation (articles R.&nbsp;631-3 et suivants du Code de la consommation), les tribunaux fran&ccedil;ais comp&eacute;tents seront seuls comp&eacute;tents pour conna&icirc;tre du diff&eacute;rend. Le for attributif de comp&eacute;tence sera celui du tribunal judiciaire du ressort du si&egrave;ge social du Vendeur, &agrave; savoir le tribunal judiciaire de Paris.
              </p>
              <p>
                Nonobstant ce qui pr&eacute;c&egrave;de, si le consommateur est r&eacute;sident d&apos;un &Eacute;tat membre de l&apos;Union europ&eacute;enne autre que la France, les dispositions imp&eacute;ratives de protection du consommateur du droit de l&apos;&Eacute;tat membre de r&eacute;sidence du consommateur pourront trouver application en vertu des r&egrave;gles de conflit de lois pertinentes, et notamment du R&egrave;glement (CE) n&deg;&nbsp;593/2008 du Parlement europ&eacute;en et du Conseil du 17 juin 2008 dit &laquo; Rome I &raquo;.
              </p>
              <p>
                Le site e.IcosSys est destin&eacute; &agrave; un public fran&ccedil;ais et europ&eacute;en. L&apos;&eacute;diteur ne garantit pas que le contenu du site est adapt&eacute; ou disponible dans tous les pays. L&apos;acc&egrave;s au site depuis un pays o&ugrave; son contenu serait ill&eacute;gal est strictement interdit. Les utilisateurs acc&eacute;dant au site depuis l&apos;&eacute;tranger sont seuls responsables du respect de la l&eacute;gislation locale applicable.
              </p>
            </div>
          </section>

          {/* Last updated */}
          <p className="text-xs text-gray-400 mb-10">
            Derni&egrave;re mise &agrave; jour : 1ᵉʳ juillet 2025
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
          <div className="flex items-center gap-4">
            <Link href="/conditions" className="text-[11px] text-gray-300 hover:text-gray-500 transition-colors">Conditions g&eacute;n&eacute;rales</Link>
            <Link href="/retours" className="text-[11px] text-gray-300 hover:text-gray-500 transition-colors">Politique de retour</Link>
            <Link href="/mentions-legales" className="text-[11px] text-gray-300 hover:text-gray-500 transition-colors">Mentions l&eacute;gales</Link>
            <span className="text-[11px] text-gray-200">&middot;</span>
            <p className="text-[11px] text-gray-300">Paiement s&eacute;curis&eacute; par Stripe</p>
          </div>
        </div>
      </footer>
    </div>
  );
}