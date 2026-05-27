import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { EditorialSubnav } from "@/components/editorial/EditorialPrimitives";
import { approvedLetters } from "@/lib/editorial-data";
import { useLocale } from "@/lib/locale-context";
import { useState } from "react";
import { z } from "zod";

const Schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  neighborhood: z.string().trim().max(80).optional(),
  topic: z.string().trim().min(1).max(120),
  body: z.string().trim().min(20).max(2500),
  consent: z.literal(true),
  display: z.enum(["name", "anonymous"]),
});

export const Route = createFileRoute("/letters")({
  head: () => ({ meta: [{ title: "Letters to the Editor — Ottawa Civic Ledger" }, { name: "description", content: "Submit a letter to the editor. All letters are moderated before publication." }] }),
  component: LettersPage,
});

function LettersPage() {
  const { locale } = useLocale();
  const letters = approvedLetters();
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [err, setErr] = useState<string>("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = Schema.safeParse({
      name: f.get("name"),
      email: f.get("email"),
      neighborhood: f.get("neighborhood") || undefined,
      topic: f.get("topic"),
      body: f.get("body"),
      consent: f.get("consent") === "on" ? true : undefined,
      display: f.get("display"),
    });
    if (!parsed.success) { setStatus("error"); setErr(parsed.error.issues[0]?.message || "Invalid"); return; }
    setStatus("ok"); setErr("");
    (e.currentTarget as HTMLFormElement).reset();
  };

  return (
    <PageShell>
      <EditorialSubnav />
      <PageHero kicker="Letters" title="Letters to the Editor." dek="No anonymous insults, no defamation, no doxxing, no sensitive crime details. All letters are moderated before publication." />

      <div className="grid lg:grid-cols-5 gap-12">
        <form onSubmit={onSubmit} className="lg:col-span-3 space-y-4 p-6 border-2 border-ink bg-paper">
          <h2 className="font-display text-2xl">Write a letter</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="block"><span className="kicker block mb-1">Name</span><input name="name" required maxLength={100} className="w-full border border-ink px-3 py-2 text-sm" /></label>
            <label className="block"><span className="kicker block mb-1">Email (not published)</span><input name="email" type="email" required maxLength={255} className="w-full border border-ink px-3 py-2 text-sm" /></label>
            <label className="block"><span className="kicker block mb-1">Neighborhood (optional)</span><input name="neighborhood" maxLength={80} className="w-full border border-ink px-3 py-2 text-sm" /></label>
            <label className="block"><span className="kicker block mb-1">Topic</span><input name="topic" required maxLength={120} className="w-full border border-ink px-3 py-2 text-sm" placeholder="e.g. Council Week 21" /></label>
          </div>
          <label className="block"><span className="kicker block mb-1">Letter (up to 2,500 characters)</span><textarea name="body" required minLength={20} maxLength={2500} rows={8} className="w-full border border-ink px-3 py-2 text-sm font-serif" /></label>
          <fieldset className="flex gap-4 text-sm"><legend className="kicker mb-1">Display</legend>
            <label className="inline-flex items-center gap-2"><input type="radio" name="display" value="name" defaultChecked /> Publish my name</label>
            <label className="inline-flex items-center gap-2"><input type="radio" name="display" value="anonymous" /> Publish as anonymous</label>
          </fieldset>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="consent" className="mt-1" /> I consent to my letter being moderated, edited for length and clarity, and published.</label>
          {status === "error" && <p className="text-civic-red text-sm">{err}</p>}
          {status === "ok" && <p className="text-solution text-sm">Thank you — your letter is in the moderation queue.</p>}
          <button type="submit" className="bg-civic-red text-white px-5 py-2.5 text-xs uppercase tracking-wider font-semibold">Submit for moderation</button>
        </form>

        <aside className="lg:col-span-2">
          <h2 className="font-display text-2xl mb-4">Recently published</h2>
          <ul className="space-y-5">
            {letters.map(l => (
              <li key={l.slug} className="border-b border-rule pb-4">
                <Link to="/letters/$slug" params={{ slug: l.slug }} className="font-display text-xl hover:text-civic-red">{l.title[locale]}</Link>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">— {l.writer_display_name}{l.neighborhood ? `, ${l.neighborhood}` : ""}</div>
                <p className="font-serif text-sm mt-2 text-muted-foreground line-clamp-3">{l.body[locale]}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </PageShell>
  );
}
