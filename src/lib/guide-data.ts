import type { Bilingual, Neighborhood } from "./data";

const img = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

// ============ ACTIVITIES ============
export type ActivityAudience = "kids" | "family" | "teens" | "adults" | "all-ages";
export type ActivityCategory =
  | "museum" | "library" | "park" | "festival" | "community-centre"
  | "sport" | "workshop" | "school-break" | "free-event" | "food-family"
  | "indoor-winter" | "outdoor-summer" | "art" | "nature";

export type Activity = {
  id: string;
  title: Bilingual;
  blurb: Bilingual;
  category: ActivityCategory;
  audience: ActivityAudience[];
  neighborhood: Neighborhood | "Gatineau" | "Greenbelt" | "Citywide";
  cost: "free" | "under-20" | "20-50" | "50+";
  when: Bilingual;
  indoor: boolean;
  accessible: boolean;
  frenchFriendly: boolean;
  transitFriendly: boolean;
  todayOpen: boolean;
  weekend: boolean;
  image: string;
  source: "editor" | "citizen" | "city";
  updatedMinutesAgo: number;
  url?: string;
};

export const ACTIVITIES: Activity[] = [
  { id: "a1", title: { en: "Canadian Museum of Nature — Dinosaur Hall", fr: "Musée canadien de la nature — Salle des dinosaures" },
    blurb: { en: "Free admission Thursday evenings; kids 3+ love the T-Rex skull.", fr: "Entrée libre jeudi soir; les enfants adorent le crâne du T-Rex." },
    category: "museum", audience: ["kids", "family", "all-ages"], neighborhood: "Centretown",
    cost: "free", when: { en: "Thu 17:00–20:00", fr: "Jeu 17h–20h" },
    indoor: true, accessible: true, frenchFriendly: true, transitFriendly: true, todayOpen: true, weekend: true,
    image: img("1564399579883-451a5d44ec08"), source: "editor", updatedMinutesAgo: 12 },
  { id: "a2", title: { en: "Ottawa Public Library — Story time (bilingual)", fr: "Bibliothèque publique d'Ottawa — Heure du conte (bilingue)" },
    blurb: { en: "Drop-in bilingual story time for ages 2–6 at 10 branches.", fr: "Heure du conte bilingue sans inscription, 2–6 ans, 10 succursales." },
    category: "library", audience: ["kids", "family"], neighborhood: "Citywide",
    cost: "free", when: { en: "Sat 10:30", fr: "Sam 10h30" },
    indoor: true, accessible: true, frenchFriendly: true, transitFriendly: true, todayOpen: false, weekend: true,
    image: img("1521587760476-6c12a4b040da"), source: "city", updatedMinutesAgo: 45 },
  { id: "a3", title: { en: "Mer Bleue Bog Boardwalk", fr: "Promenade de la tourbière Mer Bleue" },
    blurb: { en: "1.2 km flat boardwalk through a rare boreal bog — stroller friendly.", fr: "Promenade plate de 1,2 km dans une tourbière boréale — poussette OK." },
    category: "nature", audience: ["family", "all-ages"], neighborhood: "Greenbelt",
    cost: "free", when: { en: "Sunrise–sunset", fr: "Du lever au coucher" },
    indoor: false, accessible: true, frenchFriendly: true, transitFriendly: false, todayOpen: true, weekend: true,
    image: img("1500382017468-9049fed747ef"), source: "editor", updatedMinutesAgo: 60 },
  { id: "a4", title: { en: "Britannia Beach swim & splash pad", fr: "Plage Britannia : baignade et pataugeoire" },
    blurb: { en: "Lifeguarded swim area, splash pad, free parking until 11am.", fr: "Baignade surveillée, jeux d'eau, stationnement libre jusqu'à 11 h." },
    category: "outdoor-summer", audience: ["kids", "family"], neighborhood: "Westboro",
    cost: "free", when: { en: "Daily 10–20", fr: "Tous les jours 10–20h" },
    indoor: false, accessible: true, frenchFriendly: false, transitFriendly: true, todayOpen: true, weekend: true,
    image: img("1507525428034-b723cf961d3e"), source: "editor", updatedMinutesAgo: 18 },
  { id: "a5", title: { en: "Plant Pool indoor swim (winter)", fr: "Piscine intérieure Plant (hiver)" },
    blurb: { en: "City pool with family swims, slide, and accessible lift.", fr: "Piscine municipale, baignades familiales, glissoire, lève-personne." },
    category: "indoor-winter", audience: ["kids", "family"], neighborhood: "Little Italy",
    cost: "under-20", when: { en: "Family swim Sat 13–15", fr: "Bain familial sam 13–15h" },
    indoor: true, accessible: true, frenchFriendly: true, transitFriendly: true, todayOpen: true, weekend: true,
    image: img("1530549387789-4c1017266635"), source: "city", updatedMinutesAgo: 90 },
  { id: "a6", title: { en: "Tulip Festival — Dow's Lake", fr: "Festival des tulipes — Lac Dow" },
    blurb: { en: "Free outdoor displays; arrive before 10am to avoid crowds.", fr: "Expositions extérieures gratuites; venez avant 10 h pour éviter la foule." },
    category: "festival", audience: ["family", "all-ages"], neighborhood: "Citywide",
    cost: "free", when: { en: "All weekend", fr: "Tout le week-end" },
    indoor: false, accessible: true, frenchFriendly: true, transitFriendly: true, todayOpen: true, weekend: true,
    image: img("1490750967868-88aa4486c946"), source: "editor", updatedMinutesAgo: 22 },
  { id: "a7", title: { en: "Diefenbunker Cold War Museum (teens)", fr: "Musée Diefenbunker (ados)" },
    blurb: { en: "Underground bunker tour; great for curious 10+. Cool year-round.", fr: "Visite d'un bunker souterrain; super pour 10 ans+. Frais toute l'année." },
    category: "museum", audience: ["teens", "family"], neighborhood: "Citywide",
    cost: "20-50", when: { en: "Tue–Sun", fr: "Mar–Dim" },
    indoor: true, accessible: false, frenchFriendly: true, transitFriendly: false, todayOpen: false, weekend: true,
    image: img("1518709268805-4e9042af2176"), source: "editor", updatedMinutesAgo: 200 },
  { id: "a8", title: { en: "Hintonburg Community Centre — teen drop-in", fr: "Centre communautaire Hintonburg — accueil ados" },
    blurb: { en: "Free gym, games, music room for ages 12–17. No registration.", fr: "Gym, jeux, salle de musique gratuits, 12–17 ans. Sans inscription." },
    category: "community-centre", audience: ["teens"], neighborhood: "Hintonburg",
    cost: "free", when: { en: "Fri 18–21", fr: "Ven 18–21h" },
    indoor: true, accessible: true, frenchFriendly: false, transitFriendly: true, todayOpen: false, weekend: true,
    image: img("1571260899304-425eee4c7efc"), source: "city", updatedMinutesAgo: 30 },
  { id: "a9", title: { en: "Rideau Canal Skateway (winter)", fr: "Patinoire du canal Rideau (hiver)" },
    blurb: { en: "7.8 km natural ice. Free skate loan stations at Dow's Lake.", fr: "7,8 km de glace naturelle. Prêt de patins gratuit au lac Dow." },
    category: "indoor-winter", audience: ["family", "all-ages"], neighborhood: "Glebe",
    cost: "free", when: { en: "Jan–Feb", fr: "Jan–Fév" },
    indoor: false, accessible: true, frenchFriendly: true, transitFriendly: true, todayOpen: false, weekend: true,
    image: img("1418985991508-e47386d96a71"), source: "editor", updatedMinutesAgo: 240 },
  { id: "a10", title: { en: "Make-a-Robot workshop (ages 8–14)", fr: "Atelier de robotique (8–14 ans)" },
    blurb: { en: "Hands-on intro to circuits and code; bilingual instructors.", fr: "Initiation pratique aux circuits et au code; animateurs bilingues." },
    category: "workshop", audience: ["kids", "teens"], neighborhood: "Kanata",
    cost: "20-50", when: { en: "Sat 13–15", fr: "Sam 13–15h" },
    indoor: true, accessible: true, frenchFriendly: true, transitFriendly: false, todayOpen: false, weekend: true,
    image: img("1581091215367-9b6c00b3039f"), source: "editor", updatedMinutesAgo: 75 },
  { id: "a11", title: { en: "Andrew Haydon Park — picnic & ducks", fr: "Parc Andrew-Haydon — pique-nique et canards" },
    blurb: { en: "Riverside lawns, ponds, playgrounds. Free parking, BBQ pits.", fr: "Pelouses au bord du fleuve, étangs, jeux. Stationnement libre, BBQ." },
    category: "park", audience: ["family", "kids"], neighborhood: "Nepean",
    cost: "free", when: { en: "Daily", fr: "Tous les jours" },
    indoor: false, accessible: true, frenchFriendly: true, transitFriendly: false, todayOpen: true, weekend: true,
    image: img("1500534314209-a25ddb2bd429"), source: "editor", updatedMinutesAgo: 15 },
  { id: "a12", title: { en: "Gatineau Park — Pink Lake easy loop", fr: "Parc de la Gatineau — boucle facile du lac Pink" },
    blurb: { en: "2.5 km wooded loop, lookouts, suitable for ages 6+.", fr: "Boucle boisée de 2,5 km, points de vue, 6 ans et plus." },
    category: "nature", audience: ["family", "teens", "all-ages"], neighborhood: "Gatineau",
    cost: "free", when: { en: "Daylight", fr: "Heures de clarté" },
    indoor: false, accessible: false, frenchFriendly: true, transitFriendly: false, todayOpen: true, weekend: true,
    image: img("1441974231531-c6227db76b6e"), source: "editor", updatedMinutesAgo: 50 },
  { id: "a13", title: { en: "ByWard Market street performers (weekends)", fr: "Animateurs de rue, Marché By (week-ends)" },
    blurb: { en: "Free outdoor music and magic from noon to 5pm.", fr: "Musique et magie en plein air, gratuit, midi à 17 h." },
    category: "free-event", audience: ["family", "all-ages"], neighborhood: "ByWard Market",
    cost: "free", when: { en: "Sat–Sun 12–17", fr: "Sam–Dim 12–17h" },
    indoor: false, accessible: true, frenchFriendly: true, transitFriendly: true, todayOpen: false, weekend: true,
    image: img("1485827404703-89b55fcc595e"), source: "citizen", updatedMinutesAgo: 8 },
  { id: "a14", title: { en: "Family pancake brunch — Glebe café", fr: "Brunch crêpes en famille — café du Glebe" },
    blurb: { en: "High chairs, baby change, $9 kids menu. Bilingual staff.", fr: "Chaises hautes, table à langer, menu enfant 9 $. Personnel bilingue." },
    category: "food-family", audience: ["family", "kids"], neighborhood: "Glebe",
    cost: "under-20", when: { en: "Sat–Sun 8–14", fr: "Sam–Dim 8–14h" },
    indoor: true, accessible: true, frenchFriendly: true, transitFriendly: true, todayOpen: false, weekend: true,
    image: img("1551782450-a2132b4ba21d"), source: "editor", updatedMinutesAgo: 33 },
  { id: "a15", title: { en: "Skate the Aberdeen Pavilion (school break)", fr: "Patiner au pavillon Aberdeen (relâche)" },
    blurb: { en: "Indoor rink, $4 per child during March break. Skate rental on site.", fr: "Patinoire intérieure, 4 $ par enfant à la relâche. Location sur place." },
    category: "school-break", audience: ["kids", "family"], neighborhood: "Glebe",
    cost: "under-20", when: { en: "Mar break, 10–17", fr: "Relâche, 10–17h" },
    indoor: true, accessible: true, frenchFriendly: true, transitFriendly: true, todayOpen: false, weekend: false,
    image: img("1551698618-1dfe5d97d256"), source: "city", updatedMinutesAgo: 120 },
  { id: "a16", title: { en: "Rowan House youth open mic", fr: "Micro ouvert jeunesse, Rowan House" },
    blurb: { en: "Ages 14–22. Spoken word, music, comedy. Mentors on site.", fr: "14–22 ans. Slam, musique, humour. Mentors présents." },
    category: "art", audience: ["teens"], neighborhood: "Sandy Hill",
    cost: "free", when: { en: "Last Fri of month, 19:00", fr: "Dernier ven du mois, 19 h" },
    indoor: true, accessible: true, frenchFriendly: true, transitFriendly: true, todayOpen: false, weekend: false,
    image: img("1493225457124-a3eb161ffa5f"), source: "citizen", updatedMinutesAgo: 25 },
];

