/**
 * DRY RUN ONLY. Canned replies from each desk for the fictional events in
 * fixture-stories.ts, keyed by event id, then role, then attempt. They are
 * checked by the real fact guard, style checks and shape rules, exactly like
 * a live model's replies, so the dry run proves the pipeline end to end.
 */
import type { RoleName } from "../../src/lib/newsroom-types";

type Canned = Record<string, Partial<Record<RoleName, unknown[]>>>;

// ── Aurora-2: four outlets, one of them the company itself → published ─────
const auroraEn = {
  headline: "Northwind Labs releases Aurora-2, a bilingual AI model that runs on a laptop",
  dek: "The Montreal start-up's open-weight model is built for English and French. Its licence keeps larger companies out unless they pay.",
  news: "Northwind Labs has released Aurora-2, an open-weight AI model trained for English and French that the company says needs only one laptop GPU.",
  thirty: [
    "Northwind Labs released Aurora-2 for anyone to download.",
    "The company says one laptop GPU is enough to run it.",
    "Research use is allowed; firms over 50 employees must buy a licence.",
  ],
  confirmed: [
    { text: "Aurora-2 is open-weight: Northwind published the model's files for anyone to download.", src: ["s1", "s2", "s3"] },
    { text: "The model was trained for both English and French.", src: ["s1", "s3"] },
    { text: "A commercial licence is required for companies with more than 50 employees.", src: ["s1", "s4"] },
  ],
  claimed: [
    { text: "Northwind Labs says Aurora-2 has 7 billion parameters and runs on one laptop GPU with 16 GB of memory.", by: "Northwind Labs", src: ["s1"] },
    { text: "Maple Tech Review says Aurora-2 beat two larger open models in its French reading-comprehension tests, scoring 71 percent.", by: "Maple Tech Review", src: ["s4"] },
  ],
  unknown: ["What the commercial licence will cost.", "When, or whether, a larger version will follow."],
  matters: "A model that runs on one laptop could let schools, clinics and small firms use AI without sending text to a cloud service, Lakeshore Tribune reports. Larger companies will have to buy a licence first.",
  article: {
    news: [
      "Northwind Labs, a start-up based in Montreal, has released Aurora-2, an AI model whose files anyone can download and run [s1,s2]. The company says the model was trained for both English and French and needs only one laptop GPU with 16 GB of memory [s1,s3].",
      "Amélie Roy, Northwind's chief executive, said the goal is a model for French speakers “that treats their language as a first language, not a translation” [s2].",
    ],
    known: [
      "The release itself is not in dispute: Northwind put the files online, and Lakeshore Tribune and Signal Quotidien describe the same open, bilingual model [s1,s2,s3]. Signal Quotidien adds that the training drew on Canadian government documents in both official languages, which matches Northwind's own account [s1,s3].",
      "The performance figures come from two places. Northwind gives the size, 7 billion parameters, and the hardware it needs [s1]. Maple Tech Review ran its own tests and measured 71 percent for Aurora-2 on a French reading-comprehension benchmark, which it says put the model ahead of two larger open models [s4].",
      "Two things are still open. Northwind has not said what the commercial licence costs, and the company gave no date for a bigger version [s4].",
    ],
    matters: [
      "For people who work in French, the practical question is where their words go. A model that runs on one laptop could let schools, clinics and small businesses use AI without sending text to a cloud service, Lakeshore Tribune reports [s2].",
      "The licence sets the limit. Research and personal use are allowed, but a company with more than 50 employees must first buy a commercial licence, at a price Northwind has not published [s1,s4].",
    ],
  },
  plain: [
    "Northwind Labs, a company in Montreal, has shared a new AI model called Aurora-2. A model is the program that reads and writes the text in a chat assistant. This one works in English and French [s1,s2].",
    "Anyone can download it, and the company says it runs on one laptop, so your words do not have to leave your computer. Larger companies have to pay for a licence to use it [s1,s2,s4].",
  ],
  expert: [
    "Aurora-2 has 7 billion parameters and, according to Northwind, fits in 16 GB of GPU memory; its weights are published under the Aurora Community Licence [s1]. Northwind lists three kinds of training data: books in the public domain, licensed news archives, and Canadian government documents in both official languages [s1,s3].",
    "The only independent figure so far is Maple Tech Review's 71 percent on one French reading-comprehension benchmark; the outlet does not name the two larger models it compared [s4].",
  ],
  timeline: [{ when: "Tuesday", text: "Northwind Labs released Aurora-2.", src: ["s2"] }],
};

