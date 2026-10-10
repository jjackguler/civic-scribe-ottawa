/** Glossary, part 3: using AI, and images, voice and video. Written by AI Broadsheet. */
import type { GlossaryTerm } from "./glossary";

export const TERMS: GlossaryTerm[] = [
  {
    slug: "prompt",
    term: { en: "Prompt", fr: "Requête" },
    aka: { en: "Instruction, query", fr: "Instruction, invite, prompt" },
    category: "using",
    short: {
      en: "A prompt is what you type or say to an AI tool to get a result: a question, an instruction, some text to work on, or all three. Clear prompts that give context, a goal and a format get much better answers.",
      fr: "Une requête est ce que vous tapez ou dites à un outil d'IA pour obtenir un résultat : une question, une instruction, un texte à traiter, ou les trois. Une requête claire qui donne le contexte, l'objectif et le format obtient de bien meilleures réponses.",
    },
    kid: {
      en: "A prompt is the message you send the AI to tell it what you want.",
      fr: "Une requête, c'est le message que tu envoies à l'IA pour lui dire ce que tu veux.",
    },
    example: {
      en: "Instead of \"write a poster\", try: \"Write a poster for a school bake sale on Friday at noon, gym entrance, all money to the food bank. Friendly, under 40 words.\"",
      fr: "Au lieu de « écris une affiche », essayez : « Écris une affiche pour une vente de pâtisseries à l'école vendredi midi, entrée du gymnase, profits à la banque alimentaire. Ton amical, moins de 40 mots. »",
    },
    why: {
      en: "Everything in a prompt may be stored by the service. Leave out names, health details, account numbers and anything you wouldn't put on a postcard.",
      fr: "Tout ce qui se trouve dans une requête peut être conservé par le service. Laissez de côté les noms, les détails de santé, les numéros de compte et tout ce que vous n'écririez pas sur une carte postale.",
    },
    related: ["prompt-engineering", "system-prompt", "few-shot-prompting", "context-window"],
    links: [{ labs: "prompting" }, { learn: "start-in-30-minutes" }, { hub: "use-ai-assistants-safely" }],
  },
  {
    slug: "prompt-engineering",
    term: { en: "Prompt engineering", fr: "Ingénierie des requêtes" },
    aka: { en: "Prompting, prompt design", fr: "Rédaction de requêtes, ingénierie de prompts" },
    category: "using",
    short: {
      en: "Prompt engineering is the practice of writing and testing instructions so an AI model reliably does what you need. It ranges from everyday habits (be specific, give examples) to carefully tested templates used inside business software.",
      fr: "L'ingénierie des requêtes est la pratique qui consiste à rédiger et à tester des instructions pour qu'un modèle d'IA fasse de façon fiable ce dont vous avez besoin. Elle va des habitudes de tous les jours (être précis, donner des exemples) aux gabarits soigneusement testés intégrés dans des logiciels d'entreprise.",
    },
    kid: {
      en: "Prompt engineering is getting really good at asking the AI questions so it gives you what you actually need.",
      fr: "L'ingénierie des requêtes, c'est devenir vraiment bon pour poser des questions à l'IA afin qu'elle te donne ce dont tu as besoin.",
    },
    example: {
      en: "A teacher refines a prompt over a week until the AI's reading-level summaries are consistently right for grade 5.",
      fr: "Une enseignante peaufine sa requête pendant une semaine jusqu'à ce que les résumés de l'IA soient toujours adaptés à la 5e année.",
    },
    why: {
      en: "Good prompting is a learnable skill, not a secret. Free courses — many listed in our Labs — teach it in an afternoon.",
      fr: "Bien rédiger ses requêtes s'apprend; ce n'est pas un secret. Des cours gratuits — dont plusieurs dans nos Labs — l'enseignent en un après-midi.",
    },
    related: ["prompt", "few-shot-prompting", "chain-of-thought", "system-prompt"],
    links: [{ labs: "prompting" }],
  },
  {
    slug: "system-prompt",
    term: { en: "System prompt", fr: "Requête système" },
    aka: { en: "System message, custom instructions", fr: "Message système, instructions personnalisées" },
    category: "using",
    short: {
      en: "A system prompt is a set of standing instructions given to a model before the conversation starts — its role, tone, rules and limits. Apps use them to shape the assistant; many chatbots let you add your own \"custom instructions\" too.",
      fr: "Une requête système est un ensemble d'instructions permanentes données à un modèle avant le début de la conversation — son rôle, son ton, ses règles et ses limites. Les applications s'en servent pour façonner l'assistant; beaucoup de robots conversationnels vous permettent aussi d'ajouter vos propres « instructions personnalisées ».",
    },
    kid: {
      en: "The system prompt is the secret rule sheet the AI reads before it talks to you.",
      fr: "La requête système, c'est la feuille de règles secrète que l'IA lit avant de te parler.",
    },
    example: {
      en: "A library chatbot's system prompt tells it to answer only about library services, in plain language, and to suggest a librarian for anything else.",
      fr: "La requête système du robot d'une bibliothèque lui demande de répondre seulement sur les services de la bibliothèque, en langage simple, et de suggérer un bibliothécaire pour tout le reste.",
    },
    why: {
      en: "Hidden instructions shape what a chatbot will and won't say. Organisations using AI with the public should be open about its rules and limits.",
      fr: "Des instructions cachées déterminent ce qu'un robot conversationnel dira ou non. Les organisations qui utilisent l'IA avec le public devraient être transparentes sur ses règles et ses limites.",
    },
    related: ["prompt", "guardrails", "prompt-injection", "chatbot"],
  },
  {
    slug: "chatbot",
    term: { en: "Chatbot", fr: "Robot conversationnel" },
    aka: { en: "Chat assistant", fr: "Agent conversationnel, clavardeur" },
    category: "using",
    short: {
      en: "A chatbot is a program you talk to in a conversation, by text or voice. Older chatbots followed scripts; today's AI chatbots generate answers with a large language model, so they can handle almost any question — and can be wrong.",
      fr: "Un robot conversationnel est un programme avec lequel on converse, par écrit ou à voix haute. Les anciens suivaient des scripts; ceux d'aujourd'hui produisent leurs réponses avec un grand modèle de langage, si bien qu'ils peuvent traiter presque n'importe quelle question — et se tromper.",
    },
    kid: {
      en: "A chatbot is a computer you can text with that texts back.",
      fr: "Un robot conversationnel, c'est un ordinateur à qui tu peux écrire et qui te répond.",
    },
    example: {
      en: "The help bubble on an airline's website that answers baggage questions.",
      fr: "La bulle d'aide sur le site d'une compagnie aérienne qui répond aux questions sur les bagages.",
    },
    why: {
      en: "You have a right to know when you're talking to a machine, and a business is generally responsible for what its chatbot tells you. A Canadian tribunal held an airline to its chatbot's wrong refund advice in 2024.",
      fr: "Vous avez le droit de savoir quand vous parlez à une machine, et une entreprise est généralement responsable de ce que son robot vous dit. En 2024, un tribunal canadien a tenu une compagnie aérienne responsable des mauvais conseils de remboursement de son robot.",
    },
    related: ["ai-assistant", "large-language-model", "hallucination", "system-prompt"],
    links: [{ hub: "use-ai-assistants-safely" }, { labs: "assistants" }],
  },
  {
    slug: "ai-assistant",
    term: { en: "AI assistant", fr: "Assistant IA" },
    aka: { en: "Virtual assistant", fr: "Assistant virtuel" },
    category: "using",
    short: {
      en: "An AI assistant is a general-purpose chatbot or built-in helper that drafts, summarises, explains, plans and answers questions. ChatGPT, Claude, Gemini, Copilot and Le Chat are the best-known; many apps now include one.",
      fr: "Un assistant IA est un robot conversationnel polyvalent ou un outil intégré qui rédige, résume, explique, planifie et répond aux questions. ChatGPT, Claude, Gemini, Copilot et Le Chat sont les plus connus; beaucoup d'applications en intègrent un maintenant.",
    },
    kid: {
      en: "An AI assistant is a helper app that can explain things, help you write and answer questions.",
      fr: "Un assistant IA, c'est une application qui t'aide à comprendre des choses, à écrire et à répondre à tes questions.",
    },
    example: {
      en: "Pasting a long letter from your landlord and asking, \"What is this asking me to do, and by when?\"",
      fr: "Coller une longue lettre de votre propriétaire et demander : « Qu'est-ce qu'on me demande de faire, et pour quand? »",
    },
    why: {
      en: "Assistants are most useful as a first draft and a second opinion, not the final word on health, money or legal matters.",
      fr: "Les assistants sont plus utiles comme premier jet et deuxième avis que comme dernier mot sur la santé, l'argent ou le droit.",
    },
    related: ["chatbot", "ai-agent", "large-language-model", "prompt"],
    links: [{ hub: "use-ai-assistants-safely" }, { labs: "assistants" }, { learn: "start-in-30-minutes" }],
  },
  {
    slug: "ai-agent",
    term: { en: "AI agent", fr: "Agent IA" },
    aka: { en: "Agentic AI, autonomous agent", fr: "IA agentique, agent autonome" },
    category: "using",
    short: {
      en: "An AI agent is an AI system that can take actions toward a goal, not just answer: it plans steps, uses tools such as a browser, email or code, checks results and continues until done or stuck. Agents can save time on multi-step tasks but need clear limits.",
      fr: "Un agent IA est un système d'IA qui peut agir pour atteindre un objectif, pas seulement répondre : il planifie des étapes, utilise des outils comme un navigateur, le courriel ou du code, vérifie les résultats et continue jusqu'à ce qu'il ait fini ou soit bloqué. Les agents font gagner du temps sur des tâches à étapes multiples, mais exigent des limites claires.",
    },
    kid: {
      en: "An AI agent is an AI that doesn't just tell you how — it goes and does the steps for you.",
      fr: "Un agent IA, c'est une IA qui ne fait pas que t'expliquer comment faire — elle fait les étapes à ta place.",
    },
    example: {
      en: "An agent compares three moving companies' websites, fills in quote forms and drafts an email with the results for you to approve.",
      fr: "Un agent compare les sites de trois entreprises de déménagement, remplit les formulaires de soumission et rédige un courriel avec les résultats, que vous approuvez.",
    },
    why: {
      en: "An agent acting in your name can make purchases, send messages or share data. Keep a human approval step for anything that costs money or can't be undone.",
      fr: "Un agent qui agit en votre nom peut faire des achats, envoyer des messages ou partager des données. Gardez une étape d'approbation humaine pour tout ce qui coûte de l'argent ou ne peut pas être annulé.",
    },
    related: ["tool-use", "model-context-protocol", "human-in-the-loop", "prompt-injection"],
    links: [{ labs: "agents" }],
  },
  {
    slug: "tool-use",
    term: { en: "Tool use", fr: "Utilisation d'outils" },
    aka: { en: "Function calling", fr: "Appel de fonctions" },
    category: "using",
    short: {
      en: "Tool use lets a language model call outside software — a calculator, a search engine, a calendar, a database — and use the result in its answer. It is how chatbots check the weather or do exact arithmetic instead of guessing.",
      fr: "L'utilisation d'outils permet à un modèle de langage de faire appel à un logiciel externe — calculatrice, moteur de recherche, agenda, base de données — et d'utiliser le résultat dans sa réponse. C'est ainsi que les robots consultent la météo ou font des calculs exacts au lieu de deviner.",
    },
    kid: {
      en: "Tool use is the AI grabbing a calculator or a search engine when it needs one.",
      fr: "L'utilisation d'outils, c'est l'IA qui attrape une calculatrice ou un moteur de recherche quand elle en a besoin.",
    },
    example: {
      en: "Asked \"Is the library open tomorrow?\", an assistant calls the library's hours tool rather than relying on memory.",
      fr: "À la question « La bibliothèque est-elle ouverte demain? », l'assistant interroge l'outil des heures d'ouverture plutôt que de se fier à sa mémoire.",
    },
    why: {
      en: "Every connected tool is another place your data can go. Grant only the access a task needs, and review connections you no longer use.",
      fr: "Chaque outil branché est un autre endroit où vos données peuvent aller. N'accordez que l'accès nécessaire à la tâche et révisez les connexions dont vous ne vous servez plus.",
    },
    related: ["ai-agent", "model-context-protocol", "api", "grounding"],
    links: [{ labs: "agents" }],
  },
  {
    slug: "model-context-protocol",
    term: { en: "Model Context Protocol (MCP)", fr: "Model Context Protocol (MCP)" },
    aka: { en: "MCP", fr: "MCP, protocole de contexte de modèle" },
    category: "using",
    short: {
      en: "The Model Context Protocol is an open standard, introduced by Anthropic in 2024 and now supported across the industry, that lets AI assistants connect to outside tools and data through a common plug. A tool built once as an \"MCP server\" can work with many different assistants.",
      fr: "Le Model Context Protocol est une norme ouverte, présentée par Anthropic en 2024 et maintenant adoptée dans l'industrie, qui permet aux assistants IA de se brancher sur des outils et des données externes au moyen d'une prise commune. Un outil conçu une fois comme « serveur MCP » peut fonctionner avec de nombreux assistants.",
    },
    kid: {
      en: "MCP is like a universal charger cable that lets any AI plug into lots of different apps.",
      fr: "Le MCP, c'est comme un câble de recharge universel qui permet à n'importe quelle IA de se brancher sur plein d'applications.",
    },
    example: {
      en: "A small business connects its assistant to its calendar and invoicing app through MCP servers instead of custom code.",
      fr: "Une petite entreprise branche son assistant sur son agenda et son application de facturation au moyen de serveurs MCP plutôt que de code sur mesure.",
    },
    why: {
      en: "Standards make AI more useful and less locked-in. Only install MCP servers from sources you trust: each one can read or act on the data it connects to.",
      fr: "Les normes rendent l'IA plus utile et réduisent la dépendance. N'installez que des serveurs MCP de sources fiables : chacun peut lire ou modifier les données auxquelles il donne accès.",
    },
    related: ["tool-use", "ai-agent", "api", "prompt-injection"],
    links: [{ labs: "agents" }, { labs: "build" }],
  },
  {
    slug: "api",
    term: { en: "API (application programming interface)", fr: "API (interface de programmation)" },
    aka: { en: "API", fr: "API, interface de programmation d'applications" },
    category: "using",
    short: {
      en: "An API is a defined way for one program to ask another for something. AI companies offer APIs so developers can send text to a model from their own apps and pay per use, usually per token.",
      fr: "Une API est une façon définie pour un programme de demander quelque chose à un autre. Les entreprises d'IA offrent des API pour que les développeurs puissent envoyer du texte à un modèle depuis leurs propres applications et payer à l'usage, généralement au jeton.",
    },
    kid: {
      en: "An API is a doorway that lets one app talk to another app's brain.",
      fr: "Une API, c'est une porte qui permet à une application de parler au cerveau d'une autre.",
    },
    example: {
      en: "A recipe website sends your list of ingredients to an AI model through its API and shows you dinner ideas.",
      fr: "Un site de recettes envoie votre liste d'ingrédients à un modèle d'IA par son API et vous propose des idées de souper.",
    },
    why: {
      en: "When an app uses an AI company's API, your words may pass to that company. A good privacy policy names those providers.",
      fr: "Quand une application utilise l'API d'une entreprise d'IA, vos mots peuvent lui être transmis. Une bonne politique de confidentialité nomme ces fournisseurs.",
    },
    related: ["token", "tool-use", "model-context-protocol", "inference"],
    links: [{ labs: "build" }],
  },
  {
    slug: "few-shot-prompting",
    term: { en: "Few-shot prompting", fr: "Requête avec exemples" },
    aka: { en: "In-context learning, zero-shot / few-shot", fr: "Apprentissage en contexte, « few-shot »" },
    category: "using",
    short: {
      en: "Few-shot prompting means including a few examples of what you want in your prompt, so the model copies the pattern. Zero-shot means asking with no examples at all.",
      fr: "La requête avec exemples consiste à inclure quelques exemples de ce que vous voulez dans votre requête, pour que le modèle reproduise le modèle. Sans aucun exemple, on parle de requête « zéro exemple ».",
    },
    kid: {
      en: "Few-shot prompting is showing the AI two or three examples so it gets the idea.",
      fr: "La requête avec exemples, c'est montrer deux ou trois exemples à l'IA pour qu'elle comprenne l'idée.",
    },
    example: {
      en: "\"Turn these into friendly reminders. Example: 'Rent due 1st' → 'Hi! Quick reminder that rent is due on the 1st.' Now do: 'Recycling Tuesday'.\"",
      fr: "« Transforme ceci en rappels amicaux. Exemple : 'Loyer dû le 1er' → 'Bonjour! Petit rappel : le loyer est dû le 1er.' À toi : 'Recyclage mardi'. »",
    },
    why: {
      en: "Examples are the fastest way to get a consistent tone in either official language — handy for bilingual notices.",
      fr: "Les exemples sont le moyen le plus rapide d'obtenir un ton constant dans l'une ou l'autre langue officielle — pratique pour les avis bilingues.",
    },
    related: ["prompt", "prompt-engineering", "chain-of-thought"],
    links: [{ labs: "prompting" }],
  },
  {
    slug: "chain-of-thought",
    term: { en: "Chain of thought", fr: "Chaîne de raisonnement" },
    aka: { en: "CoT, step-by-step reasoning", fr: "Raisonnement étape par étape" },
    category: "using",
    short: {
      en: "Chain of thought is a model working through a problem in written intermediate steps before answering. Asking \"think step by step\" can improve answers on maths and logic; reasoning models now do this on their own.",
      fr: "La chaîne de raisonnement, c'est un modèle qui résout un problème par étapes intermédiaires écrites avant de répondre. Demander de « réfléchir étape par étape » peut améliorer les réponses en mathématiques et en logique; les modèles de raisonnement le font maintenant d'eux-mêmes.",
    },
    kid: {
      en: "Chain of thought is the AI writing out its steps, like you do in math class.",
      fr: "La chaîne de raisonnement, c'est l'IA qui écrit ses étapes, comme toi en maths.",
    },
    example: {
      en: "\"A bus leaves at 3:40 and the trip takes 55 minutes. Will I make a 4:30 appointment? Work it out step by step.\"",
      fr: "« Un autobus part à 15 h 40 et le trajet dure 55 minutes. Arriverai-je à un rendez-vous à 16 h 30? Résous-le étape par étape. »",
    },
    why: {
      en: "Visible steps make errors easier to catch. But the written steps don't always reflect how the model really reached its answer, so they are not proof.",
      fr: "Des étapes visibles rendent les erreurs plus faciles à repérer. Mais les étapes écrites ne reflètent pas toujours la façon dont le modèle est vraiment arrivé à sa réponse : ce n'est pas une preuve.",
    },
    related: ["reasoning-model", "prompt-engineering", "explainability"],
    links: [{ labs: "prompting" }],
  },
  {
    slug: "hallucination",
    term: { en: "Hallucination", fr: "Hallucination" },
    aka: { en: "Confabulation, made-up answer", fr: "Affabulation, réponse inventée" },
    category: "using",
    short: {
      en: "A hallucination is when an AI states something false or made up as if it were true — a fake quote, a non-existent court case, a wrong date. It happens because models generate plausible text, not checked facts.",
      fr: "Une hallucination, c'est quand une IA affirme quelque chose de faux ou d'inventé comme si c'était vrai — une fausse citation, une décision de justice inexistante, une mauvaise date. Cela arrive parce que les modèles produisent du texte plausible, pas des faits vérifiés.",
    },
    kid: {
      en: "A hallucination is when the AI makes something up and says it like it's true.",
      fr: "Une hallucination, c'est quand l'IA invente quelque chose et le dit comme si c'était vrai.",
    },
    example: {
      en: "Lawyers in several countries, including Canada, have been sanctioned for filing court documents that cited cases an AI invented.",
      fr: "Des avocats de plusieurs pays, dont le Canada, ont été sanctionnés pour avoir déposé des documents citant des décisions inventées par une IA.",
    },
    why: {
      en: "Never rely on an AI answer alone for health, legal, financial or safety decisions. Ask for sources, open them, and check with a qualified person.",
      fr: "Ne vous fiez jamais à une seule réponse d'IA pour des décisions de santé, juridiques, financières ou de sécurité. Demandez les sources, ouvrez-les et vérifiez auprès d'une personne qualifiée.",
    },
    related: ["grounding", "retrieval-augmented-generation", "knowledge-cutoff", "large-language-model"],
    links: [{ hub: "use-ai-assistants-safely" }, { learn: "use-ai-safely" }, { labs: "safety" }],
  },
  {
    slug: "grounding",
    term: { en: "Grounding", fr: "Ancrage" },
    aka: { en: "Citations, source-grounded answers", fr: "Réponses sourcées, ancrage factuel" },
    category: "using",
    short: {
      en: "Grounding means tying an AI's answer to specific, checkable sources — search results, documents, a database — and ideally showing them. Grounded answers are easier to verify and less likely to be invented.",
      fr: "L'ancrage consiste à rattacher la réponse d'une IA à des sources précises et vérifiables — résultats de recherche, documents, base de données — et idéalement à les montrer. Les réponses ancrées sont plus faciles à vérifier et moins susceptibles d'être inventées.",
    },
    kid: {
      en: "Grounding is the AI showing where it got its answer, like a bibliography.",
      fr: "L'ancrage, c'est l'IA qui montre d'où vient sa réponse, comme une bibliographie.",
    },
    example: {
      en: "Our Dispatches are written only from named outlets' reporting, and every claim links to the source it came from.",
      fr: "Nos dépêches sont rédigées uniquement à partir des reportages de médias nommés, et chaque affirmation renvoie à sa source.",
    },
    why: {
      en: "A citation is only useful if you open it: AI tools sometimes cite real pages that don't actually say what was claimed.",
      fr: "Une référence n'est utile que si vous l'ouvrez : les outils d'IA citent parfois de vraies pages qui ne disent pas vraiment ce qui est affirmé.",
    },
    related: ["retrieval-augmented-generation", "hallucination", "tool-use", "content-provenance"],
  },
  {
    slug: "ai-detector",
    term: { en: "AI detector", fr: "Détecteur d'IA" },
    aka: { en: "AI-writing detector", fr: "Détecteur de texte généré par IA" },
    category: "using",
    short: {
      en: "An AI detector is a tool that claims to tell whether text or an image was made by AI. For text in particular, these tools are unreliable: they produce false accusations, especially against people writing in a second language.",
      fr: "Un détecteur d'IA est un outil qui prétend dire si un texte ou une image a été produit par l'IA. Pour le texte en particulier, ces outils ne sont pas fiables : ils produisent de fausses accusations, surtout envers les personnes qui écrivent dans une langue seconde.",
    },
    kid: {
      en: "An AI detector tries to guess if a computer wrote something — and it often guesses wrong.",
      fr: "Un détecteur d'IA essaie de deviner si un ordinateur a écrit quelque chose — et il se trompe souvent.",
    },
    example: {
      en: "A student's own essay is flagged as \"90% AI\" because it uses simple, formal sentences.",
      fr: "Le propre texte d'un élève est signalé comme « à 90 % IA » parce qu'il emploie des phrases simples et formelles.",
    },
    why: {
      en: "A detector score should never be the only evidence for a cheating accusation. Schools do better with clear rules, drafts and conversations.",
      fr: "Un score de détecteur ne devrait jamais être la seule preuve d'une accusation de tricherie. Les écoles font mieux avec des règles claires, des brouillons et des discussions.",
    },
    related: ["watermarking", "content-provenance", "algorithmic-bias", "ai-literacy"],
    links: [{ hub: "ai-for-students" }],
  },
  {
    slug: "vibe-coding",
    term: { en: "Vibe coding", fr: "Codage à l'intuition" },
    aka: { en: "AI-assisted coding", fr: "Programmation assistée par IA, « vibe coding »" },
    category: "using",
    short: {
      en: "Vibe coding is building software mostly by describing what you want to an AI and accepting the code it writes, often without reading it closely. It lets non-programmers make working prototypes quickly.",
      fr: "Le codage à l'intuition consiste à bâtir un logiciel surtout en décrivant ce qu'on veut à une IA et en acceptant le code qu'elle écrit, souvent sans le lire attentivement. Il permet à des non-programmeurs de créer rapidement des prototypes fonctionnels.",
    },
    kid: {
      en: "Vibe coding is making an app by telling the AI what you want instead of typing the code yourself.",
      fr: "Le codage à l'intuition, c'est créer une application en disant à l'IA ce que tu veux au lieu de taper le code toi-même.",
    },
    example: {
      en: "A soccer coach describes a team sign-up page to an AI app builder and has a working version by lunch.",
      fr: "Un entraîneur de soccer décrit une page d'inscription d'équipe à un outil de création d'applications IA et en a une version fonctionnelle à midi.",
    },
    why: {
      en: "Code nobody has read can hide security holes. Anything that collects people's information needs a real review before it goes live.",
      fr: "Un code que personne n'a lu peut cacher des failles de sécurité. Tout ce qui recueille des renseignements sur des gens doit être vraiment révisé avant sa mise en ligne.",
    },
    related: ["ai-agent", "api", "personal-information"],
    links: [{ labs: "build" }],
  },
  {
    slug: "text-to-image",
    term: { en: "Text-to-image", fr: "Texte-image" },
    aka: { en: "AI image generator", fr: "Générateur d'images IA" },
    category: "media",
    short: {
      en: "Text-to-image tools create pictures from a written description. They can produce illustrations, product mock-ups and photo-realistic scenes in seconds, usually using diffusion models.",
      fr: "Les outils texte-image créent des images à partir d'une description écrite. Ils produisent en quelques secondes des illustrations, des maquettes de produits et des scènes photoréalistes, généralement au moyen de modèles de diffusion.",
    },
    kid: {
      en: "Text-to-image is typing a description and getting a brand-new picture.",
      fr: "Le texte-image, c'est taper une description et recevoir une image toute neuve.",
    },
    example: {
      en: "A café owner generates a cozy autumn illustration for a menu board instead of using a stock photo.",
      fr: "Une propriétaire de café génère une illustration automnale chaleureuse pour son tableau de menu au lieu d'une photo de banque d'images.",
    },
    why: {
      en: "Never generate images of real people in situations they didn't consent to. Label AI images, and check the tool's licence before commercial use.",
      fr: "Ne générez jamais d'images de vraies personnes dans des situations auxquelles elles n'ont pas consenti. Identifiez les images d'IA et vérifiez la licence de l'outil avant tout usage commercial.",
    },
    related: ["diffusion-model", "deepfake", "watermarking", "ai-and-copyright"],
  },
  {
    slug: "deepfake",
    term: { en: "Deepfake", fr: "Hypertrucage" },
    aka: { en: "Synthetic media", fr: "Deepfake, média synthétique" },
    category: "media",
    short: {
      en: "A deepfake is a realistic fake video, image or audio of a real person, made with AI to show them saying or doing something they never did. Deepfakes are used in scams, political disinformation and harassment.",
      fr: "Un hypertrucage est une fausse vidéo, image ou piste audio réaliste d'une personne réelle, créée par IA pour lui faire dire ou faire quelque chose qu'elle n'a jamais dit ou fait. Les hypertrucages servent aux arnaques, à la désinformation politique et au harcèlement.",
    },
    kid: {
      en: "A deepfake is a fake video or voice of a real person made by AI — it can look and sound real, so check before you believe or share.",
      fr: "Un hypertrucage, c'est une fausse vidéo ou une fausse voix d'une vraie personne faite par IA — ça peut sembler vrai, alors vérifie avant de croire ou de partager.",
    },
    example: {
      en: "A video of a well-known Canadian personality \"recommending\" an investment platform appears in social-media ads — it is fake, and the platform is a scam.",
      fr: "Une vidéo d'une personnalité canadienne connue qui « recommande » une plateforme de placement apparaît dans des publicités sur les réseaux sociaux — elle est fausse, et la plateforme est une arnaque.",
    },
    why: {
      en: "Deepfakes hurt people's reputations, empty bank accounts and undermine elections. Pause, check the source, and report scams to the Canadian Anti-Fraud Centre.",
      fr: "Les hypertrucages nuisent à la réputation des gens, vident des comptes bancaires et minent les élections. Prenez une pause, vérifiez la source et signalez les arnaques au Centre antifraude du Canada.",
    },
    related: ["voice-cloning", "content-provenance", "watermarking", "misinformation"],
    links: [{ learn: "use-ai-safely" }, { labs: "safety" }, { hub: "ai-and-privacy" }],
  },
  {
    slug: "voice-cloning",
    term: { en: "Voice cloning", fr: "Clonage de voix" },
    aka: { en: "Voice deepfake", fr: "Clonage vocal, hypertrucage vocal" },
    category: "media",
    short: {
      en: "Voice cloning uses AI to copy a person's voice from a short recording, so a computer can say anything in that voice. It has real uses, such as restoring the voice of someone who lost it to illness, and serious abuses, such as phone scams.",
      fr: "Le clonage de voix utilise l'IA pour copier la voix d'une personne à partir d'un court enregistrement, afin qu'un ordinateur puisse dire n'importe quoi avec cette voix. Il a de vrais usages, comme redonner sa voix à quelqu'un qui l'a perdue à cause d'une maladie, et de graves abus, comme les arnaques téléphoniques.",
    },
    kid: {
      en: "Voice cloning is AI copying someone's voice — so a phone call that sounds like Grandma might not be Grandma.",
      fr: "Le clonage de voix, c'est l'IA qui copie la voix de quelqu'un — alors un appel qui ressemble à la voix de grand-maman n'est peut-être pas grand-maman.",
    },
    example: {
      en: "A grandparent gets a panicked call in a grandchild's cloned voice asking for bail money. A family code word would have exposed it.",
      fr: "Un grand-parent reçoit un appel paniqué avec la voix clonée de son petit-enfant qui demande de l'argent pour une caution. Un mot de passe familial l'aurait démasqué.",
    },
    why: {
      en: "Agree on a family code word, hang up and call back on a number you know, and never send money because of a voice alone.",
      fr: "Convenez d'un mot de passe familial, raccrochez et rappelez à un numéro que vous connaissez, et n'envoyez jamais d'argent sur la seule foi d'une voix.",
    },
    related: ["deepfake", "text-to-speech", "speech-recognition", "personal-information"],
    links: [{ learn: "use-ai-safely" }, { labs: "safety" }],
  },
  {
    slug: "watermarking",
    term: { en: "AI watermarking", fr: "Tatouage numérique de l'IA" },
    aka: { en: "Watermark", fr: "Filigrane numérique" },
    category: "media",
    short: {
      en: "AI watermarking hides a signal in AI-generated images, audio, video or text so software can later recognise it as AI-made. Some watermarks are invisible; most can be weakened by cropping, editing or re-recording.",
      fr: "Le tatouage numérique de l'IA dissimule un signal dans les images, sons, vidéos ou textes générés par IA pour qu'un logiciel puisse ensuite les reconnaître comme tels. Certains filigranes sont invisibles; la plupart peuvent être affaiblis par un recadrage, une retouche ou un réenregistrement.",
    },
    kid: {
      en: "A watermark is a hidden \"made by AI\" stamp inside a picture or sound.",
      fr: "Un filigrane, c'est un tampon caché « fait par l'IA » à l'intérieur d'une image ou d'un son.",
    },
    example: {
      en: "Google adds an invisible SynthID watermark to images made with its tools, which a checker can detect.",
      fr: "Google ajoute un filigrane invisible SynthID aux images créées avec ses outils, qu'un vérificateur peut détecter.",
    },
    why: {
      en: "Watermarks help, but a missing watermark doesn't prove something is real. Combine them with provenance records and plain common sense.",
      fr: "Les filigranes aident, mais leur absence ne prouve pas qu'un contenu est authentique. Combinez-les avec les données de provenance et le simple bon sens.",
    },
    related: ["content-provenance", "deepfake", "ai-detector", "text-to-image"],
  },
  {
    slug: "content-provenance",
    term: { en: "Content provenance (C2PA)", fr: "Provenance du contenu (C2PA)" },
    aka: { en: "Content Credentials, C2PA", fr: "Content Credentials, C2PA" },
    category: "media",
    short: {
      en: "Content provenance is a record, attached to a photo, video or audio file, of where it came from and how it was edited — including whether AI was used. The open C2PA standard, shown to users as \"Content Credentials\", is backed by camera makers, software firms and news organisations.",
      fr: "La provenance du contenu est un registre, joint à une photo, une vidéo ou un fichier audio, qui indique d'où il vient et comment il a été modifié — y compris si l'IA a été utilisée. La norme ouverte C2PA, présentée aux utilisateurs sous le nom « Content Credentials », est appuyée par des fabricants d'appareils photo, des éditeurs de logiciels et des médias.",
    },
    kid: {
      en: "Content provenance is a picture's ID card that says where it came from and what was changed.",
      fr: "La provenance du contenu, c'est la carte d'identité d'une image qui dit d'où elle vient et ce qu'on y a changé.",
    },
    example: {
      en: "Clicking a small \"CR\" icon on a news photo shows which camera took it and that it was only cropped.",
      fr: "Cliquer sur une petite icône « CR » sur une photo de presse montre quel appareil l'a prise et qu'elle a seulement été recadrée.",
    },
    why: {
      en: "As fakes get better, proving what's real matters more for journalism, courts and elections. Provenance shows history; it can't tell you whether the content is true.",
      fr: "À mesure que les faux s'améliorent, prouver ce qui est réel compte davantage pour le journalisme, les tribunaux et les élections. La provenance montre l'historique; elle ne dit pas si le contenu est vrai.",
    },
    related: ["watermarking", "deepfake", "grounding", "misinformation"],
  },
  {
    slug: "ai-memory",
    term: { en: "AI memory", fr: "Mémoire de l'IA" },
    aka: { en: "Chat memory, personalisation", fr: "Mémoire des conversations, personnalisation" },
    category: "using",
    short: {
      en: "AI memory is a feature that lets an assistant remember facts about you across conversations — your job, your preferences, your projects — and use them later. It is usually optional and can be viewed, edited or turned off in settings.",
      fr: "La mémoire de l'IA est une fonction qui permet à un assistant de retenir des faits sur vous d'une conversation à l'autre — votre emploi, vos préférences, vos projets — et de s'en servir plus tard. Elle est généralement facultative et peut être consultée, modifiée ou désactivée dans les paramètres.",
    },
    kid: {
      en: "AI memory is when the assistant remembers things you told it last time.",
      fr: "La mémoire de l'IA, c'est quand l'assistant se souvient de ce que tu lui as dit la dernière fois.",
    },
    example: {
      en: "You mention once that you're vegetarian, and weeks later the assistant suggests only vegetarian recipes.",
      fr: "Vous mentionnez une fois que vous êtes végétarien, et des semaines plus tard l'assistant ne propose que des recettes végétariennes.",
    },
    why: {
      en: "Memory is convenient but builds a profile of you. Review what it has stored, delete what you don't want kept, and use temporary chats for sensitive topics.",
      fr: "La mémoire est pratique, mais elle construit un profil de vous. Révisez ce qu'elle a conservé, effacez ce que vous ne voulez pas garder et utilisez les conversations temporaires pour les sujets délicats.",
    },
    related: ["personal-information", "context-window", "ai-assistant", "data-retention"],
    links: [{ hub: "use-ai-assistants-safely" }, { hub: "ai-and-privacy" }],
  },
];