// ============ DEALS ============
export type DealRetailer =
  | "Costco" | "Walmart" | "Canadian Tire" | "IKEA" | "Food Basics" | "Farm Boy"
  | "Loblaws" | "Metro" | "No Frills" | "Real Canadian Superstore"
  | "Winners" | "Old Navy" | "Best Buy" | "Indigo" | "Bayshore Mall" | "Rideau Centre";

export type DealCategory =
  | "grocery" | "home" | "kids" | "clothing" | "electronics" | "back-to-school" | "household" | "family";

export type Deal = {
  id: string;
  retailer: DealRetailer;
  title: Bilingual;
  category: DealCategory;
  was?: string;
  now: string;
  savings?: string;
  expires: string;
  location: "ottawa" | "canada" | "online";
  store?: string;
  verifiedMinutesAgo: number;
  underTen: boolean;
  image: string;
  source: "editor" | "citizen" | "flyer";
  notes?: Bilingual;
};

export const DEALS: Deal[] = [
  { id: "d1", retailer: "Costco", title: { en: "Kirkland diapers size 4 — 192 ct", fr: "Couches Kirkland taille 4 — 192 un." },
    category: "kids", was: "$59.99", now: "$44.99", savings: "$15", expires: "2026-06-02",
    location: "canada", store: "Ottawa West Gloucester", verifiedMinutesAgo: 22, underTen: false,
    image: img("1607457561901-e6ec3a6d16cf"), source: "editor",
    notes: { en: "Members only. In-warehouse coupon.", fr: "Membres seulement. Coupon en magasin." } },
  { id: "d2", retailer: "Walmart", title: { en: "George kids' tees, 3-pack", fr: "T-shirts enfants George, paquet de 3" },
    category: "clothing", was: "$14", now: "$8", savings: "43%", expires: "2026-05-31",
    location: "canada", verifiedMinutesAgo: 8, underTen: true,
    image: img("1503944583220-79d8926ad5e2"), source: "citizen" },
  { id: "d3", retailer: "Canadian Tire", title: { en: "Camping chair clearance", fr: "Liquidation chaises de camping" },
    category: "home", was: "$39.99", now: "$19.99", savings: "50%", expires: "2026-05-27",
    location: "canada", store: "Hunt Club / Merivale", verifiedMinutesAgo: 45, underTen: false,
    image: img("1504280390367-361c6d9f38f4"), source: "flyer" },
  { id: "d4", retailer: "IKEA", title: { en: "LACK side table — yellow", fr: "Table d'appoint LACK — jaune" },
    category: "home", was: "$24.99", now: "$9.99", savings: "60%", expires: "2026-06-10",
    location: "canada", store: "Pinecrest Rd", verifiedMinutesAgo: 65, underTen: true,
    image: img("1555041469-a586c61ea9bc"), source: "editor" },
  { id: "d5", retailer: "Food Basics", title: { en: "Strawberries 1 lb — Ontario", fr: "Fraises 1 lb — Ontario" },
    category: "grocery", was: "$5.99", now: "$2.99", savings: "$3", expires: "2026-05-26",
    location: "ottawa", store: "Various Ottawa", verifiedMinutesAgo: 12, underTen: true,
    image: img("1464965911861-746a04b4bca6"), source: "flyer" },
  { id: "d6", retailer: "Farm Boy", title: { en: "Whole rotisserie chicken", fr: "Poulet rôti entier" },
    category: "grocery", was: "$13", now: "$9.99", savings: "$3", expires: "2026-05-25",
    location: "ottawa", store: "Bank St / Westboro", verifiedMinutesAgo: 6, underTen: true,
    image: img("1604908176997-125f25cc6f3d"), source: "editor" },
  { id: "d7", retailer: "Loblaws", title: { en: "Olive oil 1L — President's Choice", fr: "Huile d'olive 1 L — Choix du Président" },
    category: "grocery", was: "$15", now: "$8.99", savings: "$6", expires: "2026-05-28",
    location: "canada", verifiedMinutesAgo: 90, underTen: true,
    image: img("1474979266404-7eaacbcd87c5"), source: "flyer" },
  { id: "d8", retailer: "Best Buy", title: { en: "Chromebook 14\" for students", fr: "Chromebook 14 po pour étudiants" },
    category: "back-to-school", was: "$449", now: "$329", savings: "$120", expires: "2026-09-02",
    location: "online", verifiedMinutesAgo: 180, underTen: false,
    image: img("1496181133206-80ce9b88a853"), source: "editor",
    notes: { en: "Better deal? Tap below to report.", fr: "Meilleur prix ? Signalez-le ci-dessous." } },
  { id: "d9", retailer: "Winners", title: { en: "Kids' rain boots (assorted)", fr: "Bottes de pluie enfants (assorties)" },
    category: "kids", was: "$30", now: "$12", expires: "2026-06-15",
    location: "ottawa", store: "St. Laurent / Bayshore", verifiedMinutesAgo: 50, underTen: false,
    image: img("1551107696-a4b0c5a0d9a2"), source: "citizen" },
  { id: "d10", retailer: "Real Canadian Superstore", title: { en: "PC frozen berries 1.5 kg", fr: "Petits fruits surgelés CP 1,5 kg" },
    category: "grocery", was: "$13", now: "$7.97", expires: "2026-05-27",
    location: "canada", verifiedMinutesAgo: 33, underTen: true,
    image: img("1497034825429-c343d7c6a68f"), source: "flyer" },
  { id: "d11", retailer: "Old Navy", title: { en: "Back-to-school jeans, kids", fr: "Jeans rentrée scolaire, enfants" },
    category: "back-to-school", was: "$30", now: "$15", expires: "2026-08-31",
    location: "canada", verifiedMinutesAgo: 240, underTen: false,
    image: img("1542272604-787c3835535d"), source: "editor" },
  { id: "d12", retailer: "Rideau Centre", title: { en: "Family weekend mall passport — free crafts", fr: "Passeport familial du week-end — bricolage gratuit" },
    category: "family", now: "Free", expires: "2026-06-08",
    location: "ottawa", store: "Rideau Centre", verifiedMinutesAgo: 14, underTen: true,
    image: img("1483985988355-763728e1935b"), source: "editor" },
];