const auroraFr = {
  headline: "Northwind Labs lance Aurora-2, un modèle d'IA bilingue qui tourne sur un portable",
  dek: "Le modèle ouvert de la jeune pousse montréalaise est conçu pour le français et l'anglais. Sa licence exige un paiement des grandes entreprises.",
  news: "Northwind Labs a publié Aurora-2, un modèle d'IA ouvert entraîné en anglais et en français qui, selon l'entreprise, n'exige qu'une seule carte graphique de portable.",
  thirty: [
    "Northwind Labs a mis Aurora-2 en libre téléchargement.",
    "Selon l'entreprise, une seule carte graphique de portable suffit.",
    "La recherche est permise; au-delà de 50 employés, il faut une licence.",
  ],
  confirmed: [
    { text: "Aurora-2 est un modèle ouvert : Northwind en a publié les fichiers pour que chacun puisse les télécharger.", src: ["s1", "s2", "s3"] },
    { text: "Le modèle a été entraîné en anglais et en français.", src: ["s1", "s3"] },
    { text: "Les entreprises de plus de 50 employés doivent acheter une licence commerciale.", src: ["s1", "s4"] },
  ],
  claimed: [
    { text: "Northwind Labs affirme qu'Aurora-2 compte 7 milliards de paramètres et tourne sur une seule carte graphique de portable dotée de 16 Go de mémoire.", by: "Northwind Labs", src: ["s1"] },
    { text: "Maple Tech Review affirme qu'Aurora-2 a obtenu 71 % à son test de compréhension de lecture en français, devant deux modèles ouverts plus gros.", by: "Maple Tech Review", src: ["s4"] },
  ],
  unknown: ["Le prix de la licence commerciale.", "Si une version plus grande suivra, et quand."],
  matters: "Un modèle qui tourne sur un seul portable pourrait permettre aux écoles, aux cliniques et aux petites entreprises d'utiliser l'IA sans envoyer de texte vers un service infonuagique, rapporte Lakeshore Tribune. Les grandes entreprises devront d'abord acheter une licence.",
  article: {
    news: [
      "Northwind Labs, une jeune pousse établie à Montréal, a publié Aurora-2, un modèle d'IA dont chacun peut télécharger et faire tourner les fichiers [s1,s2]. Selon l'entreprise, le modèle a été entraîné en anglais et en français et n'a besoin que d'une carte graphique de portable dotée de 16 Go de mémoire [s1,s3].",
      "Amélie Roy, cheffe de la direction de Northwind, a expliqué que l'objectif est d'offrir aux francophones un modèle « qui traite leur langue comme une langue première, et non comme une traduction » (citation traduite de l'anglais) [s2].",
    ],
    known: [
      "La publication elle-même ne fait pas de doute : Northwind a mis les fichiers en ligne, et Lakeshore Tribune comme Signal Quotidien décrivent le même modèle ouvert et bilingue [s1,s2,s3]. Signal Quotidien précise que l'entraînement s'est appuyé notamment sur des documents du gouvernement canadien dans les deux langues officielles, ce qui concorde avec la version de Northwind [s1,s3].",
      "Les chiffres de performance viennent de deux sources. Northwind donne la taille, 7 milliards de paramètres, et le matériel requis [s1]. Maple Tech Review a mené ses propres tests et mesuré 71 % pour Aurora-2 à un test de compréhension de lecture en français, ce qui place le modèle, selon le média, devant deux modèles ouverts plus gros [s4].",
      "Deux questions restent ouvertes. Northwind n'a pas dit combien coûte la licence commerciale, et l'entreprise n'a donné aucune date pour une version plus grande [s4].",
    ],
    matters: [
      "Pour qui travaille en français, la question pratique est de savoir où vont ses mots. Un modèle qui tourne sur un seul portable pourrait permettre aux écoles, aux cliniques et aux petites entreprises d'utiliser l'IA sans envoyer de texte vers un service infonuagique, rapporte Lakeshore Tribune [s2].",
      "La licence fixe la limite. La recherche et l'usage personnel sont permis, mais une entreprise de plus de 50 employés doit d'abord acheter une licence commerciale, à un prix que Northwind n'a pas publié [s1,s4].",
    ],
  },
  plain: [
    "Northwind Labs, une entreprise de Montréal, a partagé un nouveau modèle d'IA appelé Aurora-2. Un modèle, c'est le programme qui lit et écrit le texte dans un assistant de clavardage. Il fonctionne en anglais et en français [s1,s2].",
    "Tout le monde peut le télécharger, et l'entreprise dit qu'il tourne sur un seul portable : vos mots n'ont donc pas à quitter votre ordinateur. Les grandes entreprises doivent payer une licence pour s'en servir [s1,s2,s4].",
  ],
  expert: [
    "Aurora-2 compte 7 milliards de paramètres et, selon Northwind, tient dans 16 Go de mémoire graphique; ses poids sont publiés sous l'Aurora Community Licence [s1]. Northwind cite trois types de données d'entraînement : des livres du domaine public, des archives de presse sous licence et des documents du gouvernement canadien dans les deux langues officielles [s1,s3].",
    "Le seul chiffre indépendant pour l'instant est le 71 % de Maple Tech Review à un test de compréhension de lecture en français; le média ne nomme pas les deux modèles plus gros qu'il a comparés [s4].",
  ],
  timeline: [{ when: "mardi", text: "Northwind Labs lance Aurora-2.", src: ["s2"] }],
};

