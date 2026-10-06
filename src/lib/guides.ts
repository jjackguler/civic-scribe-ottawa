import type { Bi } from "./i18n";

export type GuideBlock =
  | { kind: "p"; text: Bi }
  | { kind: "h"; text: Bi }
  | { kind: "list"; items: Bi[] }
  | { kind: "tip"; text: Bi };

export type Guide = {
  slug: string;
  title: Bi;
  dek: Bi;
  minutes: number;
  audience: Bi;
  blocks: GuideBlock[];
};

export const GUIDES: Guide[] = [
  {
    slug: "start-in-30-minutes",
    title: { en: "Start using AI in 30 minutes", fr: "Commencer avec l'IA en 30 minutes" },
    dek: {
      en: "One assistant, three everyday tasks, and the one habit that makes the answers good.",
      fr: "Un assistant, trois tâches du quotidien et l'habitude qui rend les réponses utiles.",
    },
    minutes: 6,
    audience: { en: "Complete beginners", fr: "Grands débutants" },
    blocks: [
      { kind: "h", text: { en: "Pick one assistant and stick with it for a week", fr: "Choisissez un assistant et gardez-le une semaine" } },
      { kind: "p", text: {
        en: "ChatGPT, Claude, Gemini, Copilot and Le Chat all have free plans and all can handle everyday tasks. The difference between them matters far less than practice. Create an account on one, open it on your phone and your computer, and use only that one for a week.",
        fr: "ChatGPT, Claude, Gemini, Copilot et Le Chat ont tous une version gratuite et gèrent bien les tâches courantes. La différence entre eux compte beaucoup moins que la pratique. Créez un compte, ouvrez-le sur votre téléphone et votre ordinateur, et n'utilisez que celui-là pendant une semaine.",
      } },
      { kind: "h", text: { en: "Try these three tasks today", fr: "Essayez ces trois tâches aujourd'hui" } },
      { kind: "list", items: [
        { en: "Paste a long email or letter and ask: \"Summarize this in three bullet points and tell me what I need to do.\"", fr: "Collez un long courriel et demandez : « Résume ceci en trois points et dis-moi ce que je dois faire. »" },
        { en: "Ask it to draft a reply you have been putting off. Tell it the tone you want: friendly, firm, short.", fr: "Demandez un brouillon de réponse que vous repoussez. Précisez le ton : amical, ferme, bref." },
        { en: "Plan something: \"Make a weekly meal plan for two adults on a $120 grocery budget in Ottawa, with a shopping list.\"", fr: "Planifiez : « Fais un menu de la semaine pour deux adultes avec un budget d'épicerie de 120 $, avec une liste d'achats. »" },
      ] },
      { kind: "h", text: { en: "The habit: give context, a goal and a format", fr: "L'habitude : contexte, objectif et format" } },
      { kind: "p", text: {
        en: "Vague questions get vague answers. Tell the assistant who you are, what you want to achieve, and what the result should look like. \"I run a two-person bakery. Write three Instagram captions for our new sourdough, under 30 words each, warm and local\" beats \"write a caption.\"",
        fr: "Une question vague donne une réponse vague. Dites qui vous êtes, ce que vous voulez accomplir et la forme du résultat. « Je tiens une boulangerie de deux personnes. Écris trois légendes Instagram pour notre nouveau pain au levain, moins de 30 mots, ton chaleureux et local » fonctionne mieux que « écris une légende ».",
      } },
      { kind: "tip", text: {
        en: "If the first answer misses, don't start over. Reply with what to change: \"shorter,\" \"less formal,\" \"add prices.\" Conversation is the skill.",
        fr: "Si la première réponse rate la cible, ne recommencez pas. Dites quoi changer : « plus court », « moins formel », « ajoute les prix ». La conversation, c'est la compétence.",
      } },
      { kind: "h", text: { en: "Two rules from day one", fr: "Deux règles dès le premier jour" } },
      { kind: "list", items: [
        { en: "Check anything that matters — numbers, laws, medical or money advice. AI can state wrong things confidently.", fr: "Vérifiez tout ce qui compte — chiffres, lois, conseils médicaux ou financiers. L'IA peut se tromper avec assurance." },
        { en: "Don't paste your SIN, banking details, health records or other people's private information.", fr: "Ne collez jamais votre NAS, vos données bancaires, médicales ou les renseignements privés d'autrui." },
      ] },
    ],
  },
  {
    slug: "use-ai-safely",
    title: { en: "Use AI safely: accuracy, privacy and scams", fr: "Utiliser l'IA en toute sécurité : exactitude, vie privée et fraudes" },
    dek: {
      en: "What AI gets wrong, what not to share, and how to spot a voice-clone or deepfake scam.",
      fr: "Les erreurs de l'IA, ce qu'il ne faut pas partager et comment repérer une arnaque par voix clonée ou hypertrucage.",
    },
    minutes: 5,
    audience: { en: "Everyone", fr: "Tout le monde" },
    blocks: [
      { kind: "h", text: { en: "AI is a fast first draft, not a source", fr: "L'IA fait un brouillon rapide, pas une source" } },
      { kind: "p", text: {
        en: "Chat assistants predict likely-sounding text. Most of the time that is useful; sometimes it invents facts, quotes or links. Treat answers as a starting point and confirm anything important with an official source — a government page, your bank, a professional.",
        fr: "Les assistants prédisent un texte plausible. C'est souvent utile, mais il arrive qu'ils inventent des faits, des citations ou des liens. Prenez la réponse comme point de départ et confirmez tout ce qui est important auprès d'une source officielle.",
      } },
      { kind: "h", text: { en: "What to keep out of chat windows", fr: "Ce qu'il faut garder hors des fenêtres de clavardage" } },
      { kind: "list", items: [
        { en: "Social Insurance Number, passport, driver's licence numbers", fr: "Numéro d'assurance sociale, passeport, permis de conduire" },
        { en: "Passwords, banking and credit card details", fr: "Mots de passe, données bancaires et de carte de crédit" },
        { en: "Health records, and anything about clients or co-workers you don't have permission to share", fr: "Dossiers de santé, et toute information sur des clients ou collègues sans permission" },
      ] },
      { kind: "tip", text: {
        en: "Most assistants have a setting to stop your chats being used for training. Look under Settings → Data controls or Privacy.",
        fr: "La plupart des assistants permettent d'empêcher l'utilisation de vos conversations pour l'entraînement. Cherchez dans Paramètres → Données ou Confidentialité.",
      } },
      { kind: "h", text: { en: "Voice-clone and deepfake scams", fr: "Arnaques par voix clonée et hypertrucages" } },
      { kind: "p", text: {
        en: "Scammers can copy a voice from a short clip and call pretending to be a grandchild, a boss or the bank, asking for urgent money. Agree on a family code word, hang up and call back on a number you already know, and never pay by gift cards or crypto because someone sounds familiar.",
        fr: "Des fraudeurs peuvent copier une voix à partir d'un court extrait et appeler en se faisant passer pour un petit-enfant, un patron ou la banque. Convenez d'un mot de code familial, raccrochez et rappelez un numéro connu, et ne payez jamais en cartes-cadeaux ou en cryptomonnaie.",
      } },
      { kind: "p", text: {
        en: "Report fraud to the Canadian Anti-Fraud Centre at antifraudcentre-centreantifraude.ca or 1-888-495-8501.",
        fr: "Signalez la fraude au Centre antifraude du Canada : antifraudcentre-centreantifraude.ca ou 1-888-495-8501.",
      } },
    ],
  },
  {
    slug: "small-business-first-steps",
    title: { en: "AI for small business: five first steps", fr: "L'IA pour les petites entreprises : cinq premiers pas" },
    dek: {
      en: "Start with one workflow, measure the time saved, and write a one-page policy before you scale.",
      fr: "Commencez par un seul processus, mesurez le temps gagné et rédigez une politique d'une page avant d'aller plus loin.",
    },
    minutes: 7,
    audience: { en: "Owners and managers", fr: "Propriétaires et gestionnaires" },
    blocks: [
      { kind: "h", text: { en: "1. List the work nobody enjoys", fr: "1. Dressez la liste des tâches que personne n'aime" } },
      { kind: "p", text: {
        en: "Spend 15 minutes with your team writing down repetitive tasks: answering the same customer questions, writing quotes, summarizing meetings, translating documents, social posts. These are the best first candidates.",
        fr: "Prenez 15 minutes avec votre équipe pour noter les tâches répétitives : réponses aux mêmes questions, soumissions, comptes rendus, traductions, publications. Ce sont les meilleurs premiers candidats.",
      } },
      { kind: "h", text: { en: "2. Pick one and run a two-week trial", fr: "2. Choisissez-en une et faites un essai de deux semaines" } },
      { kind: "p", text: {
        en: "One workflow, one tool, one owner. Note how long the task took before, and how long it takes with AI including checking the output.",
        fr: "Un processus, un outil, un responsable. Notez la durée de la tâche avant, puis avec l'IA, en incluant la vérification.",
      } },
      { kind: "h", text: { en: "3. Write a one-page AI policy", fr: "3. Rédigez une politique IA d'une page" } },
      { kind: "list", items: [
        { en: "Which tools are approved, and on which accounts", fr: "Quels outils sont approuvés, sur quels comptes" },
        { en: "What data must never be entered (client personal information, financials)", fr: "Quelles données ne doivent jamais être saisies (renseignements clients, données financières)" },
        { en: "Who reviews AI output before it reaches a customer", fr: "Qui révise le résultat avant qu'il n'arrive au client" },
      ] },
      { kind: "h", text: { en: "4. Tell customers when it matters", fr: "4. Informez vos clients quand c'est important" } },
      { kind: "p", text: {
        en: "If a chatbot answers customers or AI makes decisions that affect them, say so plainly. Canada's privacy law already applies to personal information you feed into AI tools.",
        fr: "Si un robot conversationnel répond aux clients ou si l'IA prend des décisions qui les touchent, dites-le clairement. La loi canadienne sur la protection des renseignements personnels s'applique déjà aux données que vous fournissez aux outils d'IA.",
      } },
      { kind: "h", text: { en: "5. Look for help paying for it", fr: "5. Cherchez de l'aide pour le financer" } },
      { kind: "p", text: {
        en: "Programs such as NRC IRAP and Mitacs AI Advantage exist to help Canadian SMEs adopt AI. See our funding page for who qualifies and how to start.",
        fr: "Des programmes comme le PARI CNRC et Mitacs Avantage IA aident les PME canadiennes à adopter l'IA. Consultez notre page Financement pour savoir qui est admissible.",
      } },
    ],
  },
  {
    slug: "find-ai-funding",
    title: { en: "How to find AI funding in Canada", fr: "Trouver du financement en IA au Canada" },
    dek: {
      en: "Match your situation to the right program, and prepare the three things every application asks for.",
      fr: "Associez votre situation au bon programme et préparez les trois éléments que toute demande exige.",
    },
    minutes: 6,
    audience: { en: "Founders, SMEs, non-profits, students", fr: "Fondateurs, PME, OBNL, étudiants" },
    blocks: [
      { kind: "h", text: { en: "Start from who you are", fr: "Partez de votre situation" } },
      { kind: "list", items: [
        { en: "A small or mid-sized business adopting AI: talk to NRC IRAP, then look at Mitacs AI Advantage to bring in student talent.", fr: "Une PME qui adopte l'IA : parlez au PARI CNRC, puis voyez Mitacs Avantage IA pour accueillir des étudiants." },
        { en: "A start-up building an AI product: your regional development agency (RAII), Scale AI partner accelerators, and the AI Compute Access Fund when it reopens.", fr: "Une jeune pousse qui crée un produit d'IA : votre agence de développement régional (IRIA), les accélérateurs partenaires de Scale AI et le Fonds d'accès au calcul lorsqu'il rouvrira." },
        { en: "A non-profit or municipality: Mitacs AI Advantage accepts non-profits and municipalities as partners.", fr: "Un OBNL ou une municipalité : Mitacs Avantage IA accepte les OBNL et les municipalités comme partenaires." },
        { en: "A student or recent graduate: Mitacs placements and the youth job commitments in the national AI strategy.", fr: "Un étudiant ou diplômé récent : les stages Mitacs et les engagements d'emplois pour les jeunes de la stratégie nationale." },
        { en: "A researcher: CIFAR programs and your university's research office.", fr: "Un chercheur : les programmes du CIFAR et le bureau de la recherche de votre université." },
      ] },
      { kind: "h", text: { en: "Prepare three things before you call anyone", fr: "Préparez trois choses avant tout appel" } },
      { kind: "list", items: [
        { en: "The problem, in two sentences, with a number: \"We spend 20 hours a week answering the same supplier questions.\"", fr: "Le problème, en deux phrases, avec un chiffre : « Nous passons 20 heures par semaine à répondre aux mêmes questions. »" },
        { en: "What you'll build or adopt, and how you'll know it worked.", fr: "Ce que vous allez créer ou adopter, et comment vous saurez que ça marche." },
        { en: "A rough budget and timeline — and how much you can put in yourself, since most programs share costs.", fr: "Un budget et un calendrier approximatifs — et votre propre contribution, car la plupart des programmes partagent les coûts." },
      ] },
      { kind: "tip", text: {
        en: "Programs open and close. Our funding page shows the date each program was last checked against its official page — always confirm there before applying.",
        fr: "Les programmes ouvrent et ferment. Notre page Financement indique la date de la dernière vérification de chaque programme — confirmez toujours sur la page officielle.",
      } },
    ],
  },
  {
    slug: "ai-in-everyday-life",
    title: { en: "What AI can do for your everyday life", fr: "Ce que l'IA peut faire au quotidien" },
    dek: {
      en: "Translation, paperwork, accessibility, learning and job searching — practical uses for people, not just companies.",
      fr: "Traduction, paperasse, accessibilité, apprentissage et recherche d'emploi — des usages concrets pour les gens.",
    },
    minutes: 5,
    audience: { en: "Everyone, including newcomers", fr: "Tout le monde, y compris les nouveaux arrivants" },
    blocks: [
      { kind: "h", text: { en: "Paperwork you don't understand", fr: "La paperasse incompréhensible" } },
      { kind: "p", text: {
        en: "Paste a lease clause, a CRA letter or an insurance policy and ask: \"Explain this in plain language. What do I need to do, and by when?\" Then confirm the deadline on the original document.",
        fr: "Collez une clause de bail, une lettre de l'ARC ou une police d'assurance et demandez : « Explique ceci simplement. Que dois-je faire, et avant quand? » Puis confirmez l'échéance sur le document original.",
      } },
      { kind: "h", text: { en: "English and French, both ways", fr: "L'anglais et le français, dans les deux sens" } },
      { kind: "p", text: {
        en: "Translate messages to a child's school, practise a job interview in your second language, or ask for the polite way to say something. For official documents, use a certified translator.",
        fr: "Traduisez un message pour l'école, pratiquez une entrevue dans votre langue seconde ou demandez la façon polie de dire quelque chose. Pour les documents officiels, faites appel à un traducteur agréé.",
      } },
      { kind: "h", text: { en: "Accessibility", fr: "Accessibilité" } },
      { kind: "p", text: {
        en: "Live captions, read-aloud voices and image descriptions are now built into phones and assistants. They help people with low vision, hearing loss or dyslexia — and anyone in a noisy room.",
        fr: "Sous-titres en direct, lecture à voix haute et description d'images sont intégrés aux téléphones et assistants. Ils aident les personnes malvoyantes, malentendantes ou dyslexiques — et tout le monde dans un endroit bruyant.",
      } },
      { kind: "h", text: { en: "Job searching, honestly", fr: "Chercher un emploi, honnêtement" } },
      { kind: "p", text: {
        en: "Ask AI to compare your résumé with a job posting and point out missing skills, or to role-play interview questions. Keep every claim true — employers check.",
        fr: "Demandez à l'IA de comparer votre CV à une offre et de relever les compétences manquantes, ou de simuler une entrevue. Gardez chaque affirmation vraie — les employeurs vérifient.",
      } },
      { kind: "tip", text: {
        en: "Want to learn more? The national AI strategy commits to free AI training for everyone in Canada; we will list those courses here as they launch.",
        fr: "Envie d'aller plus loin? La stratégie nationale promet une formation gratuite en IA pour tous; nous publierons ces cours ici dès leur lancement.",
      } },
    ],
  },
];
