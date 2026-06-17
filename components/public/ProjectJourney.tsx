import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardCheck, FileStack, MapPinned, SearchCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type JourneyStage = "discover" | "check" | "choose" | "prepare";

const stages: Array<{ id: JourneyStage; label: string; copy: string; href: string; icon: LucideIcon }> = [
  { id: "discover", label: "Find a plan", copy: "Browse homes that fit your needs.", href: "/plans", icon: SearchCheck },
  { id: "check", label: "Check your land", copy: "Make sure the plan fits your plot.", href: "/tools#plot-checker", icon: MapPinned },
  { id: "choose", label: "Choose your files", copy: "Pick free, PDF or editable files.", href: "/premium-house-plans", icon: FileStack },
  { id: "prepare", label: "Get ready to build", copy: "Review the plan with a local professional.", href: "/before-you-build", icon: ClipboardCheck }
];

export function ProjectJourney({ current = "discover" }: { current?: JourneyStage }) {
  return (
    <section className="section-shell relative z-10 -mt-5 sm:-mt-7">
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-[0_14px_44px_rgba(15,23,42,0.1)]">
        <div className="mb-3 flex items-center justify-between gap-3 px-2 pt-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Your project path</p>
          <Link href="/about" className="hidden items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900 sm:flex">How it works <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="grid gap-2 md:grid-cols-4">
          {stages.map(({ id, label, copy, href, icon: Icon }, index) => {
            const active = id === current;
            return (
              <Link key={id} href={href} className={`group flex min-w-0 items-center gap-3 rounded-md border p-3 transition duration-200 ${active ? "border-sky-200 bg-sky-50 shadow-sm" : "border-transparent bg-slate-50/80 hover:border-slate-200 hover:bg-white"}`}>
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-md ${active ? "bg-sky-700 text-white" : "bg-white text-slate-500 shadow-sm group-hover:text-sky-700"}`}>
                  {active ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Step {index + 1}</span>
                  <span className="block font-extrabold text-slate-950">{label}</span>
                  <span className="mt-0.5 hidden text-xs leading-5 text-slate-500 xl:block">{copy}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
