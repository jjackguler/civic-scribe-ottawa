import { HUBS, type Hub } from "../hubs";

export const HUB: Hub = {
  ...HUBS.find(h => h.slug === "what-is-generative-ai")!,
  dek: {
    en: "Generative AI writes, draws, speaks and codes on request. Here is how it works, what it is good and bad at, the main tools, and what it changes for people in Canada — without the hype or the doom.",
    fr: "L'IA générative écrit, dessine, parle et programme sur demande. Voici comment elle fonctionne, ce qu'elle fait bien et mal, les principaux outils et ce qu'elle change pour les gens au Canada — sans battage ni catastrophisme.",
  },
  sections: [
    {
      id: "short-answer",
      h: { en: "The short answer", fr: "La réponse courte" },
      blocks: [
        { k: "p", t: {
          en: "Generative AI is software that creates new content — text, images, audio, video or computer code — in response to a request written in everyday language. It learned to do this by studying enormous collections of existing content and picking up the patterns in it. When you ask it for something, it produces a new piece that fits those patterns.",
          fr: "L'IA générative est un logiciel qui crée du contenu nouveau — texte, images, audio, vidéo ou code informatique — en réponse à une demande formulée en langage courant. Elle a appris à le faire en étudiant d'énormes collections de contenus existants et en y repérant des régularités. Quand vous lui demandez quelque chose, elle produit une nouvelle pièce qui correspond à ces régularités.",
        } },
        { k: "ul", items: [
          { en: "**It generates, it doesn't look things up.** Unless it is connected to search or your documents, it writes from patterns, not from a database of facts.", fr: "**Elle produit, elle ne consulte pas.** À moins d'être branchée sur une recherche ou vos documents, elle écrit à partir de régularités, pas d'une base de faits." },
          { en: "**It is very useful for drafts.** Summaries, emails, plans, explanations, translations and first versions of almost anything.", fr: "**Elle est très utile pour les ébauches.** Résumés, courriels, plans, explications, traductions et premières versions de presque tout." },
          { en: "**It can be confidently wrong.** Checking what matters is part of using it — always.", fr: "**Elle peut se tromper avec assurance.** Vérifier ce qui compte fait partie de son utilisation — toujours." },
        ] },
        { k: "tip", label: { en: "In one line for a 12-year-old", fr: "En une ligne pour un enfant de 12 ans" }, t: {
          en: "Generative AI is a computer that has studied millions of examples so it can make new stories, pictures or answers when you ask — but it can still make mistakes, so check.",
          fr: "L'IA générative, c'est un ordinateur qui a étudié des millions d'exemples pour fabriquer de nouvelles histoires, images ou réponses quand tu lui demandes — mais elle peut se tromper, alors vérifie.",
        } },
      ],
    },
    {
      id: "how-it-works",
      h: { en: "How it works, in four steps", fr: "Comment elle fonctionne, en quatre étapes" },
      blocks: [
        { k: "ol", items: [
          { en: "**It reads a huge amount.** A [large language model](/glossary/large-language-model) is first trained on a vast collection of text — books, websites, code, articles. This [pre-training](/glossary/pre-training) takes months on thousands of specialised chips.", fr: "**Elle lit énormément.** Un [grand modèle de langage](/glossary/large-language-model) est d'abord entraîné sur une vaste collection de textes — livres, sites Web, code, articles. Ce [préentraînement](/glossary/pre-training) prend des mois sur des milliers de puces spécialisées." },
          { en: "**It learns to predict the next piece.** During training it plays one game billions of times: guess the next small chunk of text (a [token](/glossary/token)), check, adjust. Getting very good at that game turns out to require learning grammar, facts, styles and some reasoning.", fr: "**Elle apprend à prédire la suite.** Pendant l'entraînement, elle joue des milliards de fois au même jeu : deviner le prochain petit morceau de texte (un [jeton](/glossary/token)), vérifier, s'ajuster. Devenir très bonne à ce jeu exige d'apprendre la grammaire, des faits, des styles et un peu de raisonnement." },
          { en: "**People shape its behaviour.** Raw models are then trained further with human feedback ([RLHF](/glossary/rlhf)) and written rules, so they follow instructions, decline harmful requests and answer in a helpful tone.", fr: "**Des personnes façonnent son comportement.** Les modèles bruts sont ensuite entraînés avec de la rétroaction humaine ([ARRH](/glossary/rlhf)) et des règles écrites, pour qu'ils suivent les instructions, refusent les demandes nuisibles et répondent de façon utile." },
          { en: "**Your prompt starts the generation.** When you type a [prompt](/glossary/prompt), the model produces its answer one token at a time, each choice based on everything before it. Image generators work differently — usually with [diffusion models](/glossary/diffusion-model) that turn noise into a picture — but the idea of learning patterns and generating something new is the same.", fr: "**Votre requête lance la génération.** Quand vous tapez une [requête](/glossary/prompt), le modèle produit sa réponse un jeton à la fois, chaque choix dépendant de tout ce qui précède. Les générateurs d'images fonctionnent autrement — généralement avec des [modèles de diffusion](/glossary/diffusion-model) qui transforment du bruit en image — mais l'idée d'apprendre des régularités pour produire du nouveau est la même." },
        ] },
        { k: "p", t: {
          en: "A useful mental model: generative AI is like a well-read assistant with a huge memory for how things are usually said, no memory of where it read them, and a strong urge to give you an answer even when it isn't sure.",
          fr: "Une image utile : l'IA générative ressemble à un assistant très cultivé, qui se souvient parfaitement de la façon dont les choses se disent d'habitude, mais pas d'où il les a lues, et qui tient à vous répondre même quand il n'est pas sûr.",
        } },
      ],
    },
    {
      id: "what-it-makes",
      h: { en: "What it can make", fr: "Ce qu'elle peut créer" },
      blocks: [
        { k: "table", caption: { en: "Kinds of generative AI, with everyday uses and what to watch for", fr: "Types d'IA générative, usages courants et points de vigilance" },
          head: [{ en: "Type", fr: "Type" }, { en: "Everyday uses", fr: "Usages courants" }, { en: "Watch out for", fr: "Points de vigilance" }],
          rows: [
            [{ en: "Text", fr: "Texte" }, { en: "Emails, summaries, explanations, translations, lesson plans, cover letters", fr: "Courriels, résumés, explications, traductions, plans de cours, lettres de présentation" }, { en: "Invented facts and quotes; generic tone", fr: "Faits et citations inventés; ton générique" }],
            [{ en: "Images", fr: "Images" }, { en: "Illustrations, posters, product mock-ups, presentation visuals", fr: "Illustrations, affiches, maquettes de produits, visuels de présentation" }, { en: "Copying artists' styles; fake photos of real people", fr: "Imitation du style d'artistes; fausses photos de vraies personnes" }],
            [{ en: "Voice and audio", fr: "Voix et audio" }, { en: "Read-aloud, narration, music sketches, accessibility", fr: "Lecture à voix haute, narration, ébauches musicales, accessibilité" }, { en: "Voice-clone scams", fr: "Arnaques par clonage de voix" }],
            [{ en: "Video", fr: "Vidéo" }, { en: "Short clips, explainers, storyboards", fr: "Courts extraits, capsules explicatives, scénarimages" }, { en: "Deepfakes and election misinformation", fr: "Hypertrucages et désinformation électorale" }],
            [{ en: "Code", fr: "Code" }, { en: "Spreadsheet formulas, small apps, website fixes", fr: "Formules de tableur, petites applications, corrections de site Web" }, { en: "Security holes in code nobody reviewed", fr: "Failles de sécurité dans du code que personne n'a révisé" }],
          ] },
      ],
    },
    {
      id: "vs-other-ai",
      h: { en: "Generative AI vs the AI you already use", fr: "L'IA générative et l'IA que vous utilisez déjà" },
      blocks: [
        { k: "p", t: {
          en: "AI was part of daily life long before chatbots. Spam filters, fraud alerts, map traffic estimates and photo search use [machine learning](/glossary/machine-learning) to classify or predict. Generative AI uses similar foundations but produces new content instead of a label or a number.",
          fr: "L'IA faisait partie du quotidien bien avant les robots conversationnels. Les filtres antipourriel, les alertes de fraude, l'estimation de la circulation et la recherche de photos utilisent l'[apprentissage automatique](/glossary/machine-learning) pour classer ou prédire. L'IA générative repose sur des bases semblables, mais produit du contenu nouveau plutôt qu'une étiquette ou un chiffre.",
        } },
        { k: "table", caption: { en: "Predictive AI compared with generative AI", fr: "L'IA prédictive comparée à l'IA générative" },
          head: [{ en: "", fr: "" }, { en: "Predictive AI", fr: "IA prédictive" }, { en: "Generative AI", fr: "IA générative" }],
          rows: [
            [{ en: "Answers the question", fr: "Répond à la question" }, { en: "\"Which is it?\" or \"How much?\"", fr: "« Lequel? » ou « Combien? »" }, { en: "\"Make me one.\"", fr: "« Fais-m'en un. »" }],
            [{ en: "Output", fr: "Résultat" }, { en: "A label, score or forecast", fr: "Une étiquette, un score ou une prévision" }, { en: "Text, image, audio, video, code", fr: "Texte, image, audio, vidéo, code" }],
            [{ en: "Example", fr: "Exemple" }, { en: "\"This payment looks like fraud.\"", fr: "« Ce paiement ressemble à une fraude. »" }, { en: "\"Here's a draft letter disputing the charge.\"", fr: "« Voici une lettre pour contester le débit. »" }],
            [{ en: "Typical failure", fr: "Défaillance typique" }, { en: "Wrong or biased prediction", fr: "Prédiction fausse ou biaisée" }, { en: "Fluent but false content", fr: "Contenu fluide mais faux" }],
          ] },
      ],
    },
    {
      id: "tools",
      h: { en: "The main tools", fr: "Les principaux outils" },
      blocks: [
        { k: "p", t: {
          en: "Most people meet generative AI through a general [AI assistant](/glossary/ai-assistant). All of these have free plans and paid plans with stronger models and higher limits. Features change often; this list was reviewed in October 2026.",
          fr: "La plupart des gens découvrent l'IA générative au moyen d'un [assistant IA](/glossary/ai-assistant) polyvalent. Tous ceux-ci offrent une version gratuite et des forfaits payants avec des modèles plus puissants et des limites plus élevées. Les fonctions changent souvent; cette liste a été revue en octobre 2026.",
        } },
        { k: "ul", items: [
          { en: "**ChatGPT** (OpenAI, United States) — the best-known assistant; text, images, voice and web search.", fr: "**ChatGPT** (OpenAI, États-Unis) — l'assistant le plus connu; texte, images, voix et recherche Web." },
          { en: "**Claude** (Anthropic, United States) — strong at writing, long documents and coding.", fr: "**Claude** (Anthropic, États-Unis) — fort en rédaction, en longs documents et en programmation." },
          { en: "**Gemini** (Google, United States) — built into Google's apps, Android and Workspace.", fr: "**Gemini** (Google, États-Unis) — intégré aux applications de Google, à Android et à Workspace." },
          { en: "**Copilot** (Microsoft, United States) — built into Windows, Edge and Microsoft 365.", fr: "**Copilot** (Microsoft, États-Unis) — intégré à Windows, à Edge et à Microsoft 365." },
          { en: "**Le Chat** (Mistral AI, France) — a European option that works well in French.", fr: "**Le Chat** (Mistral AI, France) — une option européenne qui fonctionne bien en français." },
          { en: "**Open-weight models** such as Llama, Mistral, Gemma and Qwen can run on your own computer — more private, more technical. See [open-weight model](/glossary/open-weight-model).", fr: "**Les modèles à poids ouverts** comme Llama, Mistral, Gemma et Qwen peuvent tourner sur votre propre ordinateur — plus privé, plus technique. Voir [modèle à poids ouverts](/glossary/open-weight-model)." },
        ] },
        { k: "p", t: {
          en: "Which one is \"best\" matters less than practice. Pick one, use it for a week on real tasks, and learn its habits. Our free [Labs path on AI assistants](/labs/assistants) compares them side by side.",
          fr: "Savoir lequel est « le meilleur » compte moins que la pratique. Choisissez-en un, utilisez-le une semaine pour de vraies tâches et apprenez ses habitudes. Notre [parcours Labs sur les assistants](/labs/assistants), gratuit, les compare côte à côte.",
        } },
      ],
    },
    {
      id: "limits",
      h: { en: "What it gets wrong", fr: "Ce qu'elle rate" },
      blocks: [
        { k: "ul", items: [
          { en: "**Made-up facts.** [Hallucinations](/glossary/hallucination) — invented quotes, studies, laws and court cases — are the most common serious failure. Ask for sources and open them.", fr: "**Des faits inventés.** Les [hallucinations](/glossary/hallucination) — citations, études, lois et décisions inventées — sont la défaillance grave la plus courante. Demandez les sources et ouvrez-les." },
          { en: "**Out-of-date knowledge.** Without web search, a model knows nothing after its [knowledge cutoff](/glossary/knowledge-cutoff): new prices, rules or events.", fr: "**Des connaissances périmées.** Sans recherche Web, un modèle ignore tout ce qui suit sa [date limite des connaissances](/glossary/knowledge-cutoff) : nouveaux prix, nouvelles règles, nouveaux événements." },
          { en: "**Bias.** It can repeat stereotypes in its [training data](/glossary/training-data), and it often serves French and other languages less well than English.", fr: "**Des biais.** Elle peut répéter les stéréotypes de ses [données d'entraînement](/glossary/training-data), et sert souvent moins bien le français et d'autres langues que l'anglais." },
          { en: "**Telling you what you want to hear.** Models trained to please can agree with a wrong premise. Ask it to argue the other side.", fr: "**Vous dire ce que vous voulez entendre.** Des modèles entraînés à plaire peuvent approuver une prémisse fausse. Demandez-lui de défendre l'autre point de vue." },
          { en: "**Maths and exact details.** Long calculations, dates and counts can slip unless the tool uses a calculator or code.", fr: "**Les calculs et les détails exacts.** Les longs calculs, les dates et les dénombrements peuvent déraper si l'outil n'utilise pas une calculatrice ou du code." },
          { en: "**Privacy.** What you type may be stored and, depending on settings, used to train future models. See our guide to [using AI assistants safely](/guides/use-ai-assistants-safely).", fr: "**La vie privée.** Ce que vous tapez peut être conservé et, selon les réglages, servir à entraîner de futurs modèles. Voir notre guide [Utiliser les assistants IA en sécurité](/guides/use-ai-assistants-safely)." },
        ] },
      ],
    },
    {
      id: "people",
      h: { en: "What it means for people", fr: "Ce que ça change pour les gens" },
      blocks: [
        { k: "p", t: {
          en: "We judge every technology story by what it changes for people. Generative AI has real benefits and real costs, and they don't fall on everyone equally.",
          fr: "Nous jugeons chaque nouvelle technologique selon ce qu'elle change pour les gens. L'IA générative a de vrais avantages et de vrais coûts, qui ne touchent pas tout le monde de la même façon.",
        } },
        { k: "ul", items: [
          { en: "**Work.** It changes tasks in office, creative and technical jobs first. Read [AI and jobs in Canada](/guides/ai-and-jobs-in-canada).", fr: "**Le travail.** Elle change d'abord les tâches des emplois de bureau, de création et techniques. Lisez [L'IA et l'emploi au Canada](/guides/ai-and-jobs-in-canada)." },
          { en: "**School.** It can be a patient tutor or a shortcut that skips the learning. Read [AI for students](/guides/ai-for-students).", fr: "**L'école.** Elle peut être un tuteur patient ou un raccourci qui saute l'apprentissage. Lisez [L'IA pour les élèves](/guides/ai-for-students)." },
          { en: "**Access.** Read-aloud, captions, translation and plain-language rewrites help people with disabilities, newcomers and anyone facing dense paperwork.", fr: "**L'accessibilité.** La lecture à voix haute, le sous-titrage, la traduction et la réécriture en langage clair aident les personnes handicapées, les nouveaux arrivants et quiconque affronte des formulaires complexes." },
          { en: "**Trust and democracy.** Cheap, convincing fakes make [misinformation](/glossary/misinformation) and [deepfakes](/glossary/deepfake) easier to spread.", fr: "**La confiance et la démocratie.** Des faux bon marché et convaincants facilitent la propagation de la [désinformation](/glossary/misinformation) et des [hypertrucages](/glossary/deepfake)." },
          { en: "**Creators.** Writers, artists and journalists are asking courts whether training on their work without permission is legal. See [AI and copyright](/glossary/ai-and-copyright).", fr: "**Les créateurs.** Auteurs, artistes et journalistes demandent aux tribunaux s'il est légal d'entraîner des modèles sur leur travail sans permission. Voir [IA et droit d'auteur](/glossary/ai-and-copyright)." },
          { en: "**The environment.** Training and running large models uses a lot of electricity and water in [data centres](/glossary/data-centre).", fr: "**L'environnement.** Entraîner et faire tourner de grands modèles consomme beaucoup d'électricité et d'eau dans les [centres de données](/glossary/data-centre)." },
        ] },
      ],
    },
    {
      id: "canada",
      h: { en: "Generative AI in Canada", fr: "L'IA générative au Canada" },
      blocks: [
        { k: "p", t: {
          en: "Canada helped invent the deep-learning methods behind today's generative AI: researchers in Toronto, Montréal and Edmonton — home to the Vector Institute, Mila and Amii — did foundational work, and Canada launched the world's first national AI strategy in 2017. The federal government now has a minister responsible for artificial intelligence; our [AI Ministry tracker](/ministry) follows every announcement.",
          fr: "Le Canada a contribué à inventer les méthodes d'apprentissage profond derrière l'IA générative actuelle : des chercheurs de Toronto, de Montréal et d'Edmonton — où se trouvent l'Institut Vecteur, Mila et Amii — ont fait des travaux fondateurs, et le Canada a lancé en 2017 la première stratégie nationale en IA au monde. Le gouvernement fédéral compte maintenant un ministre responsable de l'intelligence artificielle; notre [suivi du ministère de l'IA](/ministry) rapporte chaque annonce.",
        } },
        { k: "p", t: {
          en: "Use is growing fast. Statistics Canada's business surveys found the share of businesses using AI to produce goods or deliver services roughly doubled between 2024 and 2025, to about one in eight — still a minority, concentrated in information, professional and finance sectors. There is no AI-specific federal law yet (the proposed [AIDA](/glossary/aida) died in 2025), but privacy, human-rights, consumer and employment laws already apply, and Québec's [Law 25](/glossary/law-25) sets strict privacy rules.",
          fr: "L'usage progresse vite. Les enquêtes de Statistique Canada ont montré que la part des entreprises qui utilisent l'IA pour produire des biens ou offrir des services a environ doublé entre 2024 et 2025, pour atteindre environ une sur huit — encore une minorité, concentrée dans l'information, les services professionnels et la finance. Il n'existe pas encore de loi fédérale propre à l'IA (le projet de [LIAD](/glossary/aida) est mort en 2025), mais les lois sur la vie privée, les droits de la personne, la consommation et l'emploi s'appliquent déjà, et la [Loi 25](/glossary/law-25) du Québec impose des règles strictes de confidentialité.",
        } },
      ],
    },
    {
      id: "start",
      h: { en: "How to start in 15 minutes", fr: "Comment commencer en 15 minutes" },
      blocks: [
        { k: "ol", items: [
          { en: "Open one assistant (ChatGPT, Claude, Gemini, Copilot or Le Chat). Turn off training on your chats if you prefer — see [the safety guide](/guides/use-ai-assistants-safely#settings).", fr: "Ouvrez un assistant (ChatGPT, Claude, Gemini, Copilot ou Le Chat). Désactivez l'entraînement sur vos conversations si vous le préférez — voir [le guide de sécurité](/guides/use-ai-assistants-safely#settings)." },
          { en: "Give it a real task with context, a goal and a format: \"I'm a parent of two. Plan five weeknight dinners under 30 minutes, nut-free, with a grocery list.\"", fr: "Donnez-lui une vraie tâche avec contexte, objectif et format : « Je suis parent de deux enfants. Planifie cinq soupers de semaine de moins de 30 minutes, sans noix, avec une liste d'épicerie. »" },
          { en: "Push back: \"Make it cheaper\", \"Explain step 3\", \"What might be wrong here?\"", fr: "Relancez : « Rends-le moins cher », « Explique l'étape 3 », « Qu'est-ce qui pourrait être faux ici? »" },
          { en: "Check one fact it gave you against a trusted source. Make that a habit.", fr: "Vérifiez un des faits donnés auprès d'une source fiable. Faites-en une habitude." },
          { en: "Keep going with our free guide [Start using AI in 30 minutes](/learn/start-in-30-minutes) or the [Start here Labs path](/labs/start-here).", fr: "Continuez avec notre guide gratuit [Commencer avec l'IA en 30 minutes](/learn/start-in-30-minutes) ou le [parcours Labs Commencer ici](/labs/start-here)." },
        ] },
      ],
    },
  ],
  faq: [
    {
      q: { en: "Is ChatGPT generative AI?", fr: "ChatGPT est-il de l'IA générative?" },
      a: { en: "Yes. ChatGPT is an app built on OpenAI's large language models, which generate text (and, through other models, images and audio) in response to prompts. Claude, Gemini, Copilot and Le Chat are the same kind of tool.", fr: "Oui. ChatGPT est une application bâtie sur les grands modèles de langage d'OpenAI, qui produisent du texte (et, grâce à d'autres modèles, des images et de l'audio) en réponse à des requêtes. Claude, Gemini, Copilot et Le Chat sont des outils du même genre." },
    },
    {
      q: { en: "Does generative AI understand what it says?", fr: "L'IA générative comprend-elle ce qu'elle dit?" },
      a: { en: "Not the way people do. It has learned very rich patterns of language that let it reason through many problems, but it has no lived experience, and it can't reliably tell when it is wrong. Treat it as a capable tool, not a mind.", fr: "Pas comme les humains. Elle a appris des régularités de langage très riches qui lui permettent de raisonner sur bien des problèmes, mais elle n'a aucune expérience vécue et ne sait pas de façon fiable quand elle se trompe. Traitez-la comme un outil compétent, pas comme un esprit." },
    },
    {
      q: { en: "Is generative AI the same as AGI?", fr: "L'IA générative est-elle la même chose que l'IAG?" },
      a: { en: "No. Artificial general intelligence is a hypothetical AI that could learn almost any task a person can. Today's generative AI is impressive across many tasks but still has clear limits. Experts disagree on whether and when AGI might arrive.", fr: "Non. L'intelligence artificielle générale est une IA hypothétique capable d'apprendre presque toute tâche humaine. L'IA générative actuelle impressionne dans bien des tâches, mais garde des limites nettes. Les experts ne s'entendent pas sur l'arrivée possible de l'IAG, ni sur sa date." },
    },
    {
      q: { en: "Is it free?", fr: "Est-ce gratuit?" },
      a: { en: "The main assistants have free plans that cover everyday use. Paid plans, usually around the price of a streaming subscription per month, add stronger models, higher limits and extra features. Businesses can also pay per use through an API.", fr: "Les principaux assistants ont une version gratuite qui suffit à l'usage courant. Les forfaits payants, généralement au prix d'un abonnement de diffusion en continu par mois, ajoutent des modèles plus puissants, des limites plus élevées et des fonctions supplémentaires. Les entreprises peuvent aussi payer à l'usage au moyen d'une API." },
    },
    {
      q: { en: "Who owns what generative AI makes?", fr: "À qui appartient ce que produit l'IA générative?" },
      a: { en: "It is unsettled. Most providers' terms give you the rights they have in the output, but whether AI-generated work can be protected by copyright in Canada, and whether training on others' work was lawful, are open legal questions. For anything commercial, add substantial human work and keep records.", fr: "La question n'est pas réglée. Les conditions de la plupart des fournisseurs vous cèdent les droits qu'ils détiennent sur le résultat, mais la protection par le droit d'auteur d'une œuvre générée par IA au Canada, et la légalité de l'entraînement sur les œuvres d'autrui, restent des questions juridiques ouvertes. Pour un usage commercial, ajoutez un apport humain substantiel et gardez des traces." },
    },
    {
      q: { en: "Is it safe to use?", fr: "Est-ce sécuritaire?" },
      a: { en: "For everyday tasks, yes, with three habits: don't share private or sensitive information, check anything important, and be open about where you used it. Our guide to using AI assistants safely covers the details.", fr: "Pour les tâches courantes, oui, avec trois réflexes : ne partagez pas de renseignements privés ou délicats, vérifiez tout ce qui est important et dites franchement où vous l'avez utilisée. Notre guide sur l'utilisation sécuritaire des assistants IA donne les détails." },
    },
  ],
  terms: ["generative-ai", "large-language-model", "token", "hallucination", "diffusion-model", "prompt", "training-data", "ai-agent"],
  labs: ["start-here", "assistants"],
  sources: [
    { name: { en: "Statistics Canada — Canadian Survey on Business Conditions", fr: "Statistique Canada — Enquête canadienne sur la situation des entreprises" }, url: { en: "https://www.statcan.gc.ca/en/start", fr: "https://www.statcan.gc.ca/fr/debut" } },
    { name: { en: "Office of the Privacy Commissioner of Canada", fr: "Commissariat à la protection de la vie privée du Canada" }, url: { en: "https://www.priv.gc.ca/en/", fr: "https://www.priv.gc.ca/fr/" } },
    { name: { en: "MediaSmarts — Canada's centre for digital media literacy", fr: "HabiloMédias — centre canadien d'éducation aux médias et de littératie numérique" }, url: { en: "https://mediasmarts.ca/", fr: "https://habilomedias.ca/" } },
  ],
};
