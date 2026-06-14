import type { Plan } from "@/types/plan";
import { Card } from "@/components/ui/Card";

const labels: Array<[keyof Plan["scores"], string]> = [
  ["functionality", "Functionality Score"],
  ["comfort", "Comfort Score"],
  ["constructionSimplicity", "Construction Simplicity"],
  ["costEfficiency", "Cost Efficiency"],
  ["hotClimateAdaptation", "Hot Climate Adaptation"],
  ["futureExtension", "Future Extension"],
  ["naturalVentilation", "Natural Ventilation"],
  ["familySuitability", "Family Suitability"]
];

export function SmartPlanAnalysis({ plan }: { plan: Plan }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="overflow-hidden p-4 sm:p-6">
        <div className="-mx-4 -mt-4 mb-4 bg-gradient-to-br from-slate-950 to-sky-700 p-4 text-white sm:-mx-6 sm:-mt-6 sm:mb-6 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-sky-200 sm:text-sm">AI-style editorial scoring</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Smart Plan Analysis</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {labels.map(([key, label]) => (
            <div key={key} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex justify-between text-sm font-semibold text-slate-700"><span>{label}</span><span>{plan.scores[key]}%</span></div>
              <div className="mt-3 h-2.5 rounded-full bg-slate-200"><div className="h-2.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600" style={{ width: `${plan.scores[key] ?? 75}%` }} /></div>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-4">
        <Card className="border-emerald-100 bg-emerald-50/70 p-4 sm:p-6">
          <p className="font-bold text-slate-950">Best for</p>
          <ul className="mt-3 grid gap-2 text-sm text-slate-700">{plan.bestFor.map((item) => <li key={item}>- {item}</li>)}</ul>
        </Card>
        <Card className="border-amber-100 bg-amber-50/70 p-4 sm:p-6">
          <p className="font-bold text-slate-950">Be careful</p>
          <ul className="mt-3 grid gap-2 text-sm text-slate-700">{plan.beCareful.map((item) => <li key={item}>- {item}</li>)}</ul>
        </Card>
      </div>
    </div>
  );
}
