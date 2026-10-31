import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { KeeperLauncher } from "./Keeper";
import { MobileNav } from "./MobileApp";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col app-shell">
      <SiteHeader />
      <main id="main" className="flex-1">{children}</main>
      <SiteFooter />
      <MobileNav />
      {/* On phones the floating Keeper competed with the story; it lives in the menu there. */}
      <div className="hidden md:block"><KeeperLauncher /></div>
    </div>
  );
}

export function PageIntro({ title, dek, kicker, children }: { title: string; dek?: string; kicker?: string; children?: ReactNode }) {
  return (
    <div className="container-mw pt-8 sm:pt-10 pb-8 rule-under">
      {kicker && <p className="kicker mb-2">{kicker}</p>}
      <h1 className="hl text-[2.4rem] sm:text-[3.3rem] leading-[1.05] text-ink max-w-4xl">{title}</h1>
      {dek && <p className="font-serif text-[1.2rem] leading-relaxed text-ink/75 mt-3 max-w-3xl">{dek}</p>}
      {children}
    </div>
  );
}

export function SectionHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h2 className="hl text-[1.75rem] sm:text-[2rem] text-ink">{title}</h2>
        {sub && <p className="dek mt-1 max-w-2xl">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/** Zone header: a firm ink rule, a serif section name, an optional one-line explanation and link. */
export function ZoneHead({ title, action, dark = false, sub, id }: { title: ReactNode; action?: ReactNode; dark?: boolean; sub?: ReactNode; id?: string }) {
  return (
    <div className={`pt-3 mb-5 border-t-2 ${dark ? "border-white/80" : "border-ink"}`}>
      <div className="flex items-end justify-between gap-3">
        <h2 id={id} className={`hl text-[1.6rem] sm:text-[1.9rem] leading-tight ${dark ? "text-white" : "text-ink"}`}>{title}</h2>
        {action}
      </div>
      {sub && <p className={`mt-1 text-[0.93rem] max-w-3xl ${dark ? "text-white/70" : "text-muted-ink"}`}>{sub}</p>}
    </div>
  );
}
