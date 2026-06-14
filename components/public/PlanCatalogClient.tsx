"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDownUp, Check, ChevronDown, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import type { Plan } from "@/types/plan";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PlanCard } from "@/components/public/PlanCard";
import { calculateSmartScore } from "@/lib/planRanking";
import { feetToMeters, formatAreaDual, formatPlotDual, squareFeetToSquareMeters } from "@/lib/unitFormat";
import { formatCurrency } from "@/lib/utils";
import { slugify } from "@/lib/slug";

type SortMode = "featured" | "newest" | "price" | "area" | "popular" | "smart";
type Unit = "m" | "ft";

type Filters = {
  bedrooms: string;
  minArea: string;
  maxArea: string;
  floors: string;
  style: string;
  garage: string;
  maxBudget: string;
  minPlotWidth: string;
};

const emptyFilters: Filters = {
  bedrooms: "",
  minArea: "",
  maxArea: "",
  floors: "",
  style: "",
  garage: "",
  maxBudget: "",
  minPlotWidth: ""
};

function numberOrNull(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value.trim() !== "" ? parsed : null;
}

function planPrice(plan: Plan) {
  return plan.freePackEnabled ? 0 : plan.premiumPrice;
}

function hasGarage(plan: Plan) {
  const text = [plan.title, plan.shortDescription, plan.description, plan.category, ...(plan.tags ?? []), ...(plan.features ?? []), ...(plan.specialFeatures ?? []), ...plan.badges].join(" ").toLowerCase();
  return text.includes("garage") || text.includes("carport") || text.includes("parking");
}

function estimatedConstructionCost(plan: Plan) {
  const difficultyFactor = plan.constructionDifficulty === "Advanced" ? 1.2 : plan.constructionDifficulty === "Easy" ? 0.9 : 1;
  return Math.round(plan.totalArea * 900 * difficultyFactor);
}

function difficultyLabel(plan: Plan) {
  if (plan.constructionDifficulty === "Advanced") return "Advanced";
  if (plan.constructionDifficulty === "Easy") return "Easy";
  return "Medium";
}

function fitsPlot(plan: Plan, width: number, length: number) {
  return (plan.plotWidth <= width && plan.plotLength <= length) || (plan.plotLength <= width && plan.plotWidth <= length);
}

function searchableText(plan: Plan) {
  return [
    plan.title,
    plan.reference,
    plan.shortDescription,
    plan.description,
    plan.category,
    plan.architecturalStyle,
    plan.roofType,
    `${plan.bedrooms} bedrooms`,
    `${plan.bedrooms} bedroom`,
    `${plan.plotWidth}x${plan.plotLength}m`,
    `${Math.round(plan.plotWidth * 3.28084)}x${Math.round(plan.plotLength * 3.28084)}ft`,
    `${plan.totalArea} m2`,
    `${Math.round(plan.totalArea * 10.7639)} sq ft`,
    ...(plan.tags ?? []),
    ...(plan.features ?? []),
    ...(plan.specialFeatures ?? []),
    ...plan.badges,
    ...plan.bestFor
  ].join(" ").toLowerCase();
}

function isSimilarStyle(a: string, b: string) {
  const left = a.toLowerCase();
  const right = b.toLowerCase();
  return left === right || left.split(" ").some((part) => part.length > 4 && right.includes(part));
}

function relatedScore(target: Plan, candidate: Plan) {
  const areaDiff = Math.abs(target.totalArea - candidate.totalArea);
  const areaScore = Math.max(0, 28 - areaDiff / 8);
  return (
    (candidate.id === target.id ? -999 : 0) +
    (candidate.bedrooms === target.bedrooms ? 26 : Math.max(0, 14 - Math.abs(candidate.bedrooms - target.bedrooms) * 7)) +
    areaScore +
    (isSimilarStyle(target.architecturalStyle, candidate.architecturalStyle) ? 22 : 0) +
    (candidate.floors === target.floors ? 8 : 0) +
    (candidate.category === target.category ? 8 : 0) +
    calculateSmartScore(candidate) / 12
  );
}

