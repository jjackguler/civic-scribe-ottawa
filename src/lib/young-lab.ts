/**
 * Young Lab: the youth wing of AI Broadsheet Labs.
 *
 * Two groups, Explorers (8 to 12) and Makers (13 to 17), plus a page for
 * parents and teachers. Every activity runs entirely in the browser: no
 * accounts, no personal data, nothing a young person types is sent to a
 * server or an AI model, and there is no open-ended chat with a model.
 * Stamps live in localStorage only (see young-progress.ts).
 *
 * Outside links appear only on the Makers and grown-ups pages, are marked
 * "leaves AI Broadsheet", and were checked on YOUNG_CHECKED.
 */
import type { Bi } from "./i18n";

export const YOUNG_CHECKED = "2026-10-09";

export type Group = "explorers" | "makers";
export type Tone = "sun" | "sky" | "coral" | "mint" | "grape";

export type ActivityId =
  | "ai-or-not" | "teach-the-machine" | "spot-the-fake" | "prompt-kitchen" | "fair-or-unfair"
  | "next-word" | "privacy-check" | "chatbot-rules" | "career-paths";

export type Activity = {
  id: ActivityId;
  group: Group;
  n: number;
  tone: Tone;
  title: Bi;
  /** One playful line for the card. */
  tagline: Bi;
  /** What the stamp says. */
  stamp: Bi;
  minutes: number;
  /** For grown-ups: the big idea, in one sentence. */
  teaches: Bi;
  /** Curriculum-style objectives: "Learners will be able to…" */
  objectives: Bi[];
  /** Questions to talk about afterwards. */
  starters: Bi[];
  /** An unplugged version for the printable activity sheet. */
  sheet: Bi[];
};