// ── KestrelStudy: two outlets → published, with our own background ─────────
const kestrelEn = {
  headline: "Kestrel launches KestrelStudy, a homework chatbot for high school students",
  dek: "The Toronto company's app covers math and science for students in Grade 9 to 12, with parental controls.",
  news: "Kestrel, an education company in Toronto, has launched KestrelStudy, a chatbot that helps students in Grade 9 to 12 with math and science homework.",
  thirty: [
    "Kestrel launched KestrelStudy, a homework chatbot for teenagers.",
    "It costs $8 a month and has parental controls.",
    "Kestrel says student chats are not used to train its models.",
  ],
  confirmed: [{ text: "KestrelStudy is a homework chatbot from Kestrel, a Toronto company.", src: ["s1", "s2"] }],
  claimed: [
    { text: "Kestrel says parents get controls over the app and a weekly report.", by: "Kestrel", src: ["s2"] },
    { text: "Kestrel says it does not use students' conversations to train its models.", by: "Kestrel", src: ["s2"] },
    { text: "Priya Nair, Kestrel's founder, predicts that within five years most families will use the chatbot instead of a tutor.", by: "Priya Nair", src: ["s1"] },
  ],
  unknown: ["What the weekly report shows parents.", "How the chatbot's answers are checked for mistakes."],
  matters: "Families now have the price, $8 a month, and Kestrel's promise that student chats stay out of its training data. The founder's forecast about tutors is her prediction, not a finding.",
  article: {
    news: [
      "Kestrel, an education company based in Toronto, has launched KestrelStudy, a chatbot built to help students in Grade 9 to 12 with math and science homework [s1,s2]. It is priced at $8 a month [s1].",
    ],
    known: [
      "Both reports describe the same product, a homework chatbot from Kestrel [s1,s2]. The rest comes from the company. Kestrel says parents get controls over the app and a weekly report, and that it does not use students' conversations to train its models [s2].",
      "Priya Nair, Kestrel's founder, went further: she predicts that within five years most families will use the chatbot instead of a tutor [s1]. That is a forecast from the company, and neither report offers evidence for it. Neither report says how the chatbot's answers are checked for mistakes [s1,s2].",
    ],
    matters: [
      "For families, the cost and the data are the two things to weigh. At $8 a month, the price is stated up front [s1]. Kestrel's promise that student conversations stay out of its training data is the company's own commitment; neither report says how it is checked [s2].",
    ],
    background: [
      "If a student uses any chat assistant, its privacy settings are worth a look. Most assistants have an option to stop chats from being used for training, usually under Settings, then Data controls or Privacy [b1].",
    ],
  },
  plain: [
    "Kestrel, a company in Toronto, made a chatbot called KestrelStudy. A chatbot is a program you type questions to, and it types answers back. This one helps high school students with math and science homework [s1,s2].",
    "It costs $8 a month. Parents can see a weekly report, and the company says what students type is not used to train its AI [s1,s2].",
  ],
  expert: [
    "KestrelStudy covers Grade 9 to 12 math and science and is priced at $8 a month [s1]. The training-data commitment covers student conversations; the reports do not describe how long chats are kept or where they are stored [s2].",
  ],
  timeline: [],
};

