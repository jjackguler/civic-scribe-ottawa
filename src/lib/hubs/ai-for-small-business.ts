import { HUBS, type Hub } from "../hubs";

export const HUB: Hub = {
  ...HUBS.find(h => h.slug === "ai-for-small-business")!,
  dek: {
    en: "You don't need a data scientist to get value from AI. Here is where it saves a small business time first, what it really costs, a 30-day plan, a one-page AI policy you can adapt, and the Canadian rules on privacy, French and advertising to keep in mind.",
    fr: "Pas besoin d'un scientifique des données pour tirer profit de l'IA. Voici où elle fait d'abord gagner du temps à une PME, ce qu'elle coûte vraiment, un plan de 30 jours, une politique d'une page à adapter et les règles canadiennes à garder en tête sur la vie privée, le français et la publicité.",
  },
  sections: [
    {
      id: "short-answer",
      h: { en: "The short answer", fr: "La réponse courte" },
      blocks: [
        { k: "ul", items: [
          { en: "**Start with writing and admin.** Emails, quotes, job posts, social posts, meeting notes and FAQs are where most small businesses save hours first.", fr: "**Commencez par la rédaction et l'administration.** Courriels, soumissions, offres d'emploi, publications, notes de réunion et FAQ : c'est là que la plupart des PME gagnent d'abord des heures." },
          { en: "**Keep a person on anything customers see.** AI drafts; you approve.", fr: "**Gardez une personne sur tout ce que voient les clients.** L'IA ébauche; vous approuvez." },
          { en: "**Protect customer data.** Use business plans, not personal accounts, and never paste what you wouldn't email to a stranger.", fr: "**Protégez les données des clients.** Utilisez des forfaits entreprise, pas des comptes personnels, et ne collez jamais ce que vous n'enverriez pas à un inconnu." },
          { en: "**Write it down.** A one-page AI policy prevents most problems.", fr: "**Mettez-le par écrit.** Une politique d'une page sur l'IA prévient la plupart des problèmes." },
        ] },
        { k: "p", t: {
          en: "You're not late. Statistics Canada's business surveys found that about one in eight Canadian businesses used AI to produce goods or deliver services in mid-2025 — roughly double the year before, but still a minority, and less common among the smallest firms.",
          fr: "Vous n'êtes pas en retard. Selon les enquêtes de Statistique Canada, environ une entreprise canadienne sur huit utilisait l'IA pour produire des biens ou offrir des services à la mi-2025 — environ le double de l'année précédente, mais encore une minorité, et moins fréquent dans les plus petites entreprises.",
        } },
      ],
    },
    {
      id: "where",
      h: { en: "Where AI pays off first", fr: "Là où l'IA rapporte d'abord" },
      blocks: [
        { k: "table", caption: { en: "Common small-business tasks, the kind of AI tool that helps, and the risk level", fr: "Tâches courantes en PME, le type d'outil d'IA utile et le niveau de risque" },
          head: [{ en: "Task", fr: "Tâche" }, { en: "Tool", fr: "Outil" }, { en: "Risk", fr: "Risque" }, { en: "Human check", fr: "Vérification humaine" }],
          rows: [
            [{ en: "Drafting emails, quotes and proposals", fr: "Rédiger courriels, soumissions et propositions" }, { en: "AI assistant", fr: "Assistant IA" }, { en: "Low", fr: "Faible" }, { en: "Read before sending; check prices and dates", fr: "Relire avant l'envoi; vérifier prix et dates" }],
            [{ en: "Social posts, newsletters, product descriptions", fr: "Publications, infolettres, descriptions de produits" }, { en: "AI assistant, image generator", fr: "Assistant IA, générateur d'images" }, { en: "Low–medium", fr: "Faible à moyen" }, { en: "Check claims are true; label AI images where it matters", fr: "Vérifier que les affirmations sont vraies; identifier les images d'IA au besoin" }],
            [{ en: "Meeting notes and summaries", fr: "Notes et résumés de réunions" }, { en: "Transcription built into video-call tools", fr: "Transcription intégrée aux outils de visioconférence" }, { en: "Medium", fr: "Moyen" }, { en: "Tell participants; check names and decisions", fr: "Prévenir les participants; vérifier noms et décisions" }],
            [{ en: "Bookkeeping categories, invoice data entry", fr: "Catégories comptables, saisie de factures" }, { en: "AI features in accounting software", fr: "Fonctions d'IA du logiciel comptable" }, { en: "Medium", fr: "Moyen" }, { en: "Review before filing; your accountant signs off", fr: "Réviser avant de produire; votre comptable approuve" }],
            [{ en: "Translation EN↔FR", fr: "Traduction FR↔EN" }, { en: "AI assistant or translation tool", fr: "Assistant IA ou outil de traduction" }, { en: "Medium", fr: "Moyen" }, { en: "Have a fluent speaker review anything public or legal", fr: "Faire réviser par une personne qui maîtrise la langue tout ce qui est public ou juridique" }],
            [{ en: "Customer-service chatbot on your website", fr: "Robot de service à la clientèle sur votre site" }, { en: "Chatbot platform with your FAQ", fr: "Plateforme de robot avec votre FAQ" }, { en: "Higher", fr: "Plus élevé" }, { en: "Limit to your own information; easy handoff to a person", fr: "Limiter à vos propres renseignements; transfert facile vers une personne" }],
            [{ en: "Screening job applicants", fr: "Trier les candidatures" }, { en: "Applicant-tracking software with AI", fr: "Logiciel de suivi des candidatures avec IA" }, { en: "High", fr: "Élevé" }, { en: "Check for bias; disclose use (required in Ontario for 25+ staff)", fr: "Vérifier les biais; déclarer l'usage (obligatoire en Ontario à 25 employés et plus)" }],
          ] },
      ],
    },
    {
      id: "plan",
      h: { en: "A 30-day plan", fr: "Un plan de 30 jours" },
      blocks: [
        { k: "h3", t: { en: "Week 1: pick and set up", fr: "Semaine 1 : choisir et configurer" } },
        { k: "ul", items: [
          { en: "Choose one assistant on a business plan (or the AI already in your office suite). Turn off training on your data and turn on two-factor sign-in.", fr: "Choisissez un assistant avec forfait entreprise (ou l'IA déjà incluse dans votre suite bureautique). Désactivez l'entraînement sur vos données et activez la connexion à deux facteurs." },
          { en: "Write down three tasks that eat your week.", fr: "Notez trois tâches qui grugent votre semaine." },
        ] },
        { k: "h3", t: { en: "Week 2: try your three tasks", fr: "Semaine 2 : essayer vos trois tâches" } },
        { k: "ul", items: [
          { en: "Give context, goal and format: \"I run a two-person landscaping company in Gatineau. Draft a friendly reminder for clients about spring cleanup booking, in French and English, under 80 words each.\"", fr: "Donnez contexte, objectif et format : « J'ai une entreprise d'aménagement paysager de deux personnes à Gatineau. Rédige un rappel amical aux clients pour réserver le nettoyage printanier, en français et en anglais, moins de 80 mots chacun. »" },
          { en: "Save the prompts that work as templates.", fr: "Conservez les requêtes qui fonctionnent comme gabarits." },
        ] },
        { k: "h3", t: { en: "Week 3: write your policy and train the team", fr: "Semaine 3 : rédiger votre politique et former l'équipe" } },
        { k: "ul", items: [
          { en: "Adapt the one-page policy below. Walk the team through it in 20 minutes.", fr: "Adaptez la politique d'une page ci-dessous. Présentez-la à l'équipe en 20 minutes." },
          { en: "Point staff to free training: the [AI at work Labs path](/labs/work) and our guide [AI for small business: five first steps](/learn/small-business-first-steps).", fr: "Orientez le personnel vers de la formation gratuite : le [parcours Labs L'IA au travail](/labs/work) et notre guide [L'IA pour les petites entreprises : cinq premiers pas](/learn/small-business-first-steps)." },
        ] },
        { k: "h3", t: { en: "Week 4: measure and decide", fr: "Semaine 4 : mesurer et décider" } },
        { k: "ul", items: [
          { en: "Estimate hours saved per week and any mistakes caught. Keep what works; drop what doesn't.", fr: "Estimez les heures gagnées par semaine et les erreurs repérées. Gardez ce qui marche; laissez tomber le reste." },
          { en: "Only then consider customer-facing AI or paid add-ons.", fr: "Seulement ensuite, envisagez une IA en contact avec les clients ou des modules payants." },
        ] },
      ],
    },
    {
      id: "costs",
      h: { en: "What it costs", fr: "Ce que ça coûte" },
      blocks: [
        { k: "ul", items: [
          { en: "**Free plans** are fine for trying things, but usually allow your data to be used for training and lack admin controls.", fr: "**Les versions gratuites** suffisent pour essayer, mais permettent généralement l'usage de vos données pour l'entraînement et n'ont pas de contrôles d'administration." },
          { en: "**Business plans** for the main assistants typically cost roughly $25 to $45 per user per month in Canadian dollars, depending on the tool and exchange rate; some office suites now include AI in standard plans.", fr: "**Les forfaits entreprise** des principaux assistants coûtent généralement d'environ 25 $ à 45 $ par utilisateur par mois en dollars canadiens, selon l'outil et le taux de change; certaines suites bureautiques incluent maintenant l'IA dans leurs forfaits de base." },
          { en: "**Pay-per-use APIs** suit custom tools; costs depend on volume and are billed per [token](/glossary/token).", fr: "**Les API payées à l'usage** conviennent aux outils sur mesure; les coûts dépendent du volume et sont facturés au [jeton](/glossary/token)." },
          { en: "**Hidden costs:** time to learn, time to review output, and fixing mistakes that slip through. Budget for them.", fr: "**Coûts cachés :** le temps d'apprentissage, le temps de révision et la correction des erreurs qui passent. Prévoyez-les." },
        ] },
        { k: "p", t: {
          en: "Government programs can help pay for adoption, training and advice. We keep a checked list on our [funding page](/funding) and a guide to [finding AI funding](/learn/find-ai-funding).",
          fr: "Des programmes gouvernementaux peuvent aider à payer l'adoption, la formation et les conseils. Nous tenons une liste vérifiée sur notre [page de financement](/funding) et un guide pour [trouver du financement en IA](/learn/find-ai-funding).",
        } },
      ],
    },
    {
      id: "choosing",
      h: { en: "Choosing a tool: ten questions to ask", fr: "Choisir un outil : dix questions à poser" },
      blocks: [
        { k: "ol", items: [
          { en: "Will our data be used to train your models? Can we turn that off by default?", fr: "Nos données serviront-elles à entraîner vos modèles? Peut-on le désactiver par défaut?" },
          { en: "Where is our data stored and processed? Is a Canadian region available?", fr: "Où nos données sont-elles stockées et traitées? Une région canadienne est-elle offerte?" },
          { en: "How long do you keep it, and can we delete it?", fr: "Combien de temps les gardez-vous, et pouvons-nous les supprimer?" },
          { en: "How well does it work in French?", fr: "Fonctionne-t-il bien en français?" },
          { en: "Can we manage users and remove access when someone leaves?", fr: "Peut-on gérer les utilisateurs et retirer l'accès quand quelqu'un part?" },
          { en: "Which AI model does it use, from which company?", fr: "Quel modèle d'IA utilise-t-il, de quelle entreprise?" },
          { en: "What security certifications do you have (for example SOC 2 or ISO 27001)?", fr: "Quelles certifications de sécurité avez-vous (par exemple SOC 2 ou ISO 27001)?" },
          { en: "What happens if your AI gives a customer wrong information?", fr: "Qu'arrive-t-il si votre IA donne une mauvaise information à un client?" },
          { en: "Can we export our data and prompts if we switch?", fr: "Pouvons-nous exporter nos données et requêtes si nous changeons de fournisseur?" },
          { en: "What does it really cost per user after the trial?", fr: "Combien coûte-t-il vraiment par utilisateur après l'essai?" },
        ] },
      ],
    },
    {
      id: "policy",
      h: { en: "A one-page AI policy you can adapt", fr: "Une politique d'une page sur l'IA à adapter" },
      blocks: [
        { k: "p", t: {
          en: "Copy this into a document, replace the brackets, and share it with everyone who works for you. Review it every six months.",
          fr: "Copiez ceci dans un document, remplacez les crochets et transmettez-le à toutes les personnes qui travaillent pour vous. Révisez-le tous les six mois.",
        } },
        { k: "ol", items: [
          { en: "**Approved tools:** [list]. Use them only with your work account.", fr: "**Outils approuvés :** [liste]. Utilisez-les seulement avec votre compte de travail." },
          { en: "**Never enter:** customer or employee personal information, payment data, passwords, or confidential documents — unless the tool is approved for that data.", fr: "**Ne jamais entrer :** de renseignements personnels de clients ou d'employés, de données de paiement, de mots de passe ou de documents confidentiels — à moins que l'outil soit approuvé pour ces données." },
          { en: "**Always review:** a person checks every AI-assisted text, image or number before it reaches a customer, regulator or the public.", fr: "**Toujours réviser :** une personne vérifie tout texte, image ou chiffre produit avec l'IA avant qu'il atteigne un client, un organisme de réglementation ou le public." },
          { en: "**Be honest:** don't present AI images as real photos, don't generate fake reviews or testimonials, and tell customers when they're chatting with a bot.", fr: "**Être honnête :** ne présentez pas des images d'IA comme de vraies photos, ne générez pas de faux avis ou témoignages, et dites aux clients quand ils clavardent avec un robot." },
          { en: "**People decisions stay human:** AI may help organise information, but a person decides on hiring, pay, discipline and dismissal.", fr: "**Les décisions sur les personnes restent humaines :** l'IA peut aider à organiser l'information, mais une personne décide de l'embauche, de la rémunération, de la discipline et du congédiement." },
          { en: "**French first where required:** in Québec, customer-facing communications must be available in French; have AI translations reviewed.", fr: "**Le français d'abord là où c'est exigé :** au Québec, les communications avec la clientèle doivent être offertes en français; faites réviser les traductions de l'IA." },
          { en: "**Report problems:** tell [name] about mistakes, data slips or anything that feels wrong — no blame for reporting.", fr: "**Signaler les problèmes :** informez [nom] des erreurs, des fuites de données ou de tout ce qui cloche — aucun blâme pour un signalement." },
          { en: "**Owner:** [name] keeps this policy and the list of tools up to date.", fr: "**Responsable :** [nom] tient à jour cette politique et la liste des outils." },
        ] },
      ],
    },
    {
      id: "rules",
      h: { en: "Canadian rules to keep in mind", fr: "Les règles canadiennes à garder en tête" },
      blocks: [
        { k: "ul", items: [
          { en: "**Privacy.** PIPEDA, or Québec's [Law 25](/glossary/law-25) and the Alberta and B.C. laws, apply to customer and employee data you put into AI tools. See [AI and privacy](/guides/ai-and-privacy#organisations).", fr: "**La vie privée.** La LPRPDE, ou la [Loi 25](/glossary/law-25) du Québec et les lois de l'Alberta et de la C.-B., s'appliquent aux données de clients et d'employés que vous mettez dans des outils d'IA. Voir [L'IA et la vie privée](/guides/ai-and-privacy#organisations)." },
          { en: "**Your chatbot speaks for you.** In 2024, a British Columbia tribunal held Air Canada responsible for wrong refund information its website chatbot gave a customer. Keep bots to information you've verified.", fr: "**Votre robot parle en votre nom.** En 2024, un tribunal de la Colombie-Britannique a tenu Air Canada responsable des mauvaises informations de remboursement données par le robot de son site. Limitez vos robots à de l'information vérifiée." },
          { en: "**Advertising honesty.** The Competition Act prohibits false or misleading claims — including fake reviews and exaggerated claims about your own \"AI-powered\" products ([AI washing](/glossary/ai-washing)).", fr: "**L'honnêteté publicitaire.** La Loi sur la concurrence interdit les indications fausses ou trompeuses — y compris les faux avis et les affirmations exagérées sur vos propres produits « propulsés par l'IA » ([survente de l'IA](/glossary/ai-washing))." },
          { en: "**French in Québec.** The Charter of the French Language requires commercial communications, websites and contracts with Québec customers to be available in French. AI translation is a start, not a substitute for review.", fr: "**Le français au Québec.** La Charte de la langue française exige que les communications commerciales, les sites Web et les contrats avec la clientèle québécoise soient offerts en français. La traduction par IA est un point de départ, pas un substitut à la révision." },
          { en: "**Hiring.** Human-rights law applies to AI screening tools, and Ontario requires disclosure of AI use in public job postings for employers with 25 or more employees. See [AI and jobs in Canada](/guides/ai-and-jobs-in-canada#rights).", fr: "**L'embauche.** Les lois sur les droits de la personne s'appliquent aux outils de tri par IA, et l'Ontario exige que les employeurs de 25 employés ou plus déclarent l'usage de l'IA dans leurs offres d'emploi publiques. Voir [L'IA et l'emploi au Canada](/guides/ai-and-jobs-in-canada#rights)." },
          { en: "**Copyright.** Check the licence before using AI images or text commercially, and don't imitate a competitor's branding or a living artist's style.", fr: "**Le droit d'auteur.** Vérifiez la licence avant d'utiliser commercialement des images ou des textes d'IA, et n'imitez pas l'image de marque d'un concurrent ni le style d'un artiste vivant." },
        ] },
      ],
    },
  ],
  faq: [
    {
      q: { en: "What's the best AI tool for a small business?", fr: "Quel est le meilleur outil d'IA pour une PME?" },
      a: { en: "For most, a general AI assistant on a business plan (ChatGPT, Claude, Gemini or Copilot), or the AI already built into the office suite you use. Pick based on privacy terms, French quality and the software you already own, then add specialised tools only for a clear need.", fr: "Pour la plupart, un assistant IA polyvalent avec forfait entreprise (ChatGPT, Claude, Gemini ou Copilot), ou l'IA déjà intégrée à votre suite bureautique. Choisissez selon les conditions de confidentialité, la qualité du français et les logiciels que vous possédez déjà, puis ajoutez des outils spécialisés seulement pour un besoin précis." },
    },
    {
      q: { en: "Can I use ChatGPT with customer information?", fr: "Puis-je utiliser ChatGPT avec des renseignements sur mes clients?" },
      a: { en: "Not on a personal or free account. If you need AI to work with customer data, use a business plan whose terms exclude your data from training, minimise what you share, update your privacy policy, and in Québec do a privacy impact assessment first.", fr: "Pas avec un compte personnel ou gratuit. Si l'IA doit traiter des données de clients, utilisez un forfait entreprise dont les conditions excluent vos données de l'entraînement, minimisez ce que vous partagez, mettez à jour votre politique de confidentialité et, au Québec, faites d'abord une évaluation des facteurs relatifs à la vie privée." },
    },
    {
      q: { en: "Do I need to tell customers I use AI?", fr: "Dois-je dire à mes clients que j'utilise l'IA?" },
      a: { en: "There's no general Canadian rule for every use, but you must not mislead customers. Tell them when they're talking to a chatbot, label AI images where it could matter, and in Québec inform people of decisions made solely by automated means.", fr: "Il n'existe pas de règle canadienne générale pour chaque usage, mais vous ne devez pas induire les clients en erreur. Dites-leur quand ils parlent à un robot, identifiez les images d'IA quand cela peut compter et, au Québec, informez les gens des décisions prises exclusivement par traitement automatisé." },
    },
    {
      q: { en: "Is there government funding for AI in small business?", fr: "Existe-t-il du financement public pour l'IA en PME?" },
      a: { en: "Yes, federal and provincial programs support technology adoption, training and advice, though eligibility and intake periods change. Our funding page lists programs checked against official pages, with the date we checked.", fr: "Oui, des programmes fédéraux et provinciaux soutiennent l'adoption technologique, la formation et les conseils, mais l'admissibilité et les périodes de demande changent. Notre page de financement répertorie des programmes vérifiés sur les pages officielles, avec la date de vérification." },
    },
  ],
  terms: ["ai-assistant", "prompt", "personal-information", "ai-washing", "chatbot", "ai-governance", "automation", "law-25"],
  labs: ["work", "assistants"],
  sources: [
    { name: { en: "Statistics Canada", fr: "Statistique Canada" }, url: { en: "https://www.statcan.gc.ca/en/start", fr: "https://www.statcan.gc.ca/fr/debut" } },
    { name: { en: "Office of the Privacy Commissioner of Canada", fr: "Commissariat à la protection de la vie privée du Canada" }, url: { en: "https://www.priv.gc.ca/en/", fr: "https://www.priv.gc.ca/fr/" } },
    { name: { en: "Competition Bureau Canada", fr: "Bureau de la concurrence Canada" }, url: { en: "https://competition-bureau.canada.ca/en", fr: "https://competition-bureau.canada.ca/fr" } },
    { name: { en: "Office québécois de la langue française", fr: "Office québécois de la langue française" }, url: "https://www.oqlf.gouv.qc.ca/" },
    { name: { en: "Canadian Centre for Cyber Security", fr: "Centre canadien pour la cybersécurité" }, url: { en: "https://www.cyber.gc.ca/en", fr: "https://www.cyber.gc.ca/fr" } },
  ],
};
