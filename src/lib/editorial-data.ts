import type {
  AnyEditorial, Author, ColumnDef, EditorialType,
  InterviewArticle, OpinionArticle, ColumnEntry, AnalysisArticle,
  EssayArticle, CartoonArticle, SatireArticle, PhotoEssayArticle,
  InvestigationArticle, ExplainerArticle, SolutionArticle, OpDocArticle,
  CommunityVoiceArticle, LetterArticle,
} from "@/types/editorial";

// ───────────────── Authors ─────────────────
export const AUTHORS: Author[] = [
  { id: "a-marielle", slug: "marielle-dubois", name: "Marielle Dubois",
    role: "editor", language: "both", neighborhood: "Vanier",
    bio_en: "Editor-in-chief of the Ottawa Civic Ledger. Twenty years covering municipal politics in English and French.",
    bio_fr: "Rédactrice en chef du Registre Civique d'Ottawa. Vingt ans à couvrir la politique municipale en anglais et en français.",
    disclosure: "Owns no shares in any company covered. Donates personally to the Ottawa Food Bank.",
    portrait_src: "newsprint:#3a2a1a" },
  { id: "a-tariq", slug: "tariq-khan", name: "Tariq Khan",
    role: "reporter", language: "en", neighborhood: "Hintonburg",
    bio_en: "City Hall reporter. Previously at the Hill Times.",
    bio_fr: "Reporter à l'hôtel de ville. Auparavant au Hill Times.",
    portrait_src: "newsprint:#1f3a4a" },
  { id: "a-claire", slug: "claire-bouchard", name: "Claire Bouchard",
    role: "columnist", language: "fr", neighborhood: "Orléans",
    bio_en: "Weekly columnist on francophone life in eastern Ottawa.",
    bio_fr: "Chroniqueuse hebdomadaire sur la vie francophone dans l'est d'Ottawa.",
    portrait_src: "newsprint:#4a2a2a" },
  { id: "a-jonah", slug: "jonah-redcrow", name: "Jonah Redcrow",
    role: "columnist", language: "en", neighborhood: "Bayshore",
    bio_en: "Transit and infrastructure columnist. Engineer by training.",
    bio_fr: "Chroniqueur sur le transport en commun et les infrastructures.",
    portrait_src: "newsprint:#2a3a2a" },
  { id: "a-sasha", slug: "sasha-lemire", name: "Sasha Lemire",
    role: "cartoonist", language: "both", neighborhood: "Centretown",
    bio_en: "Editorial cartoonist. Ink and brush since 2009.",
    bio_fr: "Caricaturiste éditoriale. Encre et pinceau depuis 2009.",
    portrait_src: "newsprint:#2a1a2a" },
  { id: "a-omar", slug: "omar-haddad", name: "Omar Haddad",
    role: "photographer", language: "both", neighborhood: "Lowertown",
    bio_en: "Documentary photographer based in Lowertown.",
    bio_fr: "Photographe documentaire établi dans la Basse-Ville.",
    portrait_src: "newsprint:#1a2a3a" },
  { id: "a-priya", slug: "priya-sandhu", name: "Priya Sandhu",
    role: "contributor", language: "en", neighborhood: "Barrhaven",
    bio_en: "Public-interest analyst. Writes about housing data.",
    bio_fr: "Analyste d'intérêt public. Écrit sur les données du logement.",
    portrait_src: "newsprint:#3a2a3a" },
  { id: "a-helene", slug: "helene-cardinal", name: "Hélène Cardinal",
    role: "community-voice", language: "fr", neighborhood: "Cyrville",
    bio_en: "Resident contributor from Cyrville.",
    bio_fr: "Contributrice résidente de Cyrville.",
    portrait_src: "newsprint:#3a3a1a" },
];