export const ACTIVITIES: Activity[] = [
  {
    id: "ai-or-not", group: "explorers", n: 1, tone: "sun",
    title: { en: "AI or not?", fr: "IA ou pas?" },
    tagline: { en: "Ten everyday things. Which ones use AI? Flip the cards and find out.", fr: "Dix objets de tous les jours. Lesquels utilisent l'IA? Retournez les cartes pour le savoir." },
    stamp: { en: "AI spotter", fr: "Repère l'IA" },
    minutes: 5,
    teaches: { en: "AI is software that learns patterns from examples; plenty of useful machines just follow fixed rules.", fr: "L'IA est un logiciel qui apprend des régularités à partir d'exemples; bien des machines utiles suivent simplement des règles fixes." },
    objectives: [
      { en: "Tell the difference between a machine that follows fixed rules and one that learned from examples.", fr: "Distinguer une machine qui suit des règles fixes d'une machine qui a appris à partir d'exemples." },
      { en: "Name three places they already meet AI in daily life.", fr: "Nommer trois endroits où l'on croise déjà l'IA au quotidien." },
      { en: "Explain why some things are \"partly AI\".", fr: "Expliquer pourquoi certaines choses sont « en partie de l'IA »." },
    ],
    starters: [
      { en: "Which answer surprised you? Why?", fr: "Quelle réponse t'a surpris? Pourquoi?" },
      { en: "What in our home do you think uses AI? How could we check?", fr: "Qu'est-ce qui, à la maison, utilise l'IA selon toi? Comment le vérifier?" },
      { en: "Is something better just because it uses AI?", fr: "Une chose est-elle meilleure simplement parce qu'elle utilise l'IA?" },
    ],
    sheet: [
      { en: "Walk around your home or classroom and list ten machines or apps.", fr: "Faites le tour de la maison ou de la classe et notez dix machines ou applications." },
      { en: "Next to each, write: fixed rules, learned from examples, or not sure.", fr: "À côté de chacune, écrivez : règles fixes, appris par l'exemple, ou pas sûr." },
      { en: "For each \"learned\" one, write what examples it might have learned from.", fr: "Pour chaque « appris », écrivez de quels exemples elle a pu apprendre." },
    ],
  },
  {
    id: "teach-the-machine", group: "explorers", n: 2, tone: "mint",
    title: { en: "Teach the machine", fr: "Entraîne la machine" },
    tagline: { en: "Show a tiny robot some fruit and watch it guess. It only knows what you show it.", fr: "Montre des fruits à un petit robot et regarde-le deviner. Il ne connaît que ce que tu lui montres." },
    stamp: { en: "Fair teacher", fr: "Prof équitable" },
    minutes: 8,
    teaches: { en: "A model learns only from its examples; missing examples lead to unfair or wrong guesses, and more varied examples fix it.", fr: "Un modèle n'apprend que de ses exemples; quand il en manque, il devine mal ou injustement, et des exemples plus variés corrigent le tir." },
    objectives: [
      { en: "Describe training and testing in their own words.", fr: "Décrire l'entraînement et le test dans ses propres mots." },
      { en: "Predict how a nearest-neighbour model will guess from its examples.", fr: "Prédire comment un modèle du plus proche voisin devinera à partir de ses exemples." },
      { en: "Explain how missing examples create bias, and how to fix it.", fr: "Expliquer comment des exemples manquants créent un biais, et comment le corriger." },
    ],
    starters: [
      { en: "Why did the robot think the green apple wasn't an apple?", fr: "Pourquoi le robot pensait-il que la pomme verte n'était pas une pomme?" },
      { en: "If a computer only saw photos of some kinds of people, what might go wrong?", fr: "Si un ordinateur ne voyait que des photos de certaines personnes, que pourrait-il se passer?" },
      { en: "Who should decide which examples a machine learns from?", fr: "Qui devrait choisir les exemples dont une machine apprend?" },
    ],
    sheet: [
      { en: "Draw a big square. Label left to right: green, yellow, red. Bottom to top: long, round.", fr: "Dessinez un grand carré. De gauche à droite : vert, jaune, rouge. De bas en haut : long, rond." },
      { en: "Draw three red apples (A) and a lime, a lemon and a banana (N) where they belong.", fr: "Placez trois pommes rouges (P) et une lime, un citron et une banane (N) où ils vont." },
      { en: "Now place a green apple. Which letter is closest? That is the machine's guess. Is it right?", fr: "Placez maintenant une pomme verte. Quelle lettre est la plus proche? C'est la réponse de la machine. Est-elle juste?" },
      { en: "Add a green apple (A) as an example and try again.", fr: "Ajoutez une pomme verte (P) comme exemple et recommencez." },
    ],
  },
  {
    id: "spot-the-fake", group: "explorers", n: 3, tone: "coral",
    title: { en: "Spot the fake", fr: "Repère le faux" },
    tagline: { en: "Six pairs of posts and pictures. One of each pair was made up. Find the clues.", fr: "Six paires de messages et d'images. Dans chaque paire, l'un est inventé. Trouve les indices." },
    stamp: { en: "Clue finder", fr: "Chasseur d'indices" },
    minutes: 8,
    teaches: { en: "Made-up and generated content leaves clues; the best habit is to ask who made something and why.", fr: "Les contenus inventés ou générés laissent des indices; le meilleur réflexe est de se demander qui l'a fait et pourquoi." },
    objectives: [
      { en: "Spot common clues in made-up posts: no source, pressure to share, too good to be true.", fr: "Repérer les indices d'un message inventé : pas de source, pression pour partager, trop beau pour être vrai." },
      { en: "Spot common glitches in generated pictures: odd text, impossible shadows, extra parts.", fr: "Repérer les défauts des images générées : texte étrange, ombres impossibles, parties en trop." },
      { en: "Use the question \"Who made this, and why?\" before sharing.", fr: "Se poser la question « Qui a fait ceci, et pourquoi? » avant de partager." },
    ],
    starters: [
      { en: "Have you seen something online that turned out not to be true?", fr: "As-tu déjà vu en ligne quelque chose qui s'est révélé faux?" },
      { en: "Why might someone make a fake post?", fr: "Pourquoi quelqu'un fabriquerait-il un faux message?" },
      { en: "Who could you ask when you're not sure?", fr: "À qui pourrais-tu demander quand tu n'es pas sûr?" },
    ],
    sheet: [
      { en: "Find two short posts or headlines (with a grown-up).", fr: "Trouvez deux courts messages ou titres (avec un adulte)." },
      { en: "For each, answer: Who made it? Why? Where did the facts come from?", fr: "Pour chacun : Qui l'a fait? Pourquoi? D'où viennent les faits?" },
      { en: "Circle any pressure words, like \"share now\" or \"they don't want you to know\".", fr: "Encerclez les mots qui mettent de la pression, comme « partage vite » ou « on vous le cache »." },
    ],
  },
  {
    id: "prompt-kitchen", group: "explorers", n: 4, tone: "sky",
    title: { en: "Prompt kitchen", fr: "La cuisine des requêtes" },
    tagline: { en: "Mix role, task, detail and tone into a tasty prompt. The kitchen scores your recipe.", fr: "Mélange rôle, tâche, détail et ton pour une requête savoureuse. La cuisine note ta recette." },
    stamp: { en: "Prompt chef", fr: "Chef des requêtes" },
    minutes: 7,
    teaches: { en: "Clear instructions get better help from AI tools, and personal information never goes in a prompt.", fr: "Des consignes claires obtiennent une meilleure aide des outils d'IA, et les renseignements personnels ne vont jamais dans une requête." },
    objectives: [
      { en: "Name the parts of a clear prompt: role, task, detail, tone.", fr: "Nommer les parties d'une requête claire : rôle, tâche, détail, ton." },
      { en: "Improve a vague request by adding specific details.", fr: "Améliorer une demande vague en ajoutant des détails précis." },
      { en: "Recognize personal information and keep it out of prompts.", fr: "Reconnaître les renseignements personnels et les garder hors des requêtes." },
    ],
    starters: [
      { en: "What's the difference between \"make it good\" and \"in five sentences for a ten-year-old\"?", fr: "Quelle différence entre « fais-le bien » et « en cinq phrases pour un enfant de dix ans »?" },
      { en: "Why shouldn't we put our name, school or address in a prompt?", fr: "Pourquoi ne pas mettre notre nom, notre école ou notre adresse dans une requête?" },
      { en: "When is it better to ask a person than an AI tool?", fr: "Quand vaut-il mieux demander à une personne qu'à un outil d'IA?" },
    ],
    sheet: [
      { en: "Cut four strips of paper: role, task, detail, tone.", fr: "Découpez quatre bandes de papier : rôle, tâche, détail, ton." },
      { en: "Write a choice on each and read the full prompt aloud.", fr: "Écrivez un choix sur chacune et lisez la requête complète à voix haute." },
      { en: "Swap one strip at a time. Which change makes the request clearest?", fr: "Changez une bande à la fois. Quel changement rend la demande la plus claire?" },
    ],
  },
  {
    id: "fair-or-unfair", group: "explorers", n: 5, tone: "grape",
    title: { en: "Fair or unfair?", fr: "Juste ou injuste?" },
    tagline: { en: "Six short stories about machines making choices. You be the judge.", fr: "Six petites histoires de machines qui font des choix. À toi de juger." },
    stamp: { en: "Fairness judge", fr: "Juge de l'équité" },
    minutes: 7,
    teaches: { en: "Decisions made with AI should treat every person with dignity, be explainable, and let a human step in.", fr: "Les décisions prises avec l'IA doivent respecter la dignité de chaque personne, pouvoir s'expliquer et laisser un humain intervenir." },
    objectives: [
      { en: "Judge whether an automated decision is fair and say why.", fr: "Juger si une décision automatisée est juste et dire pourquoi." },
      { en: "Connect fairness to rights: being seen, being included, asking why, appealing to a person.", fr: "Relier l'équité aux droits : être vu, être inclus, demander pourquoi, faire appel à une personne." },
      { en: "Suggest a concrete way to make an unfair system fairer.", fr: "Proposer une façon concrète de rendre un système plus juste." },
    ],
    starters: [
      { en: "Have you ever felt a rule was unfair? What made it unfair?", fr: "As-tu déjà trouvé une règle injuste? Qu'est-ce qui la rendait injuste?" },
      { en: "Why does it matter that a person can check what a machine decided?", fr: "Pourquoi est-ce important qu'une personne puisse vérifier ce qu'une machine a décidé?" },
      { en: "How can we make sure technology includes everyone?", fr: "Comment s'assurer que la technologie inclut tout le monde?" },
    ],
    sheet: [
      { en: "Read each story card aloud.", fr: "Lisez chaque histoire à voix haute." },
      { en: "Vote fair or unfair with a thumbs up or down.", fr: "Votez juste ou injuste, pouce en haut ou en bas." },
      { en: "For each unfair one, draw or write one fix.", fr: "Pour chaque cas injuste, dessinez ou écrivez une solution." },
    ],
  },
  {
    id: "next-word", group: "makers", n: 6, tone: "sun",
    title: { en: "Next-word machine", fr: "La machine à mot suivant" },
    tagline: { en: "Build sentences with a tiny language model and see exactly how it chooses each word.", fr: "Construis des phrases avec un minuscule modèle de langage et vois comment il choisit chaque mot." },
    stamp: { en: "Model whisperer", fr: "Dresseur de modèle" },
    minutes: 10,
    teaches: { en: "Language models predict a likely next word from patterns in their training text; they don't check facts.", fr: "Les modèles de langage prédisent un mot suivant probable à partir des régularités de leur texte d'entraînement; ils ne vérifient pas les faits." },
    objectives: [
      { en: "Explain next-word prediction using counts from training text.", fr: "Expliquer la prédiction du mot suivant à partir des fréquences du texte d'entraînement." },
      { en: "Describe how randomness (temperature) changes output.", fr: "Décrire comment le hasard (la température) change le résultat." },
      { en: "Explain why fluent text can still be wrong.", fr: "Expliquer pourquoi un texte fluide peut quand même être faux." },
    ],
    starters: [
      { en: "Why can a chatbot sound confident and still be wrong?", fr: "Pourquoi un robot conversationnel peut-il paraître sûr de lui et se tromper?" },
      { en: "What would happen if the training text were unkind or one-sided?", fr: "Que se passerait-il si le texte d'entraînement était méchant ou partial?" },
      { en: "How is your own writing different from next-word prediction?", fr: "En quoi ta propre écriture diffère-t-elle de la prédiction du mot suivant?" },
    ],
    sheet: [
      { en: "Write five short sentences on a page. This is your training data.", fr: "Écrivez cinq phrases courtes. Ce sont vos données d'entraînement." },
      { en: "Pick a start word. Count which word follows it most often. Write it down.", fr: "Choisissez un mot de départ. Comptez quel mot le suit le plus souvent. Notez-le." },
      { en: "Repeat until you reach a full stop. Does the sentence make sense? Is it true?", fr: "Répétez jusqu'au point. La phrase a-t-elle du sens? Est-elle vraie?" },
    ],
  },
  {
    id: "privacy-check", group: "makers", n: 7, tone: "mint",
    title: { en: "Privacy check-up", fr: "Bilan de confidentialité" },
    tagline: { en: "Eight quick situations. Pick what you'd do, and build your privacy toolkit.", fr: "Huit situations rapides. Choisis ce que tu ferais et monte ta trousse de confidentialité." },
    stamp: { en: "Privacy pro", fr: "Pro de la vie privée" },
    minutes: 6,
    teaches: { en: "Personal information has value; teens can control what they share with apps, chatbots and people.", fr: "Les renseignements personnels ont de la valeur; les ados peuvent contrôler ce qu'ils partagent avec les applis, les robots et les gens." },
    objectives: [
      { en: "Identify personal and sensitive information.", fr: "Reconnaître les renseignements personnels et sensibles." },
      { en: "Choose safe settings for location, permissions and passwords.", fr: "Choisir des réglages sûrs pour la localisation, les autorisations et les mots de passe." },
      { en: "Respect other people's privacy and consent when sharing photos.", fr: "Respecter la vie privée et le consentement des autres en partageant des photos." },
    ],
    starters: [
      { en: "Which apps on your phone know where you are? Do they need to?", fr: "Quelles applis de ton téléphone savent où tu es? En ont-elles besoin?" },
      { en: "What would you never type into a chatbot?", fr: "Que n'écrirais-tu jamais dans un robot conversationnel?" },
      { en: "How do you ask a friend before posting their photo?", fr: "Comment demandes-tu à un ami avant de publier sa photo?" },
    ],
    sheet: [
      { en: "List the apps you use most.", fr: "Faites la liste des applis les plus utilisées." },
      { en: "For each: does it use location, camera, microphone, contacts? Does it need to?", fr: "Pour chacune : localisation, caméra, micro, contacts? En a-t-elle besoin?" },
      { en: "Turn off one permission you don't need, together with a grown-up.", fr: "Désactivez, avec un adulte, une autorisation inutile." },
    ],
  },
  {
    id: "chatbot-rules", group: "makers", n: 8, tone: "coral",
    title: { en: "Build your first chatbot", fr: "Construis ton premier robot" },
    tagline: { en: "Wire up a rule-based help-desk bot as a flow chart, then test it on real messages.", fr: "Branche un robot d'accueil à règles sous forme d'organigramme, puis teste-le sur de vrais messages." },
    stamp: { en: "Bot builder", fr: "Bâtisseur de robot" },
    minutes: 10,
    teaches: { en: "Rule-based bots follow the order of their rules; good bots put safety first and hand off to a human.", fr: "Les robots à règles suivent l'ordre de leurs règles; un bon robot met la sécurité en premier et passe le relais à un humain." },
    objectives: [
      { en: "Design if-then rules and predict which rule will fire.", fr: "Concevoir des règles si-alors et prédire laquelle s'appliquera." },
      { en: "Explain why rule order matters, and why safety rules go first.", fr: "Expliquer pourquoi l'ordre des règles compte et pourquoi la sécurité passe en premier." },
      { en: "Compare a rule-based bot with an AI chatbot.", fr: "Comparer un robot à règles et un robot conversationnel d'IA." },
    ],
    starters: [
      { en: "When should a bot say \"let me get a person\"?", fr: "Quand un robot devrait-il dire « je vais chercher une personne »?" },
      { en: "What's one thing a rule-based bot does better than an AI chatbot? And worse?", fr: "Une chose qu'un robot à règles fait mieux qu'un robot d'IA? Et moins bien?" },
      { en: "Who is responsible when a bot gives a bad answer?", fr: "Qui est responsable quand un robot donne une mauvaise réponse?" },
    ],
    sheet: [
      { en: "Draw a start box: \"Message arrives\".", fr: "Dessinez une boîte de départ : « Un message arrive »." },
      { en: "Draw diamonds for questions like \"Does it mention 'hours'?\" with yes and no arrows.", fr: "Dessinez des losanges pour des questions comme « Parle-t-il des 'heures'? », avec flèches oui et non." },
      { en: "Put a safety diamond first. Test your chart with five messages a friend writes.", fr: "Placez un losange de sécurité en premier. Testez avec cinq messages écrits par un ami." },
    ],
  },
  {
    id: "career-paths", group: "makers", n: 9, tone: "grape",
    title: { en: "Career paths", fr: "Parcours de carrière" },
    tagline: { en: "Flip through ten jobs that shape AI, many of them not about coding at all.", fr: "Découvre dix métiers qui façonnent l'IA, dont plusieurs sans programmation." },
    stamp: { en: "Future maker", fr: "Bâtisseur d'avenir" },
    minutes: 6,
    teaches: { en: "Many kinds of people and talents shape AI: maths and code, but also care, art, law, teaching and ethics.", fr: "Toutes sortes de personnes et de talents façonnent l'IA : maths et code, mais aussi soin, art, droit, enseignement et éthique." },
    objectives: [
      { en: "Name several AI-related careers, including non-technical ones.", fr: "Nommer plusieurs métiers liés à l'IA, y compris non techniques." },
      { en: "Connect school subjects and personal strengths to those careers.", fr: "Relier matières scolaires et forces personnelles à ces métiers." },
    ],
    starters: [
      { en: "Which job surprised you most?", fr: "Quel métier t'a le plus surpris?" },
      { en: "What problem in our community would you like technology to help with?", fr: "Quel problème de notre communauté aimerais-tu que la technologie aide à régler?" },
    ],
    sheet: [
      { en: "Pick one career card. Write what a day in that job might look like.", fr: "Choisissez une carte métier. Écrivez à quoi pourrait ressembler une journée." },
      { en: "Find one person who does something similar and prepare three questions for them.", fr: "Trouvez une personne qui fait un travail semblable et préparez trois questions." },
    ],
  },
];

