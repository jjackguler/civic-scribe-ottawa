import type { Bi } from "./i18n";

/**
 * Canadian AI funding programs. Every entry was checked against its official
 * page on the date in `checked`. Amounts and intake windows change — the card
 * always links to the official page, and that page is the authority.
 */
export type FundingStatus = "open" | "ongoing" | "closed" | "varies" | "guide";

export type Program = {
  id: string;
  name: Bi;
  org: string;
  level: "federal" | "provincial" | "national-institute";
  audience: ("business" | "students" | "researchers" | "nonprofits" | "everyone")[];
  status: FundingStatus;
  forWhom: Bi;
  whatYouGet: Bi;
  howToStart: Bi;
  url: string;
  checked: string;
};

export const STATUS_LABEL: Record<FundingStatus, Bi> = {
  open: { en: "Accepting applications", fr: "Demandes acceptées" },
  ongoing: { en: "Ongoing program", fr: "Programme continu" },
  closed: { en: "Closed — watch for next intake", fr: "Fermé — surveillez la prochaine période" },
  varies: { en: "Intake varies by region", fr: "Selon la région" },
  guide: { en: "Policy roadmap", fr: "Feuille de route" },
};

export const AUDIENCE_LABEL: Record<Program["audience"][number], Bi> = {
  business: { en: "Businesses", fr: "Entreprises" },
  students: { en: "Students & grads", fr: "Étudiants et diplômés" },
  researchers: { en: "Researchers", fr: "Chercheurs" },
  nonprofits: { en: "Non-profits", fr: "OBNL" },
  everyone: { en: "Everyone", fr: "Tout le monde" },
};

const CHECKED = "2026-10-06";

