import type { Plan } from "@/types/plan";
import { getPlanSeoScore } from "@/lib/adminMetrics";
import { AdminScoreBadge } from "@/components/admin/AdminScoreBadge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function AdminSeoPanel({ plan }: { plan?: Plan }) {
  const title = plan?.seoTitle ?? "";
  const description = plan?.metaDescription ?? "";
  const warnings = [
    !description ? "Missing meta description" : "",
    title.length > 0 && title.length < 45 ? "SEO title too short" : "",
    !plan?.focusKeyword ? "No focus keyword" : "",
    !plan?.mainImageAlt ? "Missing alt text" : "",
    (plan?.description.length ?? 0) < 150 ? "Description too short" : ""
  ].filter(Boolean);
  return (
    <Card className="p-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-black text-slate-950">SEO Panel</h2>
          <p className="mt-1 text-sm text-slate-600">Complete metadata for search previews and social sharing.</p>
        </div>
        <AdminScoreBadge score={plan ? getPlanSeoScore(plan) : 42} label="SEO" />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">SEO title <span className="font-normal text-slate-400">({title.length}/60)</span><Input className="mt-2" defaultValue={title} /></label>
        <label className="text-sm font-semibold text-slate-700">Focus keyword<Input className="mt-2" defaultValue={plan?.focusKeyword} /></label>
        <label className="text-sm font-semibold text-slate-700 md:col-span-2">Meta description <span className="font-normal text-slate-400">({description.length}/160)</span><Textarea className="mt-2" defaultValue={description} /></label>
        {["SEO keywords", "Canonical URL", "Open Graph title", "Open Graph description", "Open Graph image", "Twitter title", "Twitter description", "Twitter image", "Secondary keywords"].map((field) => (
          <label key={field} className="text-sm font-semibold text-slate-700">{field}<Input className="mt-2" defaultValue={field === "Canonical URL" ? plan?.canonicalUrl : ""} /></label>
        ))}
      </div>
      <div className="mt-5 rounded-lg bg-slate-50 p-4">
        <p className="font-bold text-slate-950">Warnings</p>
        <div className="mt-2 grid gap-1 text-sm text-slate-600">{warnings.length ? warnings.map((warning) => <p key={warning}>- {warning}</p>) : <p>No major SEO warnings.</p>}</div>
      </div>
    </Card>
  );
}
