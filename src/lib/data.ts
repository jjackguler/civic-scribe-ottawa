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

export type NeighborhoodInfo = {
  name: Neighborhood;
  blurb: Bilingual;
  population: string;
  reporter: string;
};
export const NEIGHBORHOOD_INFO: NeighborhoodInfo[] = NEIGHBORHOODS.map((n) => ({
  name: n,
  blurb: {
    en: `Local reporting from ${n}: civic meetings, neighbourhood issues, events, and resident voices.`,
    fr: `Reportages locaux de ${n} : réunions civiques, enjeux de quartier, événements et voix citoyennes.`,
  },
  population: ["28k", "31k", "12k", "21k", "16k", "19k", "23k", "17k", "118k", "126k", "98k", "172k", "44k", "11k", "9k", "8k", "115k", "82k"][NEIGHBORHOODS.indexOf(n)],
  reporter: ["M.-C. Tremblay", "D. Okonkwo", "L. Boucher", "S. Lavigne", "R. Mohammadi", "A. Diallo", "A. Diallo", "P. Sharma", "P. Sharma", "M. Bélanger", "S. Lavigne", "D. Okonkwo", "L. Boucher", "M.-C. Tremblay", "R. Mohammadi", "L. Boucher", "M. Bélanger", "Community desk"][NEIGHBORHOODS.indexOf(n)],
}));
