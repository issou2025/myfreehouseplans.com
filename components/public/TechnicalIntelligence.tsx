import { ArrowRight, Boxes, BrainCircuit, FileCode2, Gauge, MapPinned, Ruler, Wind } from "lucide-react";
import { Button } from "@/components/ui/Button";

const metrics = [
  { label: "Plot compatibility", value: "Fit check", detail: "Dimensions, orientation and setbacks", icon: MapPinned, tone: "bg-sky-700" },
  { label: "Design review", value: "6 practical signals", detail: "Comfort, cost, climate and extension", icon: BrainCircuit, tone: "bg-slate-800" },
  { label: "Technical delivery", value: "PDF to BIM", detail: "DWG, Revit and IFC options", icon: FileCode2, tone: "bg-amber-600" },
  { label: "Climate readiness", value: "Passive design", detail: "Shade, airflow and hot-climate logic", icon: Wind, tone: "bg-emerald-700" }
];

export function TechnicalIntelligence() {
  return (
    <section className="section-shell py-12 sm:py-20">
      <div className="blueprint-panel relative overflow-hidden rounded-lg p-5 text-white shadow-[0_24px_80px_rgba(2,6,23,0.24)] sm:p-8 lg:p-10">
        <div className="relative grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-sky-300"><Gauge className="h-4 w-4" /> Project review</p>
            <h2 className="mt-4 text-balance text-3xl font-extrabold sm:text-5xl">Compare the parts that matter before you buy.</h2>
            <p className="mt-4 max-w-xl leading-7 text-slate-300">Each plan brings together layout details, land fit, construction notes and professional file options so the choice is easier to verify.</p>
            <div className="mt-6 flex flex-col gap-2 min-[420px]:flex-row">
              <Button href="/tools#plot-checker">Check my plot <ArrowRight className="h-4 w-4" /></Button>
              <Button href="/plans" variant="outline" className="border-white/15 bg-white/10 text-white hover:bg-white hover:text-slate-950">Browse plans</Button>
            </div>
          </div>
          <div className="grid gap-3 min-[520px]:grid-cols-2">
            {metrics.map(({ label, value, detail, icon: Icon, tone }) => (
              <div key={label} className="group rounded-lg border border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl transition hover:bg-white/[0.11]">
                <div className="flex items-start justify-between gap-3">
                  <span className={`grid h-11 w-11 place-items-center rounded-md ${tone} text-white shadow-lg`}><Icon className="h-5 w-5" /></span>
                  <Ruler className="h-4 w-4 text-white/25" />
                </div>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                <p className="mt-1 text-lg font-extrabold text-white">{value}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/10 pt-5 text-xs font-bold text-slate-400">
          <span className="flex items-center gap-2"><Boxes className="h-4 w-4 text-sky-300" /> Residential design marketplace</span>
          <span>Metric + imperial units</span>
          <span>Professional modification support</span>
        </div>
      </div>
    </section>
  );
}
