/** Glossary, part 2: how models work (continued). Written by AI Broadsheet. */
import type { GlossaryTerm } from "./glossary";

export const TERMS: GlossaryTerm[] = [
  {
    slug: "embedding",
    term: { en: "Embedding", fr: "Plongement" },
    aka: { en: "Vector embedding", fr: "Plongement vectoriel, embedding" },
    category: "inside",
    short: {
      en: "An embedding is a list of numbers that represents the meaning of a word, sentence, image or document, so that similar things get similar numbers. It lets software find related content by meaning rather than by exact words.",
      fr: "Un plongement est une liste de nombres qui représente le sens d'un mot, d'une phrase, d'une image ou d'un document, de sorte que des choses semblables reçoivent des nombres semblables. Il permet à un logiciel de trouver du contenu apparenté par le sens plutôt que par les mots exacts.",
    },
    kid: {
      en: "An embedding is a secret number-address for an idea, so ideas that mean the same thing live close together.",
      fr: "Un plongement, c'est une adresse secrète en chiffres pour une idée : les idées qui veulent dire la même chose habitent tout près l'une de l'autre.",
    },
    example: {
      en: "Searching a help centre for \"can't log in\" finds the article titled \"Password reset\", because their embeddings are close.",
      fr: "Chercher « impossible de me connecter » dans un centre d'aide trouve l'article intitulé « Réinitialiser le mot de passe », parce que leurs plongements sont proches.",
    },
    why: {
      en: "Embeddings make search and recommendations smarter, but they can also encode stereotypes found in the text they were built from.",
      fr: "Les plongements rendent la recherche et les recommandations plus intelligentes, mais ils peuvent aussi encoder les stéréotypes présents dans les textes dont ils sont issus.",
    },
    related: ["vector-database", "retrieval-augmented-generation", "natural-language-processing", "algorithmic-bias"],
  },
  {
    slug: "vector-database",
    term: { en: "Vector database", fr: "Base de données vectorielle" },
    category: "inside",
    short: {
      en: "A vector database stores embeddings and can quickly find the ones closest in meaning to a question. It is the usual way to give an AI assistant access to a large library of an organisation's own documents.",
      fr: "Une base de données vectorielle stocke des plongements et retrouve rapidement ceux dont le sens est le plus proche d'une question. C'est la façon habituelle de donner à un assistant IA accès à une grande bibliothèque de documents propres à une organisation.",
    },
    kid: {
      en: "A vector database is a library sorted by meaning, so the AI can grab the right pages fast.",
      fr: "Une base de données vectorielle, c'est une bibliothèque classée par sens, pour que l'IA attrape vite les bonnes pages.",
    },
    example: {
      en: "A city's 311 assistant looks up the right bylaw in a vector database before answering a resident's question.",
      fr: "L'assistant 311 d'une ville cherche le bon règlement dans une base de données vectorielle avant de répondre à la question d'un résident.",
    },
    why: {
      en: "If personal files go into a vector database, the same privacy rules apply as for any other database: limit who can query it and what it holds.",
      fr: "Si des dossiers personnels entrent dans une base de données vectorielle, les mêmes règles de confidentialité s'appliquent qu'à toute autre base : limitez qui peut l'interroger et ce qu'elle contient.",
    },
    related: ["embedding", "retrieval-augmented-generation", "grounding"],
    links: [{ labs: "build" }],
  },
  {
    slug: "retrieval-augmented-generation",
    term: { en: "Retrieval-augmented generation (RAG)", fr: "Génération augmentée par récupération (GAR)" },
    aka: { en: "RAG", fr: "RAG, GAR" },
    category: "inside",
    short: {
      en: "Retrieval-augmented generation is a technique where an AI first searches trusted sources — a company's documents, a website, a database — and then writes its answer using what it found, ideally with citations. It reduces, but does not eliminate, made-up answers.",
      fr: "La génération augmentée par récupération est une technique où l'IA cherche d'abord dans des sources fiables — documents d'une entreprise, site Web, base de données — puis rédige sa réponse à partir de ce qu'elle a trouvé, idéalement avec des références. Elle réduit les réponses inventées, sans les éliminer.",
    },
    kid: {
      en: "RAG is when the AI looks things up in a book first, then answers — like an open-book test.",
      fr: "La GAR, c'est quand l'IA cherche d'abord dans un livre avant de répondre — comme un examen à livre ouvert.",
    },
    example: {
      en: "Our own Keeper looks up today's headlines on AI Broadsheet before answering, and links to the stories it used.",
      fr: "Notre Gardien consulte les manchettes du jour d'AI Broadsheet avant de répondre et donne les liens des nouvelles utilisées.",
    },
    why: {
      en: "Answers that cite sources let you check them yourself. When a tool gives no sources, treat its claims as unverified.",
      fr: "Des réponses qui citent leurs sources vous permettent de vérifier vous-même. Quand un outil n'en donne aucune, considérez ses affirmations comme non vérifiées.",
    },
    related: ["grounding", "vector-database", "hallucination", "embedding", "context-window"],
    links: [{ labs: "build" }],
  },
  {
    slug: "diffusion-model",
    term: { en: "Diffusion model", fr: "Modèle de diffusion" },
    category: "media",
    short: {
      en: "A diffusion model is the kind of AI behind most image and video generators. It learns to turn random visual noise, step by step, into a picture that matches a text description.",
      fr: "Un modèle de diffusion est le type d'IA derrière la plupart des générateurs d'images et de vidéos. Il apprend à transformer, étape par étape, un bruit visuel aléatoire en une image correspondant à une description écrite.",
    },
    kid: {
      en: "A diffusion model starts with TV static and cleans it up, bit by bit, until a picture appears.",
      fr: "Un modèle de diffusion part de la « neige » d'une télé et la nettoie petit à petit jusqu'à ce qu'une image apparaisse.",
    },
    example: {
      en: "Typing \"a moose wearing a toque, children's book style\" into an image tool and getting four versions in seconds.",
      fr: "Taper « un orignal qui porte une tuque, style livre pour enfants » dans un outil d'images et obtenir quatre versions en quelques secondes.",
    },
    why: {
      en: "Image generators were trained on millions of artists' works, often without consent, and can produce realistic fakes. Label generated images and never pass them off as real photos.",
      fr: "Les générateurs d'images ont été entraînés sur les œuvres de millions d'artistes, souvent sans consentement, et peuvent produire des faux réalistes. Identifiez les images générées et ne les faites jamais passer pour de vraies photos.",
    },
    related: ["text-to-image", "generative-ai", "deepfake", "watermarking", "ai-and-copyright"],
  },
  {
    slug: "multimodal-ai",
    term: { en: "Multimodal AI", fr: "IA multimodale" },
    category: "inside",
    short: {
      en: "Multimodal AI can take in or produce more than one kind of information — text, images, audio, video — in the same conversation. You can show it a photo and ask a question about it out loud.",
      fr: "L'IA multimodale peut recevoir ou produire plus d'un type d'information — texte, images, audio, vidéo — dans la même conversation. Vous pouvez lui montrer une photo et lui poser une question à voix haute.",
    },
    kid: {
      en: "Multimodal AI can read, look, listen and talk, not just type.",
      fr: "L'IA multimodale peut lire, regarder, écouter et parler, pas seulement écrire.",
    },
    example: {
      en: "Photographing a confusing parking sign and asking your assistant, \"Can I park here at 6 p.m. on a Tuesday?\"",
      fr: "Photographier un panneau de stationnement déroutant et demander à votre assistant : « Puis-je me garer ici à 18 h un mardi? »",
    },
    why: {
      en: "Photos and voice carry more personal information than text: faces, locations, background details. Check what's in the frame before you share.",
      fr: "Les photos et la voix contiennent plus de renseignements personnels que le texte : visages, lieux, détails d'arrière-plan. Vérifiez ce qui est dans le cadre avant de partager.",
    },
    related: ["computer-vision", "speech-recognition", "large-language-model", "foundation-model"],
  },
  {
    slug: "foundation-model",
    term: { en: "Foundation model", fr: "Modèle de fondation" },
    aka: { en: "General-purpose AI model", fr: "Modèle d'IA à usage général" },
    category: "inside",
    short: {
      en: "A foundation model is a large, general model trained on broad data that many other products are built on, by prompting or fine-tuning it for specific jobs. Most chatbots, writing tools and coding assistants sit on a handful of foundation models.",
      fr: "Un modèle de fondation est un grand modèle général, entraîné sur des données variées, sur lequel s'appuient de nombreux autres produits, en l'adaptant à des tâches précises par des requêtes ou un réglage fin. La plupart des robots conversationnels, outils d'écriture et assistants de programmation reposent sur une poignée de modèles de fondation.",
    },
    kid: {
      en: "A foundation model is the big base that lots of different AI apps are built on top of, like the foundation of many houses.",
      fr: "Un modèle de fondation, c'est la grosse base sur laquelle on construit plein d'applications d'IA différentes, comme les fondations de plusieurs maisons.",
    },
    example: {
      en: "A tax-help app, a résumé writer and a customer-service bot might all run on the same foundation model from one company.",
      fr: "Une application d'aide fiscale, un rédacteur de CV et un robot de service à la clientèle peuvent tous tourner sur le même modèle de fondation d'une seule entreprise.",
    },
    why: {
      en: "When many services depend on a few models, one flaw or policy change spreads everywhere. The EU AI Act sets specific duties for providers of these general-purpose models.",
      fr: "Quand beaucoup de services dépendent de quelques modèles, un seul défaut ou changement de politique se propage partout. La loi européenne sur l'IA impose des obligations particulières aux fournisseurs de ces modèles à usage général.",
    },
    related: ["frontier-model", "large-language-model", "fine-tuning", "eu-ai-act"],
  },
  {
    slug: "open-weight-model",
    term: { en: "Open-weight model", fr: "Modèle à poids ouverts" },
    aka: { en: "Open model, open-source AI", fr: "Modèle ouvert, IA à code source ouvert" },
    category: "inside",
    short: {
      en: "An open-weight model is one whose trained parameters are published, so anyone can download, run and adapt it on their own hardware. Some are fully open source with training code and data; many share the weights only, under licences that may limit use.",
      fr: "Un modèle à poids ouverts est un modèle dont les paramètres entraînés sont publiés : n'importe qui peut le télécharger, le faire tourner et l'adapter sur son propre matériel. Certains sont entièrement libres, avec le code et les données d'entraînement; beaucoup ne partagent que les poids, sous des licences qui peuvent restreindre l'usage.",
    },
    kid: {
      en: "An open-weight model is an AI you're allowed to download and run on your own computer.",
      fr: "Un modèle à poids ouverts, c'est une IA qu'on a le droit de télécharger et de faire tourner sur son propre ordinateur.",
    },
    example: {
      en: "Families such as Llama, Mistral, Gemma and Qwen publish open-weight versions that hobbyists and companies run privately.",
      fr: "Des familles comme Llama, Mistral, Gemma et Qwen publient des versions à poids ouverts que des amateurs et des entreprises font tourner en privé.",
    },
    why: {
      en: "Open models let schools, hospitals and governments keep data in-house and avoid lock-in. They also make safeguards easier to remove, so the debate over openness is about real trade-offs.",
      fr: "Les modèles ouverts permettent aux écoles, hôpitaux et gouvernements de garder leurs données à l'interne et d'éviter la dépendance. Ils rendent aussi les garde-fous plus faciles à retirer : le débat sur l'ouverture porte sur de vrais compromis.",
    },
    related: ["parameters", "small-language-model", "quantization", "sovereign-ai"],
    links: [{ labs: "build" }],
  },
  {
    slug: "small-language-model",
    term: { en: "Small language model (SLM)", fr: "Petit modèle de langage" },
    aka: { en: "SLM, on-device model", fr: "Modèle embarqué, modèle local" },
    category: "inside",
    short: {
      en: "A small language model is a compact model, usually a few billion parameters or fewer, designed to run cheaply or directly on a phone or laptop. It handles focused tasks well, without sending your text to a remote server.",
      fr: "Un petit modèle de langage est un modèle compact, généralement de quelques milliards de paramètres ou moins, conçu pour tourner à faible coût ou directement sur un téléphone ou un portable. Il réussit bien des tâches ciblées, sans envoyer votre texte à un serveur distant.",
    },
    kid: {
      en: "A small language model is a pocket-sized AI that can live right on your phone.",
      fr: "Un petit modèle de langage, c'est une IA format de poche qui peut vivre directement dans ton téléphone.",
    },
    example: {
      en: "Phone features that summarise notifications or suggest replies offline often use a small on-device model.",
      fr: "Les fonctions de téléphone qui résument les notifications ou suggèrent des réponses hors ligne utilisent souvent un petit modèle embarqué.",
    },
    why: {
      en: "On-device AI can be the more private option, and it works without a connection — useful in rural and northern communities with patchy internet.",
      fr: "L'IA sur l'appareil peut être l'option la plus privée, et elle fonctionne sans connexion — utile dans les collectivités rurales et nordiques où Internet est inégal.",
    },
    related: ["parameters", "open-weight-model", "quantization", "inference", "distillation"],
  },
  {
    slug: "reasoning-model",
    term: { en: "Reasoning model", fr: "Modèle de raisonnement" },
    aka: { en: "Thinking model", fr: "Modèle « qui réfléchit »" },
    category: "inside",
    short: {
      en: "A reasoning model is a language model trained to work through a problem in intermediate steps before giving its final answer. It is usually slower and costlier per question, but better at maths, coding, planning and multi-step logic.",
      fr: "Un modèle de raisonnement est un modèle de langage entraîné à résoudre un problème par étapes intermédiaires avant de donner sa réponse finale. Il est généralement plus lent et plus coûteux par question, mais meilleur en mathématiques, en programmation, en planification et en logique à plusieurs étapes.",
    },
    kid: {
      en: "A reasoning model is an AI that \"shows its work\" in its head before answering.",
      fr: "Un modèle de raisonnement, c'est une IA qui fait son « brouillon » dans sa tête avant de répondre.",
    },
    example: {
      en: "Choosing a \"thinking\" or \"extended reasoning\" mode in a chatbot before asking it to plan a week of school lunches within a budget.",
      fr: "Choisir un mode « réflexion » ou « raisonnement approfondi » dans un robot conversationnel avant de lui demander de planifier une semaine de dîners d'école selon un budget.",
    },
    why: {
      en: "Step-by-step reasoning looks convincing, but the steps can still contain errors. For decisions that matter, check the conclusion, not just how confident the reasoning sounds.",
      fr: "Un raisonnement par étapes a l'air convaincant, mais les étapes peuvent quand même contenir des erreurs. Pour les décisions importantes, vérifiez la conclusion, pas seulement l'assurance du raisonnement.",
    },
    related: ["chain-of-thought", "large-language-model", "inference", "benchmark"],
  },
  {
    slug: "temperature",
    term: { en: "Temperature", fr: "Température" },
    category: "inside",
    short: {
      en: "Temperature is a setting that controls how predictable or varied a model's output is. Low temperature makes it pick the most likely words (steady, repetitive); higher temperature lets it take more chances (creative, but more error-prone).",
      fr: "La température est un réglage qui contrôle à quel point les résultats d'un modèle sont prévisibles ou variés. Une température basse lui fait choisir les mots les plus probables (stable, répétitif); une température plus élevée lui laisse prendre plus de risques (créatif, mais plus sujet aux erreurs).",
    },
    kid: {
      en: "Temperature is the AI's \"surprise me\" dial: low is careful, high is wild.",
      fr: "La température, c'est le bouton « surprends-moi » de l'IA : bas, c'est prudent; haut, c'est fou.",
    },
    example: {
      en: "A developer sets a low temperature for a bot that extracts invoice totals, and a higher one for a slogan brainstorm.",
      fr: "Un développeur règle une température basse pour un robot qui extrait les totaux de factures, et plus élevée pour un remue-méninges de slogans.",
    },
    why: {
      en: "It explains why you can ask the same question twice and get different answers. Consistency matters when AI is used for anything official.",
      fr: "Elle explique pourquoi on peut poser deux fois la même question et obtenir des réponses différentes. La constance compte quand l'IA sert à quoi que ce soit d'officiel.",
    },
    related: ["inference", "hallucination", "api", "large-language-model"],
  },
  {
    slug: "benchmark",
    term: { en: "Benchmark", fr: "Banc d'essai" },
    aka: { en: "Eval, evaluation", fr: "Évaluation, référentiel" },
    category: "inside",
    short: {
      en: "A benchmark is a standard test used to compare AI models — a set of questions, coding problems or tasks with known answers. Companies often announce new models with benchmark scores.",
      fr: "Un banc d'essai est un test standard qui sert à comparer des modèles d'IA — un ensemble de questions, de problèmes de programmation ou de tâches dont on connaît les réponses. Les entreprises annoncent souvent leurs nouveaux modèles avec des résultats à ces tests.",
    },
    kid: {
      en: "A benchmark is a report card test that every AI takes so people can compare them.",
      fr: "Un banc d'essai, c'est un examen que toutes les IA passent pour qu'on puisse les comparer.",
    },
    example: {
      en: "A lab says its model scores higher than rivals on a graduate-level science quiz and a software-repair test.",
      fr: "Un laboratoire affirme que son modèle obtient un meilleur score que ses rivaux à un quiz scientifique de niveau universitaire et à un test de correction de logiciels.",
    },
    why: {
      en: "Scores can be inflated if test questions leaked into training data, and few benchmarks measure fairness or how well a model serves French speakers. Independent testing matters.",
      fr: "Les résultats peuvent être gonflés si des questions du test se sont retrouvées dans les données d'entraînement, et peu de bancs d'essai mesurent l'équité ou la qualité du service en français. Les tests indépendants comptent.",
    },
    related: ["frontier-model", "red-teaming", "overfitting", "ai-washing"],
  },
  {
    slug: "gpu",
    term: { en: "GPU (graphics processing unit)", fr: "Processeur graphique (GPU)" },
    aka: { en: "AI chip, accelerator", fr: "Puce d'IA, accélérateur" },
    category: "inside",
    short: {
      en: "A GPU is a chip designed to do many simple calculations at the same time. First built for video games, GPUs and similar AI chips now do the heavy maths of training and running AI models, and they are in short supply worldwide.",
      fr: "Un processeur graphique est une puce conçue pour faire beaucoup de calculs simples en même temps. D'abord créées pour les jeux vidéo, ces puces et d'autres puces d'IA font maintenant les lourds calculs d'entraînement et d'utilisation des modèles, et elles manquent partout dans le monde.",
    },
    kid: {
      en: "A GPU is a chip that can do thousands of tiny maths problems at once, which is exactly what AI needs.",
      fr: "Un GPU, c'est une puce capable de faire des milliers de petits calculs à la fois, exactement ce dont l'IA a besoin.",
    },
    example: {
      en: "Training a frontier model can tie up tens of thousands of GPUs for months.",
      fr: "Entraîner un modèle de pointe peut mobiliser des dizaines de milliers de processeurs graphiques pendant des mois.",
    },
    why: {
      en: "Whoever controls AI chips shapes who can build AI. That is why chip export rules and national computing strategies, including Canada's, have become major policy issues.",
      fr: "Qui contrôle les puces d'IA décide de qui peut bâtir l'IA. C'est pourquoi les règles d'exportation de puces et les stratégies nationales de calcul, dont celle du Canada, sont devenues des enjeux politiques majeurs.",
    },
    related: ["compute", "data-centre", "inference", "sovereign-ai"],
  },
  {
    slug: "compute",
    term: { en: "Compute", fr: "Puissance de calcul" },
    aka: { en: "Computing power", fr: "Calcul, capacité de calcul" },
    category: "inside",
    short: {
      en: "In AI, compute means the computing power — chips, servers, electricity and time — used to train and run models. It is one of the biggest costs in AI and one of the main limits on who can build the largest systems.",
      fr: "En IA, la puissance de calcul désigne les ressources informatiques — puces, serveurs, électricité et temps — servant à entraîner et à faire tourner les modèles. C'est l'un des plus gros coûts de l'IA et l'une des principales limites quant à qui peut bâtir les plus grands systèmes.",
    },
    kid: {
      en: "Compute is the amount of computer muscle an AI needs to learn and to answer.",
      fr: "La puissance de calcul, c'est la quantité de muscles informatiques dont une IA a besoin pour apprendre et pour répondre.",
    },
    example: {
      en: "Canadian researchers apply to public programs for compute time because buying enough chips themselves would cost millions.",
      fr: "Des chercheurs canadiens demandent du temps de calcul à des programmes publics parce qu'acheter eux-mêmes assez de puces coûterait des millions.",
    },
    why: {
      en: "Access to compute decides whether universities, start-ups and smaller countries can take part in AI, or only a few large companies.",
      fr: "L'accès à la puissance de calcul décide si les universités, les jeunes pousses et les petits pays peuvent participer à l'IA, ou seulement quelques grandes entreprises.",
    },
    related: ["gpu", "data-centre", "sovereign-ai", "pre-training"],
    links: [{ learn: "find-ai-funding" }],
  },
  {
    slug: "distillation",
    term: { en: "Distillation", fr: "Distillation" },
    aka: { en: "Knowledge distillation", fr: "Distillation des connaissances" },
    category: "inside",
    short: {
      en: "Distillation trains a smaller \"student\" model to imitate a larger \"teacher\" model's answers. The student is cheaper and faster, keeping much of the teacher's skill for common tasks.",
      fr: "La distillation entraîne un petit modèle « élève » à imiter les réponses d'un plus grand modèle « maître ». L'élève est moins coûteux et plus rapide, tout en conservant une bonne part des compétences du maître pour les tâches courantes.",
    },
    kid: {
      en: "Distillation is a big AI tutoring a smaller AI until the little one is almost as good.",
      fr: "La distillation, c'est une grande IA qui donne des cours à une petite jusqu'à ce qu'elle soit presque aussi bonne.",
    },
    example: {
      en: "A company offers a \"mini\" or \"flash\" version of its model that was distilled from its flagship.",
      fr: "Une entreprise propose une version « mini » ou « flash » de son modèle, distillée à partir de son modèle phare.",
    },
    why: {
      en: "Cheaper models put AI within reach of more people and organisations. Distilling a rival's model without permission, though, is contested and may breach its terms.",
      fr: "Des modèles moins chers rendent l'IA accessible à plus de gens et d'organisations. Distiller le modèle d'un concurrent sans permission est toutefois contesté et peut violer ses conditions.",
    },
    related: ["small-language-model", "quantization", "parameters"],
  },
  {
    slug: "quantization",
    term: { en: "Quantization", fr: "Quantification" },
    aka: { en: "Quantisation", fr: "Quantisation" },
    category: "inside",
    short: {
      en: "Quantization stores a model's parameters with fewer digits of precision, making it much smaller and faster with only a small loss of quality. It is how large open models are squeezed onto laptops and phones.",
      fr: "La quantification enregistre les paramètres d'un modèle avec moins de chiffres de précision, ce qui le rend beaucoup plus petit et rapide, avec une faible perte de qualité. C'est ainsi qu'on fait tenir de grands modèles ouverts sur des portables et des téléphones.",
    },
    kid: {
      en: "Quantization is shrinking an AI by rounding its numbers, like saving a photo at a smaller size.",
      fr: "La quantification, c'est rapetisser une IA en arrondissant ses nombres, comme enregistrer une photo en plus petit format.",
    },
    example: {
      en: "A \"4-bit\" version of an open model takes roughly a quarter of the memory of the original.",
      fr: "Une version « 4 bits » d'un modèle ouvert occupe environ le quart de la mémoire de l'original.",
    },
    why: {
      en: "Smaller, local models help keep sensitive information on your own device instead of in someone else's cloud.",
      fr: "Des modèles plus petits et locaux aident à garder les renseignements sensibles sur votre propre appareil plutôt que dans le nuage de quelqu'un d'autre.",
    },
    related: ["parameters", "open-weight-model", "small-language-model", "distillation"],
  },
  {
    slug: "overfitting",
    term: { en: "Overfitting", fr: "Surapprentissage" },
    aka: { en: "Over-fitting", fr: "Surajustement" },
    category: "inside",
    short: {
      en: "Overfitting happens when a model memorises its training examples so closely that it fails on new ones. It looks brilliant in testing on familiar data and stumbles in the real world.",
      fr: "Le surapprentissage se produit quand un modèle mémorise ses exemples d'entraînement de si près qu'il échoue sur de nouveaux cas. Il paraît brillant lors de tests sur des données familières et trébuche dans le monde réel.",
    },
    kid: {
      en: "Overfitting is like memorising last year's test answers instead of learning the subject.",
      fr: "Le surapprentissage, c'est comme apprendre par cœur les réponses de l'examen de l'an passé au lieu d'apprendre la matière.",
    },
    example: {
      en: "A skin-check app trained mostly on photos of light skin performs poorly on darker skin it rarely saw.",
      fr: "Une application de dépistage cutané entraînée surtout sur des photos de peau claire fonctionne mal sur les peaux foncées qu'elle a rarement vues.",
    },
    why: {
      en: "Systems that only work on people like those in their training data can quietly fail the people least represented — a fairness problem, not just a technical one.",
      fr: "Des systèmes qui ne fonctionnent que pour des personnes semblables à celles de leurs données d'entraînement peuvent échouer en silence auprès des moins représentés — un problème d'équité, pas seulement technique.",
    },
    related: ["training-data", "algorithmic-bias", "benchmark", "machine-learning"],
  },
  {
    slug: "supervised-learning",
    term: { en: "Supervised learning", fr: "Apprentissage supervisé" },
    category: "inside",
    short: {
      en: "Supervised learning trains a model on examples that come with the right answer attached — photos labelled \"cat\" or \"dog\", loans marked \"repaid\" or \"defaulted\". The model learns to predict the label for new examples.",
      fr: "L'apprentissage supervisé entraîne un modèle sur des exemples accompagnés de la bonne réponse — des photos étiquetées « chat » ou « chien », des prêts marqués « remboursé » ou « en défaut ». Le modèle apprend à prédire l'étiquette de nouveaux exemples.",
    },
    kid: {
      en: "Supervised learning is studying with an answer key.",
      fr: "L'apprentissage supervisé, c'est étudier avec le corrigé.",
    },
    example: {
      en: "A model learns to estimate house prices from thousands of past sales where the final price is known.",
      fr: "Un modèle apprend à estimer le prix des maisons à partir de milliers de ventes passées dont on connaît le prix final.",
    },
    why: {
      en: "The answers in the key come from past human decisions. If past hiring or lending was unfair, a model can learn to repeat that unfairness.",
      fr: "Les réponses du corrigé viennent de décisions humaines passées. Si l'embauche ou le crédit étaient injustes, le modèle peut apprendre à reproduire cette injustice.",
    },
    related: ["unsupervised-learning", "reinforcement-learning", "data-labelling", "algorithmic-bias"],
  },
  {
    slug: "unsupervised-learning",
    term: { en: "Unsupervised learning", fr: "Apprentissage non supervisé" },
    category: "inside",
    short: {
      en: "Unsupervised learning looks for structure in data that has no labels: grouping similar customers, spotting unusual transactions, or finding topics in a pile of documents. Nobody tells the model what the right answer is.",
      fr: "L'apprentissage non supervisé cherche une structure dans des données sans étiquettes : regrouper des clients semblables, repérer des transactions inhabituelles ou trouver les sujets d'une pile de documents. Personne ne dit au modèle quelle est la bonne réponse.",
    },
    kid: {
      en: "Unsupervised learning is sorting a big box of Lego by yourself, without anyone telling you the groups.",
      fr: "L'apprentissage non supervisé, c'est trier seul une grosse boîte de Lego sans que personne te dise quels groupes faire.",
    },
    example: {
      en: "A news site groups thousands of articles into story clusters so readers see one entry per event.",
      fr: "Un site de nouvelles regroupe des milliers d'articles par sujet pour que les lecteurs voient une seule entrée par événement.",
    },
    why: {
      en: "Groupings made by machines can turn into labels about people (\"high-risk\", \"low-value\"). Ask how a group was defined before you act on it.",
      fr: "Des regroupements faits par des machines peuvent devenir des étiquettes sur des personnes (« à risque », « peu rentable »). Demandez comment un groupe a été défini avant d'agir en conséquence.",
    },
    related: ["supervised-learning", "machine-learning", "embedding"],
  },
  {
    slug: "reinforcement-learning",
    term: { en: "Reinforcement learning", fr: "Apprentissage par renforcement" },
    aka: { en: "RL", fr: "AR" },
    category: "inside",
    short: {
      en: "Reinforcement learning trains an AI by trial and error: it takes actions, gets a reward or penalty, and gradually learns which actions lead to better results. It is used for games, robotics and to sharpen the reasoning of language models.",
      fr: "L'apprentissage par renforcement entraîne une IA par essais et erreurs : elle agit, reçoit une récompense ou une pénalité, et apprend peu à peu quelles actions mènent à de meilleurs résultats. On l'utilise pour les jeux, la robotique et pour affiner le raisonnement des modèles de langage.",
    },
    kid: {
      en: "Reinforcement learning is learning like a video-game player: try, score points, try again smarter.",
      fr: "L'apprentissage par renforcement, c'est apprendre comme dans un jeu vidéo : essayer, marquer des points, recommencer en plus futé.",
    },
    example: {
      en: "An AI learns to play Go or to balance a robot arm by practising millions of times in simulation.",
      fr: "Une IA apprend à jouer au go ou à équilibrer un bras robotisé en s'exerçant des millions de fois en simulation.",
    },
    why: {
      en: "An AI chasing a reward can find shortcuts its designers never intended. Choosing what to reward is a question of values, not just engineering.",
      fr: "Une IA qui court après une récompense peut trouver des raccourcis que ses concepteurs n'avaient pas prévus. Choisir ce qu'on récompense est une question de valeurs, pas seulement d'ingénierie.",
    },
    related: ["rlhf", "reasoning-model", "alignment", "supervised-learning"],
  },
  {
    slug: "knowledge-cutoff",
    term: { en: "Knowledge cutoff", fr: "Date limite des connaissances" },
    aka: { en: "Training cutoff", fr: "Date de coupure" },
    category: "inside",
    short: {
      en: "The knowledge cutoff is the date after which a model has no information from its training data. Unless the tool searches the web or your documents, it won't know about events, prices or laws that changed later.",
      fr: "La date limite des connaissances est la date après laquelle un modèle n'a aucune information tirée de ses données d'entraînement. À moins que l'outil ne cherche sur le Web ou dans vos documents, il ignorera les événements, les prix ou les lois qui ont changé depuis.",
    },
    kid: {
      en: "The knowledge cutoff is the day the AI stopped reading the news.",
      fr: "La date limite des connaissances, c'est le jour où l'IA a arrêté de lire les nouvelles.",
    },
    example: {
      en: "Ask about this year's tax-filing deadline and a model without web search may give you last year's date.",
      fr: "Demandez la date limite de déclaration de revenus de cette année : un modèle sans recherche Web pourrait vous donner celle de l'an dernier.",
    },
    why: {
      en: "Out-of-date answers about benefits, health or the law can cause real harm. Check anything time-sensitive against an official, current source.",
      fr: "Des réponses périmées sur les prestations, la santé ou le droit peuvent causer un tort réel. Vérifiez tout ce qui dépend de la date auprès d'une source officielle à jour.",
    },
    related: ["training-data", "retrieval-augmented-generation", "hallucination", "grounding"],
    links: [{ hub: "use-ai-assistants-safely" }],
  },
  {
    slug: "synthetic-data",
    term: { en: "Synthetic data", fr: "Données synthétiques" },
    category: "inside",
    short: {
      en: "Synthetic data is artificial data generated by a program or an AI model to look like real data. It is used to train or test systems when real data is scarce, private or expensive.",
      fr: "Les données synthétiques sont des données artificielles produites par un programme ou un modèle d'IA pour ressembler à des données réelles. On s'en sert pour entraîner ou tester des systèmes quand les vraies données sont rares, privées ou coûteuses.",
    },
    kid: {
      en: "Synthetic data is pretend data made by a computer so an AI can practise without using real people's information.",
      fr: "Les données synthétiques, c'est des fausses données fabriquées par ordinateur pour qu'une IA s'exerce sans utiliser les renseignements de vraies personnes.",
    },
    example: {
      en: "A bank creates synthetic customer records to test a fraud model without exposing real accounts.",
      fr: "Une banque crée des dossiers de clients synthétiques pour tester un modèle antifraude sans exposer de vrais comptes.",
    },
    why: {
      en: "It can protect privacy, but poorly made synthetic data can still reveal real people or carry over the biases of the original. And models trained too much on AI output can degrade over time.",
      fr: "Elles peuvent protéger la vie privée, mais des données synthétiques mal conçues peuvent encore révéler de vraies personnes ou reproduire les biais de l'original. Et des modèles trop entraînés sur des contenus d'IA peuvent se dégrader avec le temps.",
    },
    related: ["training-data", "personal-information", "algorithmic-bias"],
  },
  {
    slug: "speech-recognition",
    term: { en: "Speech recognition", fr: "Reconnaissance vocale" },
    aka: { en: "Speech-to-text", fr: "Transcription automatique, parole-texte" },
    category: "media",
    short: {
      en: "Speech recognition turns spoken words into text. Modern systems use deep learning and handle many languages and accents, though accuracy still drops with background noise, strong accents and specialised vocabulary.",
      fr: "La reconnaissance vocale transforme la parole en texte. Les systèmes modernes utilisent l'apprentissage profond et gèrent de nombreuses langues et accents, mais la précision baisse encore avec le bruit de fond, les accents marqués et le vocabulaire spécialisé.",
    },
    kid: {
      en: "Speech recognition is the AI typing what you say.",
      fr: "La reconnaissance vocale, c'est l'IA qui tape ce que tu dis.",
    },
    example: {
      en: "Dictating a text message, or live captions on a video call.",
      fr: "Dicter un texto, ou les sous-titres en direct d'un appel vidéo.",
    },
    why: {
      en: "Captions make meetings and video accessible to people who are deaf or hard of hearing. Recording others' voices still needs their knowledge, and in many settings their consent.",
      fr: "Les sous-titres rendent les réunions et les vidéos accessibles aux personnes sourdes ou malentendantes. Enregistrer la voix d'autrui exige tout de même qu'on le sache, et souvent son consentement.",
    },
    related: ["text-to-speech", "natural-language-processing", "multimodal-ai", "voice-cloning"],
  },
  {
    slug: "text-to-speech",
    term: { en: "Text-to-speech (TTS)", fr: "Synthèse vocale" },
    aka: { en: "TTS, AI voice", fr: "Voix de synthèse, voix IA" },
    category: "media",
    short: {
      en: "Text-to-speech turns written text into spoken audio. AI voices now sound natural, with pauses and emotion, and can read in many languages and accents.",
      fr: "La synthèse vocale transforme un texte écrit en parole. Les voix d'IA sonnent maintenant naturelles, avec des pauses et des émotions, et peuvent lire dans de nombreuses langues et avec divers accents.",
    },
    kid: {
      en: "Text-to-speech is a computer reading out loud.",
      fr: "La synthèse vocale, c'est un ordinateur qui lit à voix haute.",
    },
    example: {
      en: "The Listen button on our Dispatches uses an AI voice, and we label it as one.",
      fr: "Le bouton Écouter de nos dépêches utilise une voix d'IA, et nous l'indiquons clairement.",
    },
    why: {
      en: "AI voices help people with low vision or reading difficulties. The same tools can imitate real voices, so honest labelling matters.",
      fr: "Les voix d'IA aident les personnes ayant une basse vision ou des difficultés de lecture. Les mêmes outils peuvent imiter de vraies voix, d'où l'importance d'un étiquetage honnête.",
    },
    related: ["voice-cloning", "speech-recognition", "deepfake", "multimodal-ai"],
  },
];
