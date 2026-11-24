/**
 * Canada Field Guide: a Labs lesson built in Google DeepMind's Project Genie.
 *
 * Owner decision (23 Nov 2026): like "History, rebuilt by AI", this page may show generated
 * video and stills, always labelled AI-generated, never presented as photographs of the real
 * object, and never showing a real person's face.
 *
 * Every fact below was checked against the sources listed with it on 22–23 Nov 2026. The quiz
 * uses only those facts. The playable world needs a Google AI plan, so the page also carries a
 * free version of the same nine cards that anyone can play here.
 */
import type { Bi } from "./i18n";

/** Pinned commit on the `media` branch that holds the tour videos and poster. */
const MEDIA_SHA = "fe5bccd62fb278d0d4ac011a87382e3cd2c4a5f0";
const media = (file: string) =>
  `https://cdn.jsdelivr.net/gh/jjackguler/civic-scribe-ottawa@${MEDIA_SHA}/labs/canada-field-guide/${file}`;

export const FIELD_GUIDE = {
  slug: "canada-field-guide",
  title: { en: "Canada Field Guide", fr: "Guide de terrain du Canada" } as Bi,
  dek: {
    en: "Nine Canadian stories in one playable world: Indigenous innovations, Canada's gifts to the world and Canada's dinosaurs. Built with an AI world model, checked fact by fact.",
    fr: "Neuf histoires canadiennes dans un seul monde jouable : innovations autochtones, cadeaux du Canada au monde et dinosaures du Canada. Créé avec un modèle de monde d'IA, vérifié fait par fait.",
  } as Bi,
  genieUrl: "https://labs.google/fx/projectgenie/tools/projectgenie/e?experienceId=d6babe95-05ea-4e34-a23e-7db8a1336664",
  recorded: "2026-11-23",
  video: { en: media("canada-field-guide-journey.mp4"), fr: media("canada-field-guide-journey-fr.mp4") } as Bi,
  poster: media("poster-360.jpg"),
  /** Local share image (the poster lives on the CDN; social cards want a same-site file). */
  share: "/labs/canada-field-guide/snowshoes.jpg",
};

export type WingId = "indigenous" | "gifts" | "dinosaurs";

export const WINGS: { id: WingId; title: Bi; dek: Bi }[] = [
  {
    id: "indigenous",
    title: { en: "Indigenous innovations", fr: "Innovations autochtones" },
    dek: { en: "Living traditions that shaped how people move through this land.", fr: "Des traditions vivantes qui ont façonné la façon de parcourir ce territoire." },
  },
  {
    id: "gifts",
    title: { en: "Canada's gifts to the world", fr: "Les cadeaux du Canada au monde" },
    dek: { en: "Ideas first made to work here, then used everywhere.", fr: "Des idées mises au point ici, puis utilisées partout." },
  },
  {
    id: "dinosaurs",
    title: { en: "Canada's dinosaurs", fr: "Les dinosaures du Canada" },
    dek: { en: "Alberta's rocks hold some of the best dinosaur fossils on Earth.", fr: "Les roches de l'Alberta renferment certains des plus beaux fossiles de dinosaures du monde." },
  },
];

export type Question = { q: Bi; options: Bi[]; answer: number; why: Bi };
export type Card = {
  id: string;
  n: number;
  wing: WingId;
  title: Bi;
  place: Bi;
  img: string;
  alt: Bi;
  facts: Bi[];
  quiz: Question[];
  sources: { title: string; url: string }[];
};

const img = (f: string) => `/labs/canada-field-guide/${f}.jpg`;

