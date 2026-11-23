/**
 * "History, rebuilt by AI": a Labs series. Each episode rebuilds one moment
 * from history with an AI tool, shows how it was made, and checks the result
 * against the record.
 *
 * Owner decision (22 Nov 2026): this series is the one place generated video
 * and stills are allowed back on the site, always labelled AI-generated, never
 * presented as archival, and never showing a real person's face.
 */
import type { Bi } from "./i18n";

export type Still = { src: string; alt: Bi; caption: Bi };
export type Person = { name: string; role: Bi; text: Bi };
export type Dated = { date: Bi; text: Bi };
export type Source = { title: string; url: string; covers: Bi };

export type Episode = {
  slug: string;
  n: number;
  title: Bi;
  dek: Bi;
  tool: string;
  recorded: string; // ISO date the AI session was recorded
  /** Session recording (mp4). Empty until the file is added. */
  video?: string;
  poster: string;
  beats: Still[];
  when: Bi;
  where: Bi;
  what: Bi[];
  people: Person[];
  timeline: Dated[];
  science: { title: Bi; flow: Bi[]; body: Bi[] };
  made: { title: Bi; body: Bi }[];
  prompt: string;
  record: Bi[];
  invented: Bi[];
  limits: { k: Bi; v: Bi }[];
  classroom: { task: Bi; questions: Bi[] };
  sources: Source[];
};

const IMG = "/labs/history/toronto-1921";

