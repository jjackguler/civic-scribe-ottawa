import { type Solution } from "@/lib/data";
import { useLocale } from "@/lib/locale-context";
import { Lightbulb, Users, MapPin, ArrowRight } from "lucide-react";

export function SolutionCard({ s }: { s: Solution }) {
  const { locale } = useLocale();
  return (
    <article className="bg-card border-l-4 border-solution p-6">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-solution" />
        <span className="kicker text-solution">{locale === "fr" ? "Solution" : "Solution"}</span>
      </div>
      <h3 className="font-display text-2xl leading-tight">{s.problem[locale]}</h3>

      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" /> {s.affected[locale]}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <h4 className="kicker text-muted-foreground mb-2">{locale === "fr" ? "Essayé ici" : "Tried locally"}</h4>
          <p className="font-serif text-sm">{s.triedLocal[locale]}</p>
        </div>
        <div>
          <h4 className="kicker text-muted-foreground mb-2">{locale === "fr" ? "Ailleurs" : "Examples from elsewhere"}</h4>
          <ul className="space-y-2">
            {s.examples.map((e, i) => (
              <li key={i} className="text-sm">
                <div className="flex items-center gap-1.5 text-xs font-semibold"><MapPin className="h-3 w-3" />{e.city}</div>
                <p className="font-serif text-foreground/80">{e.outcome[locale]}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rule-top pt-4 flex items-center justify-between gap-4">
        <p className="text-sm font-serif italic">{s.nextSteps[locale]}</p>
        <ArrowRight className="h-4 w-4 text-solution shrink-0" />
      </div>
    </article>
  );
}