export const COLUMNS: ColumnDef[] = [
  { slug: "rue-principale", name_en: "Rue Principale", name_fr: "Rue Principale",
    columnist_id: "a-claire", description_en: "A weekly walk down a francophone street in eastern Ottawa.",
    description_fr: "Une promenade hebdomadaire dans une rue francophone de l'est d'Ottawa.",
    topic_tags: ["francophone", "culture", "neighborhoods"], cadence: "weekly", accent: "#4a2a2a" },
  { slug: "the-grid", name_en: "The Grid", name_fr: "Le Réseau",
    columnist_id: "a-jonah", description_en: "Transit, infrastructure, and the daily commute.",
    description_fr: "Transport en commun, infrastructures et trajets quotidiens.",
    topic_tags: ["transit", "infrastructure"], cadence: "biweekly", accent: "#2a3a2a" },
  { slug: "city-hall-watch", name_en: "City Hall Watch", name_fr: "Surveillance Municipale",
    columnist_id: "a-tariq", description_en: "What Council actually voted on this week — and why it matters.",
    description_fr: "Ce que le Conseil a vraiment voté cette semaine — et pourquoi c'est important.",
    topic_tags: ["politics", "city-hall"], cadence: "weekly", accent: "#1f3a4a" },
];

// ───────────────── Helpers ─────────────────
const bil = (en: string, fr: string) => ({ en, fr });

// ───────────────── Articles ─────────────────
export const INTERVIEWS: InterviewArticle[] = [
  {
    slug: "transit-driver-night-shift", type: "interview", label: "INTERVIEW",
    title: bil("'We see the city no one else sees': eight hours with a night-shift OC Transpo driver",
               "« On voit la ville que personne ne voit » : huit heures avec un chauffeur d'OC Transpo de nuit"),
    dek: bil("A long-form conversation about the route, the riders, and the quiet politics of the late bus.",
             "Une longue conversation sur le trajet, les usagers et la politique discrète de l'autobus de nuit."),
    byline_author_ids: ["a-tariq"], publishedAt: "2026-05-18T22:00:00Z",
    neighborhood: "Hintonburg", language: "both", read_minutes: 14,
    hero: { id: "h1", kind: "image", src: "newsprint:#1f3a4a",
      alt_en: "Editorial portrait placeholder", alt_fr: "Placeholder de portrait éditorial",
      credit: "Ottawa Civic Ledger", rights_status: "ai-generated" },
    person: { name: "Daniel Mercier", role: "OC Transpo night-shift driver, Route 6", neighborhood: "Hintonburg" },
    intro: bil(
      "Daniel Mercier has driven the same Route 6 between 11 p.m. and 7 a.m. for twelve years. We rode his bus on a Tuesday in late April; this conversation is condensed and edited for clarity.",
      "Daniel Mercier conduit la même ligne 6 entre 23 h et 7 h depuis douze ans. Nous avons pris son autobus un mardi de fin avril ; cette conversation a été condensée et révisée."),
    qa: [
      { q: bil("Who rides the bus at 3 a.m.?", "Qui prend l'autobus à 3 h du matin ?"),
        a: bil("Hospital workers. Cleaners. People who finished a shift at a bar and just want to get home safely. And, more than people think, parents going to a 24-hour pharmacy.",
               "Du personnel d'hôpital. Des concierges. Des gens qui finissent leur quart dans un bar. Et plus qu'on ne le pense, des parents qui vont à une pharmacie ouverte 24 h.") },
      { q: bil("What's the hardest part of the shift?", "Quel est le plus difficile dans le quart ?"),
        a: bil("It isn't the hours. It's the silence. You stop being a driver and you become a kind of witness.",
               "Ce ne sont pas les heures. C'est le silence. On cesse d'être chauffeur et on devient une sorte de témoin.") },
      { q: bil("What would you change about how the city plans night service?", "Que changeriez-vous à la planification du service de nuit ?"),
        a: bil("Talk to drivers before you cut a route. Ten minutes with one of us would save a planner three months of complaints.",
               "Parlez aux chauffeurs avant de couper une ligne. Dix minutes avec l'un d'entre nous éviteraient trois mois de plaintes.") },
    ],
    key_quote: bil("You stop being a driver and you become a kind of witness.",
                   "On cesse d'être chauffeur et on devient une sorte de témoin."),
    transcript: bil("Full transcript available on request — email transcripts@ottawacivicledger.ca.",
                    "Transcription complète sur demande — courriel transcripts@ottawacivicledger.ca."),
    audio_placeholder: true,
    body_blocks: [],
    sources: [{ label: "OC Transpo published night-route schedule (Apr 2026)" }],
    donation_cta: true,
  },
];

