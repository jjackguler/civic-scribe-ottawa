import { HUBS, type Hub } from "../hubs";

export const HUB: Hub = {
  ...HUBS.find(h => h.slug === "ai-for-students")!,
  dek: {
    en: "Used well, AI is a patient tutor that never gets tired of your questions. Used badly, it does your thinking for you and can get you in trouble. Here's how to stay on the right side of that line — for high school, college and university students.",
    fr: "Bien utilisée, l'IA est un tuteur patient qui ne se lasse jamais de vos questions. Mal utilisée, elle pense à votre place et peut vous attirer des ennuis. Voici comment rester du bon côté de la ligne — au secondaire, au cégep, au collège et à l'université.",
  },
  sections: [
    {
      id: "ground-rules",
      h: { en: "First: know your class's rules", fr: "D'abord : connaître les règles de votre cours" },
      blocks: [
        { k: "p", t: {
          en: "There is no single rule for AI at school. Your school board, college or university may have a policy, and each teacher or professor can set different rules for each assignment — from \"no AI at all\" to \"use it, but show how\". When the rules aren't clear, ask before you start, and keep the answer in writing.",
          fr: "Il n'existe pas de règle unique sur l'IA à l'école. Votre centre de services scolaire, cégep, collège ou université peut avoir une politique, et chaque enseignant ou professeur peut fixer des règles différentes pour chaque travail — de « aucune IA » à « utilisez-la, mais montrez comment ». Quand les règles ne sont pas claires, demandez avant de commencer et gardez la réponse par écrit.",
        } },
        { k: "tip", label: { en: "The one-question test", fr: "Le test en une question" }, t: {
          en: "Ask yourself: \"Is the AI helping me learn this, or doing the part I'm supposed to learn?\" If it's the second, it's probably not allowed — and it won't help you on the exam.",
          fr: "Demandez-vous : « L'IA m'aide-t-elle à apprendre ceci, ou fait-elle la partie que je suis censé apprendre? » Si c'est la deuxième option, ce n'est probablement pas permis — et ça ne vous aidera pas à l'examen.",
        } },
      ],
    },
    {
      id: "ok-or-not",
      h: { en: "What's usually OK, and what usually isn't", fr: "Ce qui est généralement permis, et ce qui ne l'est pas" },
      blocks: [
        { k: "table", caption: { en: "Common student uses of AI and whether they're usually allowed (always check your own course rules)", fr: "Usages étudiants courants de l'IA et s'ils sont généralement permis (vérifiez toujours les règles de votre cours)" },
          head: [{ en: "Use", fr: "Usage" }, { en: "Usually…", fr: "Généralement…" }, { en: "Why", fr: "Pourquoi" }],
          rows: [
            [{ en: "Explaining a concept you don't get", fr: "Expliquer une notion que vous ne comprenez pas" }, { en: "OK", fr: "Permis" }, { en: "It's tutoring; you still do the work", fr: "C'est du tutorat; vous faites encore le travail" }],
            [{ en: "Quizzing you before a test", fr: "Vous interroger avant un examen" }, { en: "OK", fr: "Permis" }, { en: "Practice builds real memory", fr: "La pratique construit une vraie mémoire" }],
            [{ en: "Brainstorming topics or angles", fr: "Trouver des sujets ou des angles" }, { en: "Often OK — say so", fr: "Souvent permis — dites-le" }, { en: "The ideas you choose and develop are yours", fr: "Les idées que vous choisissez et développez sont les vôtres" }],
            [{ en: "Feedback on your own draft", fr: "Commentaires sur votre propre brouillon" }, { en: "Often OK — say so", fr: "Souvent permis — dites-le" }, { en: "Like a writing centre, if you make the changes", fr: "Comme un centre d'aide à la rédaction, si vous faites les changements" }],
            [{ en: "Fixing grammar and spelling", fr: "Corriger la grammaire et l'orthographe" }, { en: "Depends — ask", fr: "Ça dépend — demandez" }, { en: "Fine in most classes, not in language courses", fr: "Correct dans la plupart des cours, pas en cours de langue" }],
            [{ en: "Writing paragraphs or the whole essay", fr: "Rédiger des paragraphes ou tout le texte" }, { en: "Not OK unless explicitly allowed", fr: "Interdit sauf permission explicite" }, { en: "Submitting it as yours is academic misconduct", fr: "Le remettre comme le vôtre est de l'inconduite académique" }],
            [{ en: "Answering take-home test questions", fr: "Répondre aux questions d'un examen maison" }, { en: "Not OK", fr: "Interdit" }, { en: "It tests what you know, not what the AI knows", fr: "On évalue ce que vous savez, pas ce que sait l'IA" }],
            [{ en: "Generating citations or a bibliography", fr: "Produire des références ou une bibliographie" }, { en: "Risky", fr: "Risqué" }, { en: "AI often invents sources that don't exist", fr: "L'IA invente souvent des sources inexistantes" }],
          ] },
      ],
    },
    {
      id: "study",
      h: { en: "Study prompts that actually work", fr: "Des requêtes d'étude qui fonctionnent vraiment" },
      blocks: [
        { k: "p", t: {
          en: "The best learning prompts make the AI ask you questions instead of handing you answers. Copy these and fill in the blanks:",
          fr: "Les meilleures requêtes d'apprentissage font en sorte que l'IA vous pose des questions au lieu de vous donner les réponses. Copiez-les et remplissez les blancs :",
        } },
        { k: "ul", items: [
          { en: "**Socratic tutor:** \"I'm studying [topic] for grade 11. Don't give me the answer. Ask me one question at a time to help me figure out [problem], and tell me if my reasoning is off.\"", fr: "**Tuteur socratique :** « J'étudie [sujet] en 5e secondaire. Ne me donne pas la réponse. Pose-moi une question à la fois pour m'aider à résoudre [problème], et dis-moi si mon raisonnement déraille. »" },
          { en: "**Explain three ways:** \"Explain [concept] three ways: like I'm 12, with an everyday analogy, and the way my textbook would.\"", fr: "**Expliquer de trois façons :** « Explique [notion] de trois façons : comme à un enfant de 12 ans, avec une analogie du quotidien, et comme le ferait mon manuel. »" },
          { en: "**Practice test:** \"Make 10 multiple-choice questions on [chapter], mixing easy and hard. Wait for my answers, then explain the ones I got wrong.\"", fr: "**Examen d'entraînement :** « Fais 10 questions à choix multiples sur [chapitre], faciles et difficiles. Attends mes réponses, puis explique celles que j'ai ratées. »" },
          { en: "**Find my gaps:** \"Here are my notes on [topic]. What important ideas are missing or wrong? Don't rewrite them.\"", fr: "**Trouver mes lacunes :** « Voici mes notes sur [sujet]. Quelles idées importantes manquent ou sont fausses? Ne les réécris pas. »" },
          { en: "**Steelman the other side:** \"I'm arguing that [thesis]. Give me the three strongest objections so I can answer them.\"", fr: "**L'avocat du diable :** « Je soutiens que [thèse]. Donne-moi les trois objections les plus fortes pour que je puisse y répondre. »" },
        ] },
        { k: "p", t: {
          en: "Keep the habit going with real material: [Today in 60 seconds](/today) on the day's AI news, then the daily [Broadsheet 5 quiz](/quiz).",
          fr: "Gardez l'habitude avec du vrai contenu : [L'actualité en 60 secondes](/today) sur l'IA du jour, puis le [quiz quotidien Les 5 du Broadsheet](/quiz).",
        } },
      ],
    },
    {
      id: "writing",
      h: { en: "Writing with AI without losing your voice", fr: "Écrire avec l'IA sans perdre sa voix" },
      blocks: [
        { k: "ol", items: [
          { en: "Do your own thinking first: a rough outline or a messy paragraph in your words.", fr: "Faites d'abord votre propre réflexion : un plan sommaire ou un paragraphe brouillon dans vos mots." },
          { en: "Ask for feedback, not rewrites: \"Where is my argument weakest? Which sentence is unclear?\"", fr: "Demandez des commentaires, pas une réécriture : « Où mon argument est-il le plus faible? Quelle phrase est floue? »" },
          { en: "Make the changes yourself, so the final text is yours.", fr: "Faites les changements vous-même, pour que le texte final soit le vôtre." },
          { en: "Keep your drafts and version history — they show your process if anyone asks.", fr: "Gardez vos brouillons et l'historique des versions — ils montrent votre démarche si on vous le demande." },
          { en: "Disclose AI help the way your teacher asks, for example: \"I used Claude to get feedback on the structure of my second draft.\"", fr: "Déclarez l'aide de l'IA comme le demande votre enseignant, par exemple : « J'ai utilisé Claude pour obtenir des commentaires sur la structure de mon deuxième brouillon. »" },
        ] },
        { k: "h3", t: { en: "Citing AI", fr: "Citer l'IA" } },
        { k: "p", t: {
          en: "Style guides such as APA and MLA now have formats for citing AI tools. In general you name the tool and company, the date, and what you asked. But an AI is not a source of facts: cite the real articles and books where the facts come from, and check that they exist.",
          fr: "Les guides de style comme APA et MLA proposent maintenant des formats pour citer les outils d'IA. En général, on nomme l'outil et l'entreprise, la date et ce qu'on a demandé. Mais une IA n'est pas une source de faits : citez les vrais articles et livres d'où viennent les faits, et vérifiez qu'ils existent.",
        } },
      ],
    },
    {
      id: "research",
      h: { en: "Research: check everything", fr: "La recherche : tout vérifier" },
      blocks: [
        { k: "p", t: {
          en: "AI is good at helping you understand a field and find search terms. It is unreliable as a source. Models [hallucinate](/glossary/hallucination) references — plausible titles, real-sounding authors, journals that exist — for papers that were never written.",
          fr: "L'IA aide bien à comprendre un domaine et à trouver des mots-clés. Elle n'est pas fiable comme source. Les modèles [inventent](/glossary/hallucination) des références — titres plausibles, auteurs crédibles, revues réelles — pour des articles qui n'ont jamais été écrits.",
        } },
        { k: "ul", items: [
          { en: "Find every source in your library's database or a search engine before you use it.", fr: "Retrouvez chaque source dans la base de données de votre bibliothèque ou un moteur de recherche avant de l'utiliser." },
          { en: "Read the part you cite; don't trust an AI summary of it.", fr: "Lisez le passage que vous citez; ne vous fiez pas au résumé d'une IA." },
          { en: "Ask your librarian — they know which AI research tools your school supports.", fr: "Demandez à votre bibliothécaire — il sait quels outils de recherche IA votre établissement prend en charge." },
        ] },
      ],
    },
    {
      id: "detectors",
      h: { en: "AI detectors and false accusations", fr: "Les détecteurs d'IA et les fausses accusations" },
      blocks: [
        { k: "p", t: {
          en: "[AI detectors](/glossary/ai-detector) are unreliable, especially for students writing in their second language and for short or formal texts. Many institutions advise staff not to rely on them alone. If you're accused of using AI when you didn't:",
          fr: "Les [détecteurs d'IA](/glossary/ai-detector) ne sont pas fiables, surtout pour les élèves qui écrivent dans leur langue seconde et pour les textes courts ou formels. Beaucoup d'établissements recommandent de ne pas s'y fier seuls. Si on vous accuse à tort d'avoir utilisé l'IA :",
        } },
        { k: "ol", items: [
          { en: "Stay calm and ask what the concern is based on.", fr: "Restez calme et demandez sur quoi repose l'inquiétude." },
          { en: "Show your process: notes, outlines, drafts, document version history, browser history of your sources.", fr: "Montrez votre démarche : notes, plans, brouillons, historique des versions du document, historique de navigation de vos sources." },
          { en: "Offer to explain your work or answer questions about it in person.", fr: "Proposez d'expliquer votre travail ou de répondre à des questions en personne." },
          { en: "Ask for your school's academic integrity policy and appeal process, and bring a parent, advisor or student union representative if you can.", fr: "Demandez la politique d'intégrité académique et la procédure d'appel de l'établissement, et faites-vous accompagner par un parent, un conseiller ou un représentant étudiant si possible." },
        ] },
      ],
    },
    {
      id: "privacy",
      h: { en: "Privacy and age limits", fr: "Vie privée et âge minimal" },
      blocks: [
        { k: "ul", items: [
          { en: "Check the minimum age: Claude.ai requires 18; ChatGPT requires 13 with a parent's permission under 18; school-provided tools may have their own rules.", fr: "Vérifiez l'âge minimal : Claude.ai exige 18 ans; ChatGPT exige 13 ans et la permission d'un parent avant 18 ans; les outils fournis par l'école peuvent avoir leurs propres règles." },
          { en: "Use the tools your school provides when you can — they usually come with stronger privacy terms.", fr: "Utilisez les outils fournis par l'école quand c'est possible — ils offrent généralement de meilleures garanties de confidentialité." },
          { en: "Don't paste classmates' work, names or photos, or your own personal details.", fr: "Ne collez pas le travail, les noms ou les photos de camarades, ni vos propres renseignements personnels." },
          { en: "Read [How to use ChatGPT, Claude and Gemini safely](/guides/use-ai-assistants-safely) for the settings to change.", fr: "Lisez [Utiliser ChatGPT, Claude et Gemini en sécurité](/guides/use-ai-assistants-safely) pour les réglages à modifier." },
        ] },
      ],
    },
    {
      id: "access",
      h: { en: "AI as an accessibility tool", fr: "L'IA comme outil d'accessibilité" },
      blocks: [
        { k: "p", t: {
          en: "For students with learning disabilities, ADHD, vision or hearing loss, or who are learning in a new language, AI can read text aloud, simplify dense readings, turn lectures into notes and help organise tasks. If AI is part of your accommodation, get it documented with your school's accessibility or student services office, so it's clear what you're allowed to use.",
          fr: "Pour les élèves ayant des troubles d'apprentissage, un TDAH, une perte de vision ou d'audition, ou qui apprennent dans une nouvelle langue, l'IA peut lire à voix haute, simplifier des lectures denses, transformer des cours en notes et aider à organiser les tâches. Si l'IA fait partie de vos mesures d'adaptation, faites-la consigner auprès du service d'accessibilité ou des services aux étudiants, pour qu'il soit clair ce que vous pouvez utiliser.",
        } },
      ],
    },
    {
      id: "future",
      h: { en: "Skills that will matter", fr: "Les compétences qui compteront" },
      blocks: [
        { k: "p", t: {
          en: "Employers increasingly expect graduates to use AI tools well — and to think for themselves. The skills that last are the ones AI can't do for you: judging what's true, explaining clearly, working with people, and knowing a subject well enough to spot when the AI is wrong. Our [Labs](/labs) list free courses, many in French, from beginner to builder; see also [AI and jobs in Canada](/guides/ai-and-jobs-in-canada).",
          fr: "Les employeurs s'attendent de plus en plus à ce que les diplômés utilisent bien les outils d'IA — et pensent par eux-mêmes. Les compétences durables sont celles que l'IA ne peut pas exercer à votre place : juger de ce qui est vrai, expliquer clairement, travailler avec les autres et connaître assez bien une matière pour voir quand l'IA se trompe. Nos [Labs](/labs) répertorient des cours gratuits, dont plusieurs en français, du débutant au créateur; voir aussi [L'IA et l'emploi au Canada](/guides/ai-and-jobs-in-canada).",
        } },
      ],
    },
    {
      id: "parents-teachers",
      h: { en: "For parents and teachers", fr: "Pour les parents et les enseignants" },
      blocks: [
        { k: "ul", items: [
          { en: "Set clear, assignment-level rules and explain the reason behind them.", fr: "Fixez des règles claires pour chaque travail et expliquez-en la raison." },
          { en: "Design tasks that show process: drafts, oral check-ins, reflections on how AI was used.", fr: "Concevez des tâches qui montrent la démarche : brouillons, retours oraux, réflexions sur l'usage de l'IA." },
          { en: "Don't rely on AI detectors as proof.", fr: "Ne vous fiez pas aux détecteurs d'IA comme preuve." },
          { en: "For younger children, start with our [Young Lab](/labs/young) games and the [grown-ups' guide](/labs/young/grown-ups); for educators, the [Labs path for educators and parents](/labs/educators).", fr: "Pour les plus jeunes, commencez par les jeux du [Jeune Labo](/labs/young) et le [guide des adultes](/labs/young/grown-ups); pour le personnel enseignant, le [parcours Labs pour enseignants et parents](/labs/educators)." },
        ] },
      ],
    },
  ],
  faq: [
    {
      q: { en: "Is using ChatGPT for homework cheating?", fr: "Utiliser ChatGPT pour les devoirs, est-ce tricher?" },
      a: { en: "It depends on how you use it and on your class's rules. Using it to explain concepts or quiz you is usually fine; submitting AI-written work as your own is usually academic misconduct. When in doubt, ask your teacher and disclose what you did.", fr: "Cela dépend de l'usage et des règles du cours. S'en servir pour expliquer des notions ou s'exercer est généralement correct; remettre un travail rédigé par l'IA comme le sien est généralement de l'inconduite académique. Dans le doute, demandez à votre enseignant et déclarez ce que vous avez fait." },
    },
    {
      q: { en: "Can teachers tell if I used AI?", fr: "Les enseignants peuvent-ils savoir si j'ai utilisé l'IA?" },
      a: { en: "Sometimes, from changes in style or from facts and sources that don't check out. AI detectors are unreliable, so many teachers instead ask about your process or discuss the work with you. The safest path is to follow the rules and be open.", fr: "Parfois, à cause d'un changement de style ou de faits et de sources qui ne tiennent pas. Les détecteurs ne sont pas fiables : beaucoup d'enseignants posent plutôt des questions sur votre démarche ou discutent du travail avec vous. Le plus sûr est de suivre les règles et d'être transparent." },
    },
    {
      q: { en: "How do I cite ChatGPT or Claude?", fr: "Comment citer ChatGPT ou Claude?" },
      a: { en: "Follow the style your course uses (APA, MLA, Chicago); each has a format for AI tools that names the tool, its maker, the date and your prompt. Cite the original sources for any facts, and check they exist.", fr: "Suivez le style exigé par le cours (APA, MLA, Chicago); chacun propose un format pour les outils d'IA qui nomme l'outil, son concepteur, la date et votre requête. Citez les sources originales pour les faits, et vérifiez qu'elles existent." },
    },
    {
      q: { en: "What's the best AI for studying?", fr: "Quelle est la meilleure IA pour étudier?" },
      a: { en: "Any major assistant can tutor well if you prompt it to ask you questions rather than give answers. Use the one your school provides if there is one, since it usually comes with better privacy protections.", fr: "N'importe quel grand assistant peut bien jouer le rôle de tuteur si vous lui demandez de vous poser des questions plutôt que de donner les réponses. Utilisez celui fourni par l'école s'il y en a un, car il offre généralement une meilleure protection de la vie privée." },
    },
  ],
  terms: ["ai-detector", "hallucination", "prompt", "chain-of-thought", "ai-literacy", "personal-information", "reskilling"],
  labs: ["start-here", "prompting", "educators"],
  sources: [
    { name: { en: "MediaSmarts — digital and media literacy", fr: "HabiloMédias — littératie numérique et médiatique" }, url: { en: "https://mediasmarts.ca/", fr: "https://habilomedias.ca/" } },
    { name: { en: "Office of the Privacy Commissioner of Canada — youth privacy", fr: "Commissariat à la protection de la vie privée du Canada — jeunes" }, url: { en: "https://www.priv.gc.ca/en/", fr: "https://www.priv.gc.ca/fr/" } },
  ],
};
