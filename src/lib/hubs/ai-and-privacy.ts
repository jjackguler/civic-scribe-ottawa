import { HUBS, type Hub } from "../hubs";

export const HUB: Hub = {
  ...HUBS.find(h => h.slug === "ai-and-privacy")!,
  dek: {
    en: "AI runs on data, and some of it is about you. Here is where your information goes when you use AI, which Canadian and Québec laws protect it, the rights you can use, and the practical steps — for individuals and for organisations.",
    fr: "L'IA carbure aux données, et certaines vous concernent. Voici où vont vos renseignements quand vous utilisez l'IA, les lois canadiennes et québécoises qui les protègent, les droits que vous pouvez exercer et les mesures concrètes — pour les particuliers et les organisations.",
  },
  sections: [
    {
      id: "short-answer",
      h: { en: "The short answer", fr: "La réponse courte" },
      blocks: [
        { k: "ul", items: [
          { en: "**What you type into an AI tool leaves your device.** It is stored by the provider, may be reviewed for safety, and may be used for training unless you opt out.", fr: "**Ce que vous tapez dans un outil d'IA quitte votre appareil.** Le fournisseur le conserve, peut l'examiner pour des raisons de sécurité et peut s'en servir pour l'entraînement à moins que vous ne refusiez." },
          { en: "**Canadian privacy law applies to AI.** Organisations need a valid reason and, usually, your consent to collect and use your personal information — including to train or run AI.", fr: "**Les lois canadiennes sur la vie privée s'appliquent à l'IA.** Les organisations doivent avoir une raison valable et, en général, votre consentement pour recueillir et utiliser vos renseignements personnels — y compris pour entraîner ou faire tourner une IA." },
          { en: "**You have rights.** You can ask what an organisation holds about you, correct it, withdraw consent and complain to a privacy commissioner.", fr: "**Vous avez des droits.** Vous pouvez demander ce qu'une organisation détient sur vous, le faire corriger, retirer votre consentement et porter plainte à un commissaire à la vie privée." },
          { en: "**Small habits protect you most.** Share less, change a few settings, and think twice about photos and voice.", fr: "**De petits réflexes vous protègent le plus.** Partagez moins, changez quelques réglages et réfléchissez à deux fois avant de partager photos et voix." },
        ] },
      ],
    },
    {
      id: "data-flow",
      h: { en: "Where your data goes when you use AI", fr: "Où vont vos données quand vous utilisez l'IA" },
      blocks: [
        { k: "ol", items: [
          { en: "**Your device** sends your prompt, files, photos or voice to the provider's servers — often in the United States — unless the model runs locally.", fr: "**Votre appareil** envoie votre requête, vos fichiers, photos ou votre voix aux serveurs du fournisseur — souvent aux États-Unis — à moins que le modèle ne tourne localement." },
          { en: "**The provider stores it** with your account, for a period set by its [retention policy](/glossary/data-retention), even after you delete a chat.", fr: "**Le fournisseur le conserve** avec votre compte, pendant une période fixée par sa [politique de conservation](/glossary/data-retention), même après la suppression d'une conversation." },
          { en: "**Automated systems and sometimes people review it** to detect abuse and improve safety.", fr: "**Des systèmes automatisés, et parfois des personnes, l'examinent** pour détecter les abus et améliorer la sécurité." },
          { en: "**It may train future models**, depending on your settings and plan. Data used in training can't practically be removed later.", fr: "**Il peut entraîner de futurs modèles**, selon vos réglages et votre forfait. Des données qui ont servi à l'entraînement ne peuvent pratiquement plus être retirées." },
          { en: "**Connected apps and plug-ins** may receive it too, under their own policies.", fr: "**Les applications et extensions connectées** peuvent aussi le recevoir, selon leurs propres politiques." },
          { en: "**AI features in other apps** — email, photo, office suites — often send content to an AI provider behind the scenes; their privacy policies should name who.", fr: "**Les fonctions d'IA d'autres applications** — courriel, photos, suites bureautiques — envoient souvent du contenu à un fournisseur d'IA en coulisse; leurs politiques de confidentialité devraient le nommer." },
        ] },
      ],
    },
    {
      id: "laws",
      h: { en: "The laws that protect you", fr: "Les lois qui vous protègent" },
      blocks: [
        { k: "p", t: {
          en: "Canada has several privacy laws, depending on who holds your information and where. None is specific to AI, but all of them apply to it.",
          fr: "Le Canada compte plusieurs lois sur la vie privée, selon qui détient vos renseignements et où. Aucune n'est propre à l'IA, mais toutes s'y appliquent.",
        } },
        { k: "table", caption: { en: "Main privacy laws in Canada and who enforces them", fr: "Principales lois sur la vie privée au Canada et qui les applique" },
          head: [{ en: "Law", fr: "Loi" }, { en: "Covers", fr: "S'applique à" }, { en: "Regulator", fr: "Organisme de surveillance" }],
          rows: [
            [{ en: "[PIPEDA](/glossary/pipeda)", fr: "[LPRPDE](/glossary/pipeda)" }, { en: "Private-sector businesses' commercial activities, except where a similar provincial law applies; federally regulated businesses everywhere", fr: "Les activités commerciales du secteur privé, sauf là où une loi provinciale semblable s'applique; les entreprises fédérales partout" }, { en: "Office of the Privacy Commissioner of Canada", fr: "Commissariat à la protection de la vie privée du Canada" }],
            [{ en: "Québec's private-sector act, modernised by [Law 25](/glossary/law-25)", fr: "Loi québécoise sur le secteur privé, modernisée par la [Loi 25](/glossary/law-25)" }, { en: "Businesses in Québec", fr: "Les entreprises au Québec" }, { en: "Commission d'accès à l'information", fr: "Commission d'accès à l'information" }],
            [{ en: "Alberta and British Columbia PIPA", fr: "PIPA de l'Alberta et de la Colombie-Britannique" }, { en: "Private-sector organisations in those provinces", fr: "Les organisations privées de ces provinces" }, { en: "Provincial information and privacy commissioners", fr: "Commissaires provinciaux à l'information et à la vie privée" }],
            [{ en: "Privacy Act", fr: "Loi sur la protection des renseignements personnels" }, { en: "Federal government departments and agencies", fr: "Les ministères et organismes fédéraux" }, { en: "Office of the Privacy Commissioner of Canada", fr: "Commissariat à la protection de la vie privée du Canada" }],
            [{ en: "Provincial public-sector and health privacy laws", fr: "Lois provinciales sur le secteur public et la santé" }, { en: "Provincial governments, municipalities, schools, hospitals", fr: "Gouvernements provinciaux, municipalités, écoles, hôpitaux" }, { en: "Provincial commissioners and ombudspersons", fr: "Commissaires et protecteurs du citoyen provinciaux" }],
          ] },
        { k: "p", t: {
          en: "Québec's Law 25 goes furthest: organisations must name a person in charge of protecting personal information, assess privacy risks before new projects and before sending data outside Québec, report serious incidents, keep tracking technologies off by default, and tell you when a decision about you is made solely by automated means.",
          fr: "La Loi 25 du Québec va le plus loin : les organisations doivent désigner une personne responsable de la protection des renseignements personnels, évaluer les risques avant de nouveaux projets et avant de communiquer des données à l'extérieur du Québec, déclarer les incidents graves, désactiver par défaut les technologies de suivi et vous informer quand une décision vous concernant est prise exclusivement par traitement automatisé.",
        } },
      ],
    },
    {
      id: "rights",
      h: { en: "Your rights, and how to use them", fr: "Vos droits, et comment les exercer" },
      blocks: [
        { k: "ul", items: [
          { en: "**Access.** Ask an organisation what personal information it holds about you and how it's used. Under PIPEDA it generally must answer within 30 days.", fr: "**L'accès.** Demandez à une organisation quels renseignements personnels elle détient sur vous et comment elle les utilise. En vertu de la LPRPDE, elle doit généralement répondre dans les 30 jours." },
          { en: "**Correction.** Ask for inaccurate information to be fixed.", fr: "**La rectification.** Demandez que des renseignements inexacts soient corrigés." },
          { en: "**Withdraw consent.** You can withdraw consent for many uses, subject to legal or contractual limits — including, with many AI providers, use of your chats for training.", fr: "**Le retrait du consentement.** Vous pouvez retirer votre consentement pour bien des usages, sous réserve de limites légales ou contractuelles — y compris, chez beaucoup de fournisseurs d'IA, l'usage de vos conversations pour l'entraînement." },
          { en: "**Automated decisions (Québec).** Be told when a decision was automated, learn the main factors, and have it reviewed by a person.", fr: "**Les décisions automatisées (Québec).** Être informé qu'une décision a été automatisée, en connaître les principaux facteurs et la faire réviser par une personne." },
          { en: "**Portability and de-indexing (Québec).** Get your data in a usable format, and ask that information about you stop being disseminated or indexed in some circumstances.", fr: "**La portabilité et la désindexation (Québec).** Obtenir vos données dans un format utilisable et, dans certaines circonstances, demander que des renseignements vous concernant cessent d'être diffusés ou indexés." },
          { en: "**Complain.** If an organisation doesn't respond or you think your rights were breached, complain to the relevant commissioner. It's free.", fr: "**Porter plainte.** Si une organisation ne répond pas ou si vous croyez vos droits bafoués, adressez-vous au commissaire compétent. C'est gratuit." },
        ] },
        { k: "tip", label: { en: "A request you can copy", fr: "Une demande à copier" }, t: {
          en: "\"Under applicable privacy law, I request access to the personal information you hold about me, the purposes for which it is used, whether it has been used to train or operate AI systems, and the third parties to whom it has been disclosed. Please reply within 30 days.\"",
          fr: "« En vertu de la loi applicable sur la protection des renseignements personnels, je demande l'accès aux renseignements personnels que vous détenez à mon sujet, aux fins de leur utilisation, à savoir s'ils ont servi à entraîner ou à exploiter des systèmes d'IA, et à la liste des tiers à qui ils ont été communiqués. Veuillez répondre dans les 30 jours. »",
        } },
      ],
    },
    {
      id: "steps",
      h: { en: "Ten steps you can take today", fr: "Dix gestes à faire dès aujourd'hui" },
      blocks: [
        { k: "ol", items: [
          { en: "Turn off training on your chats in each AI assistant you use (see [where to find it](/guides/use-ai-assistants-safely#settings)).", fr: "Désactivez l'entraînement sur vos conversations dans chaque assistant IA que vous utilisez (voir [où le trouver](/guides/use-ai-assistants-safely#settings))." },
          { en: "Use temporary or incognito chats for health, money, legal or family questions.", fr: "Utilisez les conversations temporaires ou privées pour les questions de santé, d'argent, de droit ou de famille." },
          { en: "Review and prune what the assistant's [memory](/glossary/ai-memory) has stored about you.", fr: "Révisez et élaguez ce que la [mémoire](/glossary/ai-memory) de l'assistant a retenu sur vous." },
          { en: "Replace names and numbers with placeholders before pasting documents.", fr: "Remplacez les noms et numéros par des marqueurs avant de coller des documents." },
          { en: "Crop or blur faces, licence plates, addresses and ID cards before uploading photos.", fr: "Recadrez ou floutez visages, plaques, adresses et pièces d'identité avant de téléverser des photos." },
          { en: "Remove connected apps and plug-ins you no longer use.", fr: "Retirez les applications et extensions connectées dont vous ne vous servez plus." },
          { en: "Be cautious with voice features: a few seconds of audio can be enough to [clone a voice](/glossary/voice-cloning).", fr: "Soyez prudent avec les fonctions vocales : quelques secondes d'audio peuvent suffire à [cloner une voix](/glossary/voice-cloning)." },
          { en: "Check the privacy settings of AI features built into your phone, email and photo apps.", fr: "Vérifiez les réglages de confidentialité des fonctions d'IA intégrées à votre téléphone, votre courriel et vos photos." },
          { en: "Set your social-media profiles to limit public posts and photos being scraped.", fr: "Réglez vos profils de réseaux sociaux pour limiter la collecte de vos publications et photos publiques." },
          { en: "Talk with your kids about what not to share with chatbots and apps.", fr: "Parlez avec vos enfants de ce qu'il ne faut pas partager avec les robots et les applications." },
        ] },
      ],
    },
    {
      id: "public-spaces",
      h: { en: "AI in public spaces and at work", fr: "L'IA dans les lieux publics et au travail" },
      blocks: [
        { k: "p", t: {
          en: "[Facial recognition](/glossary/facial-recognition) and other biometric tools raise the highest privacy stakes, because you can't change your face. In 2021 Canada's privacy commissioners found that Clearview AI's mass collection of online photos was illegal in Canada, and the federal commissioner found the RCMP broke the law by using it. Employers, too, must keep employee monitoring reasonable and transparent; in Ontario, employers with 25 or more staff need a written electronic monitoring policy. See [AI and jobs in Canada](/guides/ai-and-jobs-in-canada#rights).",
          fr: "La [reconnaissance faciale](/glossary/facial-recognition) et d'autres outils biométriques posent les plus grands enjeux de vie privée, puisqu'on ne peut pas changer de visage. En 2021, les commissaires canadiens à la protection de la vie privée ont conclu que la collecte massive de photos en ligne par Clearview AI était illégale au Canada, et le commissaire fédéral a conclu que la GRC avait enfreint la loi en l'utilisant. Les employeurs, eux aussi, doivent garder la surveillance des employés raisonnable et transparente; en Ontario, ceux qui ont 25 employés ou plus doivent avoir une politique écrite de surveillance électronique. Voir [L'IA et l'emploi au Canada](/guides/ai-and-jobs-in-canada#rights).",
        } },
      ],
    },
    {
      id: "organisations",
      h: { en: "For organisations: a privacy checklist for AI projects", fr: "Pour les organisations : une liste de contrôle pour les projets d'IA" },
      blocks: [
        { k: "ol", items: [
          { en: "**Know your data.** List what personal information the AI will see, from whom, and why it's needed.", fr: "**Connaissez vos données.** Dressez la liste des renseignements personnels que l'IA verra, de qui ils proviennent et pourquoi ils sont nécessaires." },
          { en: "**Assess the risk first.** Do a privacy impact assessment — required in Québec for new technology projects involving personal information and before transferring it outside the province.", fr: "**Évaluez d'abord le risque.** Faites une évaluation des facteurs relatifs à la vie privée — obligatoire au Québec pour les nouveaux projets technologiques touchant des renseignements personnels et avant de les communiquer à l'extérieur de la province." },
          { en: "**Read the vendor's terms.** Confirm in writing that your data won't train their models, where it's stored, how long it's kept and who can access it.", fr: "**Lisez les conditions du fournisseur.** Faites confirmer par écrit que vos données n'entraîneront pas ses modèles, où elles sont stockées, combien de temps elles sont gardées et qui y a accès." },
          { en: "**Get meaningful consent** where needed, and update your privacy policy to name AI uses and providers.", fr: "**Obtenez un consentement valable** au besoin, et mettez à jour votre politique de confidentialité pour nommer les usages et fournisseurs d'IA." },
          { en: "**Minimise and de-identify.** Send the AI only what it needs; strip identifiers when you can.", fr: "**Minimisez et dépersonnalisez.** N'envoyez à l'IA que ce dont elle a besoin; retirez les identifiants quand c'est possible." },
          { en: "**Keep humans accountable** for decisions about people, and be ready to explain them.", fr: "**Gardez des humains responsables** des décisions qui touchent des personnes, et soyez prêts à les expliquer." },
          { en: "**Plan for incidents.** Know how you'd detect, record and report a breach involving an AI tool.", fr: "**Prévoyez les incidents.** Sachez comment vous détecteriez, consigneriez et déclareriez une atteinte impliquant un outil d'IA." },
          { en: "**Name an owner.** Someone must be responsible for privacy — in Québec this is a legal requirement.", fr: "**Nommez un responsable.** Quelqu'un doit répondre de la protection des renseignements — au Québec, c'est une obligation légale." },
        ] },
        { k: "p", t: {
          en: "Small businesses can start with our [practical guide to AI for small business](/guides/ai-for-small-business).",
          fr: "Les petites entreprises peuvent commencer par notre [guide pratique de l'IA pour les PME](/guides/ai-for-small-business).",
        } },
      ],
    },
    {
      id: "us",
      h: { en: "How AI Broadsheet handles your privacy", fr: "Comment AI Broadsheet protège votre vie privée" },
      blocks: [
        { k: "p", t: {
          en: "We practise what we report. You can read everything without an account; our analytics are cookieless; ads are non-personalised unless you agree; Young Lab collects nothing about children. Details are on our [privacy page](/privacy).",
          fr: "Nous appliquons ce que nous rapportons. Vous pouvez tout lire sans compte; notre mesure d'audience n'utilise pas de témoins; les annonces ne sont pas personnalisées sans votre accord; le Jeune Labo ne recueille rien sur les enfants. Les détails se trouvent sur notre [page de confidentialité](/privacy).",
        } },
      ],
    },
  ],
  faq: [
    {
      q: { en: "Does ChatGPT or Claude use my conversations for training?", fr: "ChatGPT ou Claude utilisent-ils mes conversations pour l'entraînement?" },
      a: { en: "On consumer plans, your chats may be used to improve models unless you turn that off in settings; each company sets its own defaults and they change over time. Business and education plans generally exclude your data from training by default.", fr: "Avec les forfaits grand public, vos conversations peuvent servir à améliorer les modèles à moins que vous ne désactiviez cette option; chaque entreprise fixe ses propres réglages par défaut, qui changent avec le temps. Les forfaits entreprise et éducation excluent généralement vos données de l'entraînement par défaut." },
    },
    {
      q: { en: "Is it legal for AI companies to train on my public posts?", fr: "Est-il légal pour les entreprises d'IA d'entraîner leurs modèles sur mes publications publiques?" },
      a: { en: "It's contested. Canadian privacy regulators have said that publicly accessible personal information is not free for any use, and scraping can breach privacy law. Courts and regulators in several countries are examining the question. You can limit exposure through your platform settings.", fr: "C'est contesté. Les autorités canadiennes de protection de la vie privée ont indiqué que des renseignements personnels accessibles au public ne sont pas libres de tout usage, et que le moissonnage peut enfreindre la loi. Des tribunaux et régulateurs de plusieurs pays examinent la question. Vous pouvez limiter l'exposition au moyen des réglages de vos plateformes." },
    },
    {
      q: { en: "What is Law 25 and does it apply to me?", fr: "Qu'est-ce que la Loi 25 et s'applique-t-elle à moi?" },
      a: { en: "Law 25 modernised Québec's privacy law. It protects people whose information is held by businesses operating in Québec, and it applies to any organisation that collects personal information in the course of business there, wherever it is based.", fr: "La Loi 25 a modernisé la loi québécoise sur la protection des renseignements personnels. Elle protège les personnes dont les renseignements sont détenus par des entreprises exerçant au Québec, et s'applique à toute organisation qui recueille des renseignements personnels dans le cadre d'activités commerciales au Québec, où qu'elle soit établie." },
    },
    {
      q: { en: "How do I complain about an AI company's use of my data?", fr: "Comment porter plainte contre l'usage de mes données par une entreprise d'IA?" },
      a: { en: "First write to the company's privacy officer. If you're not satisfied, file a free complaint with the Office of the Privacy Commissioner of Canada, or with the Commission d'accès à l'information if you're in Québec, or your provincial commissioner in Alberta or British Columbia.", fr: "Écrivez d'abord au responsable de la protection des renseignements de l'entreprise. Si la réponse ne vous satisfait pas, déposez une plainte gratuite au Commissariat à la protection de la vie privée du Canada, ou à la Commission d'accès à l'information si vous êtes au Québec, ou au commissaire provincial en Alberta ou en Colombie-Britannique." },
    },
  ],
  terms: ["personal-information", "pipeda", "law-25", "data-retention", "ai-memory", "facial-recognition", "automated-decision-making", "training-data"],
  labs: ["safety", "assistants"],
  sources: [
    { name: { en: "Office of the Privacy Commissioner of Canada", fr: "Commissariat à la protection de la vie privée du Canada" }, url: { en: "https://www.priv.gc.ca/en/", fr: "https://www.priv.gc.ca/fr/" } },
    { name: { en: "Commission d'accès à l'information du Québec", fr: "Commission d'accès à l'information du Québec" }, url: "https://www.cai.gouv.qc.ca/" },
    { name: { en: "Office of the Information and Privacy Commissioner of Alberta", fr: "Commissariat à l'information et à la protection de la vie privée de l'Alberta" }, url: "https://oipc.ab.ca/" },
    { name: { en: "Office of the Information and Privacy Commissioner for British Columbia", fr: "Commissariat à l'information et à la protection de la vie privée de la Colombie-Britannique" }, url: "https://www.oipc.bc.ca/" },
  ],
};
