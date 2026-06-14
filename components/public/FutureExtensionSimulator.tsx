"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowUp, BedDouble, Calculator, CheckCircle2, ChevronDown, CircleDollarSign, Home, Info, ShieldCheck, Sparkles, Warehouse } from "lucide-react";
import type { Plan } from "@/types/plan";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { feetToMeters, formatAreaDual, formatLengthDual, formatPlotDual, metersToFeet, squareFeetToSquareMeters, squareMetersToSquareFeet } from "@/lib/unitFormat";

type ExtensionType = "bedroom" | "garage" | "terrace" | "floor";
type ExtensionSide = "auto" | "front" | "rear" | "left" | "right" | "up";
type Quality = "economy" | "standard" | "premium";
type GroundCondition = "good" | "average" | "difficult";
type Unit = "m" | "ft";

const extensionOptions = {
  bedroom: { label: "Bedroom suite", defaultArea: 20, defaultRate: 1250, icon: BedDouble },
  garage: { label: "Garage", defaultArea: 24, defaultRate: 750, icon: Warehouse },
  terrace: { label: "Covered terrace", defaultArea: 18, defaultRate: 500, icon: Home },
  floor: { label: "Additional floor", defaultArea: 80, defaultRate: 1650, icon: ArrowUp }
} as const;

const qualityFactors: Record<Quality, number> = { economy: 0.82, standard: 1, premium: 1.35 };
const groundFactors: Record<GroundCondition, number> = { good: 1, average: 1.1, difficult: 1.25 };

