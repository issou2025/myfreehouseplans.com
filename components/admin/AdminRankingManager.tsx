"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Eye, Pencil, Pin, RotateCcw, Save } from "lucide-react";
import type { Plan } from "@/types/plan";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminScoreBadge } from "@/components/admin/AdminScoreBadge";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getStoredPlans, mergePlans, saveStoredPlans } from "@/lib/localPlanStore";
import { calculatePriorityScore, sortPlansForCatalog } from "@/lib/planRanking";
import { getPlanSeoScore, getReadinessScore } from "@/lib/adminMetrics";

function ToggleCell({ checked, label, onToggle }: { checked: boolean; label: string; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className={`focus-ring rounded-full px-3 py-1 text-xs font-black transition ${checked ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
      {checked ? label : "No"}
    </button>
  );
}

export function AdminRankingManager({ plans }: { plans: Plan[] }) {
  const [rows, setRows] = useState(plans);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [flag, setFlag] = useState("all");

  useEffect(() => {
    setRows(mergePlans(plans, getStoredPlans()));
    setHydrated(true);
  }, [plans]);

  useEffect(() => {
    if (hydrated) saveStoredPlans(rows);
  }, [hydrated, rows]);

  const categories = useMemo(() => Array.from(new Set(rows.map((plan) => plan.category))).sort(), [rows]);
  const published = useMemo(() => sortPlansForCatalog(rows), [rows]);
  const filtered = useMemo(() => {
    return published.filter((plan) => {
      const text = `${plan.title} ${plan.reference} ${plan.category}`.toLowerCase();
      return (
        text.includes(query.toLowerCase()) &&
        (category === "all" || plan.category === category) &&
        (flag === "all" || (flag === "featured" && plan.featured) || (flag === "popular" && plan.popular) || (flag === "new" && plan.isNew))
      );
    });
  }, [published, query, category, flag]);

  function updatePlan(id: string, updater: (plan: Plan) => Plan) {
    setRows((current) => current.map((plan) => plan.id === id ? updater(plan) : plan));
  }

  function setManualRank(id: string, value: string) {
    updatePlan(id, (plan) => ({ ...plan, manualRank: Math.max(1, Number(value) || 1), priorityScore: calculatePriorityScore(plan) }));
  }

  function move(id: string, direction: -1 | 1) {
    const ordered = sortPlansForCatalog(rows);
    const index = ordered.findIndex((plan) => plan.id === id);
    const target = ordered[index + direction];
    const source = ordered[index];
    if (!source || !target) return;
    const sourceRank = source.manualRank ?? index + 1;
    const targetRank = target.manualRank ?? index + direction + 1;
    setRows((current) => current.map((plan) => {
      if (plan.id === source.id) return { ...plan, manualRank: targetRank };
      if (plan.id === target.id) return { ...plan, manualRank: sourceRank };
      return plan;
    }));
  }

  function resetRanking() {
    setRows((current) => sortPlansForCatalog(current).map((plan, index) => ({ ...plan, manualRank: index + 1, homepageRank: index + 1, categoryRank: index + 1 })));
  }

  return (
    <div className="grid gap-5">
      <Card className="border-sky-100 bg-sky-50/80 p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-wide text-sky-700">Publishing intelligence</p>
            <h2 className="safe-break mt-1 text-2xl font-black text-slate-950">Plan display order is controlled, scored and reviewable.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">Public catalog order uses manual rank first, then priority score, then publish date. Draft and archived plans stay out of public ranking.</p>
          </div>
          <div className="grid gap-2 min-[420px]:grid-cols-2 sm:flex">
            <AdminActionButton message="Ranking settings saved in local MVP mode."><Save className="h-4 w-4" /> Save Ranking</AdminActionButton>
            <AdminActionButton variant="outline" message="Ranking reset to current intelligent order." onAction={resetRanking}><RotateCcw className="h-4 w-4" /> Reset</AdminActionButton>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-4">
          <Input placeholder="Search by title, reference, category..." value={query} onChange={(event) => setQuery(event.target.value)} />
          <Select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</Select>
          <Select value={flag} onChange={(event) => setFlag(event.target.value)}><option value="all">All flags</option><option value="featured">Featured</option><option value="popular">Popular</option><option value="new">New plans</option></Select>
          <Button href="/plans" variant="outline">Preview Public Order</Button>
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[1320px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>{["Image", "Title", "Reference", "Category", "Status", "Manual Rank", "Priority", "SEO", "Readiness", "Views", "Featured", "Popular", "New", "Homepage", "Category", "Actions"].map((head) => <th key={head} className="px-4 py-3 font-bold">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((plan) => (
                <tr key={plan.id} className="bg-white align-top hover:bg-sky-50/40">
                  <td className="px-4 py-4">{plan.mainImage ? <Image src={plan.mainImage} alt="" width={80} height={56} sizes="80px" className="h-14 w-20 rounded-md object-cover" /> : <div className="grid h-14 w-20 place-items-center rounded-md bg-slate-100 text-[10px] font-bold uppercase text-slate-400">No image</div>}</td>
                  <td className="px-4 py-4"><p className="max-w-72 font-bold text-slate-950">{plan.title}</p><p className="mt-1 text-xs text-slate-500">Published {plan.publishedAt ?? plan.createdAt ?? "not set"}</p></td>
                  <td className="px-4 py-4 font-semibold text-slate-700">{plan.reference}</td>
                  <td className="px-4 py-4 text-slate-600">{plan.category}</td>
                  <td className="px-4 py-4"><AdminStatusBadge status={plan.status} /></td>
                  <td className="px-4 py-4"><Input type="number" value={plan.manualRank ?? ""} onChange={(event) => setManualRank(plan.id, event.target.value)} className="w-24" /></td>
                  <td className="px-4 py-4"><AdminScoreBadge score={calculatePriorityScore(plan)} label="Priority" /></td>
                  <td className="px-4 py-4"><AdminScoreBadge score={getPlanSeoScore(plan)} label="SEO" /></td>
                  <td className="px-4 py-4"><AdminScoreBadge score={getReadinessScore(plan)} label="Ready" /></td>
                  <td className="px-4 py-4">{plan.views.toLocaleString()}</td>
                  <td className="px-4 py-4"><ToggleCell checked={Boolean(plan.featured)} label="Featured" onToggle={() => updatePlan(plan.id, (item) => ({ ...item, featured: !item.featured }))} /></td>
                  <td className="px-4 py-4"><ToggleCell checked={Boolean(plan.popular)} label="Popular" onToggle={() => updatePlan(plan.id, (item) => ({ ...item, popular: !item.popular }))} /></td>
                  <td className="px-4 py-4"><ToggleCell checked={Boolean(plan.isNew)} label="New" onToggle={() => updatePlan(plan.id, (item) => ({ ...item, isNew: !item.isNew }))} /></td>
                  <td className="px-4 py-4"><ToggleCell checked={plan.showOnHomepage !== false} label="Home" onToggle={() => updatePlan(plan.id, (item) => ({ ...item, showOnHomepage: item.showOnHomepage === false }))} /></td>
                  <td className="px-4 py-4"><ToggleCell checked={plan.showInCategory !== false} label="Category" onToggle={() => updatePlan(plan.id, (item) => ({ ...item, showInCategory: item.showInCategory === false }))} /></td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <AdminActionButton variant="outline" className="px-3" message="Plan moved up in ranking." onAction={() => move(plan.id, -1)}><ArrowUp className="h-4 w-4" /> Up</AdminActionButton>
                      <AdminActionButton variant="outline" className="px-3" message="Plan moved down in ranking." onAction={() => move(plan.id, 1)}><ArrowDown className="h-4 w-4" /> Down</AdminActionButton>
                      <AdminActionButton variant="premium" className="px-3" message="Plan pinned to homepage ranking." onAction={() => updatePlan(plan.id, (item) => ({ ...item, showOnHomepage: true, homepageRank: 1, featured: true }))}><Pin className="h-4 w-4" /> Pin</AdminActionButton>
                      <Button href={`/plans/${plan.slug}`} variant="outline" className="px-3"><Eye className="h-4 w-4" /> Preview</Button>
                      <Button href={`/admin/plans/${plan.id}/edit`} variant="outline" className="px-3"><Pencil className="h-4 w-4" /> Edit</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length ? (
                <tr>
                  <td colSpan={16} className="px-4 py-10 text-center">
                    <p className="text-lg font-black text-slate-950">No ranked plans found</p>
                    <p className="mt-1 text-sm text-slate-500">Published plans appear here. Adjust filters or publish a draft plan.</p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
