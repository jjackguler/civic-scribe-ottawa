/**
 * The Week Sheet: the editor's weekly pick of the stories that mattered, one per desk at least,
 * in the house format (what happened, the facts, the human stakes) and linked to the reporting.
 *
 * Rules (docs/editorial-concept.md):
 * - Every fact is on the linked page. Company figures and plans are labelled as claims.
 * - No story the house rules turn down (crime and courts, death, war, elections, party politics).
 * - Newest edition first. Editions are compiled by the editor; the wording is ours, the
 *   reporting belongs to the outlets named on each item.
 *
 * Pure data: safe on the server, in the browser and in scripts.
 */
import type { Bi } from "./i18n";
import type { DeskId } from "./desks";

export type SheetItem = {
  desk: DeskId;
  headline: Bi;
  /** One sentence: what happened. */
  what: Bi;
  /** Two or three facts from the source; claims say whose claim they are. */
  facts: Bi[];
  /** Why it matters for people: our angle, kept to what the facts support. */
  stakes: Bi;
  source: { name: string; url: string; date: string };
};

export type QuickHit = { desk: DeskId; text: Bi; source: { name: string; url: string } };

export type SheetEdition = {
  id: string;
  /** Monday to Sunday the edition covers, ISO dates. */
  from: string;
  to: string;
  published: string;
  intro: Bi;
  items: SheetItem[];
  quick: QuickHit[];
};