export const OPINIONS: OpinionArticle[] = [
  {
    slug: "stop-treating-cyclists-as-an-experiment", type: "opinion", label: "OPINION",
    title: bil("Stop treating Ottawa cyclists as a pilot project",
               "Cessez de traiter les cyclistes d'Ottawa comme un projet pilote"),
    dek: bil("Three winters of 'temporary' lanes have produced one permanent outcome: confusion.",
             "Trois hivers de voies « temporaires » ont produit un seul résultat permanent : la confusion."),
    byline_author_ids: ["a-priya"], publishedAt: "2026-05-22T13:00:00Z",
    neighborhood: "Barrhaven", language: "en", read_minutes: 6,
    hero: { id: "h2", kind: "image", src: "newsprint:#7a2a2a",
      alt_en: "Newsprint editorial placeholder", alt_fr: "Placeholder éditorial",
      credit: "Ottawa Civic Ledger", rights_status: "ai-generated" },
    author_disclosure: bil(
      "The author cycles to work three seasons a year and serves on no advocacy board.",
      "L'auteure se rend au travail à vélo trois saisons sur quatre et ne siège à aucun conseil de plaidoyer."),
    body_blocks: [
      bil("There is a particular flavor of municipal cowardice that calls a thing temporary so that no one has to defend it.",
          "Il existe une forme particulière de lâcheté municipale qui qualifie une chose de temporaire pour que personne n'ait à la défendre."),
      bil("Ottawa's cycling network has been in 'pilot' status for so long that an entire generation of riders has never used anything else.",
          "Le réseau cyclable d'Ottawa est en mode « pilote » depuis si longtemps qu'une génération entière de cyclistes n'a connu rien d'autre."),
      bil("Either commit to the lanes, with paint, posts, and snow removal — or remove them and tell people honestly why. The middle path is the dangerous one.",
          "Soit on s'engage sur les voies, avec peinture, bollards et déneigement — soit on les retire et on l'explique. Le chemin du milieu est le plus dangereux."),
    ],
    pull_quote: bil("The middle path is the dangerous one.", "Le chemin du milieu est le plus dangereux."),
  },
];

export const COLUMN_ENTRIES: ColumnEntry[] = [
  {
    slug: "council-week-21", type: "column", label: "COLUMN", column_slug: "city-hall-watch",
    title: bil("Council Week 21: a parking fight, a quiet housing win, and one resignation",
               "Conseil semaine 21 : une bataille de stationnement, une victoire discrète en logement, une démission"),
    dek: bil("Three things from Wednesday's meeting that will matter in a year.",
             "Trois choses de la réunion de mercredi qui compteront dans un an."),
    byline_author_ids: ["a-tariq"], publishedAt: "2026-05-23T09:00:00Z",
    language: "en", read_minutes: 5,
    hero: { id: "h3", kind: "image", src: "newsprint:#1f3a4a",
      alt_en: "Editorial newsprint", alt_fr: "Newsprint éditorial",
      credit: "OCL", rights_status: "ai-generated" },
    body_blocks: [
      bil("Wednesday's session ran four hours. The actual news ran about twelve minutes.",
          "La séance de mercredi a duré quatre heures. La vraie nouvelle a duré environ douze minutes."),
      bil("First, the parking fight: Ward 14 lost on the meter rate change, but won on the enforcement carve-out.",
          "D'abord, la bataille du stationnement : le quartier 14 a perdu sur le tarif, mais a gagné sur l'exemption d'application."),
    ],
  },
  {
    slug: "the-grid-snow-routes", type: "column", label: "COLUMN", column_slug: "the-grid",
    title: bil("The Grid: why your bus route disappears the moment it snows",
               "Le Réseau : pourquoi votre ligne disparaît dès qu'il neige"),
    dek: bil("Snow detours aren't published in real time. Here is what the planning documents actually say.",
             "Les détours de neige ne sont pas publiés en temps réel. Voici ce que disent vraiment les documents."),
    byline_author_ids: ["a-jonah"], publishedAt: "2026-05-19T08:00:00Z",
    language: "en", read_minutes: 7,
    hero: { id: "h4", kind: "image", src: "newsprint:#2a3a2a",
      alt_en: "Newsprint", alt_fr: "Newsprint", credit: "OCL", rights_status: "ai-generated" },
    body_blocks: [
      bil("OC Transpo's winter operations plan is a public document. Almost nobody reads it.",
          "Le plan d'exploitation hivernale d'OC Transpo est un document public. Presque personne ne le lit."),
    ],
  },
];