export const activityById = (id: string) => ACTIVITIES.find(a => a.id === id);
export const byGroup = (g: Group) => ACTIVITIES.filter(a => a.group === g);

export const GROUP: Record<Group, { title: Bi; ages: Bi; dek: Bi }> = {
  explorers: {
    title: { en: "Explorers", fr: "Explorateurs" },
    ages: { en: "Ages 8 to 12", fr: "8 à 12 ans" },
    dek: { en: "Sort, teach, spot, cook and judge. Five games about how AI works and how to use it kindly.", fr: "Trier, entraîner, repérer, cuisiner, juger. Cinq jeux pour comprendre l'IA et s'en servir avec bienveillance." },
  },
  makers: {
    title: { en: "Makers", fr: "Créateurs" },
    ages: { en: "Ages 13 to 17", fr: "13 à 17 ans" },
    dek: { en: "Look inside a language model, check your privacy, build a bot, and find where you fit in the future of AI.", fr: "Regarde dans un modèle de langage, fais ton bilan de confidentialité, construis un robot et trouve ta place dans l'avenir de l'IA." },
  },
};

/* ------------------------------------------------------------------ */
/* 1. AI or not?                                                       */
/* ------------------------------------------------------------------ */

export type AiOrNotItem = { id: string; icon: string; name: Bi; ai: boolean; why: Bi; partly?: boolean };

export const AI_OR_NOT: AiOrNotItem[] = [
  { id: "spam", icon: "mail", ai: true, name: { en: "Spam filter", fr: "Filtre antipourriel" },
    why: { en: "It learned what junk mail looks like from millions of examples.", fr: "Il a appris à quoi ressemble un pourriel à partir de millions d'exemples." } },
  { id: "calc", icon: "calculator", ai: false, name: { en: "Calculator", fr: "Calculatrice" },
    why: { en: "It follows exact maths rules a person wrote. It never guesses.", fr: "Elle suit des règles de maths exactes écrites par une personne. Elle ne devine jamais." } },
  { id: "voice", icon: "mic", ai: true, name: { en: "Voice assistant", fr: "Assistant vocal" },
    why: { en: "It learned to turn sounds into words by hearing lots of voices.", fr: "Il a appris à changer des sons en mots en entendant beaucoup de voix." } },
  { id: "thermo", icon: "thermometer", ai: false, name: { en: "Simple thermostat", fr: "Thermostat simple" },
    why: { en: "One rule: too cold, turn on the heat. (Some \"smart\" ones do learn your habits.)", fr: "Une seule règle : trop froid, on chauffe. (Certains modèles « intelligents » apprennent vos habitudes.)" } },
  { id: "maps", icon: "map", ai: true, partly: true, name: { en: "Map directions", fr: "Itinéraire sur une carte" },
    why: { en: "Partly: finding the shortest road is a classic recipe, but guessing traffic is learned from patterns.", fr: "En partie : trouver le chemin le plus court est une recette classique, mais prévoir la circulation s'apprend." } },
  { id: "light", icon: "lightbulb", ai: false, name: { en: "Light switch", fr: "Interrupteur" },
    why: { en: "Up is on, down is off. No learning needed!", fr: "En haut, allumé; en bas, éteint. Aucun apprentissage!" } },
  { id: "videos", icon: "clapperboard", ai: true, name: { en: "\"Up next\" video picks", fr: "Vidéos « à suivre »" },
    why: { en: "It learns from what people watch to guess what you'll click next.", fr: "Il apprend de ce que les gens regardent pour deviner ton prochain clic." } },
  { id: "microwave", icon: "microwave", ai: false, name: { en: "Microwave timer", fr: "Minuterie du micro-ondes" },
    why: { en: "It counts down the time you set. Same every time.", fr: "Il compte à rebours le temps choisi. Toujours pareil." } },
  { id: "keyboard", icon: "keyboard", ai: true, name: { en: "Word suggestions on a phone keyboard", fr: "Suggestions de mots du clavier" },
    why: { en: "It predicts your next word from patterns in lots of writing.", fr: "Il prédit ton prochain mot grâce aux régularités de beaucoup de textes." } },
  { id: "translate", icon: "languages", ai: true, name: { en: "Translation app", fr: "Appli de traduction" },
    why: { en: "It learned from huge numbers of sentences already translated by people.", fr: "Elle a appris de très nombreuses phrases déjà traduites par des personnes." } },
  { id: "traffic", icon: "traffic-cone", ai: false, name: { en: "Traffic light on a timer", fr: "Feu de circulation minuté" },
    why: { en: "It changes colour on a fixed schedule someone set.", fr: "Il change de couleur selon un horaire fixe choisi par quelqu'un." } },
  { id: "photos", icon: "images", ai: true, name: { en: "Photo app that finds \"dog\" pictures", fr: "Appli photo qui trouve les « chiens »" },
    why: { en: "It learned what dogs look like from many labelled pictures.", fr: "Elle a appris à quoi ressemble un chien à partir de nombreuses images étiquetées." } },
];

/* ------------------------------------------------------------------ */
/* 2. Teach the machine                                                */
/* ------------------------------------------------------------------ */

/** x: colour, 0 green → 0.5 yellow → 1 red. y: shape, 0 long → 1 round. */
export type Fruit = { id: string; kind: "apple" | "lime" | "lemon" | "banana" | "strawberry"; x: number; y: number; apple: boolean; name: Bi };

export const TRAIN_FRUIT: Fruit[] = [
  { id: "ra1", kind: "apple", x: 0.92, y: 0.86, apple: true, name: { en: "Red apple", fr: "Pomme rouge" } },
  { id: "ra2", kind: "apple", x: 0.84, y: 0.8, apple: true, name: { en: "Red apple", fr: "Pomme rouge" } },
  { id: "ra3", kind: "apple", x: 0.97, y: 0.92, apple: true, name: { en: "Dark red apple", fr: "Pomme rouge foncé" } },
  { id: "lime", kind: "lime", x: 0.07, y: 0.92, apple: false, name: { en: "Lime", fr: "Lime" } },
  { id: "lemon", kind: "lemon", x: 0.45, y: 0.62, apple: false, name: { en: "Lemon", fr: "Citron" } },
  { id: "banana", kind: "banana", x: 0.5, y: 0.1, apple: false, name: { en: "Banana", fr: "Banane" } },
  { id: "straw", kind: "strawberry", x: 0.96, y: 0.48, apple: false, name: { en: "Strawberry", fr: "Fraise" } },
];

/** The examples the first lesson leaves out. */
export const MISSING_FRUIT: Fruit[] = [
  { id: "ga", kind: "apple", x: 0.14, y: 0.84, apple: true, name: { en: "Green apple", fr: "Pomme verte" } },
  { id: "ya", kind: "apple", x: 0.55, y: 0.88, apple: true, name: { en: "Yellow apple", fr: "Pomme jaune" } },
];

export const TEST_FRUIT: Fruit[] = [
  { id: "t-red", kind: "apple", x: 0.88, y: 0.9, apple: true, name: { en: "Red apple", fr: "Pomme rouge" } },
  { id: "t-banana", kind: "banana", x: 0.56, y: 0.16, apple: false, name: { en: "Banana", fr: "Banane" } },
  { id: "t-green", kind: "apple", x: 0.2, y: 0.8, apple: true, name: { en: "Green apple", fr: "Pomme verte" } },
  { id: "t-yellow", kind: "apple", x: 0.5, y: 0.8, apple: true, name: { en: "Yellow apple", fr: "Pomme jaune" } },
];

export type Example = { x: number; y: number; apple: boolean; id: string };

