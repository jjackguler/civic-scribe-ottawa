/**
 * DEV ONLY. Sample dispatches about fictional companies and outlets, used when
 * a page is opened with ?fixture=1 under `vite dev` (feeds and model APIs are
 * unreachable locally). Only ever imported behind `import.meta.env.DEV`, so it
 * never ships in a production build.
 */
import type { Dispatch, DispatchCopy } from "./dispatch-types";

const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

const sources: Dispatch["sources"] = [
  { key: "s1", outlet: "Northwind Labs", title: "Introducing Aurora-2: an open-weight model for English and French", url: "https://example.com/northwind/aurora-2", publishedAt: ago(7.2), storyId: "fx-1", official: true, lang: "en" },
  { key: "s2", outlet: "Lakeshore Tribune", title: "Montreal's Northwind Labs releases Aurora-2, says it runs on a single laptop GPU", url: "https://example.com/lakeshore/aurora", publishedAt: ago(5.6), storyId: "fx-2", official: false, lang: "en" },
  { key: "s3", outlet: "Signal Quotidien", title: "Northwind Labs lance Aurora-2, un modèle ouvert bilingue", url: "https://example.com/signal/aurora", publishedAt: ago(4.1), storyId: "fx-3", official: false, lang: "fr" },
  { key: "s4", outlet: "Maple Tech Review", title: "Aurora-2 benchmarks: strong French scores, licence limits commercial use", url: "https://example.com/maple/aurora-bench", publishedAt: ago(1.3), storyId: "fx-4", official: false, lang: "en" },
];

const en: DispatchCopy = {
  headline: "Northwind Labs releases Aurora-2, an open model built for English and French",
  news: "Montreal's Northwind Labs has released Aurora-2, an open-weight AI model it says works equally well in English and French.",
  thirty: [
    "Northwind Labs published Aurora-2 for anyone to download.",
    "It says the model runs on a single laptop GPU.",
    "Its licence limits commercial use, Maple Tech Review reports.",
  ],
  confirmed: [
    { text: "Aurora-2 is an open-weight model: the files are published for anyone to download and run.", src: ["s1", "s2", "s3"] },
    { text: "The model is trained for both English and French.", src: ["s1", "s3"] },
    { text: "Northwind Labs is based in Montreal.", src: ["s2", "s3"] },
  ],
  claimed: [
    { text: "Northwind Labs says Aurora-2 runs on a single laptop GPU.", by: "Northwind Labs", src: ["s1", "s2"] },
    { text: "Maple Tech Review says its tests show strong French scores.", by: "Maple Tech Review", src: ["s4"] },
  ],
  unknown: [
    "Whether the licence allows use inside a paid product.",
    "How the model was trained, and on what data.",
    "When a larger version will follow, if at all.",
  ],
  matters: "If you work in French, a capable model you can run on your own computer means your text never has to leave it. The licence decides whether businesses can build on it.",
  body: {
    plain: [
      "Northwind Labs, a company in Montreal, has released Aurora-2. It is an AI model: a program that reads and writes text. [s1,s2] \"Open-weight\" means the company published the model's files, so anyone can download it and run it on their own machine. [s1,s3]",
      "Northwind Labs says it works on a single laptop GPU, the graphics chip found in many gaming laptops. [s2] Maple Tech Review tested it and found it does well in French, but notes the licence limits commercial use. [s4]",
    ],
    standard: [
      "Northwind Labs, the Montreal AI company, released Aurora-2, an open-weight language model trained for both English and French. [s1,s2,s3]",
      "The company says the model runs on a single laptop GPU, a claim repeated in the Lakeshore Tribune's report. [s1,s2] Signal Quotidien describes Aurora-2 as a bilingual open model. [s3]",
      "Maple Tech Review's benchmarks show strong French scores. It also reports that the licence limits commercial use, which would restrict how businesses can deploy the model. [s4]",
    ],
    expert: [
      "Northwind Labs has published the weights of Aurora-2, a bilingual English and French language model, under its own licence. [s1] The release is open-weight rather than open source: the outlets describe downloadable weights, not training code or data. [s1,s3]",
      "The company's headline claim is local inference on a single laptop GPU. [s1,s2] None of the reports give a parameter count or memory requirement, so the claim cannot be checked from the coverage.",
      "Maple Tech Review's benchmarks show strong French scores; it is the only outlet so far with independent results. [s4] Its report also flags that the licence limits commercial use, which the Lakeshore Tribune and Signal Quotidien do not mention. [s2,s3,s4]",
    ],
  },
  timeline: [],
};

