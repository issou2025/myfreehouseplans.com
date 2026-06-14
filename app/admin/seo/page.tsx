import { Bot, SearchCheck, Wand2 } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminScoreBadge } from "@/components/admin/AdminScoreBadge";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Card } from "@/components/ui/Card";
import { getMissingItems, getPlanSeoScore } from "@/lib/adminMetrics";
import { mockBlogPosts } from "@/lib/mockBlogPosts";
import { mockCategories } from "@/lib/mockCategories";
import { readPlans } from "@/lib/planData";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  const plans = await readPlans();
  const avg = Math.round(plans.reduce((sum, plan) => sum + getPlanSeoScore(plan), 0) / Math.max(plans.length, 1));
  const good = plans.filter((plan) => getPlanSeoScore(plan) >= 85);
  const work = plans.filter((plan) => getPlanSeoScore(plan) < 85);
  const rows = [
    ...plans.map((plan) => ({ type: "Plan", title: plan.title, score: getPlanSeoScore(plan), missing: getMissingItems(plan).join(", ") || "None" })),
    ...mockBlogPosts.map((post) => ({ type: "Blog", title: post.title, score: post.seoScore ?? 60, missing: post.metaDescription ? "None" : "Meta description" })),
    ...mockCategories.slice(0, 6).map((cat) => ({ type: "Category", title: cat.name, score: cat.seoScore ?? 60, missing: cat.metaDescription ? "None" : "Meta description" }))
  ];
  const ideas = ["Free 3 Bedroom House Plans PDF", "Modern House Plans for 20x20m / 66x66 ft Plot", "Small House Plans Under 100 m2 / 1,076 sq ft", "CAD House Plans with Revit Files", "Low Cost House Plans for Hot Climate", "African House Plans with Terrace"];
  return (
    <div>
      <AdminPageHeader title="SEO Center" subtitle="Find missing metadata, weak plan SEO and programmatic page opportunities before publishing at scale." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Average Plan SEO Score" value={`${avg}/100`} trend="Across all plans" icon={SearchCheck} />
        <AdminStatCard label="Plans With Good SEO" value={String(good.length)} trend="85+ score" icon={SearchCheck} />
        <AdminStatCard label="Plans Needing Work" value={String(work.length)} trend="Below 85 score" icon={SearchCheck} />
        <AdminStatCard label="Blog SEO Issues" value={String(mockBlogPosts.filter((p) => (p.seoScore ?? 0) < 85).length)} trend="Review articles" icon={SearchCheck} />
        <AdminStatCard label="Missing Alt Text" value={String(plans.filter((p) => !p.mainImageAlt).length)} trend="Image accessibility" icon={SearchCheck} />
      </div>
      <Card className="mt-6 border-sky-100 bg-sky-50/80 p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2"><Bot className="h-5 w-5 text-sky-700" /><h2 className="text-xl font-black text-slate-950">SEO Optimization Cockpit</h2></div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">Mock actions for generating titles, rewriting meta descriptions, finding internal links, adding alt text and creating programmatic SEO pages.</p>
          </div>
          <div className="grid gap-2 min-[420px]:grid-cols-2 lg:flex">
            <AdminActionButton variant="premium" className="w-full lg:w-auto" message="SEO fixes generated in MVP mode."><Wand2 className="h-4 w-4" /> Generate fixes</AdminActionButton>
            <AdminActionButton variant="outline" className="w-full lg:w-auto" message="SEO audit export prepared as a future CSV/PDF task.">Export SEO audit</AdminActionButton>
          </div>
        </div>
      </Card>
      <Card className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Content Type", "Title", "SEO Score", "Missing Items", "Action"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={`${row.type}-${row.title}`}><td className="px-4 py-3">{row.type}</td><td className="px-4 py-3 font-semibold text-slate-950">{row.title}</td><td className="px-4 py-3"><AdminScoreBadge score={row.score} /></td><td className="px-4 py-3">{row.missing}</td><td className="px-4 py-3"><AdminActionButton message="SEO improvement queued for this item.">Improve</AdminActionButton></td></tr>)}</tbody>
        </table>
      </Card>
      <Card className="mt-6 p-6"><h2 className="text-xl font-black text-slate-950">Programmatic SEO Page Ideas</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{ideas.map((idea) => <div key={idea} className="flex flex-col justify-between gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center"><p className="font-semibold text-slate-700">{idea}</p><AdminActionButton variant="outline" className="w-full sm:w-auto" message="SEO draft page added to the future content queue.">Create Draft</AdminActionButton></div>)}</div></Card>
    </div>
  );
}
