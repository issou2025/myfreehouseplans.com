import Link from "next/link";
import { ArrowRight, BookOpen, Building2, Mail, MapPinned, Ruler, Scale, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

const groups = [
  { title: "House Plans", icon: Building2, links: [["All House Plans", "/plans"], ["Free House Plans", "/free-house-plans"], ["Premium Packs", "/premium-house-plans"], ["Modern House Plans", "/plans?q=modern"], ["3 Bedroom Plans", "/plans?q=3%20bedrooms"], ["CAD/Revit Plans", "/cad-revit-house-plans"]] },
  { title: "Tools", icon: Wrench, links: [["Plan Finder", "/tools#plan-finder"], ["Plot Checker", "/tools#plot-checker"], ["Area Calculator", "/tools#calculators"], ["Cost Estimator", "/tools#calculators"], ["Floor Plan Analyzer", "/tools#calculators"]] },
  { title: "Resources", icon: BookOpen, links: [["Blog", "/blog"], ["How to Choose a Plan", "/blog/how-to-choose-the-right-house-plan"], ["PDF vs DWG vs Revit", "/blog/pdf-vs-dwg-vs-revit-which-one-do-you-need"], ["Building in Phases", "/blog/how-to-build-a-house-in-phases"], ["Before You Build", "/before-you-build"]] },
  { title: "Company", icon: Mail, links: [["About", "/about"], ["Contact", "/contact"], ["Custom Plan Request", "/contact"], ["FAQ", "/blog"]] },
  { title: "Legal", icon: Scale, links: [["Terms", "/terms"], ["Privacy Policy", "/privacy"], ["License", "/license"], ["Before You Build", "/before-you-build"], ["Refund Policy", "/refund-policy"]] }
];

function GroupTitle({ title, icon: Icon }: { title: string; icon: LucideIcon }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-sky-300"><Icon className="h-4 w-4" /></span>
      <p className="font-bold text-white">{title}</p>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 subtle-grid opacity-20" />
      <div className="section-shell relative pt-10">
        <div className="grid gap-5 rounded-[1.7rem] border border-white/10 bg-gradient-to-r from-sky-500/20 via-white/[0.07] to-violet-500/15 p-5 shadow-2xl backdrop-blur-xl sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-sky-600"><MapPinned className="h-5 w-5" /></span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-300">Not sure where to begin?</p>
              <h2 className="mt-2 text-2xl font-black">Start with your land, rooms and budget.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">The plan finder narrows the catalog, then the plot checker tests the strongest matches.</p>
            </div>
          </div>
          <div className="grid gap-2 min-[420px]:grid-cols-2 lg:flex">
            <Button href="/tools#plan-finder">Find My Plan <ArrowRight className="h-4 w-4" /></Button>
            <Button href="/contact" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">Ask for Help</Button>
          </div>
        </div>
      </div>
      <div className="section-shell relative grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-950 shadow-xl shadow-sky-500/10"><Sparkles className="h-5 w-5 text-sky-500" /></span>
            <p className="safe-break text-xl font-black min-[380px]:text-2xl">myfreehouseplans<span className="text-sky-400">.com</span></p>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
            Explore free house plan previews, premium PDF packs, and editable CAD/Revit files with clear links to tools, guides, and custom requests.
          </p>
          <div className="mt-6 flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300 backdrop-blur">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <span>Always review and adapt plans with a local architect, engineer or qualified professional before construction.</span>
          </div>
          <Link href="/before-you-build" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-sky-300 hover:text-white">
            <Ruler className="h-4 w-4" /> Read before you build
          </Link>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <GroupTitle title={group.title} icon={group.icon} />
            <div className="mt-4 grid gap-3 text-sm text-slate-300">
              {group.links.map(([label, href]) => <Link key={label} href={href} className="transition hover:text-sky-300">{label}</Link>)}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">Copyright 2026 myfreehouseplans.com. Professional house plan marketplace.</div>
    </footer>
  );
}
