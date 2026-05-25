import { Link } from "@tanstack/react-router";
import { MapPin, AlertCircle, CheckCircle2, Award } from "lucide-react";
import { SmartImage } from "./SmartImage";
import { useLocale } from "@/lib/locale-context";

// Simple deterministic ward of the day if geolocation not granted.
const SPOTLIGHT_WARDS = [
  { slug: "hintonburg", name: "Hintonburg", blurb: { en: "Indie shops, Wellington West, the bakery line.", fr: "Boutiques indépendantes, Wellington Ouest, file d'attente à la boulangerie." }, query: "ottawa hintonburg street" },
  { slug: "vanier",     name: "Vanier",     blurb: { en: "Francophone heart of the city, art and resilience.", fr: "Cœur francophone, art et résilience." }, query: "ottawa vanier neighborhood" },
  { slug: "glebe",      name: "The Glebe",  blurb: { en: "Bank Street, Lansdowne, leafy weekend streets.", fr: "Rue Bank, Lansdowne, rues feuillues le week-end." }, query: "ottawa glebe lansdowne" },
];

export function YourStreetsPanel() {
  const { locale } = useLocale();
  const ward = SPOTLIGHT_WARDS[new Date().getDate() % SPOTLIGHT_WARDS.length];

  return (
    <section className="bg-card border border-rule p-5 md:p-7">
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Header & image */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-civic-red" />
            <span className="kicker text-civic-red">{locale === "fr" ? "Vos rues" : "Your streets"}</span>
            <span className="ticker-dot ml-1" />
          </div>
          <h2 className="font-display text-3xl leading-tight">
            {ward.name}
          </h2>
          <p className="font-serif text-sm text-muted-foreground italic mt-1">
            {locale === "fr" ? "Coup de projecteur quartier · aujourd'hui" : "Ward in the spotlight · today"}
          </p>
          <p className="font-serif text-base mt-3 leading-snug">{ward.blurb[locale]}</p>
          <div className="mt-4">
            <SmartImage query={ward.query} alt={`${ward.name} streets`} aspectRatio="3/2" seed={ward.slug} />
          </div>
          <Link
            to={"/neighborhoods/$slug" as any}
            params={{ slug: ward.slug } as any}
            className="inline-block mt-4 text-[11px] uppercase tracking-wider font-semibold border-b border-ink hover:text-civic-red"
          >
            {locale === "fr" ? `Voir toutes les histoires de ${ward.name}` : `View all stories in ${ward.name}`} →
          </Link>
        </div>

        {/* Latest 3 local stories */}
        <div className="lg:col-span-5">
          <h3 className="kicker text-civic-red mb-3">{locale === "fr" ? "Dernières nouvelles locales" : "Latest local stories"}</h3>
          <ul className="divide-y divide-rule">
            {[
              { k: locale === "fr" ? "Voirie" : "Roads",    t: locale === "fr" ? "Nid-de-poule s'agrandit sur Wellington Ouest" : "Pothole growing fast on Wellington West", time: "36 min" },
              { k: locale === "fr" ? "Communauté" : "Community", t: locale === "fr" ? "Marché fermier de quartier ce samedi" : "Pop-up farmers market this Saturday", time: "2 h" },
              { k: locale === "fr" ? "Culture" : "Culture", t: locale === "fr" ? "Murale dévoilée près de Parkdale" : "New mural unveiled near Parkdale", time: "5 h" },
            ].map((s, i) => (
              <li key={i} className="py-3">
                <span className="kicker text-civic-red">{s.k}</span>
                <p className="font-display text-lg leading-snug mt-1 hover:text-civic-red cursor-pointer">{s.t}</p>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{s.time} {locale === "fr" ? "" : "ago"}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Issues + hero */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-secondary p-4">
            <h3 className="kicker text-civic-red">{locale === "fr" ? "Enjeux ouverts" : "Open issues"}</h3>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-display text-4xl text-civic-red">4</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{locale === "fr" ? "signalés" : "reported"}</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-4xl">2</span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{locale === "fr" ? "résolus / sem" : "resolved / wk"}</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs">
              <li className="flex items-center gap-1.5"><AlertCircle className="h-3 w-3 text-civic-red" /> Pothole · Wellington</li>
              <li className="flex items-center gap-1.5"><AlertCircle className="h-3 w-3 text-amber-600" /> Streetlight · Parkdale</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> Bench fixed · Carruthers</li>
            </ul>
          </div>

          <div className="border border-rule p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-civic-red" />
              <span className="kicker text-civic-red">{locale === "fr" ? "Héros local de la semaine" : "Local hero of the week"}</span>
            </div>
            <p className="font-display text-base leading-tight mt-1">
              {locale === "fr" ? "Marie-Claude — bénévole au jardin communautaire" : "Marie-Claude — community garden volunteer"}
            </p>
            <p className="text-xs font-serif italic text-muted-foreground mt-1">
              {locale === "fr" ? "10 ans à cultiver des légumes pour la banque alimentaire." : "10 years growing vegetables for the food bank."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