function round(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function positive(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : fallback;
}

function formatUSD(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function FutureExtensionSimulator({ plan }: { plan: Plan }) {
  const estimatedFootprint = plan.builtArea / Math.max(1, plan.floors);
  const footprintRatio = plan.plotWidth / Math.max(plan.plotLength, 1);
  const estimatedHouseWidth = round(Math.sqrt(estimatedFootprint * footprintRatio), 1);
  const estimatedHouseDepth = round(estimatedFootprint / estimatedHouseWidth, 1);
  const initialSideClearance = round(Math.max(0, plan.plotWidth - estimatedHouseWidth) / 2, 1);
  const initialDepthClearance = round(Math.max(0, plan.plotLength - estimatedHouseDepth) / 2, 1);

  const [type, setType] = useState<ExtensionType>("bedroom");
  const [side, setSide] = useState<ExtensionSide>("auto");
  const [area, setArea] = useState(String(extensionOptions.bedroom.defaultArea));
  const [budget, setBudget] = useState("35000");
  const [houseWidth, setHouseWidth] = useState(String(estimatedHouseWidth));
  const [houseDepth, setHouseDepth] = useState(String(estimatedHouseDepth));
  const [frontClearance, setFrontClearance] = useState(String(initialDepthClearance));
  const [rearClearance, setRearClearance] = useState(String(initialDepthClearance));
  const [leftClearance, setLeftClearance] = useState(String(initialSideClearance));
  const [rightClearance, setRightClearance] = useState(String(initialSideClearance));
  const [rate, setRate] = useState(String(extensionOptions.bedroom.defaultRate));
  const [quality, setQuality] = useState<Quality>("standard");
  const [ground, setGround] = useState<GroundCondition>("average");
  const [contingency, setContingency] = useState("12");
  const [professionalFees, setProfessionalFees] = useState("10");
  const [analyzed, setAnalyzed] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [unit, setUnit] = useState<Unit>("m");

  const showLength = (value: string) => unit === "ft" ? String(round(metersToFeet(positive(value)), 1)) : value;
  const showArea = (value: string) => unit === "ft" ? String(round(squareMetersToSquareFeet(positive(value)), 1)) : value;
  const showRate = (value: string) => unit === "ft" ? String(round(positive(value) / 10.7639, 2)) : value;
  const updateLength = (setter: (value: string) => void, value: string) => setter(value.trim() === "" ? "" : String(round(unit === "ft" ? feetToMeters(positive(value)) : positive(value), 2)));
  const updateArea = (setter: (value: string) => void, value: string) => setter(value.trim() === "" ? "" : String(round(unit === "ft" ? squareFeetToSquareMeters(positive(value)) : positive(value), 2)));
  const updateRate = (value: string) => setRate(value.trim() === "" ? "" : String(round(unit === "ft" ? positive(value) * 10.7639 : positive(value), 2)));

  const result = useMemo(() => {
    const requestedArea = Math.max(1, positive(area, 1));
    const width = Math.max(1, positive(houseWidth, estimatedHouseWidth));
    const depth = Math.max(1, positive(houseDepth, estimatedHouseDepth));
    const clearances = {
      front: positive(frontClearance),
      rear: positive(rearClearance),
      left: positive(leftClearance),
      right: positive(rightClearance)
    };
    const option = extensionOptions[type];
    const preferredDepth = type === "garage" ? 6 : type === "terrace" ? 3.5 : Math.max(3.2, Math.sqrt(requestedArea));
    const requiredWidth = requestedArea / preferredDepth;
    const capacities: Record<Exclude<ExtensionSide, "auto">, number> = {
      front: clearances.front * width,
      rear: clearances.rear * width,
      left: clearances.left * depth,
      right: clearances.right * depth,
      up: width * depth
    };
    const dimensionsFit: Record<Exclude<ExtensionSide, "auto">, boolean> = {
      front: clearances.front >= preferredDepth && width >= requiredWidth,
      rear: clearances.rear >= preferredDepth && width >= requiredWidth,
      left: clearances.left >= requiredWidth && depth >= preferredDepth,
      right: clearances.right >= requiredWidth && depth >= preferredDepth,
      up: capacities.up >= requestedArea
    };
    const allowedSides: Array<Exclude<ExtensionSide, "auto">> = type === "floor" ? ["up"] : type === "garage" ? ["front", "left", "right", "rear"] : ["rear", "left", "right", "front"];
    const rankedSides = allowedSides.map((candidate) => ({
      side: candidate,
      capacity: capacities[candidate],
      fit: capacities[candidate] >= requestedArea && dimensionsFit[candidate],
      clearance: candidate === "front" ? clearances.front : candidate === "rear" ? clearances.rear : candidate === "left" ? clearances.left : candidate === "right" ? clearances.right : 0
    })).sort((a, b) => Number(b.fit) - Number(a.fit) || b.capacity - a.capacity);
    const selectedSide = side === "auto" || !allowedSides.includes(side as Exclude<ExtensionSide, "auto">) ? rankedSides[0].side : side as Exclude<ExtensionSide, "auto">;
    const selectedCandidate = rankedSides.find((candidate) => candidate.side === selectedSide) ?? rankedSides[0];

    const structureText = plan.structureType.toLowerCase();
    const foundationText = plan.foundationType.toLowerCase();
    const roofText = plan.roofType.toLowerCase();
    const concreteFrame = structureText.includes("concrete frame") || structureText.includes("reinforced concrete");
    const loadBearing = structureText.includes("load-bearing");
    const strongFoundation = foundationText.includes("raft") || foundationText.includes("reinforced");
    const flatRoof = roofText.includes("flat");
    const verticalStructureScore = (concreteFrame ? 42 : loadBearing ? 12 : 22) + (strongFoundation ? 35 : 12) + (flatRoof ? 18 : 6);
    const structuralFit = type !== "floor" || verticalStructureScore >= 70;

    const baseConstruction = requestedArea * positive(rate, option.defaultRate) * qualityFactors[quality] * groundFactors[ground];
    const connectionComplexity = baseConstruction * (type === "floor" ? 0.18 : type === "bedroom" ? 0.1 : type === "garage" ? 0.06 : 0.04);
    const professionalCost = (baseConstruction + connectionComplexity) * positive(professionalFees) / 100;
    const subtotal = baseConstruction + connectionComplexity + professionalCost;
    const contingencyCost = subtotal * positive(contingency) / 100;
    const totalCost = subtotal + contingencyCost;
    const lowEstimate = totalCost * 0.9;
    const highEstimate = totalCost * 1.18;
    const budgetFit = positive(budget) >= totalCost;
    const locationFit = selectedCandidate.fit;
    const baseScore = plan.scores.futureExtension ?? 70;
    const feasibilityScore = Math.max(0, Math.min(100, Math.round(baseScore * 0.3 + (locationFit ? 35 : 5) + (structuralFit ? 20 : 3) + (budgetFit ? 15 : 5))));
    const feasible = locationFit && structuralFit;

    const constraints: string[] = [];
    const actions: string[] = [];
    if (!selectedCandidate.fit) constraints.push(`The ${selectedSide} location does not provide the required ${formatLengthDual(requiredWidth, true)} x ${formatLengthDual(preferredDepth, true)} clear rectangle.`);
    if (type === "floor" && !structuralFit) constraints.push("The recorded structure, foundation and roof do not indicate reliable readiness for another floor.");
    if (!budgetFit) constraints.push(`The entered budget is approximately ${formatUSD(totalCost - positive(budget))} below the central estimate.`);
    if (selectedSide === "front") constraints.push("A front extension may affect the main facade, road access and planning setbacks.");
    if (type === "garage") constraints.push("Confirm driveway alignment, turning radius and road access.");
    if (ground === "difficult") constraints.push("Difficult ground conditions can require deeper foundations, retaining walls or drainage work.");
    if (type === "floor") actions.push("Obtain structural calculations for foundations, columns, beams and slab capacity.");
    if (type === "bedroom") actions.push("Coordinate circulation, windows, ventilation and nearby plumbing connections.");
    if (type === "terrace") actions.push("Coordinate roof drainage, waterproofing and connection to the existing structure.");
    actions.push("Verify setbacks, easements, plot coverage, utilities and permits with local authorities.");
    actions.push("Update architectural, structural, electrical and plumbing drawings before construction.");

    return {
      option,
      requestedArea,
      width,
      depth,
      preferredDepth,
      requiredWidth,
      selectedSide,
      selectedCandidate,
      rankedSides,
      verticalStructureScore,
      structuralFit,
      locationFit,
      baseConstruction,
      connectionComplexity,
      professionalCost,
      contingencyCost,
      totalCost,
      lowEstimate,
      highEstimate,
      budgetFit,
      feasibilityScore,
      feasible,
      constraints,
      actions
    };
  }, [area, budget, contingency, estimatedHouseDepth, estimatedHouseWidth, frontClearance, ground, houseDepth, houseWidth, leftClearance, plan, professionalFees, quality, rate, rearClearance, rightClearance, side, type]);

  function selectType(nextType: ExtensionType) {
    setType(nextType);
    setArea(String(extensionOptions[nextType].defaultArea));
    setRate(String(extensionOptions[nextType].defaultRate));
    setSide(nextType === "floor" ? "up" : "auto");
    setAnalyzed(false);
  }

  const extensionStyle = result.selectedSide === "up" ? { left: "25%", top: "15%", width: "50%", height: "25%" } : result.selectedSide === "front" ? { left: "28%", top: "4%", width: "44%", height: "20%" } : result.selectedSide === "rear" ? { left: "28%", bottom: "4%", width: "44%", height: "20%" } : result.selectedSide === "left" ? { left: "4%", top: "30%", width: "22%", height: "42%" } : { right: "4%", top: "30%", width: "22%", height: "42%" };

  return (
    <Card className="overflow-hidden p-4 sm:p-6" id="future-extension">
      <div className="-mx-4 -mt-4 mb-6 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-4 sm:-mx-6 sm:-mt-6 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-violet-600 shadow-sm"><Sparkles className="h-5 w-5" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-violet-700 sm:text-sm">Future extension planner</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">Where can this home grow later?</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Choose what you may add, set a size and budget, then see the best location and an estimated USD cost range.</p>
          </div>
        </div>
          <div className="flex shrink-0 rounded-xl border border-slate-200 bg-white p-1 text-sm font-bold">
            {(["m", "ft"] as Unit[]).map((item) => <button key={item} type="button" onClick={() => setUnit(item)} className={`rounded-lg px-4 py-2 uppercase transition ${unit === item ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{item}</button>)}
          </div>
        </div>
      </div>

      <div className="grid gap-7 xl:grid-cols-[1fr_0.92fr]">
        <div>
          <div className="mb-5 grid gap-2 sm:grid-cols-3">
            {["Choose an extension", "Set size and budget", "Review feasibility"].map((step, index) => <div key={step} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-violet-600 text-xs text-white">{index + 1}</span>{step}</div>)}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.entries(extensionOptions) as Array<[ExtensionType, typeof extensionOptions[ExtensionType]]>).map(([value, option]) => {
              const Icon = option.icon;
              return <button key={value} type="button" onClick={() => selectType(value)} className={`focus-ring rounded-2xl border p-4 text-left transition ${type === value ? "border-violet-400 bg-violet-50 shadow-lg shadow-violet-500/10" : "border-slate-200 bg-white hover:border-violet-200"}`}><Icon className={`h-5 w-5 ${type === value ? "text-violet-600" : "text-slate-400"}`} /><p className="mt-3 font-black text-slate-950">{option.label}</p><p className="mt-1 text-xs text-slate-500">Typical start: {formatAreaDual(option.defaultArea, true)}</p></button>;
            })}
          </div>

          <div className="mt-5 grid gap-4 rounded-3xl border border-violet-100 bg-violet-50/40 p-4 sm:grid-cols-3">
            <label className="text-sm font-semibold text-slate-700">Desired area, {unit === "m" ? "m2" : "sq ft"}<Input className="mt-2 bg-white" inputMode="decimal" value={showArea(area)} onChange={(event) => { updateArea(setArea, event.target.value); setAnalyzed(false); }} /><span className="mt-2 flex flex-wrap gap-1.5">{[0.65, 1, 1.5].map((factor) => { const size = Math.round(extensionOptions[type].defaultArea * factor); return <button key={factor} type="button" onClick={() => { setArea(String(size)); setAnalyzed(false); }} className="rounded-full border border-violet-200 bg-white px-2.5 py-1 text-[10px] font-bold text-violet-700">{formatAreaDual(size, true)}</button>; })}</span></label>
            <label className="text-sm font-semibold text-slate-700">Preferred location<Select className="mt-2" value={side} onChange={(event) => { setSide(event.target.value as ExtensionSide); setAnalyzed(false); }}><option value="auto">Recommend best location</option>{type === "floor" ? <option value="up">Above existing house</option> : <><option value="rear">Rear</option><option value="left">Left side</option><option value="right">Right side</option><option value="front">Front</option></>}</Select></label>
            <label className="text-sm font-semibold text-slate-700">Available budget, USD<Input className="mt-2 bg-white" inputMode="numeric" value={budget} onChange={(event) => { setBudget(event.target.value); setAnalyzed(false); }} /><span className="mt-2 block text-[11px] font-medium text-slate-500">Current estimate: {formatUSD(result.lowEstimate)} - {formatUSD(result.highEstimate)}</span></label>
          </div>

          <button type="button" onClick={() => setAdvancedOpen((current) => !current)} className="focus-ring mt-4 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left"><span><strong className="block text-sm text-slate-950">Improve accuracy with professional assumptions</strong><span className="mt-1 block text-xs text-slate-500">Optional: exact clearances, local rates, finish quality, soil and allowances.</span></span><ChevronDown className={`h-5 w-5 shrink-0 text-slate-500 transition ${advancedOpen ? "rotate-180" : ""}`} /></button>

          {advancedOpen ? <div className="mt-4 rounded-3xl border border-sky-100 bg-sky-50/50 p-4">
            <div className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" /><p className="text-xs leading-5 text-slate-600">Replace estimated dimensions with surveyed clearances and use a local USD per area rate for a more reliable pre-check.</p></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[["Existing house width", houseWidth, setHouseWidth], ["Existing house depth", houseDepth, setHouseDepth], ["Front free clearance", frontClearance, setFrontClearance], ["Rear free clearance", rearClearance, setRearClearance], ["Left free clearance", leftClearance, setLeftClearance], ["Right free clearance", rightClearance, setRightClearance]].map(([label, value, setter]) => <label key={String(label)} className="text-xs font-bold text-slate-700">{String(label)}, {unit}<Input className="mt-1 bg-white" inputMode="decimal" value={showLength(value as string)} onChange={(event) => { updateLength(setter as (value: string) => void, event.target.value); setAnalyzed(false); }} /><span className="mt-1 block font-medium text-slate-500">{formatLengthDual(positive(value as string), true)}</span></label>)}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm font-semibold text-slate-700">Local base rate, USD/{unit === "m" ? "m2" : "sq ft"}<Input className="mt-2 bg-white" inputMode="numeric" value={showRate(rate)} onChange={(event) => { updateRate(event.target.value); setAnalyzed(false); }} /></label>
              <label className="text-sm font-semibold text-slate-700">Finish quality<Select className="mt-2 bg-white" value={quality} onChange={(event) => { setQuality(event.target.value as Quality); setAnalyzed(false); }}><option value="economy">Economy</option><option value="standard">Standard</option><option value="premium">Premium</option></Select></label>
              <label className="text-sm font-semibold text-slate-700">Ground conditions<Select className="mt-2 bg-white" value={ground} onChange={(event) => { setGround(event.target.value as GroundCondition); setAnalyzed(false); }}><option value="good">Good / known soil</option><option value="average">Average / unknown soil</option><option value="difficult">Difficult / sloped / weak soil</option></Select></label>
              <label className="text-sm font-semibold text-slate-700">Design + permit allowance, %<Input className="mt-2 bg-white" inputMode="decimal" value={professionalFees} onChange={(event) => { setProfessionalFees(event.target.value); setAnalyzed(false); }} /></label>
              <label className="text-sm font-semibold text-slate-700">Contingency, %<Input className="mt-2 bg-white" inputMode="decimal" value={contingency} onChange={(event) => { setContingency(event.target.value); setAnalyzed(false); }} /></label>
            </div>
          </div> : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button className="w-full sm:w-auto" onClick={() => setAnalyzed(true)}><Calculator className="h-4 w-4" /> Check this extension</Button>
            <p className="text-xs leading-5 text-slate-500">USD rates are editable because construction pricing varies significantly by country, city, specification and contractor.</p>
          </div>

          {analyzed ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className={`rounded-3xl border p-5 ${result.feasible ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div><p className={`flex items-center gap-2 text-xl font-black ${result.feasible ? "text-emerald-800" : "text-amber-800"}`}>{result.feasible ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}{result.feasible ? "Promising pre-feasibility" : "Professional redesign required"}</p><p className="mt-2 text-sm leading-6 text-slate-700">Selected location: <strong className="capitalize">{result.selectedSide}</strong>.</p></div>
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-[6px] border-white bg-slate-950 text-center text-white shadow sm:h-20 sm:w-20 sm:border-8"><span><strong className="block text-xl sm:text-2xl">{result.feasibilityScore}</strong><span className="text-[8px] uppercase sm:text-[9px]">Score</span></span></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <p className="rounded-xl bg-white/75 p-3"><span className="block text-slate-500">Required rectangle</span><strong>{formatLengthDual(result.requiredWidth, true)} x {formatLengthDual(result.preferredDepth, true)}</strong></p>
                  <p className="rounded-xl bg-white/75 p-3"><span className="block text-slate-500">Location capacity</span><strong>{formatAreaDual(result.selectedCandidate.capacity, true)}</strong></p>
                  <p className="rounded-xl bg-white/75 p-3"><span className="block text-slate-500">Structural signal</span><strong>{type === "floor" ? `${result.verticalStructureScore}/95` : "Review connection"}</strong></p>
                  <p className="rounded-xl bg-white/75 p-3"><span className="block text-slate-500">Central estimate</span><strong>{formatUSD(result.totalCost)}</strong></p>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4"><p className="font-black text-slate-950">Constraints to review</p><ul className="mt-3 grid gap-2 text-sm leading-5 text-slate-700">{result.constraints.length ? result.constraints.map((item) => <li key={item}>- {item}</li>) : <li>- No major preliminary constraint detected.</li>}</ul></div>
                <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4"><p className="font-black text-slate-950">Required next steps</p><ul className="mt-3 grid gap-2 text-sm leading-5 text-slate-700">{result.actions.map((item) => <li key={item}>- {item}</li>)}</ul></div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid content-start gap-4">
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-emerald-100 shadow-inner sm:min-h-[410px] sm:rounded-3xl">
            <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[10px] font-bold text-slate-700 shadow sm:text-xs">Recommended plot: {formatPlotDual(plan.plotWidth, plan.plotLength, true)}</span>
            <div className="absolute inset-4 top-14 border-2 border-dashed border-emerald-700/45 bg-white/25 sm:inset-8 sm:top-14">
              <div className="absolute left-[27%] top-[27%] grid h-[48%] w-[48%] place-items-center rounded-xl border-2 border-slate-700 bg-slate-200 text-center shadow-xl"><div><Home className="mx-auto h-6 w-6 text-slate-600" /><p className="mt-2 text-xs font-black text-slate-950">Existing house</p><p className="mt-1 text-[9px] text-slate-600">{formatLengthDual(result.width, true)} x {formatLengthDual(result.depth, true)}</p></div></div>
              <div className={`absolute grid place-items-center rounded-xl border-2 p-2 text-center shadow-lg transition-all duration-500 ${result.feasible ? "border-violet-600 bg-violet-200/90 text-violet-950" : "border-amber-600 bg-amber-200/90 text-amber-950"}`} style={extensionStyle}><div><result.option.icon className="mx-auto h-5 w-5" /><p className="mt-1 text-[10px] font-black uppercase">Future {result.option.label}</p><p className="text-[8px]">{formatAreaDual(result.requestedArea, true)}</p></div></div>
            </div>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-3"><p className="font-black text-slate-950">Location ranking</p><Badge tone="blue">Extension score {plan.scores.futureExtension}%</Badge></div>
            <div className="mt-4 grid gap-2">{result.rankedSides.map((candidate, index) => <div key={candidate.side} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm"><span className="font-semibold capitalize text-slate-700">{index + 1}. {candidate.side}</span><span className={`text-right text-xs font-black sm:text-sm ${candidate.fit ? "text-emerald-700" : "text-amber-700"}`}>{formatAreaDual(candidate.capacity, true)} | {candidate.fit ? "Fits" : "Tight"}</span></div>)}</div>
          </Card>

          <Card className="border-violet-100 bg-violet-50/60 p-4">
            <p className="flex items-center gap-2 font-black text-slate-950"><CircleDollarSign className="h-5 w-5 text-violet-600" /> Detailed USD cost model</p>
            <p className="mt-2 text-2xl font-black text-violet-800">{formatUSD(result.lowEstimate)} - {formatUSD(result.highEstimate)}</p>
            <div className="mt-4 grid gap-2 text-xs text-slate-700">
              <p className="flex justify-between rounded-lg bg-white/70 p-2"><span>Base construction</span><strong>{formatUSD(result.baseConstruction)}</strong></p>
              <p className="flex justify-between rounded-lg bg-white/70 p-2"><span>Existing-building connection</span><strong>{formatUSD(result.connectionComplexity)}</strong></p>
              <p className="flex justify-between rounded-lg bg-white/70 p-2"><span>Design and permits allowance</span><strong>{formatUSD(result.professionalCost)}</strong></p>
              <p className="flex justify-between rounded-lg bg-white/70 p-2"><span>Contingency</span><strong>{formatUSD(result.contingencyCost)}</strong></p>
              <p className="flex justify-between rounded-lg bg-slate-950 p-2 text-white"><span>Central estimate</span><strong>{formatUSD(result.totalCost)}</strong></p>
            </div>
          </Card>
        </div>
      </div>

      <p className="mt-6 flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" /><span><strong>Important:</strong> This simulator provides geometric, structural-signal and budget pre-feasibility only. A local architect, structural engineer, quantity surveyor and official site survey are required before design approval or construction.</span></p>
    </Card>
  );
}
