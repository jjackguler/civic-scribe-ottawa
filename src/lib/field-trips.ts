import type { Bi } from "@/lib/i18n";

/**
 * AI Field Trips: three short lessons we built as Interactive Stories in
 * Google's Project Genie (Genie 4), then re-built here so they work without a
 * Genie account. Every answer below was checked against the linked source.
 * "Got wrong" lists only what we saw the machine do in our own sessions.
 */

export type Choice = { text: Bi; correct?: boolean };
export type Question = { stage: Bi; scene: Bi; q: Bi; choices: Choice[]; why: Bi };
/** A sentence for the spot-the-mistake game. `machine` marks the ones Genie produced; `wrong` marks the false ones. */
export type Claim = { text: Bi; machine: boolean; wrong: boolean; note: Bi };
export type TripSource = { title: string; url: string; covers: Bi };

export type Trip = {
  slug: string;
  n: number;
  title: Bi;
  place: Bi;
  dek: Bi;
  subject: Bi;
  ages: Bi;
  minutes: number;
  /** Background tone for the trip's cover band. */
  tone: "mars" | "forest" | "harbour";
  questions: Question[];
  claims: Claim[];
  gotWrong: Bi[];
  classroom: Bi[];
  tryAtHome?: Bi;
  sources: TripSource[];
  /** Filled in once the Genie session recording is on our CDN. */
  video?: string;
  poster?: string;
  recorded: Bi;
};

