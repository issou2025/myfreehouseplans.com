import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type HeroHighlight = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export function PublicPageHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
  highlights = []
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: ReactNode;
  highlights?: HeroHighlight[];
}) {
  return (
    <section className="page-hero">
      <div className="absolute inset-0 subtle-grid opacity-20" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="section-shell relative py-10 sm:py-14 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
          <div className="max-w-4xl">
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-sky-300">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/10"><Icon className="h-4 w-4" /></span>
              {eyebrow}
            </p>
            <h1 className="text-balance safe-break mt-5 text-4xl font-black leading-[1.03] tracking-[-0.05em] text-white sm:text-6xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">{description}</p>
            {actions ? <div className="mt-7 flex flex-col gap-2 min-[420px]:flex-row min-[420px]:flex-wrap">{actions}</div> : null}
          </div>
          {highlights.length ? (
            <div className="grid gap-2 rounded-[1.6rem] border border-white/10 bg-white/[0.07] p-3 shadow-2xl backdrop-blur-xl">
              {highlights.map(({ label, value, icon: HighlightIcon }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.06] p-3.5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-sky-300"><HighlightIcon className="h-4 w-4" /></span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
                    <p className="safe-break mt-1 text-sm font-bold text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