const fr: DispatchCopy = {
  headline: "Northwind Labs lance Aurora-2, un modèle ouvert conçu pour l'anglais et le français",
  news: "Northwind Labs, à Montreal, a publié Aurora-2, un modèle d'IA à poids ouverts qui fonctionne aussi bien en anglais qu'en français, selon l'entreprise.",
  thirty: [
    "Northwind Labs a publié Aurora-2, téléchargeable par tous.",
    "Selon l'entreprise, il tourne sur un seul GPU de portable.",
    "Sa licence limite l'usage commercial, rapporte Maple Tech Review.",
  ],
  confirmed: [
    { text: "Aurora-2 est un modèle à poids ouverts : ses fichiers sont publiés et téléchargeables.", src: ["s1", "s2", "s3"] },
    { text: "Le modèle est entraîné pour l'anglais et le français.", src: ["s1", "s3"] },
    { text: "Northwind Labs est établie à Montreal.", src: ["s2", "s3"] },
  ],
  claimed: [
    { text: "Northwind Labs affirme qu'Aurora-2 tourne sur un seul GPU de portable.", by: "Northwind Labs", src: ["s1", "s2"] },
    { text: "Maple Tech Review dit que ses tests montrent de bons résultats en français.", by: "Maple Tech Review", src: ["s4"] },
  ],
  unknown: [
    "Si la licence permet l'usage dans un produit payant.",
    "Comment le modèle a été entraîné, et avec quelles données.",
    "Quand une version plus grande suivra, le cas échéant.",
  ],
  matters: "Si vous travaillez en français, un modèle capable qui tourne sur votre propre ordinateur garde vos textes chez vous. La licence décidera si les entreprises peuvent s'en servir.",
  body: {
    plain: [
      "Northwind Labs, une entreprise de Montreal, a lancé Aurora-2. C'est un modèle d'IA : un programme qui lit et écrit du texte. [s1,s2] « À poids ouverts » veut dire que l'entreprise a publié les fichiers du modèle : chacun peut le télécharger et le faire tourner chez soi. [s1,s3]",
      "Selon Northwind Labs, il fonctionne sur un seul GPU de portable, la puce graphique de bien des ordinateurs de jeu. [s2] Maple Tech Review l'a testé : il réussit bien en français, mais la licence limite l'usage commercial. [s4]",
    ],
    standard: [
      "Northwind Labs, l'entreprise d'IA de Montreal, a publié Aurora-2, un modèle de langage à poids ouverts entraîné pour l'anglais et le français. [s1,s2,s3]",
      "L'entreprise affirme que le modèle tourne sur un seul GPU de portable, ce que reprend le Lakeshore Tribune. [s1,s2] Signal Quotidien le décrit comme un modèle ouvert bilingue. [s3]",
      "Les tests de Maple Tech Review montrent de bons résultats en français. Le média rapporte aussi que la licence limite l'usage commercial, ce qui restreindrait son déploiement en entreprise. [s4]",
    ],
    expert: [
      "Northwind Labs a publié les poids d'Aurora-2, un modèle de langage bilingue anglais-français, sous sa propre licence. [s1] Il s'agit de poids ouverts et non de code source ouvert : les médias décrivent des poids téléchargeables, sans code ni données d'entraînement. [s1,s3]",
      "L'argument principal de l'entreprise est l'inférence locale sur un seul GPU de portable. [s1,s2] Aucun reportage ne donne le nombre de paramètres ni la mémoire requise; l'affirmation ne peut donc pas être vérifiée à partir de la couverture.",
      "Les tests de Maple Tech Review montrent de bons résultats en français; c'est pour l'instant le seul média avec des résultats indépendants. [s4] Il signale aussi que la licence limite l'usage commercial, ce que ne mentionnent ni le Lakeshore Tribune ni Signal Quotidien. [s2,s3,s4]",
    ],
  },
  timeline: [],
};

const second = (id: string, h: number, headEn: string, headFr: string, newsEn: string, newsFr: string, outlets: string[]): Dispatch => ({
  id,
  createdAt: ago(h),
  topic: "policy",
  model: "claude",
  sources: outlets.map((o, i) => ({ ...sources[i % sources.length], key: `s${i + 1}`, outlet: o, publishedAt: ago(h + 3 - i * 0.8), storyId: `${id}-${i}`, official: false })),
  en: { ...en, headline: headEn, news: newsEn, matters: "A sample \"why it matters\" line for this fixture dispatch, written from its sources." },
  fr: { ...fr, headline: headFr, news: newsFr, matters: "Une ligne d'exemple « pourquoi c'est important » pour cette dépêche de test, tirée de ses sources." },
});

export const FIXTURES: Dispatch[] = [
  { id: "fixture-aurora", createdAt: ago(0.6), topic: "research", model: "claude", sources, en: { ...en, timeline: [
    { when: "Tuesday morning", text: "Northwind Labs publishes the Aurora-2 weights and a short technical note.", src: ["s1"] },
    { when: "Tuesday afternoon", text: "Maple Tech Review posts its first benchmark results.", src: ["s4"] },
  ] }, fr: { ...fr, timeline: [
    { when: "mardi matin", text: "Northwind Labs publie les poids d'Aurora-2 et une courte note technique.", src: ["s1"] },
    { when: "mardi après-midi", text: "Maple Tech Review publie ses premiers résultats de tests.", src: ["s4"] },
  ] } },
  second("fixture-ledger", 5, "Provincial privacy office opens review of AI hiring tools used by employers", "Le bureau provincial de la vie privée examine les outils d'embauche par IA",
    "A provincial privacy office says it is reviewing how employers use AI tools to screen job applicants.", "Un bureau provincial de protection de la vie privée examine l'usage d'outils d'IA pour trier les candidatures.",
    ["Lakeshore Tribune", "Signal Quotidien", "Harbour Post"]),
  second("fixture-chips", 11, "Two chipmakers announce a joint plant for AI processors near Kingston", "Deux fabricants de puces annoncent une usine commune près de Kingston",
    "Two chipmakers say they will build a shared plant for AI processors near Kingston.", "Deux fabricants de puces construiront une usine commune de processeurs d'IA près de Kingston.",
    ["Maple Tech Review", "Harbour Post"]),
];
