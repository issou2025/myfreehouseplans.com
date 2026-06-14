"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, MapPinned, RotateCcw, SearchCheck, Sparkles } from "lucide-react";
import { PlanCard } from "@/components/public/PlanCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { publishedPlans } from "@/lib/mockPlans";
import { calculateSmartScore } from "@/lib/planRanking";
import { feetToMeters, formatPlotDual } from "@/lib/unitFormat";
import type { Plan } from "@/types/plan";

type Unit = "m" | "ft";

function number(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value.trim() ? parsed : 0;
}

function hasGarage(plan: Plan) {
  return [plan.title, plan.description, ...(plan.features ?? []), ...(plan.specialFeatures ?? []), ...(plan.tags ?? [])].join(" ").toLowerCase().includes("garage");
}

export function HousePlanFinderMock() {
  const [bedrooms, setBedrooms] = useState("3");
  const [floors, setFloors] = useState("any");
  const [pack, setPack] = useState("any");
  const [garage, setGarage] = useState("any");
  const [plotWidth, setPlotWidth] = useState("20");
  const [plotDepth, setPlotDepth] = useState("20");
  const [unit, setUnit] = useState<Unit>("m");
  const [searched, setSearched] = useState(false);

  const ranked = useMemo(() => {
    const width = unit === "ft" ? feetToMeters(number(plotWidth)) : number(plotWidth);
    const depth = unit === "ft" ? feetToMeters(number(plotDepth)) : number(plotDepth);
    return publishedPlans.map((plan) => {
      const reasons: string[] = [];
      let score = calculateSmartScore(plan) * 0.25;
      if (bedrooms === "any" || String(plan.bedrooms) === bedrooms) { score += 25; reasons.push(`${plan.bedrooms} bedrooms`); }
      else score -= Math.abs(plan.bedrooms - number(bedrooms)) * 10;
      if (floors === "any" || String(plan.floors) === floors) { score += 10; if (floors !== "any") reasons.push(`${plan.floors} floor${plan.floors > 1 ? "s" : ""}`); }
      const packMatch = pack === "any" || (pack === "free" && plan.freePackEnabled) || (pack === "premium" && plan.premiumPackEnabled) || (pack === "cad" && plan.cadPackEnabled);
      if (packMatch) { score += 12; if (pack !== "any") reasons.push(`${pack.toUpperCase()} files`); }
      else score -= 15;
      const garageMatch = garage === "any" || (garage === "yes" && hasGarage(plan)) || (garage === "no" && !hasGarage(plan));
      if (garageMatch) { score += 8; if (garage !== "any") reasons.push(garage === "yes" ? "Garage" : "No garage"); }
      else score -= 8;
      const fits = width <= 0 || depth <= 0 || (plan.plotWidth <= width && plan.plotLength <= depth) || (plan.plotLength <= width && plan.plotWidth <= depth);
      if (fits) { score += 25; if (width > 0 && depth > 0) reasons.push("Fits your plot"); }
      else score -= 30;
      return { plan, score: Math.max(0, Math.min(100, Math.round(score))), reasons, fits };
    }).sort((a, b) => b.score - a.score);
  }, [bedrooms, floors, garage, pack, plotDepth, plotWidth, unit]);

  function reset() {
    setBedrooms("3");
    setFloors("any");
    setPack("any");
    setGarage("any");
    setPlotWidth(unit === "m" ? "20" : "66");
    setPlotDepth(unit === "m" ? "20" : "66");
    setSearched(false);
  }

  function changeUnit(next: Unit) {
    if (next === unit) return;
    const factor = next === "ft" ? 3.28084 : 1 / 3.28084;
    setPlotWidth(String(Math.round(number(plotWidth) * factor * 10) / 10));
    setPlotDepth(String(Math.round(number(plotDepth) * factor * 10) / 10));
    setUnit(next);
    setSearched(false);
  }

  return (
    <Card className="overflow-hidden p-4 sm:p-6" id="interactive-tools">
      <div className="-mx-4 -mt-4 mb-6 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4 sm:-mx-6 sm:-mt-6 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-sky-700 sm:text-sm"><SearchCheck className="h-4 w-4" /> Smart plan finder</p>
            <h2 className="safe-break mt-2 text-2xl font-black text-slate-950 sm:text-4xl">Find the strongest plans for your project</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Tell us what you need. Every published plan receives a match score based on rooms, plot fit, files and practical quality.</p>
          </div>
          <div className="flex shrink-0 rounded-xl border border-slate-200 bg-white p-1 text-sm font-bold">
            {(["m", "ft"] as Unit[]).map((item) => <button key={item} type="button" onClick={() => changeUnit(item)} className={`rounded-lg px-4 py-2 uppercase transition ${unit === item ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{item}</button>)}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-sm font-semibold text-slate-700">Bedrooms<Select className="mt-2" value={bedrooms} onChange={(event) => { setBedrooms(event.target.value); setSearched(false); }}><option value="any">Any bedrooms</option><option value="2">2 bedrooms</option><option value="3">3 bedrooms</option><option value="4">4 bedrooms</option><option value="5">5+ bedrooms</option></Select></label>
        <label className="text-sm font-semibold text-slate-700">Floors<Select className="mt-2" value={floors} onChange={(event) => { setFloors(event.target.value); setSearched(false); }}><option value="any">Any floors</option><option value="1">1 floor</option><option value="2">2 floors</option></Select></label>
        <label className="text-sm font-semibold text-slate-700">Required files<Select className="mt-2" value={pack} onChange={(event) => { setPack(event.target.value); setSearched(false); }}><option value="any">Any package</option><option value="free">Free PDF</option><option value="premium">Premium PDF</option><option value="cad">CAD/Revit</option></Select></label>
        <label className="text-sm font-semibold text-slate-700">Garage<Select className="mt-2" value={garage} onChange={(event) => { setGarage(event.target.value); setSearched(false); }}><option value="any">Any</option><option value="yes">Garage required</option><option value="no">No garage needed</option></Select></label>
        <label className="text-sm font-semibold text-slate-700">Plot width, {unit}<Input className="mt-2" inputMode="decimal" value={plotWidth} onChange={(event) => { setPlotWidth(event.target.value); setSearched(false); }} /></label>
        <label className="text-sm font-semibold text-slate-700">Plot depth, {unit}<Input className="mt-2" inputMode="decimal" value={plotDepth} onChange={(event) => { setPlotDepth(event.target.value); setSearched(false); }} /></label>
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500"><MapPinned className="h-4 w-4 text-sky-600" /> Your plot: {formatPlotDual(unit === "ft" ? feetToMeters(number(plotWidth)) : number(plotWidth), unit === "ft" ? feetToMeters(number(plotDepth)) : number(plotDepth), true)}</p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => setSearched(true)} className="w-full sm:w-auto"><Sparkles className="h-4 w-4" /> Find my best plans</Button>
        <Button onClick={reset} variant="outline" className="w-full sm:w-auto"><RotateCcw className="h-4 w-4" /> Reset</Button>
      </div>

      {searched ? <div className="mt-7 border-t border-slate-200 pt-7">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div><p className="text-sm font-bold uppercase tracking-wide text-sky-600">Ranked recommendations</p><h3 className="text-2xl font-black text-slate-950">Your best matches</h3></div>
          <p className="text-sm font-semibold text-slate-600">{ranked.filter((item) => item.score >= 60).length} strong match(es) found</p>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {ranked.slice(0, 6).map(({ plan, score, reasons, fits }, index) => <div key={plan.id} className="min-w-0">
            <div className={`mb-2 flex items-center justify-between gap-2 rounded-2xl border p-3 ${index === 0 ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
              <span className="flex items-center gap-2 font-black text-slate-950">{index === 0 ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : null}#{index + 1} match</span>
              <Badge tone={score >= 75 ? "green" : score >= 55 ? "blue" : "amber"}>{score}% match</Badge>
            </div>
            <PlanCard plan={plan} />
            <p className={`mt-2 rounded-xl p-3 text-xs font-semibold leading-5 ${fits ? "bg-sky-50 text-sky-800" : "bg-amber-50 text-amber-800"}`}>{reasons.slice(0, 4).join(" · ") || "Closest available alternative"}</p>
          </div>)}
        </div>
      </div> : null}
    </Card>
  );
}
