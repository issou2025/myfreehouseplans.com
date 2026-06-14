"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Compass, Gauge, Info, Route, Ruler, ShieldCheck, Sun, Warehouse, XCircle } from "lucide-react";
import type { Plan } from "@/types/plan";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type Unit = "m" | "ft";
type Orientation = "auto" | "normal" | "rotated";
type RoadSide = "north" | "south" | "east" | "west";
type GaragePosition = "left" | "right" | "front" | "none";
type Slope = "flat" | "gentle" | "moderate" | "steep";

type PlotValues = {
  plotWidth: string;
  plotDepth: string;
  buildingWidth: string;
  buildingDepth: string;
  frontSetback: string;
  rearSetback: string;
  leftSetback: string;
  rightSetback: string;
  frontClearance: string;
  rearClearance: string;
  leftClearance: string;
  rightClearance: string;
  roadReserve: string;
  roadWidth: string;
  drivewayWidth: string;
  gateWidth: string;
  roadSide: RoadSide;
  garagePosition: GaragePosition;
  slope: Slope;
  orientation: Orientation;
};

const FEET_PER_METER = 3.28084;

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function parseDimension(value: string, unit: Unit) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, unit === "ft" ? parsed / FEET_PER_METER : parsed);
}

function displayDimension(meters: number, unit: Unit, suffix = true) {
  const value = unit === "ft" ? meters * FEET_PER_METER : meters;
  return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}${suffix ? ` ${unit}` : ""}`;
}

function convertDisplayedValue(value: string, from: Unit, to: Unit) {
  if (from === to || value.trim() === "") return value;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return value;
  return String(round(from === "m" ? parsed * FEET_PER_METER : parsed / FEET_PER_METER));
}

function clampPercent(value: number) {
  return `${Math.min(92, Math.max(5, value))}%`;
}

export function PlotCheckerMock({ plan }: { plan?: Pick<Plan, "title" | "plotWidth" | "plotLength" | "builtArea" | "floors"> }) {
  const estimatedFootprintArea = plan ? plan.builtArea / Math.max(1, plan.floors) : 193.2;
  const footprintRatio = plan ? plan.plotWidth / Math.max(plan.plotLength, 1) : 13.8 / 14;
  const initialBuildingWidth = round(Math.sqrt(estimatedFootprintArea * footprintRatio), 1);
  const initialBuildingDepth = round(estimatedFootprintArea / initialBuildingWidth, 1);

  const [unit, setUnit] = useState<Unit>("m");
  const [checked, setChecked] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [values, setValues] = useState<PlotValues>({
    plotWidth: "20",
    plotDepth: "20",
    buildingWidth: String(initialBuildingWidth),
    buildingDepth: String(initialBuildingDepth),
    frontSetback: "3",
    rearSetback: "2",
    leftSetback: "1.5",
    rightSetback: "1.5",
    frontClearance: "3",
    rearClearance: "2",
    leftClearance: "1.5",
    rightClearance: "1.5",
    roadReserve: "0",
    roadWidth: "6",
    drivewayWidth: "3",
    gateWidth: "3",
    roadSide: "north",
    garagePosition: "right",
    slope: "flat",
    orientation: "auto"
  });

  const result = useMemo(() => {
    const plotWidth = parseDimension(values.plotWidth, unit);
    const plotDepth = parseDimension(values.plotDepth, unit);
    const buildingWidth = parseDimension(values.buildingWidth, unit);
    const buildingDepth = parseDimension(values.buildingDepth, unit);
    const roadReserve = parseDimension(values.roadReserve, unit);
    const legalOffsets = {
      front: parseDimension(values.frontSetback, unit),
      rear: parseDimension(values.rearSetback, unit),
      left: parseDimension(values.leftSetback, unit),
      right: parseDimension(values.rightSetback, unit)
    };
    const desiredClearances = {
      front: parseDimension(values.frontClearance, unit),
      rear: parseDimension(values.rearClearance, unit),
      left: parseDimension(values.leftClearance, unit),
      right: parseDimension(values.rightClearance, unit)
    };
    const front = Math.max(legalOffsets.front, desiredClearances.front, roadReserve);
    const rear = Math.max(legalOffsets.rear, desiredClearances.rear);
    const left = Math.max(legalOffsets.left, desiredClearances.left);
    const right = Math.max(legalOffsets.right, desiredClearances.right);
    const boundaryOffsets = values.roadSide === "north"
      ? { top: front, bottom: rear, left, right }
      : values.roadSide === "south"
        ? { top: rear, bottom: front, left: right, right: left }
        : values.roadSide === "east"
          ? { top: left, bottom: right, left: rear, right: front }
          : { top: right, bottom: left, left: front, right: rear };
    const buildableWidth = plotWidth - boundaryOffsets.left - boundaryOffsets.right;
    const buildableDepth = plotDepth - boundaryOffsets.top - boundaryOffsets.bottom;
    const normal = { width: buildingWidth, depth: buildingDepth, fits: buildingWidth <= buildableWidth && buildingDepth <= buildableDepth };
    const rotated = { width: buildingDepth, depth: buildingWidth, fits: buildingDepth <= buildableWidth && buildingWidth <= buildableDepth };
    const normalMinMargin = Math.min(buildableWidth - normal.width, buildableDepth - normal.depth);
    const rotatedMinMargin = Math.min(buildableWidth - rotated.width, buildableDepth - rotated.depth);
    const autoRotated = rotated.fits && (!normal.fits || rotatedMinMargin > normalMinMargin);
    const useRotated = values.orientation === "rotated" || (values.orientation === "auto" && autoRotated);
    const placement = useRotated ? rotated : normal;
    const widthRemainder = buildableWidth - placement.width;
    const depthRemainder = buildableDepth - placement.depth;
    const boundaryClearances = {
      top: boundaryOffsets.top + Math.max(0, depthRemainder / 2),
      bottom: boundaryOffsets.bottom + Math.max(0, depthRemainder / 2),
      left: boundaryOffsets.left + Math.max(0, widthRemainder / 2),
      right: boundaryOffsets.right + Math.max(0, widthRemainder / 2)
    };
    const roadRelativeClearances = values.roadSide === "north"
      ? { front: boundaryClearances.top, rear: boundaryClearances.bottom, left: boundaryClearances.left, right: boundaryClearances.right }
      : values.roadSide === "south"
        ? { front: boundaryClearances.bottom, rear: boundaryClearances.top, left: boundaryClearances.right, right: boundaryClearances.left }
        : values.roadSide === "east"
          ? { front: boundaryClearances.right, rear: boundaryClearances.left, left: boundaryClearances.top, right: boundaryClearances.bottom }
          : { front: boundaryClearances.left, rear: boundaryClearances.right, left: boundaryClearances.bottom, right: boundaryClearances.top };
    const { front: frontClearance, rear: rearClearance, left: leftClearance, right: rightClearance } = roadRelativeClearances;
    const compatible = placement.fits && plotWidth > 0 && plotDepth > 0 && buildingWidth > 0 && buildingDepth > 0;
    const plotArea = plotWidth * plotDepth;
    const footprintArea = placement.width * placement.depth;
    const coverage = plotArea > 0 ? (footprintArea / plotArea) * 100 : 0;
    const buildableArea = Math.max(0, buildableWidth) * Math.max(0, buildableDepth);
    const buildableCoverage = buildableArea > 0 ? (footprintArea / buildableArea) * 100 : 0;
    const tightestClearance = Math.min(leftClearance, rightClearance, frontClearance, rearClearance);
    const drivewayWidth = parseDimension(values.drivewayWidth, unit);
    const roadWidth = parseDimension(values.roadWidth, unit);
    const gateWidth = parseDimension(values.gateWidth, unit);
    const garageAccessOkay = values.garagePosition === "none" || (drivewayWidth >= 3 && gateWidth >= 3 && roadWidth >= 5);
    const sideResults = [
      { label: "Road / front", legal: legalOffsets.front, desired: desiredClearances.front, required: front, actual: frontClearance },
      { label: "Rear", legal: legalOffsets.rear, desired: desiredClearances.rear, required: rear, actual: rearClearance },
      { label: "Left", legal: legalOffsets.left, desired: desiredClearances.left, required: left, actual: leftClearance },
      { label: "Right", legal: legalOffsets.right, desired: desiredClearances.right, required: right, actual: rightClearance }
    ].map((side) => ({ ...side, extra: side.actual - side.required, okay: side.actual >= side.required }));

    const clearanceScore = Math.min(25, Math.max(0, tightestClearance / 3 * 25));
    const coverageScore = coverage <= 55 ? 25 : Math.max(5, 25 - (coverage - 55));
    const accessScore = garageAccessOkay ? 15 : 4;
    const slopeScore = values.slope === "flat" ? 15 : values.slope === "gentle" ? 12 : values.slope === "moderate" ? 8 : 3;
    const fitScore = compatible ? Math.round(20 + clearanceScore + coverageScore + accessScore + slopeScore) : 0;

    const issues: string[] = [];
    const recommendations: string[] = [];
    if (plotWidth <= 0 || plotDepth <= 0) issues.push("Enter valid plot dimensions.");
    if (buildingWidth <= 0 || buildingDepth <= 0) issues.push("Enter valid building footprint dimensions.");
    if (buildableWidth <= 0 || buildableDepth <= 0) issues.push("Setbacks and desired yards consume the entire plot.");
    if (!placement.fits && buildableWidth > 0 && buildableDepth > 0) {
      if (placement.width > buildableWidth) issues.push(`The building is ${displayDimension(placement.width - buildableWidth, unit)} too wide for the buildable area.`);
      if (placement.depth > buildableDepth) issues.push(`The building is ${displayDimension(placement.depth - buildableDepth, unit)} too deep for the buildable area.`);
    }
    if (compatible && tightestClearance < 1.5) issues.push(`The tightest clearance is below ${displayDimension(1.5, unit)}; confirm fire access, ventilation and maintenance requirements.`);
    if (coverage > 65) issues.push("High plot coverage may limit drainage, outdoor space and future extensions.");
    if (!garageAccessOkay) issues.push(`Garage access is tight: target at least ${displayDimension(3, unit)} for both driveway and gate, with about ${displayDimension(5, unit)} road width where possible.`);
    if (roadReserve > 0) recommendations.push("The road widening or reserve strip has been excluded from the buildable envelope.");
    if (values.slope === "moderate" || values.slope === "steep") issues.push("The selected slope may require a topographic survey, retaining walls or stepped foundations.");
    if (values.orientation === "auto" && useRotated) recommendations.push("The rotated placement provides the better fit.");
    if (compatible && tightestClearance >= 2) recommendations.push("Clearances are comfortable for access, ventilation and maintenance.");
    if (coverage < 45) recommendations.push("The plot retains useful outdoor area and future-extension flexibility.");
    if (values.garagePosition !== "none" && garageAccessOkay) recommendations.push("The entered road and driveway widths support basic vehicle access.");

    return {
      plotWidth,
      plotDepth,
      buildingWidth,
      buildingDepth,
      front: boundaryOffsets.top,
      rear: boundaryOffsets.bottom,
      left: boundaryOffsets.left,
      right: boundaryOffsets.right,
      buildableWidth,
      buildableDepth,
      placement,
      compatible,
      useRotated,
      normal,
      rotated,
      leftClearance,
      rightClearance,
      frontClearance,
      rearClearance,
      plotArea,
      footprintArea,
      buildableArea,
      coverage,
      buildableCoverage,
      tightestClearance,
      garageAccessOkay,
      roadReserve,
      gateWidth,
      sideResults,
      fitScore,
      issues,
      recommendations
    };
  }, [unit, values]);

  const solarAdvice = {
    north: { facade: "south or southeast", note: "Protect west-facing rooms from strong late-afternoon sun." },
    south: { facade: "southeast", note: "Use roof overhangs above large south-facing openings." },
    east: { facade: "east or southeast", note: "West-facing bedrooms may become hot in the late afternoon." },
    west: { facade: "east", note: "Limit large glazed openings facing the west-side road." }
  }[values.roadSide];

  function update(key: keyof PlotValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setChecked(false);
  }

  function changeUnit(nextUnit: Unit) {
    if (nextUnit === unit) return;
    const dimensionKeys: Array<keyof PlotValues> = ["plotWidth", "plotDepth", "buildingWidth", "buildingDepth", "frontSetback", "rearSetback", "leftSetback", "rightSetback", "frontClearance", "rearClearance", "leftClearance", "rightClearance", "roadReserve", "roadWidth", "drivewayWidth", "gateWidth"];
    setValues((current) => {
      const next = { ...current };
      dimensionKeys.forEach((key) => {
        next[key] = convertDisplayedValue(current[key], unit, nextUnit) as never;
      });
      return next;
    });
    setUnit(nextUnit);
    setChecked(false);
  }

  const quickFields: Array<[keyof PlotValues, string, string]> = [
    ["plotWidth", "Plot width", "Boundary to boundary"],
    ["plotDepth", "Plot depth", "Road boundary to rear boundary"]
  ];
  const setbackFields: Array<[keyof PlotValues, string, string]> = [
    ["frontSetback", "Road / front setback", "Legal minimum measured from the road-side boundary"],
    ["rearSetback", "Rear setback", "Legal minimum from the rear boundary"],
    ["leftSetback", "Left setback", "Legal minimum from the left boundary"],
    ["rightSetback", "Right setback", "Legal minimum from the right boundary"],
    ["frontClearance", "Desired front clearance", "Courtyard, parking or landscaping space"],
    ["rearClearance", "Desired rear clearance", "Backyard or future extension space"],
    ["leftClearance", "Desired left clearance", "Access, windows, ventilation or maintenance"],
    ["rightClearance", "Desired right clearance", "Access, windows, ventilation or maintenance"]
  ];
  const advancedFields: Array<[keyof PlotValues, string, string]> = [
    ["buildingWidth", "Building footprint width", plan ? "Estimated from this plan; replace with exact drawing dimension" : "Enter the exact exterior width"],
    ["buildingDepth", "Building footprint depth", plan ? "Estimated from this plan; replace with exact drawing dimension" : "Enter the exact exterior depth"],
    ["roadReserve", "Road reserve / widening strip", "Part of the plot kept free for a future road widening"],
    ["roadWidth", "Road width", "For vehicle turning and access"],
    ["drivewayWidth", "Driveway width", "3 m / 10 ft is a useful minimum"],
    ["gateWidth", "Vehicle gate width", "Clear opening available for a vehicle"]
  ];

  function applyPlotPreset(width: number, depth: number) {
    setValues((current) => ({
      ...current,
      plotWidth: String(unit === "ft" ? round(width * FEET_PER_METER) : width),
      plotDepth: String(unit === "ft" ? round(depth * FEET_PER_METER) : depth)
    }));
    setChecked(false);
  }

  return (
    <Card className="overflow-hidden p-4 sm:p-6" id="plot-compatibility">
      <div className="-mx-4 -mt-4 mb-6 bg-gradient-to-r from-sky-50 via-white to-amber-50 p-4 sm:-mx-6 sm:-mt-6 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-sky-600 shadow-sm"><Ruler className="h-5 w-5" /></span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700 sm:text-sm">Plot compatibility checker</p>
              <h2 className="safe-break mt-1 text-2xl font-black text-slate-950 sm:text-4xl">Will this plan fit on my plot?</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Start with your plot size for a quick answer. Add exact setbacks and site details when you need a more precise result.</p>
            </div>
          </div>
          <div className="flex shrink-0 rounded-xl border border-slate-200 bg-white p-1 text-sm font-bold">
            {(["m", "ft"] as Unit[]).map((item) => <button key={item} type="button" onClick={() => changeUnit(item)} className={`rounded-lg px-4 py-2 uppercase transition ${unit === item ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100"}`}>{item}</button>)}
          </div>
        </div>
      </div>

      <div className="grid gap-7 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">{plan ? "Plan-specific analysis" : "General planning mode"}</Badge>
            <Badge tone="amber">{plan ? "Footprint starts as an estimate" : "Enter exact footprint dimensions"}</Badge>
            <Badge tone="green">Front always means road-facing side</Badge>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {["Enter your plot size", "Check the plan", "Review clearances and advice"].map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-600 text-xs text-white">{index + 1}</span>{step}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-3xl border border-sky-100 bg-sky-50/50 p-4">
            <p className="font-black text-slate-950">Start with a common plot size</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[[12, 18, "Compact"], [20, 20, "Standard"], [25, 30, "Wide"]].map(([width, depth, label]) => (
                <button key={String(label)} type="button" onClick={() => applyPlotPreset(width as number, depth as number)} className="focus-ring rounded-full border border-sky-200 bg-white px-4 py-2 text-xs font-bold text-sky-800 hover:border-sky-400">
                  {String(label)}: {width} x {depth} m / {Math.round((width as number) * FEET_PER_METER)} x {Math.round((depth as number) * FEET_PER_METER)} ft
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {quickFields.map(([key, label, helper]) => (
              <label key={key} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-sm font-semibold text-slate-800">
                {label}
                <span className="mt-1 block min-h-8 text-[11px] font-medium leading-4 text-slate-500">{helper}</span>
                <div className="relative mt-2">
                  <Input inputMode="decimal" value={values[key]} onChange={(event) => update(key, event.target.value)} className="bg-white pr-12" />
                  <span className="pointer-events-none absolute right-3 top-3 text-xs font-bold uppercase text-slate-400">{unit}</span>
                </div>
              </label>
            ))}
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-emerald-100 bg-emerald-50/45 p-4">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div><p className="font-black text-slate-950">Setbacks and desired clearances on every side</p><p className="mt-1 text-xs leading-5 text-slate-600">The tool always applies the larger value. For example, a 1.5 m legal left setback plus a desired 2 m passage uses 2 m.</p></div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {setbackFields.map(([key, label, helper]) => (
                <label key={key} className="rounded-2xl border border-emerald-100 bg-white p-3 text-xs font-bold text-slate-700">
                  {label}<span className="mt-1 block min-h-8 text-[10px] font-medium leading-4 text-slate-500">{helper}</span>
                  <div className="relative mt-2"><Input inputMode="decimal" value={values[key]} onChange={(event) => update(key, event.target.value)} className="bg-white pr-12" /><span className="pointer-events-none absolute right-3 top-3 text-xs font-bold uppercase text-slate-400">{unit}</span></div>
                </label>
              ))}
            </div>
          </div>

          <button type="button" onClick={() => setAdvancedOpen((current) => !current)} className="focus-ring mt-4 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left">
            <span><strong className="block text-sm text-slate-950">Improve accuracy with road and building details</strong><span className="mt-1 block text-xs text-slate-500">Optional: exact footprint, road reserve, driveway, gate, slope and orientation.</span></span>
            <ChevronDown className={`h-5 w-5 shrink-0 text-slate-500 transition ${advancedOpen ? "rotate-180" : ""}`} />
          </button>

          {advancedOpen ? <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {advancedFields.map(([key, label, helper]) => (
                <label key={key} className="rounded-2xl border border-slate-100 bg-white p-3 text-sm font-semibold text-slate-800">
                  {label}<span className="mt-1 block min-h-8 text-[11px] font-medium leading-4 text-slate-500">{helper}</span>
                  <div className="relative mt-2"><Input inputMode="decimal" value={values[key]} onChange={(event) => update(key, event.target.value)} className="bg-white pr-12" /><span className="pointer-events-none absolute right-3 top-3 text-xs font-bold uppercase text-slate-400">{unit}</span></div>
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-sm font-semibold text-slate-700">Road side<Select className="mt-2" value={values.roadSide} onChange={(event) => update("roadSide", event.target.value)}><option value="north">North</option><option value="south">South</option><option value="east">East</option><option value="west">West</option></Select></label>
              <label className="text-sm font-semibold text-slate-700">Garage position<Select className="mt-2" value={values.garagePosition} onChange={(event) => update("garagePosition", event.target.value)}><option value="right">Right side</option><option value="left">Left side</option><option value="front">Front</option><option value="none">No garage</option></Select></label>
              <label className="text-sm font-semibold text-slate-700">Plot slope<Select className="mt-2" value={values.slope} onChange={(event) => update("slope", event.target.value)}><option value="flat">Flat, under 3%</option><option value="gentle">Gentle, 3-8%</option><option value="moderate">Moderate, 8-15%</option><option value="steep">Steep, over 15%</option></Select></label>
              <label className="text-sm font-semibold text-slate-700">Plan orientation<Select className="mt-2" value={values.orientation} onChange={(event) => update("orientation", event.target.value)}><option value="auto">Auto-select best fit</option><option value="normal">Original orientation</option><option value="rotated">Rotate 90 degrees</option></Select></label>
            </div>
          </div> : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button className="w-full sm:w-auto" onClick={() => setChecked(true)}><Gauge className="h-4 w-4" /> Check my plot</Button>
            <p className="flex gap-2 text-xs leading-5 text-slate-500"><Info className="mt-0.5 h-4 w-4 shrink-0" /> Use exact exterior dimensions from the drawing set for the most reliable result.</p>
          </div>
        </div>

        <div className="grid content-start gap-4">
          <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-emerald-100 shadow-inner sm:min-h-[370px] sm:rounded-3xl">
            <div className={`absolute bg-slate-700 text-center text-[10px] font-black uppercase tracking-widest text-white ${values.roadSide === "north" ? "inset-x-0 top-0 h-7 py-2" : values.roadSide === "south" ? "inset-x-0 bottom-0 h-7 py-2" : values.roadSide === "east" ? "bottom-0 right-0 top-0 w-7 [writing-mode:vertical-rl] py-2" : "bottom-0 left-0 top-0 w-7 [writing-mode:vertical-rl] py-2"}`}>Road</div>
            <div className="absolute inset-5 sm:inset-8">
              <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow">Plot {displayDimension(result.plotWidth, unit)} x {displayDimension(result.plotDepth, unit)}</span>
              <div
                className="absolute grid place-items-center border-2 border-dashed border-emerald-700/50 bg-white/35"
                style={{
                  left: clampPercent(result.plotWidth > 0 ? result.left / result.plotWidth * 100 : 5),
                  right: clampPercent(result.plotWidth > 0 ? result.right / result.plotWidth * 100 : 5),
                  top: clampPercent(result.plotDepth > 0 ? result.front / result.plotDepth * 100 : 5),
                  bottom: clampPercent(result.plotDepth > 0 ? result.rear / result.plotDepth * 100 : 5)
                }}
              >
                <div
                  className={`grid place-items-center rounded-xl border-2 p-2 text-center shadow-xl transition-all duration-500 ${checked && !result.compatible ? "border-red-500 bg-red-100 text-red-900" : "border-sky-600 bg-sky-100 text-slate-950"}`}
                  style={{
                    width: clampPercent(result.buildableWidth > 0 ? result.placement.width / result.buildableWidth * 100 : 50),
                    height: clampPercent(result.buildableDepth > 0 ? result.placement.depth / result.buildableDepth * 100 : 50)
                  }}
                >
                  <div>
                    <p className="text-[10px] font-black uppercase text-sky-700">{result.useRotated ? "Rotated placement" : "Original placement"}</p>
                    <p className="mt-1 line-clamp-2 text-xs font-black">{plan?.title ?? "Selected plan"}</p>
                    <p className="mt-1 text-[10px] font-semibold">{displayDimension(result.placement.width, unit)} x {displayDimension(result.placement.depth, unit)}</p>
                  </div>
                </div>
              </div>
              {values.garagePosition !== "none" ? <span className={`absolute flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-bold text-white ${values.garagePosition === "left" ? "bottom-2 left-2" : values.garagePosition === "right" ? "bottom-2 right-2" : "bottom-2 left-1/2 -translate-x-1/2"}`}><Warehouse className="h-3 w-3" /> Garage</span> : null}
              <Compass className="absolute right-2 top-2 h-7 w-7 text-slate-700" />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="flex items-center gap-2 font-black text-slate-950"><Sun className="h-5 w-5 text-amber-500" /> Solar guidance</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">Road to the <strong>{values.roadSide}</strong>. Favor a main facade toward the <strong>{solarAdvice.facade}</strong>.</p>
              <p className="mt-2 text-xs font-semibold leading-5 text-amber-800">{solarAdvice.note}</p>
            </div>
            <div className={`rounded-2xl border p-4 ${result.garageAccessOkay ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
              <p className="flex items-center gap-2 font-black text-slate-950"><Route className="h-5 w-5 text-sky-600" /> Vehicle access</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{values.garagePosition === "none" ? "No garage access requested." : result.garageAccessOkay ? `Road, driveway and ${displayDimension(result.gateWidth, unit)} gate support basic vehicle access.` : `Increase both driveway and gate toward ${displayDimension(3, unit)}, then verify road turning space.`}</p>
            </div>
          </div>
        </div>
      </div>

      {checked ? (
        <div className="mt-7 border-t border-slate-200 pt-7">
          <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
            <div className={`rounded-3xl border p-5 ${result.compatible ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`flex items-center gap-2 text-xl font-black ${result.compatible ? "text-emerald-800" : "text-red-800"}`}>
                    {result.compatible ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                    {result.compatible ? "Compatible" : "Not compatible"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{result.compatible ? "The selected placement fits inside the calculated buildable envelope." : "The selected placement exceeds the calculated buildable envelope."}</p>
                </div>
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-[6px] border-white bg-slate-950 text-center text-white shadow sm:h-20 sm:w-20 sm:border-8">
                  <span><strong className="block text-2xl">{result.fitScore}</strong><span className="text-[9px] uppercase">Fit score</span></span>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                <p className="rounded-xl bg-white/70 p-3"><span className="block text-slate-500">Buildable envelope</span><strong>{displayDimension(result.buildableWidth, unit)} x {displayDimension(result.buildableDepth, unit)}</strong></p>
                <p className="rounded-xl bg-white/70 p-3"><span className="block text-slate-500">Road-facing side</span><strong className="capitalize">{values.roadSide}</strong></p>
                <p className="rounded-xl bg-white/70 p-3"><span className="block text-slate-500">Placement used</span><strong>{result.useRotated ? "Rotated 90 degrees" : "Original orientation"}</strong></p>
                <p className="rounded-xl bg-white/70 p-3"><span className="block text-slate-500">Plot coverage</span><strong>{round(result.coverage, 1)}%</strong></p>
                {result.roadReserve > 0 ? <p className="rounded-xl bg-white/70 p-3"><span className="block text-slate-500">Road reserve kept clear</span><strong>{displayDimension(result.roadReserve, unit)}</strong></p> : null}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {result.sideResults.map((side) => (
                  <div key={side.label} className={`rounded-2xl border p-4 ${side.extra < 0.01 ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50/60"}`}>
                    <p className="text-xs font-black text-slate-950">{side.label}</p>
                    <p className="mt-2 text-xl font-black text-slate-950">{displayDimension(side.actual, unit)}</p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-500">Legal: {displayDimension(side.legal, unit)} | Desired: {displayDimension(side.desired, unit)}</p>
                    <p className="mt-1 text-[10px] font-semibold text-slate-500">Required offset: {displayDimension(side.required, unit)}</p>
                    <p className={`mt-2 text-xs font-bold ${side.extra > 0.01 ? "text-emerald-700" : "text-amber-700"}`}>{side.extra > 0.01 ? `${displayDimension(side.extra, unit)} additional space` : "No additional margin"}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                  <p className="flex items-center gap-2 font-black text-slate-950"><AlertTriangle className="h-5 w-5 text-amber-500" /> Risks and checks</p>
                  <ul className="mt-3 grid gap-2 text-sm leading-5 text-slate-700">{result.issues.length ? result.issues.map((item) => <li key={item}>- {item}</li>) : <li>- No major geometric issue detected.</li>}</ul>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <p className="flex items-center gap-2 font-black text-slate-950"><ShieldCheck className="h-5 w-5 text-emerald-600" /> Recommendations</p>
                  <ul className="mt-3 grid gap-2 text-sm leading-5 text-slate-700">{result.recommendations.length ? result.recommendations.map((item) => <li key={item}>- {item}</li>) : <li>- Increase the plot or reduce the footprint, then run the analysis again.</li>}</ul>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600"><strong>Important:</strong> This tool performs a geometric pre-check only. It does not verify easements, zoning, utilities, drainage, fire access, structural engineering, topography or permit requirements. Confirm the result with a licensed local professional and an official survey.</p>
        </div>
      ) : null}
    </Card>
  );
}