const kestrelFr = {
  headline: "Kestrel lance KestrelStudy, un robot conversationnel d'aide aux devoirs pour le secondaire",
  dek: "L'application de l'entreprise torontoise aide les élèves de la 9e à la 12e année en mathématiques et en sciences, avec un contrôle parental.",
  news: "Kestrel, une entreprise d'éducation de Toronto, a lancé KestrelStudy, un robot conversationnel qui aide les élèves de la 9e à la 12e année à faire leurs devoirs de mathématiques et de sciences.",
  thirty: [
    "Kestrel a lancé KestrelStudy, un robot conversationnel d'aide aux devoirs.",
    "Il coûte 8 $ par mois et offre un contrôle parental.",
    "Selon Kestrel, les conversations des élèves n'entraînent pas ses modèles.",
  ],
  confirmed: [{ text: "KestrelStudy est un robot conversationnel d'aide aux devoirs conçu par Kestrel, une entreprise de Toronto.", src: ["s1", "s2"] }],
  claimed: [
    { text: "Kestrel affirme que les parents disposent d'un contrôle sur l'application et d'un rapport hebdomadaire.", by: "Kestrel", src: ["s2"] },
    { text: "Kestrel affirme ne pas utiliser les conversations des élèves pour entraîner ses modèles.", by: "Kestrel", src: ["s2"] },
    { text: "Priya Nair, fondatrice de Kestrel, prédit que d'ici cinq ans, la plupart des familles utiliseront le robot plutôt qu'un tuteur.", by: "Priya Nair", src: ["s1"] },
  ],
  unknown: ["Ce que le rapport hebdomadaire montre aux parents.", "Comment les réponses du robot sont vérifiées."],
  matters: "Les familles connaissent maintenant le prix, 8 $ par mois, et la promesse de Kestrel de garder les conversations des élèves hors de ses données d'entraînement. La prévision de la fondatrice sur les tuteurs reste une prédiction, pas un constat.",
  article: {
    news: [
      "Kestrel, une entreprise d'éducation établie à Toronto, a lancé KestrelStudy, un robot conversationnel conçu pour aider les élèves de la 9e à la 12e année à faire leurs devoirs de mathématiques et de sciences [s1,s2]. L'application coûte 8 $ par mois [s1].",
    ],
    known: [
      "Les deux reportages décrivent le même produit, un robot d'aide aux devoirs conçu par Kestrel [s1,s2]. Le reste vient de l'entreprise. Kestrel affirme que les parents disposent d'un contrôle sur l'application et d'un rapport hebdomadaire, et qu'elle n'utilise pas les conversations des élèves pour entraîner ses modèles [s2].",
      "Priya Nair, fondatrice de Kestrel, va plus loin : elle prédit que d'ici cinq ans, la plupart des familles utiliseront le robot plutôt qu'un tuteur [s1]. Il s'agit d'une prévision de l'entreprise, et aucun des reportages n'en apporte la preuve. Aucun ne dit non plus comment les réponses du robot sont vérifiées [s1,s2].",
    ],
    matters: [
      "Pour les familles, le coût et les données sont les deux éléments à peser. À 8 $ par mois, le prix est annoncé d'emblée [s1]. La promesse de Kestrel de garder les conversations des élèves hors de ses données d'entraînement est un engagement de l'entreprise; aucun reportage ne dit comment elle est vérifiée [s2].",
    ],
    background: [
      "Quel que soit l'assistant qu'utilise un élève, ses réglages de confidentialité méritent un coup d'œil. La plupart des assistants permettent d'empêcher que les conversations servent à l'entraînement, en général dans Paramètres, puis Données ou Confidentialité [b1].",
    ],
  },
  plain: [
    "Kestrel, une entreprise de Toronto, a créé un robot conversationnel appelé KestrelStudy. Un robot conversationnel, c'est un programme à qui on écrit des questions et qui répond par écrit. Le robot de Kestrel aide les élèves du secondaire à faire leurs devoirs de mathématiques et de sciences [s1,s2].",
    "Il coûte 8 $ par mois. Les parents reçoivent un rapport chaque semaine, et l'entreprise dit que ce que les élèves écrivent ne sert pas à entraîner son IA [s1,s2].",
  ],
  expert: [
    "KestrelStudy couvre les mathématiques et les sciences de la 9e à la 12e année, au prix de 8 $ par mois [s1]. L'engagement sur les données d'entraînement vise les conversations des élèves; les reportages ne précisent ni la durée de conservation ni le lieu de stockage [s2].",
  ],
  timeline: [],
};