// ============ KIDS & FAMILY / YOUTH PICKS ============
export type Pick = {
  id: string;
  title: Bilingual;
  blurb: Bilingual;
  category: Bilingual;
  cost: "free" | "under-20" | "20-50";
  neighborhood?: string;
  image: string;
};

export const KIDS_PICKS: Pick[] = [
  { id: "k1", title: { en: "Library Lego club", fr: "Club Lego à la bibliothèque" },
    blurb: { en: "Free weekly drop-in for ages 5–10 across 8 branches.", fr: "Accueil libre hebdo, 5–10 ans, 8 succursales." },
    category: { en: "Free · Indoor", fr: "Gratuit · Intérieur" }, cost: "free", neighborhood: "Citywide",
    image: img("1558877385-c6f4eecbf3e6") },
  { id: "k2", title: { en: "Splash pads opening this weekend", fr: "Jeux d'eau ouvrent ce week-end" },
    blurb: { en: "12 city splash pads turning on Saturday — full list inside.", fr: "12 jeux d'eau municipaux ouvrent samedi — liste complète." },
    category: { en: "Free · Outdoor", fr: "Gratuit · Extérieur" }, cost: "free", neighborhood: "Citywide",
    image: img("1502635385003-ee1e6a1a742d") },
  { id: "k3", title: { en: "Science centre — toddler mornings", fr: "Centre des sciences — matins tout-petits" },
    blurb: { en: "Sensory-friendly hour for 0–4, $5 caregivers free.", fr: "Heure sensorielle 0–4 ans, 5 $, accompagnateurs libres." },
    category: { en: "Under $20", fr: "Moins de 20 $" }, cost: "under-20", neighborhood: "Citywide",
    image: img("1581235720704-06d3acfcb36f") },
  { id: "k4", title: { en: "Free family yoga — Dow's Lake", fr: "Yoga familial gratuit — lac Dow" },
    blurb: { en: "Bring a mat; bilingual instructor; suitable from age 5.", fr: "Tapis requis; animatrice bilingue; à partir de 5 ans." },
    category: { en: "Free · Outdoor", fr: "Gratuit · Extérieur" }, cost: "free", neighborhood: "Glebe",
    image: img("1518611012118-696072aa579a") },
];

