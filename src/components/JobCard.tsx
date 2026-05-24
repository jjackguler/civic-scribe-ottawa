import { type Job } from "@/lib/data";
import { Briefcase, MapPin } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

export function JobCard({ job }: { job: Job }) {
  const { locale } = useLocale();
  return (
    <article className={`p-5 border ${job.sponsored ? "border-highlight bg-highlight/5" : "border-rule bg-card"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="kicker text-muted-foreground">{job.company}</div>
          <h3 className="font-display text-lg leading-snug mt-1">{job.title}</h3>
        </div>
        {job.sponsored && <span className="text-[10px] uppercase tracking-wider font-bold text-ink bg-highlight px-2 py-1">{locale === "fr" ? "Commandité" : "Sponsored"}</span>}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{job.neighborhood}</span>
        <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.type}</span>
        <span className="font-semibold text-foreground">{job.salary}</span>
        <span className="border border-rule px-1 text-[10px] uppercase tracking-wider">{job.language}</span>
      </div>
    </article>
  );
}
