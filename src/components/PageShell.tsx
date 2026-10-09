import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { KeeperLauncher } from "./Keeper";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">{children}</main>
      <SiteFooter />
      <KeeperLauncher />
    </div>
  );
}

export function PageIntro({ title, dek, children }: { title: string; dek?: string; children?: ReactNode }) {
  return (
    <div className="container-mw pt-10 pb-8 border-b border-line">
      <h1 className="masthead-serif text-[2.5rem] sm:text-[3.4rem] leading-[1.05] text-ink max-w-4xl">{title}</h1>
      {dek && <p className="dek text-[1.2rem] mt-3 max-w-3xl">{dek}</p>}
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

/** Front-page zone header: the paper's heavy rule, a serif section name, optional link. */
export function ZoneHead({ title, action, dark = false, sub }: { title: ReactNode; action?: ReactNode; dark?: boolean; sub?: ReactNode }) {
  return (
    <div className={`relative pt-3 mb-5 border-t-[3px] ${dark ? "border-white/80" : "border-night"}`}>
      <span className="absolute left-0 -top-[3px] h-[3px] w-14 bg-signal" aria-hidden="true" />
      <div className="flex items-end justify-between gap-3">
        <h2 className={`masthead-serif text-[1.75rem] sm:text-[2.05rem] leading-tight ${dark ? "text-white" : "text-ink"}`}>{title}</h2>
        {action}
      </div>
      {sub && <p className={`mt-1 text-[0.95rem] ${dark ? "text-white/65" : "text-muted-ink"}`}>{sub}</p>}
    </div>
  );
}