export const CARDS: Card[] = [
  {
    id: "canoe", n: 1, wing: "indigenous",
    title: { en: "Birchbark canoe", fr: "Canot d'écorce de bouleau" },
    place: { en: "Canadian Shield lakes", fr: "Lacs du Bouclier canadien" },
    img: img("canoe"),
    alt: { en: "AI-generated image: a birchbark canoe on the shore of a misty lake at dawn, with a visitor's hands resting on a rock.", fr: "Image générée par IA : un canot d'écorce sur la rive d'un lac brumeux à l'aube, les mains d'un visiteur posées sur un rocher." },
    facts: [
      { en: "The birchbark canoe was the main way Indigenous peoples of the Eastern Woodlands travelled by water. Algonquin, Innu, Ojibwe and Wolastoqiyik builders all depended on it.", fr: "Le canot d'écorce était le principal moyen de transport sur l'eau des peuples autochtones des forêts de l'Est. Les Algonquins, les Innus, les Ojibwés et les Wolastoqiyik en dépendaient." },
      { en: "It was light enough to carry over a portage, the land route between two lakes or around rapids, which made it ideal for the Canadian Shield.", fr: "Il était assez léger pour être porté lors d'un portage, le trajet à pied entre deux lacs ou autour de rapides, ce qui le rendait idéal pour le Bouclier canadien." },
      { en: "Seams were sealed with spruce gum. Fur-trade voyageurs later adopted the design to reach the interior of the continent.", fr: "Les coutures étaient scellées avec de la gomme d'épinette. Les voyageurs de la traite des fourrures ont ensuite adopté ce canot pour atteindre l'intérieur du continent." },
    ],
    quiz: [
      { q: { en: "What is a portage?", fr: "Qu'est-ce qu'un portage?" }, options: [{ en: "Carrying a canoe over land between two waterways", fr: "Porter un canot par voie de terre entre deux plans d'eau" }, { en: "A wooden paddle", fr: "Une pagaie en bois" }, { en: "A fur-trade fort", fr: "Un fort de traite des fourrures" }], answer: 0, why: { en: "A portage is the land route around a break in a water route. A light canoe made it possible.", fr: "Un portage est le trajet par voie de terre autour d'une interruption sur l'eau. Un canot léger le rendait possible." } },
      { q: { en: "What sealed the seams of a birchbark canoe?", fr: "Qu'est-ce qui scellait les coutures d'un canot d'écorce?" }, options: [{ en: "Spruce gum", fr: "La gomme d'épinette" }, { en: "Tar from a ship", fr: "Du goudron de navire" }, { en: "Clay", fr: "De l'argile" }], answer: 0, why: { en: "Builders sealed seams with spruce gum, which could also patch a damaged canoe on the trail.", fr: "Les constructeurs utilisaient la gomme d'épinette, qui servait aussi à réparer un canot en route." } },
      { q: { en: "Which group later adopted the canoe for the fur trade?", fr: "Quel groupe a ensuite adopté le canot pour la traite des fourrures?" }, options: [{ en: "The voyageurs", fr: "Les voyageurs" }, { en: "Railway builders", fr: "Les bâtisseurs de chemins de fer" }, { en: "Gold-rush miners", fr: "Les chercheurs d'or" }], answer: 0, why: { en: "Voyageurs used birchbark canoes to carry furs and supplies between the interior and Montréal.", fr: "Les voyageurs utilisaient le canot d'écorce pour transporter fourrures et provisions entre l'intérieur et Montréal." } },
    ],
    sources: [
      { title: "The Canadian Encyclopedia: Birchbark canoe", url: "https://www.thecanadianencyclopedia.ca/en/article/birchbark-canoe" },
      { title: "The Canadian Encyclopedia: Portage", url: "https://www.thecanadianencyclopedia.ca/en/article/portage" },
    ],
  },
  {
    id: "snowshoes", n: 2, wing: "indigenous",
    title: { en: "Snowshoes", fr: "Raquettes" },
    place: { en: "The boreal forest in winter", fr: "La forêt boréale en hiver" },
    img: img("snowshoes"),
    alt: { en: "AI-generated image: a canvas tent and two campfires in a snowy forest at night.", fr: "Image générée par IA : une tente en toile et deux feux de camp dans une forêt enneigée, la nuit." },
    facts: [
      { en: "Snowshoes spread a person's weight over a wider surface, so they do not sink deep into the snow with every step.", fr: "Les raquettes répartissent le poids d'une personne sur une plus grande surface, pour ne pas s'enfoncer dans la neige à chaque pas." },
      { en: "Indigenous peoples across most of Canada made and used snowshoes to travel in winter and to hunt without making much noise.", fr: "Les peuples autochtones de presque tout le Canada fabriquaient des raquettes pour voyager l'hiver et chasser sans faire de bruit." },
      { en: "They were laced with babiche, a cord cut from rawhide. Babiche is an Algonquian word. Long narrow shapes and round \"bearpaw\" shapes suited different snow.", fr: "Elles étaient lacées de babiche, une corde taillée dans du cuir brut. « Babiche » est un mot algonquien. Les formes longues et étroites ou rondes (« patte d'ours ») convenaient à des neiges différentes." },
    ],
    quiz: [
      { q: { en: "Why don't you sink as deep on snowshoes?", fr: "Pourquoi s'enfonce-t-on moins avec des raquettes?" }, options: [{ en: "They spread your weight over a wider area", fr: "Elles répartissent le poids sur une plus grande surface" }, { en: "They melt the snow", fr: "Elles font fondre la neige" }, { en: "They make you lighter", fr: "Elles rendent plus léger" }], answer: 0, why: { en: "Same weight, bigger surface: less pressure on the snow.", fr: "Même poids, plus grande surface : moins de pression sur la neige." } },
      { q: { en: "What is babiche?", fr: "Qu'est-ce que la babiche?" }, options: [{ en: "Cord made from rawhide, used to lace snowshoes", fr: "Une corde de cuir brut pour lacer les raquettes" }, { en: "A type of tree", fr: "Une sorte d'arbre" }, { en: "A winter boot", fr: "Une botte d'hiver" }], answer: 0, why: { en: "Babiche is rawhide cut into long strips. The word comes from an Algonquian language.", fr: "La babiche est du cuir brut taillé en longues lanières. Le mot vient d'une langue algonquienne." } },
      { q: { en: "Besides travel, what did snowshoes help hunters do?", fr: "En plus de voyager, qu'est-ce que les raquettes permettaient aux chasseurs?" }, options: [{ en: "Move quietly", fr: "Se déplacer sans bruit" }, { en: "Run on ice", fr: "Courir sur la glace" }, { en: "Climb trees", fr: "Grimper aux arbres" }], answer: 0, why: { en: "Walking on top of deep snow let hunters move with little noise.", fr: "Marcher sur la neige profonde permettait aux chasseurs de se déplacer en silence." } },
    ],
    sources: [
      { title: "The Canadian Encyclopedia: Snowshoes", url: "https://www.thecanadianencyclopedia.ca/en/article/snowshoes" },
      { title: "The Canadian Encyclopedia: Babiche", url: "https://www.thecanadianencyclopedia.ca/en/article/babiche" },
    ],
  },
  {
    id: "lacrosse", n: 3, wing: "indigenous",
    title: { en: "Lacrosse", fr: "La crosse" },
    place: { en: "A riverside field", fr: "Un champ au bord de la rivière" },
    img: img("lacrosse"),
    alt: { en: "AI-generated image: two wooden lacrosse sticks crossed on the grass by a river.", fr: "Image générée par IA : deux bâtons de crosse en bois croisés dans l'herbe près d'une rivière." },
    facts: [
      { en: "Lacrosse was created by Indigenous peoples. In Mohawk it is tewaarathon, and it holds a central place in Haudenosaunee tradition.", fr: "La crosse a été créée par des peuples autochtones. En mohawk, elle s'appelle tewaarathon, et elle occupe une place centrale dans la tradition haudenosaunee." },
      { en: "In 1867 the National Lacrosse Association of Canada became the country's first national sport governing body.", fr: "En 1867, l'Association nationale de crosse du Canada est devenue le premier organisme sportif national du pays." },
      { en: "The National Sports of Canada Act of 1994 declared lacrosse Canada's national summer sport, and hockey the winter sport.", fr: "La Loi sur les sports nationaux du Canada de 1994 a fait de la crosse le sport national d'été du Canada, et du hockey celui d'hiver." },
    ],
    quiz: [
      { q: { en: "Who created lacrosse?", fr: "Qui a créé la crosse?" }, options: [{ en: "Indigenous peoples", fr: "Des peuples autochtones" }, { en: "British soldiers", fr: "Des soldats britanniques" }, { en: "A Montréal sports club", fr: "Un club sportif de Montréal" }], answer: 0, why: { en: "Lacrosse is an Indigenous game, played long before Confederation.", fr: "La crosse est un jeu autochtone, joué bien avant la Confédération." } },
      { q: { en: "What did the 1994 law make lacrosse?", fr: "Que la loi de 1994 a-t-elle fait de la crosse?" }, options: [{ en: "Canada's national summer sport", fr: "Le sport national d'été du Canada" }, { en: "An Olympic sport", fr: "Un sport olympique" }, { en: "The national winter sport", fr: "Le sport national d'hiver" }], answer: 0, why: { en: "The National Sports of Canada Act named lacrosse the summer sport and hockey the winter sport.", fr: "La Loi sur les sports nationaux nomme la crosse sport d'été et le hockey sport d'hiver." } },
      { q: { en: "What is lacrosse called in Mohawk?", fr: "Comment appelle-t-on la crosse en mohawk?" }, options: [{ en: "Tewaarathon", fr: "Tewaarathon" }, { en: "Babiche", fr: "Babiche" }, { en: "Portage", fr: "Portage" }], answer: 0, why: { en: "Tewaarathon is the Mohawk name for the game.", fr: "Tewaarathon est le nom mohawk du jeu." } },
    ],
    sources: [
      { title: "The Canadian Encyclopedia: Lacrosse", url: "https://www.thecanadianencyclopedia.ca/en/article/lacrosse" },
      { title: "National Sports of Canada Act (S.C. 1994, c. 16)", url: "https://laws-lois.justice.gc.ca/eng/acts/N-16.7/page-1.html" },
    ],
  },
  {
    id: "telephone", n: 4, wing: "gifts",
    title: { en: "The telephone", fr: "Le téléphone" },
    place: { en: "Brantford, Ontario", fr: "Brantford (Ontario)" },
    img: img("telephone"),
    alt: { en: "AI-generated image: a Victorian study with a fireplace, an oil lamp and early electrical apparatus on a desk.", fr: "Image générée par IA : un bureau victorien avec un foyer, une lampe à huile et des appareils électriques anciens." },
    facts: [
      { en: "At his parents' home in Brantford, now the Bell Homestead, Alexander Graham Bell conceived the idea of the telephone on 26 July 1874.", fr: "Chez ses parents à Brantford, aujourd'hui le domaine Bell, Alexander Graham Bell a conçu l'idée du téléphone le 26 juillet 1874." },
      { en: "On 10 August 1876 he made the world's first long-distance call, between Brantford and Paris, Ontario.", fr: "Le 10 août 1876, il a fait le premier appel interurbain au monde, entre Brantford et Paris (Ontario)." },
      { en: "Brantford is still called \"The Telephone City\". The homestead is a National Historic Site.", fr: "Brantford est encore surnommée « la ville du téléphone ». Le domaine est un lieu historique national." },
    ],
    quiz: [
      { q: { en: "Where did Bell conceive the telephone in 1874?", fr: "Où Bell a-t-il conçu le téléphone en 1874?" }, options: [{ en: "His parents' home in Brantford, Ontario", fr: "Chez ses parents, à Brantford (Ontario)" }, { en: "A lab in London", fr: "Un laboratoire à Londres" }, { en: "Halifax harbour", fr: "Le port d'Halifax" }], answer: 0, why: { en: "The Bell Homestead in Brantford is where the idea took shape in July 1874.", fr: "C'est au domaine Bell, à Brantford, que l'idée a pris forme en juillet 1874." } },
      { q: { en: "The first long-distance call in 1876 linked Brantford with…", fr: "Le premier appel interurbain de 1876 reliait Brantford à…" }, options: [{ en: "Paris, Ontario", fr: "Paris (Ontario)" }, { en: "Paris, France", fr: "Paris (France)" }, { en: "Toronto", fr: "Toronto" }], answer: 0, why: { en: "Paris, Ontario, a nearby town, was on the other end of the line on 10 August 1876.", fr: "Paris (Ontario), une ville voisine, était à l'autre bout du fil le 10 août 1876." } },
      { q: { en: "What is Brantford's nickname?", fr: "Quel est le surnom de Brantford?" }, options: [{ en: "The Telephone City", fr: "La ville du téléphone" }, { en: "The Forest City", fr: "La ville forestière" }, { en: "The Steel City", fr: "La ville de l'acier" }], answer: 0, why: { en: "Because the telephone was conceived and first tested at long distance there.", fr: "Parce que le téléphone y a été conçu et testé pour la première fois à distance." } },
    ],
    sources: [
      { title: "City of Brantford: Bell Homestead history", url: "https://www.brantford.ca/things-to-do/arts-and-culture/museums-and-galleries/bell-homestead/history/" },
      { title: "Parks Canada: Bell Homestead National Historic Site", url: "https://www.pc.gc.ca/apps/dfhd/page_nhs_eng.aspx?id=1772" },
    ],
  },
  {
    id: "insulin", n: 5, wing: "gifts",
    title: { en: "Insulin", fr: "L'insuline" },
    place: { en: "University of Toronto", fr: "Université de Toronto" },
    img: img("insulin"),
    alt: { en: "AI-generated image: a 1920s laboratory with glassware, scales and shelves of bottles.", fr: "Image générée par IA : un laboratoire des années 1920 avec de la verrerie, des balances et des étagères de flacons." },
    facts: [
      { en: "In 1921–22 a University of Toronto team, Frederick Banting, Charles Best, J.B. Collip and J.J.R. Macleod, discovered insulin.", fr: "En 1921-1922, une équipe de l'Université de Toronto, Frederick Banting, Charles Best, J.B. Collip et J.J.R. Macleod, a découvert l'insuline." },
      { en: "On 23 January 1922, Leonard Thompson, a teenager with diabetes, became the first patient treated successfully.", fr: "Le 23 janvier 1922, Leonard Thompson, un adolescent diabétique, est devenu le premier patient traité avec succès." },
      { en: "Banting and Macleod received the 1923 Nobel Prize. Insulin turned type 1 diabetes from a death sentence into a condition people live with.", fr: "Banting et Macleod ont reçu le prix Nobel de 1923. L'insuline a fait du diabète de type 1, autrefois mortel, une maladie avec laquelle on vit." },
    ],
    quiz: [
      { q: { en: "Where was insulin discovered?", fr: "Où l'insuline a-t-elle été découverte?" }, options: [{ en: "University of Toronto", fr: "Université de Toronto" }, { en: "McGill University", fr: "Université McGill" }, { en: "Oxford University", fr: "Université d'Oxford" }], answer: 0, why: { en: "The work was done at the University of Toronto in 1921–22.", fr: "Le travail a été fait à l'Université de Toronto en 1921-1922." } },
      { q: { en: "Who was the first patient treated successfully?", fr: "Qui a été le premier patient traité avec succès?" }, options: [{ en: "Leonard Thompson", fr: "Leonard Thompson" }, { en: "Charles Best", fr: "Charles Best" }, { en: "Frederick Banting", fr: "Frederick Banting" }], answer: 0, why: { en: "Leonard Thompson responded to Collip's purer extract on 23 January 1922.", fr: "Leonard Thompson a réagi à l'extrait purifié de Collip le 23 janvier 1922." } },
      { q: { en: "What did insulin change for people with type 1 diabetes?", fr: "Qu'est-ce que l'insuline a changé pour les personnes atteintes du diabète de type 1?" }, options: [{ en: "A fatal disease became one people live with", fr: "Une maladie mortelle est devenue une maladie avec laquelle on vit" }, { en: "It cured diabetes for good", fr: "Elle a guéri le diabète pour de bon" }, { en: "It replaced the need for food", fr: "Elle a remplacé la nourriture" }], answer: 0, why: { en: "Insulin treats diabetes; it does not cure it. But it keeps people alive.", fr: "L'insuline traite le diabète sans le guérir. Mais elle permet de vivre." } },
    ],
    sources: [
      { title: "The Canadian Encyclopedia: The discovery of insulin", url: "https://www.thecanadianencyclopedia.ca/en/article/the-discovery-of-insulin" },
      { title: "University of Toronto Libraries: The discovery and early development of insulin", url: "https://collections.library.utoronto.ca/explore/insulin/about/collip" },
    ],
  },
  {
    id: "canadarm", n: 6, wing: "gifts",
    title: { en: "Canadarm", fr: "Le Canadarm" },
    place: { en: "Low Earth orbit", fr: "En orbite basse" },
    img: img("canadarm"),
    alt: { en: "AI-generated image: a white robotic arm seen through a spacecraft window above the blue Earth.", fr: "Image générée par IA : un bras robotique blanc vu par un hublot, au-dessus de la Terre bleue." },
    facts: [
      { en: "Canadarm, the Space Shuttle's robotic arm, was designed and built in Canada.", fr: "Le Canadarm, le bras robotique de la navette spatiale, a été conçu et construit au Canada." },
      { en: "It first flew on 13 November 1981, on Space Shuttle Columbia's second mission, STS-2.", fr: "Il a volé pour la première fois le 13 novembre 1981, lors de la deuxième mission de la navette Columbia, STS-2." },
      { en: "It flew 90 shuttle missions until 2011, catching satellites and helping build the International Space Station.", fr: "Il a participé à 90 missions jusqu'en 2011, attrapant des satellites et aidant à construire la Station spatiale internationale." },
    ],
    quiz: [
      { q: { en: "When did Canadarm first work in space?", fr: "Quand le Canadarm a-t-il fonctionné dans l'espace pour la première fois?" }, options: [{ en: "November 1981", fr: "Novembre 1981" }, { en: "July 1969", fr: "Juillet 1969" }, { en: "April 2001", fr: "Avril 2001" }], answer: 0, why: { en: "It was deployed on 13 November 1981 during mission STS-2.", fr: "Il a été déployé le 13 novembre 1981, pendant la mission STS-2." } },
      { q: { en: "How many shuttle missions did Canadarm fly?", fr: "À combien de missions de la navette le Canadarm a-t-il participé?" }, options: [{ en: "90", fr: "90" }, { en: "9", fr: "9" }, { en: "900", fr: "900" }], answer: 0, why: { en: "From 1981 to 2011 it flew 90 times, with all five orbiters.", fr: "De 1981 à 2011, il a volé 90 fois, avec les cinq navettes." } },
      { q: { en: "Which spacecraft carried Canadarm on its first flight?", fr: "Quel engin a emporté le Canadarm lors de son premier vol?" }, options: [{ en: "Space Shuttle Columbia", fr: "La navette Columbia" }, { en: "Apollo 11", fr: "Apollo 11" }, { en: "The International Space Station", fr: "La Station spatiale internationale" }], answer: 0, why: { en: "Columbia flew the STS-2 mission in November 1981.", fr: "Columbia effectuait la mission STS-2 en novembre 1981." } },
    ],
    sources: [
      { title: "The Canadian Encyclopedia: Canadarm", url: "https://www.thecanadianencyclopedia.ca/en/article/canadarm" },
      { title: "Canadian Space Agency: Canadarm turns 30", url: "https://www.canada.ca/en/news/archive/2011/11/canadarm-turns-30-canadian-space-agency-salutes-three-decades-industry-innovation.html" },
    ],
  },
  {
    id: "albertosaurus", n: 7, wing: "dinosaurs",
    title: { en: "Albertosaurus", fr: "Albertosaurus" },
    place: { en: "Red Deer River valley, Alberta", fr: "Vallée de la rivière Red Deer (Alberta)" },
    img: img("albertosaurus"),
    alt: { en: "AI-generated image: a large two-legged dinosaur walking along a river at sunset, seen from behind.", fr: "Image générée par IA : un grand dinosaure bipède marchant le long d'une rivière au coucher du soleil, vu de dos." },
    facts: [
      { en: "In 1884, geologist Joseph Burr Tyrrell found a skull along the Red Deer River, near today's Drumheller, while searching for coal.", fr: "En 1884, le géologue Joseph Burr Tyrrell a trouvé un crâne le long de la rivière Red Deer, près de l'actuelle Drumheller, en cherchant du charbon." },
      { en: "It was the first meat-eating dinosaur found in Canada. Albertosaurus is a close relative of Tyrannosaurus rex.", fr: "C'était le premier dinosaure carnivore découvert au Canada. L'Albertosaurus est un proche parent du Tyrannosaurus rex." },
      { en: "It was named in 1905 after Alberta, which became a province that same year. The Royal Tyrrell Museum is named after its finder.", fr: "Il a été nommé en 1905 en l'honneur de l'Alberta, devenue province la même année. Le Musée royal Tyrrell porte le nom de son découvreur." },
    ],
    quiz: [
      { q: { en: "What was Tyrrell searching for when he found the skull?", fr: "Que cherchait Tyrrell lorsqu'il a trouvé le crâne?" }, options: [{ en: "Coal", fr: "Du charbon" }, { en: "Gold", fr: "De l'or" }, { en: "Dinosaur eggs", fr: "Des œufs de dinosaure" }], answer: 0, why: { en: "He was mapping coal deposits for the Geological Survey of Canada.", fr: "Il cartographiait des gisements de charbon pour la Commission géologique du Canada." } },
      { q: { en: "Albertosaurus is named after…", fr: "L'Albertosaurus doit son nom…" }, options: [{ en: "The province of Alberta", fr: "À la province de l'Alberta" }, { en: "A scientist named Albert", fr: "À un scientifique nommé Albert" }, { en: "Mount Alberta", fr: "Au mont Alberta" }], answer: 0, why: { en: "It was named in 1905, the year Alberta became a province.", fr: "Il a été nommé en 1905, l'année où l'Alberta est devenue une province." } },
      { q: { en: "Which famous dinosaur is a close relative?", fr: "Quel dinosaure célèbre est un proche parent?" }, options: [{ en: "Tyrannosaurus rex", fr: "Le Tyrannosaurus rex" }, { en: "Triceratops", fr: "Le Triceratops" }, { en: "Stegosaurus", fr: "Le Stegosaurus" }], answer: 0, why: { en: "Both are tyrannosaurs, large meat-eaters that walked on two legs.", fr: "Ce sont deux tyrannosaures, de grands carnivores bipèdes." } },
    ],
    sources: [
      { title: "The Canadian Encyclopedia: Albertosaurus", url: "https://www.thecanadianencyclopedia.ca/en/article/albertosaurus" },
      { title: "Government of Canada: Albertosaurus (1884)", url: "https://ised-isde.canada.ca/site/science/en/educational-resources/history-geological-survey-canada-175-objects/37-albertosaurus-1884" },
    ],
  },
  {
    id: "borealopelta", n: 8, wing: "dinosaurs",
    title: { en: "Borealopelta", fr: "Borealopelta" },
    place: { en: "Near Fort McMurray, Alberta", fr: "Près de Fort McMurray (Alberta)" },
    img: img("borealopelta"),
    alt: { en: "AI-generated image: an armoured four-legged dinosaur walking in shallow water on a sandy shore.", fr: "Image générée par IA : un dinosaure cuirassé à quatre pattes marchant dans l'eau peu profonde d'une plage." },
    facts: [
      { en: "In March 2011, a shovel operator at an oil sands mine north of Fort McMurray uncovered an armoured dinosaur, a nodosaur about 110 million years old.", fr: "En mars 2011, un conducteur de pelle d'une mine de sables bitumineux au nord de Fort McMurray a mis au jour un dinosaure cuirassé, un nodosaure d'environ 110 millions d'années." },
      { en: "It is the best-preserved armoured dinosaur in the world: uncrushed, with its armour in place and skin and scales intact.", fr: "C'est le dinosaure cuirassé le mieux conservé au monde : intact, avec son armure en place, sa peau et ses écailles." },
      { en: "Its stomach still held its last meal, mostly ferns. It is on display at the Royal Tyrrell Museum in Drumheller.", fr: "Son estomac contenait encore son dernier repas, surtout des fougères. Il est exposé au Musée royal Tyrrell, à Drumheller." },
    ],
    quiz: [
      { q: { en: "How was Borealopelta found?", fr: "Comment Borealopelta a-t-il été découvert?" }, options: [{ en: "By a machine operator at a mine", fr: "Par un conducteur de machine dans une mine" }, { en: "By hikers on a beach", fr: "Par des randonneurs sur une plage" }, { en: "By satellite", fr: "Par satellite" }], answer: 0, why: { en: "A shovel operator hit it while digging at an oil sands mine in 2011.", fr: "Un conducteur de pelle l'a heurté en creusant dans une mine de sables bitumineux en 2011." } },
      { q: { en: "What was in its stomach?", fr: "Que contenait son estomac?" }, options: [{ en: "Mostly ferns", fr: "Surtout des fougères" }, { en: "Fish", fr: "Du poisson" }, { en: "Other dinosaurs", fr: "D'autres dinosaures" }], answer: 0, why: { en: "Its last meal was mainly ferns, preserved for about 110 million years.", fr: "Son dernier repas était surtout composé de fougères, conservées pendant environ 110 millions d'années." } },
      { q: { en: "What makes this fossil special?", fr: "Qu'est-ce qui rend ce fossile spécial?" }, options: [{ en: "Its armour, skin and scales are still in place", fr: "Son armure, sa peau et ses écailles sont encore en place" }, { en: "It is the biggest dinosaur ever found", fr: "C'est le plus grand dinosaure jamais trouvé" }, { en: "It was found frozen in ice", fr: "Il a été trouvé gelé dans la glace" }], answer: 0, why: { en: "It is the best-preserved armoured dinosaur known.", fr: "C'est le dinosaure cuirassé le mieux conservé connu." } },
    ],
    sources: [
      { title: "The Canadian Encyclopedia: Borealopelta", url: "https://www.thecanadianencyclopedia.ca/en/article/borealopelta" },
      { title: "CBC News: What a dinosaur's last supper reveals", url: "https://www.cbc.ca/news/science/nodosaur-borealopelta-stomach-1.5600224" },
    ],
  },
  {
    id: "dinosaur-park", n: 9, wing: "dinosaurs",
    title: { en: "Dinosaur Provincial Park", fr: "Parc provincial Dinosaur" },
    place: { en: "Southeastern Alberta, near Brooks", fr: "Sud-est de l'Alberta, près de Brooks" },
    img: img("dinosaur-park"),
    alt: { en: "AI-generated image: striped badlands and prairie at sunset.", fr: "Image générée par IA : des badlands striées et la prairie au coucher du soleil." },
    facts: [
      { en: "Dinosaur Provincial Park protects badlands and prairie along the Red Deer River in southeastern Alberta.", fr: "Le parc provincial Dinosaur protège des badlands et de la prairie le long de la rivière Red Deer, dans le sud-est de l'Alberta." },
      { en: "UNESCO named it a World Heritage Site in 1979.", fr: "L'UNESCO l'a inscrit au patrimoine mondial en 1979." },
      { en: "Its rocks hold fossils of about 35 dinosaur species from roughly 75 million years ago, when the area was a coastal plain by a shallow sea.", fr: "Ses roches renferment des fossiles d'environ 35 espèces de dinosaures datant d'environ 75 millions d'années, quand la région était une plaine côtière au bord d'une mer peu profonde." },
    ],
    quiz: [
      { q: { en: "When did the park become a UNESCO World Heritage Site?", fr: "Quand le parc a-t-il été inscrit au patrimoine mondial de l'UNESCO?" }, options: [{ en: "1979", fr: "1979" }, { en: "1905", fr: "1905" }, { en: "2011", fr: "2011" }], answer: 0, why: { en: "It was inscribed in 1979 and expanded in 1992.", fr: "Il a été inscrit en 1979 et agrandi en 1992." } },
      { q: { en: "About how old are the park's dinosaur fossils?", fr: "Quel âge ont environ les fossiles de dinosaures du parc?" }, options: [{ en: "About 75 million years", fr: "Environ 75 millions d'années" }, { en: "About 7,500 years", fr: "Environ 7 500 ans" }, { en: "About 750 million years", fr: "Environ 750 millions d'années" }], answer: 0, why: { en: "They date from the Late Cretaceous, roughly 75 million years ago.", fr: "Ils datent du Crétacé supérieur, il y a environ 75 millions d'années." } },
      { q: { en: "What kind of landscape is the park known for?", fr: "Pour quel type de paysage le parc est-il connu?" }, options: [{ en: "Badlands", fr: "Les badlands" }, { en: "Glaciers", fr: "Les glaciers" }, { en: "Rainforest", fr: "La forêt pluviale" }], answer: 0, why: { en: "Eroded badlands expose the fossil-rich rock layers.", fr: "Les badlands érodées mettent à nu des couches de roche riches en fossiles." } },
    ],
    sources: [
      { title: "UNESCO World Heritage Centre: Dinosaur Provincial Park", url: "https://whc.unesco.org/en/list/71" },
      { title: "Parks Canada: Dinosaur Provincial Park", url: "https://parks.canada.ca/culture/spm-whs/sites-canada/sec02c" },
      { title: "IUCN World Heritage Outlook: Dinosaur Provincial Park", url: "https://worldheritageoutlook.iucn.org/node/959" },
    ],
  },
];

/** Ranks in the Genie version; reused here so the two versions feel the same. */
export const RANKS: { at: number; name: Bi }[] = [
  { at: 0, name: { en: "Rookie Explorer", fr: "Explorateur débutant" } },
  { at: 2, name: { en: "Trail Scout", fr: "Éclaireur" } },
  { at: 4, name: { en: "Field Naturalist", fr: "Naturaliste de terrain" } },
  { at: 6, name: { en: "Master Voyageur", fr: "Maître voyageur" } },
  { at: 9, name: { en: "Canada Field Legend", fr: "Légende du terrain" } },
];

export const rankFor = (stamps: number) => [...RANKS].reverse().find(r => stamps >= r.at)!;
