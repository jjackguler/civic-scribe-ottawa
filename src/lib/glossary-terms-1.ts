/** Glossary, part 1: the basics and the first half of "how models work". Written by AI Broadsheet. */
import type { GlossaryTerm } from "./glossary";

export const TERMS: GlossaryTerm[] = [
  {
    slug: "artificial-intelligence",
    term: { en: "Artificial intelligence (AI)", fr: "Intelligence artificielle (IA)" },
    aka: { en: "AI", fr: "IA" },
    category: "basics",
    short: {
      en: "Artificial intelligence is the broad name for computer systems that do tasks we normally associate with human thinking: recognising speech, translating, spotting patterns, answering questions or making predictions. Today's AI does not think like a person; it learns statistical patterns from large amounts of data.",
      fr: "L'intelligence artificielle est le nom général des systèmes informatiques qui accomplissent des tâches qu'on associe d'habitude à la pensée humaine : reconnaître la parole, traduire, repérer des régularités, répondre à des questions ou faire des prédictions. L'IA d'aujourd'hui ne pense pas comme une personne; elle apprend des régularités statistiques dans de grandes quantités de données.",
    },
    kid: {
      en: "AI is software that has learned from lots of examples so it can guess good answers, a bit like a very fast pattern-spotter.",
      fr: "L'IA, c'est un logiciel qui a appris à partir de plein d'exemples pour deviner de bonnes réponses, comme un détecteur de motifs ultra rapide.",
    },
    example: {
      en: "Your phone's keyboard suggesting the next word, a bank flagging an unusual card payment and a map app predicting traffic are all everyday AI.",
      fr: "Le clavier du téléphone qui suggère le mot suivant, la banque qui signale un paiement inhabituel et l'application de cartes qui prévoit la circulation sont toutes des formes d'IA du quotidien.",
    },
    why: {
      en: "AI now helps decide what you see online, which job applications get read and how public services work. Knowing what it is, and isn't, helps you ask the right questions about fairness, privacy and who is accountable.",
      fr: "L'IA aide maintenant à décider de ce que vous voyez en ligne, des candidatures qui seront lues et du fonctionnement de services publics. Savoir ce qu'elle est, et ce qu'elle n'est pas, aide à poser les bonnes questions sur l'équité, la vie privée et la responsabilité.",
    },
    related: ["machine-learning", "generative-ai", "ai-model", "artificial-general-intelligence"],
    links: [{ labs: "start-here" }, { hub: "what-is-generative-ai" }, { learn: "ai-in-everyday-life" }],
  },
  {
    slug: "machine-learning",
    term: { en: "Machine learning", fr: "Apprentissage automatique" },
    aka: { en: "ML", fr: "AA, apprentissage machine" },
    category: "basics",
    short: {
      en: "Machine learning is the main way modern AI is built: instead of writing every rule by hand, developers show a program many examples and let it adjust itself until its outputs match. The result is a model that can handle new cases it has not seen before.",
      fr: "L'apprentissage automatique est la principale façon de bâtir l'IA moderne : au lieu d'écrire chaque règle à la main, les développeurs montrent de nombreux exemples à un programme et le laissent s'ajuster jusqu'à ce que ses résultats correspondent. On obtient un modèle capable de traiter des cas qu'il n'a jamais vus.",
    },
    kid: {
      en: "Machine learning is teaching a computer with examples instead of instructions, like learning to ride a bike by practising, not by reading a manual.",
      fr: "L'apprentissage automatique, c'est montrer des exemples à un ordinateur au lieu de lui donner des instructions, comme apprendre le vélo en pratiquant plutôt qu'en lisant un mode d'emploi.",
    },
    example: {
      en: "An email service learns to recognise spam after seeing millions of messages people marked as junk.",
      fr: "Un service de courriel apprend à reconnaître les pourriels après avoir vu des millions de messages que des gens ont signalés comme indésirables.",
    },
    why: {
      en: "A system that learns from examples also learns their gaps and prejudices. Who chose the examples, and who checked them, shapes how fairly it treats people.",
      fr: "Un système qui apprend par l'exemple apprend aussi les lacunes et les préjugés de ces exemples. Qui les a choisis, et qui les a vérifiés, détermine l'équité avec laquelle il traite les gens.",
    },
    related: ["artificial-intelligence", "deep-learning", "training-data", "supervised-learning"],
    links: [{ labs: "start-here" }],
  },
  {
    slug: "deep-learning",
    term: { en: "Deep learning", fr: "Apprentissage profond" },
    category: "basics",
    short: {
      en: "Deep learning is a kind of machine learning that uses neural networks with many layers. Each layer picks up more complex features than the one before, which is why deep learning works well on messy data such as photos, sound and language.",
      fr: "L'apprentissage profond est une forme d'apprentissage automatique qui utilise des réseaux de neurones à plusieurs couches. Chaque couche capte des caractéristiques plus complexes que la précédente, ce qui explique son efficacité sur des données désordonnées comme les photos, le son et le langage.",
    },
    kid: {
      en: "Deep learning is a stack of tiny decision-makers: the first ones spot edges, the next ones spot shapes, and the last ones say \"that's a cat\".",
      fr: "L'apprentissage profond, c'est une pile de petits décideurs : les premiers voient des contours, les suivants des formes, et les derniers disent « c'est un chat ».",
    },
    example: {
      en: "Photo apps that find every picture of your dog, and voice assistants that understand your accent, rely on deep learning.",
      fr: "Les applications photo qui retrouvent toutes les images de votre chien et les assistants vocaux qui comprennent votre accent reposent sur l'apprentissage profond.",
    },
    why: {
      en: "Deep learning made today's AI boom possible, and Canadian researchers in Toronto and Montréal were central to it. It is also hard to explain from the inside, which matters when it is used to make decisions about people.",
      fr: "L'apprentissage profond a rendu possible l'essor actuel de l'IA, et des chercheurs canadiens de Toronto et de Montréal y ont joué un rôle central. Il est aussi difficile à expliquer de l'intérieur, ce qui compte quand on l'utilise pour prendre des décisions sur des personnes.",
    },
    related: ["neural-network", "machine-learning", "transformer", "explainability"],
    links: [{ labs: "build" }],
  },
  {
    slug: "neural-network",
    term: { en: "Neural network", fr: "Réseau de neurones" },
    aka: { en: "Artificial neural network", fr: "Réseau de neurones artificiels" },
    category: "basics",
    short: {
      en: "A neural network is a mathematical structure loosely inspired by the brain: layers of simple units pass numbers to each other through weighted connections. Training adjusts those weights so the network's outputs get closer to the right answers.",
      fr: "Un réseau de neurones est une structure mathématique vaguement inspirée du cerveau : des couches d'unités simples se transmettent des nombres par des connexions pondérées. L'entraînement ajuste ces poids pour que les résultats du réseau se rapprochent des bonnes réponses.",
    },
    kid: {
      en: "A neural network is a huge web of dials that the computer keeps nudging until it gets the answers right.",
      fr: "Un réseau de neurones, c'est une immense toile de boutons de réglage que l'ordinateur tourne petit à petit jusqu'à trouver les bonnes réponses.",
    },
    example: {
      en: "When a translation app turns \"Bonjour\" into \"Hello\", a neural network with billions of tuned connections does the work.",
      fr: "Quand une application de traduction transforme « Hello » en « Bonjour », c'est un réseau de neurones aux milliards de connexions réglées qui fait le travail.",
    },
    why: {
      en: "Calling these systems \"brains\" can make them sound more human than they are. They are powerful pattern-matchers, not minds, and that framing helps keep expectations and trust realistic.",
      fr: "Appeler ces systèmes des « cerveaux » peut les faire paraître plus humains qu'ils ne le sont. Ce sont de puissants détecteurs de régularités, pas des esprits, et le rappeler aide à garder des attentes et une confiance réalistes.",
    },
    related: ["deep-learning", "parameters", "transformer", "machine-learning"],
  },
  {
    slug: "generative-ai",
    term: { en: "Generative AI", fr: "IA générative" },
    aka: { en: "GenAI", fr: "IAG" },
    category: "basics",
    short: {
      en: "Generative AI is AI that creates new content — text, images, audio, video or computer code — based on patterns learned from huge collections of existing content. You describe what you want in plain words, and it produces a new draft.",
      fr: "L'IA générative est une IA qui crée du contenu nouveau — texte, images, audio, vidéo ou code informatique — à partir de régularités apprises dans d'immenses collections de contenus existants. Vous décrivez ce que vous voulez en mots simples, et elle produit une nouvelle ébauche.",
    },
    kid: {
      en: "Generative AI is a computer that makes new stuff, like stories or pictures, after studying millions of examples.",
      fr: "L'IA générative, c'est un ordinateur qui fabrique des choses nouvelles, comme des histoires ou des images, après avoir étudié des millions d'exemples.",
    },
    example: {
      en: "Asking ChatGPT, Claude or Gemini to draft a birthday message, or asking an image tool for \"a lighthouse in a snowstorm, watercolour style\".",
      fr: "Demander à ChatGPT, Claude ou Gemini de rédiger un message d'anniversaire, ou à un outil d'images « un phare dans une tempête de neige, style aquarelle ».",
    },
    why: {
      en: "It can save hours on writing and planning, but it can also invent facts, copy styles without permission and make convincing fakes. Using it well means checking its work and being open about where you used it.",
      fr: "Elle peut faire gagner des heures de rédaction et de planification, mais elle peut aussi inventer des faits, imiter des styles sans permission et produire des faux convaincants. Bien l'utiliser, c'est vérifier son travail et dire franchement où on s'en est servi.",
    },
    related: ["large-language-model", "diffusion-model", "hallucination", "deepfake", "prompt"],
    links: [{ hub: "what-is-generative-ai" }, { labs: "start-here" }, { learn: "start-in-30-minutes" }],
  },
  {
    slug: "algorithm",
    term: { en: "Algorithm", fr: "Algorithme" },
    category: "basics",
    short: {
      en: "An algorithm is a set of step-by-step instructions for solving a problem or making a decision. Recipes are algorithms; so are the rules that rank search results or choose which posts appear in your feed.",
      fr: "Un algorithme est une suite d'instructions, étape par étape, pour résoudre un problème ou prendre une décision. Une recette est un algorithme; les règles qui classent les résultats de recherche ou choisissent les publications de votre fil aussi.",
    },
    kid: {
      en: "An algorithm is a recipe a computer follows, step by step.",
      fr: "Un algorithme, c'est une recette qu'un ordinateur suit, étape par étape.",
    },
    example: {
      en: "A video app's recommendation algorithm looks at what you watched and for how long, then picks the next video it thinks will keep you watching.",
      fr: "L'algorithme de recommandation d'une application vidéo regarde ce que vous avez visionné et combien de temps, puis choisit la prochaine vidéo qui, selon lui, vous gardera devant l'écran.",
    },
    why: {
      en: "Algorithms decide a lot quietly: prices, feeds, credit limits. You have a right to ask what a decision about you was based on, and in Canada some public-sector uses must be assessed and explained.",
      fr: "Les algorithmes décident beaucoup de choses en silence : prix, fils d'actualité, limites de crédit. Vous avez le droit de demander sur quoi reposait une décision qui vous concerne, et au Canada certains usages publics doivent être évalués et expliqués.",
    },
    related: ["ai-model", "automated-decision-making", "algorithmic-bias", "explainability"],
  },
  {
    slug: "ai-model",
    term: { en: "AI model", fr: "Modèle d'IA" },
    aka: { en: "Model", fr: "Modèle" },
    category: "basics",
    short: {
      en: "An AI model is the trained result of machine learning: a file of learned numbers plus the code that uses them to turn an input (a question, a photo) into an output (an answer, a label). Apps like chatbots are built on top of one or more models.",
      fr: "Un modèle d'IA est le résultat entraîné de l'apprentissage automatique : un fichier de nombres appris et le code qui s'en sert pour transformer une entrée (une question, une photo) en sortie (une réponse, une étiquette). Les applications comme les robots conversationnels sont bâties sur un ou plusieurs modèles.",
    },
    kid: {
      en: "A model is the \"brain file\" an AI app uses, made by training it on lots of examples.",
      fr: "Un modèle, c'est le « fichier cerveau » qu'utilise une application d'IA, fabriqué en l'entraînant sur plein d'exemples.",
    },
    example: {
      en: "GPT, Claude and Gemini are families of models; ChatGPT, Claude.ai and the Gemini app are the products you use to talk to them.",
      fr: "GPT, Claude et Gemini sont des familles de modèles; ChatGPT, Claude.ai et l'application Gemini sont les produits qui servent à leur parler.",
    },
    why: {
      en: "The same model can sit behind many apps. Knowing which model a service uses, and who made it, tells you whose rules and data practices apply.",
      fr: "Un même modèle peut se cacher derrière plusieurs applications. Savoir quel modèle un service utilise, et qui l'a créé, vous dit quelles règles et pratiques de données s'appliquent.",
    },
    related: ["large-language-model", "foundation-model", "parameters", "inference"],
    links: [{ labs: "assistants" }],
  },
  {
    slug: "training-data",
    term: { en: "Training data", fr: "Données d'entraînement" },
    category: "basics",
    short: {
      en: "Training data is the collection of examples a model learns from: text, images, recordings, numbers. Its size, quality, language mix and sources largely decide what the model is good at and what it gets wrong.",
      fr: "Les données d'entraînement sont l'ensemble des exemples dont un modèle apprend : textes, images, enregistrements, chiffres. Leur taille, leur qualité, leur mélange de langues et leurs sources décident en grande partie de ce que le modèle réussit et de ce qu'il rate.",
    },
    kid: {
      en: "Training data is the giant pile of examples an AI studies before it can do anything.",
      fr: "Les données d'entraînement, c'est l'énorme pile d'exemples qu'une IA étudie avant de pouvoir faire quoi que ce soit.",
    },
    example: {
      en: "A model trained mostly on English web pages will usually write better English than French, and may know little about life in small Canadian towns.",
      fr: "Un modèle entraîné surtout sur des pages Web anglaises écrira généralement mieux en anglais qu'en français, et connaîtra peut-être mal la vie dans les petites villes canadiennes.",
    },
    why: {
      en: "Training data raises hard questions: was it collected with permission, does it include personal information, and whose voices are missing? Courts and regulators in several countries are now weighing in.",
      fr: "Les données d'entraînement soulèvent des questions difficiles : ont-elles été recueillies avec permission, contiennent-elles des renseignements personnels, et quelles voix manquent? Des tribunaux et des régulateurs de plusieurs pays se penchent maintenant sur la question.",
    },
    related: ["data-labelling", "synthetic-data", "algorithmic-bias", "ai-and-copyright", "knowledge-cutoff"],
    links: [{ hub: "ai-and-privacy" }],
  },
  {
    slug: "artificial-general-intelligence",
    term: { en: "Artificial general intelligence (AGI)", fr: "Intelligence artificielle générale (IAG)" },
    aka: { en: "AGI, general AI", fr: "IAG, IA générale" },
    category: "basics",
    short: {
      en: "Artificial general intelligence is a hypothetical AI that could learn and perform almost any intellectual task a person can, across fields, without being specially built for each one. There is no agreed definition or test, and experts disagree sharply on whether and when it might arrive.",
      fr: "L'intelligence artificielle générale est une IA hypothétique qui pourrait apprendre et accomplir presque toute tâche intellectuelle humaine, dans tous les domaines, sans être conçue spécialement pour chacun. Il n'existe ni définition ni test reconnus, et les experts divergent fortement sur la question de savoir si elle arrivera, et quand.",
    },
    kid: {
      en: "AGI is the idea of an AI that could learn anything a person can — it doesn't exist yet, and people argue about whether it will.",
      fr: "L'IAG, c'est l'idée d'une IA capable d'apprendre tout ce qu'une personne peut apprendre — elle n'existe pas encore, et on débat pour savoir si elle existera.",
    },
    example: {
      en: "When a company says it is \"building AGI\", it is describing a goal, not a product you can use today.",
      fr: "Quand une entreprise dit qu'elle « construit l'IAG », elle décrit un objectif, pas un produit qu'on peut utiliser aujourd'hui.",
    },
    why: {
      en: "AGI claims drive investment, policy and public fear. Treat confident predictions in either direction with care, and look at what systems can actually do today.",
      fr: "Les déclarations sur l'IAG orientent les investissements, les politiques et les craintes du public. Accueillez avec prudence les prédictions trop sûres d'elles, dans un sens comme dans l'autre, et regardez ce que les systèmes font vraiment aujourd'hui.",
    },
    related: ["artificial-intelligence", "frontier-model", "ai-safety", "alignment"],
  },
  {
    slug: "frontier-model",
    term: { en: "Frontier model", fr: "Modèle de pointe" },
    aka: { en: "Frontier AI", fr: "IA de pointe, modèle de frontière" },
    category: "basics",
    short: {
      en: "A frontier model is one of the most capable general-purpose AI models available at a given time, usually built by a handful of well-funded labs using enormous computing power. Governments single them out because new abilities, and new risks, tend to appear there first.",
      fr: "Un modèle de pointe est l'un des modèles d'IA polyvalents les plus performants à un moment donné, généralement conçu par une poignée de laboratoires bien financés grâce à une énorme puissance de calcul. Les gouvernements les ciblent parce que les nouvelles capacités, et les nouveaux risques, y apparaissent souvent en premier.",
    },
    kid: {
      en: "Frontier models are the newest, most powerful AIs — the ones at the edge of what's possible right now.",
      fr: "Les modèles de pointe sont les IA les plus récentes et les plus puissantes — celles qui sont à la limite de ce qui est possible en ce moment.",
    },
    example: {
      en: "The newest top models from Anthropic, Google DeepMind, OpenAI and a few others are usually called frontier models when they launch.",
      fr: "Les plus récents grands modèles d'Anthropic, de Google DeepMind, d'OpenAI et de quelques autres sont généralement appelés modèles de pointe à leur lancement.",
    },
    why: {
      en: "Because so few organisations can build them, decisions about their safety testing and release affect millions of people. Canada, the UK, the US and others have set up AI safety institutes partly to study these models.",
      fr: "Comme très peu d'organisations peuvent les construire, leurs décisions sur les tests de sécurité et la mise en marché touchent des millions de personnes. Le Canada, le Royaume-Uni, les États-Unis et d'autres ont créé des instituts de sécurité de l'IA en partie pour étudier ces modèles.",
    },
    related: ["foundation-model", "ai-safety", "compute", "red-teaming"],
  },
  {
    slug: "data-labelling",
    term: { en: "Data labelling", fr: "Étiquetage des données" },
    aka: { en: "Data annotation", fr: "Annotation des données" },
    category: "basics",
    short: {
      en: "Data labelling is the human work of tagging examples so a model can learn from them: drawing boxes around cars in photos, marking a message as abusive, or ranking two chatbot answers. Much of it is done by contract workers around the world.",
      fr: "L'étiquetage des données est le travail humain qui consiste à annoter des exemples pour qu'un modèle puisse en apprendre : encadrer les voitures sur des photos, signaler un message comme injurieux ou classer deux réponses de robot conversationnel. Une grande partie est faite par des travailleurs contractuels partout dans le monde.",
    },
    kid: {
      en: "Data labelling is people putting name tags on examples so the AI knows what it's looking at.",
      fr: "L'étiquetage, c'est des personnes qui collent des étiquettes sur des exemples pour que l'IA sache ce qu'elle regarde.",
    },
    example: {
      en: "When a website asks you to \"click every square with a traffic light\", you may be helping label images.",
      fr: "Quand un site vous demande de « cliquer sur toutes les cases avec un feu de circulation », vous aidez peut-être à étiqueter des images.",
    },
    why: {
      en: "AI that looks automatic often rests on human labour that is low-paid and, for content moderation, sometimes distressing. Fair pay and mental-health support for these workers are part of responsible AI.",
      fr: "Une IA qui paraît automatique repose souvent sur un travail humain mal payé et, pour la modération de contenu, parfois éprouvant. Une juste rémunération et un soutien en santé mentale pour ces travailleurs font partie d'une IA responsable.",
    },
    related: ["training-data", "supervised-learning", "rlhf", "human-in-the-loop"],
  },
  {
    slug: "natural-language-processing",
    term: { en: "Natural language processing (NLP)", fr: "Traitement automatique du langage (TAL)" },
    aka: { en: "NLP", fr: "TAL, traitement du langage naturel" },
    category: "basics",
    short: {
      en: "Natural language processing is the field of AI that works with human language: understanding, translating, summarising and generating text or speech. Large language models are its best-known recent product.",
      fr: "Le traitement automatique du langage est le domaine de l'IA qui travaille avec la langue humaine : comprendre, traduire, résumer et produire du texte ou de la parole. Les grands modèles de langage en sont le produit récent le plus connu.",
    },
    kid: {
      en: "NLP is the part of AI that helps computers read, write and understand the way people talk.",
      fr: "Le TAL, c'est la partie de l'IA qui aide les ordinateurs à lire, écrire et comprendre la façon dont les gens parlent.",
    },
    example: {
      en: "Automatic captions on a video call and a tool that sorts customer emails by topic both use NLP.",
      fr: "Les sous-titres automatiques d'un appel vidéo et un outil qui trie les courriels de clients par sujet utilisent le TAL.",
    },
    why: {
      en: "Language tools work best in the languages they were trained on. French, Indigenous languages and regional accents often get less attention, which affects who is served well.",
      fr: "Les outils linguistiques fonctionnent mieux dans les langues sur lesquelles ils ont été entraînés. Le français, les langues autochtones et les accents régionaux reçoivent souvent moins d'attention, ce qui influe sur qui est bien servi.",
    },
    related: ["large-language-model", "speech-recognition", "embedding", "token"],
  },
  {
    slug: "computer-vision",
    term: { en: "Computer vision", fr: "Vision par ordinateur" },
    category: "basics",
    short: {
      en: "Computer vision is the field of AI that lets machines interpret images and video: recognising objects, reading text in photos, measuring movement. It powers everything from phone cameras to medical imaging tools.",
      fr: "La vision par ordinateur est le domaine de l'IA qui permet aux machines d'interpréter des images et des vidéos : reconnaître des objets, lire le texte d'une photo, mesurer des mouvements. Elle alimente autant l'appareil photo du téléphone que des outils d'imagerie médicale.",
    },
    kid: {
      en: "Computer vision is teaching computers to see and name what's in a picture.",
      fr: "La vision par ordinateur, c'est apprendre aux ordinateurs à voir et à nommer ce qu'il y a dans une image.",
    },
    example: {
      en: "A grocery app that reads a receipt from a photo, or a car that warns you when you drift out of your lane.",
      fr: "Une application d'épicerie qui lit un reçu à partir d'une photo, ou une voiture qui vous avertit quand vous sortez de votre voie.",
    },
    why: {
      en: "The same technology that helps doctors spot disease can be used for surveillance. Where cameras and recognition are used in public spaces is a question for democratic debate, not just engineers.",
      fr: "La même technologie qui aide les médecins à repérer une maladie peut servir à la surveillance. L'usage de caméras et de la reconnaissance dans les espaces publics relève du débat démocratique, pas seulement des ingénieurs.",
    },
    related: ["facial-recognition", "deep-learning", "multimodal-ai", "diffusion-model"],
  },
  {
    slug: "large-language-model",
    term: { en: "Large language model (LLM)", fr: "Grand modèle de langage (GML)" },
    aka: { en: "LLM", fr: "GML, LLM" },
    category: "inside",
    short: {
      en: "A large language model is an AI model trained on enormous amounts of text to predict the next piece of a sentence. Doing that very well lets it answer questions, summarise, translate and write code. It produces likely-sounding text, which is usually but not always true.",
      fr: "Un grand modèle de langage est un modèle d'IA entraîné sur d'énormes quantités de texte pour prédire la suite d'une phrase. Le faire très bien lui permet de répondre à des questions, de résumer, de traduire et d'écrire du code. Il produit un texte plausible, qui est souvent vrai, mais pas toujours.",
    },
    kid: {
      en: "An LLM is a super-powered autocomplete that has read a huge part of the internet.",
      fr: "Un GML, c'est une saisie automatique surpuissante qui a lu une énorme partie d'Internet.",
    },
    example: {
      en: "The models behind ChatGPT, Claude, Gemini, Copilot and Le Chat are all large language models.",
      fr: "Les modèles derrière ChatGPT, Claude, Gemini, Copilot et Le Chat sont tous de grands modèles de langage.",
    },
    why: {
      en: "LLMs sound fluent and confident even when wrong. Checking important facts, keeping private details out and knowing where your conversations go are the core safety habits.",
      fr: "Les GML s'expriment avec aisance et assurance même quand ils se trompent. Vérifier les faits importants, ne pas y mettre de renseignements privés et savoir où vont vos conversations sont les réflexes de sécurité essentiels.",
    },
    related: ["token", "transformer", "hallucination", "context-window", "chatbot"],
    links: [{ hub: "what-is-generative-ai" }, { hub: "use-ai-assistants-safely" }, { labs: "assistants" }],
  },
  {
    slug: "transformer",
    term: { en: "Transformer", fr: "Transformeur" },
    aka: { en: "Transformer architecture", fr: "Architecture transformeur, Transformer" },
    category: "inside",
    short: {
      en: "The transformer is the neural-network design behind most modern language and image models. Introduced by Google researchers in 2017, it uses a mechanism called attention to weigh how every word in a passage relates to every other word, all at once.",
      fr: "Le transformeur est la conception de réseau de neurones derrière la plupart des modèles de langage et d'images modernes. Présenté par des chercheurs de Google en 2017, il utilise un mécanisme appelé attention pour évaluer comment chaque mot d'un passage se rapporte à tous les autres, tous en même temps.",
    },
    kid: {
      en: "A transformer is the clever design that lets an AI look at all the words in a sentence together to figure out what they mean.",
      fr: "Un transformeur, c'est l'astucieuse conception qui permet à une IA de regarder tous les mots d'une phrase ensemble pour comprendre leur sens.",
    },
    example: {
      en: "In \"The trophy didn't fit in the suitcase because it was too big\", attention helps the model link \"it\" to the trophy.",
      fr: "Dans « Le trophée n'entrait pas dans la valise parce qu'il était trop gros », l'attention aide le modèle à relier « il » au trophée.",
    },
    why: {
      en: "The \"T\" in GPT stands for transformer. Understanding that one design powers so many products explains why they share strengths and weaknesses.",
      fr: "Le « T » de GPT signifie transformer (transformeur). Savoir qu'une seule conception alimente tant de produits explique qu'ils partagent forces et faiblesses.",
    },
    related: ["large-language-model", "neural-network", "token", "deep-learning"],
    links: [{ labs: "build" }],
  },
  {
    slug: "token",
    term: { en: "Token", fr: "Jeton" },
    category: "inside",
    short: {
      en: "A token is the small chunk of text a language model actually reads and writes — often a whole short word, part of a longer word, or a punctuation mark. Models have limits counted in tokens, and many AI services charge by the token.",
      fr: "Un jeton est le petit morceau de texte qu'un modèle de langage lit et écrit réellement — souvent un mot court entier, une partie d'un mot plus long ou un signe de ponctuation. Les modèles ont des limites comptées en jetons, et beaucoup de services d'IA facturent au jeton.",
    },
    kid: {
      en: "Tokens are the puzzle pieces an AI cuts words into before it reads them.",
      fr: "Les jetons sont les pièces de casse-tête en lesquelles une IA découpe les mots avant de les lire.",
    },
    example: {
      en: "\"Unbelievable\" might be split into \"un\", \"believ\" and \"able\". In English, 1,000 tokens is roughly 750 words; French usually needs a few more tokens for the same text.",
      fr: "« Incroyablement » pourrait être découpé en « incroy », « able » et « ment ». En anglais, 1 000 jetons font environ 750 mots; le français en demande généralement un peu plus pour le même texte.",
    },
    why: {
      en: "Because pricing and limits are counted in tokens, languages that need more tokens can cost more to serve — one reason French and other languages are sometimes treated as second-class.",
      fr: "Comme les prix et les limites se comptent en jetons, les langues qui en exigent davantage peuvent coûter plus cher à servir — une des raisons pour lesquelles le français et d'autres langues sont parfois traités en parents pauvres.",
    },
    related: ["context-window", "large-language-model", "inference", "api"],
  },
  {
    slug: "context-window",
    term: { en: "Context window", fr: "Fenêtre de contexte" },
    aka: { en: "Context length", fr: "Longueur de contexte" },
    category: "inside",
    short: {
      en: "The context window is how much text a model can take into account at once — your instructions, the conversation so far, any documents you pasted, and its own reply. It is measured in tokens. Anything beyond it is not seen.",
      fr: "La fenêtre de contexte est la quantité de texte qu'un modèle peut prendre en compte d'un coup — vos instructions, la conversation jusqu'ici, les documents collés et sa propre réponse. Elle se mesure en jetons. Ce qui la dépasse n'est pas vu.",
    },
    kid: {
      en: "The context window is the AI's short-term memory: how much of the chat it can keep in mind at one time.",
      fr: "La fenêtre de contexte, c'est la mémoire à court terme de l'IA : la quantité de conversation qu'elle peut garder en tête en même temps.",
    },
    example: {
      en: "In a very long chat, an assistant may \"forget\" a detail you gave at the start because it has slipped out of the window or been summarised.",
      fr: "Dans une très longue conversation, un assistant peut « oublier » un détail donné au début parce qu'il est sorti de la fenêtre ou a été résumé.",
    },
    why: {
      en: "A bigger window lets you work with whole contracts or reports, but it also means more of your information sits in one place. Paste only what the task needs.",
      fr: "Une fenêtre plus grande permet de travailler avec des contrats ou des rapports entiers, mais elle signifie aussi que plus de vos renseignements se trouvent au même endroit. Ne collez que ce dont la tâche a besoin.",
    },
    related: ["token", "large-language-model", "retrieval-augmented-generation", "system-prompt"],
    links: [{ labs: "prompting" }],
  },
  {
    slug: "parameters",
    term: { en: "Parameters", fr: "Paramètres" },
    aka: { en: "Weights", fr: "Poids" },
    category: "inside",
    short: {
      en: "Parameters are the internal numbers a model adjusts during training — the \"dials\" of a neural network. Large language models have billions or even trillions of them. More parameters can mean more capability, but data quality and training methods matter just as much.",
      fr: "Les paramètres sont les nombres internes qu'un modèle ajuste pendant l'entraînement — les « boutons de réglage » d'un réseau de neurones. Les grands modèles de langage en comptent des milliards, voire des billions. Plus de paramètres peut vouloir dire plus de capacités, mais la qualité des données et les méthodes d'entraînement comptent tout autant.",
    },
    kid: {
      en: "Parameters are the billions of little settings inside an AI that get tuned while it learns.",
      fr: "Les paramètres sont les milliards de petits réglages à l'intérieur d'une IA qui s'ajustent pendant qu'elle apprend.",
    },
    example: {
      en: "A \"7B\" model has about seven billion parameters — small enough to run on a good laptop.",
      fr: "Un modèle « 7B » compte environ sept milliards de paramètres — assez petit pour tourner sur un bon portable.",
    },
    why: {
      en: "Parameter counts are often used as marketing. A smaller model that runs on your own device can be the more private and cheaper choice.",
      fr: "Le nombre de paramètres sert souvent d'argument de marketing. Un modèle plus petit qui tourne sur votre propre appareil peut être le choix le plus privé et le moins cher.",
    },
    related: ["neural-network", "small-language-model", "open-weight-model", "quantization"],
  },
  {
    slug: "pre-training",
    term: { en: "Pre-training", fr: "Préentraînement" },
    category: "inside",
    short: {
      en: "Pre-training is the first, most expensive stage of building a large model: it reads a vast collection of text (or images) and learns general patterns of language and knowledge. The result is a raw model that is later shaped for specific uses.",
      fr: "Le préentraînement est la première étape, la plus coûteuse, de la construction d'un grand modèle : il parcourt une vaste collection de textes (ou d'images) et apprend les régularités générales de la langue et des connaissances. On obtient un modèle brut, façonné ensuite pour des usages précis.",
    },
    kid: {
      en: "Pre-training is the AI's giant reading marathon before it learns any manners.",
      fr: "Le préentraînement, c'est le marathon de lecture géant de l'IA avant qu'elle apprenne les bonnes manières.",
    },
    example: {
      en: "A lab may spend months and many millions of dollars of computing time pre-training one model.",
      fr: "Un laboratoire peut consacrer des mois et plusieurs millions de dollars de temps de calcul au préentraînement d'un seul modèle.",
    },
    why: {
      en: "Pre-training uses huge amounts of energy, water for cooling and data gathered from the web, which is why it is at the centre of debates about climate, copyright and privacy.",
      fr: "Le préentraînement consomme d'énormes quantités d'énergie, d'eau de refroidissement et de données tirées du Web, d'où sa place au cœur des débats sur le climat, le droit d'auteur et la vie privée.",
    },
    related: ["training-data", "fine-tuning", "compute", "foundation-model"],
  },
  {
    slug: "fine-tuning",
    term: { en: "Fine-tuning", fr: "Réglage fin" },
    aka: { en: "Fine tuning", fr: "Affinage, ajustement fin" },
    category: "inside",
    short: {
      en: "Fine-tuning is extra training on a smaller, focused set of examples to adapt a pre-trained model to a task, a style or a field — for example, legal French or a company's support tickets. It changes the model itself, unlike a prompt.",
      fr: "Le réglage fin est un entraînement supplémentaire sur un ensemble d'exemples plus petit et ciblé, pour adapter un modèle préentraîné à une tâche, un style ou un domaine — par exemple le français juridique ou les demandes de soutien d'une entreprise. Contrairement à une requête, il modifie le modèle lui-même.",
    },
    kid: {
      en: "Fine-tuning is giving an AI extra lessons in one subject so it gets really good at it.",
      fr: "Le réglage fin, c'est donner des cours particuliers à une IA dans une matière pour qu'elle y devienne vraiment bonne.",
    },
    example: {
      en: "A hospital fine-tunes a model on approved medical summaries so its drafts follow the hospital's format.",
      fr: "Un hôpital affine un modèle sur des résumés médicaux approuvés pour que ses ébauches suivent le format de l'établissement.",
    },
    why: {
      en: "Fine-tuning on personal or confidential records can leak them later. Organisations should know exactly what data went in and have a privacy assessment before they start.",
      fr: "Un réglage fin sur des dossiers personnels ou confidentiels peut les faire ressortir plus tard. Les organisations doivent savoir exactement quelles données y sont entrées et faire une évaluation de la vie privée avant de commencer.",
    },
    related: ["pre-training", "rlhf", "retrieval-augmented-generation", "foundation-model"],
    links: [{ labs: "build" }],
  },
  {
    slug: "rlhf",
    term: { en: "Reinforcement learning from human feedback (RLHF)", fr: "Apprentissage par renforcement avec rétroaction humaine (ARRH)" },
    aka: { en: "RLHF", fr: "RLHF, ARRH" },
    category: "inside",
    short: {
      en: "RLHF is a training step in which people compare or rate a model's answers, and the model is adjusted to prefer the kinds of answers people rated higher. It is a key reason chatbots are more helpful and polite than raw pre-trained models.",
      fr: "L'ARRH est une étape d'entraînement où des personnes comparent ou notent les réponses d'un modèle, qui est ensuite ajusté pour préférer le genre de réponses les mieux notées. C'est une des principales raisons pour lesquelles les robots conversationnels sont plus utiles et polis que les modèles bruts.",
    },
    kid: {
      en: "RLHF is people giving an AI thumbs up or thumbs down until it learns which answers are helpful.",
      fr: "L'ARRH, c'est des gens qui donnent des pouces en l'air ou en bas à une IA jusqu'à ce qu'elle apprenne quelles réponses sont utiles.",
    },
    example: {
      en: "When a chatbot shows you two answers and asks which is better, your choice may be used as feedback of this kind.",
      fr: "Quand un robot conversationnel vous montre deux réponses et demande laquelle est meilleure, votre choix peut servir de rétroaction de ce genre.",
    },
    why: {
      en: "Whose preferences are used shapes the model's tone and values. It can also teach a model to sound agreeable rather than be accurate, a problem researchers call sycophancy.",
      fr: "Les préférences retenues façonnent le ton et les valeurs du modèle. Cela peut aussi lui apprendre à paraître agréable plutôt qu'exact, un problème que les chercheurs appellent la complaisance.",
    },
    related: ["reinforcement-learning", "alignment", "data-labelling", "fine-tuning"],
  },
  {
    slug: "inference",
    term: { en: "Inference", fr: "Inférence" },
    category: "inside",
    short: {
      en: "Inference is the moment a trained model is used: it receives your input and computes an answer. Training happens once (or occasionally); inference happens every time anyone uses the model, so its cost and energy use add up quickly.",
      fr: "L'inférence est le moment où un modèle entraîné est utilisé : il reçoit votre entrée et calcule une réponse. L'entraînement a lieu une fois (ou de temps en temps); l'inférence se produit chaque fois que quelqu'un utilise le modèle, si bien que son coût et sa consommation d'énergie s'additionnent vite.",
    },
    kid: {
      en: "Inference is the AI actually answering you, after all its learning is done.",
      fr: "L'inférence, c'est l'IA qui te répond pour vrai, une fois tout son apprentissage terminé.",
    },
    example: {
      en: "Each time you press Send in a chatbot, a data centre runs inference to produce the reply, word by word.",
      fr: "Chaque fois que vous appuyez sur Envoyer dans un robot conversationnel, un centre de données effectue une inférence pour produire la réponse, mot par mot.",
    },
    why: {
      en: "Where inference runs — on your phone or in a distant data centre — decides where your words travel and which country's laws apply to them.",
      fr: "L'endroit où l'inférence a lieu — sur votre téléphone ou dans un centre de données éloigné — détermine où vont vos mots et quelles lois s'y appliquent.",
    },
    related: ["ai-model", "gpu", "data-centre", "small-language-model"],
  },
];