export const PROGRAMS: Program[] = [
  {
    id: "mitacs-ai-advantage",
    name: { en: "Mitacs AI Advantage", fr: "Mitacs Avantage IA" },
    org: "Mitacs, funded by the Government of Canada",
    level: "federal",
    audience: ["business", "nonprofits", "students"],
    status: "open",
    forWhom: {
      en: "Companies, non-profits, hospitals, municipalities and Indigenous governments that want to adopt AI — paired with students, recent grads (within 2 years) and postdocs.",
      fr: "Entreprises, OBNL, hôpitaux, municipalités et gouvernements autochtones qui veulent adopter l'IA — jumelés à des étudiants, diplômés récents (moins de 2 ans) et postdoctorants.",
    },
    whatYouGet: {
      en: "Co-funded AI work placements in two streams: ADOPT (from AI readiness to a working implementation) and AI+X (applied AI research in your sector). Part of a federal plan for 10,000 placements over five years.",
      fr: "Stages en IA cofinancés dans deux volets : ADOPT (de la préparation à la mise en œuvre) et IA+X (recherche appliquée dans votre secteur). Fait partie d'un plan fédéral de 10 000 stages sur cinq ans.",
    },
    howToStart: { en: "Contact a Mitacs advisor to scope a project.", fr: "Communiquez avec un conseiller Mitacs pour définir un projet." },
    url: "https://innovation.mitacs.ca/en/ai-advantage",
    checked: CHECKED,
  },
  {
    id: "nrc-irap",
    name: { en: "NRC IRAP (Industrial Research Assistance Program)", fr: "PARI CNRC (Programme d'aide à la recherche industrielle)" },
    org: "National Research Council of Canada",
    level: "federal",
    audience: ["business"],
    status: "ongoing",
    forWhom: {
      en: "Incorporated, for-profit Canadian SMEs with 500 or fewer employees developing new or improved technology products, services or processes in Canada.",
      fr: "PME canadiennes constituées, à but lucratif, de 500 employés ou moins, qui développent des produits, services ou procédés technologiques au Canada.",
    },
    whatYouGet: {
      en: "Advice from an industrial technology advisor and possible funding for innovation projects — including AI projects. IRAP's AI Assist initiative also funds short AI advisory engagements for SMEs through partner organizations.",
      fr: "Conseils d'un conseiller en technologie industrielle et financement possible de projets d'innovation, y compris en IA. L'initiative IA Assist finance aussi de courts mandats-conseils en IA pour les PME par l'entremise d'organismes partenaires.",
    },
    howToStart: { en: "Call NRC IRAP at 1-877-994-4727 to be matched with an advisor.", fr: "Appelez le PARI CNRC au 1-877-994-4727 pour être jumelé à un conseiller." },
    url: "https://nrc.canada.ca/en/support-technology-innovation/financial-support-technology-innovation-through-nrc-irap",
    checked: CHECKED,
  },
  {
    id: "raii",
    name: { en: "Regional Artificial Intelligence Initiative (RAII)", fr: "Initiative régionale en intelligence artificielle (IRIA)" },
    org: "Canada's regional development agencies (FedDev Ontario, FedNor, CED Québec, ACOA, PrairiesCan, PacifiCan, CanNor)",
    level: "federal",
    audience: ["business"],
    status: "varies",
    forWhom: {
      en: "AI start-ups and growing firms bringing products to market, and SMEs adopting AI in sectors such as agriculture, health and manufacturing.",
      fr: "Jeunes pousses et entreprises en croissance en IA qui commercialisent des produits, et PME qui adoptent l'IA dans l'agriculture, la santé ou la fabrication.",
    },
    whatYouGet: {
      en: "Funding for AI productization and commercialization, and for AI adoption. Budget 2024 set aside $200 million; the 2026 national AI strategy adds more through the same agencies.",
      fr: "Financement pour la commercialisation de produits d'IA et pour l'adoption de l'IA. Le budget 2024 y a consacré 200 millions de dollars; la stratégie nationale de 2026 en ajoute par les mêmes agences.",
    },
    howToStart: { en: "Check your regional agency's site — in Ottawa and southern Ontario, that's FedDev Ontario.", fr: "Consultez le site de votre agence régionale — à Ottawa et dans le sud de l'Ontario, c'est FedDev Ontario." },
    url: "https://ised-isde.canada.ca/site/ised/en/regional-artificial-intelligence-initiative",
    checked: CHECKED,
  },
  {
    id: "compute-access",
    name: { en: "AI Compute Access Fund", fr: "Fonds d'accès au calcul pour l'IA" },
    org: "Innovation, Science and Economic Development Canada",
    level: "federal",
    audience: ["business"],
    status: "closed",
    forWhom: {
      en: "Canadian for-profit companies building AI products, under 500 employees, with revenue or at least Series A financing.",
      fr: "Entreprises canadiennes à but lucratif qui développent des produits d'IA, de moins de 500 employés, avec des revenus ou un financement de série A.",
    },
    whatYouGet: {
      en: "Two-thirds of eligible costs for Canadian cloud AI compute (half for non-Canadian), on projects worth $100,000 to $5 million over up to three years.",
      fr: "Les deux tiers des coûts admissibles de calcul infonuagique canadien (la moitié pour le non canadien), pour des projets de 100 000 $ à 5 M$ sur trois ans au plus.",
    },
    howToStart: { en: "The last intake closed July 31, 2025. Watch the official page for the next round.", fr: "La dernière période a pris fin le 31 juillet 2025. Surveillez la page officielle pour la prochaine ronde." },
    url: "https://ised-isde.canada.ca/site/ised/en/canadian-sovereign-ai-compute-strategy/ai-compute-access-fund",
    checked: CHECKED,
  },
  {
    id: "sred",
    name: { en: "SR&ED tax incentive", fr: "Programme de la RS&DE" },
    org: "Canada Revenue Agency",
    level: "federal",
    audience: ["business"],
    status: "ongoing",
    forWhom: {
      en: "Canadian businesses doing qualifying research and experimental development — which can include building new AI systems.",
      fr: "Entreprises canadiennes qui font de la recherche et du développement expérimental admissibles, ce qui peut inclure la création de systèmes d'IA.",
    },
    whatYouGet: { en: "Tax credits and refunds on eligible R&D spending.", fr: "Crédits d'impôt et remboursements sur les dépenses de R-D admissibles." },
    howToStart: { en: "Read CRA's eligibility guidance and claim with your corporate tax return.", fr: "Lisez les critères de l'ARC et faites la demande avec votre déclaration de revenus." },
    url: "https://www.canada.ca/en/revenue-agency/services/scientific-research-experimental-development-tax-incentive-program.html",
    checked: CHECKED,
  },
  {
    id: "scale-ai",
    name: { en: "Scale AI Acceleration", fr: "Scale AI — Accélération" },
    org: "Scale AI, Canada's AI Global Innovation Cluster",
    level: "national-institute",
    audience: ["business"],
    status: "ongoing",
    forWhom: {
      en: "Start-ups building applied AI for supply chains and industry — through Scale AI's accredited incubators and accelerators across Canada.",
      fr: "Jeunes pousses qui créent de l'IA appliquée aux chaînes d'approvisionnement et à l'industrie, par les incubateurs et accélérateurs agréés de Scale AI.",
    },
    whatYouGet: {
      en: "Funded coaching, mentorship and commercialization support. Start-ups don't apply directly — join one of the partner programs.",
      fr: "Accompagnement, mentorat et soutien à la commercialisation financés. Les jeunes pousses passent par un programme partenaire.",
    },
    howToStart: { en: "Browse the partner programs Scale AI funds and apply to one.", fr: "Parcourez les programmes partenaires financés par Scale AI." },
    url: "https://www.scaleai.ca/acceleration/the-programs-were-investing-in/",
    checked: CHECKED,
  },
  {
    id: "ai-for-all",
    name: { en: "Canada's National AI Strategy: AI for All", fr: "Stratégie nationale sur l'IA du Canada : L'IA pour tous" },
    org: "Innovation, Science and Economic Development Canada",
    level: "federal",
    audience: ["everyone"],
    status: "guide",
    forWhom: {
      en: "Anyone who wants to know where federal AI money is going next. Launched June 2026.",
      fr: "Quiconque veut savoir où ira le financement fédéral en IA. Lancée en juin 2026.",
    },
    whatYouGet: {
      en: "The roadmap behind new programs: free AI training for everyone in Canada, support for SME and non-profit adoption, and up to 90,000 AI jobs and placements for young Canadians by 2031.",
      fr: "La feuille de route des nouveaux programmes : formation gratuite en IA pour tous, soutien à l'adoption par les PME et OBNL, et jusqu'à 90 000 emplois et stages en IA pour les jeunes d'ici 2031.",
    },
    howToStart: { en: "Read the overview, then watch for program launches here.", fr: "Lisez l'aperçu, puis suivez les lancements de programmes ici." },
    url: "https://ised-isde.canada.ca/site/ised/en/node/1036",
    checked: CHECKED,
  },
  {
    id: "vector-oci",
    name: { en: "Vector Institute and Ontario Centre of Innovation", fr: "Institut Vecteur et Centre d'innovation de l'Ontario" },
    org: "Province of Ontario partners",
    level: "provincial",
    audience: ["business", "researchers"],
    status: "ongoing",
    forWhom: {
      en: "Ontario SMEs that want help adopting AI, and companies working with Ontario researchers.",
      fr: "PME ontariennes qui veulent de l'aide pour adopter l'IA, et entreprises qui collaborent avec des chercheurs de l'Ontario.",
    },
    whatYouGet: {
      en: "Provincially funded programs that connect companies with AI engineers and researchers, plus OCI technology-adoption funding for SMEs.",
      fr: "Programmes financés par la province qui jumellent les entreprises à des ingénieurs et chercheurs en IA, et financement d'adoption technologique du CIO.",
    },
    howToStart: { en: "Start with OCI's program finder; Vector lists its industry programs on its site.", fr: "Commencez par l'outil de recherche du CIO; Vecteur présente ses programmes pour l'industrie sur son site." },
    url: "https://www.oc-innovation.ca/",
    checked: CHECKED,
  },
  {
    id: "cifar",
    name: { en: "CIFAR Pan-Canadian AI programs", fr: "Programmes pancanadiens d'IA du CIFAR" },
    org: "CIFAR, with Amii (Edmonton), Mila (Montréal) and Vector (Toronto)",
    level: "national-institute",
    audience: ["researchers"],
    status: "ongoing",
    forWhom: { en: "University researchers and research teams working on AI.", fr: "Chercheurs universitaires et équipes de recherche en IA." },
    whatYouGet: {
      en: "Canada CIFAR AI Chairs, catalyst grants and AI safety research funding.",
      fr: "Chaires en IA Canada-CIFAR, subventions catalyseurs et financement de la recherche en sûreté de l'IA.",
    },
    howToStart: { en: "Check CIFAR's open calls.", fr: "Consultez les appels ouverts du CIFAR." },
    url: "https://cifar.ca/ai/",
    checked: CHECKED,
  },
];
