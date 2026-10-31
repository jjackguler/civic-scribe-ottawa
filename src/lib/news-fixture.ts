/**
 * DEV ONLY. A fictional news desk for local previews and screenshots, used when
 * the dev server runs with AIB_NEWS_FIXTURE=1 (publisher feeds are unreachable
 * from sandboxes). Every company, outlet, person and event below is invented,
 * like the newsroom and dispatch fixtures; links go to example.com. Only ever
 * imported behind `import.meta.env.DEV`, so it never ships in a production build.
 */
import type { NewsPayload, Story } from "./news-engine";
import type { Kind, Level, Region, Topic } from "./news-sources";

const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

type Row = [id: string, title: string, source: string, hoursAgo: number, topic: Topic, opts?: Partial<{
  region: Region; kind: Kind; level: Level; minister: boolean; lang: "en" | "fr"; tags: Topic[]; summary: string; sourceId: string; popularity: Story["popularity"];
}>];

const ROWS: Row[] = [
  ["fx-a1", "Northwind Labs releases Aurora-2, an open bilingual model that runs on one laptop GPU", "Lakeshore Tribune", 0.6, "research", { region: "canada", tags: ["research", "business"] }],
  ["fx-a2", "Aurora-2 benchmarks show strong French scores, but its licence limits commercial use", "Maple Tech Review", 1.1, "research", { region: "canada" }],
  ["fx-a3", "Northwind Labs lance Aurora-2, un modèle ouvert bilingue", "Signal Quotidien", 1.4, "research", { region: "canada", lang: "fr" }],
  ["fx-a4", "Why a Montreal lab's open model matters for French-language public services", "Prairie Signal", 2.2, "research", { region: "canada", kind: "analysis" }],
  ["fx-b1", "Digital Commissioner opens public consultation on AI in hiring", "Office of the Digital Commissioner", 1.8, "policy", { region: "canada", kind: "gov", level: "federal", minister: true }],
  ["fx-b2", "Employers would have to tell applicants when AI screens their résumé under proposed rules", "Metro Ledger", 2.6, "policy", { region: "canada", tags: ["policy", "people"] }],
  ["fx-b3", "Consultation sur l'IA à l'embauche : ce que les employeurs devront divulguer", "Signal Quotidien", 3.0, "policy", { region: "canada", lang: "fr" }],
  ["fx-c1", "Kestrel launches KestrelStudy, a homework chatbot for high school students", "Coastline Daily", 3.4, "applications", { tags: ["applications", "people"] }],
  ["fx-c2", "Teachers' groups ask how KestrelStudy handles student data", "Valley Courier", 4.0, "responsible", { tags: ["responsible", "people"] }],
  ["fx-d1", "Harbour Compute breaks ground on a hydro-powered data centre in northern Quebec", "Maple Tech Review", 5.2, "infrastructure", { region: "canada", tags: ["infrastructure", "sustainability"] }],
  ["fx-d2", "Chipmaker Ferrum unveils an inference accelerator aimed at smaller cloud providers", "Circuit Weekly", 6.1, "infrastructure"],
  ["fx-e1", "Province of Lakeshore publishes its first register of AI systems used by ministries", "Government of Lakeshore", 6.5, "policy", { region: "canada", kind: "gov", level: "provincial" }],
  ["fx-e2", "City of Riverbank pilots AI translation at service counters, in 12 languages", "City of Riverbank", 7.0, "applications", { region: "canada", kind: "gov", level: "municipal" }],
  ["fx-f1", "Agents that book travel are getting better, and so are the scams that target them", "Coastline Daily", 7.8, "agents", { tags: ["agents", "responsible"] }],
  ["fx-f2", "Ostrich AI adds a 'show your work' mode to its agent so users can audit each step", "Circuit Weekly", 8.5, "agents"],
  ["fx-f3", "What an AI agent is, and what it can and cannot do on your behalf", "Prairie Signal", 9.0, "agents", { kind: "analysis" }],
  ["fx-g1", "Toronto start-up Lumen Health raises seed round for AI triage notes", "Metro Ledger", 9.6, "business", { region: "canada", tags: ["business", "health"] }],
  ["fx-g2", "Venture funding for Canadian AI firms dips in the third quarter, report says", "Maple Tech Review", 10.4, "business", { region: "canada" }],
  ["fx-h1", "Warehouse robots learn new tasks from a single demonstration, researchers report", "Circuit Weekly", 11.2, "robotics", { tags: ["robotics", "research"] }],
  ["fx-h2", "Farm robot maker Furrow opens a test site outside Saskatoon", "Prairie Signal", 12.0, "robotics", { region: "canada" }],
  ["fx-i1", "Hospital network in the Maritimes tests AI that drafts discharge summaries", "Valley Courier", 12.8, "health", { region: "canada", tags: ["health", "applications"] }],
  ["fx-i2", "Study finds AI scribe notes need human review for medication names", "Riverbank Health", 13.5, "health", { kind: "analysis", tags: ["health", "responsible"] }],
  ["fx-j1", "Unions and employers sign a code on AI scheduling tools in retail", "Metro Ledger", 14.1, "people", { region: "canada", tags: ["people", "policy"] }],
  ["fx-j2", "Free AI literacy courses for older adults open at public libraries", "Valley Courier", 15.0, "people", { region: "canada" }],
  ["fx-k1", "Mixed-reality headsets add live captioning powered by on-device AI", "Circuit Weekly", 16.2, "immersive"],
  ["fx-k2", "Museum uses a 3D reconstruction to show a lost harbour, labelled as a reconstruction", "Coastline Daily", 17.0, "immersive", { region: "canada" }],
  ["fx-l1", "Data centres' water use: what the new disclosure rules ask for", "Prairie Signal", 18.4, "sustainability", { kind: "analysis", tags: ["sustainability", "infrastructure"] }],
  ["fx-m1", "Northwind Labs: Aurora-2 technical report", "Northwind Labs", 19.0, "research", { kind: "lab", region: "canada" }],
  ["fx-m2", "Ostrich AI: notes on evaluating agent reliability", "Ostrich AI", 20.5, "agents", { kind: "lab" }],
  ["fx-n1", "Deepfake voice scams: how banks are changing call-centre checks", "Metro Ledger", 21.0, "society", { tags: ["society", "responsible"] }],
  ["fx-n2", "Researchers propose a label for AI-edited photos in news", "Lakeshore Tribune", 22.4, "responsible", { kind: "analysis" }],
  ["fx-o1", "Show HN: a tiny tool that checks if a model card lists its training data", "Hacker News", 5.0, "research", { kind: "trending", sourceId: "hn", popularity: { score: 412, comments: 133, discussUrl: "https://example.com/hn/1" } }],
  ["fx-o2", "A field guide to evaluating small language models", "Hacker News", 9.0, "research", { kind: "trending", sourceId: "hn", popularity: { score: 288, comments: 74, discussUrl: "https://example.com/hn/2" } }],
  ["fx-p1", "Ministry announces call for proposals on public-sector AI pilots", "Office of the Digital Commissioner", 26.0, "policy", { region: "canada", kind: "gov", level: "federal", minister: true }],
  ["fx-p2", "La commissaire au numérique lance un appel de projets pour l'IA publique", "Bureau de la commissaire au numérique", 26.2, "policy", { region: "canada", kind: "gov", level: "federal", minister: true, lang: "fr" }],
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "source";

export function newsFixture(): NewsPayload {
  const stories: Story[] = ROWS.map(([id, title, source, h, topic, o = {}]) => ({
    id,
    title,
    summary: o.summary ?? "",
    link: `https://example.com/${slug(source)}/${id}`,
    source,
    sourceId: o.sourceId ?? `fx-${slug(source)}`,
    region: o.region ?? "world",
    topic,
    tags: o.tags ?? [topic],
    lang: o.lang ?? "en",
    publishedAt: ago(h),
    image: null,
    kind: o.kind ?? "news",
    gov: o.kind === "gov",
    lab: o.kind === "lab",
    level: o.level ?? null,
    minister: !!o.minister,
    ...(o.popularity ? { popularity: o.popularity } : {}),
  }));
  // One AI-desk headline, labelled on the page like the real ones.
  const lead = stories[0];
  lead.ai = {
    en: { title: "Montreal's Northwind Labs releases Aurora-2, an open English–French model", summary: "The company says the model runs on a single laptop GPU; an independent review found strong French scores and a licence that limits commercial use." },
    fr: { title: "Northwind Labs, à Montréal, lance Aurora-2, un modèle ouvert anglais-français", summary: "L'entreprise affirme que le modèle tourne sur un seul GPU de portable; un essai indépendant note de bons résultats en français et une licence qui limite l'usage commercial." },
    from: ["Lakeshore Tribune", "Maple Tech Review", "Signal Quotidien"],
    at: ago(0.5),
  };
  return {
    stories,
    sources: [...new Set(stories.map(s => s.sourceId))].map(id => ({ id, name: id, ok: true, count: stories.filter(s => s.sourceId === id).length })),
    fetchedAt: new Date().toISOString(),
    origin: "built",
  };
}