export const ANALYSES: AnalysisArticle[] = [
  {
    slug: "rent-data-2026", type: "analysis", label: "ANALYSIS",
    title: bil("What CMHC's 2026 numbers actually say about Ottawa rent",
               "Ce que disent vraiment les chiffres 2026 de la SCHL sur le loyer à Ottawa"),
    dek: bil("Read past the press release: the median moved less than the headline suggests, and one ward did the opposite of the others.",
             "Au-delà du communiqué : la médiane a bougé moins que prévu, et un quartier a fait l'inverse des autres."),
    byline_author_ids: ["a-priya"], publishedAt: "2026-05-20T11:00:00Z",
    language: "en", read_minutes: 9,
    hero: { id: "h5", kind: "image", src: "newsprint:#2a2a4a",
      alt_en: "Analysis newsprint", alt_fr: "Newsprint d'analyse", credit: "OCL", rights_status: "ai-generated" },
    key_findings: [
      bil("Median two-bedroom rent rose 3.1% — below the 5.4% the headline implied.",
          "Le loyer médian d'un 4½ a augmenté de 3,1 % — sous les 5,4 % suggérés par le titre."),
      bil("Vacancy in Vanier fell to 1.2%; in Kanata-Stittsville it rose to 4.0%.",
          "Le taux d'inoccupation à Vanier est tombé à 1,2 % ; à Kanata-Stittsville il est monté à 4,0 %."),
      bil("New purpose-built rental starts are concentrated in two wards.",
          "Les mises en chantier de logements locatifs neufs sont concentrées dans deux quartiers."),
    ],
    body_blocks: [
      bil("The summary line in the CMHC release said rent rose 5.4%. That figure is correct, and also misleading.",
          "La phrase de résumé du communiqué de la SCHL indique une hausse de 5,4 %. Ce chiffre est exact, et trompeur."),
    ],
    sources: [{ label: "CMHC Rental Market Report — Ottawa CMA (2026)" }],
  },
];

export const ESSAYS: EssayArticle[] = [
  {
    slug: "river-people", type: "essay", label: "ESSAY",
    title: bil("River people: a personal history of the Ottawa shoreline",
               "Les gens de la rivière : une histoire personnelle du rivage d'Ottawa"),
    dek: bil("On growing up between two provinces, one river, and a slow argument about who owns the bank.",
             "Sur le fait de grandir entre deux provinces, une rivière, et une longue discussion sur qui possède la rive."),
    byline_author_ids: ["a-marielle"], publishedAt: "2026-05-12T16:00:00Z",
    language: "both", read_minutes: 18,
    hero: { id: "h6", kind: "image", src: "newsprint:#1a3a4a",
      alt_en: "River newsprint", alt_fr: "Newsprint rivière", credit: "OCL", rights_status: "ai-generated" },
    body_blocks: [
      bil("My grandmother believed that any city built between two provinces would always be a translation of itself.",
          "Ma grand-mère croyait qu'une ville construite entre deux provinces serait toujours une traduction d'elle-même."),
    ],
    pull_quote: bil("A city built between two provinces is always a translation of itself.",
                    "Une ville bâtie entre deux provinces est toujours une traduction d'elle-même."),
  },
];

export const CARTOONS: CartoonArticle[] = [
  {
    slug: "snow-route-bingo-may", type: "cartoon", label: "CARTOON",
    title: bil("Snow Route Bingo", "Bingo des routes déneigées"),
    dek: bil("This week's cartoon, by Sasha Lemire.", "Caricature de la semaine, par Sasha Lemire."),
    byline_author_ids: ["a-sasha"], publishedAt: "2026-05-24T07:00:00Z",
    language: "both", artist_id: "a-sasha",
    image: { id: "c1", kind: "image", src: "newsprint:#2a1a2a",
      alt_en: "A bingo card titled SNOW ROUTE BINGO with squares like 'plow appeared once' and 'bus rerouted without notice'.",
      alt_fr: "Une carte de bingo intitulée BINGO DES ROUTES DÉNEIGÉES avec des cases comme « charrue vue une fois » et « autobus dévié sans préavis ».",
      credit: "Sasha Lemire", rights_status: "owner-confirmed" },
    caption: bil("Mark every square that happened on your street this winter.",
                 "Cochez chaque case survenue sur votre rue cet hiver."),
    alt_text: bil(
      "Editorial cartoon: a hand-drawn bingo card. Squares include 'plow appeared once', 'bus rerouted without notice', 'sidewalk uncleared three days', 'salt truck at 4 a.m.', and 'councillor blames the province'.",
      "Caricature : une carte de bingo dessinée à la main avec des cases comme « charrue vue une fois », « autobus dévié sans préavis », « trottoir non déneigé trois jours », « épandeuse à 4 h », et « le conseiller blâme la province »."),
    body_blocks: [],
  },
];

