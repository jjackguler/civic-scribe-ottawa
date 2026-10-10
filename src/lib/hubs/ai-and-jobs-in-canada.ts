import { HUBS, type Hub } from "../hubs";

export const HUB: Hub = {
  ...HUBS.find(h => h.slug === "ai-and-jobs-in-canada")!,
  dek: {
    en: "AI is changing work in Canada task by task, not overnight. Here is what the evidence says, which kinds of jobs are changing first, the rights you already have, how AI is used in hiring, and a practical 90-day plan.",
    fr: "L'IA transforme le travail au Canada tâche par tâche, pas du jour au lendemain. Voici ce que disent les données, les emplois qui changent en premier, les droits que vous avez déjà, l'usage de l'IA à l'embauche et un plan concret de 90 jours.",
  },
  sections: [
    {
      id: "short-answer",
      h: { en: "The short answer", fr: "La réponse courte" },
      blocks: [
        { k: "ul", items: [
          { en: "**Most jobs will change; fewer will disappear outright.** AI usually takes over some tasks inside a job — drafting, sorting, summarising — while people keep the judgement, relationships and responsibility.", fr: "**La plupart des emplois vont changer; moins vont disparaître.** L'IA prend généralement en charge certaines tâches d'un emploi — rédiger, trier, résumer — tandis que les gens gardent le jugement, les relations et la responsabilité." },
          { en: "**Office and knowledge work is most exposed.** Unlike earlier automation, generative AI reaches university-educated and white-collar jobs first.", fr: "**Le travail de bureau et du savoir est le plus exposé.** Contrairement aux vagues d'automatisation précédentes, l'IA générative touche d'abord les emplois de bureau et les diplômés universitaires." },
          { en: "**Skills with AI are becoming a hiring advantage.** People who use AI well, and know when not to, are in demand.", fr: "**Savoir utiliser l'IA devient un atout à l'embauche.** Les personnes qui l'utilisent bien, et savent quand s'en abstenir, sont recherchées." },
          { en: "**You have rights.** Human-rights, privacy and employment laws already apply when employers use AI.", fr: "**Vous avez des droits.** Les lois sur les droits de la personne, la vie privée et l'emploi s'appliquent déjà quand un employeur utilise l'IA." },
        ] },
      ],
    },
    {
      id: "evidence",
      h: { en: "What the research says", fr: "Ce que dit la recherche" },
      blocks: [
        { k: "p", t: {
          en: "Statistics Canada's 2024 experimental estimates put roughly six in ten Canadian workers in occupations highly exposed to AI. About half of those are in jobs where AI is more likely to complement the work (think doctors, engineers, teachers, where judgement and responsibility stay human), and about half in jobs where it could more easily take over tasks (such as some clerical, administrative and customer-service roles). The rest — many trades, care and manual jobs — are less exposed for now.",
          fr: "Selon les estimations expérimentales publiées en 2024 par Statistique Canada, environ six travailleurs canadiens sur dix occupent des professions fortement exposées à l'IA. Environ la moitié d'entre eux sont dans des emplois où l'IA est plus susceptible de compléter le travail (médecins, ingénieurs, enseignants, où le jugement et la responsabilité restent humains), et environ la moitié dans des emplois où elle pourrait plus facilement prendre en charge des tâches (certains postes de bureau, administratifs et de service à la clientèle). Les autres — beaucoup de métiers spécialisés, de soins et d'emplois manuels — sont moins exposés pour l'instant.",
        } },
        { k: "p", t: {
          en: "Exposure is not the same as job loss. Adoption is still uneven: Statistics Canada's business surveys found that about one in eight businesses used AI to produce goods or deliver services in mid-2025, roughly double a year earlier, and most of those reported no change in their total headcount. The effects so far show up more in hiring for entry-level roles and in how tasks are divided than in mass layoffs. That can change quickly, which is why we track it on our [People & skills desk](/news?section=people).",
          fr: "Être exposé ne veut pas dire perdre son emploi. L'adoption reste inégale : les enquêtes de Statistique Canada ont montré qu'environ une entreprise sur huit utilisait l'IA pour produire des biens ou offrir des services à la mi-2025, environ le double d'un an plus tôt, et la plupart n'ont signalé aucun changement de leur effectif total. Jusqu'ici, les effets se voient davantage dans l'embauche aux postes de premier échelon et la répartition des tâches que dans des licenciements massifs. Cela peut changer vite, et c'est pourquoi nous le suivons dans notre [section Personnes et compétences](/news?section=people).",
        } },
      ],
    },
    {
      id: "jobs",
      h: { en: "How different kinds of work are changing", fr: "Comment différents types de travail changent" },
      blocks: [
        { k: "table", caption: { en: "Kinds of work, what AI is doing in them today, and what stays human", fr: "Types de travail, ce que l'IA y fait aujourd'hui et ce qui reste humain" },
          head: [{ en: "Kind of work", fr: "Type de travail" }, { en: "What AI is doing", fr: "Ce que fait l'IA" }, { en: "What stays human", fr: "Ce qui reste humain" }],
          rows: [
            [{ en: "Administrative and clerical", fr: "Administration et soutien de bureau" }, { en: "Scheduling, data entry, drafting letters, summarising meetings", fr: "Planification, saisie, rédaction de lettres, résumés de réunions" }, { en: "Exceptions, judgement calls, people who need help", fr: "Exceptions, décisions délicates, gens qui ont besoin d'aide" }],
            [{ en: "Customer service and call centres", fr: "Service à la clientèle et centres d'appels" }, { en: "Chatbots for routine questions, suggested replies, call summaries", fr: "Robots pour les questions courantes, réponses suggérées, résumés d'appels" }, { en: "Complaints, complex cases, empathy, accountability", fr: "Plaintes, cas complexes, empathie, responsabilité" }],
            [{ en: "Software and IT", fr: "Logiciels et TI" }, { en: "Writing and reviewing code, tests, documentation", fr: "Écriture et révision de code, tests, documentation" }, { en: "Design, security, deciding what to build", fr: "Conception, sécurité, choix de ce qu'on bâtit" }],
            [{ en: "Marketing, media and design", fr: "Marketing, médias et design" }, { en: "First drafts, image variations, translation, research", fr: "Premiers jets, variantes d'images, traduction, recherche" }, { en: "Original reporting, taste, brand, rights and consent", fr: "Reportage original, goût, marque, droits et consentement" }],
            [{ en: "Finance, law and accounting", fr: "Finance, droit et comptabilité" }, { en: "Document review, research, reconciliation, drafting", fr: "Revue de documents, recherche, rapprochements, rédaction" }, { en: "Advice, professional responsibility, negotiation", fr: "Conseil, responsabilité professionnelle, négociation" }],
            [{ en: "Health care", fr: "Santé" }, { en: "Clinical note-taking (\"AI scribes\"), imaging support, triage help", fr: "Prise de notes cliniques (« scribes IA »), soutien en imagerie, aide au triage" }, { en: "Diagnosis decisions, care, consent, the patient relationship", fr: "Décisions diagnostiques, soins, consentement, relation avec le patient" }],
            [{ en: "Teaching", fr: "Enseignement" }, { en: "Lesson planning, differentiated materials, feedback drafts", fr: "Planification, matériel différencié, ébauches de commentaires" }, { en: "Relationships, motivation, assessment, care", fr: "Relations, motivation, évaluation, bienveillance" }],
            [{ en: "Skilled trades and field work", fr: "Métiers spécialisés et travail sur le terrain" }, { en: "Quotes, scheduling, manuals, diagnostics on a phone", fr: "Soumissions, horaires, manuels, diagnostics sur téléphone" }, { en: "The hands-on work itself, safety, problem-solving on site", fr: "Le travail manuel lui-même, la sécurité, la résolution de problèmes sur place" }],
          ] },
      ],
    },
    {
      id: "rights",
      h: { en: "Your rights when employers use AI", fr: "Vos droits quand l'employeur utilise l'IA" },
      blocks: [
        { k: "p", t: {
          en: "Canada has no AI-specific employment law, but the laws you already have apply to decisions made with AI. Employment law is mostly provincial, so details depend on where you work.",
          fr: "Le Canada n'a pas de loi sur l'emploi propre à l'IA, mais les lois existantes s'appliquent aux décisions prises avec l'IA. Le droit du travail est surtout provincial; les détails dépendent donc de l'endroit où vous travaillez.",
        } },
        { k: "ul", items: [
          { en: "**Human rights.** An AI tool that screens out people because of race, sex, age, disability, religion or another protected ground can be discrimination, whoever built the tool.", fr: "**Les droits de la personne.** Un outil d'IA qui écarte des gens en raison de la race, du sexe, de l'âge, d'un handicap, de la religion ou d'un autre motif protégé peut constituer de la discrimination, peu importe qui l'a conçu." },
          { en: "**Ontario job postings.** Since January 1, 2026, employers in Ontario with 25 or more employees must say in publicly advertised job postings if they use AI to screen, assess or select applicants.", fr: "**Les offres d'emploi en Ontario.** Depuis le 1er janvier 2026, les employeurs ontariens de 25 employés ou plus doivent indiquer dans leurs offres d'emploi publiques s'ils utilisent l'IA pour présélectionner, évaluer ou choisir les candidats." },
          { en: "**Electronic monitoring.** Ontario employers with 25 or more employees must have a written policy saying whether and how they monitor employees electronically.", fr: "**La surveillance électronique.** En Ontario, les employeurs de 25 employés ou plus doivent avoir une politique écrite indiquant s'ils surveillent électroniquement leurs employés, et comment." },
          { en: "**Québec.** Under [Law 25](/glossary/law-25), an organisation must tell you when a decision about you is based solely on automated processing, and on request explain the main factors and let you have it reviewed by a person.", fr: "**Le Québec.** En vertu de la [Loi 25](/glossary/law-25), une organisation doit vous informer quand une décision vous concernant repose exclusivement sur un traitement automatisé et, sur demande, en expliquer les principaux facteurs et vous permettre de la faire réviser par une personne." },
          { en: "**Privacy.** Federally regulated employers, and those in provinces with private-sector privacy laws, must limit what employee data they collect and use it only for reasonable purposes.", fr: "**La vie privée.** Les employeurs sous réglementation fédérale, et ceux des provinces dotées d'une loi sur le secteur privé, doivent limiter les données qu'ils recueillent sur leurs employés et ne s'en servir qu'à des fins raisonnables." },
          { en: "**Unions.** Many collective agreements now address technological change; if you're unionised, your local can ask for consultation and training.", fr: "**Les syndicats.** Beaucoup de conventions collectives traitent maintenant des changements technologiques; si vous êtes syndiqué, votre section locale peut demander consultation et formation." },
        ] },
      ],
    },
    {
      id: "hiring",
      h: { en: "If you're looking for work: AI in hiring", fr: "Si vous cherchez un emploi : l'IA à l'embauche" },
      blocks: [
        { k: "p", t: {
          en: "Many employers use software to sort applications, and some use AI to score video interviews or online assessments. You can use AI too — carefully.",
          fr: "Beaucoup d'employeurs utilisent des logiciels pour trier les candidatures, et certains se servent de l'IA pour évaluer des entrevues vidéo ou des tests en ligne. Vous pouvez aussi utiliser l'IA — avec prudence.",
        } },
        { k: "ul", items: [
          { en: "Tailor each résumé to the posting's actual wording and skills, in a simple format that software can read (no text in images or tables).", fr: "Adaptez chaque CV au vocabulaire et aux compétences de l'offre, dans un format simple que les logiciels peuvent lire (pas de texte en image ni en tableau)." },
          { en: "Use AI to check your résumé against the posting and to practise interview questions — not to invent experience. Recruiters notice generic AI writing.", fr: "Servez-vous de l'IA pour comparer votre CV à l'offre et vous exercer aux entrevues — pas pour inventer de l'expérience. Les recruteurs repèrent les textes d'IA génériques." },
          { en: "Ask whether AI is used in the process and whether a person reviews the results; request an accommodation if an automated test doesn't work for your disability.", fr: "Demandez si l'IA est utilisée dans le processus et si une personne en examine les résultats; demandez une mesure d'adaptation si un test automatisé ne convient pas à votre handicap." },
          { en: "Use the Government of Canada's [Job Bank](https://www.jobbank.gc.ca/) to see demand and wages for occupations in your region.", fr: "Consultez le [Guichet-Emplois](https://www.guichetemplois.gc.ca/) du gouvernement du Canada pour voir la demande et les salaires par profession dans votre région." },
        ] },
      ],
    },
    {
      id: "plan",
      h: { en: "A 90-day plan for workers", fr: "Un plan de 90 jours pour les travailleurs" },
      blocks: [
        { k: "h3", t: { en: "Days 1–30: learn by doing", fr: "Jours 1 à 30 : apprendre en pratiquant" } },
        { k: "ul", items: [
          { en: "Pick one assistant your employer allows and use it daily for low-risk tasks: summarising, drafting, planning.", fr: "Choisissez un assistant permis par votre employeur et utilisez-le chaque jour pour des tâches à faible risque : résumer, rédiger, planifier." },
          { en: "Complete the free [AI at work Labs path](/labs/work) (in English and French).", fr: "Suivez le [parcours Labs L'IA au travail](/labs/work), gratuit, en français et en anglais." },
        ] },
        { k: "h3", t: { en: "Days 31–60: map your own job", fr: "Jours 31 à 60 : cartographier votre emploi" } },
        { k: "ul", items: [
          { en: "List your ten most common tasks. Mark which ones AI could draft, which it could check, and which need you.", fr: "Dressez la liste de vos dix tâches les plus courantes. Indiquez celles que l'IA pourrait ébaucher, celles qu'elle pourrait vérifier et celles qui exigent votre présence." },
          { en: "Pick one task to improve with AI and measure the time saved — that's a concrete result to share with your manager.", fr: "Choisissez une tâche à améliorer avec l'IA et mesurez le temps gagné — un résultat concret à présenter à votre gestionnaire." },
        ] },
        { k: "h3", t: { en: "Days 61–90: build what lasts", fr: "Jours 61 à 90 : bâtir ce qui dure" } },
        { k: "ul", items: [
          { en: "Strengthen the human side of your role: client relationships, judgement, teaching others, domain expertise.", fr: "Renforcez le côté humain de votre rôle : relations avec les clients, jugement, transmission, expertise du domaine." },
          { en: "Look at training support: the federal Canada Training Credit (refundable, building up to $250 a year for eligible workers) and provincial programs through Employment Ontario, Services Québec, WorkBC and others.", fr: "Examinez l'aide à la formation : l'Allocation canadienne pour la formation (remboursable, qui s'accumule jusqu'à 250 $ par année pour les travailleurs admissibles) et les programmes provinciaux d'Emploi Ontario, de Services Québec, de WorkBC et d'autres." },
        ] },
      ],
    },
    {
      id: "employers",
      h: { en: "For employers: adopt AI without losing your people", fr: "Pour les employeurs : adopter l'IA sans perdre vos gens" },
      blocks: [
        { k: "ol", items: [
          { en: "Tell staff early what you're testing and why. Involve the people who do the work.", fr: "Dites tôt au personnel ce que vous testez et pourquoi. Impliquez les gens qui font le travail." },
          { en: "Write a short AI policy (see our [template](/guides/ai-for-small-business#policy)).", fr: "Rédigez une courte politique sur l'IA (voir notre [modèle](/guides/ai-for-small-business#policy))." },
          { en: "Train everyone, not only the enthusiasts; pay for the time.", fr: "Formez tout le monde, pas seulement les enthousiastes; payez le temps de formation." },
          { en: "Keep a person accountable for any decision about hiring, pay, discipline or dismissal.", fr: "Gardez une personne responsable de toute décision d'embauche, de rémunération, de discipline ou de congédiement." },
          { en: "Check AI hiring tools for bias and disclose their use, as Ontario now requires.", fr: "Vérifiez les biais des outils d'embauche par IA et déclarez leur usage, comme l'exige maintenant l'Ontario." },
          { en: "Look for adoption funding on our [funding page](/funding).", fr: "Cherchez du financement pour l'adoption sur notre [page de financement](/funding)." },
        ] },
      ],
    },
  ],
  faq: [
    {
      q: { en: "Will AI take my job?", fr: "L'IA va-t-elle prendre mon emploi?" },
      a: { en: "For most people, AI is more likely to change parts of the job than to replace it entirely, at least in the next few years. Roles built mostly on routine writing, data entry or standard answers face the most change. Learning to use AI well in your field is the best protection.", fr: "Pour la plupart des gens, l'IA risque davantage de changer une partie du travail que de le remplacer entièrement, du moins dans les prochaines années. Les postes fondés surtout sur la rédaction routinière, la saisie de données ou les réponses standard sont les plus touchés. Apprendre à bien utiliser l'IA dans son domaine est la meilleure protection." },
    },
    {
      q: { en: "Which jobs are safest from AI?", fr: "Quels emplois sont les plus à l'abri de l'IA?" },
      a: { en: "Jobs that combine hands-on physical work, care for people, or judgement and accountability in unpredictable situations — skilled trades, nursing, early childhood education, many health and emergency roles — are least exposed today.", fr: "Les emplois qui combinent travail manuel, soins aux personnes, ou jugement et responsabilité dans des situations imprévisibles — métiers spécialisés, soins infirmiers, éducation à la petite enfance, beaucoup de rôles en santé et en urgence — sont les moins exposés aujourd'hui." },
    },
    {
      q: { en: "Do employers have to tell me they use AI?", fr: "Les employeurs doivent-ils me dire qu'ils utilisent l'IA?" },
      a: { en: "In Ontario, employers with 25 or more employees must disclose AI use in public job postings since January 2026. In Québec, Law 25 requires telling people about decisions made solely by automated processing. Elsewhere, there's no general rule yet, but you can always ask.", fr: "En Ontario, les employeurs de 25 employés ou plus doivent déclarer l'usage de l'IA dans leurs offres d'emploi publiques depuis janvier 2026. Au Québec, la Loi 25 exige d'informer les gens des décisions fondées exclusivement sur un traitement automatisé. Ailleurs, il n'y a pas encore de règle générale, mais vous pouvez toujours demander." },
    },
    {
      q: { en: "Where can I learn AI skills for free in Canada?", fr: "Où apprendre gratuitement l'IA au Canada?" },
      a: { en: "Our Labs put free official courses from Anthropic, OpenAI, Google, Microsoft and Canadian institutions in order, in English and French. Libraries, colleges and provincial employment services also offer free workshops.", fr: "Nos Labs mettent en ordre des cours officiels gratuits d'Anthropic, d'OpenAI, de Google, de Microsoft et d'établissements canadiens, en français et en anglais. Les bibliothèques, les collèges et les services d'emploi provinciaux offrent aussi des ateliers gratuits." },
    },
  ],
  terms: ["automation", "reskilling", "ai-literacy", "algorithmic-bias", "automated-decision-making", "human-in-the-loop", "ai-agent"],
  labs: ["work", "start-here"],
  sources: [
    { name: { en: "Statistics Canada", fr: "Statistique Canada" }, url: { en: "https://www.statcan.gc.ca/en/start", fr: "https://www.statcan.gc.ca/fr/debut" } },
    { name: { en: "Job Bank (Government of Canada)", fr: "Guichet-Emplois (gouvernement du Canada)" }, url: { en: "https://www.jobbank.gc.ca/", fr: "https://www.guichetemplois.gc.ca/" } },
    { name: { en: "Canada Training Credit (Canada Revenue Agency)", fr: "Allocation canadienne pour la formation (Agence du revenu du Canada)" }, url: { en: "https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-training-credit.html", fr: "https://www.canada.ca/fr/agence-revenu/services/prestations-enfants-familles/allocation-canadienne-formation.html" } },
    { name: { en: "Commission d'accès à l'information du Québec", fr: "Commission d'accès à l'information du Québec" }, url: "https://www.cai.gouv.qc.ca/" },
  ],
};
