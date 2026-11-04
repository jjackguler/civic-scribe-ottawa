/** Block-level parsing for the Studio Markdown renderer (src/components/Markdown.tsx). */

export type Block =
  | { k: "h2" | "h3"; text: string }
  | { k: "p"; text: string }
  | { k: "ul" | "ol"; items: string[] }
  | { k: "quote"; text: string }
  | { k: "hr" };

export function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const out: Block[] = [];
  let para: string[] = [];
  let list: { k: "ul" | "ol"; items: string[] } | null = null;
  let quote: string[] = [];
  const flush = () => {
    if (para.length) {
      out.push({ k: "p", text: para.join(" ") });
      para = [];
    }
    if (list) {
      out.push(list);
      list = null;
    }
    if (quote.length) {
      out.push({ k: "quote", text: quote.join(" ") });
      quote = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    const t = line.trim();
    if (!t) {
      flush();
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = t.match(/^(#{1,6})\s+(.*)$/))) {
      flush();
      out.push({ k: m[1].length <= 2 ? "h2" : "h3", text: m[2].replace(/\s+#+$/, "") });
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) {
      flush();
      out.push({ k: "hr" });
      continue;
    }
    if ((m = t.match(/^>\s?(.*)$/))) {
      if (para.length || list) {
        const q = quote;
        quote = [];
        flush();
        quote = q;
      }
      quote.push(m[1]);
      continue;
    }
    if ((m = t.match(/^[-*+]\s+(.*)$/))) {
      if (para.length || quote.length || list?.k === "ol") flush();
      list ??= { k: "ul", items: [] };
      list.items.push(m[1]);
      continue;
    }
    if ((m = t.match(/^\d+[.)]\s+(.*)$/))) {
      if (para.length || quote.length || list?.k === "ul") flush();
      list ??= { k: "ol", items: [] };
      list.items.push(m[1]);
      continue;
    }
    if (list && /^\s{2,}\S/.test(raw)) {
      list.items[list.items.length - 1] += ` ${t}`;
      continue;
    }
    if (list || quote.length) flush();
    para.push(t);
  }
  flush();
  return out;
}