export const SATIRE: SatireArticle[] = [
  {
    slug: "council-invents-new-committee", type: "satire", label: "SATIRE",
    title: bil("Council invents new committee to study why so many committees exist",
               "Le Conseil crée un nouveau comité pour étudier pourquoi tant de comités existent"),
    dek: bil("The Standing Committee on Standing Committees will report back in 18 months.",
             "Le Comité permanent sur les comités permanents fera rapport dans 18 mois."),
    byline_author_ids: ["a-marielle"], publishedAt: "2026-05-21T15:00:00Z",
    language: "both",
    hero: { id: "s1", kind: "image", src: "newsprint:#3a3a1a",
      alt_en: "Satire newsprint", alt_fr: "Newsprint satirique", credit: "OCL", rights_status: "ai-generated" },
    content_warnings: [],
    body_blocks: [
      bil("THIS IS SATIRE. In a unanimous vote held simultaneously in three rooms, Council established a new committee.",
          "CECI EST UNE SATIRE. Lors d'un vote unanime tenu simultanément dans trois salles, le Conseil a créé un nouveau comité."),
    ],
  },
];

export const PHOTO_ESSAYS: PhotoEssayArticle[] = [
  {
    slug: "lowertown-saturdays", type: "photo-essay", label: "PHOTO ESSAY",
    title: bil("Lowertown Saturdays", "Les samedis de la Basse-Ville"),
    dek: bil("Eight images from one block, one morning.", "Huit images d'un pâté de maisons, un matin."),
    byline_author_ids: ["a-omar"], photographer_id: "a-omar",
    publishedAt: "2026-05-15T10:00:00Z", language: "both", neighborhood: "Lowertown",
    hero: { id: "p0", kind: "image", src: "newsprint:#1a2a3a",
      alt_en: "Cover photo placeholder of Lowertown street.", alt_fr: "Photo de couverture de la rue de la Basse-Ville.",
      credit: "Omar Haddad", rights_status: "owner-confirmed", consent_status: "owner-confirmed" },
    photos: [
      { id: "p1", kind: "image", src: "newsprint:#1a2a3a", alt_en: "Market vendor at dawn.", alt_fr: "Marchande à l'aube.",
        credit: "Omar Haddad", rights_status: "owner-confirmed", consent_status: "owner-confirmed",
        caption_en: "The first vendor sets up before sunrise.", caption_fr: "Le premier marchand s'installe avant le lever du soleil." },
      { id: "p2", kind: "image", src: "newsprint:#2a1a3a", alt_en: "A child crosses the empty street.", alt_fr: "Un enfant traverse la rue vide.",
        credit: "Omar Haddad", rights_status: "owner-confirmed", consent_status: "owner-confirmed",
        caption_en: "Identifying features intentionally obscured.", caption_fr: "Traits identifiants volontairement flous." },
      { id: "p3", kind: "image", src: "newsprint:#3a2a1a", alt_en: "Steam rises from a bakery vent.", alt_fr: "Vapeur d'un évent de boulangerie.",
        credit: "Omar Haddad", rights_status: "owner-confirmed", caption_en: "Bread on Murray Street.", caption_fr: "Pain rue Murray." },
    ],
    body_blocks: [],
  },
];