// ── Digital Commissioner: one official announcement → published (numbers) ───
const commishEn = {
  headline: "Digital Commissioner asks the public how AI should be used in hiring",
  dek: "A 12-week consultation is open until January 15, with 3 public hearings in Halifax, Winnipeg and Vancouver.",
  news: "The Office of the Digital Commissioner has opened a 12-week public consultation on AI tools in hiring, and anyone can comment online until January 15.",
  thirty: [
    "The Digital Commissioner wants views on AI in hiring.",
    "Online comments are open until January 15.",
    "Hearings will be held in Halifax, Winnipeg and Vancouver.",
  ],
  confirmed: [
    { text: "The consultation runs for 12 weeks and takes comments online until January 15.", src: ["s1"] },
    { text: "Public hearings will take place in Halifax, Winnipeg and Vancouver, 3 in all.", src: ["s1"] },
    { text: "The office will report back with a summary of what it heard.", src: ["s1"] },
  ],
  claimed: [],
  unknown: ["What the office will do with the answers after its summary.", "Whether any new rule will follow, and when."],
  matters: "The questions on the table touch anyone who applies for work: whether employers should have to say when an automated tool screens an application, and whether applicants can ask for a human review.",
  article: {
    news: [
      "The Office of the Digital Commissioner has opened a public consultation on how AI tools are used in hiring [s1]. It runs for 12 weeks. Employers, workers, unions and job seekers can all send comments online until January 15 [s1].",
    ],
    known: [
      "Public hearings are planned in Halifax, Winnipeg and Vancouver, 3 in all, and the office says it will report back with a summary of what it heard [s1].",
      "In the office's words, the consultation paper asks “whether employers should have to tell applicants when an automated tool screens their application, and whether applicants should be able to ask for a human review” [s1].",
      "The office has not said what it will do with the answers once the summary is out, or whether new rules will follow [s1].",
    ],
    matters: [
      "These questions touch anyone who applies for work: whether software reading an application must be disclosed to the person who sent it, and whether a person must be available to look again [s1]. Employers who use such tools are invited to explain how they work in practice [s1].",
    ],
  },
  plain: [
    "A government office called the Office of the Digital Commissioner wants to hear from people about AI in hiring [s1].",
    "When you apply for a job, a computer program sometimes reads your application first. The office is asking if companies should have to tell you, and if you should be able to ask a person to check it [s1].",
  ],
  expert: [
    "The consultation paper frames two possible obligations: disclosure of automated screening to applicants, and a right to request human review [s1]. Online comments close January 15; hearings are in Halifax, Winnipeg and Vancouver [s1].",
  ],
  timeline: [{ when: "January 15", text: "Online comments close.", src: ["s1"] }],
};

const commishFr = {
  headline: "La commissaire au numérique consulte le public sur l'IA dans l'embauche",
  dek: "Une consultation de 12 semaines est ouverte jusqu'au 15 janvier, avec 3 audiences publiques à Halifax, Winnipeg et Vancouver.",
  news: "Le bureau de la commissaire au numérique a ouvert une consultation publique de 12 semaines sur les outils d'IA dans l'embauche; chacun peut commenter en ligne jusqu'au 15 janvier.",
  thirty: [
    "La commissaire au numérique veut des avis sur l'IA dans l'embauche.",
    "Les commentaires sont reçus en ligne jusqu'au 15 janvier.",
    "Des audiences auront lieu à Halifax, Winnipeg et Vancouver.",
  ],
  confirmed: [
    { text: "La consultation dure 12 semaines et reçoit des commentaires en ligne jusqu'au 15 janvier.", src: ["s1"] },
    { text: "Le bureau tiendra 3 audiences publiques : à Halifax, Winnipeg et Vancouver.", src: ["s1"] },
    { text: "Le bureau publiera un résumé de ce qu'il a entendu.", src: ["s1"] },
  ],
  claimed: [],
  unknown: ["Ce que le bureau fera des réponses après son résumé.", "Si une nouvelle règle suivra, et quand."],
  matters: "Les questions posées touchent toute personne qui pose sa candidature : les employeurs devraient-ils dire quand un outil automatisé trie une candidature, et les candidats pourraient-ils demander un examen par une personne?",
  article: {
    news: [
      "Le bureau de la commissaire au numérique a ouvert une consultation publique sur l'usage des outils d'IA dans l'embauche [s1]. Elle dure 12 semaines. Les employeurs, les travailleurs, les syndicats et les chercheurs d'emploi peuvent tous envoyer leurs commentaires en ligne jusqu'au 15 janvier [s1].",
    ],
    known: [
      "Des audiences publiques sont prévues à Halifax, Winnipeg et Vancouver, 3 en tout, et le bureau dit qu'il publiera un résumé de ce qu'il a entendu [s1].",
      "Selon le bureau, le document de consultation demande si les employeurs devraient être tenus d'informer les candidats quand un outil automatisé trie leur candidature, et si les candidats devraient pouvoir demander un examen par une personne [s1].",
      "Le bureau n'a pas dit ce qu'il fera des réponses une fois le résumé publié, ni si de nouvelles règles suivront [s1].",
    ],
    matters: [
      "Ces questions touchent toute personne qui cherche du travail : faut-il dire à un candidat qu'un logiciel a lu sa candidature, et faut-il qu'une personne puisse la relire [s1]? Les employeurs qui utilisent de tels outils sont invités à expliquer comment ils fonctionnent en pratique [s1].",
    ],
  },
  plain: [
    "Un bureau du gouvernement, celui de la commissaire au numérique, veut entendre les gens sur l'IA dans l'embauche [s1].",
    "Quand on postule un emploi, un programme informatique lit parfois la candidature en premier. Le bureau demande si les entreprises devraient le dire, et si on devrait pouvoir demander à une personne de vérifier [s1].",
  ],
  expert: [
    "Le document de consultation envisage deux obligations : informer les candidats d'un tri automatisé, et leur donner le droit de demander un examen humain [s1]. Les commentaires sont reçus jusqu'au 15 janvier; les audiences ont lieu à Halifax, Winnipeg et Vancouver [s1].",
  ],
  timeline: [{ when: "15 janvier", text: "Les commentaires en ligne prennent fin.", src: ["s1"] }],
};

