import Image from "next/image";
import { ArrowRight, CheckCircle2, Download, FileText, Gauge, MapPinned, Ruler, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/public/SearchBar";

const highlights = [
  { label: "Plan area", value: "168 m2 / 1,808 sq ft", icon: Ruler },
  { label: "Recommended plot", value: "20x20 m / 66x66 ft", icon: MapPinned },
  { label: "Files available", value: "PDF, DWG, Revit, IFC", icon: FileText }
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white lg:min-h-[800px]">
      <Image
        src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=88"
        alt="Modern family house exterior"
        fill
        priority
        sizes="100vw"
        className="scale-[1.02] object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.99)_0%,rgba(2,6,23,0.92)_48%,rgba(2,6,23,0.28)_82%,rgba(2,6,23,0.58)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_15%,rgba(56,189,248,0.32),transparent_32%)]" />
      <div className="ambient-grid absolute inset-0 opacity-20" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />

      <div className="section-shell relative py-10 min-[380px]:py-12 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.72fr] lg:items-center">
          <div className="max-w-3xl">
            <Badge tone="blue" className="border border-white/15 bg-white/10 px-4 py-2 text-sky-100 ring-white/20 backdrop-blur-xl">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> Architecture intelligence for real projects
            </Badge>
            <h1 className="text-balance mt-5 text-4xl font-black leading-[1.02] tracking-[-0.055em] min-[380px]:text-5xl sm:mt-7 sm:text-7xl lg:text-[5.6rem]">
              Find the plan. <span className="hero-gradient-text">Understand the project.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 min-[380px]:text-base min-[380px]:leading-7 sm:mt-6 sm:text-xl sm:leading-8">
              Explore buildable homes with plot-fit analysis, transparent technical data and professional PDF, CAD and BIM files.
            </p>
            <div className="mt-6 max-w-2xl sm:mt-8">
              <SearchBar />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="/plans" className="w-full sm:w-auto">Browse House Plans <ArrowRight className="h-4 w-4" /></Button>
              <Button href="/free-house-plans" variant="outline" className="w-full border-white/30 bg-white/10 text-white hover:bg-white hover:text-slate-950 sm:w-auto"><Download className="h-4 w-4" /> Free Plan Previews</Button>
            </div>
            <div className="mobile-scroll mt-5 flex flex-nowrap gap-4 overflow-x-auto pb-1 text-xs font-semibold text-slate-200 sm:mt-6 sm:flex-wrap sm:gap-x-5 sm:gap-y-2 sm:overflow-visible sm:text-sm">
              {["Free technical previews", "Smart project scores", "Editable CAD, Revit and IFC"].map((item) => (
                <span key={item} className="flex shrink-0 items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> {item}</span>
              ))}
            </div>
          </div>

          <div className="hidden w-full max-w-md justify-self-end lg:block">
            <div className="relative rounded-[2.2rem] border border-white/15 bg-white/[0.08] p-3 shadow-[0_35px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem]">
                <Image src="https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=1000&q=85" alt="Interior of the featured modern house" fill sizes="384px" className="object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-950">Featured technical plan</span>
                <span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-black text-white backdrop-blur"><Gauge className="h-3.5 w-3.5 text-emerald-300" /> Smart score 91%</span>
              </div>
              <div className="p-3 pb-2 pt-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">MFHP-001 / 2026</p>
                <h2 className="mt-2 text-2xl font-black">Modern 3 Bedroom House</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">Open living, shaded terrace and a climate-ready layout for a 20x20 m plot.</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[["168 m²", "Area"], ["3 beds", "Program"], ["20×20 m", "Plot"]].map(([value, label]) => <div key={label} className="rounded-xl border border-white/10 bg-white/[0.06] p-2"><p className="text-xs font-black text-white">{value}</p><p className="mt-0.5 text-[9px] uppercase tracking-wide text-slate-400">{label}</p></div>)}
                </div>
                <Button href="/plans/modern-3-bedroom-house-plan-20x20m-plot" variant="outline" className="mt-4 w-full border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">Explore this plan <ArrowRight className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid overflow-hidden rounded-[1.3rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-2xl sm:mt-12 sm:grid-cols-3 sm:rounded-[1.6rem] lg:mt-20">
          {highlights.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex min-w-0 items-center gap-3 border-b border-white/15 px-4 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:px-6">
              <Icon className="h-5 w-5 shrink-0 text-sky-300" />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="safe-break mt-1 font-bold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