export const INVESTIGATIONS: InvestigationArticle[] = [
  {
    slug: "the-snow-contract", type: "investigation", label: "INVESTIGATION",
    title: bil("The snow contract: how one clause rewrote eight winters",
               "Le contrat de neige : comment une clause a réécrit huit hivers"),
    dek: bil("A six-month investigation into the procurement language that quietly transferred risk from contractors to residents.",
             "Une enquête de six mois sur le libellé contractuel qui a discrètement transféré le risque des contractants aux résidents."),
    byline_author_ids: ["a-tariq", "a-marielle"], publishedAt: "2026-04-30T06:00:00Z",
    language: "both", read_minutes: 32, donation_cta: true,
    hero: { id: "i1", kind: "image", src: "newsprint:#1a1a3a",
      alt_en: "Investigation cover.", alt_fr: "Couverture d'enquête.", credit: "OCL", rights_status: "ai-generated" },
    methodology: bil(
      "We reviewed every snow-clearing procurement issued by the City since 2018, interviewed seven current and former operations staff on background, and filed two access requests. Numerical claims are sourced in the documents grid below.",
      "Nous avons examiné chaque appel d'offres de déneigement depuis 2018, mené sept entretiens en arrière-plan, et déposé deux demandes d'accès. Les chiffres sont sourcés dans la grille de documents ci-dessous."),
    documents: [
      { label: "City of Ottawa snow procurement contract (2018, redacted)" },
      { label: "Access-to-information response packet (2025-AT-0931)" },
    ],
    chapters: [
      { id: "ch1", title: bil("One clause, eight winters", "Une clause, huit hivers"),
        body_blocks: [
          bil("The clause is on page 47. It does one thing: it shifts the cost of an unexpected snowfall above 15 cm from the contractor to the City — without a corresponding rate change.",
              "La clause est à la page 47. Elle fait une seule chose : elle transfère le coût d'une chute imprévue de plus de 15 cm du contractant à la Ville — sans révision tarifaire."),
        ] },
      { id: "ch2", title: bil("Who signed", "Qui a signé"),
        body_blocks: [
          bil("Three signatures appear on the final document. Two of those people no longer work for the City.",
              "Trois signatures figurent sur le document final. Deux de ces personnes ne travaillent plus pour la Ville."),
        ] },
      { id: "ch3", title: bil("What it cost", "Ce que ça a coûté"),
        body_blocks: [
          bil("Over eight winters, the differential adds up to an estimated $14.7M in shifted cost. We show our work in the methodology box.",
              "Sur huit hivers, l'écart représente environ 14,7 M$ de coût transféré. Le calcul est dans la méthodologie."),
        ] },
    ],
    body_blocks: [],
    sources: [{ label: "City of Ottawa procurement records, 2018-2025" }],
  },
];

export const EXPLAINERS: ExplainerArticle[] = [
  {
    slug: "what-is-a-ward", type: "explainer", label: "EXPLAINER",
    title: bil("What is a ward, and why does yours matter more than you think?",
               "Qu'est-ce qu'un quartier municipal, et pourquoi le vôtre compte plus que vous ne le pensez ?"),
    dek: bil("A short guide to the smallest unit of Ottawa government.",
             "Un petit guide de la plus petite unité du gouvernement d'Ottawa."),
    byline_author_ids: ["a-marielle"], publishedAt: "2026-05-10T08:00:00Z",
    language: "both", read_minutes: 4,
    hero: { id: "e1", kind: "image", src: "newsprint:#2a3a3a",
      alt_en: "Explainer newsprint", alt_fr: "Newsprint d'explication", credit: "OCL", rights_status: "ai-generated" },
    questions: [
      { q: bil("How many wards does Ottawa have?", "Combien de quartiers compte Ottawa ?"),
        a: bil("Twenty-four, since the 2022 redistribution.", "Vingt-quatre, depuis le redécoupage de 2022.") },
      { q: bil("Who represents mine?", "Qui représente le mien ?"),
        a: bil("One councillor, elected for a four-year term. Find yours by postal code at ottawa.ca.",
               "Un conseiller, élu pour quatre ans. Trouvez le vôtre par code postal sur ottawa.ca.") },
      { q: bil("What can a ward councillor actually do?", "Que peut vraiment faire un conseiller de quartier ?"),
        a: bil("Vote on the budget, set zoning, approve local capital projects, and chair committees.",
               "Voter le budget, fixer le zonage, approuver les projets d'immobilisations locaux et présider des comités.") },
    ],
    glossary: [
      { term: bil("Ward", "Quartier"), def: bil("A geographic electoral division.", "Une division électorale géographique.") },
    ],
    body_blocks: [],
  },
];