export const YOUTH_PICKS: Pick[] = [
  { id: "y1", title: { en: "Skate jam at Legacy Park", fr: "Jam de planche au parc Legacy" },
    blurb: { en: "Free monthly meetup with coaches and music; all levels.", fr: "Rendez-vous mensuel gratuit avec coachs; tous niveaux." },
    category: { en: "Free · Outdoor", fr: "Gratuit · Extérieur" }, cost: "free", neighborhood: "Vanier",
    image: img("1520975916090-3105956dac38") },
  { id: "y2", title: { en: "Code for Ottawa — teen track", fr: "Code for Ottawa — volet ados" },
    blurb: { en: "Monthly Saturday workshop for ages 13–18, mentor-led.", fr: "Atelier mensuel samedi, 13–18 ans, avec mentors." },
    category: { en: "Free · Indoor", fr: "Gratuit · Intérieur" }, cost: "free", neighborhood: "Centretown",
    image: img("1517694712202-14dd9538aa97") },
  { id: "y3", title: { en: "Open mic — Rowan House", fr: "Micro ouvert — Rowan House" },
    blurb: { en: "Spoken word, music, comedy. Ages 14–22.", fr: "Slam, musique, humour. 14–22 ans." },
    category: { en: "Free · Arts", fr: "Gratuit · Arts" }, cost: "free", neighborhood: "Sandy Hill",
    image: img("1493225457124-a3eb161ffa5f") },
  { id: "y4", title: { en: "U17 soccer drop-in — Mooney's Bay", fr: "Soccer U17 libre — Plage Mooney" },
    blurb: { en: "Sunday afternoons, pickup style, all skill levels welcome.", fr: "Dimanche après-midi, format libre, tous niveaux." },
    category: { en: "Free · Sport", fr: "Gratuit · Sport" }, cost: "free", neighborhood: "Alta Vista",
    image: img("1530549387789-4c1017266635") },
];