// ── Harbourline: the draft invents facts; the rewrite still does → rejected ─
const harbourDraft = {
  headline: "Harbourline Robotics robots will cut sorting costs 40 per cent at the Halifax port",
  dek: "The Ottawa company's pilot starts this winter.",
  news: "Harbourline Robotics will test AI sorting robots at the Port of Halifax, cutting costs by 40 per cent.",
  thirty: ["Harbourline Robotics is testing sorting robots in Halifax.", "The pilot lasts six months.", "The union says it was not consulted."],
  confirmed: [{ text: "Harbourline Robotics will test sorting robots in one warehouse at the Port of Halifax.", src: ["s1", "s2"] }],
  claimed: [],
  unknown: ["What happens after the pilot."],
  matters: "Port jobs could change.",
  article: { news: ["Harbourline Robotics, an Ottawa company, will cut sorting costs by 40 per cent with its new robots [s1]."] },
  plain: ["Robots will sort parcels at the port [s1]."],
  expert: [],
  timeline: [],
};

// ── Lumenfield: the draft states a forecast as fact → standards says no ────
const lumenDraft = {
  headline: "Lumenfield cuts 120 Moncton call-centre jobs as AI assistants take over calls",
  dek: "The insurer is shifting more customer calls to AI assistants; the union local wants the province to help.",
  news: "Lumenfield is eliminating 120 positions at its call centre in Moncton by March, shifting more calls to AI assistants.",
  thirty: ["Lumenfield is cutting 120 jobs in Moncton.", "More customer calls will go to AI assistants.", "Workers are offered retraining or severance."],
  confirmed: [{ text: "Lumenfield is cutting 120 positions at its Moncton call centre.", src: ["s1", "s2"] }],
  claimed: [{ text: "The union local says the cuts are about a third of the centre's staff.", by: "union local", src: ["s2"] }],
  unknown: ["How many workers will take retraining."],
  matters: "This is the start of the end of call-centre work in Moncton, and AI will take the rest of these jobs within a few years.",
  article: {
    news: [
      "Lumenfield, an insurer, is eliminating 120 positions at its call centre in Moncton by March, shifting more customer calls to AI assistants [s1]. Staff were told on Monday [s1].",
    ],
    known: [
      "According to the union local, the cuts amount to about a third of the centre's workforce [s2]. Lumenfield says the people affected will be offered retraining or severance, and that its AI assistants already handle most routine policy questions [s1,s2].",
      "The union plans to ask the province for help finding the workers new jobs [s2]. Neither report says how many of the workers will take retraining [s1,s2].",
    ],
    matters: [
      "For the people who answer the phones, this is the start of the end of call-centre work in Moncton, and AI will take the rest of these jobs within a few years [s1,s2]. For customers, calls about routine policy questions will go to an AI assistant first [s2].",
      "Workers who stay will need new skills, since the remaining work will be the cases the assistants cannot handle, and the province will have to step in for the others [s1,s2].",
    ],
  },
  plain: ["Lumenfield, an insurance company, is replacing 120 call-centre jobs in Moncton with AI assistants that answer the phone [s1,s2]."],
  expert: [],
  timeline: [],
};

