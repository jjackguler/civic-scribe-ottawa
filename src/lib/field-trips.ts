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
  tone: "mars" | "forest" | "harbour" | "workshop" | "paris";
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
  {
    slug: "leonardos-workshop",
    n: 4,
    title: { en: "Leonardo's workshop", fr: "L'atelier de Léonard" },
    place: { en: "Milan, about 1495", fr: "Milan, vers 1495" },
    dek: {
      en: "Step into a Renaissance workshop full of sketches, gears and a flying machine hanging from the beams. Read a backwards notebook and find out why the machine never flew.",
      fr: "Entrez dans un atelier de la Renaissance plein d'esquisses, d'engrenages et d'une machine volante suspendue aux poutres. Lisez un carnet écrit à l'envers et découvrez pourquoi la machine n'a jamais volé.",
    },
    subject: { en: "History of science", fr: "Histoire des sciences" },
    ages: { en: "Ages 9 and up", fr: "9 ans et plus" },
    minutes: 10,
    tone: "workshop",
    recorded: { en: "Built in Project Genie (Genie 4), November 2026", fr: "Créé dans Project Genie (Genie 4), novembre 2026" },
    questions: [
      {
        stage: { en: "Stage 1 · The notebook", fr: "Étape 1 · Le carnet" },
        scene: { en: "You lean over an open notebook packed with tiny handwriting that seems to run the wrong way.", fr: "Vous vous penchez sur un carnet ouvert, couvert d'une écriture minuscule qui semble aller dans le mauvais sens." },
        q: { en: "How did Leonardo write in his notebooks?", fr: "Comment Léonard écrivait-il dans ses carnets?" },
        choices: [
          { text: { en: "In a secret code made of numbers", fr: "Dans un code secret fait de chiffres" } },
          { text: { en: "In mirror writing, from right to left", fr: "En écriture miroir, de droite à gauche" }, correct: true },
          { text: { en: "Only in pictures, never in words", fr: "Seulement en images, jamais en mots" } },
        ],
        why: {
          en: "His notes run from right to left with every letter reversed. The painter and writer Giorgio Vasari said they could only be read with a mirror. Hold a mirror to the page and the words turn the right way round.",
          fr: "Ses notes vont de droite à gauche, chaque lettre inversée. Le peintre et écrivain Giorgio Vasari disait qu'on ne pouvait les lire qu'avec un miroir. Placez un miroir devant la page et les mots se remettent à l'endroit.",
        },
      },
      {
        stage: { en: "Stage 2 · The birds", fr: "Étape 2 · Les oiseaux" },
        scene: { en: "Pages of wing sketches cover the table. A pigeon lands on the windowsill.", fr: "Des pages d'ailes dessinées couvrent la table. Un pigeon se pose sur le rebord de la fenêtre." },
        q: { en: "What did Leonardo study most closely to understand flight?", fr: "Qu'est-ce que Léonard a étudié de plus près pour comprendre le vol?" },
        choices: [
          { text: { en: "Birds: how they balance, steer, dive and climb", fr: "Les oiseaux : comment ils s'équilibrent, virent, plongent et remontent" }, correct: true },
          { text: { en: "Falling leaves", fr: "Les feuilles qui tombent" } },
          { text: { en: "Paper kites", fr: "Les cerfs-volants de papier" } },
        ],
        why: {
          en: "Around 1505, Leonardo filled a small notebook, now called the Codex on the Flight of Birds, with notes and drawings on how birds balance, steer, dive and climb.",
          fr: "Vers 1505, Léonard a rempli un petit carnet, aujourd'hui appelé Codex sur le vol des oiseaux, de notes et de dessins sur la façon dont les oiseaux s'équilibrent, virent, plongent et remontent.",
        },
      },
      {
        stage: { en: "Stage 3 · The machine", fr: "Étape 3 · La machine" },
        scene: { en: "You walk under a wooden model with bat-like wings hanging from the ceiling beam.", fr: "Vous passez sous une maquette de bois aux ailes de chauve-souris, suspendue à la poutre." },
        q: { en: "Could a person fly by flapping wings like these with their own muscles?", fr: "Une personne pourrait-elle voler en battant de telles ailes avec ses propres muscles?" },
        choices: [
          { text: { en: "Yes, Leonardo flew one over Milan", fr: "Oui, Léonard en a fait voler une au-dessus de Milan" } },
          { text: { en: "Yes, but only for a minute", fr: "Oui, mais seulement une minute" } },
          { text: { en: "No: human muscles are not strong enough to fly like a bird", fr: "Non : nos muscles ne sont pas assez forts pour voler comme un oiseau" }, correct: true },
        ],
        why: {
          en: "We simply do not have enough muscle power to fly like a bird with our arms. Few of Leonardo's machines were ever built, and the first controlled glider flight came centuries later, in 1853.",
          fr: "Nous n'avons tout simplement pas assez de force musculaire pour voler comme un oiseau avec nos bras. Peu des machines de Léonard ont été construites, et le premier vol plané contrôlé n'a eu lieu que des siècles plus tard, en 1853.",
        },
      },
    ],
    claims: [
      {
        text: { en: "Leonardo's notes run right to left with the letters reversed.", fr: "Les notes de Léonard vont de droite à gauche, lettres inversées." },
        machine: false, wrong: false,
        note: { en: "True, according to the Library of Congress.", fr: "Vrai, selon la Bibliothèque du Congrès." },
      },
      {
        text: { en: "Leonardo's flapping-wing machine carried him over the rooftops of Milan.", fr: "La machine à ailes battantes de Léonard l'a porté au-dessus des toits de Milan." },
        machine: false, wrong: true,
        note: { en: "False: a myth you will find online. Human muscles cannot power flapping flight.", fr: "Faux : un mythe qu'on trouve en ligne. Nos muscles ne peuvent pas assurer un vol à ailes battantes." },
      },
      {
        text: { en: "The Codex on the Flight of Birds dates from around 1505–06.", fr: "Le Codex sur le vol des oiseaux date d'environ 1505-1506." },
        machine: false, wrong: false,
        note: { en: "True, according to the Library of Congress and the Smithsonian.", fr: "Vrai, selon la Bibliothèque du Congrès et le Smithsonian." },
      },
      {
        text: { en: "A Mona Lisa hangs on the wall of Leonardo's Milan workshop in 1495.", fr: "En 1495, une Joconde est accrochée au mur de l'atelier milanais de Léonard." },
        machine: true, wrong: true,
        note: { en: "Genie drew this. The Mona Lisa was begun around 1503, years later, in Florence.", fr: "Genie a dessiné cela. La Joconde a été commencée vers 1503, des années plus tard, à Florence." },
      },
    ],
    gotWrong: [
      { en: "We asked for the artist to be seen only from behind. The first build sat him facing the camera, with an invented face.", fr: "Nous avions demandé de ne montrer l'artiste que de dos. La première version l'a assis face à la caméra, avec un visage inventé." },
      { en: "It hung the Mona Lisa on the workshop wall. In 1495 it did not exist yet: Leonardo began it around 1503.", fr: "Elle a accroché la Joconde au mur de l'atelier. En 1495, elle n'existait pas encore : Léonard l'a commencée vers 1503." },
      { en: "After the fix, a second and then a third bearded man in the same cap appeared beside the one at the desk.", fr: "Après correction, un deuxième puis un troisième homme barbu au même bonnet sont apparus à côté de celui du bureau." },
      { en: "Instead of our explanations, its answer cards said things like “Leonardo smiles broadly” and “Leonardo agrees”: scenes no source records.", fr: "Au lieu de nos explications, ses cartes-réponses disaient « Léonard sourit largement » ou « Léonard approuve » : des scènes qu'aucune source ne rapporte." },
      { en: "In the last stage, the flying machine we asked to walk under was nowhere to be seen.", fr: "À la dernière étape, la machine volante sous laquelle nous devions passer n'était nulle part." },
    ],
    classroom: [
      { en: "Write your name in mirror writing, then check it with a mirror. Why might someone write this way?", fr: "Écrivez votre nom en écriture miroir, puis vérifiez avec un miroir. Pourquoi écrirait-on ainsi?" },
      { en: "Watch a pigeon or gull for two minutes. Sketch three wing positions. What changes when it turns?", fr: "Observez un pigeon ou un goéland deux minutes. Dessinez trois positions d'ailes. Qu'est-ce qui change quand il vire?" },
      { en: "Leonardo's machine never flew, but his notes on birds were careful and useful. Is a failed invention a waste?", fr: "La machine de Léonard n'a jamais volé, mais ses notes sur les oiseaux étaient précises et utiles. Une invention ratée est-elle inutile?" },
    ],
    sources: [
      { title: "Library of Congress, “Codex on the Flight of Birds” (facsimile record)", url: "https://www.loc.gov/item/2021668201/", covers: { en: "Mirror writing, notes on bird flight, 1505–06", fr: "Écriture miroir, notes sur le vol des oiseaux, 1505-1506" } },
      { title: "Smithsonian Magazine, “Leonardo da Vinci's studies on the science of flight come to the Air and Space Museum”", url: "https://www.smithsonianmag.com/smithsonian-institution/leonardo-da-vincis-studies-on-the-science-of-flight-come-to-the-air-and-space-museum-25855594/", covers: { en: "Date of the codex and its observations on flight", fr: "Date du codex et ses observations sur le vol" } },
      { title: "Encyclopaedia Britannica, “Mona Lisa”", url: "https://www.britannica.com/topic/Mona-Lisa-painting", covers: { en: "Painted between 1503 and 1519, in Florence", fr: "Peinte entre 1503 et 1519, à Florence" } },
      { title: "The Conversation, “Leonardo da Vinci's helicopter: 15th-century flight of fancy led to modern aeronautics”", url: "https://theconversation.com/leonardo-da-vincis-helicopter-15th-century-flight-of-fancy-led-to-modern-aeronautics-116241", covers: { en: "Not enough muscle power to fly like a bird; first controlled glider flight in 1853", fr: "Pas assez de force pour voler comme un oiseau; premier vol plané contrôlé en 1853" } },
    ],
  },
  {
    slug: "bastille-1789",
    n: 5,
    title: { en: "Paris, 1789: the day the Bastille fell", fr: "Paris, 1789 : le jour où la Bastille est tombée" },
    place: { en: "Paris and Versailles, summer 1789", fr: "Paris et Versailles, été 1789" },
    dek: {
      en: "Stand in the crowd outside an old fortress on the morning the French Revolution boiled over, then hear the new rights read out six weeks later. Three questions about how a revolution starts.",
      fr: "Tenez-vous dans la foule devant une vieille forteresse, le matin où la Révolution française éclate, puis écoutez les nouveaux droits proclamés six semaines plus tard. Trois questions sur le début d'une révolution.",
    },
    subject: { en: "History and civics", fr: "Histoire et éducation civique" },
    ages: { en: "Ages 11 and up", fr: "11 ans et plus" },
    minutes: 12,
    tone: "paris",
    recorded: { en: "Built in Project Genie (Genie 4), November 2026", fr: "Créé dans Project Genie (Genie 4), novembre 2026" },
    questions: [
      {
        stage: { en: "Stage 1 · The crowd", fr: "Étape 1 · La foule" },
        scene: { en: "Morning, 14 July 1789. A crowd fills the street in front of the Bastille's high stone towers.", fr: "Matin du 14 juillet 1789. Une foule remplit la rue devant les hautes tours de pierre de la Bastille." },
        q: { en: "What were many in the crowd looking for at the Bastille?", fr: "Que cherchaient beaucoup de gens de la foule à la Bastille?" },
        choices: [
          { text: { en: "Gunpowder and ammunition", fr: "De la poudre et des munitions" }, correct: true },
          { text: { en: "Gold hidden by the king", fr: "De l'or caché par le roi" } },
          { text: { en: "Food stored for the army", fr: "Des vivres stockés pour l'armée" } },
        ],
        why: {
          en: "Troops were gathering around Paris and people feared an attack. The crowd had muskets but lacked ammunition, and the Bastille held powder. The old fortress was also hated as a symbol of royal tyranny.",
          fr: "Des troupes se massaient autour de Paris et la population craignait une attaque. La foule avait des fusils mais manquait de munitions, et la Bastille gardait de la poudre. La vieille forteresse était aussi un symbole détesté de la tyrannie royale.",
        },
      },
      {
        stage: { en: "Stage 2 · Inside the walls", fr: "Étape 2 · Derrière les murs" },
        scene: { en: "The drawbridge falls. People pour into the courtyard and open the cells.", fr: "Le pont-levis tombe. La foule envahit la cour et ouvre les cellules." },
        q: { en: "How many prisoners were found inside?", fr: "Combien de prisonniers a-t-on trouvés à l'intérieur?" },
        choices: [
          { text: { en: "About 700", fr: "Environ 700" } },
          { text: { en: "Seven", fr: "Sept" }, correct: true },
          { text: { en: "Seventy", fr: "Soixante-dix" } },
        ],
        why: {
          en: "Only seven: four forgers, a man described as insane, a young aristocrat held at his family's request and a man who had plotted against King Louis XV. The fortress mattered more as a symbol than as a prison.",
          fr: "Seulement sept : quatre faussaires, un homme jugé fou, un jeune aristocrate enfermé à la demande de sa famille et un homme qui avait comploté contre le roi Louis XV. La forteresse comptait plus comme symbole que comme prison.",
        },
      },
      {
        stage: { en: "Stage 3 · The new rights", fr: "Étape 3 · Les nouveaux droits" },
        scene: { en: "26 August 1789, Versailles. The National Assembly still sits there, beside the royal court. A new declaration is read out.", fr: "26 août 1789, Versailles. L'Assemblée nationale y siège encore, à côté de la cour royale. On lit une nouvelle déclaration." },
        q: { en: "Which ideas did the Declaration of the Rights of Man and of the Citizen put forward?", fr: "Quelles idées la Déclaration des droits de l'homme et du citoyen a-t-elle proclamées?" },
        choices: [
          { text: { en: "The king's word is law", fr: "La parole du roi fait loi" } },
          { text: { en: "Only nobles may make the laws", fr: "Seuls les nobles font les lois" } },
          { text: { en: "Liberty, equality, property and the right to resist oppression", fr: "La liberté, l'égalité, la propriété et le droit de résister à l'oppression" }, correct: true },
        ],
        why: {
          en: "The National Assembly adopted it on 26 August 1789. Its principles were liberty, equality, the inviolability of property and the right to resist oppression. Ideas like these still sit at the heart of democratic constitutions today.",
          fr: "L'Assemblée nationale l'a adoptée le 26 août 1789. Ses principes : la liberté, l'égalité, l'inviolabilité de la propriété et le droit de résister à l'oppression. Ces idées restent au cœur des constitutions démocratiques d'aujourd'hui.",
        },
      },
    ],
    claims: [
      {
        text: { en: "Hundreds of political prisoners were freed from the Bastille.", fr: "Des centaines de prisonniers politiques ont été libérés de la Bastille." },
        machine: false, wrong: true,
        note: { en: "False, though films and games often suggest it: there were seven prisoners.", fr: "Faux, même si films et jeux le laissent souvent croire : il y avait sept prisonniers." },
      },
      {
        text: { en: "The Bastille was stormed on 14 July 1789.", fr: "La Bastille a été prise le 14 juillet 1789." },
        machine: false, wrong: false,
        note: { en: "True. France's national holiday falls on that date.", fr: "Vrai. La fête nationale française tombe à cette date." },
      },
      {
        text: { en: "The Declaration of the Rights of Man was adopted on 26 August 1789.", fr: "La Déclaration des droits de l'homme a été adoptée le 26 août 1789." },
        machine: false, wrong: false,
        note: { en: "True, according to Britannica.", fr: "Vrai, selon Britannica." },
      },
    ],
    gotWrong: [
      { en: "Stage 2 was meant to be inside the fortress courtyard. Even after we asked again, the view stayed outside the walls.", fr: "L'étape 2 devait se passer dans la cour de la forteresse. Même après une nouvelle demande, la vue est restée à l'extérieur des murs." },
      { en: "The jump to stage 3, the assembly hall, crashed the stream on our first try. The simpler hall it drew next looks like a village meeting room, not the Assembly.", fr: "Le passage à l'étape 3, la salle de l'Assemblée, a fait planter le flux au premier essai. La salle plus simple dessinée ensuite ressemble à une salle de village, pas à l'Assemblée." },
      { en: "We asked for no close-up faces. While we answered the last question, the camera drifted forward on its own and stopped on an invented man's face at the speaker's desk.", fr: "Nous avions demandé qu'il n'y ait aucun gros plan de visage. Pendant que nous répondions à la dernière question, la caméra a glissé toute seule vers un homme inventé, au pupitre de l'orateur." },
    ],
    classroom: [
      { en: "The Bastille held seven prisoners, yet its fall became a national holiday. Why do symbols matter so much in history?", fr: "La Bastille ne comptait que sept prisonniers, mais sa chute est devenue une fête nationale. Pourquoi les symboles comptent-ils tant en histoire?" },
      { en: "The Declaration speaks of the rights of “man”. Who was left out in 1789? Find out what Olympe de Gouges wrote in reply.", fr: "La Déclaration parle des droits de « l'homme ». Qui était exclu en 1789? Cherchez ce qu'Olympe de Gouges a écrit en réponse." },
      { en: "Compare one article of the 1789 Declaration with Canada's Charter of Rights and Freedoms. What is the same, and what is new?", fr: "Comparez un article de la Déclaration de 1789 avec la Charte canadienne des droits et libertés. Qu'est-ce qui est pareil, qu'est-ce qui est nouveau?" },
    ],
    sources: [
      { title: "Encyclopaedia Britannica, “French Revolution: Events of 1789”", url: "https://www.britannica.com/event/French-Revolution/Events-of-1789", covers: { en: "Troops around Paris, the Bastille as a symbol, the Declaration's principles, the Assembly at Versailles until October", fr: "Troupes autour de Paris, la Bastille comme symbole, principes de la Déclaration, l'Assemblée à Versailles jusqu'en octobre" } },
      { title: "World History Encyclopedia, “Storming of the Bastille”", url: "https://www.worldhistory.org/Storming_of_the_Bastille/", covers: { en: "Ammunition and powder, the seven prisoners, 14 July 1789", fr: "Munitions et poudre, les sept prisonniers, 14 juillet 1789" } },
    ],
  },
];

export const tripBySlug = (slug: string) => TRIPS.find(t => t.slug === slug);

export const FIELD_TRIPS = {
  title: { en: "AI Field Trips", fr: "Sorties scientifiques IA" } as Bi,
  dek: {
    en: "Short lessons we built inside a world model: Mars, the forest floor, an ancient harbour, Leonardo's workshop and Paris in 1789. Play the questions here, then spot what the machine got wrong.",
    fr: "De courtes leçons créées dans un modèle de monde : Mars, le ras du sol, un port antique, l'atelier de Léonard et Paris en 1789. Répondez aux questions ici, puis repérez les erreurs de la machine.",
  } as Bi,
};