// ============ GUIDE TOPICS ============
export type GuideTopic = {
  id: string;
  title: Bilingual;
  blurb: Bilingual;
  icon: string; // lucide icon name handled in component
  href: string;
};

export const OTTAWA_GUIDE: GuideTopic[] = [
  { id: "og1", title: { en: "Moving to Ottawa", fr: "Déménager à Ottawa" }, blurb: { en: "Neighborhoods, schools, transit, French services.", fr: "Quartiers, écoles, transport, services en français." }, icon: "MapPin", href: "/neighborhoods" },
  { id: "og2", title: { en: "OC Transpo & LRT survival", fr: "Survivre à OC Transpo et au TLR" }, blurb: { en: "Passes, Presto, accessibility, alerts.", fr: "Cartes, Presto, accessibilité, alertes." }, icon: "Train", href: "/traffic" },
  { id: "og3", title: { en: "Health cards & clinics", fr: "Cartes santé et cliniques" }, blurb: { en: "OHIP, walk-ins, telehealth, bilingual clinics.", fr: "OHIP, cliniques sans RV, télésanté, cliniques bilingues." }, icon: "Stethoscope", href: "#" },
  { id: "og4", title: { en: "Schools & daycare", fr: "Écoles et garderies" }, blurb: { en: "Catchments, French-immersion, subsidies, waitlists.", fr: "Aires de desserte, immersion, subventions, listes d'attente." }, icon: "GraduationCap", href: "#" },
  { id: "og5", title: { en: "Snow, garbage, recycling", fr: "Neige, déchets, recyclage" }, blurb: { en: "Pickup days, bins, snow routes, complaints.", fr: "Jours de collecte, bacs, routes de déneigement." }, icon: "Snowflake", href: "#" },
  { id: "og6", title: { en: "Cycling & winter biking", fr: "Vélo et vélo d'hiver" }, blurb: { en: "Best routes, plowed paths, secure parking.", fr: "Meilleurs trajets, sentiers déneigés, stationnement." }, icon: "Bike", href: "#" },
  { id: "og7", title: { en: "Free things to do", fr: "Activités gratuites" }, blurb: { en: "Curated, all year, by neighborhood.", fr: "Sélection, toute l'année, par quartier." }, icon: "Gift", href: "/activities" },
  { id: "og8", title: { en: "Newcomer services", fr: "Services aux nouveaux arrivants" }, blurb: { en: "Settlement agencies, language classes, ID.", fr: "Organismes, cours de langue, pièces d'identité." }, icon: "Globe", href: "#" },
];

