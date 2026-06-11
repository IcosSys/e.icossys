"use client";

import Link from "next/link";

export default function RetoursPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-tight">eI</span>
            </div>
            <h1 className="text-sm font-bold text-gray-900">e.IcosSys</h1>
          </div>
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium"
          >
            Retour &agrave; la boutique
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Page title */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Politique de Retour et de R&eacute;tractation
            </h2>
            <p className="text-sm text-gray-500">
              Derni&egrave;re mise &agrave; jour : janvier 2025
            </p>
          </div>

          {/* Highlighted info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Vous disposez de 14 jours pour changer d&rsquo;avis
                </p>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Conform&eacute;ment &agrave; la l&eacute;gislation europ&eacute;enne, vous pouvez retourner tout article
                  dans un d&eacute;lai de 14 jours calendaires &agrave; compter de la r&eacute;ception de votre commande,
                  sans avoir &agrave; justifier votre d&eacute;cision ni &agrave; payer de p&eacute;nalit&eacute;.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1 — Droit de rétractation */}
          <section className="border-b border-gray-100 pb-6 mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              1. Droit de r&eacute;tractation
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              <p>
                Conform&eacute;ment &agrave; la directive europ&eacute;enne 2011/83/UE transpos&eacute;e en droit
                fran&ccedil;ais aux articles L.&nbsp;221-18 &agrave; L.&nbsp;221-28 du Code de la consommation,
                vous disposez d&rsquo;un d&eacute;lai de <strong className="text-gray-800">14 jours
                calendaires</strong> &agrave; compter de la date de r&eacute;ception de votre commande pour
                exercer votre droit de r&eacute;tractation. Ce d&eacute;lai vous permet de retourner tout ou
                partie des articles command&eacute;s sans avoir &agrave; motiver votre d&eacute;cision, sans
                avoir &agrave; supporter de frais autres que les frais de retour directs.
              </p>
              <p>
                Pour exercer ce droit, vous devez nous notifier de mani&egrave;re claire et non &eacute;quivoque
                votre d&eacute;cision de r&eacute;tractation. Cette notification peut &ecirc;tre adress&eacute;e
                par courrier &eacute;lectronique &agrave; l&rsquo;adresse de contact indiqu&eacute;e dans la
                section &laquo; Contact &raquo; de la pr&eacute;sente page. Nous vous invitons &agrave;
                indiquer dans votre message votre num&eacute;ro de commande, les r&eacute;f&eacute;rences des
                articles concern&eacute;s ainsi que la raison du retour (bien que celle-ci soit facultative).
              </p>
              <p>
                D&egrave;s r&eacute;ception de votre demande de r&eacute;tractation, nous vous enverrons un
                accus&eacute; de r&eacute;ception dans un d&eacute;lai raisonnable. Vous devrez ensuite
                nous retourner les articles dans les conditions d&eacute;crites ci-dessous, dans un d&eacute;lai
                de 14 jours &agrave; compter de la communication de votre d&eacute;cision de r&eacute;tractation.
              </p>
              <p>
                Le d&eacute;lai de 14 jours est r&eacute;put&eacute; respect&eacute; si vous exp&eacute;diez
                les biens avant l&rsquo;expiration de ce d&eacute;lai. Il ne s&rsquo;agit pas de la date
                d&rsquo;arriv&eacute;e effective du colis dans nos locaux, mais bien de la date
                d&rsquo;exp&eacute;dition par vos soins.
              </p>
            </div>
          </section>

          {/* Section 2 — Conditions de retour */}
          <section className="border-b border-gray-100 pb-6 mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              2. Conditions de retour
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              <p>
                Pour que votre retour soit accept&eacute; et trait&eacute; dans les meilleurs d&eacute;lais,
                les articles doivent r&eacute;pondre aux conditions suivantes :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Les articles doivent &ecirc;tre <strong className="text-gray-800">retourn&eacute;s non
                  utilis&eacute;s, non port&eacute;s, non lav&eacute;s et non alt&eacute;r&eacute;s</strong>.
                  L&rsquo;article ne doit porter aucune trace d&rsquo;utilisation, d&rsquo;odeur (parfum,
                  tabac) ou de modification quelconque.
                </li>
                <li>
                  Les articles doivent &ecirc;tre renvoy&eacute;s dans leur <strong className="text-gray-800">
                  emballage d&rsquo;origine</strong>, avec toutes les &eacute;tiquettes, les &eacute;tiquettes
                  de prix et les attaches encore en place. Toute &eacute;tiquette retir&eacute;e ou endommag&eacute;e
                  pourra entra&icirc;ner un refus du retour ou une d&eacute;valuation du produit.
                </li>
                <li>
                  Tous les accessoires, notices, certificats d&rsquo;authenticit&eacute; et &eacute;l&eacute;ments
                  d&rsquo;accompagnement livr&eacute;s avec le produit doivent &ecirc;tre inclus dans le
                  colis de retour.
                </li>
                <li>
                  Les articles retourn&eacute;s doivent &ecirc;tre correctement prot&eacute;g&eacute;s afin
                  d&rsquo;&eacute;viter tout dommage durant le transport. Nous recommandons d&rsquo;utiliser
                  un carton adapt&eacute; &agrave; la taille du produit avec un mat&eacute;riau de calage
                  suffisant (papier bulle, papier kraft, etc.).
                </li>
              </ul>
              <p>
                <strong className="text-gray-800">Adresse de retour :</strong> l&rsquo;adresse d&rsquo;exp&eacute;dition
                vous sera communiqu&eacute;e lors de la validation de votre demande de retour par notre service
                client. Ne renvoyez pas de colis sans avoir re&ccedil;u au pr&eacute;alable notre autorisation
                de retour.
              </p>
              <p>
                <strong className="text-gray-800">Frais de retour :</strong> sauf dans le cas d&rsquo;un article
                d&eacute;fectueux ou non conforme (voir section 7), les frais d&rsquo;exp&eacute;dition du
                retour sont &agrave; la charge du client. Le montant de ces frais d&eacute;pend du transporteur
                et du mode d&rsquo;exp&eacute;dition que vous choisirez.
              </p>
              <p>
                <strong className="text-gray-800">Envoi recommand&eacute; :</strong> il est fortement
                recommand&eacute; d&rsquo;utiliser un envoi avec suivi (num&eacute;ro de suivi) ou un
                envoi recommand&eacute;. En cas de perte ou de dommage du colis durant le transport retour,
                la responsabilit&eacute; incombe au transporteur. Disposer d&rsquo;un num&eacute;ro de
                suivi vous permettra de faire valoir vos droits aupr&egrave;s du transporteur en cas de
                litige. Conservez pr&eacute;cieusement votre preuve d&rsquo;exp&eacute;dition.
              </p>
            </div>
          </section>

          {/* Section 3 — Exclusions au droit de rétractation */}
          <section className="border-b border-gray-100 pb-6 mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              3. Exclusions au droit de r&eacute;tractation
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              <p>
                Conform&eacute;ment &agrave; l&rsquo;article L.&nbsp;221-28 du Code de la consommation,
                le droit de r&eacute;tractation ne peut pas &ecirc;tre exerc&eacute; pour les cat&eacute;gories
                de biens suivantes :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-gray-800">Biens personnalis&eacute;s :</strong> les articles
                  confectionn&eacute;s sur mesure ou personnalis&eacute;s selon vos indications
                  (gravure, impression, coupe sp&eacute;cifique, etc.) ne sont pas &eacute;ligibles
                  au retour, sauf en cas de d&eacute;faut de conformit&eacute; ou de vice cach&eacute;.
                </li>
                <li>
                  <strong className="text-gray-800">Produits d&rsquo;hygi&egrave;ne scell&eacute;s :</strong>
                  les produits d&rsquo;hygi&egrave;ne corporelle ou de soins qui ont &eacute;t&eacute;
                  d&eacute;ball&eacute;s apr&egrave;s livraison et dont le scell&eacute; a &eacute;t&eacute;
                  rompu ne peuvent &ecirc;tre retourn&eacute;s pour des raisons de s&eacute;curit&eacute;
                  sanitaire.
                </li>
                <li>
                  <strong className="text-gray-800">Biens p&eacute;rissables :</strong> les denr&eacute;es
                  alimentaires, les produits frais, les cosm&eacute;tiques &agrave; dur&eacute;e de vie
                  limit&eacute;e ou tout bien susceptible de se d&eacute;t&eacute;riorer rapidement ne
                  sont pas repris dans le cadre du droit de r&eacute;tractation.
                </li>
                <li>
                  <strong className="text-gray-800">Enregistrements audio ou vid&eacute;o et logiciels
                  d&eacute;scell&eacute;s :</strong> les supports d&eacute;j&agrave; d&eacute;scell&eacute;s
                  par le consommateur apr&egrave;s livraison.
                </li>
                <li>
                  <strong className="text-gray-800">Journaux, p&eacute;riodiques et magazines :</strong>
                  sauf en cas d&rsquo;abonnement.
                </li>
                <li>
                  <strong className="text-gray-800">Biens livr&eacute;s sous scell&eacute;s non
                  susceptibles d&rsquo;&ecirc;tre renvoy&eacute;s pour des raisons de protection
                  de la sant&eacute; ou d&rsquo;hygi&egrave;ne</strong> et qui ont &eacute;t&eacute;
                  d&eacute;scell&eacute;s par le consommateur apr&egrave;s livraison.
                </li>
              </ul>
              <p>
                Si vous avez un doute sur l&rsquo;&eacute;ligibilit&eacute; de votre article au retour,
                n&rsquo;h&eacute;sitez pas &agrave; contacter notre service client avant de renvoyer
                votre produit.
              </p>
            </div>
          </section>

          {/* Section 4 — Procédure de retour */}
          <section className="border-b border-gray-100 pb-6 mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              4. Proc&eacute;dure de retour
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed space-y-4">
              <p>
                Voici les &eacute;tapes &agrave; suivre pour effectuer un retour dans les meilleures
                conditions :
              </p>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Contactez notre service client par e-mail</p>
                    <p>
                      Envoyez un e-mail &agrave; notre adresse de contact (voir section &laquo; Contact &raquo;)
                      en indiquant votre num&eacute;ro de commande, la r&eacute;f&eacute;rence du ou des
                      articles que vous souhaitez retourner, ainsi que la raison du retour. Joignez si
                      possible une ou plusieurs photos claires de l&rsquo;article, ce qui acc&eacute;l&eacute;rera
                      le traitement de votre demande.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Recevez votre autorisation de retour</p>
                    <p>
                      Notre service client &eacute;tudiera votre demande et vous r&eacute;pondra dans un
                      d&eacute;lai de 24 &agrave; 48 heures ouvr&eacute;es. Si votre retour est accept&eacute;,
                      vous recevrez un num&eacute;ro d&rsquo;autorisation de retour (RMA) ainsi que
                      l&rsquo;adresse exacte o&ugrave; exp&eacute;dier le colis. Ce num&eacute;ro RMA
                      doit &ecirc;tre inscrit de mani&egrave;re bien visible sur l&rsquo;ext&eacute;rieur
                      de votre colis. Aucun retour ne sera trait&eacute; sans num&eacute;ro d&rsquo;autorisation
                      pr&eacute;alable.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Exp&eacute;diez l&rsquo;article</p>
                    <p>
                      Emballez soigneusement l&rsquo;article dans son emballage d&rsquo;origine, ins&eacute;rez
                      le document d&rsquo;accompagnement fourni avec votre num&eacute;ro RMA, et exp&eacute;diez
                      le colis &agrave; l&rsquo;adresse indiqu&eacute;e. Utilisez un mode d&rsquo;envoi avec
                      suivi et conservez votre preuve d&rsquo;exp&eacute;dition. N&rsquo;oubliez pas
                      d&rsquo;exp&eacute;dier le colis dans un d&eacute;lai de 14 jours &agrave; compter de
                      la r&eacute;ception de votre autorisation de retour.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Inspection de l&rsquo;article</p>
                    <p>
                      D&egrave;s r&eacute;ception de votre colis, notre &eacute;quipe proc&eacute;dera
                      &agrave; l&rsquo;inspection de l&rsquo;article retourn&eacute;. Nous v&eacute;rifierons
                      que le produit est conforme aux conditions de retour d&eacute;crites &agrave; la
                      section 2 (non utilis&eacute;, emballage d&rsquo;origine, &eacute;tiquettes en place,
                      etc.). Ce processus d&rsquo;inspection est g&eacute;n&eacute;ralement effectu&eacute;
                      sous 2 &agrave; 3 jours ouvr&eacute;s &agrave; compter de la r&eacute;ception du colis.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">5</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">Remboursement</p>
                    <p>
                      Si l&rsquo;article est accept&eacute; lors de l&rsquo;inspection, le remboursement
                      sera initi&eacute; dans un d&eacute;lai de 14 jours conform&eacute;ment &agrave; la
                      l&eacute;gislation en vigueur (voir section 5 pour plus de d&eacute;tails). En cas
                      de non-conformit&eacute; aux conditions de retour, nous vous contacterons pour vous
                      en expliquer les raisons. L&rsquo;article pourra alors vous &ecirc;tre renvoy&eacute;
                      &agrave; vos frais, ou une proposition de remboursement partiel pourra &ecirc;tre
                      formul&eacute;e si vous l&rsquo;acceptez.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 — Remboursement */}
          <section className="border-b border-gray-100 pb-6 mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              5. Remboursement
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              <p>
                Conform&eacute;ment aux dispositions de l&rsquo;article L.&nbsp;221-24 du Code de la
                consommation, nous proc&eacute;derons au remboursement de l&rsquo;int&eacute;gralit&eacute;
                des sommes vers&eacute;es, y compris les frais de livraison initiaux (sauf si vous avez
                express&eacute;ment choisi un mode de livraison plus co&ucirc;teux que le mode de livraison
                standard propos&eacute;), dans un d&eacute;lai de <strong className="text-gray-800">14 jours
                calendaires</strong> &agrave; compter de la date &agrave; laquelle nous recevrons les
                biens retourn&eacute;s ou, le cas &eacute;ch&eacute;ant, de la date &agrave; laquelle vous
                fournissez une preuve de leur exp&eacute;dition.
              </p>
              <p>
                Le remboursement sera effectu&eacute; en utilisant le <strong className="text-gray-800">m&ecirc;me
                moyen de paiement</strong> que celui utilis&eacute; lors de la commande. Par exemple, si
                vous avez r&eacute;gl&eacute; par carte bancaire via Stripe, le remboursement sera
                cr&eacute;dit&eacute; sur la m&ecirc;me carte bancaire. Le d&eacute;lai d&rsquo;apparition
                du remboursement sur votre relev&eacute; d&eacute;pend de votre &eacute;tablissement
                bancaire et peut varier de 3 &agrave; 10 jours ouvr&eacute;s apr&egrave;s notre
                &eacute;mission.
              </p>
              <p>
                Conform&eacute;ment &agrave; la loi, <strong className="text-gray-800">aucun frais ne peut
                &ecirc;tre factur&eacute; au consommateur au titre du remboursement</strong>. Nous ne
                pr&eacute;l&egrave;verons donc aucun frais de dossier ni de traitement li&eacute; &agrave;
                l&rsquo;op&eacute;ration de remboursement.
              </p>
              <p>
                Le remboursement des frais de livraison initiaux ne sera pas effectu&eacute; si vous
                avez choisi un mode de livraison sp&eacute;cifique et on&eacute;reux diff&eacute;rent
                du mode de livraison standard le moins co&ucirc;teux propos&eacute; par notre boutique.
                Dans ce cas, seuls les frais du mode standard seront rembours&eacute;s.
              </p>
            </div>
          </section>

          {/* Section 6 — Échanges */}
          <section className="border-b border-gray-100 pb-6 mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              6. &Eacute;changes
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              <p>
                Contrairement au droit de r&eacute;tractation, le droit d&rsquo;&eacute;change n&rsquo;est
                pas automatiquement garanti par la l&eacute;gislation en vigueur. Toutefois, nous
                mettons tout en &oelig;uvre pour faciliter les &eacute;changes lorsque cela est possible.
              </p>
              <p>
                Si vous souhaitez &eacute;changer un article contre une taille diff&eacute;rente, une
                couleur diff&eacute;rente ou tout autre r&eacute;f&eacute;rence, veuillez contacter notre
                service client par e-mail en pr&eacute;cisant la r&eacute;f&eacute;rence souhait&eacute;e
                en &eacute;change. Nous v&eacute;rifierons la disponibilit&eacute; du produit dans le
                d&eacute;lai le plus court.
              </p>
              <p>
                Si le produit souhait&eacute; est en stock, nous organiserons l&rsquo;&eacute;change selon
                l&rsquo;une des modalit&eacute;s suivantes :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-gray-800">&Eacute;change avec renvoi pr&eacute;alable :</strong>
                  vous nous retournez d&rsquo;abord l&rsquo;article initial, et d&egrave;s r&eacute;ception
                  et validation, nous exp&eacute;dions le nouvel article.
                </li>
                <li>
                  <strong className="text-gray-800">&Eacute;change simultan&eacute; :</strong> dans certains
                  cas et sous r&eacute;serve de disponibilit&eacute;, nous pouvons exp&eacute;dier le nouvel
                  article avant r&eacute;ception du retour. Un pr&eacute;levement ou une autorisation de
                  carte bancaire pourra alors &ecirc;tre demand&eacute; &agrave; titre de caution, qui sera
                  annul&eacute; d&egrave;s r&eacute;ception de l&rsquo;article retourn&eacute; en bon &eacute;tat.
                </li>
              </ul>
              <p>
                Si le produit souhait&eacute; n&rsquo;est pas en stock, nous vous proposerons un
                remboursement ou, le cas &eacute;ch&eacute;ant, une mise en attente de votre demande
                jusqu&rsquo;&agrave; r&eacute;approvisionnement. Les frais d&rsquo;exp&eacute;diction de
                l&rsquo;article de remplacement sont &agrave; la charge du client, sauf dans le cas d&rsquo;un
                article d&eacute;fectueux ou non conforme.
              </p>
            </div>
          </section>

          {/* Section 7 — Articles défectueux */}
          <section className="border-b border-gray-100 pb-6 mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              7. Articles d&eacute;fectueux — Garantie de conformit&eacute;
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              <p>
                En compl&eacute;ment du droit de r&eacute;tractation, vous b&eacute;n&eacute;ficiez de la
                garantie l&eacute;gale de conformit&eacute; pr&eacute;vue aux articles L.&nbsp;217-4
                &agrave; L.&nbsp;217-12 du Code de la consommation. Cette garantie s&rsquo;applique
                pendant une dur&eacute;e de <strong className="text-gray-800">deux ans</strong> &agrave;
                compter de la d&eacute;livrance du bien et couvre tous les d&eacute;fauts de conformit&eacute;
                existant au moment de la livraison.
              </p>
              <p>
                Un produit est consid&eacute;r&eacute; comme non conforme s&rsquo;il ne correspond pas &agrave;
                la description donn&eacute;e sur notre site, s&rsquo;il ne pr&eacute;sente pas les
                caract&eacute;ristiques annonc&eacute;es, s&rsquo;il n&rsquo;est pas apte &agrave; l&rsquo;usage
                habituellement attendu d&rsquo;un bien similaire, ou s&rsquo;il ne pr&eacute;sente pas les
                qualit&eacute;s qu&rsquo;un acheteur peut l&eacute;gitimement attendre eu &eacute;gard aux
                d&eacute;clarations publiques faites par le vendeur ou le producteur.
              </p>
              <p>
                <strong className="text-gray-800">Que faire en cas de produit d&eacute;fectueux ?</strong>
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Contactez-nous dans les plus brefs d&eacute;lais par e-mail en d&eacute;crivant le
                  d&eacute;faut constat&eacute; et en joignant des photos claires et d&eacute;taill&eacute;es
                  du probl&egrave;me. Pr&eacute;cisez votre num&eacute;ro de commande et la date &agrave;
                  laquelle le d&eacute;faut est apparu.
                </li>
                <li>
                  <strong className="text-gray-800">Frais de retour gratuits :</strong> contrairement aux
                  retours exerc&eacute;s dans le cadre du droit de r&eacute;tractation, les frais de
                  retour pour un article d&eacute;fectueux ou non conforme sont int&eacute;gralement
                  &agrave; notre charge. Nous vous fournirons une &eacute;tiquette de retour pr&eacute;pay&eacute;e
                  ou nous organiserons l&rsquo;enl&egrave;vement du produit selon les modalit&eacute;s les
                  plus adapt&eacute;es.
                </li>
              </ul>
              <p>
                <strong className="text-gray-800">Solutions propos&eacute;es :</strong> en cas de
                d&eacute;faut de conformit&eacute;, vous pouvez choisir entre :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  La <strong className="text-gray-800">r&eacute;paration</strong> du produit, effectu&eacute;e
                  gratuitement dans un d&eacute;lai raisonnable.
                </li>
                <li>
                  Le <strong className="text-gray-800">remplacement</strong> du produit par un produit
                  identique ou &eacute;quivalent, sans frais suppl&eacute;mentaires.
                </li>
                <li>
                  Le <strong className="text-gray-800">remboursement</strong> int&eacute;gral du produit
                  (et des frais de livraison associ&eacute;s) si la r&eacute;paration ou le remplacement
                  ne peut &ecirc;tre effectu&eacute; dans un d&eacute;lai raisonnable ou sans
                  inconv&eacute;nient majeur pour vous.
                </li>
              </ul>
              <p>
                Si le d&eacute;faut de conformit&eacute; survient dans les 24 mois suivant la d&eacute;livrance
                du bien, il est pr&eacute;sum&eacute; exister au moment de la d&eacute;livrance, sauf preuve
                contraire. Le vendeur ne peut invoquer cette pr&eacute;somption que si le bien &eacute;tait
                un bien d&rsquo;occasion. Cette garantie l&eacute;gale s&rsquo;applique ind&eacute;pendamment
                de toute garantie commerciale propos&eacute;e par le fabricant ou le vendeur.
              </p>
            </div>
          </section>

          {/* Section 8 — Contact */}
          <section className="pb-8">
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              8. Contact
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              <p>
                Pour toute question relative &agrave; un retour, une r&eacute;tractation, un &eacute;change
                ou un produit d&eacute;fectueux, notre service client est &agrave; votre disposition
                pour vous accompagner dans toutes les d&eacute;marches.
              </p>
              <div className="bg-white border border-gray-200/60 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">E-mail</p>
                    <p className="text-sm font-medium text-gray-900">contact@e-icossys.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">D&eacute;lai de r&eacute;ponse</p>
                    <p className="text-sm font-medium text-gray-900">24 &agrave; 48 heures ouvr&eacute;es</p>
                  </div>
                </div>
              </div>
              <p>
                Nous nous engageons &agrave; r&eacute;pondre &agrave; toute demande dans un d&eacute;lai
                de <strong className="text-gray-800">24 &agrave; 48 heures ouvr&eacute;es</strong>. Lors
                des p&eacute;riodes de forte activit&eacute; (soldes, f&ecirc;tes), ce d&eacute;lai
                pourra &ecirc;tre l&eacute;g&egrave;rement &eacute;tendu. Pour un traitement plus rapide,
                veuillez toujours indiquer votre num&eacute;ro de commande dans l&rsquo;objet de votre
                e-mail et joindre des photos si votre demande concerne un article d&eacute;fectueux.
              </p>
            </div>
          </section>
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