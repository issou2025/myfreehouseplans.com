import { CheckCircle2, Circle } from "lucide-react";
import type { Plan } from "@/types/plan";
import { getReadinessLabel, getReadinessScore } from "@/lib/adminMetrics";
import { AdminScoreBadge } from "@/components/admin/AdminScoreBadge";
import { Card } from "@/components/ui/Card";

export function AdminReadinessChecklist({ plan }: { plan?: Plan }) {
  const score = plan ? getReadinessScore(plan) : 58;
  const items = [
    ["Title completed", Boolean(plan?.title)],
    ["Slug completed", Boolean(plan?.slug)],
    ["Reference completed", Boolean(plan?.reference)],
    ["Category selected", Boolean(plan?.category)],
    ["Short description completed", Boolean(plan?.shortDescription)],
    ["Full description completed", Boolean(plan?.description)],
    ["Main image added", Boolean(plan?.mainImage)],
    ["Gallery added", Boolean(plan?.galleryImages?.length)],
    ["Technical details completed", Boolean(plan?.totalArea)],
    ["Free PDF URL added", Boolean(plan?.freePdfUrl)],
    ["Premium price added", Boolean(plan?.premiumPrice)],
    ["Premium link added", Boolean(plan?.premiumUrl)],
    ["CAD/Revit price added", Boolean(plan?.cadPrice)],
    ["CAD/Revit link added", Boolean(plan?.cadUrl)],
    ["SEO title added", Boolean(plan?.seoTitle)],
    ["Meta description added", Boolean(plan?.metaDescription)],
    ["Focus keyword added", Boolean(plan?.focusKeyword)],
    ["FAQ added", Boolean(plan?.faq?.length)],
    ["Smart analysis completed", Boolean(plan?.scores.functionality)]
  ];
  return (
    <Card className="p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-black text-slate-950">Publishing Readiness</h2>
          <p className="mt-1 text-sm text-slate-600">{getReadinessLabel(score)}</p>
        </div>
        <AdminScoreBadge score={score} />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([item, done]) => (
          <p key={String(item)} className="flex items-center gap-2 text-sm text-slate-600">
            {done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-slate-300" />} {item}
          </p>
        ))}
      </div>
    </Card>
  );
}