// ── SEO and design desks ───────────────────────────────────────────────────
export const CANNED: Canned = {
  "fx-aurora-2": {
    reporter: [auroraEn],
    standards: [{ pass: true, reasons: [], notes: ["Licence limits are attributed and explained.", "Performance figures are given in the names of Northwind and Maple Tech Review."] }],
    translator: [auroraFr],
    seo: [{
      en: {
        seoTitle: "Aurora-2: Northwind Labs' bilingual AI runs on a laptop",
        headline: "Northwind Labs releases Aurora-2, a bilingual AI model that runs on one laptop",
        dek: "The Montreal start-up's open-weight model is built for English and French. Its licence keeps larger companies out unless they pay.",
        metaDescription: "Northwind Labs' open-weight Aurora-2 works in English and French and runs on one laptop GPU. What's confirmed, what's claimed, and the licence catch.",
        slug: "northwind-labs-aurora-2-bilingual-ai-model-laptop",
        keywords: ["aurora-2", "northwind labs", "open-weight model", "french ai model", "bilingual ai"],
        faq: [
          { q: "What is Aurora-2?", a: "Aurora-2 is an open-weight AI model from Northwind Labs, a Montreal start-up, trained for English and French." },
          { q: "Can businesses use Aurora-2 for free?", a: "Research and personal use are allowed. A commercial licence is required for companies with more than 50 employees, and Northwind has not published a price." },
          { q: "What computer does Aurora-2 need?", a: "Northwind Labs says it runs on one laptop GPU with 16 GB of memory." },
        ],
      },
      fr: {
        seoTitle: "Aurora-2 : le modèle d'IA bilingue de Northwind Labs",
        headline: "Northwind Labs lance Aurora-2, un modèle d'IA bilingue qui tourne sur un portable",
        dek: "Le modèle ouvert de la jeune pousse montréalaise est conçu pour le français et l'anglais. Sa licence exige un paiement des grandes entreprises.",
        metaDescription: "Aurora-2, le modèle ouvert de Northwind Labs, fonctionne en français et en anglais sur un seul portable. Ce qui est confirmé, affirmé, et la licence.",
        slug: "aurora-2 modele ia bilingue northwind labs",
        keywords: ["aurora-2", "northwind labs", "modèle d'ia ouvert", "ia en français"],
        faq: [
          { q: "Qu'est-ce qu'Aurora-2?", a: "Aurora-2 est un modèle d'IA ouvert de Northwind Labs, une jeune pousse de Montréal, entraîné en français et en anglais." },
          { q: "Les entreprises peuvent-elles utiliser Aurora-2 gratuitement?", a: "La recherche et l'usage personnel sont permis. Les entreprises de plus de 50 employés doivent acheter une licence commerciale, dont le prix n'est pas publié." },
        ],
      },
      links: ["learn/use-ai-safely", "labs/assistants", "labs"],
    }],
    designer: [{
      format: "standard", color: "night", motif: "rules",
      en: { kicker: "Open models", big: "Aurora-2", small: "English and French, on one laptop" },
      fr: { kicker: "IA ouverte", big: "Aurora-2", small: "Anglais et français, sur un portable" },
      illustration: { prompt: "two overlapping speech-bubble outlines drawn as circuit lines on a laptop-shaped plane", alt_en: "Abstract illustration: two overlapping speech bubbles made of circuit lines", alt_fr: "Illustration abstraite : deux bulles de dialogue faites de circuits" },
    }],
  },
  "fx-kestrel-2": {
    reporter: [kestrelEn],
    standards: [{ pass: true, reasons: [], notes: ["The founder's forecast is attributed and flagged as a prediction."] }],
    translator: [kestrelFr],
    seo: [{
      en: {
        seoTitle: "KestrelStudy: Kestrel's homework chatbot for Grade 9 to 12",
        headline: "Kestrel launches KestrelStudy, a homework chatbot for high school students",
        dek: "The Toronto company's app covers math and science for students in Grade 9 to 12, with parental controls.",
        metaDescription: "Kestrel's KestrelStudy chatbot helps Grade 9 to 12 students with math and science for $8 a month. What the company promises about student data.",
        slug: "kestrelstudy-homework-chatbot-kestrel",
        keywords: ["kestrelstudy", "homework chatbot", "kestrel", "ai for students"],
        faq: [
          { q: "How much does KestrelStudy cost?", a: "KestrelStudy costs $8 a month." },
          { q: "Are student chats used to train Kestrel's AI?", a: "Kestrel says it does not use students' conversations to train its models." },
        ],
      },
      fr: {
        seoTitle: "KestrelStudy : le robot d'aide aux devoirs de Kestrel",
        headline: "Kestrel lance KestrelStudy, un robot conversationnel d'aide aux devoirs pour le secondaire",
        dek: "L'application de l'entreprise torontoise aide les élèves de la 9e à la 12e année en mathématiques et en sciences, avec un contrôle parental.",
        metaDescription: "KestrelStudy, le robot conversationnel de Kestrel, aide les élèves de la 9e à la 12e année pour 8 $ par mois. Ce que l'entreprise promet sur les données.",
        slug: "kestrelstudy-robot-aide-aux-devoirs",
        keywords: ["kestrelstudy", "aide aux devoirs", "robot conversationnel", "ia à l'école"],
        faq: [
          { q: "Combien coûte KestrelStudy?", a: "KestrelStudy coûte 8 $ par mois." },
        ],
      },
      links: ["learn/use-ai-safely", "labs/educators"],
    }],
    designer: [{
      format: "explainer", color: "spruce", motif: "grid",
      en: { kicker: "Homework help", big: "KestrelStudy", small: "Grade 9 to 12, $8 a month" },
      fr: { kicker: "IA et devoirs", big: "KestrelStudy", small: "De la 9e à la 12e année" },
      illustration: null,
    }],
  },
  "fx-commish": {
    reporter: [commishEn],
    standards: [{ pass: true, reasons: [], notes: ["Single official source: every point is the office's own announcement."] }],
    translator: [commishFr],
    seo: [{
      en: {
        seoTitle: "Digital Commissioner opens consultation on AI in hiring",
        headline: "Digital Commissioner asks the public how AI should be used in hiring",
        dek: "A 12-week consultation is open until January 15, with 3 public hearings in Halifax, Winnipeg and Vancouver.",
        metaDescription: "Comment until January 15: the Digital Commissioner asks whether employers must disclose AI screening and whether applicants can get a human review.",
        slug: "digital-commissioner-consultation-ai-hiring",
        keywords: ["ai in hiring", "digital commissioner", "public consultation", "automated screening"],
        faq: [
          { q: "When does the consultation close?", a: "Online comments are accepted until January 15." },
          { q: "Where are the public hearings?", a: "The office will hold 3 public hearings, in Halifax, Winnipeg and Vancouver." },
        ],
      },
      fr: {
        seoTitle: "Consultation sur l'IA dans l'embauche jusqu'au 15 janvier",
        headline: "La commissaire au numérique consulte le public sur l'IA dans l'embauche",
        dek: "Une consultation de 12 semaines est ouverte jusqu'au 15 janvier, avec 3 audiences publiques à Halifax, Winnipeg et Vancouver.",
        metaDescription: "Jusqu'au 15 janvier, dites-le : les employeurs devraient-ils dévoiler le tri automatisé des candidatures? Les candidats, obtenir un examen humain?",
        slug: "consultation-ia-embauche-commissaire-numerique",
        keywords: ["ia et embauche", "consultation publique", "tri automatisé"],
        faq: [
          { q: "Quand la consultation se termine-t-elle?", a: "Les commentaires sont reçus en ligne jusqu'au 15 janvier." },
        ],
      },
      links: ["values", "learn/ai-in-everyday-life"],
    }],
    designer: [{
      format: "numbers", color: "lake", motif: "bars",
      en: { kicker: "Public consultation", big: "12", small: "Online comments close January 15" },
      fr: { kicker: "Consultation publique", big: "12", small: "Jusqu'au 15 janvier" },
      illustration: null,
    }],
  },
  "fx-harbour-2": {
    reporter: [harbourDraft],
    copy: [{ ...harbourDraft, dek: "The company's pilot starts this winter.", article: { news: ["Harbourline Robotics will cut sorting costs by 40 per cent with its new robots [s1]."] } }],
  },
  "fx-lumen-2": {
    reporter: [lumenDraft],
    standards: [{ pass: false, reasons: ["Presents a forecast as fact: \"AI will take the rest of these jobs within a few years\" is in no source.", "Claims the province \"will have to step in\", which no source says."], notes: [] }],
  },
};
