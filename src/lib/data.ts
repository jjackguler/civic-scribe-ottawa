export type Bilingual = { en: string; fr: string };
export type VerificationStatus = "verified" | "developing" | "community" | "opinion" | "sponsored";

export const NEIGHBORHOODS = [
  "Downtown", "Centretown", "ByWard Market", "Glebe", "Westboro", "Hintonburg",
  "Vanier", "Sandy Hill", "Kanata", "Orleans", "Barrhaven", "Nepean",
  "Alta Vista", "Old Ottawa South", "Little Italy", "Chinatown", "Gloucester", "Rural Ottawa",
] as const;
export type Neighborhood = typeof NEIGHBORHOODS[number];

export type Article = {
  slug: string;
  kicker: Bilingual;
  title: Bilingual;
  dek: Bilingual;
  body?: Bilingual;
  byline: string;
  publishedAt: string;
  updatedAt?: string;
  readMinutes: number;
  category: string;
  neighborhood?: Neighborhood | "Citywide";
  language: "en" | "fr" | "bilingual";
  status: VerificationStatus;
  image: string;
  hero?: boolean;
  pullQuote?: Bilingual;
  sources?: { label: string; url?: string }[];
};

// Unsplash editorial photos (royalty-free, no key required)
const img = (id: string, w = 1400, h = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

export const ARTICLES: Article[] = [
  {
    slug: "lrt-line-1-evening-disruption",
    kicker: { en: "Transit", fr: "Transport" },
    title: {
      en: "OC Transpo confirms Line 1 evening disruption between Tunney's Pasture and Hurdman",
      fr: "OC Transpo confirme une interruption en soirée sur la Ligne 1 entre Tunney's Pasture et Hurdman",
    },
    dek: {
      en: "Replacement buses running every 7–9 minutes. Officials cite a switch fault near Bayview; service expected to resume before midnight.",
      fr: "Autobus de remplacement toutes les 7 à 9 minutes. Les responsables citent une défaillance d'aiguillage près de Bayview; service prévu avant minuit.",
    },
    byline: "Marie-Claude Tremblay",
    publishedAt: "2026-05-24T18:12:00Z",
    updatedAt: "2026-05-24T20:40:00Z",
    readMinutes: 4,
    category: "Traffic",
    neighborhood: "Downtown",
    language: "bilingual",
    status: "verified",
    image: img("1474487548417-781cb71495f3"),
    hero: true,
    pullQuote: {
      en: "Riders should plan an extra 25 minutes for downtown connections tonight.",
      fr: "Prévoyez 25 minutes supplémentaires pour les correspondances au centre-ville ce soir.",
    },
    sources: [
      { label: "OC Transpo Service Alerts" },
      { label: "City of Ottawa media briefing, 18:45" },
    ],
  },
  {
    slug: "centretown-affordable-housing-vote",
    kicker: { en: "City Hall", fr: "Hôtel de ville" },
    title: {
      en: "Council approves 312 affordable units on a long-vacant Centretown lot",
      fr: "Le conseil approuve 312 logements abordables sur un terrain vacant à Centretown",
    },
    dek: {
      en: "After three years of consultation, councillors voted 18–6 to fast-track a mixed-income project on Bank Street, with rent-geared-to-income for one-third of units.",
      fr: "Après trois ans de consultation, les conseillers ont voté 18-6 pour accélérer un projet à revenus mixtes sur la rue Bank, dont un tiers à loyer indexé.",
    },
    byline: "Daniel Okonkwo",
    publishedAt: "2026-05-23T22:00:00Z",
    readMinutes: 7,
    category: "Politics",
    neighborhood: "Centretown",
    language: "en",
    status: "verified",
    image: img("1486325212027-8081e485255e"),
  },
  {
    slug: "vanier-community-fridge-expands",
    kicker: { en: "Good news", fr: "Bonnes nouvelles" },
    title: {
      en: "Vanier's community fridge network doubles, feeding 900 families a week",
      fr: "Le réseau de frigos communautaires de Vanier double et nourrit 900 familles par semaine",
    },
    dek: {
      en: "Volunteers and a local bakery partnership turned one corner fridge into eight neighbourhood hubs in eighteen months.",
      fr: "Bénévoles et boulangerie locale ont transformé un frigo de coin en huit points de quartier en dix-huit mois.",
    },
    byline: "Aïcha Diallo",
    publishedAt: "2026-05-22T13:00:00Z",
    readMinutes: 5,
    category: "Good News",
    neighborhood: "Vanier",
    language: "bilingual",
    status: "verified",
    image: img("1488521787991-ed7bbaae773c"),
  },
  {
    slug: "glebe-school-french-immersion-waitlist",
    kicker: { en: "Education", fr: "Éducation" },
    title: {
      en: "French immersion waitlists in the Glebe hit a 10-year high",
      fr: "Les listes d'attente en immersion française dans le Glebe au plus haut depuis 10 ans",
    },
    dek: {
      en: "Parents describe a lottery they can't predict; the school board says staffing — not space — is the bottleneck.",
      fr: "Les parents décrivent une loterie imprévisible; le conseil scolaire dit que le personnel — non l'espace — est le problème.",
    },
    byline: "Sophie Lavigne",
    publishedAt: "2026-05-21T11:30:00Z",
    readMinutes: 6,
    category: "Education",
    neighborhood: "Glebe",
    language: "fr",
    status: "verified",
    image: img("1503676260728-1c00da094a0b"),
  },
  {
    slug: "westboro-bike-lane-safety-report",
    kicker: { en: "Investigation", fr: "Enquête" },
    title: {
      en: "Investigation: How a Westboro bike lane became Ottawa's most-reported safety hazard",
      fr: "Enquête : Comment une piste cyclable de Westboro est devenue le point noir le plus signalé d'Ottawa",
    },
    dek: {
      en: "Three months of incident logs, FOI documents, and resident interviews show a pattern the city has known about since 2024.",
      fr: "Trois mois de rapports d'incidents, de demandes d'accès et d'entrevues révèlent un schéma connu de la ville depuis 2024.",
    },
    byline: "Reza Mohammadi",
    publishedAt: "2026-05-20T09:00:00Z",
    readMinutes: 12,
    category: "Investigation",
    neighborhood: "Westboro",
    language: "en",
    status: "verified",
    image: img("1485965120184-e220f721d03e"),
  },
  {
    slug: "byward-market-night-economy",
    kicker: { en: "Arts & Culture", fr: "Arts et culture" },
    title: {
      en: "ByWard Market's late-night murals turn alleyways into open-air galleries",
      fr: "Les murales nocturnes du Marché By transforment les ruelles en galeries à ciel ouvert",
    },
    dek: {
      en: "Twelve artists, four weekends, one quiet revival of a downtown corridor residents had begun to avoid.",
      fr: "Douze artistes, quatre week-ends, une renaissance discrète d'un corridor que les résidents évitaient.",
    },
    byline: "Léa Boucher",
    publishedAt: "2026-05-19T16:00:00Z",
    readMinutes: 5,
    category: "Arts",
    neighborhood: "ByWard Market",
    language: "bilingual",
    status: "verified",
    image: img("1499781350541-7783f6c6a0c8"),
  },
  {
    slug: "senators-playoff-watch-parties",
    kicker: { en: "Sports", fr: "Sports" },
    title: {
      en: "Where to watch the Senators across all 18 neighbourhoods tonight",
      fr: "Où regarder les Sénateurs dans les 18 quartiers ce soir",
    },
    dek: {
      en: "From Barrhaven sports bars to a free outdoor screen in Hintonburg, a guide to the city's best community watch spots.",
      fr: "Des bars sportifs de Barrhaven à un écran extérieur gratuit à Hintonburg, le guide des meilleurs lieux communautaires.",
    },
    byline: "Marcus Bélanger",
    publishedAt: "2026-05-24T14:00:00Z",
    readMinutes: 3,
    category: "Sports",
    neighborhood: "Citywide",
    language: "en",
    status: "verified",
    image: img("1517649763962-0c623066013b"),
  },
  {
    slug: "kanata-tech-layoffs-resources",
    kicker: { en: "Solutions", fr: "Solutions" },
    title: {
      en: "After the Kanata tech layoffs: a practical guide for the 1,200 workers affected",
      fr: "Après les licenciements technos de Kanata : guide pratique pour les 1 200 travailleurs touchés",
    },
    dek: {
      en: "EI timelines, bilingual retraining programs, and the local employers actively hiring this quarter.",
      fr: "Délais d'assurance-emploi, programmes de recyclage bilingues, et les employeurs locaux qui embauchent ce trimestre.",
    },
    byline: "Priya Sharma",
    publishedAt: "2026-05-18T10:00:00Z",
    readMinutes: 8,
    category: "Solutions",
    neighborhood: "Kanata",
    language: "bilingual",
    status: "verified",
    image: img("1521737604893-d14cc237f11d"),
  },
  {
    slug: "rural-ottawa-broadband-resident-report",
    kicker: { en: "Community report", fr: "Rapport communautaire" },
    title: {
      en: "Resident report: Rural Ottawa families still without reliable broadband",
      fr: "Rapport citoyen : Des familles du Ottawa rural toujours sans Internet fiable",
    },
    dek: {
      en: "Submitted by readers in West Carleton-March. We've contacted the providers named; responses pending.",
      fr: "Soumis par des lecteurs de West Carleton-March. Nous avons contacté les fournisseurs nommés; réponses en attente.",
    },
    byline: "Community desk",
    publishedAt: "2026-05-22T08:00:00Z",
    readMinutes: 4,
    category: "Community",
    neighborhood: "Rural Ottawa",
    language: "en",
    status: "community",
    image: img("1518770660439-4636190af475"),
  },
];

export type WeatherAlert = {
  id: string; severity: "advisory" | "watch" | "warning";
  title: Bilingual; area: string; issuedAt: string; advice: Bilingual;
};
export const WEATHER_ALERTS: WeatherAlert[] = [
  {
    id: "w1", severity: "warning",
    title: { en: "Freezing rain warning", fr: "Avertissement de pluie verglaçante" },
    area: "Ottawa & Gatineau",
    issuedAt: "2026-05-24T17:00:00Z",
    advice: {
      en: "Sidewalks may glaze over after 21:00. Salt entryways. Avoid non-essential travel until 06:00.",
      fr: "Trottoirs glacés après 21 h. Salez les entrées. Évitez les déplacements non essentiels jusqu'à 6 h.",
    },
  },
  {
    id: "w2", severity: "advisory",
    title: { en: "Air quality advisory", fr: "Avis sur la qualité de l'air" },
    area: "Kanata, Nepean",
    issuedAt: "2026-05-24T14:30:00Z",
    advice: {
      en: "Sensitive groups should limit outdoor activity. AQHI: 6 (moderate risk).",
      fr: "Personnes sensibles : limitez l'activité extérieure. CAS : 6 (risque modéré).",
    },
  },
];

export type TrafficAlert = {
  id: string; type: "closure" | "construction" | "transit" | "incident";
  title: Bilingual; location: string; impact: "low" | "medium" | "high"; until: string;
};
export const TRAFFIC_ALERTS: TrafficAlert[] = [
  { id: "t1", type: "transit",
    title: { en: "O-Train Line 1 single-tracking, Bayview ↔ Pimisi", fr: "Ligne 1 voie unique, Bayview ↔ Pimisi" },
    location: "Downtown", impact: "high", until: "2026-05-24T23:59:00Z" },
  { id: "t2", type: "closure",
    title: { en: "Wellington St closed for film shoot, 19:00–02:00", fr: "Rue Wellington fermée pour tournage, 19h–2h" },
    location: "Parliament Hill", impact: "medium", until: "2026-05-25T02:00:00Z" },
  { id: "t3", type: "construction",
    title: { en: "Bank St resurfacing — one lane northbound", fr: "Réfection rue Bank — une voie en direction nord" },
    location: "Glebe", impact: "medium", until: "2026-06-12T00:00:00Z" },
  { id: "t4", type: "incident",
    title: { en: "Collision cleared, Hwy 417 westbound at Maitland", fr: "Collision dégagée, 417 ouest à Maitland" },
    location: "Westboro", impact: "low", until: "2026-05-24T21:00:00Z" },
];

export type FactCheck = {
  id: string; claim: Bilingual; status: "verified" | "false" | "misleading" | "needs-context" | "review";
  source: string; updatedAt: string; summary: Bilingual;
};
export const FACT_CHECKS: FactCheck[] = [
  { id: "f1",
    claim: { en: "“Ottawa property taxes rose 14% this year.”", fr: "« Les taxes foncières d'Ottawa ont augmenté de 14 % cette année. »" },
    status: "misleading", source: "Viral social post, May 19",
    updatedAt: "2026-05-22T15:00:00Z",
    summary: { en: "The approved increase is 3.9%. The 14% figure compares a single sub-levy to its prior-year base.",
              fr: "L'augmentation approuvée est de 3,9 %. Le 14 % compare une sous-taxe à sa base de l'année précédente." } },
  { id: "f2",
    claim: { en: "“The Rideau Canal will not open for skating next winter.”", fr: "« Le canal Rideau n'ouvrira pas pour le patinage l'hiver prochain. »" },
    status: "false", source: "Anonymous email forward",
    updatedAt: "2026-05-20T12:00:00Z",
    summary: { en: "NCC confirms standard winter operations planned, contingent on ice conditions.",
              fr: "La CCN confirme des opérations hivernales normales, selon les conditions de glace." } },
  { id: "f3",
    claim: { en: "“OC Transpo cut all night service in Orleans.”", fr: "« OC Transpo a coupé tout le service de nuit à Orléans. »" },
    status: "needs-context", source: "Local Facebook group",
    updatedAt: "2026-05-23T09:30:00Z",
    summary: { en: "Two late routes were consolidated; overnight coverage continues via Route 305.",
              fr: "Deux trajets tardifs ont été fusionnés; la couverture de nuit continue par la ligne 305." } },
  { id: "f4",
    claim: { en: "“City council voted to defund the public library.”", fr: "« Le conseil municipal a voté pour réduire le financement de la bibliothèque. »" },
    status: "false", source: "Op-ed claim, May 17",
    updatedAt: "2026-05-21T18:00:00Z",
    summary: { en: "The 2026 budget shows a 2.1% increase in library operating funds.",
              fr: "Le budget 2026 montre une hausse de 2,1 % du fonctionnement de la bibliothèque." } },
];

export type Solution = {
  id: string; problem: Bilingual; affected: Bilingual;
  triedLocal: Bilingual; examples: { city: string; outcome: Bilingual }[];
  nextSteps: Bilingual;
};
export const SOLUTIONS: Solution[] = [
  { id: "s1",
    problem: { en: "Winter sidewalks unsafe for seniors and wheelchair users",
              fr: "Trottoirs hivernaux dangereux pour aînés et fauteuils roulants" },
    affected: { en: "~38,000 Ottawa residents with mobility needs",
                fr: "~38 000 résidents d'Ottawa à mobilité réduite" },
    triedLocal: { en: "Snow Go program, volunteer shovel matching, priority plow routes around hospitals.",
                  fr: "Programme Snow Go, jumelage bénévole, déneigement prioritaire près des hôpitaux." },
    examples: [
      { city: "Stockholm, SE", outcome: { en: "Gender-equal snow clearing reduced winter ER visits 25%.",
                                          fr: "Déneigement égalitaire : 25 % de visites hospitalières en moins." } },
      { city: "Montréal, QC", outcome: { en: "Heated sidewalk pilot on Sainte-Catherine cut ice falls to zero in trial blocks.",
                                          fr: "Trottoirs chauffants Sainte-Catherine : zéro chute sur les tronçons pilotes." } },
    ],
    nextSteps: { en: "Ask your councillor for the 2026 winter maintenance review submission window (closes June 30).",
                fr: "Demandez à votre conseiller la consultation 2026 sur l'entretien hivernal (clôture 30 juin)." } },
  { id: "s2",
    problem: { en: "Affordable family housing near transit",
              fr: "Logements familiaux abordables près du transport" },
    affected: { en: "~21,000 households on Ottawa's affordable housing list",
                fr: "~21 000 ménages sur la liste de logements abordables d'Ottawa" },
    triedLocal: { en: "Inclusionary zoning pilots, modular housing on city land, non-profit acquisition fund.",
                  fr: "Zonage inclusif, logements modulaires sur terrains municipaux, fonds d'acquisition à but non lucratif." },
    examples: [
      { city: "Vienna, AT", outcome: { en: "60% of residents live in subsidized housing without stigma.",
                                        fr: "60 % des résidents vivent en logement subventionné sans stigmate." } },
      { city: "Halifax, NS", outcome: { en: "Land trust model converted 14 buildings to permanent affordability.",
                                        fr: "Fiducie foncière : 14 immeubles convertis en abordabilité permanente." } },
    ],
    nextSteps: { en: "Public hearing on inclusionary zoning expansion: June 11, City Hall.",
                fr: "Audience publique sur l'élargissement du zonage inclusif : 11 juin, hôtel de ville." } },
];

export type EventItem = {
  id: string; title: Bilingual; date: string; venue: string; neighborhood: Neighborhood;
  type: "community" | "arts" | "civic" | "sports" | "education" | "family"; free: boolean;
  language: "en" | "fr" | "bilingual";
};
export const EVENTS: EventItem[] = [
  { id: "e1", title: { en: "Public consultation: 2027 budget", fr: "Consultation publique : budget 2027" },
    date: "2026-05-28T18:30:00Z", venue: "Ben Franklin Place", neighborhood: "Nepean",
    type: "civic", free: true, language: "bilingual" },
  { id: "e2", title: { en: "Festival franco-ontarien — Concert d'ouverture", fr: "Festival franco-ontarien — Concert d'ouverture" },
    date: "2026-06-13T20:00:00Z", venue: "Major's Hill Park", neighborhood: "ByWard Market",
    type: "arts", free: true, language: "fr" },
  { id: "e3", title: { en: "Hintonburg community cleanup", fr: "Grand nettoyage d'Hintonburg" },
    date: "2026-05-31T09:00:00Z", venue: "Parkdale Park", neighborhood: "Hintonburg",
    type: "community", free: true, language: "en" },
  { id: "e4", title: { en: "Sandy Hill family science night", fr: "Soirée sciences en famille à Sandy Hill" },
    date: "2026-06-04T17:30:00Z", venue: "Robinson Field", neighborhood: "Sandy Hill",
    type: "family", free: true, language: "bilingual" },
  { id: "e5", title: { en: "Senators watch party — Game 5", fr: "Soirée Sénateurs — Match 5" },
    date: "2026-05-26T19:00:00Z", venue: "Lansdowne Plaza", neighborhood: "Glebe",
    type: "sports", free: true, language: "en" },
];

export type Job = {
  id: string; title: string; company: string; neighborhood: Neighborhood | "Remote" | "Hybrid";
  salary: string; type: "Full-time" | "Part-time" | "Contract"; language: "EN" | "FR" | "EN/FR";
  sponsored?: boolean;
};
export const JOBS: Job[] = [
  { id: "j1", title: "Bilingual policy analyst", company: "City of Ottawa", neighborhood: "Downtown",
    salary: "$74k–$92k", type: "Full-time", language: "EN/FR" },
  { id: "j2", title: "Community outreach coordinator", company: "Vanier Community Service Centre",
    neighborhood: "Vanier", salary: "$58k–$66k", type: "Full-time", language: "EN/FR" },
  { id: "j3", title: "Front-end engineer", company: "Shopify (Kanata)", neighborhood: "Kanata",
    salary: "$110k–$140k", type: "Full-time", language: "EN", sponsored: true },
  { id: "j4", title: "Bike mechanic", company: "re-Cycles Co-op", neighborhood: "Hintonburg",
    salary: "$22–$28/hr", type: "Part-time", language: "EN" },
  { id: "j5", title: "Educator, francophone literacy", company: "ACFO Ottawa", neighborhood: "Orleans",
    salary: "$52k–$60k", type: "Contract", language: "FR" },
  { id: "j6", title: "Investigative reporting intern", company: "Ottawa Civic Ledger",
    neighborhood: "Hybrid", salary: "$24/hr + stipend", type: "Contract", language: "EN/FR" },
];

export type Submission = {
  id: string; title: string; neighborhood: Neighborhood;
  status: "received" | "reviewing" | "needs-verification" | "published" | "rejected";
  submittedAt: string;
};
export const SUBMISSIONS: Submission[] = [
  { id: "sub1", title: "Pothole hazard on Riverside Drive", neighborhood: "Alta Vista", status: "reviewing", submittedAt: "2026-05-23T11:20:00Z" },
  { id: "sub2", title: "Community garden launches in Chinatown", neighborhood: "Chinatown", status: "published", submittedAt: "2026-05-19T08:30:00Z" },
  { id: "sub3", title: "Unsafe crossing near Lisgar Collegiate", neighborhood: "Centretown", status: "needs-verification", submittedAt: "2026-05-22T16:00:00Z" },
  { id: "sub4", title: "Free legal clinic at Orleans library", neighborhood: "Orleans", status: "received", submittedAt: "2026-05-24T07:45:00Z" },
];

export const DONATION_TIERS = [5, 10, 25, 50, 100];

export const DONATION_IMPACT: Record<number, Bilingual> = {
  5:   { en: "Funds one bilingual fact-check verification.",        fr: "Finance une vérification bilingue." },
  10:  { en: "Pays for one hour of court or council monitoring.",   fr: "Couvre une heure de surveillance des séances." },
  25:  { en: "Translates one full investigation into French.",      fr: "Traduit une enquête complète en français." },
  50:  { en: "Sends a reporter to one neighbourhood meeting.",      fr: "Envoie un reporter à une réunion de quartier." },
  100: { en: "Underwrites a week of a citizen tip line.",           fr: "Finance une semaine de la ligne de signalement." },
};

export type NeighborhoodInfo = {
  name: Neighborhood;
  blurb: Bilingual;
  character: Bilingual;
  population: string;
  ward: string;
  reporter: string;
};

export const NEIGHBORHOOD_INFO: NeighborhoodInfo[] = [
  { name: "Downtown", population: "28k", ward: "Ward 14 · Somerset", reporter: "M.-C. Tremblay",
    blurb: { en: "Parliament, public service offices, the central library, and the daily rhythm of Ottawa's civic core.", fr: "Parlement, fonction publique, bibliothèque centrale et le pouls civique d'Ottawa." },
    character: { en: "Civic & institutional", fr: "Civique et institutionnel" } },
  { name: "Centretown", population: "31k", ward: "Ward 14 · Somerset", reporter: "D. Okonkwo",
    blurb: { en: "Dense mid-rise blocks, Bank Street shopfronts, and a long-running fight over affordable family housing.", fr: "Quartier dense, vitrines de la rue Bank et long débat sur le logement familial abordable." },
    character: { en: "Walkable urban core", fr: "Cœur urbain piéton" } },
  { name: "ByWard Market", population: "12k", ward: "Ward 12 · Rideau-Vanier", reporter: "L. Boucher",
    blurb: { en: "Heritage market stalls, French bistros, late-night murals, and the city's most-contested public-space debate.", fr: "Étals patrimoniaux, bistros français, murales nocturnes et débat sur l'espace public." },
    character: { en: "Heritage & nightlife", fr: "Patrimoine et vie nocturne" } },
  { name: "Glebe", population: "21k", ward: "Ward 17 · Capital", reporter: "S. Lavigne",
    blurb: { en: "Tree-lined streets between the Rideau Canal and Lansdowne Park; school waitlists and traffic-calming dominate council mail.", fr: "Rues bordées d'arbres entre le canal Rideau et Lansdowne; listes d'attente scolaires et apaisement de la circulation dominent." },
    character: { en: "Family & canal-side", fr: "Familles, bord du canal" } },
  { name: "Westboro", population: "16k", ward: "Ward 15 · Kitchissippi", reporter: "R. Mohammadi",
    blurb: { en: "Boutiques along Richmond Road, Kichi Sibi waterfront trails, and Ottawa's most-reported bike-lane safety hazard.", fr: "Boutiques de la rue Richmond, sentiers riverains et la piste cyclable la plus signalée pour sa dangerosité." },
    character: { en: "Boutique & active", fr: "Commerces et plein air" } },
  { name: "Hintonburg", population: "19k", ward: "Ward 15 · Kitchissippi", reporter: "A. Diallo",
    blurb: { en: "Wellington West cafés, the Parkdale Market, indie galleries, and rising rent pressure on long-time residents.", fr: "Cafés de Wellington Ouest, marché Parkdale, galeries indépendantes et pression locative croissante." },
    character: { en: "Arts & artisanal", fr: "Arts et artisanat" } },
  { name: "Vanier", population: "23k", ward: "Ward 12 · Rideau-Vanier", reporter: "A. Diallo",
    blurb: { en: "Historic Franco-Ontarian heart of Ottawa; community fridges, sugar shacks, and the country's most-bilingual main street.", fr: "Cœur franco-ontarien d'Ottawa; frigos communautaires, cabanes à sucre, rue principale la plus bilingue du pays." },
    character: { en: "Franco-Ontarian", fr: "Franco-ontarien" } },
  { name: "Sandy Hill", population: "17k", ward: "Ward 12 · Rideau-Vanier", reporter: "M.-C. Tremblay",
    blurb: { en: "University of Ottawa students, embassies, and a constant rooming-house conversion debate.", fr: "Étudiants de l'Université d'Ottawa, ambassades et débat constant sur les maisons de chambres." },
    character: { en: "University & embassies", fr: "Université et ambassades" } },
  { name: "Kanata", population: "118k", ward: "Ward 4 · Kanata North", reporter: "P. Sharma",
    blurb: { en: "Canada's largest tech park, the Sens' home arena, and a transit corridor still waiting for LRT Stage 3.", fr: "Le plus grand parc technologique du pays, l'aréna des Sénateurs et un corridor en attente du TLR phase 3." },
    character: { en: "Tech & suburban", fr: "Technologie et banlieue" } },
  { name: "Orleans", population: "126k", ward: "Ward 1 · Orléans East-Cumberland", reporter: "M. Bélanger",
    blurb: { en: "East-end francophone hub, fast-growing subdivisions, and the city's longest commute conversation.", fr: "Pôle francophone de l'est, banlieues en croissance et la plus longue conversation sur les trajets." },
    character: { en: "Francophone east", fr: "Est francophone" } },
  { name: "Barrhaven", population: "98k", ward: "Ward 3 · Barrhaven West", reporter: "S. Lavigne",
    blurb: { en: "Family suburbia with the fastest schoolboard growth and a long wait for Stage 3 light rail.", fr: "Banlieue familiale, croissance scolaire la plus rapide et longue attente du TLR phase 3." },
    character: { en: "Growing suburb", fr: "Banlieue en croissance" } },
  { name: "Nepean", population: "172k", ward: "Ward 9 · Knoxdale-Merivale", reporter: "D. Okonkwo",
    blurb: { en: "Long-established west-side neighbourhoods, big-box corridors, and one of the city's busiest sports complexes.", fr: "Quartiers ouest établis, corridors commerciaux et l'un des complexes sportifs les plus fréquentés." },
    character: { en: "Established west", fr: "Ouest établi" } },
  { name: "Alta Vista", population: "44k", ward: "Ward 18 · Alta Vista", reporter: "L. Boucher",
    blurb: { en: "Postwar bungalows, Ottawa Hospital General campus, and the city's most contested transit-priority corridor.", fr: "Bungalows d'après-guerre, Campus Général de l'Hôpital d'Ottawa et corridor prioritaire contesté." },
    character: { en: "Hospital district", fr: "Quartier hospitalier" } },
  { name: "Old Ottawa South", population: "11k", ward: "Ward 17 · Capital", reporter: "M.-C. Tremblay",
    blurb: { en: "Bank Street south of the canal, Brewer Park, Carleton students, and one of Ottawa's quietest community fights.", fr: "Rue Bank au sud du canal, parc Brewer, étudiants de Carleton et lutte communautaire silencieuse." },
    character: { en: "Riverside & student", fr: "Riverain et étudiant" } },
  { name: "Little Italy", population: "9k", ward: "Ward 14 · Somerset", reporter: "R. Mohammadi",
    blurb: { en: "Preston Street's restaurant strip, Dow's Lake skating, and a long-term plan to lid the Queensway.", fr: "Restaurants de la rue Preston, patinage au lac Dow's et plan pour couvrir le Queensway." },
    character: { en: "Culinary corridor", fr: "Corridor culinaire" } },
  { name: "Chinatown", population: "8k", ward: "Ward 14 · Somerset", reporter: "L. Boucher",
    blurb: { en: "Somerset's heritage arch, the Asian-Canadian cultural district, and a busy pan-Asian small-business renewal.", fr: "Arche patrimoniale de Somerset, district culturel et renouvellement des PME asiatiques." },
    character: { en: "Pan-Asian heritage", fr: "Patrimoine pan-asiatique" } },
  { name: "Gloucester", population: "115k", ward: "Ward 2 · Orléans West-Innes", reporter: "M. Bélanger",
    blurb: { en: "South-east industrial parks, big-box retail, and a fast-growing immigrant-served east-end strip.", fr: "Parcs industriels du sud-est, commerces et corridor en croissance pour nouveaux arrivants." },
    character: { en: "Industrial east", fr: "Est industriel" } },
  { name: "Rural Ottawa", population: "82k", ward: "Wards 5, 19, 20, 21", reporter: "Community desk",
    blurb: { en: "Manotick, Greely, Carp, Osgoode, West Carleton-March: farms, rivers, septic & broadband gaps the city map often forgets.", fr: "Manotick, Greely, Carp, Osgoode, West Carleton-March : fermes, rivières, lacunes en internet et en eau." },
    character: { en: "Farms & villages", fr: "Fermes et villages" } },
];

// ============================================================================
// LIVE OTTAWA PULSE — Social listening, trends, link-to-story, sports, food
// ============================================================================

export type Platform =
  | "x" | "instagram" | "tiktok" | "facebook" | "reddit" | "youtube"
  | "blog" | "newsletter" | "city" | "club" | "event" | "venue" | "rss";

export type SignalStatus =
  | "unverified"        // community signal, not yet checked
  | "developing"        // editors looking into it
  | "verified"          // confirmed with primary source
  | "needs-context"     // partially true / missing key facts
  | "misinformation"    // flagged risk
  | "official";         // direct from official channel

export type Sentiment = "positive" | "neutral" | "concerned" | "outraged" | "celebratory";
export type Urgency = "low" | "medium" | "high" | "breaking";

export type SocialFeedSource = {
  id: string;
  name: string;
  handle?: string;
  platform: Platform;
  url: string;
  type: "official" | "media" | "community" | "creator" | "business" | "club";
  language: "en" | "fr" | "other";
  credibility: number; // 0–100
  followers?: string;
  notes?: string;
};

export const SOCIAL_FEED_SOURCES: SocialFeedSource[] = [
  { id: "src1", name: "City of Ottawa", handle: "@ottawacity", platform: "x", url: "https://x.com/ottawacity", type: "official", language: "en", credibility: 96, followers: "240k" },
  { id: "src2", name: "Ville d'Ottawa", handle: "@villeottawa", platform: "x", url: "https://x.com/villeottawa", type: "official", language: "fr", credibility: 96, followers: "88k" },
  { id: "src3", name: "OC Transpo", handle: "@oc_transpo", platform: "x", url: "https://x.com/oc_transpo", type: "official", language: "en", credibility: 94, followers: "162k" },
  { id: "src4", name: "Ottawa Police Service", handle: "@ottawapolice", platform: "x", url: "https://x.com/ottawapolice", type: "official", language: "en", credibility: 93 },
  { id: "src5", name: "r/Ottawa", platform: "reddit", url: "https://reddit.com/r/ottawa", type: "community", language: "en", credibility: 62, followers: "210k", notes: "High signal, requires editorial filtering" },
  { id: "src6", name: "r/Vanier", platform: "reddit", url: "https://reddit.com/r/vanier", type: "community", language: "en", credibility: 58 },
  { id: "src7", name: "Ottawa Senators", handle: "@Senators", platform: "x", url: "https://x.com/Senators", type: "club", language: "en", credibility: 90 },
  { id: "src8", name: "Atlético Ottawa", handle: "@atleticoottawa", platform: "instagram", url: "https://instagram.com/atleticoottawa", type: "club", language: "en", credibility: 90 },
  { id: "src9", name: "Ottawa Titans", platform: "instagram", url: "https://instagram.com/ottawatitans", type: "club", language: "en", credibility: 88 },
  { id: "src10", name: "Ottawa BlackJacks", platform: "instagram", url: "https://instagram.com/ottawablackjacks", type: "club", language: "en", credibility: 88 },
  { id: "src11", name: "Equator Coffee", platform: "instagram", url: "https://instagram.com/equatorcoffee", type: "business", language: "en", credibility: 80 },
  { id: "src12", name: "Bar Robo", platform: "instagram", url: "https://instagram.com/barrobo", type: "business", language: "en", credibility: 78 },
  { id: "src13", name: "Le Droit", platform: "rss", url: "https://www.ledroit.com/rss", type: "media", language: "fr", credibility: 92 },
  { id: "src14", name: "Apt613", platform: "blog", url: "https://apt613.ca/feed", type: "media", language: "en", credibility: 84 },
  { id: "src15", name: "Hintonburg Community Association", platform: "newsletter", url: "https://hintonburg.com", type: "community", language: "en", credibility: 86 },
  { id: "src16", name: "Ottawa Tourism — Events", platform: "event", url: "https://ottawatourism.ca/events", type: "official", language: "en", credibility: 90 },
  { id: "src17", name: "TikTok #OttawaEats", platform: "tiktok", url: "https://tiktok.com/tag/ottawaeats", type: "creator", language: "other", credibility: 55 },
  { id: "src18", name: "YouTube — Ottawa Council Live", platform: "youtube", url: "https://youtube.com/@ottawacouncil", type: "official", language: "en", credibility: 95 },
  { id: "src19", name: "Facebook — Glebe Parents", platform: "facebook", url: "https://facebook.com/groups/glebeparents", type: "community", language: "en", credibility: 60 },
  { id: "src20", name: "Environment Canada — Ottawa", platform: "rss", url: "https://weather.gc.ca/rss/city/on-118_e.xml", type: "official", language: "en", credibility: 99 },
];

export type TrendItem = {
  id: string;
  topic: Bilingual;
  summary: Bilingual;
  hashtags: string[];
  platforms: Platform[];
  mentions: number;
  delta: number; // % change last 6h
  firstSeen: string;
  lastUpdated: string;
  neighborhood?: Neighborhood | "Citywide";
  category: "politics" | "transit" | "sports" | "food" | "weather" | "safety" | "culture" | "education" | "housing" | "good-news" | "events";
  sentiment: Sentiment;
  urgency: Urgency;
  status: SignalStatus;
  misinfoRisk: "low" | "medium" | "high";
  language: "en" | "fr" | "other";
  sourceUrls: { platform: Platform; label: string; url: string }[];
  needsReview: boolean;
  canBecomeArticle: boolean;
  needsFactCheck: boolean;
  goodNews?: boolean;
  affected?: Bilingual;
  whatHappened?: Bilingual;
  whatVerified?: Bilingual;
  whatUnclear?: Bilingual;
  localImpact?: Bilingual;
  editorNote?: Bilingual;
};

export const TREND_ITEMS: TrendItem[] = [
  {
    id: "tr1",
    topic: { en: "Pothole crater on Riverside Drive going viral", fr: "Cratère sur Riverside Drive devient viral" },
    summary: { en: "Cyclists posting video of a deep pothole near Billings Bridge; city has not yet acknowledged.", fr: "Cyclistes diffusent une vidéo d'un nid-de-poule profond près de Billings Bridge; la ville n'a pas confirmé." },
    hashtags: ["#ottnews", "#bikeottawa", "#ottroads"],
    platforms: ["x", "reddit", "instagram"],
    mentions: 1840, delta: 312,
    firstSeen: "2026-05-24T13:00:00Z", lastUpdated: "2026-05-24T19:42:00Z",
    neighborhood: "Alta Vista", category: "safety", sentiment: "concerned", urgency: "high",
    status: "developing", misinfoRisk: "low", language: "en",
    sourceUrls: [
      { platform: "x", label: "@bikeottawa thread", url: "https://x.com/bikeottawa/status/0" },
      { platform: "reddit", label: "r/Ottawa megathread", url: "https://reddit.com/r/ottawa" },
    ],
    needsReview: true, canBecomeArticle: true, needsFactCheck: false,
    whatHappened: { en: "Multiple cyclists report a roughly 30cm-deep pothole opened after weekend rain.", fr: "Plusieurs cyclistes signalent un nid-de-poule d'environ 30 cm apparu après la pluie du week-end." },
    whatVerified: { en: "Three independent videos geolocated to Riverside Dr near Billings Bridge.", fr: "Trois vidéos indépendantes géolocalisées sur Riverside Dr près de Billings Bridge." },
    whatUnclear: { en: "Whether the city has dispatched a repair crew or barricaded the hazard.", fr: "Si la ville a dépêché une équipe ou installé une barricade." },
    localImpact: { en: "Sits on a daily commuter route used by ~2,200 cyclists.", fr: "Sur un trajet quotidien emprunté par ~2 200 cyclistes." },
  },
  {
    id: "tr2",
    topic: { en: "Senators' Game 5 watch parties trending citywide", fr: "Soirées du Match 5 des Sénateurs en vogue" },
    summary: { en: "Lansdowne, Hintonburg, and Barrhaven bars promoting free screenings; #GoSensGo top regional trend.", fr: "Lansdowne, Hintonburg et Barrhaven : projections gratuites; #GoSensGo en tête." },
    hashtags: ["#GoSensGo", "#Sens", "#Ottawa"],
    platforms: ["x", "instagram", "tiktok"],
    mentions: 9420, delta: 178,
    firstSeen: "2026-05-24T11:00:00Z", lastUpdated: "2026-05-24T20:10:00Z",
    neighborhood: "Citywide", category: "sports", sentiment: "celebratory", urgency: "medium",
    status: "verified", misinfoRisk: "low", language: "en",
    sourceUrls: [
      { platform: "x", label: "@Senators official", url: "https://x.com/Senators" },
      { platform: "instagram", label: "Lansdowne Live IG", url: "https://instagram.com/lansdownelive" },
    ],
    needsReview: false, canBecomeArticle: true, needsFactCheck: false, goodNews: true,
  },
  {
    id: "tr3",
    topic: { en: "Claim: 'all Orleans night buses cancelled'", fr: "Affirmation : « tous les autobus de nuit d'Orléans sont annulés »" },
    summary: { en: "Facebook post claims OC Transpo cut night service. Two late routes were merged; Route 305 still runs.", fr: "Publication Facebook : OC Transpo a coupé le service. Deux trajets fusionnés; Route 305 toujours active." },
    hashtags: ["#octranspo", "#orleans"],
    platforms: ["facebook", "reddit"],
    mentions: 612, delta: 88,
    firstSeen: "2026-05-23T22:00:00Z", lastUpdated: "2026-05-24T09:30:00Z",
    neighborhood: "Orleans", category: "transit", sentiment: "outraged", urgency: "medium",
    status: "misinformation", misinfoRisk: "high", language: "en",
    sourceUrls: [{ platform: "facebook", label: "Orleans Community FB", url: "https://facebook.com/groups/orleansott" }],
    needsReview: true, canBecomeArticle: false, needsFactCheck: true,
  },
  {
    id: "tr4",
    topic: { en: "New ramen spot in Chinatown drawing 90-minute lines", fr: "Nouveau ramen à Chinatown : files de 90 minutes" },
    summary: { en: "TikTok creators posting from Somerset St West; restaurant unconfirmed by city business registry.", fr: "Créateurs TikTok publient depuis Somerset Ouest; restaurant non confirmé au registre commercial." },
    hashtags: ["#ottawaeats", "#ramen", "#chinatownott"],
    platforms: ["tiktok", "instagram"],
    mentions: 2210, delta: 540,
    firstSeen: "2026-05-22T18:00:00Z", lastUpdated: "2026-05-24T17:00:00Z",
    neighborhood: "Chinatown", category: "food", sentiment: "positive", urgency: "low",
    status: "unverified", misinfoRisk: "low", language: "other",
    sourceUrls: [{ platform: "tiktok", label: "#ottawaeats", url: "https://tiktok.com/tag/ottawaeats" }],
    needsReview: true, canBecomeArticle: true, needsFactCheck: false, goodNews: true,
  },
  {
    id: "tr5",
    topic: { en: "City Hall consultation on inclusionary zoning", fr: "Consultation municipale sur le zonage inclusif" },
    summary: { en: "Live YouTube stream of council planning committee; deadline for written submissions June 11.", fr: "Diffusion YouTube du comité de planification; soumissions écrites jusqu'au 11 juin." },
    hashtags: ["#ottcity", "#housingott"],
    platforms: ["youtube", "x"],
    mentions: 480, delta: 22,
    firstSeen: "2026-05-24T09:00:00Z", lastUpdated: "2026-05-24T18:00:00Z",
    neighborhood: "Centretown", category: "housing", sentiment: "neutral", urgency: "medium",
    status: "official", misinfoRisk: "low", language: "en",
    sourceUrls: [{ platform: "youtube", label: "Council livestream", url: "https://youtube.com/@ottawacouncil" }],
    needsReview: false, canBecomeArticle: true, needsFactCheck: false,
  },
  {
    id: "tr6",
    topic: { en: "Freezing rain advisory: salt sales surge", fr: "Avis de pluie verglaçante : ventes de sel en hausse" },
    summary: { en: "Hardware stores report 4x normal demand; ECCC warning active until 06:00.", fr: "Quincailleries : demande quadruplée; avis ECCC actif jusqu'à 6 h." },
    hashtags: ["#ottwx", "#ottweather"],
    platforms: ["x", "rss"],
    mentions: 1320, delta: 210,
    firstSeen: "2026-05-24T17:00:00Z", lastUpdated: "2026-05-24T20:15:00Z",
    neighborhood: "Citywide", category: "weather", sentiment: "concerned", urgency: "breaking",
    status: "official", misinfoRisk: "low", language: "en",
    sourceUrls: [{ platform: "rss", label: "Environment Canada", url: "https://weather.gc.ca" }],
    needsReview: false, canBecomeArticle: true, needsFactCheck: false,
  },
  {
    id: "tr7",
    topic: { en: "Vanier sugar shack reopens — community thread", fr: "Cabane à sucre de Vanier rouvre — fil communautaire" },
    summary: { en: "Hundreds of bilingual reactions celebrating the reopening of a Franco-Ontarian institution.", fr: "Centaines de réactions bilingues célébrant la réouverture d'une institution franco-ontarienne." },
    hashtags: ["#vanier", "#francoontarien"],
    platforms: ["facebook", "instagram"],
    mentions: 740, delta: 64,
    firstSeen: "2026-05-23T15:00:00Z", lastUpdated: "2026-05-24T12:00:00Z",
    neighborhood: "Vanier", category: "culture", sentiment: "celebratory", urgency: "low",
    status: "verified", misinfoRisk: "low", language: "fr",
    sourceUrls: [{ platform: "facebook", label: "Vanier BIA page", url: "https://facebook.com/vanierbia" }],
    needsReview: false, canBecomeArticle: true, needsFactCheck: false, goodNews: true,
  },
  {
    id: "tr8",
    topic: { en: "Westboro bike lane safety petition crosses 5,000", fr: "Pétition sur la piste cyclable de Westboro dépasse 5 000" },
    summary: { en: "Change.org petition gaining momentum after Ledger investigation; councillor responded on X.", fr: "Pétition Change.org en hausse après notre enquête; conseillère a répondu sur X." },
    hashtags: ["#westboro", "#bikeottawa"],
    platforms: ["x", "facebook"],
    mentions: 980, delta: 56,
    firstSeen: "2026-05-20T10:00:00Z", lastUpdated: "2026-05-24T16:00:00Z",
    neighborhood: "Westboro", category: "safety", sentiment: "concerned", urgency: "medium",
    status: "verified", misinfoRisk: "low", language: "en",
    sourceUrls: [{ platform: "x", label: "Councillor response", url: "https://x.com" }],
    needsReview: false, canBecomeArticle: true, needsFactCheck: false,
  },
];

export type SubmittedLink = {
  id: string;
  url: string;
  platform: Platform;
  submittedBy: string;
  submittedAt: string;
  note?: string;
  status: "queued" | "in-review" | "drafted" | "rejected" | "published";
  neighborhood?: Neighborhood | "Citywide";
  category?: TrendItem["category"];
};

export const SUBMITTED_LINKS: SubmittedLink[] = [
  { id: "sl1", url: "https://x.com/bikeottawa/status/0", platform: "x", submittedBy: "reader@protonmail.com",
    submittedAt: "2026-05-24T14:10:00Z", note: "Big pothole, three cyclists down today.",
    status: "in-review", neighborhood: "Alta Vista", category: "safety" },
  { id: "sl2", url: "https://tiktok.com/@foodieott/video/0", platform: "tiktok", submittedBy: "anonymous",
    submittedAt: "2026-05-24T11:00:00Z", note: "New ramen place — worth verifying business licence.",
    status: "queued", neighborhood: "Chinatown", category: "food" },
  { id: "sl3", url: "https://reddit.com/r/ottawa/comments/0", platform: "reddit", submittedBy: "j.tremblay",
    submittedAt: "2026-05-24T08:30:00Z", note: "Thread on Route 305 confusion — needs OC Transpo confirmation.",
    status: "drafted", neighborhood: "Orleans", category: "transit" },
  { id: "sl4", url: "https://instagram.com/p/0", platform: "instagram", submittedBy: "leah.k",
    submittedAt: "2026-05-23T20:00:00Z", note: "Hintonburg block party photos.",
    status: "published", neighborhood: "Hintonburg", category: "culture" },
  { id: "sl5", url: "https://youtube.com/watch?v=0", platform: "youtube", submittedBy: "council-watcher",
    submittedAt: "2026-05-24T09:45:00Z", note: "Clip from planning committee — councillor's housing remarks.",
    status: "in-review", neighborhood: "Centretown", category: "housing" },
];

export type EditorialDraft = {
  id: string;
  fromLinkId?: string;
  headline: Bilingual;
  summary: Bilingual;
  category: TrendItem["category"];
  neighborhood?: Neighborhood | "Citywide";
  source: string;
  relatedLinks: string[];
  verificationChecklist: { item: Bilingual; done: boolean }[];
  publicInterest: Bilingual;
  whoAffected: Bilingual;
  whoToContact: string[];
  suggestedQuestions: Bilingual[];
  factCheckStatus: "not-started" | "pending" | "cleared" | "blocked";
  state: "draft" | "needs-evidence" | "ready" | "published" | "rejected";
  assignedTo?: string;
};

export const EDITORIAL_DRAFTS: EditorialDraft[] = [
  {
    id: "ed1", fromLinkId: "sl1",
    headline: {
      en: "Cyclists report deepening Riverside Drive pothole; city silent",
      fr: "Cyclistes signalent un nid-de-poule grandissant sur Riverside; ville silencieuse",
    },
    summary: {
      en: "A growing chorus on X and Reddit points to a 30cm pothole near Billings Bridge. The Ledger is verifying with 311 and Public Works.",
      fr: "Témoignages convergents sur X et Reddit : nid-de-poule de 30 cm près de Billings Bridge. Vérification en cours auprès du 311 et des Travaux publics.",
    },
    category: "safety", neighborhood: "Alta Vista",
    source: "Reader submission + bike advocacy thread",
    relatedLinks: ["https://x.com/bikeottawa/status/0", "https://reddit.com/r/ottawa"],
    verificationChecklist: [
      { item: { en: "Geolocate at least two independent videos", fr: "Géolocaliser deux vidéos indépendantes" }, done: true },
      { item: { en: "311 case number obtained", fr: "Numéro de dossier 311 obtenu" }, done: false },
      { item: { en: "Public Works asked for repair timeline", fr: "Travaux publics : délai de réparation demandé" }, done: false },
      { item: { en: "Councillor for Ward 18 asked for comment", fr: "Conseillère du quartier 18 sollicitée" }, done: false },
    ],
    publicInterest: { en: "Daily commuter safety on a route used by ~2,200 cyclists.", fr: "Sécurité quotidienne sur un trajet de ~2 200 cyclistes." },
    whoAffected: { en: "Cyclists, scooter users, motorbike riders on Riverside Dr.", fr: "Cyclistes, trottinettes et motos sur Riverside Dr." },
    whoToContact: ["311", "Ward 18 office", "Public Works — Roads", "Bike Ottawa"],
    suggestedQuestions: [
      { en: "When was the hazard first reported to 311?", fr: "Quand le danger a-t-il été signalé au 311 ?" },
      { en: "Why hasn't a barricade been installed yet?", fr: "Pourquoi aucune barricade n'a été installée ?" },
      { en: "What is the standard repair window for this severity?", fr: "Quel est le délai standard pour cette gravité ?" },
    ],
    factCheckStatus: "pending", state: "needs-evidence", assignedTo: "R. Mohammadi",
  },
  {
    id: "ed2", fromLinkId: "sl2",
    headline: {
      en: "TikTok ramen line: is Chinatown's newest restaurant really open?",
      fr: "File pour le ramen TikTok : ce restaurant de Chinatown est-il vraiment ouvert ?",
    },
    summary: {
      en: "Viral TikTok clips show queues, but the city business registry has no current licence at the address. We're knocking on the door tomorrow.",
      fr: "Vidéos TikTok virales montrent des files, mais le registre municipal n'a aucune licence active. Visite prévue demain.",
    },
    category: "food", neighborhood: "Chinatown",
    source: "Reader-submitted TikTok",
    relatedLinks: ["https://tiktok.com/tag/ottawaeats"],
    verificationChecklist: [
      { item: { en: "Confirm address on the city registry", fr: "Confirmer l'adresse au registre municipal" }, done: false },
      { item: { en: "Public Health inspection check", fr: "Vérification Santé publique" }, done: false },
      { item: { en: "Owner contacted for comment", fr: "Propriétaire contacté" }, done: false },
    ],
    publicInterest: { en: "Food safety + supporting verified small businesses.", fr: "Sécurité alimentaire + soutien aux PME vérifiées." },
    whoAffected: { en: "Diners, neighbouring restaurants on Somerset St W.", fr: "Clients et restaurants voisins de Somerset Ouest." },
    whoToContact: ["Ottawa Public Health", "Somerset Chinatown BIA", "Owner / operator"],
    suggestedQuestions: [
      { en: "Is this a pop-up, a full opening, or a soft launch?", fr: "S'agit-il d'un éphémère, d'une ouverture officielle ou d'un lancement discret ?" },
    ],
    factCheckStatus: "not-started", state: "draft", assignedTo: "L. Boucher",
  },
];

export type NeighborhoodSignal = {
  neighborhood: Neighborhood;
  topIssues: Bilingual[];
  trendingPosts: number;
  submissions: number;
  trafficNote?: Bilingual;
  topEvent?: Bilingual;
  topFood?: string;
  sportsNote?: Bilingual;
  serviceIssue?: Bilingual;
  unresolved?: Bilingual;
  proposedSolution?: Bilingual;
  pulse: number; // 0–100 activity score
};

export const NEIGHBORHOOD_SIGNALS: NeighborhoodSignal[] = [
  { neighborhood: "ByWard Market", pulse: 92, trendingPosts: 184, submissions: 12,
    topIssues: [{ en: "Late-night noise on York St", fr: "Bruit nocturne rue York" }, { en: "Outdoor market vendor permits", fr: "Permis pour vendeurs extérieurs" }],
    trafficNote: { en: "Wellington closed for film shoot 19:00–02:00", fr: "Wellington fermée pour tournage 19h–2h" },
    topEvent: { en: "Late-night mural walk, Friday", fr: "Marche des murales nocturnes, vendredi" },
    topFood: "Play Food & Wine", proposedSolution: { en: "Pilot a night-economy ombudsperson", fr: "Pilote : ombudsman de l'économie nocturne" } },
  { neighborhood: "Centretown", pulse: 88, trendingPosts: 142, submissions: 18,
    topIssues: [{ en: "Affordable housing vote", fr: "Vote sur le logement abordable" }, { en: "Unsafe Lisgar crossing", fr: "Traverse non sécuritaire Lisgar" }],
    serviceIssue: { en: "Crosswalk signal timing on Lyon St", fr: "Synchronisation feux piétons rue Lyon" } },
  { neighborhood: "Glebe", pulse: 71, trendingPosts: 96, submissions: 7,
    topIssues: [{ en: "School waitlists", fr: "Listes d'attente scolaires" }, { en: "Bank St lane reduction", fr: "Réduction de voies rue Bank" }],
    topEvent: { en: "Senators watch party at Lansdowne", fr: "Soirée Sénateurs à Lansdowne" } },
  { neighborhood: "Westboro", pulse: 79, trendingPosts: 110, submissions: 9,
    topIssues: [{ en: "Bike lane safety petition", fr: "Pétition piste cyclable" }],
    serviceIssue: { en: "Repeated near-misses at Richmond/Churchill", fr: "Quasi-accidents répétés Richmond/Churchill" } },
  { neighborhood: "Hintonburg", pulse: 74, trendingPosts: 88, submissions: 11,
    topIssues: [{ en: "Rising commercial rents", fr: "Hausse des loyers commerciaux" }],
    topFood: "Bar Robo", topEvent: { en: "Parkdale Market opening", fr: "Ouverture marché Parkdale" } },
  { neighborhood: "Vanier", pulse: 68, trendingPosts: 72, submissions: 14,
    topIssues: [{ en: "Community fridge expansion", fr: "Expansion frigos communautaires" }, { en: "Sugar shack reopening", fr: "Réouverture cabane à sucre" }] },
  { neighborhood: "Sandy Hill", pulse: 63, trendingPosts: 58, submissions: 6,
    topIssues: [{ en: "Rooming-house conversions", fr: "Conversions maisons de chambres" }] },
  { neighborhood: "Kanata", pulse: 81, trendingPosts: 124, submissions: 9,
    topIssues: [{ en: "Tech sector layoffs", fr: "Licenciements tech" }, { en: "LRT Stage 3 timeline", fr: "Calendrier TLR phase 3" }] },
  { neighborhood: "Orleans", pulse: 77, trendingPosts: 102, submissions: 13,
    topIssues: [{ en: "Night-bus confusion (misinfo)", fr: "Confusion bus nuit (désinfo)" }, { en: "School bus delays", fr: "Retards d'autobus scolaires" }] },
  { neighborhood: "Barrhaven", pulse: 64, trendingPosts: 70, submissions: 5,
    topIssues: [{ en: "New school overcrowding", fr: "Surpopulation école neuve" }] },
  { neighborhood: "Nepean", pulse: 58, trendingPosts: 54, submissions: 4,
    topIssues: [{ en: "Sports complex booking shortage", fr: "Pénurie réservations complexe sportif" }] },
  { neighborhood: "Alta Vista", pulse: 73, trendingPosts: 86, submissions: 8,
    topIssues: [{ en: "Riverside Dr pothole hazard", fr: "Nid-de-poule Riverside Dr" }],
    serviceIssue: { en: "Pothole + 311 response delay", fr: "Nid-de-poule + retard du 311" } },
  { neighborhood: "Little Italy", pulse: 66, trendingPosts: 64, submissions: 5,
    topIssues: [{ en: "Preston St patio season", fr: "Saison des terrasses Preston" }], topFood: "Pub Italia" },
  { neighborhood: "Chinatown", pulse: 82, trendingPosts: 118, submissions: 7,
    topIssues: [{ en: "Viral ramen line — unverified", fr: "File ramen virale — non vérifié" }], topFood: "(unverified) new ramen spot" },
  { neighborhood: "Old Ottawa South", pulse: 52, trendingPosts: 40, submissions: 3,
    topIssues: [{ en: "Brewer Park field schedule", fr: "Horaire terrains parc Brewer" }] },
  { neighborhood: "Downtown", pulse: 89, trendingPosts: 160, submissions: 16,
    topIssues: [{ en: "LRT Line 1 disruption", fr: "Perturbation Ligne 1" }, { en: "Wellington closure", fr: "Fermeture Wellington" }] },
  { neighborhood: "Gloucester", pulse: 49, trendingPosts: 34, submissions: 2,
    topIssues: [{ en: "Big-box parking lot flooding", fr: "Inondations stationnement commercial" }] },
  { neighborhood: "Rural Ottawa", pulse: 44, trendingPosts: 28, submissions: 6,
    topIssues: [{ en: "Broadband gaps", fr: "Lacunes Internet" }, { en: "Wildfire smoke drift", fr: "Dérive de fumée de feux" }] },
];

export type SportsEvent = {
  id: string;
  team: string;
  league: "NHL" | "PWHL" | "CPL" | "FrontierLeague" | "CEBL" | "USports" | "Community" | "Youth" | "School";
  opponent?: string;
  kind: "match" | "result" | "tournament" | "highlight";
  date: string;
  venue: string;
  neighborhood: Neighborhood | "Citywide";
  status: "scheduled" | "live" | "final";
  score?: string;
  ticketUrl?: string;
  social?: { platform: Platform; url: string; mentions?: number };
  blurb: Bilingual;
};

export const SPORTS_EVENTS: SportsEvent[] = [
  { id: "sp1", team: "Ottawa Senators", league: "NHL", opponent: "Toronto Maple Leafs", kind: "match",
    date: "2026-05-26T19:00:00Z", venue: "Canadian Tire Centre", neighborhood: "Kanata", status: "scheduled",
    ticketUrl: "https://nhl.com/senators", social: { platform: "x", url: "https://x.com/Senators", mentions: 9420 },
    blurb: { en: "Game 5 of the second round. Watch parties citywide.", fr: "Match 5 du 2e tour. Soirées partout en ville." } },
  { id: "sp2", team: "Atlético Ottawa", league: "CPL", opponent: "Forge FC", kind: "result",
    date: "2026-05-23T20:00:00Z", venue: "TD Place", neighborhood: "Glebe", status: "final", score: "2–1",
    social: { platform: "instagram", url: "https://instagram.com/atleticoottawa", mentions: 2100 },
    blurb: { en: "Late header secures three points in front of 12,300 fans.", fr: "Tête tardive : trois points devant 12 300 partisans." } },
  { id: "sp3", team: "Ottawa Titans", league: "FrontierLeague", opponent: "New York Boulders", kind: "match",
    date: "2026-05-27T18:30:00Z", venue: "Ottawa Stadium", neighborhood: "Gloucester", status: "scheduled",
    ticketUrl: "https://ottawatitans.com", blurb: { en: "Friday-night baseball under the lights.", fr: "Baseball du vendredi soir sous les projecteurs." } },
  { id: "sp4", team: "Ottawa BlackJacks", league: "CEBL", opponent: "Niagara River Lions", kind: "match",
    date: "2026-05-30T19:00:00Z", venue: "TD Place Arena", neighborhood: "Glebe", status: "scheduled",
    blurb: { en: "CEBL season opener. Free youth entry with adult ticket.", fr: "Ouverture de saison CEBL. Entrée jeunesse gratuite avec billet adulte." } },
  { id: "sp5", team: "PWHL Showcase Ottawa", league: "PWHL", kind: "tournament",
    date: "2026-06-08T13:00:00Z", venue: "TD Place Arena", neighborhood: "Glebe", status: "scheduled",
    blurb: { en: "Women's hockey showcase featuring Montréal and Toronto clubs.", fr: "Vitrine de hockey féminin : clubs de Montréal et Toronto." } },
  { id: "sp6", team: "uOttawa Gee-Gees", league: "USports", opponent: "Carleton Ravens", kind: "match",
    date: "2026-09-12T19:30:00Z", venue: "Lansdowne Stadium", neighborhood: "Glebe", status: "scheduled",
    blurb: { en: "Panda Game — Ottawa's biggest university rivalry.", fr: "Match Panda — la plus grande rivalité universitaire d'Ottawa." } },
  { id: "sp7", team: "Hintonburg Cup (U13 soccer)", league: "Youth", kind: "tournament",
    date: "2026-06-14T09:00:00Z", venue: "Laroche Park", neighborhood: "Hintonburg", status: "scheduled",
    blurb: { en: "Neighbourhood youth tournament, 24 teams, bilingual coaching.", fr: "Tournoi jeunesse de quartier, 24 équipes, encadrement bilingue." } },
  { id: "sp8", team: "Orleans Minor Hockey playoffs", league: "Community", kind: "tournament",
    date: "2026-05-31T08:00:00Z", venue: "Bob MacQuarrie Rec Complex", neighborhood: "Orleans", status: "scheduled",
    blurb: { en: "Four divisions, finals televised on local cable.", fr: "Quatre divisions, finales télédiffusées localement." } },
  { id: "sp9", team: "Highlight — Vanier youth basketball", league: "School", kind: "highlight",
    date: "2026-05-22T16:00:00Z", venue: "École secondaire De La Salle", neighborhood: "Vanier", status: "final",
    blurb: { en: "Grade 9 player drops 38 points; coach calls it the best she's seen.", fr: "Joueuse de secondaire 3 inscrit 38 points; meilleure performance selon l'entraîneuse." } },
];

export type FoodPlace = {
  id: string;
  name: string;
  cuisine: string;
  neighborhood: Neighborhood;
  priceRange: "$" | "$$" | "$$$";
  openNow: boolean;
  newOpening?: boolean;
  tags: ("coffee" | "bakery" | "halal" | "vegan" | "vegetarian" | "filter-coffee" | "brunch" | "late-night")[];
  popularOn: Platform[];
  rating: number;             // out of 5
  reviews: number;
  inspection?: { date: string; status: "pass" | "minor" | "major" };
  recommendedBy: "community" | "editor" | "sponsored" | "trend";
  blurb: Bilingual;
  image: string;
  verified: boolean;
};

export const FOOD_PLACES: FoodPlace[] = [
  { id: "fp1", name: "Equator Coffee — Preston", cuisine: "Coffee & espresso", neighborhood: "Little Italy",
    priceRange: "$", openNow: true, tags: ["coffee", "filter-coffee", "vegetarian"], popularOn: ["instagram"],
    rating: 4.7, reviews: 612, inspection: { date: "2026-04-12", status: "pass" }, recommendedBy: "editor",
    blurb: { en: "Single-origin filter coffee and a quiet upstairs work bar.", fr: "Café filtre d'origine unique et bar de travail tranquille à l'étage." },
    image: img("1495474472287-4d71bcdd2085"), verified: true },
  { id: "fp2", name: "Bar Robo", cuisine: "Cocktails & small plates", neighborhood: "Hintonburg",
    priceRange: "$$", openNow: true, tags: ["late-night", "vegetarian"], popularOn: ["instagram", "tiktok"],
    rating: 4.6, reviews: 480, inspection: { date: "2026-03-04", status: "pass" }, recommendedBy: "community",
    blurb: { en: "Wellington West's quietly excellent late-night option.", fr: "L'excellente option discrète de fin de soirée à Wellington Ouest." },
    image: img("1514933651103-005eec06c04b"), verified: true },
  { id: "fp3", name: "Shawarma Palace", cuisine: "Lebanese", neighborhood: "Centretown",
    priceRange: "$", openNow: true, tags: ["halal", "late-night"], popularOn: ["facebook"],
    rating: 4.5, reviews: 1820, inspection: { date: "2026-02-15", status: "pass" }, recommendedBy: "community",
    blurb: { en: "An Ottawa institution; lines move fast even at 2am.", fr: "Une institution; les files avancent vite même à 2h." },
    image: img("1565299624946-b28f40a0ae38"), verified: true },
  { id: "fp4", name: "Pure Kitchen", cuisine: "Plant-based", neighborhood: "Westboro",
    priceRange: "$$", openNow: true, tags: ["vegan", "vegetarian", "brunch"], popularOn: ["instagram"],
    rating: 4.4, reviews: 980, inspection: { date: "2026-01-22", status: "pass" }, recommendedBy: "editor",
    blurb: { en: "Bowls, toasts, and weekend brunch with the city's best matcha.", fr: "Bols, rôties et brunch avec le meilleur matcha de la ville." },
    image: img("1546069901-ba9599a7e63c"), verified: true },
  { id: "fp5", name: "New Chinatown ramen (unverified)", cuisine: "Japanese ramen", neighborhood: "Chinatown",
    priceRange: "$$", openNow: false, newOpening: true, tags: ["late-night"], popularOn: ["tiktok"],
    rating: 0, reviews: 0, recommendedBy: "trend",
    blurb: { en: "Going viral on TikTok. We're verifying the business licence before recommending.", fr: "Viral sur TikTok. Vérification de la licence avant recommandation." },
    image: img("1569718212165-3a8278d5f624"), verified: false },
  { id: "fp6", name: "Art-Is-In Bakery", cuisine: "Bakery & sandwiches", neighborhood: "Hintonburg",
    priceRange: "$$", openNow: true, tags: ["bakery", "vegetarian"], popularOn: ["instagram"],
    rating: 4.7, reviews: 2210, inspection: { date: "2026-04-30", status: "pass" }, recommendedBy: "editor",
    blurb: { en: "Sourdough, Saturday queues, and the loaves that started a city trend.", fr: "Levain, files du samedi, et les pains qui ont lancé une tendance." },
    image: img("1568376794508-ae52c6ab3929"), verified: true },
  { id: "fp7", name: "Café Mio — Vanier", cuisine: "Café & boulangerie", neighborhood: "Vanier",
    priceRange: "$", openNow: true, tags: ["coffee", "bakery"], popularOn: ["facebook"],
    rating: 4.5, reviews: 230, inspection: { date: "2026-03-19", status: "pass" }, recommendedBy: "community",
    blurb: { en: "Bilingual neighbourhood café with morning regulars.", fr: "Café de quartier bilingue avec habitués du matin." },
    image: img("1521017432531-fbd92d768814"), verified: true },
  { id: "fp8", name: "El Camino", cuisine: "Tacos & mezcal", neighborhood: "Centretown",
    priceRange: "$$", openNow: true, tags: ["late-night"], popularOn: ["instagram"],
    rating: 4.4, reviews: 1340, inspection: { date: "2026-02-28", status: "pass" }, recommendedBy: "sponsored",
    blurb: { en: "Late-night tacos on Elgin; sponsored placement clearly labelled.", fr: "Tacos de fin de soirée rue Elgin; emplacement commandité clairement étiqueté." },
    image: img("1551504734-5ee1c4a1479b"), verified: true },
];

export type LiveTickerItem = {
  id: string;
  label: Bilingual;
  text: Bilingual;
  tone: "neutral" | "alert" | "good" | "sport" | "food" | "transit" | "weather";
  href?: string;
  source?: string;
  time?: string;
};

export const LIVE_TICKERS: Record<string, LiveTickerItem[]> = {
  breaking: [
    { id: "br1", label: { en: "TRANSIT", fr: "TRANSPORT" }, tone: "transit",
      text: { en: "OC Transpo: Line 1 single-tracking until midnight", fr: "OC Transpo : Ligne 1 voie unique jusqu'à minuit" }, source: "@oc_transpo", time: "20:42" },
    { id: "br2", label: { en: "WEATHER", fr: "MÉTÉO" }, tone: "weather",
      text: { en: "ECCC freezing rain warning until 06:00", fr: "ECCC : avertissement de pluie verglaçante jusqu'à 6 h" }, source: "ECCC", time: "20:30" },
    { id: "br3", label: { en: "CITY", fr: "VILLE" }, tone: "alert",
      text: { en: "Council approves 312 affordable units on Bank St", fr: "Conseil approuve 312 logements abordables rue Bank" }, source: "Council livestream", time: "20:15" },
    { id: "br4", label: { en: "SPORT", fr: "SPORT" }, tone: "sport",
      text: { en: "Atlético Ottawa 2–1 Forge FC, late header", fr: "Atlético Ottawa 2–1 Forge FC, tête tardive" }, source: "@atleticoottawa", time: "20:01" },
    { id: "br5", label: { en: "GOOD NEWS", fr: "BONNE NOUVELLE" }, tone: "good",
      text: { en: "Vanier community fridge network doubles in size", fr: "Le réseau de frigos communautaires de Vanier double" }, source: "Community report", time: "19:50" },
  ],
  sports: [
    { id: "sp-t1", label: { en: "NHL", fr: "LNH" }, tone: "sport", text: { en: "Sens Game 5 tonight, 19:00 — Canadian Tire Centre", fr: "Match 5 des Sens ce soir, 19h — Centre Canadian Tire" } },
    { id: "sp-t2", label: { en: "CPL", fr: "PCL" }, tone: "sport", text: { en: "Atlético Ottawa 2–1 Forge FC (FT)", fr: "Atlético Ottawa 2–1 Forge FC (Final)" } },
    { id: "sp-t3", label: { en: "PWHL", fr: "PWHL" }, tone: "sport", text: { en: "Women's hockey showcase June 8, TD Place", fr: "Vitrine hockey féminin 8 juin, Place TD" } },
    { id: "sp-t4", label: { en: "YOUTH", fr: "JEUNESSE" }, tone: "sport", text: { en: "Hintonburg Cup U13: 24 teams, June 14", fr: "Coupe Hintonburg U13 : 24 équipes, 14 juin" } },
    { id: "sp-t5", label: { en: "CEBL", fr: "CEBL" }, tone: "sport", text: { en: "BlackJacks season opener, May 30", fr: "Ouverture BlackJacks, 30 mai" } },
  ],
  food: [
    { id: "fd1", label: { en: "TRENDING", fr: "EN VOGUE" }, tone: "food", text: { en: "TikTok ramen line on Somerset — verification pending", fr: "File ramen TikTok rue Somerset — vérification en cours" } },
    { id: "fd2", label: { en: "NEW", fr: "NOUVEAU" }, tone: "food", text: { en: "Art-Is-In opens Vanier outpost this Saturday", fr: "Art-Is-In ouvre une succursale à Vanier samedi" } },
    { id: "fd3", label: { en: "COFFEE", fr: "CAFÉ" }, tone: "food", text: { en: "Equator unveils single-origin Ethiopian filter", fr: "Equator dévoile un filtre éthiopien d'origine unique" } },
    { id: "fd4", label: { en: "PATIO", fr: "TERRASSE" }, tone: "food", text: { en: "Preston St patios all open by Friday", fr: "Terrasses de Preston toutes ouvertes vendredi" } },
  ],
  good: [
    { id: "gd1", label: { en: "VANIER", fr: "VANIER" }, tone: "good", text: { en: "Community fridges feed 900 families a week", fr: "Frigos communautaires : 900 familles par semaine" } },
    { id: "gd2", label: { en: "GLEBE", fr: "GLEBE" }, tone: "good", text: { en: "Free outdoor screening of Sens Game 5", fr: "Projection extérieure gratuite du Match 5" } },
    { id: "gd3", label: { en: "WESTBORO", fr: "WESTBORO" }, tone: "good", text: { en: "Resident-led bike safety petition crosses 5,000", fr: "Pétition citoyenne sécurité vélo dépasse 5 000" } },
  ],
  canada: [
    { id: "ca1", label: { en: "OTTAWA-OTT", fr: "OTTAWA-OTT" }, tone: "neutral", text: { en: "Federal-provincial housing accord signed in Toronto", fr: "Accord fédéral-provincial sur le logement signé à Toronto" } },
    { id: "ca2", label: { en: "FR", fr: "FR" }, tone: "neutral", text: { en: "Bill C-13 French language guidance update", fr: "Mise à jour des directives sur la langue française (C-13)" } },
  ],
  world: [
    { id: "wo1", label: { en: "EU", fr: "UE" }, tone: "neutral", text: { en: "EU election turnout sets 25-year record", fr: "Participation aux élections UE : record sur 25 ans" } },
    { id: "wo2", label: { en: "CLIMATE", fr: "CLIMAT" }, tone: "neutral", text: { en: "Arctic ice extent 11% below 2010s average", fr: "Glace arctique : 11 % sous la moyenne 2010" } },
  ],
};

export type TopicCluster = {
  id: string;
  label: Bilingual;
  hashtags: string[];
  count: number;
  delta: number;
  category: TrendItem["category"];
};

export const TOPIC_CLUSTERS: TopicCluster[] = [
  { id: "tc1", label: { en: "Affordable housing", fr: "Logement abordable" }, hashtags: ["#housingott", "#ottcity"], count: 1840, delta: 64, category: "housing" },
  { id: "tc2", label: { en: "Bike safety", fr: "Sécurité vélo" }, hashtags: ["#bikeottawa"], count: 1320, delta: 88, category: "safety" },
  { id: "tc3", label: { en: "Sens playoffs", fr: "Séries des Sénateurs" }, hashtags: ["#GoSensGo"], count: 9420, delta: 178, category: "sports" },
  { id: "tc4", label: { en: "Ottawa eats", fr: "Bouffe d'Ottawa" }, hashtags: ["#ottawaeats", "#ramenott"], count: 2210, delta: 240, category: "food" },
  { id: "tc5", label: { en: "Freezing rain", fr: "Pluie verglaçante" }, hashtags: ["#ottwx"], count: 1280, delta: 312, category: "weather" },
  { id: "tc6", label: { en: "Franco-Ontarien", fr: "Franco-Ontarien" }, hashtags: ["#francoontarien"], count: 740, delta: 22, category: "culture" },
  { id: "tc7", label: { en: "School waitlists", fr: "Listes d'attente scolaires" }, hashtags: ["#ottschools"], count: 510, delta: 12, category: "education" },
  { id: "tc8", label: { en: "Misinformation watch", fr: "Veille désinformation" }, hashtags: ["#factcheckott"], count: 412, delta: 30, category: "politics" },
];
