import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageIntro({ title, dek, children }: { title: string; dek?: string; children?: ReactNode }) {
  return (
    <div className="container-mw pt-10 pb-8 border-b border-line">
      <h1 className="hl text-[2.4rem] sm:text-[3.2rem] text-ink max-w-4xl">{title}</h1>
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
