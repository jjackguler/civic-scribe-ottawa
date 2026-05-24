import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import type { GuideTopic } from "@/lib/guide-data";

export function GuideTopicCard({ g }: { g: GuideTopic }) {
  const { locale } = useLocale();
  const Icon = (Icons as any)[g.icon] ?? Icons.BookOpen;
  return (
    <Link
      to={g.href as any}
      className="group block bg-card border border-rule p-5 hover:border-ink transition-colors h-full"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 h-10 w-10 grid place-items-center bg-secondary group-hover:bg-civic-red group-hover:text-paper transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-lg leading-tight group-hover:text-civic-red transition-colors">{g.title[locale]}</h3>
          <p className="text-sm font-serif text-muted-foreground mt-1 leading-snug">{g.blurb[locale]}</p>
        </div>
      </div>
    </Link>
  );
}
