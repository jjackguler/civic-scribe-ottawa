import type { Bilingual, Neighborhood } from "./data";
import { newsprintDataURI } from "./image-fallback";

// Deterministic editorial placeholder. No external stock photos, no random selection.
const ACCENTS = ["#8b1d24", "#1E5F8E", "#2F5233", "#B87333", "#0F1419", "#A0202C"];
const hashAccent = (id: string) => ACCENTS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % ACCENTS.length];
const img = (id: string, _w = 1200, _h = 800) => `newsprint:${hashAccent(id)}`;

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

// ============ CANADA GUIDE — SECTIONED ESSENTIALS ============
export type CanadaSourceStatus = "verified" | "official" | "review-pending" | "community";
export type CanadaCard = {
  id: string;
  title: Bilingual;
  blurb: Bilingual;
  icon: string;
  href: string;
  source: { label: string; url?: string };
  status: CanadaSourceStatus;
  updated: string; // ISO
  ottawaTip?: Bilingual;
};
export type CanadaSection = {
  id: string;
  kicker: Bilingual;
  title: Bilingual;
  dek: Bilingual;
  cards: CanadaCard[];
};

const CG = (id: string, t: Bilingual, b: Bilingual, icon: string, src: { label: string; url?: string }, status: CanadaSourceStatus, updated: string, tip?: Bilingual, href = "#"): CanadaCard =>
  ({ id, title: t, blurb: b, icon, href, source: src, status, updated, ottawaTip: tip });