export const CANADA_GUIDE: GuideTopic[] = [
  { id: "cg1", title: { en: "SIN, ID & banking for newcomers", fr: "NAS, pièces d'identité et banque" }, blurb: { en: "What to bring, where to apply, free help.", fr: "Quoi apporter, où s'inscrire, aide gratuite." }, icon: "IdCard", href: "#" },
  { id: "cg2", title: { en: "Filing taxes (CRA basics)", fr: "Déclarer ses impôts (ARC, bases)" }, blurb: { en: "Free clinics, GST/HST credit, deadlines.", fr: "Cliniques gratuites, crédit TPS/TVH, échéances." }, icon: "Calculator", href: "#" },
  { id: "cg3", title: { en: "Renting your first place", fr: "Louer son premier logement" }, blurb: { en: "Leases, deposits, your tenant rights.", fr: "Baux, dépôts, droits du locataire." }, icon: "Home", href: "#" },
  { id: "cg4", title: { en: "Voting in Canada", fr: "Voter au Canada" }, blurb: { en: "Federal, provincial, municipal — who, when, how.", fr: "Fédéral, provincial, municipal — qui, quand, comment." }, icon: "Vote", href: "#" },
  { id: "cg5", title: { en: "Health care across provinces", fr: "Santé d'une province à l'autre" }, blurb: { en: "Coverage during moves, family doctors, telehealth.", fr: "Couverture lors d'un déménagement, médecin de famille." }, icon: "HeartPulse", href: "#" },
  { id: "cg6", title: { en: "Driving & ID swap by province", fr: "Conduire et échanger son permis" }, blurb: { en: "License swaps, insurance, winter tires by region.", fr: "Échange de permis, assurance, pneus d'hiver." }, icon: "Car", href: "#" },
  { id: "cg7", title: { en: "Studying in Canada", fr: "Étudier au Canada" }, blurb: { en: "OSAP/CSL, college vs university, francophone options.", fr: "OSAP/PCPE, collège ou université, options francophones." }, icon: "BookOpen", href: "#" },
  { id: "cg8", title: { en: "Cold-weather basics", fr: "L'essentiel du froid" }, blurb: { en: "What to wear, what to budget, what to skip.", fr: "Quoi porter, budget, à éviter." }, icon: "Snowflake", href: "#" },
];