export const TRIPS: Trip[] = [
  {
    slug: "mars",
    n: 1,
    title: { en: "A day on Mars", fr: "Une journée sur Mars" },
    place: { en: "Gale Crater, Mars", fr: "Cratère Gale, Mars" },
    dek: {
      en: "Walk a red plain, jump in low gravity and wait for a sunset that turns blue. Three questions, one planet.",
      fr: "Marchez sur une plaine rouge, sautez en faible gravité et attendez un coucher de soleil qui devient bleu. Trois questions, une planète.",
    },
    subject: { en: "Space science", fr: "Sciences de l'espace" },
    ages: { en: "Ages 9 and up", fr: "9 ans et plus" },
    minutes: 10,
    tone: "mars",
    recorded: { en: "Recorded in Project Genie (Genie 4), November 2026", fr: "Enregistré dans Project Genie (Genie 4), novembre 2026" },
    questions: [
      {
        stage: { en: "Stage 1 · The jump", fr: "Étape 1 · Le saut" },
        scene: { en: "You land on a dusty plain and try a standing jump.", fr: "Vous atterrissez sur une plaine poussiéreuse et tentez un saut sur place." },
        q: { en: "Why do you jump so much higher on Mars?", fr: "Pourquoi sautez-vous beaucoup plus haut sur Mars?" },
        choices: [
          { text: { en: "Its gravity is about 38% of Earth's", fr: "Sa gravité est d'environ 38 % de celle de la Terre" }, correct: true },
          { text: { en: "There is no gravity on Mars", fr: "Il n'y a pas de gravité sur Mars" } },
          { text: { en: "The thin air pushes you up", fr: "L'air mince vous pousse vers le haut" } },
        ],
        why: {
          en: "Mars is smaller and lighter than Earth, so it pulls on you about 38% as hard. Something that weighs 100 kg on Earth would feel like 38 kg there. There is still gravity: you come back down, just slowly.",
          fr: "Mars est plus petite et plus légère que la Terre, alors elle vous attire environ 38 % aussi fort. Ce qui pèse 100 kg sur Terre en paraîtrait 38 là-bas. La gravité existe toujours : vous retombez, simplement plus lentement.",
        },
      },
      {
        stage: { en: "Stage 2 · The air", fr: "Étape 2 · L'air" },
        scene: { en: "You check your suit's air gauge before stepping outside the rover.", fr: "Vous vérifiez la jauge d'air de votre combinaison avant de sortir du rover." },
        q: { en: "Why do you need a pressurized suit to breathe?", fr: "Pourquoi faut-il une combinaison pressurisée pour respirer?" },
        choices: [
          { text: { en: "The air is mostly oxygen but too cold", fr: "L'air est surtout de l'oxygène, mais trop froid" } },
          { text: { en: "The air is very thin and about 95% carbon dioxide", fr: "L'air est très mince et composé à 95 % environ de gaz carbonique" }, correct: true },
          { text: { en: "Mars has no air at all", fr: "Mars n'a pas d'air du tout" } },
        ],
        why: {
          en: "Mars does have an atmosphere, but its surface pressure is less than 1% of Earth's, and it is about 95% carbon dioxide. Too thin and the wrong gas: you need your own air and your own pressure.",
          fr: "Mars a bien une atmosphère, mais la pression au sol est inférieure à 1 % de celle de la Terre, et elle est composée à 95 % environ de gaz carbonique. Trop mince et le mauvais gaz : il faut apporter son air et sa pression.",
        },
      },
      {
        stage: { en: "Stage 3 · The sunset", fr: "Étape 3 · Le coucher de soleil" },
        scene: { en: "The Sun drops toward the crater rim. The sky around it changes colour.", fr: "Le Soleil descend vers le bord du cratère. Le ciel autour de lui change de couleur." },
        q: { en: "What colour is a sunset on Mars, close to the Sun?", fr: "De quelle couleur est un coucher de soleil sur Mars, près du Soleil?" },
        choices: [
          { text: { en: "Bright orange, like on Earth", fr: "Orange vif, comme sur Terre" } },
          { text: { en: "Blue", fr: "Bleu" }, correct: true },
          { text: { en: "Green", fr: "Vert" } },
        ],
        why: {
          en: "By day the Martian sky looks butterscotch, but near the setting Sun it turns blue. NASA explains that the very fine dust in the air lets blue light get through the atmosphere more easily than other colours, so blue gathers around the Sun.",
          fr: "Le jour, le ciel martien paraît caramel, mais près du Soleil couchant il devient bleu. La NASA explique que la poussière très fine laisse passer la lumière bleue plus facilement que les autres couleurs, et le bleu se concentre autour du Soleil.",
        },
      },
    ],
    claims: [
      {
        text: { en: "“The blue sunset comes from Rayleigh scattering, the same thing that makes Earth's sky blue.”", fr: "« Le coucher de soleil bleu vient de la diffusion de Rayleigh, comme le ciel bleu de la Terre. »" },
        machine: true, wrong: true,
        note: { en: "Genie's explanation. On Mars it is the fine dust, not the gas, that sends blue light forward toward your eye. Rayleigh scattering by air molecules is why Earth's daytime sky is blue.", fr: "L'explication de Genie. Sur Mars, c'est la poussière fine, pas le gaz, qui envoie la lumière bleue vers l'œil. La diffusion de Rayleigh par les molécules d'air explique le ciel bleu de jour sur Terre." },
      },
      {
        text: { en: "A day on Mars lasts about 24 hours and 40 minutes.", fr: "Une journée sur Mars dure environ 24 heures et 40 minutes." },
        machine: false, wrong: false,
        note: { en: "True: 24 h 39 min 35 s, according to NASA JPL.", fr: "Vrai : 24 h 39 min 35 s, selon le JPL de la NASA." },
      },
      {
        text: { en: "Mars's surface pressure is less than 1% of Earth's.", fr: "La pression au sol de Mars est inférieure à 1 % de celle de la Terre." },
        machine: false, wrong: false,
        note: { en: "True, according to NASA JPL.", fr: "Vrai, selon le JPL de la NASA." },
      },
      {
        text: { en: "The rover parked beside you stays where you left it.", fr: "Le rover garé à côté de vous reste là où vous l'avez laissé." },
        machine: true, wrong: true,
        note: { en: "Not in Genie: our rover vanished when we looked away and came back somewhere else. World models forget what is out of view.", fr: "Pas dans Genie : notre rover a disparu quand nous avons détourné le regard, puis il est revenu ailleurs. Les modèles de monde oublient ce qui est hors champ." },
      },
    ],
    gotWrong: [
      { en: "We asked twice for a blue twilight. Genie kept the sky orange every time.", fr: "Nous avons demandé deux fois un crépuscule bleu. Genie a gardé le ciel orange à chaque fois." },
      { en: "Its explanation of the blue sunset named Rayleigh scattering. NASA credits the fine dust.", fr: "Son explication du coucher bleu citait la diffusion de Rayleigh. La NASA l'attribue à la poussière fine." },
      { en: "The rover appeared, disappeared and reappeared in a new spot as the camera turned.", fr: "Le rover apparaissait, disparaissait et revenait ailleurs quand la caméra tournait." },
      { en: "The first version framed everything through a helmet visor and pointed the camera at the ground. We had to ask for a fix.", fr: "La première version cadrait tout à travers une visière de casque, caméra tournée vers le sol. Il a fallu demander une correction." },
    ],
    classroom: [
      { en: "If you weigh 40 kg on Earth, how heavy would you feel on Mars? (Hint: 38%.)", fr: "Si vous pesez 40 kg sur Terre, quel poids ressentiriez-vous sur Mars? (Indice : 38 %.)" },
      { en: "A Mars day is about 40 minutes longer than ours. After 30 days, how far behind would an Earth clock be?", fr: "Une journée martienne dure environ 40 minutes de plus. Après 30 jours, de combien une horloge terrestre serait-elle décalée?" },
      { en: "The machine got the sunset wrong even when asked. Why might a model trained on Earth photos struggle with Mars?", fr: "La machine s'est trompée sur le coucher de soleil, même sur demande. Pourquoi un modèle entraîné sur des photos de la Terre aurait-il du mal avec Mars?" },
    ],
    sources: [
      { title: "NASA JPL, “Mars at a glance” (InSight press kit)", url: "https://www.jpl.nasa.gov/news/press_kits/insight/launch/facts/mars-at-a-glance", covers: { en: "Gravity 38%, pressure under 1%, 95% carbon dioxide, length of a day", fr: "Gravité 38 %, pression sous 1 %, 95 % de gaz carbonique, durée du jour" } },
      { title: "NASA Scientific Visualization Studio, “Blue sunset on Mars”", url: "https://svs.gsfc.nasa.gov/11875", covers: { en: "Why sunsets on Mars look blue", fr: "Pourquoi les couchers de soleil martiens sont bleus" } },
    ],
  },
  {
    slug: "ant-sized",
    n: 2,
    title: { en: "Ant-sized: a day on the forest floor", fr: "À taille de fourmi : une journée au ras du sol" },
    place: { en: "A forest floor, from 5 mm up", fr: "Un sous-bois, vu à 5 mm du sol" },
    dek: {
      en: "Shrink down, follow a trail of worker ants to a crumb, then meet a honeybee with news of flowers. Three questions about how tiny animals talk.",
      fr: "Rapetissez, suivez une file de fourmis jusqu'à une miette, puis croisez une abeille qui annonce des fleurs. Trois questions sur la façon dont les petites bêtes communiquent.",
    },
    subject: { en: "Biology", fr: "Biologie" },
    ages: { en: "Ages 8 and up", fr: "8 ans et plus" },
    minutes: 10,
    tone: "forest",
    recorded: { en: "Recorded in Project Genie (Genie 4), November 2026", fr: "Enregistré dans Project Genie (Genie 4), novembre 2026" },
    questions: [
      {
        stage: { en: "Stage 1 · The trail", fr: "Étape 1 · La piste" },
        scene: { en: "A line of ants marches through the grass toward a fallen crumb.", fr: "Une file de fourmis traverse l'herbe vers une miette tombée." },
        q: { en: "How do the ants all find the same path?", fr: "Comment les fourmis trouvent-elles toutes le même chemin?" },
        choices: [
          { text: { en: "They remember a map of the forest", fr: "Elles retiennent une carte de la forêt" } },
          { text: { en: "They follow a scent trail left by other ants", fr: "Elles suivent une piste d'odeur laissée par d'autres fourmis" }, correct: true },
          { text: { en: "The queen tells each one by sound", fr: "La reine prévient chacune par le son" } },
        ],
        why: {
          en: "A scout that finds food lays a chemical trail, a pheromone, on its way back to the nest. Workers follow that scent to the food, and add to it as they go, so a good path gets stronger.",
          fr: "L'éclaireuse qui trouve de la nourriture dépose une piste chimique, une phéromone, en rentrant au nid. Les ouvrières suivent cette odeur et la renforcent en passant, si bien qu'un bon chemin devient de plus en plus marqué.",
        },
      },
      {
        stage: { en: "Stage 2 · The heavy lift", fr: "Étape 2 · Le gros fardeau" },
        scene: { en: "One ant lifts a piece of crumb many times its size.", fr: "Une fourmi soulève un morceau de miette bien plus gros qu'elle." },
        q: { en: "Which part of the ant takes the strain when it carries food in its jaws?", fr: "Quelle partie de la fourmi supporte l'effort quand elle porte la nourriture dans ses mandibules?" },
        choices: [
          { text: { en: "Its neck joint", fr: "L'articulation du cou" }, correct: true },
          { text: { en: "Its antennae", fr: "Les antennes" } },
          { text: { en: "Its back legs only", fr: "Seulement les pattes arrière" } },
        ],
        why: {
          en: "Engineers at Ohio State tested ant necks and found they could take about 3,400 to 5,000 times the ant's body weight before failing. The soft joint between head and body does the heavy work.",
          fr: "Des ingénieurs de l'Université d'État de l'Ohio ont testé le cou des fourmis : il résiste à environ 3 400 à 5 000 fois le poids du corps avant de céder. C'est l'articulation souple entre la tête et le corps qui fait le gros du travail.",
        },
      },
      {
        stage: { en: "Stage 3 · The bee", fr: "Étape 3 · L'abeille" },
        scene: { en: "A honeybee lands nearby, back from a field of flowers.", fr: "Une abeille se pose tout près, de retour d'un champ de fleurs." },
        q: { en: "How does a honeybee tell its hive where the flowers are?", fr: "Comment une abeille indique-t-elle à la ruche où sont les fleurs?" },
        choices: [
          { text: { en: "It leads every bee there one by one", fr: "Elle y conduit chaque abeille une à une" } },
          { text: { en: "It buzzes louder for flowers that are farther away", fr: "Elle bourdonne plus fort pour les fleurs lointaines" } },
          { text: { en: "It dances: the angle points the way, the length gives the distance", fr: "Elle danse : l'angle indique la direction, la durée la distance" }, correct: true },
        ],
        why: {
          en: "Inside the dark hive, the forager does a waggle dance. The angle of the waggle run, measured from straight up, matches the angle between the Sun and the food. The longer the waggle lasts, the farther away the flowers are.",
          fr: "Dans la ruche obscure, la butineuse fait une danse frétillante. L'angle de la course, mesuré depuis la verticale, correspond à l'angle entre le Soleil et la nourriture. Plus le frétillement dure, plus les fleurs sont loin.",
        },
      },
    ],
    claims: [
      {
        text: { en: "Ant scouts lay a scent trail on the way back to the nest.", fr: "Les éclaireuses déposent une piste d'odeur en rentrant au nid." },
        machine: false, wrong: false,
        note: { en: "True: that pheromone trail is what the workers follow.", fr: "Vrai : c'est cette piste de phéromone que suivent les ouvrières." },
      },
      {
        text: { en: "The question cards appear on screen during the walk.", fr: "Les cartes de questions apparaissent à l'écran pendant la marche." },
        machine: true, wrong: true,
        note: { en: "Not in Genie's first build: it made a lovely forest with no questions at all. The second build cut the cards off on smaller screens. It took three rounds of instructions.", fr: "Pas dans la première version de Genie : une belle forêt, sans aucune question. La deuxième coupait les cartes sur les petits écrans. Il a fallu trois séries de consignes." },
      },
      {
        text: { en: "A longer waggle run means the flowers are farther away.", fr: "Une course frétillante plus longue signifie des fleurs plus lointaines." },
        machine: false, wrong: false,
        note: { en: "True. In one study NC State cites, a 2.5-second waggle meant about 2.6 km.", fr: "Vrai. Dans une étude citée par NC State, un frétillement de 2,5 secondes correspondait à environ 2,6 km." },
      },
      {
        text: { en: "An ant's neck can hold thousands of times its body weight.", fr: "Le cou d'une fourmi peut supporter des milliers de fois son poids." },
        machine: false, wrong: false,
        note: { en: "True: 3,400 to 5,000 times in the Ohio State tests.", fr: "Vrai : de 3 400 à 5 000 fois dans les essais de l'Université d'État de l'Ohio." },
      },
    ],
    gotWrong: [
      { en: "The first build had no questions at all, only a forest to walk through.", fr: "La première version n'avait aucune question, seulement une forêt à parcourir." },
      { en: "The second build hid the answer choices on smaller screens. We asked again for a centred card.", fr: "La deuxième cachait les choix de réponse sur les petits écrans. Nous avons redemandé une carte centrée." },
    ],
    classroom: [
      { en: "Put a drop of sugar water on the schoolyard and watch for 20 minutes. Does a trail form? Draw it.", fr: "Déposez une goutte d'eau sucrée dans la cour et observez 20 minutes. Une piste se forme-t-elle? Dessinez-la." },
      { en: "Make up a dance that tells a classmate where the classroom door is from your desk. What does the angle mean?", fr: "Inventez une danse qui indique à un camarade où est la porte depuis votre pupitre. Que représente l'angle?" },
      { en: "An ant carries about 5,000 times its weight at the neck. If you could, what could you lift?", fr: "Le cou d'une fourmi supporte environ 5 000 fois son poids. Si c'était votre cas, que pourriez-vous soulever?" },
    ],
    sources: [
      { title: "Science Buddies, “Ant traffic signals”", url: "https://www.sciencebuddies.org/science-fair-projects/project-ideas/Zoo_p016/zoology/ant-traffic-signals", covers: { en: "Scouts lay a pheromone trail that workers follow", fr: "Les éclaireuses déposent une piste de phéromone que suivent les ouvrières" } },
      { title: "The Ohio State University, “With their amazing necks, ants don't need high hopes to do heavy lifting” (2014)", url: "https://news.osu.edu/with-their-amazing-necks-ants-dont-need-high-hopes-to-do-heavy-lifting/", covers: { en: "Neck strength: 3,400 to 5,000 times body weight", fr: "Résistance du cou : 3 400 à 5 000 fois le poids du corps" } },
      { title: "NC State Extension, “Honey bee dance language”", url: "https://content.ces.ncsu.edu/honey-bee-dance-language", covers: { en: "Waggle dance angle and duration", fr: "Angle et durée de la danse frétillante" } },
    ],
  },
  {
    slug: "archimedes-harbour",
    n: 3,
    title: { en: "Archimedes' harbour", fr: "Le port d'Archimède" },
    place: { en: "A Mediterranean harbour, about 250 BCE", fr: "Un port méditerranéen, vers 250 av. J.-C." },
    dek: {
      en: "Why does a heavy ship float when a small stone sinks? Load a boat, watch the waterline and find the rule Archimedes wrote down.",
      fr: "Pourquoi un lourd navire flotte-t-il quand un petit caillou coule? Chargez un bateau, regardez la ligne de flottaison et trouvez la règle notée par Archimède.",
    },
    subject: { en: "Physics", fr: "Physique" },
    ages: { en: "Ages 10 and up", fr: "10 ans et plus" },
    minutes: 12,
    tone: "harbour",
    recorded: { en: "Recorded in Project Genie (Genie 4), November 2026", fr: "Enregistré dans Project Genie (Genie 4), novembre 2026" },
    questions: [
      {
        stage: { en: "Stage 1 · Stone and ship", fr: "Étape 1 · Le caillou et le navire" },
        scene: { en: "A pebble drops off the dock and sinks. Beside it, a wooden ship many tonnes heavy rides high in the water.", fr: "Un caillou tombe du quai et coule. À côté, un navire de bois de plusieurs tonnes flotte haut sur l'eau." },
        q: { en: "Why does the heavy ship float while the light pebble sinks?", fr: "Pourquoi le lourd navire flotte-t-il alors que le caillou léger coule?" },
        choices: [
          { text: { en: "Heavy things always float better", fr: "Les objets lourds flottent toujours mieux" } },
          { text: { en: "The ship's shape pushes aside a lot of water for its weight", fr: "La forme du navire déplace beaucoup d'eau pour son poids" }, correct: true },
          { text: { en: "Wind under the hull holds it up", fr: "Le vent sous la coque le soutient" } },
        ],
        why: {
          en: "It is not weight alone that matters, it is weight compared with the water pushed aside. A hollow hull takes up a lot of space, so it can push aside its own weight in water before it sinks very far. A pebble is small and dense and cannot.",
          fr: "Ce n'est pas le poids seul qui compte, mais le poids comparé à l'eau déplacée. Une coque creuse occupe beaucoup de place : elle déplace son propre poids d'eau avant de s'enfoncer beaucoup. Un caillou, petit et dense, n'y arrive pas.",
        },
      },
      {
        stage: { en: "Stage 2 · Loading the boat", fr: "Étape 2 · Le chargement" },
        scene: { en: "Dock workers carry amphorae of oil on board. The waterline creeps up the hull.", fr: "Des dockers montent des amphores d'huile à bord. La ligne de flottaison monte sur la coque." },
        q: { en: "Why does the boat sit lower in the water as it is loaded?", fr: "Pourquoi le bateau s'enfonce-t-il quand on le charge?" },
        choices: [
          { text: { en: "It must push aside more water to balance the extra weight", fr: "Il doit déplacer plus d'eau pour équilibrer le poids ajouté" }, correct: true },
          { text: { en: "The water gets lighter", fr: "L'eau devient plus légère" } },
          { text: { en: "The cargo leaks into the hull", fr: "La cargaison fuit dans la coque" } },
        ],
        why: {
          en: "A floating boat always displaces water weighing exactly as much as the boat and everything on it. Add 1 tonne of cargo and it settles until it has pushed aside 1 more tonne of water.",
          fr: "Un bateau qui flotte déplace toujours un poids d'eau exactement égal à son poids et à celui de sa charge. Ajoutez une tonne de cargaison : il s'enfonce jusqu'à déplacer une tonne d'eau de plus.",
        },
      },
      {
        stage: { en: "Stage 3 · The rule", fr: "Étape 3 · La règle" },
        scene: { en: "The boat is loaded and floating, perfectly still.", fr: "Le bateau est chargé et flotte, parfaitement immobile." },
        q: { en: "For a boat that is floating still, how does the upward push of the water compare with the boat's weight?", fr: "Pour un bateau qui flotte immobile, comment la poussée de l'eau se compare-t-elle au poids du bateau?" },
        choices: [
          { text: { en: "It is greater than the weight", fr: "Elle est plus grande que le poids" } },
          { text: { en: "It is exactly equal to the weight", fr: "Elle est exactement égale au poids" }, correct: true },
          { text: { en: "It is smaller than the weight", fr: "Elle est plus petite que le poids" } },
        ],
        why: {
          en: "This is Archimedes' principle: the buoyant force equals the weight of the water displaced. When a boat floats still, that force exactly balances the boat's weight. If it were greater, the boat would rise; if smaller, it would sink.",
          fr: "C'est le principe d'Archimède : la poussée est égale au poids de l'eau déplacée. Quand un bateau flotte immobile, elle équilibre exactement son poids. Plus grande, le bateau monterait; plus petite, il coulerait.",
        },
      },
    ],
    claims: [
      {
        text: { en: "“The buoyant force is greater than or equal to the weight of the ship.”", fr: "« La poussée est supérieure ou égale au poids du navire. »" },
        machine: true, wrong: true,
        note: { en: "Genie's answer card. For a ship floating at rest the two are exactly equal. “Greater than” would mean the ship is still rising.", fr: "La carte-réponse de Genie. Pour un navire au repos, les deux sont exactement égaux. « Supérieure » voudrait dire que le navire monte encore." },
      },
      {
        text: { en: "“The water applies an active force to the hull.”", fr: "« L'eau exerce une force active sur la coque. »" },
        machine: true, wrong: true,
        note: { en: "Genie's wording. Physics has no “active force” here: the name is buoyant force, or buoyancy.", fr: "La formulation de Genie. Il n'y a pas de « force active » en physique ici : on parle de poussée d'Archimède." },
      },
      {
        text: { en: "A floating object displaces its own weight in water.", fr: "Un objet qui flotte déplace son propre poids d'eau." },
        machine: false, wrong: false,
        note: { en: "True: that is the rule this whole lesson is built on.", fr: "Vrai : c'est la règle sur laquelle toute la leçon repose." },
      },
      {
        text: { en: "A steel ship floats because its hull is mostly air.", fr: "Un navire d'acier flotte parce que sa coque est surtout remplie d'air." },
        machine: false, wrong: false,
        note: { en: "True: the hull and the air inside it together are less dense than water.", fr: "Vrai : la coque et l'air qu'elle contient sont, ensemble, moins denses que l'eau." },
      },
    ],
    gotWrong: [
      { en: "In the first stage no ship appeared at all, only the harbour. The lesson was about a ship.", fr: "À la première étape, aucun navire n'est apparu, seulement le port. La leçon portait sur un navire." },
      { en: "Its answer card said the buoyant force is “greater than or equal to” the ship's weight. At rest, it is equal.", fr: "Sa carte-réponse disait que la poussée est « supérieure ou égale » au poids. Au repos, elle est égale." },
      { en: "It called buoyancy an “active force”, a term physics teachers do not use.", fr: "Elle parlait de « force active », un terme que les profs de physique n'utilisent pas." },
    ],
    classroom: [
      { en: "Make a ball of modelling clay and drop it in water. Now shape the same clay into a boat. What changed, and what did not?", fr: "Faites une boule de pâte à modeler et mettez-la dans l'eau. Puis donnez à la même pâte une forme de bateau. Qu'est-ce qui a changé, et qu'est-ce qui n'a pas changé?" },
      { en: "Load your clay boat with coins one at a time. Mark the waterline after each coin. Is the change the same each time?", fr: "Chargez votre bateau de pâte pièce par pièce. Marquez la ligne de flottaison après chaque pièce. Le changement est-il le même chaque fois?" },
      { en: "The machine said “greater than or equal”. Write one sentence that explains to it why that is wrong for a boat at rest.", fr: "La machine a dit « supérieure ou égale ». Écrivez une phrase qui lui explique pourquoi c'est faux pour un bateau au repos." },
    ],
    tryAtHome: {
      en: "A sink, a bowl and aluminium foil are enough. Fold the same square of foil once into a tight ball and once into a flat boat.",
      fr: "Un évier, un bol et du papier d'aluminium suffisent. Pliez le même carré une fois en boule serrée, une fois en bateau plat.",
    },
    sources: [
      { title: "Scientific American, “Bring Science Home: How metal boats float”", url: "https://www.scientificamerican.com/article/bring-science-home-how-metal-boats-float/", covers: { en: "A floating object displaces its own weight of water; the foil boat experiment", fr: "Un objet qui flotte déplace son propre poids d'eau; l'expérience du bateau d'aluminium" } },
    ],
  },
];

export const tripBySlug = (slug: string) => TRIPS.find(t => t.slug === slug);

export const FIELD_TRIPS = {
  title: { en: "AI Field Trips", fr: "Sorties scientifiques IA" } as Bi,
  dek: {
    en: "Three short lessons we built inside a world model: Mars, the forest floor and an ancient harbour. Play the questions here, then spot what the machine got wrong.",
    fr: "Trois courtes leçons créées dans un modèle de monde : Mars, le ras du sol et un port antique. Répondez aux questions ici, puis repérez les erreurs de la machine.",
  } as Bi,
};
