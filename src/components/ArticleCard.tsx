import { Link } from "@tanstack/react-router";
import { useLocale } from "@/lib/locale-context";
import { t } from "@/lib/i18n";
import { type Article, safeTransitImage } from "@/lib/data";
import { NewsImage } from "@/components/NewsImage";
import { Clock, MapPin } from "lucide-react";

const statusStyles: Record<string, string> = {
  verified: "text-solution border-solution/40 bg-solution/5",
  developing: "text-civic-red border-civic-red/40 bg-civic-red/5",
  community: "text-river border-river/40 bg-river/5",
  opinion: "text-foreground border-rule bg-secondary",
  sponsored: "text-muted-foreground border-rule bg-muted",
};

export function StatusBadge({ status }: { status: Article["status"] }) {
  const { locale } = useLocale();
  return (
    <span className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em] font-semibold ${statusStyles[status]}`}>
      <span className="w-1 h-1 rounded-full bg-current" />
      {t(status as any, locale)}
    </span>
  );
}

export function ArticleCard({
  article, variant = "default",
}: {
  article: Article;
  variant?: "hero" | "lead" | "default" | "compact" | "horizontal";
}) {
  const { locale } = useLocale();
  const to = `/article/${article.slug}`;

  if (variant === "hero") {
    return (
      <article className="group">
        <Link to={to} className="block">
          <div className="aspect-[16/10] overflow-hidden bg-muted mb-5">
            <NewsImage src={safeTransitImage(article.image, article.kicker.en)} headline={article.title.en} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" loading="lazy" />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="kicker text-civic-red">{article.kicker[locale]}</span>
            <StatusBadge status={article.status} />
          </div>
          <h2 className="font-display text-3xl md:text-5xl leading-[1.05] tracking-tight group-hover:text-civic-red transition-colors">
            {article.title[locale]}
          </h2>
          <p className="mt-4 font-serif text-lg md:text-xl text-muted-foreground leading-snug max-w-3xl">
            {article.dek[locale]}
          </p>
          <Meta article={article} className="mt-4" />
        </Link>
      </article>
    );
  }

  if (variant === "lead") {
    return (
      <article className="group">
        <Link to={to} className="block">
          <div className="aspect-[4/3] overflow-hidden bg-muted mb-4">
            <NewsImage src={safeTransitImage(article.image, article.kicker.en)} headline={article.title.en} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" loading="lazy" />
          </div>
          <span className="kicker text-civic-red">{article.kicker[locale]}</span>
          <h3 className="font-display text-2xl leading-tight mt-2 group-hover:text-civic-red transition-colors">
            {article.title[locale]}
          </h3>
          <p className="mt-2 font-serif text-base text-muted-foreground line-clamp-2">{article.dek[locale]}</p>
          <Meta article={article} className="mt-3" />
        </Link>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group py-3 rule-bottom last:border-0">
        <Link to={to} className="block">
          <span className="kicker text-civic-red">{article.kicker[locale]}</span>
          <h3 className="font-display text-base leading-snug mt-1 group-hover:text-civic-red transition-colors">
            {article.title[locale]}
          </h3>
        </Link>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className="group grid grid-cols-[1fr_120px] gap-4 py-4 rule-bottom">
        <Link to={to} className="block">
          <span className="kicker text-civic-red">{article.kicker[locale]}</span>
          <h3 className="font-display text-lg leading-snug mt-1 group-hover:text-civic-red transition-colors">
            {article.title[locale]}
          </h3>
          <Meta article={article} className="mt-2" />
        </Link>
        <Link to={to} className="block aspect-square overflow-hidden bg-muted">
          <NewsImage src={safeTransitImage(article.image, article.kicker.en)} headline={article.title.en} alt="" className="w-full h-full object-cover" loading="lazy" />
        </Link>
      </article>
    );
  }

  return (
    <article className="group">
      <Link to={to} className="block">
        <div className="aspect-[3/2] overflow-hidden bg-muted mb-3">
          <NewsImage src={safeTransitImage(article.image, article.kicker.en)} headline={article.title.en} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" loading="lazy" />
        </div>
        <span className="kicker text-civic-red">{article.kicker[locale]}</span>
        <h3 className="font-display text-xl leading-snug mt-1 group-hover:text-civic-red transition-colors">
          {article.title[locale]}
        </h3>
        <Meta article={article} className="mt-2" />
      </Link>
    </article>
  );
}

function Meta({ article, className = "" }: { article: Article; className?: string }) {
  const { locale } = useLocale();
  const hasSource = Array.isArray(article.sources) && article.sources.length > 0;
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground font-sans ${className}`}>
      <span>By {article.byline}</span>
      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{article.readMinutes} {t("minRead", locale)}</span>
      {article.neighborhood && (
        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{article.neighborhood}</span>
      )}
      {article.language === "bilingual" && <span className="border border-rule px-1 text-[9px] tracking-wider">EN / FR</span>}
      {!hasSource && (
        <span className="border border-highlight/50 bg-highlight/10 text-highlight px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold">
          {locale === "fr" ? "Soumis par un citoyen · vérification en cours" : "Citizen submitted · awaiting verification"}
        </span>
      )}
    </div>
  );
}
