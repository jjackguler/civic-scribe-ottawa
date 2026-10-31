/**
 * A small, safe Markdown renderer for Studio dispatches.
 *
 * It builds React elements (never HTML strings), so nothing in a file can inject
 * markup or script. Supported: ## / ### headings (a single # is shown as ##, since
 * the page title is the only h1), paragraphs, - / * / 1. lists, > quotes, ---
 * rules, **bold**, *italic* / _italic_, `code` and [links](https://…). Links to
 * other sites open normally with rel="noopener"; anything that is not http(s),
 * mailto or a site path is shown as plain text.
 */
import { Fragment, type ReactNode } from "react";
import { parseBlocks } from "@/lib/markdown";

const SAFE_HREF = /^(https?:\/\/|mailto:|\/(?!\/))/i;

/** Inline spans: links, bold, italic, code. */
function inline(text: string, keyBase = "i", localize?: (path: string) => string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re =
    /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*]+)\*|_([^_]+)_|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const key = `${keyBase}-${n++}`;
    if (m[1] !== undefined) {
      const href = m[2];
      if (SAFE_HREF.test(href)) {
        const external = /^https?:/i.test(href);
        nodes.push(
          <a
            key={key}
            href={external || href.startsWith("mailto:") ? href : localize ? localize(href) : href}
            {...(external ? { rel: "noopener" } : {})}
            className="text-lake underline decoration-1 underline-offset-[3px] hover:decoration-2"
          >
            {inline(m[1], key, localize)}
          </a>,
        );
      } else nodes.push(<Fragment key={key}>{m[1]}</Fragment>);
    } else if (m[3] !== undefined || m[4] !== undefined)
      nodes.push(<strong key={key}>{inline(m[3] ?? m[4], key, localize)}</strong>);
    else if (m[5] !== undefined || m[6] !== undefined)
      nodes.push(<em key={key}>{inline(m[5] ?? m[6], key, localize)}</em>);
    else if (m[7] !== undefined)
      nodes.push(
        <code key={key} className="font-mono text-[0.9em] bg-ice px-1 rounded-sm">
          {m[7]}
        </code>,
      );
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({
  source,
  className = "",
  localize,
}: {
  source: string;
  className?: string;
  localize?: (path: string) => string;
}) {
  const blocks = parseBlocks(source);
  return (
    <div className={`article-body ${className}`}>
      {blocks.map((b, i) => {
        const k = `b${i}`;
        switch (b.k) {
          case "h2":
            return <h2 key={k}>{inline(b.text, k, localize)}</h2>;
          case "h3":
            return <h3 key={k}>{inline(b.text, k, localize)}</h3>;
          case "ul":
            return (
              <ul key={k}>
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it, `${k}-${j}`, localize)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={k}>
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it, `${k}-${j}`, localize)}</li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote key={k}>
                <p>{inline(b.text, k, localize)}</p>
              </blockquote>
            );
          case "hr":
            return <hr key={k} />;
          default:
            return <p key={k}>{inline(b.text, k, localize)}</p>;
        }
      })}
    </div>
  );
}