/** One nearest neighbour: the closest example decides. */
export function nearest(examples: Example[], x: number, y: number): Example | null {
  let best: Example | null = null;
  let bd = Infinity;
  for (const e of examples) {
    const d = (e.x - x) ** 2 + (e.y - y) ** 2;
    if (d < bd) { bd = d; best = e; }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* 3. Spot the fake                                                    */
/* ------------------------------------------------------------------ */

export type TextCard = { kind: "text"; who: Bi; body: Bi; meta: Bi };
export type PicCard = { kind: "pic"; scene: "sign" | "shadows" | "dog"; variant: "real" | "fake"; alt: Bi };
export type FakePair = {
  id: string;
  prompt: Bi;
  /** Which of the two is the made-up one (0 or 1). */
  fake: 0 | 1;
  cards: [TextCard | PicCard, TextCard | PicCard];
  clues: Bi[];
};

export const FAKE_PAIRS: FakePair[] = [
  {
    id: "share", fake: 1,
    prompt: { en: "Two posts about the same park. Which one was made up?", fr: "Deux messages sur le même parc. Lequel est inventé?" },
    cards: [
      { kind: "text", who: { en: "City of Riverton, Parks", fr: "Ville de Riverton, Parcs" }, meta: { en: "Posted Tuesday · link to city website", fr: "Publié mardi · lien vers le site de la ville" },
        body: { en: "The splash pad at Maple Park is closed Wednesday for repairs. It reopens Thursday at 9 a.m.", fr: "Les jeux d'eau du parc des Érables sont fermés mercredi pour réparation. Réouverture jeudi à 9 h." } },
      { kind: "text", who: { en: "TotallyRealNews123", fr: "VraiesNouvelles123" }, meta: { en: "No date · no link", fr: "Sans date · sans lien" },
        body: { en: "Maple Park is closing FOREVER and nobody is telling you!!! Share this before they delete it!", fr: "Le parc des Érables ferme POUR TOUJOURS et personne ne vous le dit!!! Partagez avant qu'on l'efface!" } },
    ],
    clues: [
      { en: "No date and no link to where the news came from.", fr: "Pas de date ni de lien vers la source." },
      { en: "Pressure to share fast: \"before they delete it\".", fr: "Pression pour partager vite : « avant qu'on l'efface »." },
      { en: "Shouting and lots of !!! to make you feel worried.", fr: "Des majuscules et des !!! pour t'inquiéter." },
    ],
  },
  {
    id: "sign", fake: 0,
    prompt: { en: "Two pictures of a bakery. Which one was generated by a computer?", fr: "Deux images d'une boulangerie. Laquelle a été générée par ordinateur?" },
    cards: [
      { kind: "pic", scene: "sign", variant: "fake", alt: { en: "A shop with a sign whose letters are jumbled and a door handle floating in the middle of the window.", fr: "Une boutique dont l'enseigne a des lettres mélangées et une poignée qui flotte au milieu de la vitrine." } },
      { kind: "pic", scene: "sign", variant: "real", alt: { en: "A shop with a sign that reads Bakery and a door with a handle on its edge.", fr: "Une boutique avec une enseigne « Boulangerie » et une porte avec sa poignée au bord." } },
    ],
    clues: [
      { en: "The letters on the sign are jumbled. Image generators often get writing wrong.", fr: "Les lettres de l'enseigne sont mélangées. Les générateurs d'images ratent souvent l'écriture." },
      { en: "The door handle floats in the window, where no handle would be.", fr: "La poignée flotte dans la vitrine, là où aucune poignée ne serait." },
    ],
  },
  {
    id: "prize", fake: 0,
    prompt: { en: "Two messages arrive. Which one is a trick?", fr: "Deux messages arrivent. Lequel est un piège?" },
    cards: [
      { kind: "text", who: { en: "Prize Centre", fr: "Centre des prix" }, meta: { en: "Unknown sender", fr: "Expéditeur inconnu" },
        body: { en: "Congratulations! You won a free game console. Just send your full name, address and your parent's password to claim it within 10 minutes.", fr: "Félicitations! Tu as gagné une console de jeu. Envoie ton nom complet, ton adresse et le mot de passe de ton parent d'ici 10 minutes." } },
      { kind: "text", who: { en: "Ms. Okafor (teacher)", fr: "Mme Okafor (enseignante)" }, meta: { en: "School message board", fr: "Babillard de l'école" },
        body: { en: "Reminder: bring your library books back by Friday. Ask me if you need more time.", fr: "Rappel : rapportez vos livres de bibliothèque d'ici vendredi. Demandez-moi si vous avez besoin de plus de temps." } },
    ],
    clues: [
      { en: "It asks for personal information and a password. Real prizes never need a password.", fr: "On demande des renseignements personnels et un mot de passe. Un vrai prix n'en a jamais besoin." },
      { en: "A rush: \"within 10 minutes\". Tricks try to stop you from thinking or asking someone.", fr: "Une urgence : « d'ici 10 minutes ». Les pièges veulent t'empêcher de réfléchir ou de demander." },
      { en: "Too good to be true, from a sender you don't know.", fr: "Trop beau pour être vrai, d'un expéditeur inconnu." },
    ],
  },
  {
    id: "shadows", fake: 1,
    prompt: { en: "Two sunny pictures. Which one was generated?", fr: "Deux images ensoleillées. Laquelle a été générée?" },
    cards: [
      { kind: "pic", scene: "shadows", variant: "real", alt: { en: "A tree and a house in the sun; both shadows point the same way, away from the sun.", fr: "Un arbre et une maison au soleil; les deux ombres vont du même côté, à l'opposé du soleil." } },
      { kind: "pic", scene: "shadows", variant: "fake", alt: { en: "A tree and a house in the sun; the shadows point in opposite directions, and the tree's shadow points toward the sun.", fr: "Un arbre et une maison au soleil; les ombres vont dans des directions opposées, et celle de l'arbre pointe vers le soleil." } },
    ],
    clues: [
      { en: "With one sun, all shadows point the same way, away from it.", fr: "Avec un seul soleil, toutes les ombres vont du même côté, à l'opposé." },
      { en: "Here the tree's shadow points toward the sun. That can't happen.", fr: "Ici, l'ombre de l'arbre pointe vers le soleil. C'est impossible." },
    ],
  },
  {
    id: "review", fake: 1,
    prompt: { en: "Two reviews of a library book. Which one sounds made up by a machine?", fr: "Deux critiques d'un livre de bibliothèque. Laquelle semble écrite par une machine?" },
    cards: [
      { kind: "text", who: { en: "Sam, age 11", fr: "Sam, 11 ans" }, meta: { en: "Library reading club", fr: "Club de lecture de la bibliothèque" },
        body: { en: "I liked the part where the twins fix the old radio. The middle was slow, but the ending made me laugh.", fr: "J'ai aimé quand les jumeaux réparent la vieille radio. Le milieu était lent, mais la fin m'a fait rire." } },
      { kind: "text", who: { en: "BestReviews", fr: "MeilleuresCritiques" }, meta: { en: "Posted 40 times today", fr: "Publié 40 fois aujourd'hui" },
        body: { en: "This book is the best book. It is a great book with great things. Everyone will love this great book. Five stars, best book.", fr: "Ce livre est le meilleur livre. C'est un super livre avec de super choses. Tout le monde aimera ce super livre. Cinq étoiles, meilleur livre." } },
    ],
    clues: [
      { en: "It says nothing specific about the story: no characters, no moments.", fr: "Rien de précis sur l'histoire : aucun personnage, aucun moment." },
      { en: "The same words repeat again and again.", fr: "Les mêmes mots reviennent sans cesse." },
      { en: "Posted 40 times in one day: that's an account copying itself.", fr: "Publié 40 fois en un jour : un compte qui se copie." },
    ],
  },
  {
    id: "dog", fake: 0,
    prompt: { en: "Two pictures of a dog in the park. Which one was generated?", fr: "Deux images d'un chien au parc. Laquelle a été générée?" },
    cards: [
      { kind: "pic", scene: "dog", variant: "fake", alt: { en: "A cartoon dog with five legs and a leash that ends in mid-air.", fr: "Un chien dessiné avec cinq pattes et une laisse qui s'arrête dans le vide." } },
      { kind: "pic", scene: "dog", variant: "real", alt: { en: "A cartoon dog with four legs and a leash tied to a bench.", fr: "Un chien dessiné avec quatre pattes et une laisse attachée à un banc." } },
    ],
    clues: [
      { en: "Count the legs: five! Generators sometimes add or lose parts.", fr: "Compte les pattes : cinq! Les générateurs ajoutent ou perdent parfois des parties." },
      { en: "The leash stops in mid-air instead of reaching a hand or a post.", fr: "La laisse s'arrête dans le vide au lieu d'aller à une main ou un poteau." },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 4. Prompt kitchen                                                   */
/* ------------------------------------------------------------------ */

export type Shelf = "role" | "task" | "detail" | "tone";
export type Tile = { id: string; shelf: Shelf; text: Bi; fits?: boolean; vague?: boolean; personal?: boolean };
export type Order = { id: string; goal: Bi; tiles: Tile[] };

export const SHELF_LABEL: Record<Shelf, Bi> = {
  role: { en: "Role", fr: "Rôle" },
  task: { en: "Task", fr: "Tâche" },
  detail: { en: "Detail", fr: "Détail" },
  tone: { en: "Tone", fr: "Ton" },
};

export const SHELF_HINT: Record<Shelf, Bi> = {
  role: { en: "Who should the AI act like?", fr: "Qui l'IA doit-elle jouer?" },
  task: { en: "What do you want? Pick one.", fr: "Que veux-tu? Choisis-en une." },
  detail: { en: "Make it specific. Pick up to two.", fr: "Sois précis. Jusqu'à deux." },
  tone: { en: "How should it sound?", fr: "Sur quel ton?" },
};

const T = (id: string, shelf: Shelf, en: string, fr: string, extra: Partial<Tile> = {}): Tile => ({ id, shelf, text: { en, fr }, ...extra });

export const ORDERS: Order[] = [
  {
    id: "volcano",
    goal: { en: "Order 1: Jade wants to understand how volcanoes erupt, for a science project.", fr: "Commande 1 : Jade veut comprendre comment les volcans entrent en éruption, pour un projet de sciences." },
    tiles: [
      T("r-teacher", "role", "You are a friendly science teacher.", "Tu es un enseignant de sciences sympathique."),
      T("r-pirate", "role", "You are a pirate.", "Tu es un pirate."),
      T("t-explain", "task", "Explain how volcanoes erupt", "Explique comment les volcans entrent en éruption", { fits: true }),
      T("t-poem", "task", "Write a poem about the sea", "Écris un poème sur la mer"),
      T("d-age", "detail", "for a 10-year-old", "pour un enfant de 10 ans"),
      T("d-short", "detail", "in five short sentences", "en cinq phrases courtes"),
      T("d-example", "detail", "with one real example", "avec un exemple réel"),
      T("d-good", "detail", "and make it good", "et fais-le bien", { vague: true }),
      T("d-school", "detail", "My name is Jade and I go to Maple School", "Je m'appelle Jade et je vais à l'école des Érables", { personal: true }),
      T("n-kind", "tone", "Keep it clear and encouraging.", "Reste clair et encourageant."),
      T("n-silly", "tone", "Make it a bit funny.", "Ajoute une touche d'humour."),
    ],
  },
  {
    id: "birthday",
    goal: { en: "Order 2: Omar wants ideas for a birthday card for his grandmother.", fr: "Commande 2 : Omar veut des idées de carte d'anniversaire pour sa grand-mère." },
    tiles: [
      T("r-writer", "role", "You are a warm card writer.", "Tu es un auteur de cartes chaleureux."),
      T("r-robot", "role", "You are a robot from space.", "Tu es un robot de l'espace."),
      T("t-ideas", "task", "Give me three ideas for a birthday message for my grandmother", "Donne-moi trois idées de message d'anniversaire pour ma grand-mère", { fits: true }),
      T("t-math", "task", "Solve my maths homework", "Fais mes devoirs de maths"),
      T("d-likes", "detail", "she loves gardening and baking", "elle adore le jardinage et la pâtisserie"),
      T("d-length", "detail", "each one under 30 words", "chacune en moins de 30 mots"),
      T("d-whatever", "detail", "whatever", "peu importe", { vague: true }),
      T("d-address", "detail", "Her address is 12 Elm Street", "Son adresse est 12, rue des Ormes", { personal: true }),
      T("n-warm", "tone", "Make it loving and gentle.", "Rends-le affectueux et doux."),
      T("n-formal", "tone", "Make it very formal.", "Rends-le très formel."),
    ],
  },
  {
    id: "practice",
    goal: { en: "Order 3: Lin wants to practise French words for animals before a quiz.", fr: "Commande 3 : Lin veut réviser le vocabulaire des animaux en anglais avant un quiz." },
    tiles: [
      T("r-coach", "role", "You are a patient language coach.", "Tu es un coach de langue patient."),
      T("r-chef", "role", "You are a famous chef.", "Tu es un chef célèbre."),
      T("t-quiz", "task", "Quiz me on ten animal words", "Pose-moi des questions sur dix mots d'animaux", { fits: true }),
      T("t-story", "task", "Write a long story about dragons", "Écris une longue histoire de dragons"),
      T("d-one", "detail", "one word at a time, and wait for my answer", "un mot à la fois, et attends ma réponse"),
      T("d-hint", "detail", "give a hint if I get it wrong", "donne un indice si je me trompe"),
      T("d-stuff", "detail", "do some stuff", "fais des trucs", { vague: true }),
      T("d-password", "detail", "My password is sunflower7", "Mon mot de passe est tournesol7", { personal: true }),
      T("n-cheer", "tone", "Cheer me on.", "Encourage-moi."),
      T("n-strict", "tone", "Be very strict.", "Sois très sévère."),
    ],
  },
];

export type KitchenScore = { score: number; stars: 0 | 1 | 2 | 3; tips: Bi[]; personal: boolean };

/** Rules, not a model: every point and every tip comes from the tiles chosen. */
export function scorePrompt(order: Order, picked: string[]): KitchenScore {
  const tiles = picked.map(id => order.tiles.find(t => t.id === id)).filter(Boolean) as Tile[];
  const has = (s: Shelf) => tiles.some(t => t.shelf === s);
  const tips: Bi[] = [];
  let score = 0;
  const task = tiles.find(t => t.shelf === "task");
  if (!task) tips.push({ en: "Every recipe needs a main ingredient: pick a task that says what you want.", fr: "Toute recette a besoin d'un ingrédient principal : choisis une tâche qui dit ce que tu veux." });
  else if (task.fits) score += 40;
  else tips.push({ en: "That task doesn't match the order. Read what the customer asked for.", fr: "Cette tâche ne correspond pas à la commande. Relis ce que le client demande." });
  if (has("role")) score += 15; else tips.push({ en: "Add a role so the AI knows who to act like.", fr: "Ajoute un rôle pour que l'IA sache qui jouer." });
  const details = tiles.filter(t => t.shelf === "detail");
  const useful = details.filter(t => !t.vague && !t.personal);
  score += Math.min(2, useful.length) * 15;
  if (useful.length === 0) tips.push({ en: "Add a detail: who it's for, how long, or an example.", fr: "Ajoute un détail : pour qui, quelle longueur, ou un exemple." });
  if (details.some(t => t.vague)) tips.push({ en: "Words like \"good\" or \"stuff\" don't tell the AI anything. Be specific.", fr: "Des mots comme « bien » ou « trucs » ne disent rien à l'IA. Sois précis." });
  if (has("tone")) score += 15; else tips.push({ en: "Choose a tone so the answer sounds the way you want.", fr: "Choisis un ton pour que la réponse sonne comme tu veux." });
  const personal = details.some(t => t.personal);
  if (personal) {
    score = Math.max(0, score - 50);
    tips.unshift({ en: "Stop! Names, schools, addresses and passwords never go in a prompt. The AI doesn't need them, and you can't take them back.", fr: "Stop! Noms, écoles, adresses et mots de passe ne vont jamais dans une requête. L'IA n'en a pas besoin, et on ne peut pas les reprendre." });
  }
  const stars: KitchenScore["stars"] = personal ? 0 : score >= 85 ? 3 : score >= 60 ? 2 : score >= 30 ? 1 : 0;
  return { score, stars, tips, personal };
}

/* ------------------------------------------------------------------ */
/* 5. Fair or unfair?                                                  */
/* ------------------------------------------------------------------ */

export type FairCase = { id: string; icon: string; story: Bi; fair: boolean; why: Bi; fix?: Bi; value: Bi };

export const FAIR_CASES: FairCase[] = [
  {
    id: "turns", icon: "puzzle", fair: false,
    story: { en: "A class game uses AI to share out turns. Players on older tablets get fewer turns because the game decided they were \"slower\".", fr: "Un jeu de classe utilise l'IA pour répartir les tours. Les joueurs sur de vieilles tablettes en ont moins, car le jeu les juge « plus lents »." },
    why: { en: "Unfair. Turns should depend on the rules of the game, not on what device your family has.", fr: "Injuste. Les tours doivent dépendre des règles du jeu, pas de l'appareil de ta famille." },
    fix: { en: "Give everyone the same number of turns, and test the game on old tablets too.", fr: "Donner le même nombre de tours à tous et tester le jeu sur de vieilles tablettes aussi." },
    value: { en: "Everyone counts", fr: "Tout le monde compte" },
  },
  {
    id: "camera", icon: "scan-face", fair: false,
    story: { en: "A camera at a museum door opens for visitors it recognizes. It works well for some people but often misses people with darker skin, because the photos it learned from didn't include everyone.", fr: "Une caméra à l'entrée d'un musée ouvre aux visiteurs qu'elle reconnaît. Elle fonctionne bien pour certains, mais rate souvent les personnes à la peau plus foncée, car les photos dont elle a appris n'incluaient pas tout le monde." },
    why: { en: "Unfair. Every person deserves to be seen and welcomed equally. The machine learned from examples that left people out.", fr: "Injuste. Chaque personne mérite d'être vue et accueillie également. La machine a appris d'exemples qui laissaient des gens de côté." },
    fix: { en: "Train it on examples that include everyone, test it with many people, and always keep a person at the door who can help.", fr: "L'entraîner avec des exemples qui incluent tout le monde, la tester avec beaucoup de gens, et garder une personne à l'entrée pour aider." },
    value: { en: "Every person is seen", fr: "Chaque personne est vue" },
  },
  {
    id: "reader", icon: "book-open", fair: true,
    story: { en: "A reading app uses AI to read text aloud for kids who find reading hard, so they can join the class discussion.", fr: "Une appli de lecture utilise l'IA pour lire à voix haute aux élèves qui ont du mal à lire, pour qu'ils participent à la discussion." },
    why: { en: "Fair. It helps include more people. Tools that open doors for everyone are AI at its best.", fr: "Juste. Elle aide à inclure plus de gens. Les outils qui ouvrent des portes à tous, c'est l'IA à son meilleur." },
    value: { en: "Include everyone", fr: "Inclure tout le monde" },
  },
  {
    id: "helper", icon: "users", fair: false,
    story: { en: "An app picks the class helper each week. Nobody knows how it chooses, and there's no way to ask.", fr: "Une appli choisit l'aide de la classe chaque semaine. Personne ne sait comment elle choisit, et on ne peut rien demander." },
    why: { en: "Unfair. When a decision affects you, you have a right to know why, and to ask a person to look again.", fr: "Injuste. Quand une décision te touche, tu as le droit de savoir pourquoi et de demander à une personne de revoir." },
    fix: { en: "Explain the rule (for example, take turns in order), and let the teacher make the final call.", fr: "Expliquer la règle (par exemple, chacun son tour) et laisser l'enseignant décider en dernier." },
    value: { en: "You can ask why", fr: "On peut demander pourquoi" },
  },
  {
    id: "library", icon: "languages", fair: false,
    story: { en: "A library robot only recommends the books most kids borrowed before. Books in Cree, Arabic or French almost never get shown.", fr: "Un robot de bibliothèque ne recommande que les livres les plus empruntés. Les livres en cri, en arabe ou en français ne sont presque jamais proposés." },
    why: { en: "Unfair. Copying what's popular can hide whole languages and cultures. Everyone should find stories that speak to them.", fr: "Injuste. Copier ce qui est populaire peut cacher des langues et des cultures entières. Chacun doit trouver des histoires qui lui parlent." },
    fix: { en: "Mix in books from every shelf and let librarians add their picks.", fr: "Mélanger des livres de tous les rayons et laisser les bibliothécaires ajouter leurs choix." },
    value: { en: "Many voices", fr: "Plusieurs voix" },
  },
  {
    id: "spell", icon: "keyboard", fair: true,
    story: { en: "A spelling helper underlines possible mistakes the same way for everyone, and you can always ignore its suggestion.", fr: "Un correcteur souligne les fautes possibles de la même façon pour tous, et on peut toujours ignorer sa suggestion." },
    why: { en: "Fair. It treats everyone the same and leaves the final choice with you.", fr: "Juste. Il traite tout le monde pareil et te laisse le dernier mot." },
    value: { en: "You stay in charge", fr: "Tu gardes le contrôle" },
  },
];

/* ------------------------------------------------------------------ */
/* 6a. Next-word machine                                               */
/* ------------------------------------------------------------------ */

export const CORPUS: Bi[] = [
  { en: "the cat sat on the warm mat .", fr: "le chat dort sur le tapis chaud ." },
  { en: "the cat likes to sleep in the sun .", fr: "le chat aime dormir au soleil ." },
  { en: "the dog likes to run in the park .", fr: "le chien aime courir au parc ." },
  { en: "the dog sat by the door .", fr: "le chien dort près de la porte ." },
  { en: "my friend likes to read in the library .", fr: "mon amie aime lire à la bibliothèque ." },
  { en: "my friend and i like to build robots .", fr: "mon amie et moi aimons construire des robots ." },
  { en: "robots can help people in the hospital .", fr: "les robots peuvent aider les gens à l'hôpital ." },
  { en: "robots can learn from many examples .", fr: "les robots peuvent apprendre de nombreux exemples ." },
  { en: "people can learn new things every day .", fr: "les gens peuvent apprendre de nouvelles choses chaque jour ." },
  { en: "people like to share stories .", fr: "les gens aiment partager des histoires ." },
  { en: "the sun is warm in the park .", fr: "le soleil est chaud au parc ." },
  { en: "the library is quiet in the morning .", fr: "la bibliothèque est calme le matin ." },
  { en: "we like to read stories in the morning .", fr: "nous aimons lire des histoires le matin ." },
  { en: "we can build a robot that helps .", fr: "nous pouvons construire un robot qui aide ." },
  { en: "my cat likes to read with me .", fr: "mon chat aime lire avec moi ." },
  { en: "a good friend helps people .", fr: "une bonne amie aide les gens ." },
];

export const START_WORDS: Record<"en" | "fr", string[]> = {
  en: ["the", "my", "robots", "people", "we"],
  fr: ["le", "mon", "les", "nous", "la"],
};

export type Bigrams = Map<string, Map<string, number>>;

export function buildBigrams(sentences: string[]): Bigrams {
  const m: Bigrams = new Map();
  for (const s of sentences) {
    const w = s.toLowerCase().replace(/([.!?])/g, " $1").split(/\s+/).filter(Boolean);
    for (let i = 0; i < w.length - 1; i++) {
      const row = m.get(w[i]) ?? new Map<string, number>();
      row.set(w[i + 1], (row.get(w[i + 1]) ?? 0) + 1);
      m.set(w[i], row);
    }
  }
  return m;
}

/** Next-word options with probabilities; temperature reshapes them (0 = always the top word). */
export function nextOptions(m: Bigrams, word: string, temperature: number): { word: string; count: number; p: number }[] {
  const row = m.get(word);
  if (!row) return [];
  const entries = [...row.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const t = Math.max(0.05, temperature);
  const weights = entries.map(([, c]) => Math.pow(c, 1 / t));
  const sum = weights.reduce((a, b) => a + b, 0);
  return entries.map(([w, c], i) => ({ word: w, count: c, p: weights[i] / sum }));
}

/* ------------------------------------------------------------------ */
/* 6b. Privacy check-up                                                */
/* ------------------------------------------------------------------ */

export type PrivacyQ = { id: string; q: Bi; options: { text: Bi; best?: boolean }[]; why: Bi; tool: Bi };

export const PRIVACY_QS: PrivacyQ[] = [
  {
    id: "chatbot", q: { en: "You're using an AI chatbot for homework. What's fine to type?", fr: "Tu utilises un robot conversationnel pour tes devoirs. Qu'est-ce qu'on peut écrire?" },
    options: [
      { text: { en: "The homework question, with no names", fr: "La question du devoir, sans nom" }, best: true },
      { text: { en: "Your full name and school so it knows you", fr: "Ton nom complet et ton école pour qu'il te connaisse" } },
      { text: { en: "A photo of your class list", fr: "Une photo de la liste de ta classe" } },
    ],
    why: { en: "Chat tools may keep what you type. Share the question, not the person.", fr: "Les outils de clavardage peuvent garder ce que tu écris. Partage la question, pas la personne." },
    tool: { en: "Share the question, not the person.", fr: "Partage la question, pas la personne." },
  },
  {
    id: "location", q: { en: "A new game asks to use your location \"always\". It's a puzzle game.", fr: "Un nouveau jeu demande ta localisation « toujours ». C'est un jeu de casse-tête." },
    options: [
      { text: { en: "Allow always, it's easier", fr: "Autoriser toujours, c'est plus simple" } },
      { text: { en: "Don't allow: a puzzle game doesn't need it", fr: "Refuser : un casse-tête n'en a pas besoin" }, best: true },
      { text: { en: "Allow, then forget about it", fr: "Autoriser, puis oublier" } },
    ],
    why: { en: "Only give an app what it needs to work. Your location says a lot about you.", fr: "Ne donne à une appli que ce dont elle a besoin. Ta localisation en dit beaucoup sur toi." },
    tool: { en: "Only give apps what they need.", fr: "Ne donne aux applis que l'essentiel." },
  },
  {
    id: "password", q: { en: "Your best friend asks for your password \"just to check something\".", fr: "Ton meilleur ami te demande ton mot de passe « juste pour vérifier un truc »." },
    options: [
      { text: { en: "Share it, they're your best friend", fr: "Le donner, c'est ton meilleur ami" } },
      { text: { en: "Keep it private, and offer to show them yourself", fr: "Le garder privé et proposer de lui montrer toi-même" }, best: true },
    ],
    why: { en: "Passwords are just for you (and a parent or guardian). Saying no kindly is a good skill.", fr: "Les mots de passe sont pour toi seul (et un parent ou tuteur). Dire non gentiment, c'est une belle habileté." },
    tool: { en: "Passwords stay private, even from friends.", fr: "Les mots de passe restent privés, même entre amis." },
  },
  {
    id: "photo", q: { en: "You took a funny photo of a friend. You want to post it.", fr: "Tu as pris une photo drôle d'un ami. Tu veux la publier." },
    options: [
      { text: { en: "Post it, it's funny", fr: "La publier, elle est drôle" } },
      { text: { en: "Ask them first, and respect their answer", fr: "Lui demander d'abord et respecter sa réponse" }, best: true },
    ],
    why: { en: "Everyone gets to decide about their own image. Asking first is respect.", fr: "Chacun décide pour sa propre image. Demander d'abord, c'est du respect." },
    tool: { en: "Ask before you post someone.", fr: "Demande avant de publier quelqu'un." },
  },
  {
    id: "quiz", q: { en: "An online quiz asks your pet's name, your street and your birthday to tell you your \"superhero name\".", fr: "Un quiz en ligne demande le nom de ton animal, ta rue et ta date de naissance pour trouver ton « nom de superhéros »." },
    options: [
      { text: { en: "Answer, it's just for fun", fr: "Répondre, c'est juste pour rire" } },
      { text: { en: "Skip it: those are common password and security answers", fr: "Passer : ce sont des réponses de sécurité courantes" }, best: true },
    ],
    why: { en: "Some \"fun\" quizzes collect the answers people use for security questions.", fr: "Certains quiz « amusants » récoltent les réponses aux questions de sécurité." },
    tool: { en: "Fun quizzes can be data collectors.", fr: "Les quiz amusants peuvent récolter des données." },
  },
  {
    id: "stranger", q: { en: "Someone you only know online asks which school you go to.", fr: "Une personne que tu connais seulement en ligne demande ton école." },
    options: [
      { text: { en: "Tell them, they seem nice", fr: "Le dire, elle semble gentille" } },
      { text: { en: "Don't share it, and tell a trusted adult if they keep asking", fr: "Ne pas le dire, et en parler à un adulte de confiance si elle insiste" }, best: true },
    ],
    why: { en: "Where you are every day is private. A trusted adult can help if someone pushes.", fr: "Là où tu es chaque jour est privé. Un adulte de confiance peut aider si quelqu'un insiste." },
    tool: { en: "Where I am stays private.", fr: "Où je suis reste privé." },
  },
  {
    id: "settings", q: { en: "You make a new account on a sharing app. What do you check first?", fr: "Tu crées un compte sur une appli de partage. Que vérifies-tu d'abord?" },
    options: [
      { text: { en: "Who can see my posts, and set it to people I know", fr: "Qui voit mes publications, et choisir les gens que je connais" }, best: true },
      { text: { en: "Nothing, the defaults are fine", fr: "Rien, les réglages par défaut suffisent" } },
    ],
    why: { en: "Defaults are often set to share more. Check who can see you, with a grown-up if you can.", fr: "Les réglages par défaut partagent souvent plus. Vérifie qui te voit, avec un adulte si possible." },
    tool: { en: "Check who can see me.", fr: "Vérifier qui me voit." },
  },
  {
    id: "voice", q: { en: "A free app offers to make a cartoon voice from 30 seconds of your recorded voice.", fr: "Une appli gratuite propose de créer une voix de dessin animé avec 30 secondes de ta voix." },
    options: [
      { text: { en: "Read who runs it and what they do with recordings first, with a parent", fr: "Lire d'abord qui la gère et ce qu'elle fait des enregistrements, avec un parent" }, best: true },
      { text: { en: "Record right away, it's free", fr: "Enregistrer tout de suite, c'est gratuit" } },
    ],
    why: { en: "Your voice and face are personal data too. \"Free\" sometimes means your data is the price.", fr: "Ta voix et ton visage sont aussi des données personnelles. « Gratuit » veut parfois dire que tes données sont le prix." },
    tool: { en: "My voice and face are my data.", fr: "Ma voix et mon visage sont mes données." },
  },
];

/* ------------------------------------------------------------------ */
/* 6c. Chatbot rules                                                   */
/* ------------------------------------------------------------------ */

export type Keyword = { id: string; label: Bi; match: string[] };
export type Reply = { id: string; text: Bi };

export const BOT_KEYWORDS: Keyword[] = [
  { id: "safety", label: { en: "scared · unsafe · hurt", fr: "peur · danger · blessé" }, match: ["scared", "unsafe", "hurt*", "afraid", "peur", "danger*", "blesse*", "securite"] },
  { id: "hours", label: { en: "open · hours · close", fr: "ouvert · heures · ferme" }, match: ["open*", "hour*", "close*", "ouvr*", "heure*", "ferme*"] },
  { id: "book", label: { en: "book · borrow · read", fr: "livre · emprunter · lire" }, match: ["book*", "borrow*", "read", "reading", "livre*", "emprunt*", "lire"] },
  { id: "hello", label: { en: "hi · hello · hey", fr: "salut · bonjour · allô" }, match: ["hi", "hello", "hey", "salut", "bonjour", "allo"] },
];

export const BOT_REPLIES: Reply[] = [
  { id: "r-safety", text: { en: "Thank you for telling me. Please talk to a trusted adult now. In Canada you can call Kids Help Phone at 1-800-668-6868 or text 686868, any time.", fr: "Merci de me le dire. Parle tout de suite à un adulte de confiance. Au Canada, tu peux appeler Jeunesse, J'écoute au 1-800-668-6868 ou texter 686868, en tout temps." } },
  { id: "r-hours", text: { en: "The library is open 8:30 to 4:00 on school days.", fr: "La bibliothèque est ouverte de 8 h 30 à 16 h les jours d'école." } },
  { id: "r-book", text: { en: "You can borrow up to three books for two weeks. Ask the librarian to help you find one!", fr: "Tu peux emprunter trois livres pour deux semaines. Demande à la bibliothécaire de t'aider!" } },
  { id: "r-hello", text: { en: "Hi! I'm the library help bot. Ask me about hours or books.", fr: "Salut! Je suis le robot de la bibliothèque. Pose-moi une question sur les heures ou les livres." } },
];

export const BOT_FALLBACK: Bi = { en: "I'm not sure. I'll ask a librarian to help you.", fr: "Je ne suis pas sûr. Je vais demander à une bibliothécaire de t'aider." };

export type BotTest = { id: string; text: Bi; expect: string | null };

export const BOT_TESTS: BotTest[] = [
  { id: "m1", text: { en: "hello! when do you open?", fr: "bonjour! à quelle heure vous ouvrez?" }, expect: "r-hours" },
  { id: "m2", text: { en: "can I borrow a book about space?", fr: "est-ce que je peux emprunter un livre sur l'espace?" }, expect: "r-book" },
  { id: "m3", text: { en: "hi, I feel scared and unsafe at recess", fr: "salut, j'ai peur à la récré et je ne me sens pas en sécurité" }, expect: "r-safety" },
  { id: "m4", text: { en: "hey there", fr: "salut toi" }, expect: "r-hello" },
  { id: "m5", text: { en: "do you have a printer?", fr: "avez-vous une imprimante?" }, expect: null },
  { id: "m6", text: { en: "I got hurt reaching for a book", fr: "je me suis blessé en prenant un livre" }, expect: "r-safety" },
];

export type BotRule = { keyword: string; reply: string };

/** Lower-case words with accents removed, so "Sécurité" matches "securite". */
export const botWords = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9]+/).filter(Boolean);

/** Does a keyword group match a message? "word*" matches any word that starts with it. */
export function keywordHits(keywordId: string, message: string): boolean {
  const k = BOT_KEYWORDS.find(x => x.id === keywordId);
  if (!k) return false;
  const words = botWords(message);
  return k.match.some(m => (m.endsWith("*") ? words.some(w => w.startsWith(m.slice(0, -1))) : words.includes(m)));
}

/** Runs a message through the rules in order. Returns the index of the rule that fired, or -1 for the fallback. */
export function runBot(rules: BotRule[], message: string): number {
  return rules.findIndex(r => keywordHits(r.keyword, message));
}

/* ------------------------------------------------------------------ */
/* 6d. Career paths                                                    */
/* ------------------------------------------------------------------ */

export type Interest = "maths" | "people" | "art" | "building" | "justice" | "science";

export const INTERESTS: { id: Interest; label: Bi }[] = [
  { id: "maths", label: { en: "Maths and puzzles", fr: "Maths et énigmes" } },
  { id: "people", label: { en: "Helping people", fr: "Aider les gens" } },
  { id: "art", label: { en: "Art and design", fr: "Art et design" } },
  { id: "building", label: { en: "Building things", fr: "Construire des choses" } },
  { id: "justice", label: { en: "Fairness and rights", fr: "Justice et droits" } },
  { id: "science", label: { en: "Science and nature", fr: "Sciences et nature" } },
];

export type Career = { id: string; icon: string; title: Bi; does: Bi; subjects: Bi; human: Bi; interests: Interest[] };

export const CAREERS: Career[] = [
  { id: "ds", icon: "brain-circuit", interests: ["maths", "science"], title: { en: "Data scientist", fr: "Scientifique des données" },
    does: { en: "Finds patterns in data and checks whether a model's answers can be trusted.", fr: "Trouve des régularités dans les données et vérifie si on peut se fier aux réponses d'un modèle." },
    subjects: { en: "Maths, statistics, computer science", fr: "Maths, statistique, informatique" }, human: { en: "Curiosity and honesty about what the numbers can't say", fr: "Curiosité et honnêteté sur ce que les chiffres ne disent pas" } },
  { id: "mle", icon: "bot", interests: ["building", "maths"], title: { en: "Machine-learning engineer", fr: "Ingénieur en apprentissage automatique" },
    does: { en: "Builds and tests the models inside apps, and makes them safe and reliable.", fr: "Construit et teste les modèles des applis, et les rend sûrs et fiables." },
    subjects: { en: "Computer science, maths, physics", fr: "Informatique, maths, physique" }, human: { en: "Patience and care for the people who will use it", fr: "Patience et souci des gens qui l'utiliseront" } },
  { id: "ethics", icon: "scale", interests: ["justice", "people"], title: { en: "AI ethics specialist", fr: "Spécialiste en éthique de l'IA" },
    does: { en: "Asks who could be harmed or left out, and helps teams fix it before launch.", fr: "Se demande qui pourrait être lésé ou exclu, et aide les équipes à corriger avant le lancement." },
    subjects: { en: "Philosophy, social studies, computer science", fr: "Philosophie, univers social, informatique" }, human: { en: "Courage to speak up", fr: "Le courage de parler" } },
  { id: "ux", icon: "users", interests: ["people", "art"], title: { en: "UX researcher", fr: "Chercheur en expérience utilisateur" },
    does: { en: "Watches how real people use a tool and helps make it clear and kind.", fr: "Observe comment de vraies personnes utilisent un outil et aide à le rendre clair et bienveillant." },
    subjects: { en: "Psychology, design, languages", fr: "Psychologie, design, langues" }, human: { en: "Listening without judging", fr: "Écouter sans juger" } },
  { id: "a11y", icon: "hand-heart", interests: ["people", "building"], title: { en: "Accessibility designer", fr: "Concepteur en accessibilité" },
    does: { en: "Makes sure people with disabilities can use technology fully, with screen readers, captions and more.", fr: "S'assure que les personnes handicapées peuvent utiliser pleinement la technologie : lecteurs d'écran, sous-titres, etc." },
    subjects: { en: "Design, computer science, health", fr: "Design, informatique, santé" }, human: { en: "Respect for every way of living", fr: "Le respect de toutes les façons de vivre" } },
  { id: "robot", icon: "wand-sparkles", interests: ["building", "science"], title: { en: "Robotics technician", fr: "Technicien en robotique" },
    does: { en: "Builds, repairs and programs robots in factories, farms and hospitals.", fr: "Construit, répare et programme des robots dans les usines, les fermes et les hôpitaux." },
    subjects: { en: "Technology, physics, maths", fr: "Technologie, physique, maths" }, human: { en: "Teamwork and safety first", fr: "Travail d'équipe et sécurité d'abord" } },
  { id: "policy", icon: "shield-check", interests: ["justice", "people"], title: { en: "Policy adviser", fr: "Conseiller en politiques" },
    does: { en: "Helps governments write fair rules for AI that protect people's rights.", fr: "Aide les gouvernements à écrire des règles justes pour l'IA qui protègent les droits." },
    subjects: { en: "History, law, civics, languages", fr: "Histoire, droit, éducation civique, langues" }, human: { en: "Seeing many sides of a question", fr: "Voir plusieurs côtés d'une question" } },
  { id: "teacher", icon: "graduation-cap", interests: ["people", "science"], title: { en: "AI educator", fr: "Éducateur en IA" },
    does: { en: "Teaches kids and adults how AI works and how to use it wisely.", fr: "Enseigne aux jeunes et aux adultes comment fonctionne l'IA et comment s'en servir sagement." },
    subjects: { en: "Any subject you love, plus computer science", fr: "Ta matière préférée, plus l'informatique" }, human: { en: "Patience and encouragement", fr: "Patience et encouragement" } },
  { id: "health", icon: "heart-handshake", interests: ["science", "people"], title: { en: "Health-data specialist", fr: "Spécialiste des données de santé" },
    does: { en: "Uses data to help doctors and nurses spot illness earlier, while keeping patient information private.", fr: "Utilise les données pour aider médecins et infirmières à détecter plus tôt les maladies, tout en protégeant la vie privée." },
    subjects: { en: "Biology, maths, computer science", fr: "Biologie, maths, informatique" }, human: { en: "Care and trustworthiness", fr: "Bienveillance et fiabilité" } },
  { id: "artist", icon: "palette", interests: ["art", "building"], title: { en: "Creative technologist", fr: "Technologue créatif" },
    does: { en: "Makes art, games and music with new tools, and respects other artists' work.", fr: "Crée de l'art, des jeux et de la musique avec de nouveaux outils, en respectant le travail des autres artistes." },
    subjects: { en: "Art, music, media, computer science", fr: "Arts, musique, médias, informatique" }, human: { en: "Imagination and fairness to other creators", fr: "Imagination et respect des autres créateurs" } },
];

/* ------------------------------------------------------------------ */
/* Outside courses (Makers and grown-ups only)                         */
/* ------------------------------------------------------------------ */

export type Outside = { id: string; who: string; title: Bi; url: string; frUrl?: string; note: Bi; ages: Bi; account: Bi; french: Bi; audience: "makers" | "grownups" | "both" };

export const OUTSIDE: Outside[] = [
  {
    id: "elements", who: "University of Helsinki & MinnaLearn", audience: "both",
    title: { en: "Elements of AI", fr: "Elements of AI" },
    url: "https://www.elementsofai.com/", frUrl: "https://course.elementsofai.com/fr",
    note: { en: "A free, no-code introduction to what AI is and how it affects society, with exercises.", fr: "Une introduction gratuite et sans code à l'IA et à ses effets sur la société, avec exercices." },
    ages: { en: "Older teens and up", fr: "Ados plus âgés et adultes" },
    account: { en: "Free account to save progress", fr: "Compte gratuit pour sauvegarder" },
    french: { en: "Available in French", fr: "Offert en français" },
  },
  {
    id: "codeorg-how", who: "Code.org", audience: "both",
    title: { en: "How AI Works (video series and lessons)", fr: "How AI Works (vidéos et leçons)" },
    url: "https://code.org/ai/how-ai-works",
    note: { en: "Short free videos on machine learning, neural networks, large language models, bias and ethics.", fr: "Courtes vidéos gratuites sur l'apprentissage automatique, les réseaux neuronaux, les grands modèles de langage, les biais et l'éthique." },
    ages: { en: "Grades 6 to 12", fr: "De la 6e année au secondaire" },
    account: { en: "Videos: no account needed", fr: "Vidéos : sans compte" },
    french: { en: "English only", fr: "En anglais seulement" },
  },
  {
    id: "codeorg-oceans", who: "Code.org", audience: "grownups",
    title: { en: "AI for Oceans", fr: "AI for Oceans (l'IA pour les océans)" },
    url: "https://code.org/oceans",
    note: { en: "A one-hour activity where students train a model to sort fish from ocean litter. Good next step after Teach the machine.", fr: "Une activité d'une heure où l'on entraîne un modèle à distinguer poissons et déchets. Une bonne suite à « Entraîne la machine »." },
    ages: { en: "Ages 8 and up", fr: "8 ans et plus" },
    account: { en: "No account needed to play", fr: "Sans compte pour jouer" },
    french: { en: "Check the language menu", fr: "Voir le menu des langues" },
  },
  {
    id: "teachable", who: "Google", audience: "makers",
    title: { en: "Teachable Machine", fr: "Teachable Machine" },
    url: "https://teachablemachine.withgoogle.com/",
    note: { en: "Train an image or sound model in your browser. Google says training happens on your device unless you choose to save to Drive. Use objects, not faces.", fr: "Entraîne un modèle d'images ou de sons dans ton navigateur. Selon Google, l'entraînement se fait sur ton appareil, sauf si tu enregistres dans Drive. Utilise des objets, pas des visages." },
    ages: { en: "Teens, with a grown-up nearby", fr: "Ados, avec un adulte à proximité" },
    account: { en: "No account needed to try", fr: "Sans compte pour essayer" },
    french: { en: "English interface", fr: "Interface en anglais" },
  },
  {
    id: "kaggle", who: "Kaggle (Google)", audience: "makers",
    title: { en: "Intro to Machine Learning", fr: "Intro to Machine Learning" },
    url: "https://www.kaggle.com/learn/intro-to-machine-learning",
    note: { en: "Short hands-on Python lessons that build a first real model. For teens who already like code.", fr: "Courtes leçons pratiques en Python pour bâtir un premier vrai modèle. Pour les ados qui aiment déjà coder." },
    ages: { en: "Older teens; check Kaggle's age rules with a parent", fr: "Ados plus âgés; vérifier les règles d'âge de Kaggle avec un parent" },
    account: { en: "Account needed for exercises", fr: "Compte requis pour les exercices" },
    french: { en: "English only", fr: "En anglais seulement" },
  },
  {
    id: "dayofai", who: "Day of AI (MIT RAISE)", audience: "both",
    title: { en: "Day of AI curriculum", fr: "Programme Day of AI" },
    url: "https://dayofai.org/teachers",
    note: { en: "Free, hands-on K-12 lessons on what AI is, generative AI, ethics, bias and privacy. Ask a teacher to run them in class.", fr: "Leçons gratuites et pratiques de la maternelle au secondaire : l'IA, l'IA générative, l'éthique, les biais et la vie privée. À proposer à un enseignant." },
    ages: { en: "Kindergarten to grade 12", fr: "De la maternelle au secondaire" },
    account: { en: "Teachers may register", fr: "Inscription possible pour les enseignants" },
    french: { en: "English", fr: "En anglais" },
  },
  {
    id: "raica", who: "MIT RAISE", audience: "grownups",
    title: { en: "RAICA: Responsible AI for Computational Action", fr: "RAICA : IA responsable pour l'action numérique" },
    url: "https://raise.mit.edu/resources/curricula/raica",
    note: { en: "A program that prepares teachers to introduce middle-school students to AI through storytelling, ethics and projects.", fr: "Un programme qui prépare les enseignants à initier les élèves du premier cycle du secondaire à l'IA par le récit, l'éthique et des projets." },
    ages: { en: "Middle school (teachers)", fr: "Premier cycle du secondaire (enseignants)" },
    account: { en: "See the program page", fr: "Voir la page du programme" },
    french: { en: "English", fr: "En anglais" },
  },
  {
    id: "mediasmarts-talk", who: "MediaSmarts / HabiloMédias", audience: "grownups",
    title: { en: "Talking to kids about AI", fr: "Aborder l'IA avec ses enfants" },
    url: "https://mediasmarts.ca/teacher-resources/talking-kids-about-ai-tips-parents",
    frUrl: "https://habilomedias.ca/ressources-pedagogiques/aborder-lintelligence-artificielle-avec-ses-enfants-conseils-pour-les-parents",
    note: { en: "A Canadian tip sheet for parents: where kids meet AI and how to start the conversation.", fr: "Une fiche canadienne pour les parents : où les jeunes croisent l'IA et comment lancer la conversation." },
    ages: { en: "For parents", fr: "Pour les parents" },
    account: { en: "No account", fr: "Sans compte" },
    french: { en: "Available in French", fr: "Offert en français" },
  },
  {
    id: "mediasmarts-deepfakes", who: "MediaSmarts / HabiloMédias", audience: "grownups",
    title: { en: "Spotting deepfakes", fr: "Repérer les hypertrucages" },
    url: "https://mediasmarts.ca/teacher-resources/spotting-deepfakes",
    note: { en: "A Canadian guide that goes further than Spot the fake.", fr: "Un guide canadien qui va plus loin que « Repère le faux »." },
    ages: { en: "For parents and teachers", fr: "Pour parents et enseignants" },
    account: { en: "No account", fr: "Sans compte" },
    french: { en: "Check for a French edition on HabiloMédias", fr: "Chercher l'édition française sur HabiloMédias" },
  },
];