export const SOLUTION_ARTICLES: SolutionArticle[] = [
  {
    slug: "vienna-rent-applied", type: "solution", label: "SOLUTIONS",
    title: bil("What Vienna got right about social housing — and what would translate to Ottawa",
               "Ce que Vienne a réussi en logement social — et ce qui s'appliquerait à Ottawa"),
    dek: bil("Vienna houses 60% of its residents in city-managed buildings. The lessons are smaller, and more useful, than the headline.",
             "Vienne loge 60 % de ses résidents dans des immeubles municipaux. Les leçons sont plus modestes — et plus utiles — que le titre."),
    byline_author_ids: ["a-priya"], publishedAt: "2026-05-08T09:00:00Z",
    language: "both", read_minutes: 11,
    hero: { id: "sl1", kind: "image", src: "newsprint:#2a3a2a",
      alt_en: "Solutions newsprint", alt_fr: "Newsprint solutions", credit: "OCL", rights_status: "ai-generated" },
    problem: bil("Ottawa's affordable housing waitlist passed 13,000 households in 2025.",
                 "La liste d'attente pour le logement abordable à Ottawa a dépassé 13 000 ménages en 2025."),
    evidence: [
      bil("Vienna treats housing as infrastructure: financed across decades, indexed to wages, not markets.",
          "Vienne traite le logement comme une infrastructure : financée sur des décennies, indexée aux salaires, pas aux marchés."),
      bil("Mixed-income buildings reduce concentrated poverty without raising overall costs.",
          "Les immeubles à revenus mixtes réduisent la pauvreté concentrée sans hausser les coûts."),
    ],
    local_application: bil(
      "Three pieces of Vienna's model are legally and financially possible in Ottawa today: long-tenor municipal bonds for housing, a public land bank, and mixed-income mandates on rezoning.",
      "Trois éléments du modèle viennois sont juridiquement et financièrement possibles à Ottawa aujourd'hui : des obligations municipales à long terme, une banque foncière publique et des exigences de mixité sur les rezonages."),
    body_blocks: [],
  },
];

export const OP_DOCS: OpDocArticle[] = [
  {
    slug: "the-river-belongs-to-no-one", type: "op-doc", label: "OP-DOC",
    title: bil("The river belongs to no one (coming soon)",
               "La rivière n'appartient à personne (à venir)"),
    dek: bil("A short documentary on shared shoreline governance, in production for Fall 2026.",
             "Court documentaire sur la gouvernance partagée du rivage, en production pour l'automne 2026."),
    byline_author_ids: ["a-omar", "a-marielle"], publishedAt: "2026-05-01T12:00:00Z",
    language: "both", status: "coming-soon",
    thumbnail: { id: "od1", kind: "image", src: "newsprint:#1a2a3a",
      alt_en: "Op-Doc placeholder.", alt_fr: "Placeholder op-doc.", credit: "OCL", rights_status: "ai-generated" },
    transcript: bil("Transcript will be published with the film.", "La transcription sera publiée avec le film."),
    credits: bil("Direction: Omar Haddad. Producer: Marielle Dubois.", "Réalisation : Omar Haddad. Productrice : Marielle Dubois."),
    body_blocks: [],
  },
];

export const COMMUNITY_VOICES: CommunityVoiceArticle[] = [
  {
    slug: "cyrville-after-the-flood", type: "community-voice", label: "COMMUNITY VOICE",
    title: bil("Cyrville, after the flood: what we built without waiting for the City",
               "Cyrville après l'inondation : ce que nous avons bâti sans attendre la Ville"),
    dek: bil("A resident's account of the neighborhood mutual aid that filled in for two weeks.",
             "Le récit d'une résidente sur l'entraide qui a pris le relais durant deux semaines."),
    byline_author_ids: ["a-helene"], publishedAt: "2026-05-04T17:00:00Z",
    language: "fr", neighborhood: "Cyrville", read_minutes: 6,
    hero: { id: "cv1", kind: "image", src: "newsprint:#3a3a1a",
      alt_en: "Community voice newsprint.", alt_fr: "Newsprint voix communautaire.", credit: "OCL", rights_status: "ai-generated" },
    body_blocks: [
      bil("This piece is in the writer's words; we have edited only for length and clarity.",
          "Ce texte est dans les mots de l'auteure ; nous n'avons révisé que pour la longueur et la clarté."),
      bil("When the water came up over Ogilvie, our first call wasn't 311. It was a WhatsApp group of eleven neighbours.",
          "Quand l'eau a monté sur Ogilvie, notre premier appel n'a pas été au 311. C'était un groupe WhatsApp de onze voisins."),
    ],
  },
];

