"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Bath, BedDouble, Eye, FileText, Gauge, GitCompareArrows, MapPinned, Ruler } from "lucide-react";
import type { Plan } from "@/types/plan";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getPlanPreviewImages } from "@/lib/planImages";
import { formatAreaDual, formatPlotDual } from "@/lib/unitFormat";
import { formatCurrency } from "@/lib/utils";

const InteractiveImagePreview = dynamic(
  () => import("@/components/public/InteractiveImagePreview").then((module) => module.InteractiveImagePreview),
  { ssr: false }
);

export function PlanCard({
  plan,
  compareSelected = false,
  compareDisabled = false,
  onCompareToggle
}: {
  plan: Plan;
  compareSelected?: boolean;
  compareDisabled?: boolean;
  onCompareToggle?: () => void;
}) {
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const previewImages = getPlanPreviewImages(plan);
  const smartScore = Math.round((plan.scores.functionality + plan.scores.comfort + plan.scores.costEfficiency + plan.scores.hotClimateAdaptation) / 4);

  return (
    <>
    <Card className="group overflow-hidden border-slate-200/80 bg-white hover:border-sky-200 hover:shadow-[0_16px_48px_rgba(15,23,42,0.1)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image src={plan.mainImage} alt={plan.title} fill sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/48 via-transparent to-transparent opacity-80" />
        <div className="absolute left-2 right-2 top-2 flex max-h-16 flex-wrap gap-1.5 overflow-hidden sm:left-3 sm:right-auto sm:top-3 sm:max-h-none sm:gap-2">
          {plan.badges.slice(0, 3).map((badge) => <Badge key={badge} tone={badge.includes("Free") ? "green" : badge.includes("Revit") || badge.includes("DWG") || badge.includes("IFC") ? "purple" : "amber"}>{badge}</Badge>)}
        </div>
        <span className="absolute right-3 top-3 grid h-14 w-14 place-items-center rounded-md border border-white/30 bg-slate-950/75 text-center text-white shadow-lg backdrop-blur">
          <span><span className="block text-sm font-extrabold leading-none">{smartScore}</span><span className="mt-1 block text-[8px] font-bold uppercase tracking-wide text-sky-200">Fit</span></span>
        </span>
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-between gap-1.5 text-white sm:bottom-3 sm:left-3 sm:right-3 sm:gap-2">
          <span className="rounded-md bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">Free preview available</span>
          {plan.cadPackEnabled ? <span className="rounded-md bg-slate-950/70 px-3 py-1 text-xs font-bold backdrop-blur">CAD/Revit files</span> : null}
        </div>
      </div>
      <div className="p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-sky-600">{plan.reference}</p>
        <h3 className="mt-2 line-clamp-2 text-lg font-bold text-slate-950">{plan.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{plan.shortDescription}</p>
        <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-slate-600 min-[360px]:grid-cols-2 sm:mt-4 sm:text-sm">
          <span className="flex items-center gap-2 rounded-md bg-slate-50 p-2"><Ruler className="h-4 w-4 shrink-0 text-sky-600" /> {formatAreaDual(plan.totalArea, true)}</span>
          <span className="flex items-center gap-2 rounded-md bg-slate-50 p-2"><BedDouble className="h-4 w-4 shrink-0 text-sky-600" /> {plan.bedrooms} beds</span>
          <span className="flex items-center gap-2 rounded-md bg-slate-50 p-2"><Bath className="h-4 w-4 shrink-0 text-sky-600" /> {plan.bathrooms} baths</span>
          <span className="flex items-center gap-2 rounded-md bg-slate-50 p-2"><FileText className="h-4 w-4 shrink-0 text-sky-600" /> {formatPlotDual(plan.plotWidth, plan.plotLength, true)}</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs text-slate-500">Starting at</p>
            <p className="font-extrabold text-slate-950">{plan.freePackEnabled ? "$0" : formatCurrency(plan.premiumPrice)}</p>
          </div>
          <span className="flex items-center gap-2 text-xs font-bold text-emerald-700"><Gauge className="h-4 w-4" /> Plan fit {smartScore}%</span>
        </div>
        <div className="mt-4 grid gap-2 min-[360px]:grid-cols-2">
          <Button href={`/plans/${plan.slug}`}>View Plan</Button>
          <Button type="button" variant="outline" onClick={() => setIsPreviewOpen(true)}><Eye className="h-4 w-4" /> Preview {previewImages.length > 1 ? `(${previewImages.length})` : ""}</Button>
        </div>
        <Button href={`/plans/${plan.slug}#plot-checker`} variant="ghost" className="mt-2 w-full"><MapPinned className="h-4 w-4" /> Check this plan against my plot</Button>
        {onCompareToggle ? (
          <Button type="button" variant={compareSelected ? "secondary" : "outline"} className="mt-2 w-full" disabled={compareDisabled} onClick={onCompareToggle}>
            <GitCompareArrows className="h-4 w-4" />
            {compareSelected ? "Selected for comparison" : compareDisabled ? "Maximum 3 plans" : "Compare"}
          </Button>
        ) : null}
      </div>
    </Card>
    <InteractiveImagePreview images={previewImages} isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
    </>
  );
}
