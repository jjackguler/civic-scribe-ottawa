import { HUBS, type Hub } from "../hubs";

export const HUB: Hub = {
  ...HUBS.find(h => h.slug === "use-ai-assistants-safely")!,
  dek: {
    en: "AI assistants are useful every day, and a few habits make them much safer. Here is what never to share, the privacy settings worth changing, how to check answers, and how to recognise the scams that now use AI.",
    fr: "Les assistants IA sont utiles au quotidien, et quelques réflexes les rendent beaucoup plus sûrs. Voici ce qu'il ne faut jamais partager, les réglages de confidentialité à changer, comment vérifier les réponses et comment reconnaître les arnaques qui utilisent maintenant l'IA.",
  },
  sections: [
    {
      id: "rules",
      h: { en: "The seven rules", fr: "Les sept règles" },
      blocks: [
        { k: "ol", items: [
          { en: "**Share the minimum.** Leave out names, addresses, account numbers, health details and anything about other people that they haven't agreed to share.", fr: "**Partagez le minimum.** Laissez de côté les noms, adresses, numéros de compte, détails de santé et tout ce qui concerne d'autres personnes sans leur accord." },
          { en: "**Check what matters.** Health, money, legal, safety and anything you will publish or act on: verify it against an official or expert source.", fr: "**Vérifiez ce qui compte.** Santé, argent, droit, sécurité et tout ce que vous publierez ou sur quoi vous agirez : vérifiez auprès d'une source officielle ou d'un expert." },
          { en: "**Ask for sources, then open them.** A citation you haven't read is not a source.", fr: "**Demandez les sources, puis ouvrez-les.** Une référence que vous n'avez pas lue n'est pas une source." },
          { en: "**Set your privacy controls once.** Decide whether your chats can be used for training, and turn on temporary chats for sensitive topics.", fr: "**Réglez votre confidentialité une fois pour toutes.** Décidez si vos conversations peuvent servir à l'entraînement, et utilisez les conversations temporaires pour les sujets délicats." },
          { en: "**Keep a human in charge of actions.** Don't let an assistant or [agent](/glossary/ai-agent) send, buy, sign or delete anything without your confirmation.", fr: "**Gardez un humain aux commandes.** Ne laissez pas un assistant ou un [agent](/glossary/ai-agent) envoyer, acheter, signer ou supprimer quoi que ce soit sans votre confirmation." },
          { en: "**Be open about AI help.** At school and at work, follow the rules and say where you used AI.", fr: "**Soyez transparent sur l'aide de l'IA.** À l'école et au travail, suivez les règles et dites où vous avez utilisé l'IA." },
          { en: "**Never trust a voice or video alone for money.** Scammers clone voices and faces. Hang up and call back on a number you know.", fr: "**Ne vous fiez jamais à une voix ou à une vidéo seule quand il est question d'argent.** Les fraudeurs clonent les voix et les visages. Raccrochez et rappelez à un numéro connu." },
        ] },
      ],
    },
    {
      id: "never-share",
      h: { en: "What never to paste into a chatbot", fr: "Ce qu'il ne faut jamais coller dans un robot conversationnel" },
      blocks: [
        { k: "p", t: {
          en: "Anything you type may be stored on the company's servers, reviewed by staff for safety, kept for a period after you delete it, and — depending on your settings — used to train future models. Treat a chatbot like a helpful stranger, not a vault.",
          fr: "Tout ce que vous tapez peut être conservé sur les serveurs de l'entreprise, examiné par du personnel pour des raisons de sécurité, gardé un certain temps après la suppression et — selon vos réglages — utilisé pour entraîner de futurs modèles. Traitez un robot conversationnel comme un inconnu serviable, pas comme un coffre-fort.",
        } },
        { k: "table", caption: { en: "Information to keep out of AI chats, and safer alternatives", fr: "Renseignements à garder hors des conversations avec une IA, et solutions plus sûres" },
          head: [{ en: "Don't paste", fr: "Ne collez pas" }, { en: "Why", fr: "Pourquoi" }, { en: "Do this instead", fr: "Faites plutôt ceci" }],
          rows: [
            [{ en: "SIN, passport, driver's licence, health card numbers", fr: "NAS, numéros de passeport, de permis de conduire, de carte santé" }, { en: "Identity theft if leaked", fr: "Vol d'identité en cas de fuite" }, { en: "Replace with \"[ID number]\"", fr: "Remplacez par « [numéro] »" }],
            [{ en: "Passwords, PINs, banking logins, card numbers", fr: "Mots de passe, NIP, accès bancaires, numéros de carte" }, { en: "Direct financial risk", fr: "Risque financier direct" }, { en: "Never needed — leave them out", fr: "Jamais nécessaires — laissez-les de côté" }],
            [{ en: "Medical records, test results with your name", fr: "Dossiers médicaux, résultats d'analyses nominatifs" }, { en: "Highly sensitive; hard to retract", fr: "Très délicat; difficile à retirer" }, { en: "Describe the question without identifiers; ask your clinician", fr: "Décrivez la question sans identifiants; consultez votre clinicien" }],
            [{ en: "Other people's private details (clients, students, patients, family)", fr: "Renseignements privés d'autrui (clients, élèves, patients, famille)" }, { en: "Not yours to share; may break privacy law or professional rules", fr: "Ce n'est pas à vous de les partager; peut enfreindre la loi ou des règles professionnelles" }, { en: "Anonymise: \"a client in her 40s\"", fr: "Anonymisez : « une cliente dans la quarantaine »" }],
            [{ en: "Confidential work documents, contracts, source code", fr: "Documents de travail confidentiels, contrats, code source" }, { en: "May breach your employer's policy or an NDA", fr: "Peut contrevenir à la politique de l'employeur ou à une entente de confidentialité" }, { en: "Use the tool your employer approved, under its business terms", fr: "Utilisez l'outil approuvé par l'employeur, selon ses conditions d'entreprise" }],
            [{ en: "Photos of children or of IDs, or screenshots with names visible", fr: "Photos d'enfants ou de pièces d'identité, captures d'écran avec des noms" }, { en: "Faces and documents are among the most sensitive data", fr: "Les visages et les documents comptent parmi les données les plus délicates" }, { en: "Crop or blur first, or describe in words", fr: "Recadrez ou floutez d'abord, ou décrivez en mots" }],
          ] },
      ],
    },
    {
      id: "settings",
      h: { en: "Privacy settings to check", fr: "Les réglages de confidentialité à vérifier" },
      blocks: [
        { k: "p", t: {
          en: "Every major assistant lets you control some of what happens to your chats. Names and menus change often, so look for these kinds of controls in Settings (names as of our October 2026 review):",
          fr: "Chaque grand assistant vous permet de contrôler une partie de ce qu'il advient de vos conversations. Les noms et menus changent souvent; cherchez ce genre de réglages dans les Paramètres (noms selon notre revue d'octobre 2026) :",
        } },
        { k: "table", caption: { en: "Where to find the main privacy controls", fr: "Où trouver les principaux réglages de confidentialité" },
          head: [{ en: "Control", fr: "Réglage" }, { en: "What it does", fr: "Ce qu'il fait" }, { en: "Usually found as", fr: "Se trouve généralement sous" }],
          rows: [
            [{ en: "Training on your chats", fr: "Entraînement sur vos conversations" }, { en: "Decides whether your conversations can be used to improve future models", fr: "Détermine si vos conversations peuvent servir à améliorer de futurs modèles" }, { en: "ChatGPT: Data controls → \"Improve the model for everyone\". Claude: Privacy → \"Help improve Claude\". Gemini: \"Gemini Apps Activity\" / \"Keep Activity\". Copilot: Privacy → model training", fr: "ChatGPT : Contrôles des données → « Améliorer le modèle pour tous ». Claude : Confidentialité → « Aider à améliorer Claude ». Gemini : « Activité dans les applis Gemini » / « Conserver l'activité ». Copilot : Confidentialité → entraînement du modèle" }],
            [{ en: "Temporary or incognito chat", fr: "Conversation temporaire ou privée" }, { en: "A chat that isn't saved to your history or used for memory or training", fr: "Une conversation qui n'est pas enregistrée dans l'historique ni utilisée pour la mémoire ou l'entraînement" }, { en: "A \"temporary\", \"incognito\" or ghost icon when starting a new chat", fr: "Une icône « temporaire », « privée » ou de fantôme au début d'une nouvelle conversation" }],
            [{ en: "Memory", fr: "Mémoire" }, { en: "Lets the assistant remember facts about you across chats", fr: "Permet à l'assistant de retenir des faits sur vous d'une conversation à l'autre" }, { en: "Settings → Personalisation / Memory: view, delete or turn off", fr: "Paramètres → Personnalisation / Mémoire : consulter, effacer ou désactiver" }],
            [{ en: "Connected apps", fr: "Applications connectées" }, { en: "Access to your email, calendar, files or other tools", fr: "Accès à vos courriels, agenda, fichiers ou autres outils" }, { en: "Settings → Connectors / Apps / Extensions: remove what you don't use", fr: "Paramètres → Connecteurs / Applications / Extensions : retirez ce que vous n'utilisez pas" }],
            [{ en: "Delete and export", fr: "Supprimer et exporter" }, { en: "Remove old chats or download a copy of your data", fr: "Supprimer d'anciennes conversations ou télécharger une copie de vos données" }, { en: "Settings → Data / Account", fr: "Paramètres → Données / Compte" }],
          ] },
        { k: "tip", label: { en: "Good to know", fr: "Bon à savoir" }, t: {
          en: "Even with training switched off, companies usually keep chats for a limited time to detect abuse, and safety staff may review flagged conversations. Business and education plans generally offer stronger guarantees — that's why employers prefer them.",
          fr: "Même avec l'entraînement désactivé, les entreprises gardent généralement les conversations un certain temps pour détecter les abus, et du personnel de sécurité peut examiner les conversations signalées. Les forfaits entreprise et éducation offrent généralement de meilleures garanties — c'est pourquoi les employeurs les préfèrent.",
        } },
      ],
    },
    {
      id: "check",
      h: { en: "Check before you trust", fr: "Vérifier avant de se fier" },
      blocks: [
        { k: "p", t: {
          en: "Assistants write fluently whether they are right or wrong. [Hallucinations](/glossary/hallucination) are most likely with specific facts: names, numbers, dates, quotes, laws, prices and references.",
          fr: "Les assistants écrivent avec aisance, qu'ils aient raison ou tort. Les [hallucinations](/glossary/hallucination) sont plus probables avec les faits précis : noms, chiffres, dates, citations, lois, prix et références.",
        } },
        { k: "ol", items: [
          { en: "Ask: \"What are your sources? Which parts are you less sure about?\"", fr: "Demandez : « Quelles sont tes sources? De quelles parties es-tu moins sûr? »" },
          { en: "Open every source it gives and check that it says what was claimed.", fr: "Ouvrez chaque source fournie et vérifiez qu'elle dit bien ce qui est affirmé." },
          { en: "For anything official — taxes, benefits, immigration, health — go to the government or professional body's own page.", fr: "Pour tout ce qui est officiel — impôts, prestations, immigration, santé — allez sur la page du gouvernement ou de l'ordre professionnel." },
          { en: "Read laterally: search the claim in a new tab and see what trusted outlets say.", fr: "Lisez latéralement : cherchez l'affirmation dans un nouvel onglet et voyez ce qu'en disent des médias fiables." },
          { en: "Ask the assistant to argue the opposite. Weak answers often fall apart.", fr: "Demandez à l'assistant de défendre l'inverse. Les réponses faibles s'effondrent souvent." },
        ] },
        { k: "tip", label: { en: "Medical and mental health", fr: "Santé physique et mentale" }, t: {
          en: "AI can help you prepare questions for a doctor, but it is not a clinician. If you or someone you know is in crisis, call or text 9-8-8 (Suicide Crisis Helpline, Canada) or call 911.",
          fr: "L'IA peut vous aider à préparer vos questions pour un médecin, mais ce n'est pas un clinicien. Si vous ou un proche êtes en crise, appelez ou textez le 9-8-8 (Ligne d'aide en cas de crise de suicide, Canada) ou composez le 911.",
        } },
      ],
    },
    {
      id: "scams",
      h: { en: "Scams that use AI", fr: "Les arnaques qui utilisent l'IA" },
      blocks: [
        { k: "ul", items: [
          { en: "**Voice-clone emergencies.** A call in a loved one's [cloned voice](/glossary/voice-cloning) asks for money urgently. Agree on a family code word; hang up and call back.", fr: "**Les fausses urgences à voix clonée.** Un appel avec la [voix clonée](/glossary/voice-cloning) d'un proche réclame de l'argent d'urgence. Convenez d'un mot de passe familial; raccrochez et rappelez." },
          { en: "**Deepfake investment ads.** Videos of celebrities or politicians \"endorsing\" trading platforms or crypto. Real public figures don't sell investments in social-media ads.", fr: "**Les publicités de placement truquées.** Des vidéos de vedettes ou de politiciens qui « recommandent » des plateformes de placement ou de cryptomonnaie. Les vraies personnalités ne vendent pas de placements dans des pubs sur les réseaux sociaux." },
          { en: "**Polished phishing.** AI removes the spelling mistakes that used to give scams away. Check the sender's address and never log in from a link in a message.", fr: "**L'hameçonnage soigné.** L'IA élimine les fautes qui trahissaient autrefois les arnaques. Vérifiez l'adresse de l'expéditeur et ne vous connectez jamais à partir d'un lien reçu." },
          { en: "**Fake AI apps.** Look-alike \"ChatGPT\" or \"Gemini\" apps that charge subscriptions or steal data. Download only from the company's official site or verified store listing.", fr: "**Les fausses applications d'IA.** Des imitations de « ChatGPT » ou « Gemini » qui facturent des abonnements ou volent des données. Téléchargez seulement depuis le site officiel ou la fiche vérifiée du magasin." },
        ] },
        { k: "p", t: {
          en: "If you've been targeted, stop contact, call your bank, and report it to the [Canadian Anti-Fraud Centre](https://antifraudcentre-centreantifraude.ca/) (1-888-495-8501) and your local police.",
          fr: "Si vous êtes ciblé, coupez le contact, appelez votre banque et signalez-le au [Centre antifraude du Canada](https://antifraudcentre-centreantifraude.ca/) (1-888-495-8501) et à votre police locale.",
        } },
      ],
    },
    {
      id: "kids",
      h: { en: "Children and teens", fr: "Les enfants et les adolescents" },
      blocks: [
        { k: "p", t: {
          en: "Check each service's minimum age before a young person signs up: Claude.ai requires users to be 18; ChatGPT requires 13 and a parent's permission under 18; other services vary and change. Talk about AI the way you talk about the internet: what it's good for, what to keep private, and that it can be wrong.",
          fr: "Vérifiez l'âge minimal de chaque service avant qu'un jeune s'inscrive : Claude.ai exige 18 ans; ChatGPT exige 13 ans et la permission d'un parent avant 18 ans; les autres services varient et changent. Parlez de l'IA comme d'Internet : à quoi elle sert, ce qu'il faut garder privé, et qu'elle peut se tromper.",
        } },
        { k: "p", t: {
          en: "For ages 8 to 17, our [Young Lab](/labs/young) teaches how AI works through games that collect nothing and have no open chatbot. Parents and teachers have their own [guide](/labs/young/grown-ups).",
          fr: "Pour les 8 à 17 ans, notre [Jeune Labo](/labs/young) enseigne le fonctionnement de l'IA au moyen de jeux qui ne recueillent rien et n'ont aucun robot conversationnel ouvert. Les parents et enseignants ont leur propre [guide](/labs/young/grown-ups).",
        } },
      ],
    },
    {
      id: "work",
      h: { en: "At work", fr: "Au travail" },
      blocks: [
        { k: "ul", items: [
          { en: "Use the AI tools your employer has approved, signed in with your work account. Business plans usually exclude your data from training.", fr: "Utilisez les outils d'IA approuvés par votre employeur, avec votre compte de travail. Les forfaits entreprise excluent généralement vos données de l'entraînement." },
          { en: "Never paste client, patient or student information into a personal account.", fr: "Ne collez jamais de renseignements sur des clients, patients ou élèves dans un compte personnel." },
          { en: "You remain responsible for what you send. Review every AI draft as if you wrote it.", fr: "Vous restez responsable de ce que vous envoyez. Révisez chaque ébauche d'IA comme si vous l'aviez écrite." },
          { en: "If there's no policy yet, ask for one — our [small-business guide](/guides/ai-for-small-business#policy) has a one-page template.", fr: "S'il n'y a pas encore de politique, demandez-en une — notre [guide pour les PME](/guides/ai-for-small-business#policy) propose un modèle d'une page." },
        ] },
      ],
    },
    {
      id: "wellbeing",
      h: { en: "Your wellbeing", fr: "Votre bien-être" },
      blocks: [
        { k: "p", t: {
          en: "Chatbots are designed to be agreeable and always available, which can make them feel like a friend. Use them as a tool, keep real people close, and be careful about leaning on an AI for emotional support or major life decisions. If a conversation leaves you feeling worse, step away.",
          fr: "Les robots conversationnels sont conçus pour être agréables et toujours disponibles, ce qui peut leur donner l'air d'un ami. Servez-vous-en comme d'un outil, gardez des gens réels près de vous et méfiez-vous de compter sur une IA pour du soutien émotionnel ou de grandes décisions. Si une conversation vous laisse plus mal, éloignez-vous.",
        } },
      ],
    },
  ],
  faq: [
    {
      q: { en: "Is ChatGPT safe to use?", fr: "ChatGPT est-il sécuritaire?" },
      a: { en: "For everyday tasks, yes, if you keep personal and confidential information out, check important facts, and review your privacy settings. The same applies to Claude, Gemini, Copilot and other assistants.", fr: "Pour les tâches courantes, oui, si vous n'y mettez pas de renseignements personnels ou confidentiels, vérifiez les faits importants et révisez vos réglages de confidentialité. C'est la même chose pour Claude, Gemini, Copilot et les autres assistants." },
    },
    {
      q: { en: "Do AI companies read my chats?", fr: "Les entreprises d'IA lisent-elles mes conversations?" },
      a: { en: "Automated systems scan chats for abuse, and trained staff may review a small number, especially flagged ones. Depending on your settings, chats may also be used to train models. Turning off training and using temporary chats reduces this.", fr: "Des systèmes automatisés examinent les conversations pour détecter les abus, et du personnel formé peut en lire un petit nombre, surtout celles qui sont signalées. Selon vos réglages, elles peuvent aussi servir à l'entraînement. Désactiver l'entraînement et utiliser les conversations temporaires réduit cela." },
    },
    {
      q: { en: "Can I delete what I've shared?", fr: "Puis-je supprimer ce que j'ai partagé?" },
      a: { en: "You can delete chats from your history, and they are then removed from the company's systems after a retention period. Data already used to train a model can't practically be removed from it, which is why it's best not to share sensitive information in the first place.", fr: "Vous pouvez supprimer des conversations de votre historique; elles sont ensuite retirées des systèmes de l'entreprise après une période de conservation. Des données déjà utilisées pour entraîner un modèle ne peuvent pratiquement pas en être retirées : mieux vaut donc ne pas partager de renseignements délicats." },
    },
    {
      q: { en: "Which AI assistant is the most private?", fr: "Quel assistant IA est le plus respectueux de la vie privée?" },
      a: { en: "It depends on settings and plan more than brand. Business and education plans with training off are generally the most protective; an open-weight model running on your own device keeps data entirely local.", fr: "Cela dépend davantage des réglages et du forfait que de la marque. Les forfaits entreprise et éducation avec l'entraînement désactivé sont généralement les plus protecteurs; un modèle à poids ouverts qui tourne sur votre appareil garde les données entièrement locales." },
    },
    {
      q: { en: "How do I report an AI scam in Canada?", fr: "Comment signaler une arnaque à l'IA au Canada?" },
      a: { en: "Contact your bank first if money is involved, then report to the Canadian Anti-Fraud Centre (1-888-495-8501 or its online system) and your local police. Report fake ads to the platform that showed them.", fr: "Communiquez d'abord avec votre banque si de l'argent est en jeu, puis signalez l'arnaque au Centre antifraude du Canada (1-888-495-8501 ou son système en ligne) et à votre police locale. Signalez les fausses publicités à la plateforme qui les a diffusées." },
    },
  ],
  terms: ["hallucination", "prompt", "ai-memory", "data-retention", "voice-cloning", "deepfake", "prompt-injection", "personal-information"],
  labs: ["assistants", "safety"],
  sources: [
    { name: { en: "Canadian Anti-Fraud Centre", fr: "Centre antifraude du Canada" }, url: "https://antifraudcentre-centreantifraude.ca/" },
    { name: { en: "Get Cyber Safe (Government of Canada)", fr: "Pensez cybersécurité (gouvernement du Canada)" }, url: { en: "https://www.getcybersafe.gc.ca/en", fr: "https://www.pensezcybersecurite.gc.ca/fr" } },
    { name: { en: "Office of the Privacy Commissioner of Canada", fr: "Commissariat à la protection de la vie privée du Canada" }, url: { en: "https://www.priv.gc.ca/en/", fr: "https://www.priv.gc.ca/fr/" } },
    { name: { en: "9-8-8 Suicide Crisis Helpline", fr: "9-8-8 Ligne d'aide en cas de crise de suicide" }, url: "https://988.ca/" },
  ],
};
