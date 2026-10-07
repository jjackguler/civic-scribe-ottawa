import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, PageIntro } from "@/components/PageShell";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { editorUnlock, fundingCheck, newsletterDraft, type FundingReport } from "@/lib/editor.functions";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/editor/tools")({
  head: ({ match }) =>
    seoHead(match, {
      title: { en: `Desk tools — ${SITE.name}`, fr: `Outils de la rédaction — ${SITE.name}` },
      description: { en: `Internal editor tools.`, fr: `Outils internes de la rédaction.` },
      noindex: true,
    }),
  component: Tools,
});

type Prog = { id: string; name: string; url: string; checked: string };

function Tools() {
  const { locale } = useLocale();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [session, setSession] = useState<{ claude: boolean; programs: Prog[] } | null>(null);

  const unlock = async () => {
    setErr("");
    try {
      const r = await editorUnlock({ data: { passcode: code } });
      if (r.ok) setSession({ claude: r.claude, programs: r.programs });
      else setErr(t(r.reason === "locked" ? "tooManyTries" : "wrongPasscode", locale));
    } catch { setErr(t("wrongPasscode", locale)); }
  };

  return (
    <PageShell>
      <PageIntro title={t("deskTools", locale)} dek="" />
      <div className="container-mw mt-8 max-w-5xl">
        {!session ? (
          <form onSubmit={e => { e.preventDefault(); void unlock(); }} className="flex flex-wrap gap-2 items-center">
            <label className="font-semibold" htmlFor="pc">{t("passcode", locale)}</label>
            <input id="pc" type="password" value={code} onChange={e => setCode(e.target.value)} className="border border-line rounded-[5px] px-3 py-2" autoComplete="current-password" />
            <button className="bg-ink text-white px-4 py-2 rounded-[5px] font-semibold">{t("unlock", locale)}</button>
            {err && <p className="w-full text-live">{err}</p>}
          </form>
        ) : !session.claude ? (
          <p>{t("claudeOff", locale)}</p>
        ) : (
          <>
            <FundingTool passcode={code} programs={session.programs} />
            <NewsletterTool passcode={code} />
          </>
        )}
      </div>
    </PageShell>
  );
}

function FundingTool({ passcode, programs }: { passcode: string; programs: Prog[] }) {
  const { locale } = useLocale();
  const [busy, setBusy] = useState(false);
  const [reports, setReports] = useState<Record<string, FundingReport>>({});
  const run = async () => {
    setBusy(true);
    for (let i = 0; i < programs.length; i += 3) {
      try {
        const r = await fundingCheck({ data: { passcode, ids: programs.slice(i, i + 3).map(p => p.id) } });
        setReports(prev => ({ ...prev, ...Object.fromEntries(r.reports.map(x => [x.id, x])) }));
      } catch { /* keep going */ }
    }
    setBusy(false);
  };
  const label = (v: FundingReport["verdict"]) => t(v === "unchanged" ? "unchanged" : v === "possibly_outdated" ? "possiblyOutdated" : "couldNotCheck", locale);
  return (
    <section className="mb-12">
      <div className="flex items-center gap-4 mb-3">
        <h2 className="masthead-serif text-[1.7rem]">{t("fundingCheck", locale)}</h2>
        <button onClick={run} disabled={busy} className="bg-ink text-white px-4 py-2 rounded-[5px] font-semibold disabled:opacity-60">{busy ? t("working", locale) : t("runCheck", locale)}</button>
      </div>
      <table className="w-full text-[0.92rem] border border-line">
        <thead><tr className="text-left bg-ice"><th className="p-2">Program</th><th className="p-2">{t("lastChecked", locale)}</th><th className="p-2">Result</th></tr></thead>
        <tbody>
          {programs.map(p => {
            const r = reports[p.id];
            return (
              <tr key={p.id} className="border-t border-line align-top">
                <td className="p-2"><a href={p.url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">{p.name}</a></td>
                <td className="p-2 whitespace-nowrap">{p.checked}{r && <span className="block meta">Claude: {r.checkedAt.slice(0, 16).replace("T", " ")}</span>}</td>
                <td className="p-2">
                  {r ? (
                    <>
                      <span className={`font-bold ${r.verdict === "unchanged" ? "" : "text-live"}`}>{label(r.verdict)}</span>
                      {r.note && <p className="meta">{r.note}</p>}
                      {r.disagreements.map((d, i) => (
                        <p key={i} className="mt-1"><b>{d.field}:</b> ours “{d.ours}” — page “{d.page}”</p>
                      ))}
                    </>
                  ) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function NewsletterTool({ passcode }: { passcode: string }) {
  const { locale } = useLocale();
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const run = async () => {
    setBusy(true); setMsg("");
    try {
      const r = await newsletterDraft({ data: { passcode } });
      if (r.error) setMsg(r.error);
      setText(r.en || r.fr ? `${r.en}\n\n— — —\n\n${r.fr}` : "");
    } catch { setMsg("Claude is unavailable right now."); }
    setBusy(false);
  };
  return (
    <section className="mb-12">
      <div className="flex items-center gap-4 mb-3">
        <h2 className="masthead-serif text-[1.7rem]">{t("newsletterDraft", locale)}</h2>
        <button onClick={run} disabled={busy} className="bg-ink text-white px-4 py-2 rounded-[5px] font-semibold disabled:opacity-60">{busy ? t("working", locale) : t("generateDraft", locale)}</button>
      </div>
      <p className="border-2 border-live text-live font-bold px-3 py-2 mb-2">{t("draftBanner", locale)}</p>
      {msg && <p className="meta mb-2">{msg}</p>}
      <textarea value={text} onChange={e => setText(e.target.value)} rows={24} className="w-full border border-line rounded-[5px] p-3 font-mono text-[0.85rem]" />
      <button
        onClick={() => { void navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }}
        className="mt-2 border border-ink px-4 py-2 rounded-[5px] font-semibold"
      >{copied ? t("copied", locale) : t("copy", locale)}</button>
    </section>
  );
}