export const SHEET_EDITIONS: SheetEdition[] = [
  {
    id: "2026-w46",
    from: "2026-11-09",
    to: "2026-11-15",
    published: "2026-11-15",
    intro: {
      en: "Two new frontier models, a humanoid maker on the stock market and Ottawa's money for AI compute and housing permits. Six stories, each with the facts and what they change for people.",
      fr: "Deux nouveaux modèles de pointe, un fabricant de robots humanoïdes en Bourse et l'argent d'Ottawa pour le calcul et les permis de logement. Six nouvelles, avec les faits et ce qu'elles changent pour les gens.",
    },
    items: [
      {
        desk: "ai",
        headline: { en: "Anthropic releases Claude Fable 5.2 and keeps Mythos 5.2 for vetted organizations", fr: "Anthropic lance Claude Fable 5.2 et réserve Mythos 5.2 aux organisations vérifiées" },
        what: {
          en: "Anthropic released two new models on 9 November: Fable 5.2, open to all users, and Mythos 5.2, offered only to vetted organizations through verification programs.",
          fr: "Anthropic a lancé deux modèles le 9 novembre : Fable 5.2, ouvert à tous, et Mythos 5.2, offert seulement aux organisations vérifiées.",
        },
        facts: [
          { en: "Fable 5.2 costs $8 per million input tokens and $40 per million output tokens, with a faster mode at $16 and $80.", fr: "Fable 5.2 coûte 8 $ par million de jetons en entrée et 40 $ en sortie; un mode plus rapide coûte 16 $ et 80 $." },
          { en: "The benchmark scores in the announcement are the company's own.", fr: "Les résultats de tests de l'annonce sont ceux de l'entreprise." },
          { en: "Anthropic still recommends Claude Opus 5.5 for most everyday coding and knowledge work.", fr: "Anthropic recommande toujours Claude Opus 5.5 pour la plupart des tâches courantes." },
        ],
        stakes: {
          en: "The most capable model is gated: a lab, not the public, decides who may use it. Watch who gets verified, and on what terms.",
          fr: "Le modèle le plus puissant est filtré : c'est un laboratoire, pas le public, qui décide qui peut s'en servir. À surveiller : qui est vérifié, et à quelles conditions.",
        },
        source: { name: "Anthropic", url: "https://www.anthropic.com/claude-fable-and-mythos-5-2", date: "2026-11-09" },
      },
      {
        desk: "ai",
        headline: { en: "Google's Gemini 4 Carbon arrives at an introductory price that doubles on 30 November", fr: "Gemini 4 Carbon de Google arrive à un prix d'introduction qui double le 30 novembre" },
        what: {
          en: "Google made Gemini 4 Carbon available on 10 November, first to Google AI Ultra subscribers and to developers through its API.",
          fr: "Google a rendu Gemini 4 Carbon disponible le 10 novembre, d'abord aux abonnés Google AI Ultra et aux développeurs par son API.",
        },
        facts: [
          { en: "API price: $2 per million input tokens and $10 per million output tokens, rising to $4 and $20 after 30 November 2026.", fr: "Prix de l'API : 2 $ par million de jetons en entrée et 10 $ en sortie, puis 4 $ et 20 $ après le 30 novembre 2026." },
          { en: "Google says the model tops several coding and automation benchmarks and that its safeguards blocked 99% of simulated attacks (company claims).", fr: "Google affirme que le modèle arrive premier à plusieurs tests de programmation et d'automatisation et que ses protections ont bloqué 99 % des attaques simulées (affirmations de l'entreprise)." },
        ],
        stakes: {
          en: "Small businesses building on the cheap launch price should budget for the higher one: the price doubles in two weeks.",
          fr: "Les petites entreprises qui bâtissent sur le prix de lancement doivent prévoir le prix plus élevé : il double dans deux semaines.",
        },
        source: { name: "Google", url: "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-carbon-now-available/", date: "2026-11-10" },
      },
      {
        desk: "robotics",
        headline: { en: "Agility Robotics becomes the first U.S. humanoid specialist on the stock market", fr: "Agility Robotics devient le premier spécialiste américain des humanoïdes en Bourse" },
        what: {
          en: "Agility Robotics, maker of the Digit humanoid, completed its merger with a listed company and began trading on Nasdaq as AGLT.",
          fr: "Agility Robotics, qui fabrique l'humanoïde Digit, a conclu sa fusion avec une société cotée et se négocie au Nasdaq sous le symbole AGLT.",
        },
        facts: [
          { en: "The deal raised about $465 million before expenses, according to the company.", fr: "L'opération a rapporté environ 465 millions de dollars avant frais, selon l'entreprise." },
          { en: "The company reports more than $300 million in conditional multi-year orders for Digit 5.", fr: "L'entreprise déclare plus de 300 millions de dollars de commandes pluriannuelles conditionnelles pour Digit 5." },
          { en: "An ABI Research analyst estimates about 100 Digit robots are at work today.", fr: "Un analyste d'ABI Research estime qu'une centaine de robots Digit travaillent aujourd'hui." },
        ],
        stakes: {
          en: "Orders are promises; about 100 robots are working. The gap between the two is what warehouse workers should watch.",
          fr: "Les commandes sont des promesses; une centaine de robots travaillent. C'est l'écart entre les deux que les travailleurs d'entrepôt devraient suivre.",
        },
        source: { name: "TechTarget", url: "https://www.techtarget.com/news/agility-robotics-first-us-specialist-humanoid-maker-to-go-public/874567/", date: "2026-11-12" },
      },
      {
        desk: "robotics",
        headline: { en: "ASUS puts its Gallop humanoid to work packing parts in its own factory", fr: "ASUS met son humanoïde Gallop au travail dans sa propre usine" },
        what: {
          en: "ASUS is testing a humanoid robot called Gallop on a packing line at one of its group's electronics factories.",
          fr: "ASUS teste un robot humanoïde, Gallop, sur une ligne d'emballage d'une usine d'électronique de son groupe.",
        },
        facts: [
          { en: "The robot packs 15 different motherboard accessory parts.", fr: "Le robot emballe 15 accessoires différents de cartes mères." },
          { en: "ASUS's target is 99.5% task success in 20 seconds; customer pilots are planned for 2027 and sales for the second half of 2028 (company plans).", fr: "L'objectif d'ASUS est 99,5 % de réussite en 20 secondes; des essais clients sont prévus en 2027 et la vente au second semestre 2028 (plans de l'entreprise)." },
        ],
        stakes: {
          en: "Humanoids are moving from demos to repetitive factory tasks. The dates are plans, not results.",
          fr: "Les humanoïdes passent des démonstrations aux tâches répétitives en usine. Les dates sont des plans, pas des résultats.",
        },
        source: { name: "Interesting Engineering", url: "https://interestingengineering.com/ai-robotics/asus-gallop-humanoid-robot-unveiled", date: "2026-11-13" },
      },
      {
        desk: "canada",
        headline: { en: "Budget 2026 plans 500 megawatts of sovereign AI compute for Canada", fr: "Le budget 2026 prévoit 500 mégawatts de calcul souverain pour l'IA au Canada" },
        what: {
          en: "The federal budget tabled on 5 November sets out plans for publicly backed AI computing capacity in Canada, as summarized by the law firm Gowling WLG.",
          fr: "Le budget fédéral déposé le 5 novembre prévoit une capacité de calcul pour l'IA soutenue par l'État, selon l'analyse du cabinet Gowling WLG.",
        },
        facts: [
          { en: "The plan targets 500 MW of sovereign AI compute.", fr: "Le plan vise 500 MW de calcul souverain pour l'IA." },
          { en: "It includes up to $1.6 billion of equity investment in Cohere, announced earlier.", fr: "Il comprend jusqu'à 1,6 milliard de dollars d'investissement en capital dans Cohere, déjà annoncé." },
          { en: "The budget says the share of Canadian firms using AI rose from 6.1% to 19.2%.", fr: "Le budget indique que la part des entreprises canadiennes qui utilisent l'IA est passée de 6,1 % à 19,2 %." },
        ],
        stakes: {
          en: "Where Canadian data is processed, and under whose law, is the point of \"sovereign\" compute. The details of who gets access are still to come.",
          fr: "Où les données canadiennes sont traitées, et sous quelle loi : c'est tout l'enjeu du calcul « souverain ». Les règles d'accès restent à venir.",
        },
        source: { name: "Gowling WLG", url: "https://gowlingwlg.com/en-ca/insights-resources/articles/2026/investing-in-intelligence", date: "2026-11-06" },
      },
      {
        desk: "people",
        headline: { en: "Ottawa offers cities $100 million to use AI on housing permits", fr: "Ottawa offre 100 millions aux villes pour utiliser l'IA dans les permis de logement" },
        what: {
          en: "Nova Scotia municipal officials weighed in on a federal plan to help cities use AI to speed up housing approvals.",
          fr: "Des élus municipaux de la Nouvelle-Écosse ont réagi au plan fédéral qui aide les villes à utiliser l'IA pour accélérer les permis de logement.",
        },
        facts: [
          { en: "The program is $100 million over three years, led by the Federation of Canadian Municipalities.", fr: "Le programme représente 100 millions de dollars sur trois ans, piloté par la Fédération canadienne des municipalités." },
          { en: "The government points to Edmonton issuing one-day approvals with automated reviews (government claim).", fr: "Le gouvernement cite Edmonton, qui délivre des permis en un jour grâce à des examens automatisés (affirmation du gouvernement)." },
        ],
        stakes: {
          en: "Faster permits could mean homes sooner. Residents should ask who checks the machine's decisions, and how to appeal one.",
          fr: "Des permis plus rapides peuvent vouloir dire des logements plus tôt. Les citoyens devraient demander qui vérifie les décisions de la machine, et comment les contester.",
        },
        source: { name: "Global News", url: "https://globalnews.ca/news/12148595/artificial-intelligence-housing-approvals/", date: "2026-11-12" },
      },
    ],
    quick: [
      {
        desk: "robotics",
        text: {
          en: "IEEE Spectrum asks whether \"agentic\" robotics can solve robots' data problem; Berkeley tests reported success rates up to 99%, against about 20% for imitation learning on the same tasks.",
          fr: "IEEE Spectrum se demande si la robotique « agentique » peut régler le manque de données des robots; des tests à Berkeley ont atteint jusqu'à 99 % de réussite, contre environ 20 % par apprentissage par imitation.",
        },
        source: { name: "IEEE Spectrum", url: "https://spectrum.ieee.org/agentic-robotics" },
      },
      {
        desk: "tech",
        text: {
          en: "Google brings its Gemini Intelligence features to more Android phones, and expands task automation to the UK, India and Japan.",
          fr: "Google étend ses fonctions Gemini Intelligence à plus de téléphones Android et l'automatisation des tâches au Royaume-Uni, en Inde et au Japon.",
        },
        source: { name: "Google", url: "https://blog.google/products-and-platforms/platforms/android/gemini-intelligence-november-features-devices/" },
      },
    ],
  },
];

export const latestSheet = (): SheetEdition => SHEET_EDITIONS[0];
