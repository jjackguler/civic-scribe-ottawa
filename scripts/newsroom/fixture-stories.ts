/**
 * DRY RUN ONLY. A small fictional news desk (invented companies, outlets and
 * an invented agency, example.com links) that exercises every path of the
 * pipeline without feeds or model keys:
 *
 *   fx-aurora-*   four outlets on one release      → published (standard)
 *   fx-commish    one official announcement        → published (numbers)
 *   fx-kestrel-*  two outlets on a launch          → published (explainer, with our own background)
 *   fx-harbour-*  two outlets; the draft invents facts and the rewrite still does → rejected by the copy desk
 *   fx-lumen-*    two outlets; the draft states a forecast as fact → rejected by the standards desk
 *   fx-lone       one outlet, not the party itself → never picked
 */
import type { Story } from "../../src/lib/news-engine";

const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

const base = (p: Partial<Story> & Pick<Story, "id" | "title" | "summary" | "source" | "publishedAt">): Story => ({
  link: `https://example.com/${p.id}`,
  sourceId: p.source.toLowerCase().replace(/[^a-z]+/g, "-"),
  region: "canada",
  topic: "research",
  tags: ["research"],
  lang: "en",
  image: null,
  kind: "news",
  gov: false,
  lab: false,
  level: null,
  minister: false,
  ...p,
});

export const FIXTURE_STORIES: Story[] = [
  base({
    id: "fx-aurora-1", source: "Northwind Labs", kind: "lab", lab: true, publishedAt: ago(7.2),
    title: "Northwind Labs introduces Aurora-2, an open-weight model for English and French",
    summary: "Today we are releasing Aurora-2, an open-weight language model trained for English and French. The model has 7 billion parameters and runs on a single laptop GPU with 16 GB of memory. Weights are available under the Aurora Community Licence, which allows research and personal use; companies with more than 50 employees need a commercial licence. We trained Aurora-2 on public-domain books, Canadian government publications in both official languages and licensed news archives.",
  }),
  base({
    id: "fx-aurora-2", source: "Lakeshore Tribune", publishedAt: ago(5.6), image: "https://example.com/photo.jpg",
    title: "Montreal's Northwind Labs releases Aurora-2, says it runs on a single laptop GPU",
    summary: "Montreal start-up Northwind Labs on Tuesday released Aurora-2, a bilingual AI model whose files anyone can download. The company says the model runs on a single laptop GPU, which would let schools, clinics and small firms use it without sending text to a cloud service. Northwind's chief executive, Amélie Roy, said the company wants French speakers to have a model \"that treats their language as a first language, not a translation.\"",
  }),
  base({
    id: "fx-aurora-3", source: "Signal Quotidien", lang: "fr", publishedAt: ago(4.1),
    title: "Northwind Labs lance Aurora-2, un modèle ouvert bilingue",
    summary: "La jeune pousse montréalaise Northwind Labs a lancé mardi Aurora-2, un modèle d'intelligence artificielle ouvert entraîné en français et en anglais. Selon l'entreprise, ses 7 milliards de paramètres tiennent sur la carte graphique d'un ordinateur portable. Les données d'entraînement comprennent des publications gouvernementales canadiennes dans les deux langues officielles.",
  }),
  base({
    id: "fx-aurora-4", source: "Maple Tech Review", publishedAt: ago(1.3),
    title: "Aurora-2 benchmarks: strong French scores, licence limits commercial use",
    summary: "In our tests, Aurora-2 scored 71 percent on a French reading-comprehension benchmark, ahead of two larger open models we compared it with. Its licence is the catch: firms with more than 50 employees must buy a commercial licence, and Northwind has not published a price. The company did not say when a larger version would follow.",
  }),

  base({
    id: "fx-commish", source: "Office of the Digital Commissioner", kind: "gov", gov: true, level: "federal", topic: "policy", tags: ["policy", "people"], publishedAt: ago(3),
    title: "Digital Commissioner opens consultation on AI in hiring",
    summary: "The Office of the Digital Commissioner today opened a 12-week public consultation on the use of AI tools in hiring. Employers, workers, unions and job seekers can comment online until January 15. The office will hold 3 public hearings, in Halifax, Winnipeg and Vancouver, and will publish a summary of what it heard. The consultation paper asks whether employers should have to tell applicants when an automated tool screens their application, and whether applicants should be able to ask for a human review.",
  }),

  base({
    id: "fx-harbour-1", source: "Port Weekly", topic: "robotics", tags: ["robotics"], publishedAt: ago(9),
    title: "Harbourline Robotics to test AI sorting robots at Halifax port",
    summary: "Harbourline Robotics will test AI-guided sorting robots at the Port of Halifax this winter, the company said. The pilot covers one warehouse, and Harbourline says the robots can sort parcels by size and destination.",
  }),
  base({
    id: "fx-harbour-2", source: "Atlantic Ledger", topic: "robotics", tags: ["robotics"], publishedAt: ago(8),
    title: "Harbourline Robotics pilot brings AI sorting robots to Halifax warehouse",
    summary: "The pilot will run for six months in a single warehouse at the Port of Halifax, Harbourline said. The union representing port workers said it had not been consulted and asked for a meeting with the company.",
  }),

  base({
    id: "fx-kestrel-1", source: "Coastline Daily", topic: "applications", tags: ["applications"], publishedAt: ago(11),
    title: "Kestrel launches homework chatbot KestrelStudy for Grade 9 to 12 students",
    summary: "Kestrel, a Toronto education company, launched KestrelStudy, a chatbot that helps Grade 9 to 12 students with math and science homework. The app costs $8 a month. Kestrel's founder, Priya Nair, said the chatbot will replace tutors for most families within five years.",
  }),
  base({
    id: "fx-kestrel-2", source: "Prairie Signal", topic: "applications", tags: ["applications"], publishedAt: ago(10),
    title: "KestrelStudy homework chatbot arrives in Ontario, with parental controls",
    summary: "KestrelStudy, the new homework chatbot from Toronto's Kestrel, includes parental controls and a weekly report for parents, the company said. Kestrel said student conversations are not used to train its models.",
  }),

  base({
    id: "fx-lumen-1", source: "Harbour City Herald", topic: "business", tags: ["business", "people"], publishedAt: ago(14),
    title: "Lumenfield to cut 120 call-centre jobs in Moncton as it expands AI assistants",
    summary: "Lumenfield, an insurance company, will cut 120 jobs at its Moncton call centre by March as it moves more customer calls to AI assistants, the company told staff on Monday. Lumenfield said affected employees will be offered retraining or severance.",
  }),
  base({
    id: "fx-lumen-2", source: "Eastern Business Wire", topic: "business", tags: ["business", "people"], publishedAt: ago(13),
    title: "Lumenfield call-centre cuts: 120 Moncton jobs go as AI assistants take calls",
    summary: "The 120 positions are about a third of the Moncton centre's staff, according to the union local, which said it would ask the province to help workers find new jobs. Lumenfield said its AI assistants now answer most routine policy questions.",
  }),

  base({
    id: "fx-lone", source: "Byte Bulletin", topic: "business", tags: ["business"], publishedAt: ago(2),
    title: "Rumour: Brightwater said to be weighing a sale of its chatbot unit",
    summary: "Brightwater is weighing a sale of its chatbot unit, according to two people familiar with the matter who asked not to be named. Brightwater declined to comment.",
  }),
];