function sortPlans(plans: Plan[], sortMode: SortMode) {
  return [...plans].sort((a, b) => {
    if (sortMode === "newest") return Date.parse(b.publishedAt ?? b.createdAt ?? "") - Date.parse(a.publishedAt ?? a.createdAt ?? "");
    if (sortMode === "price") return planPrice(a) - planPrice(b);
    if (sortMode === "area") return b.totalArea - a.totalArea;
    if (sortMode === "popular") return (b.views + (b.downloads ?? 0)) - (a.views + (a.downloads ?? 0));
    if (sortMode === "smart") return calculateSmartScore(b) - calculateSmartScore(a);
    return (a.manualRank ?? 9999) - (b.manualRank ?? 9999);
  });
}

export function PlanCatalogClient({ plans }: { plans: Plan[] }) {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category") ?? "";
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchText, setSearchText] = useState(searchParams.get("q") ?? "");
  const [comparePlotWidth, setComparePlotWidth] = useState("20");
  const [comparePlotLength, setComparePlotLength] = useState("20");
  const [plotTestOpen, setPlotTestOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [unit, setUnit] = useState<Unit>("m");

  const styles = useMemo(() => Array.from(new Set(plans.map((plan) => plan.architecturalStyle))).sort(), [plans]);

  useEffect(() => {
    setSearchText(searchParams.get("q") ?? "");
  }, [searchParams]);

  const filteredPlans = useMemo(() => {
    const bedrooms = numberOrNull(filters.bedrooms);
    const rawMinArea = numberOrNull(filters.minArea);
    const rawMaxArea = numberOrNull(filters.maxArea);
    const minArea = rawMinArea === null ? null : unit === "ft" ? squareFeetToSquareMeters(rawMinArea) : rawMinArea;
    const maxArea = rawMaxArea === null ? null : unit === "ft" ? squareFeetToSquareMeters(rawMaxArea) : rawMaxArea;
    const floors = numberOrNull(filters.floors);
    const maxBudget = numberOrNull(filters.maxBudget);
    const rawMinPlotWidth = numberOrNull(filters.minPlotWidth);
    const minPlotWidth = rawMinPlotWidth === null ? null : unit === "ft" ? feetToMeters(rawMinPlotWidth) : rawMinPlotWidth;

    const queryTokens = searchText.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = plans.filter((plan) => {
      const haystack = searchableText(plan);
      if (queryTokens.length > 0 && !queryTokens.every((token) => haystack.includes(token))) return false;
      if (categorySlug && slugify(plan.category) !== categorySlug) return false;
      if (bedrooms !== null && plan.bedrooms !== bedrooms) return false;
      if (minArea !== null && plan.totalArea < minArea) return false;
      if (maxArea !== null && plan.totalArea > maxArea) return false;
      if (floors !== null && plan.floors !== floors) return false;
      if (filters.style && plan.architecturalStyle !== filters.style) return false;
      if (filters.garage === "with" && !hasGarage(plan)) return false;
      if (filters.garage === "without" && hasGarage(plan)) return false;
      if (maxBudget !== null && planPrice(plan) > maxBudget) return false;
      if (minPlotWidth !== null && plan.plotWidth < minPlotWidth) return false;
      return true;
    });

    return sortPlans(matches, sortMode);
  }, [categorySlug, filters, plans, searchText, sortMode, unit]);

  const selectedPlans = selectedIds.map((id) => plans.find((plan) => plan.id === id)).filter(Boolean) as Plan[];
  const recommendationBase = selectedPlans[0] ?? filteredPlans[0] ?? plans[0];
  const recommendedPlans = recommendationBase
    ? plans
        .filter((plan) => !selectedIds.includes(plan.id))
        .map((plan) => ({ plan, score: relatedScore(recommendationBase, plan) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((item) => item.plan)
    : [];

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function toggleCompare(planId: string) {
    setSelectedIds((current) => {
      if (current.includes(planId)) return current.filter((id) => id !== planId);
      if (current.length >= 3) return current;
      return [...current, planId];
    });
  }

  function changeUnit(next: Unit) {
    if (next === unit) return;
    const lengthFactor = next === "ft" ? 3.28084 : 1 / 3.28084;
    const areaFactor = next === "ft" ? 10.7639 : 1 / 10.7639;
    const convert = (value: string, factor: number) => value.trim() ? String(Math.round(Number(value) * factor * 10) / 10) : "";
    setFilters((current) => ({ ...current, minArea: convert(current.minArea, areaFactor), maxArea: convert(current.maxArea, areaFactor), minPlotWidth: convert(current.minPlotWidth, lengthFactor) }));
    setComparePlotWidth((current) => convert(current, lengthFactor));
    setComparePlotLength((current) => convert(current, lengthFactor));
    setUnit(next);
  }

  const compareDisabled = selectedIds.length >= 3;
  const compareRows: Array<[string, (plan: Plan) => string]> = [
    ["Surface", (plan) => formatAreaDual(plan.totalArea)],
    ["Bedrooms", (plan) => `${plan.bedrooms}`],
    ["Bathrooms", (plan) => `${plan.bathrooms}`],
    ["Garage", (plan) => hasGarage(plan) ? "Yes" : "No"],
    ["Estimated construction cost", (plan) => formatCurrency(estimatedConstructionCost(plan))],
    ["Difficulty", (plan) => difficultyLabel(plan)],
    [`Fits ${comparePlotWidth} x ${comparePlotLength} ${unit} plot`, (plan) => fitsPlot(plan, unit === "ft" ? feetToMeters(numberOrNull(comparePlotWidth) ?? 0) : numberOrNull(comparePlotWidth) ?? 0, unit === "ft" ? feetToMeters(numberOrNull(comparePlotLength) ?? 0) : numberOrNull(comparePlotLength) ?? 0) ? "Yes" : "No"],
    ["Minimum plot dimensions", (plan) => formatPlotDual(plan.plotWidth, plan.plotLength)],
    ["Floors", (plan) => `${plan.floors}`],
    ["Files", (plan) => [plan.freePackEnabled ? "Free PDF" : "", plan.premiumPackEnabled ? "Premium PDF" : "", plan.cadPackEnabled ? "CAD/Revit" : ""].filter(Boolean).join(", ")]
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <button type="button" onClick={() => setFiltersOpen((current) => !current)} className="focus-ring flex w-full items-center justify-between rounded-2xl border border-white bg-white/90 p-4 font-bold text-slate-950 shadow-sm lg:hidden">
          <span className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-sky-600" /> Filter plans</span>
          <ChevronDown className={`h-5 w-5 text-slate-500 transition ${filtersOpen ? "rotate-180" : ""}`} />
        </button>
        <Card className={`${filtersOpen ? "mt-3 block" : "hidden"} p-4 sm:p-5 lg:mt-0 lg:block`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-slate-950">Advanced filters</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Find plans by real construction criteria.</p>
            </div>
            <SlidersHorizontal className="h-5 w-5 text-sky-600" />
          </div>
          <div className="mt-4 flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
            {(["m", "ft"] as Unit[]).map((item) => <button key={item} type="button" onClick={() => changeUnit(item)} className={`flex-1 rounded-lg px-3 py-2 uppercase transition ${unit === item ? "bg-slate-950 text-white" : "text-slate-500"}`}>{item}</button>)}
          </div>
          <div className="mt-5 grid gap-4">
            <label className="text-sm font-semibold text-slate-700">Bedrooms<Input inputMode="numeric" placeholder="2, 3, 4..." value={filters.bedrooms} onChange={(event) => updateFilter("bedrooms", event.target.value)} className="mt-2" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold text-slate-700">Min area, {unit === "m" ? "m2" : "sq ft"}<Input inputMode="numeric" placeholder={unit === "m" ? "80" : "861"} value={filters.minArea} onChange={(event) => updateFilter("minArea", event.target.value)} className="mt-2" /></label>
              <label className="text-sm font-semibold text-slate-700">Max area, {unit === "m" ? "m2" : "sq ft"}<Input inputMode="numeric" placeholder={unit === "m" ? "250" : "2,691"} value={filters.maxArea} onChange={(event) => updateFilter("maxArea", event.target.value)} className="mt-2" /></label>
            </div>
            <label className="text-sm font-semibold text-slate-700">Floors<Select value={filters.floors} onChange={(event) => updateFilter("floors", event.target.value)} className="mt-2"><option value="">Any floors</option><option value="1">1 floor</option><option value="2">2 floors</option></Select></label>
            <label className="text-sm font-semibold text-slate-700">Style<Select value={filters.style} onChange={(event) => updateFilter("style", event.target.value)} className="mt-2"><option value="">Any style</option>{styles.map((style) => <option key={style} value={style}>{style}</option>)}</Select></label>
            <label className="text-sm font-semibold text-slate-700">Garage<Select value={filters.garage} onChange={(event) => updateFilter("garage", event.target.value)} className="mt-2"><option value="">Any</option><option value="with">With garage/parking</option><option value="without">Without garage</option></Select></label>
            <label className="text-sm font-semibold text-slate-700">Max budget<Input inputMode="decimal" placeholder="10" value={filters.maxBudget} onChange={(event) => updateFilter("maxBudget", event.target.value)} className="mt-2" /></label>
            <label className="text-sm font-semibold text-slate-700">Minimum plot width, {unit}<Input inputMode="numeric" placeholder={unit === "m" ? "12" : "39"} value={filters.minPlotWidth} onChange={(event) => updateFilter("minPlotWidth", event.target.value)} className="mt-2" /></label>
          </div>
          <Button type="button" variant="outline" className="mt-5 w-full" onClick={() => setFilters(emptyFilters)}><RotateCcw className="h-4 w-4" /> Reset filters</Button>
        </Card>
      </aside>

      <div className="min-w-0">
        <Card className="mb-6 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold uppercase tracking-wide text-sky-600">Smart catalog search</p>
              <label className="mt-2 block text-sm font-semibold text-slate-700">
                Search by room count, plot size, style, file type or budget signal
                <div className="relative mt-2">
                  <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input className="pl-10" placeholder="Example: 3 bedrooms 20x20 modern CAD" value={searchText} onChange={(event) => setSearchText(event.target.value)} />
                </div>
              </label>
            </div>
            <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
              {[
                ["3 bedrooms", "3 bedrooms"],
                ["20x20m / 66x66 ft", "20x20m"],
                ["low cost", "low cost"],
                ["CAD", "CAD"],
                ["terrace", "terrace"]
              ].map(([label, value]) => (
                <button key={label} type="button" onClick={() => setSearchText(value)} className="focus-ring rounded-full">
                  <Badge tone={label.includes("CAD") ? "purple" : "slate"}>{label}</Badge>
                </button>
              ))}
              {searchText ? (
                <Button type="button" variant="ghost" className="min-h-8 rounded-full px-3 py-1.5 text-xs" onClick={() => setSearchText("")}>
                  <X className="h-3.5 w-3.5" /> Clear search
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <p className="font-semibold text-slate-700">{filteredPlans.length} results found</p>
          <Select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="w-full sm:w-56">
            <option value="featured">Sort by featured</option>
            <option value="newest">Newest</option>
            <option value="price">Lowest price</option>
            <option value="popular">Most viewed</option>
            <option value="area">Largest area</option>
            <option value="smart">Best smart score</option>
          </Select>
        </div>

        {selectedPlans.length > 0 ? (
          <Card className="mb-6 overflow-hidden p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-sky-600">Compare plans</p>
                <h2 className="text-2xl font-black text-slate-950">{selectedPlans.length}/3 selected</h2>
                <p className="mt-1 text-sm text-slate-600">{selectedPlans.length < 3 ? `Select ${3 - selectedPlans.length} more plan${selectedPlans.length === 2 ? "" : "s"} for the clearest comparison.` : "Your side-by-side comparison is ready."}</p>
              </div>
              <Button type="button" variant="ghost" onClick={() => setSelectedIds([])}><X className="h-4 w-4" /> Clear</Button>
            </div>
            <button type="button" onClick={() => setPlotTestOpen((current) => !current)} className="focus-ring mt-4 flex w-full items-center justify-between rounded-2xl border border-sky-100 bg-sky-50/70 p-3 text-left"><span><strong className="block text-sm text-slate-950">Optional: test these plans against your plot</strong><span className="mt-1 block text-xs text-slate-600">Enter the buildable dimensions after setbacks.</span></span><ChevronDown className={`h-5 w-5 text-sky-700 transition ${plotTestOpen ? "rotate-180" : ""}`} /></button>
            {plotTestOpen ? <div className="mt-3 grid gap-3 rounded-2xl border border-sky-100 bg-sky-50/40 p-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-slate-700">Available width, {unit}<Input className="mt-1 bg-white" inputMode="decimal" value={comparePlotWidth} onChange={(event) => setComparePlotWidth(event.target.value)} /></label>
              <label className="text-xs font-bold text-slate-700">Available depth, {unit}<Input className="mt-1 bg-white" inputMode="decimal" value={comparePlotLength} onChange={(event) => setComparePlotLength(event.target.value)} /></label>
            </div> : null}
            <div className="mt-5 grid gap-3 md:hidden">
              {selectedPlans.map((plan) => (
                <div key={plan.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="font-black text-slate-950">{plan.title}</p>
                  <div className="mt-3 divide-y divide-slate-100">
                    {compareRows.map(([label, getValue]) => <p key={label} className="flex items-start justify-between gap-3 py-2 text-xs"><span className="font-semibold text-slate-500">{label}</span><strong className="max-w-[55%] text-right text-slate-800">{getValue(plan)}</strong></p>)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-3 pr-4">Criteria</th>
                    {selectedPlans.map((plan) => <th key={plan.id} className="px-4 py-3">{plan.title}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {compareRows.map(([label, getValue]) => (
                    <tr key={String(label)}>
                      <td className="py-3 pr-4 font-bold text-slate-950">{String(label)}</td>
                      {selectedPlans.map((plan) => <td key={plan.id} className="px-4 py-3 text-slate-600">{(getValue as (plan: Plan) => string)(plan)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : null}

        {recommendedPlans.length > 0 ? (
          <Card className="mb-6 border-sky-100 bg-sky-50/70 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <Search className="mt-1 h-5 w-5 shrink-0 text-sky-600" />
              <div>
                <p className="font-black text-slate-950">Similar plans suggested automatically</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">Based on {recommendationBase.title}: style, size and bedrooms.</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {recommendedPlans.map((plan) => <Badge key={plan.id} tone="blue">{plan.bedrooms} beds - {formatAreaDual(plan.totalArea, true)} - {plan.architecturalStyle}</Badge>)}
            </div>
          </Card>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              compareSelected={selectedIds.includes(plan.id)}
              compareDisabled={compareDisabled && !selectedIds.includes(plan.id)}
              onCompareToggle={() => toggleCompare(plan.id)}
            />
          ))}
        </div>

        {filteredPlans.length === 0 ? (
          <Card className="p-8 text-center">
            <ArrowDownUp className="mx-auto h-7 w-7 text-sky-600" />
            <h2 className="mt-4 text-2xl font-black text-slate-950">No plan matches these filters</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">Try a wider surface range, a larger budget, or reset filters to see all published plans.</p>
            <Button type="button" className="mt-5" onClick={() => setFilters(emptyFilters)}><Check className="h-4 w-4" /> Show all plans</Button>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