export const EPISODES: Episode[] = [
  {
    slug: "toronto-1921",
    n: 1,
    title: {
      en: "Toronto, 1921: the insulin lab",
      fr: "Toronto, 1921 : le laboratoire de l'insuline",
    },
    dek: {
      en: "We gave Google DeepMind’s Genie 4 one paragraph about the summer insulin was discovered. It built a room you can walk through, with sound, and a street outside the window. Here is the history, how the AI made it, and what it got wrong.",
      fr: "Nous avons donné un seul paragraphe à Genie 4, de Google DeepMind, sur l'été où l'insuline a été découverte. Il a bâti une pièce où l'on peut se promener, avec le son, et une rue derrière la fenêtre. Voici l'histoire, la façon dont l'IA l'a faite et ce qu'elle a inventé.",
    },
    tool: "Genie 4 (Google DeepMind, Project Genie)",
    recorded: "2026-11-22",
    video: undefined,
    poster: `${IMG}/01-lab.jpg`,
    beats: [
      {
        src: `${IMG}/03-lab-pan.jpg`,
        alt: { en: "AI-generated: a researcher in a white coat holds a test tube over glassware", fr: "Généré par IA : un chercheur en blouse blanche tient une éprouvette au-dessus de la verrerie" },
        caption: { en: "At the bench: glassware, a microscope, a chalkboard with numbers on it.", fr: "Au banc : verrerie, microscope, tableau couvert de chiffres." },
      },
      {
        src: `${IMG}/02-window.jpg`,
        alt: { en: "AI-generated: a tall sash window looking onto a street with horse-drawn carriages", fr: "Généré par IA : une grande fenêtre à guillotine donnant sur une rue avec des calèches" },
        caption: { en: "The pan to the windows. Carriages and early cars move on the street below.", fr: "Vers les fenêtres. Calèches et premières autos passent dans la rue." },
      },
      {
        src: `${IMG}/04-dissolve.jpg`,
        alt: { en: "AI-generated: the lab fading into a street scene, two images overlapping", fr: "Généré par IA : le laboratoire se fond dans une scène de rue" },
        caption: { en: "The exit. We asked it to walk out the door. It faded to the street instead.", fr: "La sortie. Nous avions demandé de franchir la porte. L'IA a fait un fondu vers la rue." },
      },
      {
        src: `${IMG}/06-carriage.jpg`,
        alt: { en: "AI-generated: a brick street with 1920s cars, a horse and cart and pedestrians", fr: "Généré par IA : une rue de brique avec des autos des années 1920, une charrette et des passants" },
        caption: { en: "The street: shop fronts, a streetcar line, hats, a horse and cart among the cars.", fr: "La rue : vitrines, rails de tramway, chapeaux, une charrette parmi les autos." },
      },
    ],
    when: {
      en: "May 1921 to January 1922. The experiments began on 17 May 1921 and ran through a very hot summer. The first patient was treated in January 1922.",
      fr: "De mai 1921 à janvier 1922. Les expériences commencent le 17 mai 1921 et se poursuivent pendant un été très chaud. Le premier patient est traité en janvier 1922.",
    },
    where: {
      en: "The University of Toronto’s Medical Building on King’s College Circle: a small, dirty upper-floor room that Banting and Best scrubbed clean before they could start. The building had no air conditioning.",
      fr: "L'édifice de médecine de l'Université de Toronto, sur King's College Circle : une petite pièce sale à l'étage, que Banting et Best ont dû récurer avant de commencer. L'édifice n'avait pas de climatisation.",
    },
    what: [
      { en: "They were looking for the substance in the pancreas that controls blood sugar.", fr: "Ils cherchaient la substance du pancréas qui règle le taux de sucre dans le sang." },
      { en: "They removed the pancreas from dogs, which then developed diabetes, and tested extracts to see if blood sugar came back down.", fr: "Ils retiraient le pancréas de chiens, qui devenaient diabétiques, puis testaient des extraits pour voir si la glycémie redescendait." },
      { en: "By early August 1921, one extract did. They first called it “isletin”; it became insulin.", fr: "Au début d'août 1921, un extrait y parvient. Ils l'appellent d'abord « isletin »; il deviendra l'insuline." },
    ],
    people: [
      { name: "Frederick Banting", role: { en: "1891–1941 · surgeon from Ontario", fr: "1891-1941 · chirurgien ontarien" }, text: { en: "A First World War surgeon in private practice who had the idea and talked his way into a lab for the summer.", fr: "Chirurgien de la Première Guerre mondiale, en pratique privée, qui a eu l'idée et a obtenu un laboratoire pour l'été." } },
      { name: "Charles Best", role: { en: "1899–1978 · student assistant", fr: "1899-1978 · étudiant assistant" }, text: { en: "Had just finished his degree in physiology and biochemistry. He won a coin toss for the summer job.", fr: "Venait de terminer son diplôme en physiologie et biochimie. Il a gagné l'emploi d'été à pile ou face." } },
      { name: "J. J. R. Macleod", role: { en: "Professor of physiology", fr: "Professeur de physiologie" }, text: { en: "Head of the department. He lent the lab, the dogs and an assistant, and directed the wider research.", fr: "Directeur du département. Il a prêté le laboratoire, les chiens et un assistant, puis dirigé la recherche." } },
      { name: "James Collip", role: { en: "Biochemist · joined in fall 1921", fr: "Biochimiste · arrivé à l'automne 1921" }, text: { en: "Came from the University of Alberta and purified the extract so it could be used in people.", fr: "Venu de l'Université de l'Alberta, il a purifié l'extrait pour qu'on puisse l'utiliser chez l'humain." } },
      { name: "Leonard Thompson", role: { en: "Age 14 · first patient", fr: "14 ans · premier patient" }, text: { en: "Treated at Toronto General Hospital in January 1922, the first person to receive insulin.", fr: "Traité à l'Hôpital général de Toronto en janvier 1922, première personne à recevoir de l'insuline." } },
    ],
    timeline: [
      { date: { en: "17 May 1921", fr: "17 mai 1921" }, text: { en: "Banting and Best begin experiments in Macleod’s department.", fr: "Banting et Best commencent leurs expériences dans le département de Macleod." } },
      { date: { en: "Summer 1921", fr: "Été 1921" }, text: { en: "A very hot summer of surgery on dogs in a small room with no air conditioning.", fr: "Un été très chaud de chirurgie sur des chiens, dans une petite pièce sans climatisation." } },
      { date: { en: "Early Aug. 1921", fr: "Début août 1921" }, text: { en: "Their pancreatic extract lowers blood sugar in diabetic dogs.", fr: "Leur extrait de pancréas fait baisser la glycémie de chiens diabétiques." } },
      { date: { en: "Fall 1921", fr: "Automne 1921" }, text: { en: "James Collip joins to purify the extract.", fr: "James Collip se joint à l'équipe pour purifier l'extrait." } },
      { date: { en: "January 1922", fr: "Janvier 1922" }, text: { en: "Leonard Thompson, 14, becomes the first person treated with insulin.", fr: "Leonard Thompson, 14 ans, est la première personne traitée à l'insuline." } },
      { date: { en: "1923", fr: "1923" }, text: { en: "Nobel Prize to Banting and Macleod, who share it with Best and Collip.", fr: "Prix Nobel à Banting et Macleod, qui le partagent avec Best et Collip." } },
    ],
    science: {
      title: { en: "What insulin does: the key that lets sugar into your cells", fr: "Ce que fait l'insuline : la clé qui fait entrer le sucre dans les cellules" },
      flow: [
        { en: "You eat", fr: "Vous mangez" },
        { en: "Sugar enters the blood", fr: "Le sucre passe dans le sang" },
        { en: "Insulin opens the cells", fr: "L'insuline ouvre les cellules" },
        { en: "Cells get energy", fr: "Les cellules ont de l'énergie" },
      ],
      body: [
        { en: "Insulin is a hormone made in the pancreas. It tells your cells to take sugar (glucose) out of the blood and use it for energy.", fr: "L'insuline est une hormone fabriquée par le pancréas. Elle dit aux cellules de prendre le sucre (glucose) dans le sang et de s'en servir comme énergie." },
        { en: "In type 1 diabetes the body stops making insulin, so sugar builds up in the blood while the cells starve. Before 1922 that was almost always fatal.", fr: "Dans le diabète de type 1, le corps ne fabrique plus d'insuline : le sucre s'accumule dans le sang pendant que les cellules manquent d'énergie. Avant 1922, c'était presque toujours mortel." },
        { en: "Insulin is not a cure, but injected insulin lets people with diabetes live full lives.", fr: "L'insuline ne guérit pas le diabète, mais l'insuline injectée permet aux personnes diabétiques de vivre pleinement." },
      ],
    },
    made: [
      { title: { en: "One paragraph of text", fr: "Un seul paragraphe" }, body: { en: "We described the room, the light, the objects, the people and the sounds. No images and no 3D models.", fr: "Nous avons décrit la pièce, la lumière, les objets, les gens et les sons. Aucune image, aucun modèle 3D." } },
      { title: { en: "An agent plans the world", fr: "Un agent planifie le monde" }, body: { en: "A Gemini model reads the request, writes a fuller scene and makes a first image. On our screen this took 55 seconds. It also suggested things to try, such as “Look out window”.", fr: "Un modèle Gemini lit la demande, rédige une scène plus complète et produit une première image. Chez nous, cela a pris 55 secondes. Il a aussi proposé des actions, comme « regarder par la fenêtre »." } },
      { title: { en: "Frame by frame, 24 times a second", fr: "Image par image, 24 fois par seconde" }, body: { en: "No 3D room is stored anywhere. Genie 4 predicts each next frame from the frames before it and from what you press, at 720p and 24 frames a second. Each key press takes a noticeable fraction of a second to show, which is why walking feels slow next to a video game.", fr: "Aucune pièce 3D n'est stockée. Genie 4 prédit chaque image à partir des précédentes et des touches pressées, en 720p à 24 images par seconde. Chaque touche met une fraction de seconde visible à agir : c'est pourquoi on avance plus lentement que dans un jeu vidéo." } },
      { title: { en: "Steering with words", fr: "Diriger avec des mots" }, body: { en: "Instead of the keyboard, we asked for a hands-free tour: a 360° look around the lab, out the door, then the street. Genie rebuilt the experience as a guided camera path.", fr: "Au lieu du clavier, nous avons demandé une visite guidée : un tour à 360° du laboratoire, la sortie, puis la rue. Genie a refait l'expérience en trajet de caméra automatique." } },
      { title: { en: "The session is the recording", fr: "La séance devient la vidéo" }, body: { en: "Project Genie saves every session as a video. Every frame carries Google’s SynthID watermark, so it can be identified as AI-made.", fr: "Project Genie enregistre chaque séance en vidéo. Chaque image porte le filigrane SynthID de Google, qui permet de la reconnaître comme générée par IA." } },
    ],
    prompt: "Summer 1921, Toronto. A cramped, authentic medical research laboratory on the second floor of the old University of Toronto Medical Building … Tall wooden sash windows are open: outside is a 1920s Toronto street with red-brick buildings, horse-drawn carriages, Ford Model T cars, a streetcar and pedestrians in hats and long dresses. Ambient sound: clinking glass, bubbling liquid, a ticking clock …",
    record: [
      { en: "Banting and Best began their experiments at the University of Toronto on 17 May 1921.", fr: "Banting et Best ont commencé leurs expériences à l'Université de Toronto le 17 mai 1921." },
      { en: "They worked in a small upper-floor room of the Medical Building on King’s College Circle.", fr: "Ils travaillaient dans une petite pièce à l'étage de l'édifice de médecine, sur King's College Circle." },
      { en: "The summer was very hot and the building had no air conditioning.", fr: "L'été était très chaud et l'édifice n'avait pas de climatisation." },
      { en: "By early August their extract lowered blood sugar in diabetic dogs.", fr: "Au début d'août, leur extrait faisait baisser la glycémie de chiens diabétiques." },
    ],
    invented: [
      { en: "The two men. Their faces, clothes and movements are made up; they are not Banting or Best, and we did not ask for real people.", fr: "Les deux hommes. Visages, vêtements et gestes sont inventés : ce ne sont pas Banting et Best, et nous n'avons pas demandé de vraies personnes." },
      { en: "The chalkboard. Some lines read like notes (“DOG 33”, “INSULIN: 2cc”); others are letter-shaped nonsense.", fr: "Le tableau. Certaines lignes ressemblent à des notes (« DOG 33 », « INSULIN: 2cc »); d'autres n'ont aucun sens." },
      { en: "The street. It looks like 1920s Toronto but is not a real block, and it is not the view from the Medical Building.", fr: "La rue. Elle ressemble au Toronto des années 1920, mais ce n'est pas un vrai pâté de maisons ni la vue de l'édifice de médecine." },
      { en: "The exit. It never walked through the door: it faded from the lab to the street.", fr: "La sortie. La caméra n'a jamais franchi la porte : elle a fait un fondu du laboratoire à la rue." },
    ],
    limits: [
      { k: { en: "2 minutes", fr: "2 minutes" }, v: { en: "Longest Genie 4 session. The picture is steadiest in roughly the first minute.", fr: "Séance Genie 4 la plus longue. L'image est la plus stable pendant environ la première minute." } },
      { k: { en: "Short memory", fr: "Mémoire courte" }, v: { en: "Look away and back, and objects may have changed.", fr: "Détournez le regard puis revenez : des objets peuvent avoir changé." } },
      { k: { en: "Not VR", fr: "Pas de RV" }, v: { en: "One flat 24 fps view with lag. A headset needs two views, far more frames and almost no delay.", fr: "Une seule vue plate à 24 images par seconde, avec un délai. Un casque exige deux vues, beaucoup plus d'images et presque aucun délai." } },
      { k: { en: "Paid access", fr: "Accès payant" }, v: { en: "Project Genie with Genie 4 is open to Google AI Ultra subscribers.", fr: "Project Genie avec Genie 4 est offert aux abonnés Google AI Ultra." } },
    ],
    classroom: {
      task: { en: "Spot the invention. Pause the video at the chalkboard, the window and the street. For each, decide: could this be real, is it clearly made up, or can’t you tell? Then compare with the “What the AI invented” list.", fr: "Repérez l'invention. Arrêtez la vidéo sur le tableau, la fenêtre et la rue. Pour chacun, décidez : est-ce plausible, clairement inventé, ou impossible à dire? Comparez ensuite avec la liste « Ce que l'IA a inventé »." },
      questions: [
        { en: "Why might a model write “INSULIN” on the board but scramble other words?", fr: "Pourquoi un modèle écrirait-il « INSULIN » au tableau, mais brouillerait-il d'autres mots?" },
        { en: "The video looks like a documentary. What tells a viewer it is not?", fr: "La vidéo ressemble à un documentaire. Qu'est-ce qui montre que ce n'en est pas un?" },
        { en: "Who should decide how historical people are shown by AI?", fr: "Qui devrait décider de la façon dont l'IA montre des personnages historiques?" },
        { en: "Where could a tool like this help a history class, and where could it mislead?", fr: "Où un tel outil peut-il aider un cours d'histoire, et où peut-il induire en erreur?" },
      ],
    },
    sources: [
      { title: "The Canadian Encyclopedia, “The Discovery of Insulin”", url: "https://www.thecanadianencyclopedia.ca/en/article/the-discovery-of-insulin", covers: { en: "Start date, Macleod’s lab and the coin toss", fr: "Date de départ, laboratoire de Macleod, pile ou face" } },
      { title: "Canada’s History, “Manufacturing Hope”", url: "https://canadashistory.ca/explore/science-technology/manufacturing-hope", covers: { en: "The upper-floor room; Collip joining in fall 1921", fr: "La pièce à l'étage; l'arrivée de Collip à l'automne 1921" } },
      { title: "University of Toronto Libraries, “Insulin 100: The Summer of 1921”", url: "https://fisherdigitus.library.utoronto.ca/exhibits/show/insulin100/summerof1921", covers: { en: "The hot summer and no air conditioning", fr: "L'été chaud, sans climatisation" } },
      { title: "University of Toronto, Connaught Fund history, “The Making of Insulin”", url: "https://connaught.research.utoronto.ca/history/article3/", covers: { en: "The extract by early August 1921; Leonard Thompson, January 1922", fr: "L'extrait au début d'août 1921; Leonard Thompson, janvier 1922" } },
      { title: "Google, “Genie 4 is now available” (Project Genie)", url: "https://blog.google/innovation-and-ai/models-and-research/google-deepmind/genie-4-now-available-project-genie/", covers: { en: "Project Genie, SynthID, access", fr: "Project Genie, SynthID, accès" } },
      { title: "Google DeepMind, “Genie 4: A new generation of world simulation”", url: "https://deepmind.google/blog/genie-4-a-new-generation-of-world-simulation/", covers: { en: "What Genie 4 is", fr: "Ce qu'est Genie 4" } },
      { title: "Unite.AI, “Google Opens Genie 4 World Generation to Gemini API Developers”", url: "https://www.unite.ai/google-opens-genie-4-world-generation-to-gemini-api-developers/", covers: { en: "720p at 24 fps, 120-second sessions, steadiest early on", fr: "720p à 24 images/s, séances de 120 secondes, plus stables au début" } },
      { title: "University College, University of Toronto, “Celebrating Charles Best”", url: "https://www.uc.utoronto.ca/news/celebrating-charles-best", covers: { en: "Best’s degree and summer job", fr: "Le diplôme et l'emploi d'été de Best" } },
    ],
  },
];

export const episodeBySlug = (slug: string) => EPISODES.find(e => e.slug === slug);

export const SERIES = {
  title: { en: "History, rebuilt by AI", fr: "L'histoire, refaite par l'IA" } as Bi,
  dek: {
    en: "Each episode takes one moment from history, rebuilds it with an AI tool, shows exactly how, and checks it against the record. Learn the history and the tool at the same time.",
    fr: "Chaque épisode reprend un moment d'histoire, le refait avec un outil d'IA, montre comment, et le compare aux faits. On apprend l'histoire et l'outil en même temps.",
  } as Bi,
};
