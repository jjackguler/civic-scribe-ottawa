import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero } from "@/components/PageShell";
import { SOURCE_REGISTRY, GROUP_META, ALLOW_PAID_APIS, type GroupKey } from "@/lib/source-groups";
import { generatePublicSafetySignals, publicSafetyHeld } from "@/lib/ingest/public-safety";
import { useLocale } from "@/lib/locale-context";
import { useMemo, useState, useEffect } from "react";
import { ShieldAlert, Power, CheckCircle2, AlertCircle, Settings2, Lock, Bell, MapPin, FlaskConical } from "lucide-react";

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
  const [groupOverrides, setGroupOverrides] = useState<Record<GroupKey, boolean>>({} as any);
  const held = useMemo(() => publicSafetyHeld(generatePublicSafetySignals()), []);
  const groups = useMemo(() => Array.from(new Set(SOURCE_REGISTRY.map(s => s.group))) as GroupKey[], []);

  // Defer "last sync / next sync" rendering to the client to keep SSR deterministic.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const i = setInterval(() => setNow(new Date()), 60_000); return () => clearInterval(i); }, []);

  const counts = useMemo(() => {
    const c = { working: 0, discovered: 0, failed: 0, manual_config_required: 0, disabled: 0 } as Record<string, number>;
    SOURCE_REGISTRY.forEach(s => { c[s.status] = (c[s.status] ?? 0) + 1; });
    return c;
  }, []);
  const failedSources = SOURCE_REGISTRY.filter(s => s.status === "failed");
  const mockRemaining = held.length + SOURCE_REGISTRY.filter(s => s.status === "discovered" || s.status === "manual_config_required").length;
  const googleMapsEnabled = !!(import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;

  // Owner alerts: rolled up from real state.
  const ownerAlerts: { tone: "red" | "yellow" | "blue"; text: string }[] = [];
  if (held.length > 0) ownerAlerts.push({ tone: "red", text: locale === "fr" ? `${held.length} élément(s) de sécurité publique en attente de révision.` : `${held.length} sensitive public-safety item(s) awaiting editor review.` });
  if (failedSources.length > 0) ownerAlerts.push({ tone: "red", text: locale === "fr" ? `${failedSources.length} source(s) en échec.` : `${failedSources.length} source(s) currently failing.` });
  if (!googleMapsEnabled) ownerAlerts.push({ tone: "blue", text: locale === "fr" ? "Couche Google Live Traffic désactivée — sources officielles gratuites en service." : "Google live traffic layer disabled — free official sources in use." });
  if (mockRemaining > 0) ownerAlerts.push({ tone: "yellow", text: locale === "fr" ? `${mockRemaining} flux fonctionnent encore en mode prototype/maquette.` : `${mockRemaining} feeds still running on prototype/mock data.` });

  return (
    <PageShell>
      <PageHero
        kicker={locale === "fr" ? "Tableau de bord des sources" : "Source dashboard"}
        title={locale === "fr" ? "Ingestion gratuite, d'abord" : "Free-first ingestion"}
        dek={locale === "fr"
          ? "Groupes de sources activables. APIs payantes désactivées par défaut."
          : "Toggleable source groups. Paid APIs disabled by default."}
      />

      {/* Owner alerts */}
      {ownerAlerts.length > 0 && (
        <section className="mb-6 space-y-2">
          {ownerAlerts.map((a, i) => (
            <div key={i} className={`flex items-start gap-2 border px-4 py-3 text-xs font-sans ${
              a.tone === "red" ? "border-civic-red/40 bg-civic-red/5 text-civic-red" :
              a.tone === "yellow" ? "border-highlight bg-highlight/10 text-ink" :
              "border-river/30 bg-river/5 text-river"
            }`}>
              <Bell className="h-3.5 w-3.5 mt-0.5 shrink-0" /><span>{a.text}</span>
            </div>
          ))}
        </section>
      )}

      {/* Top stats */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <Stat label="ALLOW_PAID_APIS" value={String(ALLOW_PAID_APIS).toUpperCase()} icon={<Lock className="h-3 w-3" />} sub={locale === "fr" ? "Verrouillé" : "Hard-locked"} />
        <Stat label={locale === "fr" ? "Sources" : "Sources"} value={SOURCE_REGISTRY.length} />
        <Stat label={locale === "fr" ? "Fonctionnent" : "Working"} value={counts.working ?? 0} tone="solution" />
        <Stat label={locale === "fr" ? "Manuel requis" : "Manual config"} value={counts.manual_config_required ?? 0} tone="highlight" />
        <Stat label={locale === "fr" ? "En échec" : "Failed"} value={counts.failed ?? 0} tone="red" />
        <Stat label={locale === "fr" ? "Données maquette" : "Mock remaining"} value={mockRemaining} icon={<FlaskConical className="h-3 w-3" />} tone="highlight" />
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-8">
        <div className="border border-civic-red/40 bg-civic-red/5 p-4">
          <div className="kicker text-civic-red flex items-center gap-2"><ShieldAlert className="h-3 w-3" /> {locale === "fr" ? "File sécurité publique" : "Public-safety hold queue"}</div>
          <div className="font-display text-2xl mt-1 text-civic-red">{held.length}</div>
          <p className="text-[11px] text-muted-foreground mt-1">{locale === "fr" ? "Révision éditoriale requise." : "Editorial review required."}</p>
        </div>
        <div className="border border-rule bg-card p-4">
          <div className="kicker text-river flex items-center gap-2"><MapPin className="h-3 w-3" /> Google Maps</div>
          <div className={`font-display text-2xl mt-1 ${googleMapsEnabled ? "text-solution" : "text-muted-foreground"}`}>{googleMapsEnabled ? "ENABLED" : "DISABLED"}</div>
          <p className="text-[11px] text-muted-foreground mt-1">{googleMapsEnabled
            ? (locale === "fr" ? "Clé VITE_GOOGLE_MAPS_API_KEY configurée." : "VITE_GOOGLE_MAPS_API_KEY is configured.")
            : (locale === "fr" ? "Carte de base Leaflet active; couche Google désactivée." : "Leaflet base map active; Google layer off.")}</p>
        </div>
        <div className="border border-rule bg-card p-4">
          <div className="kicker text-muted-foreground">{locale === "fr" ? "Dernier balayage" : "Last sweep (client)"}</div>
          <div className="font-display text-lg mt-1">{now ? now.toLocaleTimeString(locale === "fr" ? "fr-CA" : "en-CA") : "—"}</div>
          <p className="text-[11px] text-muted-foreground mt-1">{locale === "fr" ? "Prochain dans ~60 s" : "Next in ~60s"}</p>
        </div>
      </div>

      {/* Failed list */}
      {failedSources.length > 0 && (
        <section className="border border-civic-red/40 bg-civic-red/5 mb-8">
          <header className="px-5 py-3 rule-bottom border-civic-red/30">
            <h3 className="kicker text-civic-red">{locale === "fr" ? "Sources en échec" : "Failed sources"}</h3>
          </header>
          <ul className="divide-y divide-civic-red/20">
            {failedSources.map(s => (
              <li key={s.id} className="px-5 py-3 text-sm font-serif">{s.name} <span className="text-[11px] text-muted-foreground">· {s.url}</span></li>
            ))}
          </ul>
        </section>
      )}

      {/* Hold queue */}
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

      {/* Groups */}
      <div className="space-y-6">
        {groups.map(g => {
          const meta = GROUP_META[g];
          const items = SOURCE_REGISTRY.filter(s => s.group === g);
          const groupEnabled = groupOverrides[g] ?? true;
          // Deterministic-ish sync labels — use refresh window. Client-only display.
          const lastSync = now ? new Date(now.getTime() - meta.refresh * 60_000 * 0.4).toLocaleTimeString(locale === "fr" ? "fr-CA" : "en-CA") : "—";
          const nextSync = now ? new Date(now.getTime() + meta.refresh * 60_000 * 0.6).toLocaleTimeString(locale === "fr" ? "fr-CA" : "en-CA") : "—";
          return (
            <section key={g} className={`border ${groupEnabled ? "border-rule" : "border-rule opacity-60"} bg-card`}>
              <header className="px-5 py-3 rule-bottom flex items-baseline justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="kicker" style={{ color: meta.color }}>{meta.label}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {locale === "fr" ? `Dernier : ${lastSync} · Prochain : ${nextSync}` : `Last sync: ${lastSync} · Next: ${nextSync}`}
                    {" · "}{items.length} {locale === "fr" ? "sources" : "sources"}
                  </p>
                </div>
                <button
                  onClick={() => setGroupOverrides(p => ({ ...p, [g]: !groupEnabled }))}
                  className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-1.5 border ${groupEnabled ? "border-solution/40 text-solution" : "border-rule text-muted-foreground"}`}
                >
                  <Power className="h-3 w-3" /> {groupEnabled ? (locale === "fr" ? "Groupe activé" : "Group enabled") : (locale === "fr" ? "Groupe désactivé" : "Group disabled")}
                </button>
              </header>
              <ul className="divide-y divide-rule">
                {items.map(s => {
                  const enabled = (overrides[s.id] ?? s.enabled) && groupEnabled;
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

function Stat({ label, value, sub, icon, tone }: { label: string; value: any; sub?: string; icon?: React.ReactNode; tone?: "solution"|"highlight"|"red" }) {
  const color = tone === "solution" ? "text-solution" : tone === "highlight" ? "text-ink" : tone === "red" ? "text-civic-red" : "text-ink";
  return (
    <div className="border border-rule bg-card p-3">
      <div className="kicker text-muted-foreground flex items-center gap-1.5">{icon}{label}</div>
      <div className={`font-display text-xl mt-1 ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