export const CANADA_GUIDE_SECTIONS: CanadaSection[] = [
  {
    id: "newcomer",
    kicker: { en: "Newcomer essentials", fr: "Essentiels nouveaux arrivants" },
    title: { en: "First 30 days in Canada", fr: "Vos 30 premiers jours au Canada" },
    dek: { en: "ID, banking, phones, transit — the practical sequence that unlocks everything else.", fr: "Pièces d'identité, banque, téléphone, transport — la séquence pratique qui débloque le reste." },
    cards: [
      CG("nc1", { en: "Get your SIN (Social Insurance Number)", fr: "Obtenir votre NAS" },
         { en: "Free, in-person at Service Canada (Wellington St W). Bring passport + immigration document. Usually same-day.", fr: "Gratuit, en personne à Service Canada (Wellington O.). Passeport + document d'immigration. Souvent le jour même." },
         "IdCard", { label: "Service Canada", url: "https://www.canada.ca/en/employment-social-development/services/sin.html" },
         "official", "2026-05-12",
         { en: "Ottawa office: 110 Wellington St W. Arrive at 8:15am to skip lines.", fr: "Bureau d'Ottawa : 110, rue Wellington O. Arrivez vers 8 h 15 pour éviter la file." }),
      CG("nc2", { en: "Open a no-fee newcomer bank account", fr: "Ouvrir un compte sans frais pour nouveaux arrivants" },
         { en: "RBC, Scotiabank, TD, BMO and CIBC all offer no-fee newcomer chequing accounts for the first 12 months. Bring SIN + passport.", fr: "RBC, Banque Scotia, TD, BMO et CIBC offrent un compte chèques sans frais 12 mois. Apportez NAS + passeport." },
         "Wallet", { label: "Financial Consumer Agency of Canada", url: "https://www.canada.ca/en/financial-consumer-agency.html" },
         "verified", "2026-05-02",
         { en: "Most Ottawa branches book newcomer appointments in EN/FR within 48h.", fr: "La plupart des succursales d'Ottawa fixent un rendez-vous bilingue en 48 h." }),
      CG("nc3", { en: "Get a Presto card (OC Transpo + STO)", fr: "Obtenir une carte Presto (OC Transpo + STO)" },
         { en: "$6 card, refillable online. Discounted monthly passes for students, seniors, and equity pass holders.", fr: "Carte 6 $, rechargeable en ligne. Tarifs réduits étudiants, aînés, laissez-passer équité." },
         "Train", { label: "OC Transpo", url: "https://www.octranspo.com/en/fares/presto-card/" },
         "official", "2026-05-22"),
      CG("nc4", { en: "Find settlement help in Ottawa", fr: "Trouver de l'aide à l'établissement à Ottawa" },
         { en: "OCISO, Catholic Centre for Immigrants, and Centre Espoir Sophie offer free EN/FR settlement counsellors, job search, language assessments.", fr: "OCISO, Centre catholique pour immigrants, Centre Espoir Sophie offrent du counseling, recherche d'emploi, évaluations linguistiques gratuites." },
         "Users", { label: "IRCC — Find services", url: "https://ircc.canada.ca/english/newcomers/services/" },
         "verified", "2026-04-29",
         { en: "OCISO youth program: weekly drop-ins for 13–24 in Centretown.", fr: "Programme jeunesse OCISO : accueil hebdo pour 13–24 ans au centre-ville." }),
    ],
  },
  {
    id: "health",
    kicker: { en: "Health care", fr: "Soins de santé" },
    title: { en: "Doctors, OHIP, walk-ins, telehealth", fr: "Médecins, OHIP, cliniques sans RV, télésanté" },
    dek: { en: "OHIP covers most doctor visits and hospital care in Ontario. Here's how to get on it and what to do while you wait.", fr: "L'OHIP couvre la majorité des visites médicales et hospitalières en Ontario. Voici comment l'obtenir et quoi faire en attendant." },
    cards: [
      CG("h1", { en: "Apply for OHIP (Ontario Health card)", fr: "Demander la carte santé de l'Ontario (OHIP)" },
         { en: "Required: proof of Ontario residency, identity, status in Canada. Most new residents are covered after a 3-month wait; refugees and some workers are covered immediately.", fr: "Requis : preuve de résidence ontarienne, identité, statut au Canada. La plupart des nouveaux résidents sont couverts après 3 mois; réfugiés et certains travailleurs immédiatement." },
         "HeartPulse", { label: "Ontario.ca — OHIP", url: "https://www.ontario.ca/page/apply-ohip-and-get-health-card" },
         "official", "2026-05-15",
         { en: "Ottawa ServiceOntario: 110 Laurier W and 2680 Queensview Dr. Book ahead.", fr: "ServiceOntario à Ottawa : 110 Laurier O et 2680 Queensview. Prenez rendez-vous." }),
      CG("h2", { en: "Find a family doctor — Health Care Connect", fr: "Trouver un médecin de famille — Accès Soins" },
         { en: "Free provincial registry. Average wait in Ottawa is long, but registering puts you on the list and unlocks interim nurse calls.", fr: "Registre provincial gratuit. L'attente à Ottawa est longue, mais l'inscription débloque un suivi infirmier intérimaire." },
         "Stethoscope", { label: "Health Care Connect", url: "https://www.ontario.ca/page/find-family-doctor-or-nurse-practitioner" },
         "official", "2026-04-18"),
      CG("h3", { en: "Use Health Connect Ontario (24/7 nurse)", fr: "Santé Connexion Ontario (infirmière 24/7)" },
         { en: "Call 811 or chat online. Free, confidential, bilingual. Triages whether you need a clinic, ER, or self-care.", fr: "Composez 811 ou clavardez. Gratuit, confidentiel, bilingue. Indique si vous avez besoin d'une clinique, urgence ou soins à domicile." },
         "Phone", { label: "Health Connect Ontario", url: "https://www.ontario.ca/page/get-medical-advice-health-connect-ontario" },
         "official", "2026-05-20"),
      CG("h4", { en: "Walk-in clinics in Ottawa", fr: "Cliniques sans rendez-vous à Ottawa" },
         { en: "Use Medimap.ca for live walk-in wait times across Ottawa. Many close by 5pm; same-day virtual options listed.", fr: "Medimap.ca affiche les temps d'attente en direct à Ottawa. Plusieurs ferment à 17 h; options virtuelles le jour même." },
         "MapPin", { label: "Medimap", url: "https://medimap.ca/ontario/ottawa" },
         "verified", "2026-05-23"),
    ],
  },
  {
    id: "taxes",
    kicker: { en: "Money & taxes", fr: "Argent et impôts" },
    title: { en: "CRA, GST/HST credit, free tax help", fr: "ARC, crédit TPS/TVH, aide gratuite" },
    dek: { en: "Filing a return — even with no income — unlocks the GST/HST credit, Canada Child Benefit, and Ontario Trillium Benefit.", fr: "Produire une déclaration — même sans revenu — débloque le crédit TPS/TVH, l'ACE et la prestation Trillium." },
    cards: [
      CG("tx1", { en: "Free tax clinics (CVITP)", fr: "Cliniques d'impôts gratuites (PCBMI)" },
         { en: "Volunteers file simple returns for free if your household income is modest. Several Ottawa sites run Feb–April; some year-round.", fr: "Des bénévoles produisent gratuitement des déclarations simples pour revenus modestes. Plusieurs sites à Ottawa entre fév. et avril; certains à l'année." },
         "Calculator", { label: "CRA — Free tax clinics", url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/community-volunteer-income-tax-program.html" },
         "official", "2026-04-30",
         { en: "Ottawa hosts: Centretown Community Health Centre, OCISO, Nepean Rideau Osgoode CRC.", fr: "Hôtes à Ottawa : CSC Centretown, OCISO, CRC Nepean-Rideau-Osgoode." }),
      CG("tx2", { en: "Get a CRA My Account", fr: "Ouvrir Mon dossier ARC" },
         { en: "Track refunds, benefits, RRSP room. Sign in with banking partner for instant access — paper PIN takes 2–3 weeks.", fr: "Suivre remboursements, prestations, REER. Connectez-vous via un partenaire bancaire pour un accès instantané — le NIP papier prend 2–3 semaines." },
         "User", { label: "CRA — My Account", url: "https://www.canada.ca/en/revenue-agency/services/e-services/digital-services-individuals/account-individuals.html" },
         "official", "2026-05-10"),
      CG("tx3", { en: "GST/HST credit & Canada Child Benefit", fr: "Crédit TPS/TVH et Allocation canadienne pour enfants" },
         { en: "Quarterly tax-free payments. You only need to file a tax return to be assessed; no separate application.", fr: "Versements trimestriels non imposables. Il suffit de produire une déclaration; aucune demande distincte." },
         "Coins", { label: "CRA — Benefits", url: "https://www.canada.ca/en/revenue-agency/services/child-family-benefits.html" },
         "official", "2026-05-01"),
      CG("tx4", { en: "Ontario Trillium Benefit (rent & energy)", fr: "Prestation Trillium de l'Ontario (loyer et énergie)" },
         { en: "Monthly payment helping with rent, property tax, energy, and sales tax. Renters: keep your landlord's name + total rent paid on file.", fr: "Versement mensuel pour loyer, taxe foncière, énergie et taxe de vente. Locataires : gardez le nom du propriétaire et le loyer total." },
         "Home", { label: "Ontario — Trillium", url: "https://www.ontario.ca/page/ontario-trillium-benefit" },
         "official", "2026-04-22"),
    ],
  },
  {
    id: "housing",
    kicker: { en: "Housing", fr: "Logement" },
    title: { en: "Renting, leases, tenant rights", fr: "Location, baux, droits du locataire" },
    dek: { en: "Ontario uses a standard lease and caps most annual rent increases. Know your rights before you sign.", fr: "L'Ontario impose un bail standard et plafonne la majorité des hausses annuelles. Connaissez vos droits avant de signer." },
    cards: [
      CG("hs1", { en: "Standard Lease — required by law", fr: "Bail standard — obligatoire" },
         { en: "Most Ontario landlords must use the standard lease (Form 2229E). If yours doesn't, you can legally withhold rent until you receive one.", fr: "La plupart des propriétaires doivent utiliser le bail standard (2229E). Sinon, vous pouvez légalement retenir le loyer jusqu'à réception." },
         "FileText", { label: "Ontario — Standard Lease", url: "https://www.ontario.ca/page/standard-lease" },
         "official", "2026-04-15"),
      CG("hs2", { en: "Rent increase guideline (2.5% in 2026)", fr: "Hausse de loyer (2,5 % en 2026)" },
         { en: "Landlords can raise rent once every 12 months by the provincial guideline, with 90 days written notice on Form N1.", fr: "Le propriétaire peut augmenter le loyer une fois par 12 mois selon le taux provincial, avec préavis écrit de 90 jours (N1)." },
         "TrendingUp", { label: "Landlord & Tenant Board", url: "https://tribunalsontario.ca/ltb/" },
         "official", "2026-05-05"),
      CG("hs3", { en: "Ottawa Community Legal Services — tenant help", fr: "Services juridiques communautaires d'Ottawa — locataires" },
         { en: "Free legal advice for low-income tenants facing eviction, repairs, or above-guideline increases.", fr: "Conseils juridiques gratuits pour locataires à faible revenu (éviction, réparations, hausses au-delà du seuil)." },
         "Scale", { label: "OCLS", url: "https://ottawacommunitylegalservices.ca/" },
         "verified", "2026-05-08"),
      CG("hs4", { en: "Find rental listings without scams", fr: "Trouver des annonces sans arnaques" },
         { en: "Stick to Kijiji, Rentals.ca, Facebook Marketplace with verified profiles, and Ottawa Community Housing waitlist. Never wire deposits before viewing.", fr: "Privilégiez Kijiji, Rentals.ca, Marketplace avec profils vérifiés, et la liste d'attente du Logement communautaire d'Ottawa. Jamais de virement sans visite." },
         "Search", { label: "Ottawa Community Housing", url: "https://och-lco.ca/" },
         "verified", "2026-05-18"),
    ],
  },
  {
    id: "jobs",
    kicker: { en: "Work", fr: "Emploi" },
    title: { en: "Jobs, credentials, employment standards", fr: "Emplois, équivalences, normes du travail" },
    dek: { en: "Federal job bank, free credential evaluation, and the Employment Standards Act protect you in every Ontario workplace.", fr: "Le Guichet-Emplois fédéral, l'évaluation gratuite des diplômes et la Loi sur les normes d'emploi vous protègent en Ontario." },
    cards: [
      CG("j1", { en: "Job Bank — federal listings", fr: "Guichet-Emplois — offres fédérales" },
         { en: "Free, government-run. Filter by city, language, NOC code. Includes wage and trends data per role.", fr: "Gratuit, fédéral. Filtres par ville, langue, code CNP. Données sur salaires et tendances." },
         "Briefcase", { label: "Job Bank", url: "https://www.jobbank.gc.ca/" },
         "official", "2026-05-25"),
      CG("j2", { en: "Get foreign credentials recognized", fr: "Faire reconnaître ses diplômes" },
         { en: "World Education Services (WES) is the most-accepted evaluator for Ontario employers and regulated colleges.", fr: "World Education Services (WES) est l'évaluateur le plus accepté par les employeurs et les ordres professionnels en Ontario." },
         "Award", { label: "WES Canada", url: "https://www.wes.org/ca/" },
         "verified", "2026-04-20"),
      CG("j3", { en: "Know your rights — Employment Standards Act", fr: "Connaître vos droits — Loi sur les normes d'emploi" },
         { en: "Minimum wage, overtime after 44h/week, paid public holidays, vacation pay, termination notice — all set by Ontario law, not your boss.", fr: "Salaire minimum, heures sup. après 44 h, congés fériés payés, vacances, préavis — tout est fixé par la loi ontarienne." },
         "ShieldCheck", { label: "Ontario — ESA", url: "https://www.ontario.ca/document/your-guide-employment-standards-act-0" },
         "official", "2026-05-03"),
      CG("j4", { en: "Free job-search programs in Ottawa", fr: "Programmes gratuits de recherche d'emploi à Ottawa" },
         { en: "Employment Ontario centres (YMCA-YWCA, Causeway, La Cité collégiale) offer free coaching, résumé reviews, workshops in EN/FR.", fr: "Emploi Ontario (YMCA-YWCA, Causeway, La Cité collégiale) offre coaching, révision de CV et ateliers gratuits en EN/FR." },
         "Users", { label: "Employment Ontario", url: "https://www.ontario.ca/page/employment-ontario" },
         "verified", "2026-05-11"),
    ],
  },
  {
    id: "schools",
    kicker: { en: "Schools & childcare", fr: "Écoles et garde d'enfants" },
    title: { en: "Public, Catholic, francophone, daycare subsidies", fr: "Public, catholique, francophone, subventions garderie" },
    dek: { en: "Four publicly funded school boards serve Ottawa. $10/day childcare (CWELCC) cuts daycare fees in licensed centres.", fr: "Quatre conseils scolaires publics à Ottawa. Garderie à 10 $/jour (PAGSJE) dans les centres agréés." },
    cards: [
      CG("sc1", { en: "Four Ottawa school boards", fr: "Quatre conseils scolaires à Ottawa" },
         { en: "OCDSB (English public), OCSB (English Catholic), CEPEO (French public), CECCE (French Catholic). Enrol via the board's online portal.", fr: "OCDSB (public anglais), OCSB (catholique anglais), CEPEO (public français), CECCE (catholique français). Inscription en ligne par conseil." },
         "GraduationCap", { label: "OCDSB", url: "https://www.ocdsb.ca/" },
         "official", "2026-04-25"),
      CG("sc2", { en: "French immersion — high demand", fr: "Immersion française — forte demande" },
         { en: "Early French Immersion starts in Senior Kindergarten in most OCDSB schools. Register by the Jan 31 deadline; some catchments use lotteries.", fr: "L'immersion précoce commence à la maternelle 2e année dans la plupart des écoles OCDSB. Inscription avant le 31 janvier; certaines aires par tirage." },
         "Languages", { label: "OCDSB — Immersion", url: "https://www.ocdsb.ca/" },
         "verified", "2026-04-30"),
      CG("sc3", { en: "$10/day childcare (CWELCC)", fr: "Garderie à 10 $/jour (PAGSJE)" },
         { en: "Federal-provincial program is rolling out at licensed centres. Waitlists are long; register at multiple centres at once.", fr: "Programme fédéral-provincial dans les centres agréés. Listes d'attente longues; inscrivez-vous à plusieurs centres." },
         "Baby", { label: "Ontario — Affordable childcare", url: "https://www.ontario.ca/page/affordable-child-care" },
         "official", "2026-05-07"),
      CG("sc4", { en: "Childcare fee subsidies (City of Ottawa)", fr: "Subvention de garde d'enfants (Ville d'Ottawa)" },
         { en: "Income-tested subsidy administered by the City for licensed care. Apply online; processing usually under 30 days.", fr: "Subvention selon le revenu, administrée par la Ville pour garde agréée. Demande en ligne; traitement < 30 jours." },
         "Wallet", { label: "City of Ottawa — Fee subsidy", url: "https://ottawa.ca/en/family-and-social-services" },
         "official", "2026-04-28"),
    ],
  },
  {
    id: "legal",
    kicker: { en: "Legal & community help", fr: "Aide juridique et communautaire" },
    title: { en: "Free legal advice, 211, crisis & community lines", fr: "Aide juridique gratuite, 211, lignes de crise et communautaires" },
    dek: { en: "If you need help fast — tenant, family, immigration, mental health — these lines are free, confidential, and bilingual.", fr: "Pour de l'aide rapide — logement, famille, immigration, santé mentale — ces lignes sont gratuites, confidentielles et bilingues." },
    cards: [
      CG("lg1", { en: "211 Ontario — find local services", fr: "211 Ontario — trouver des services locaux" },
         { en: "Free 24/7 helpline and chat connecting you to housing, food, mental health, newcomer, and family supports near you.", fr: "Ligne 24/7 gratuite et clavardage reliant logement, alimentation, santé mentale, nouveaux arrivants et famille." },
         "Phone", { label: "211 Ontario", url: "https://211ontario.ca/" },
         "official", "2026-05-22"),
      CG("lg2", { en: "Legal Aid Ontario — free certificates", fr: "Aide juridique Ontario — certificats gratuits" },
         { en: "Covers criminal, family, refugee, mental health, and tenant cases for low-income Ontarians. Apply by phone or online.", fr: "Couvre droit criminel, familial, des réfugiés, santé mentale et locataires pour faibles revenus. Demande par téléphone ou en ligne." },
         "Scale", { label: "Legal Aid Ontario", url: "https://www.legalaid.on.ca/" },
         "official", "2026-04-19"),
      CG("lg3", { en: "Mental Health Crisis Line (Ottawa)", fr: "Ligne de crise en santé mentale (Ottawa)" },
         { en: "613-722-6914 (city) / 1-866-996-0991 (region). 24/7 confidential support. For immediate danger call 9-8-8.", fr: "613-722-6914 (ville) / 1-866-996-0991 (région). Soutien confidentiel 24/7. Danger immédiat : 9-8-8." },
         "HeartPulse", { label: "Ottawa Mental Health Crisis Line", url: "https://www.crisisline.ca/" },
         "official", "2026-05-19"),
      CG("lg4", { en: "Pro bono immigration help", fr: "Aide gratuite en immigration" },
         { en: "Refugee Hub (uOttawa) and Catholic Centre for Immigrants offer free consultations. Avoid unauthorized 'consultants' charging fees.", fr: "Refugee Hub (Université d'Ottawa) et Centre catholique pour immigrants : consultations gratuites. Méfiez-vous des « consultants » non autorisés." },
         "Globe", { label: "Refugee Hub", url: "https://refugeehub.ca/" },
         "verified", "2026-05-06"),
    ],
  },
];
