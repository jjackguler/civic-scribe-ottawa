import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { SOURCE_REGISTRY, GROUP_META, ALLOW_PAID_APIS, type GroupKey } from "@/lib/source-groups";
import { generatePublicSafetySignals, publicSafetyHeld } from "@/lib/ingest/public-safety";
import { useLocale } from "@/lib/locale-context";
import { useMemo, useState } from "react";
import { ShieldAlert, Power, CheckCircle2, AlertCircle, Settings2, Lock } from "lucide-react";

export const Route = createFileRoute("/admin/sources")({
  head: () => ({ meta: [{ title: "Source dashboard — Ottawa Civic Ledger" }] }),
  component: AdminSourcesPage,
});

const STATUS_STYLE: Record<string, string> = {
  working:                "bg-solution/15 text-solution border-solution/40",
  discovered:             "bg-river/10 text-river border-river/30",
  failed:                 "bg-civic-red/10 text-civic-red border-civic-red/30",
  manual_config_required: "bg-highlight/20 text-ink border-highlight",
  disabled:               "bg-muted text-muted-foreground border-rule",
};

function AdminSourcesPage() {
  const { locale } = useLocale();
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const held = useMemo(() => publicSafetyHeld(generatePublicSafetySignals()), []);

  const groups = Array.from(new Set(SOURCE_REGISTRY.map(s => s.group))) as GroupKey[];

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Tableau de bord des sources" : "Source dashboard"}
        title={locale === "fr" ? "Ingestion gratuite, d'abord" : "Free-first ingestion"}
        dek={locale === "fr"
          ? "Groupes de sources activables. APIs payantes désactivées par défaut."
          : "Toggleable source groups. Paid APIs disabled by default."}
      />

      <div className="grid md:grid-cols-3 gap-3 mb-8">
        <div className="border border-rule bg-card p-4">
          <div className="kicker text-muted-foreground flex items-center gap-2"><Lock className="h-3 w-3" /> ALLOW_PAID_APIS</div>
          <div className="font-display text-2xl mt-1">{String(ALLOW_PAID_APIS).toUpperCase()}</div>
          <p className="text-[11px] text-muted-foreground mt-1">{locale === "fr" ? "Verrouillé par l'environnement" : "Hard-locked by environment"}</p>
        </div>
        <div className="border border-rule bg-card p-4">
          <div className="kicker text-muted-foreground">{locale === "fr" ? "Sources configurées" : "Sources configured"}</div>
          <div className="font-display text-2xl mt-1">{SOURCE_REGISTRY.length}</div>
        </div>
        <div className="border border-civic-red/40 bg-civic-red/5 p-4">
          <div className="kicker text-civic-red flex items-center gap-2"><ShieldAlert className="h-3 w-3" /> {locale === "fr" ? "En attente d'éditeur" : "Held for editor"}</div>
          <div className="font-display text-2xl mt-1 text-civic-red">{held.length}</div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {locale === "fr" ? "Élément sensible de sécurité publique. Révision éditoriale requise." : "Sensitive public-safety item. Editorial review required before publication."}
          </p>
        </div>
      </div>

      {held.length > 0 && (
        <section className="border border-civic-red/40 bg-civic-red/5 mb-8">
          <header className="px-5 py-3 rule-bottom border-civic-red/30 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-civic-red" />
            <h3 className="kicker text-civic-red">{locale === "fr" ? "File d'attente — sécurité publique" : "Public safety hold queue"}</h3>
          </header>
          <ul className="divide-y divide-civic-red/20">
            {held.map(s => (
              <li key={s.id} className="px-5 py-3">
                <div className="font-serif text-sm">{s.title}</div>
                <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-2">
                  <span>{s.neighborhood}</span>
                  <span>· {s.source_name}</span>
                  {s.safety_classifications?.map(t => (
                    <span key={t} className="border border-civic-red/30 text-civic-red px-1.5 py-0.5 uppercase tracking-wider">{t.replace(/_/g," ")}</span>
                  ))}
                </div>
                <p className="text-[11px] text-civic-red mt-2">{s.editor_notes}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="space-y-6">
        {groups.map(g => {
          const meta = GROUP_META[g];
          const items = SOURCE_REGISTRY.filter(s => s.group === g);
          return (
            <section key={g} className="border border-rule bg-card">
              <header className="px-5 py-3 rule-bottom flex items-baseline justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="kicker" style={{ color: meta.color }}>{meta.label}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1">{locale === "fr" ? `Rafraîchissement par défaut · ${meta.refresh} min` : `Default refresh · every ${meta.refresh} min`}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">{items.length} {locale === "fr" ? "sources" : "sources"}</span>
              </header>
              <ul className="divide-y divide-rule">
                {items.map(s => {
                  const enabled = overrides[s.id] ?? s.enabled;
                  return (
                    <li key={s.id} className="px-5 py-3 grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                      <div className="min-w-0">
                        <div className="font-serif text-sm truncate">{s.name}</div>
                        <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-river hover:underline truncate block">{s.url}</a>
                        {s.notes && <div className="text-[11px] text-muted-foreground mt-1">{s.notes}</div>}
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 border ${STATUS_STYLE[s.status]}`}>
                        {s.status === "working" && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                        {s.status === "failed" && <AlertCircle className="h-3 w-3 inline mr-1" />}
                        {s.status === "manual_config_required" && <Settings2 className="h-3 w-3 inline mr-1" />}
                        {s.status.replace(/_/g," ")}
                      </span>
                      <button
                        onClick={() => setOverrides(p => ({ ...p, [s.id]: !enabled }))}
                        className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-1.5 border ${enabled ? "border-solution/40 text-solution" : "border-rule text-muted-foreground"}`}
                      >
                        <Power className="h-3 w-3" /> {enabled ? (locale === "fr" ? "Activé" : "Enabled") : (locale === "fr" ? "Désactivé" : "Disabled")}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