// ============ CITIZEN REPORTS ============
export type CitizenReport = {
  id: string;
  title: Bilingual;
  neighborhood: Neighborhood | "Citywide";
  category: Bilingual;
  minutesAgo: number;
  status: "verified" | "developing" | "submitted";
  by: string;
};

export const CITIZEN_REPORTS: CitizenReport[] = [
  { id: "cr1", title: { en: "Bus shelter glass shattered at Heron Rd", fr: "Vitre d'abribus brisée av. Heron" }, neighborhood: "Alta Vista", category: { en: "Transit", fr: "Transport" }, minutesAgo: 14, status: "developing", by: "@busridernotes" },
  { id: "cr2", title: { en: "Free piano on the curb — Holmwood Ave", fr: "Piano gratuit sur le trottoir — av. Holmwood" }, neighborhood: "Old Ottawa South", category: { en: "Good news", fr: "Bonne nouvelle" }, minutesAgo: 22, status: "submitted", by: "Lina K." },
  { id: "cr3", title: { en: "Pothole growing fast on Wellington W", fr: "Nid-de-poule s'agrandit, Wellington O" }, neighborhood: "Hintonburg", category: { en: "Roads", fr: "Routes" }, minutesAgo: 36, status: "verified", by: "Editor desk" },
  { id: "cr4", title: { en: "New community garden opens Saturday", fr: "Nouveau jardin communautaire samedi" }, neighborhood: "Vanier", category: { en: "Community", fr: "Communauté" }, minutesAgo: 55, status: "verified", by: "@jardinsvanier" },
  { id: "cr5", title: { en: "Coyote sighting near Hampton Park", fr: "Coyote aperçu près du parc Hampton" }, neighborhood: "Westboro", category: { en: "Wildlife", fr: "Faune" }, minutesAgo: 70, status: "developing", by: "P. Tremblay" },
  { id: "cr6", title: { en: "Library wifi extended evenings, Carlingwood", fr: "Wifi prolongé en soirée, Carlingwood" }, neighborhood: "Nepean", category: { en: "Services", fr: "Services" }, minutesAgo: 110, status: "verified", by: "OPL notice" },
];