// Letters — start with a handful of approved + one pending
export const LETTERS: LetterArticle[] = [
  {
    slug: "letter-bus-shelters", type: "letter", label: "LETTER",
    title: bil("A bus shelter is not a luxury", "Un abribus n'est pas un luxe"),
    dek: bil("Re: 'Council Week 21' (May 23).", "Re : « Conseil semaine 21 » (23 mai)."),
    byline_author_ids: [], publishedAt: "2026-05-25T12:00:00Z",
    language: "en", writer_display_name: "R. Tremblay", anonymous: false,
    topic: "transit", moderation_status: "approved",
    body: bil(
      "My mother is 78. She waits for the 88 in a wind tunnel because there is no shelter at Hurdman north platform. A bus shelter is infrastructure, not amenity.",
      "Ma mère a 78 ans. Elle attend le 88 dans un couloir de vent parce qu'il n'y a pas d'abribus à la plate-forme nord de Hurdman."),
    editor_response: bil("Thank you for writing. We have asked the Ward 12 councillor for comment.",
                         "Merci d'avoir écrit. Nous avons demandé un commentaire à la conseillère du quartier 12."),
    body_blocks: [],
  },
  {
    slug: "letter-french-services", type: "letter", label: "LETTER",
    title: bil("French at City Hall — still a request, not a right",
               "Le français à l'hôtel de ville — toujours une demande, jamais un droit"),
    dek: bil("Re: 'Rent data 2026' (May 20).", "Re : « Données loyer 2026 » (20 mai)."),
    byline_author_ids: [], publishedAt: "2026-05-24T16:00:00Z",
    language: "fr", writer_display_name: "Anonymous", anonymous: true,
    topic: "language-rights", moderation_status: "approved",
    body: bil(
      "I asked for the rent report in French and was told it would arrive 'next week.' That was three weeks ago.",
      "J'ai demandé le rapport sur le loyer en français. On m'a répondu « la semaine prochaine ». C'était il y a trois semaines."),
    body_blocks: [],
  },
];

// ───────────────── Index ─────────────────
const ALL: AnyEditorial[] = [
  ...INTERVIEWS, ...OPINIONS, ...COLUMN_ENTRIES, ...ANALYSES, ...ESSAYS,
  ...CARTOONS, ...SATIRE, ...PHOTO_ESSAYS, ...INVESTIGATIONS, ...EXPLAINERS,
  ...SOLUTION_ARTICLES, ...OP_DOCS, ...COMMUNITY_VOICES, ...LETTERS,
];

export function listByType<T extends EditorialType>(type: T): AnyEditorial[] {
  return ALL.filter(a => a.type === type)
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}
export function getArticle(type: EditorialType, slug: string): AnyEditorial | undefined {
  return ALL.find(a => a.type === type && a.slug === slug);
}
export function getAuthor(id: string): Author | undefined {
  return AUTHORS.find(a => a.id === id || a.slug === id);
}
export function getColumn(slug: string): ColumnDef | undefined {
  return COLUMNS.find(c => c.slug === slug);
}
export function articlesByAuthor(authorId: string): AnyEditorial[] {
  return ALL.filter(a => a.byline_author_ids.includes(authorId));
}
export function listColumns(): ColumnDef[] { return COLUMNS; }
export function entriesForColumn(slug: string): ColumnEntry[] {
  return COLUMN_ENTRIES.filter(e => e.column_slug === slug);
}
export function listAuthors(): Author[] { return AUTHORS; }
export function approvedLetters(): LetterArticle[] {
  return LETTERS.filter(l => l.moderation_status === "approved");
}
export function allEditorial(): AnyEditorial[] { return ALL; }
