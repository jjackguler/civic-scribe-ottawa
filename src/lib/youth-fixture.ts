/**
 * DEV ONLY. Sample desk stories about fictional companies and outlets, used by
 * /today, /quiz and the homepage launchers when a page is opened with
 * ?fixture=1 under `vite dev` (feeds and model APIs are unreachable locally).
 * Story ids line up with the sample dispatches in dispatch-fixture.ts, so a
 * story finds its dispatch the way it would in production. Only ever imported
 * behind `import.meta.env.DEV`, so it never ships in a production build.
 */
import type { Story } from "./news-engine";
import type { Topic, Kind } from "./news-sources";

const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

type Seed = [id: string, source: string, title: string, summary: string, hoursAgo: number, topic: Topic, extra?: Partial<Story>];

const seed = ([id, source, title, summary, h, topic, extra]: Seed): Story => ({
  id,
  title,
  summary,
  link: `https://example.com/${source.toLowerCase().replace(/[^a-z]+/g, "-")}/${id}`,
  source,
  sourceId: source.toLowerCase().replace(/[^a-z]+/g, "-"),
  region: "canada",
  topic,
  tags: [topic],
  lang: "en",
  publishedAt: ago(h),
  image: null,
  kind: "news" as Kind,
  gov: false,
  lab: false,
  level: null,
  minister: false,
  ...extra,
});

export const FIXTURE_STORIES: Story[] = ([
  // Aurora-2 (has a dispatch: fixture-aurora)
  ["fx-1", "Northwind Labs", "Introducing Aurora-2: an open-weight model for English and French", "Aurora-2 is available to download today, with weights and a short technical note.", 7.2, "research", { kind: "lab", lab: true, image: "/og-default.png" }],
  ["fx-2", "Lakeshore Tribune", "Montreal's Northwind Labs releases Aurora-2, says it runs on a single laptop GPU", "The Montreal company says its new open model works equally well in English and French.", 5.6, "research", { image: "/og-default.png" }],
  ["fx-3", "Signal Quotidien", "Northwind Labs lance Aurora-2, un modèle ouvert bilingue", "L'entreprise montréalaise publie un modèle ouvert en anglais et en français.", 4.1, "research", { lang: "fr" }],
  ["fx-4", "Maple Tech Review", "Aurora-2 benchmarks: strong French scores, licence limits commercial use", "Our tests show strong French results, but the licence limits commercial use.", 1.3, "research"],
  // Privacy review of AI hiring tools (has a dispatch: fixture-ledger)
  ["fixture-ledger-0", "Lakeshore Tribune", "Provincial privacy office opens review of AI hiring tools used by employers", "The office says it wants to know how employers use AI to screen job applicants.", 8, "policy"],
  ["fixture-ledger-1", "Signal Quotidien", "Privacy office review of AI hiring tools: what job seekers should know", "Candidates can ask employers whether software screened their application.", 7.2, "policy"],
  ["fixture-ledger-2", "Harbour Post", "AI hiring tools face provincial privacy review", "Employers using automated screening will be asked to explain how it works.", 6.4, "policy"],
  // Chip plant (has a dispatch: fixture-chips)
  ["fixture-chips-0", "Maple Tech Review", "Two chipmakers plan joint AI processor plant near Kingston", "The plant would build processors used in AI data centres.", 14, "infrastructure"],
  ["fixture-chips-1", "Harbour Post", "Kingston processor plant: chipmakers say 900 jobs planned", "The companies say construction could start next spring.", 13.2, "infrastructure"],
  // School reading tutor (no dispatch)
  ["fx-tutor-1", "Lakeshore Tribune", "Ottawa school board pilots Pagewise AI reading tutor in 12 classrooms", "Teachers will decide when students use the tutor, the board says, and parents can opt out.", 3, "applications", { image: "/og-default.png" }],
  ["fx-tutor-2", "Harbour Post", "Pagewise reading tutor pilot comes to 12 Ottawa classrooms", "The pilot runs until June, with a report to trustees after.", 2.2, "applications"],
  // Farm robots (no dispatch)
  ["fx-farm-1", "Maple Tech Review", "Fieldhand raises $40 million for strawberry-picking robots", "The Guelph startup says its robots work alongside farm crews at night.", 9, "robotics"],
  ["fx-farm-2", "Signal Quotidien", "Fieldhand lève 40 millions pour ses robots cueilleurs de fraises", "La jeune pousse de Guelph veut doubler sa flotte de robots.", 8.1, "robotics", { lang: "fr" }],
  ["fx-farm-3", "Harbour Post", "Fieldhand strawberry robots get $40 million boost", "Farm workers' groups say they want a say in how the robots are used.", 7.4, "robotics"],
  // Single-outlet stories
  ["fx-health", "Harbour Post", "Riverside Health tests AI that flags sepsis risk hours earlier", "Doctors will review every alert; the hospital network says the trial runs for a year.", 4.6, "health"],
  ["fx-water", "Maple Tech Review", "Data centre water use: Coldwater Cloud publishes its first report", "The company says it used 1.2 billion litres of water last year.", 10, "sustainability"],
  ["fx-seniors", "Lakeshore Tribune", "Halifax library opens free AI help desk for seniors", "Volunteers show people how to spot scams and use AI tools safely.", 5, "people"],
  ["fx-agents", "Signal Quotidien", "Brightpath lance un assistant qui réserve vos rendez-vous médicaux", "L'assistant demande une confirmation avant chaque réservation.", 6, "agents", { lang: "fr" }],
  ["fx-fair", "Harbour Post", "Study finds Stillwater Bank loan model treated older applicants unfairly", "Researchers at Lakeview University say the bank has agreed to retrain the model.", 11, "responsible"],
] as Seed[]).map(seed);
