import { BreakingNewsBar } from "@/components/BreakingNewsBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { ReactNode } from "react";

export function PageShell({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return (
    <div className="min-h-screen bg-paper text-foreground">
      <BreakingNewsBar />
      <Header />
      <main className={`mx-auto px-4 sm:px-6 lg:px-10 py-10 ${narrow ? "max-w-3xl" : "max-w-[1400px]"}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

export function PageHero({ kicker, title, dek }: { kicker: string; title: string; dek?: string }) {
  return (
    <header className="mb-10 max-w-4xl">
      <div className="kicker text-civic-red">{kicker}</div>
      <h1 className="font-display text-4xl md:text-6xl leading-[1.02] tracking-tight mt-2">{title}</h1>
      {dek && <p className="font-serif text-lg md:text-xl text-muted-foreground mt-4">{dek}</p>}
      <div className="h-px bg-rule mt-8" />
    </header>
  );
}
