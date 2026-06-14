"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Archive, Copy, Eye, Pencil, Rocket, SearchCheck, ShieldCheck, Trash2, UploadCloud, Wand2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Plan } from "@/types/plan";
import type { PlanStatus } from "@/types/plan";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { getMissingItems, getPlanSeoScore, getReadinessScore } from "@/lib/adminMetrics";
import { getStoredPlans, mergePlans, saveStoredPlans } from "@/lib/localPlanStore";
import { generatePlanReference } from "@/lib/planReferences";
import { slugify } from "@/lib/slug";
import { AdminPackBadge } from "@/components/admin/AdminPackBadge";
import { AdminScoreBadge } from "@/components/admin/AdminScoreBadge";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatAreaDual, formatPlotDual } from "@/lib/unitFormat";

export function AdminPlanTable({ plans, compact = false }: { plans: Plan[]; compact?: boolean }) {
  const [rows, setRows] = useState(plans);
  const [hydrated, setHydrated] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [pack, setPack] = useState("all");
  const [missing, setMissing] = useState("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    setRows(mergePlans(plans, getStoredPlans()));
    setHydrated(true);
  }, [plans]);

  useEffect(() => {
    if (hydrated) saveStoredPlans(rows);
  }, [hydrated, rows]);

  const categories = Array.from(new Set(rows.map((plan) => plan.category))).sort();
  const qualityGates: Array<{ label: string; copy: string; Icon: LucideIcon }> = [
    { label: "SEO Gate", copy: "Title, description, keyword, alt text", Icon: SearchCheck },
    { label: "Media Gate", copy: "Main image, gallery, OG preview", Icon: UploadCloud },
    { label: "Pack Gate", copy: "Free PDF, premium URL, CAD URL", Icon: ShieldCheck },
    { label: "Publish Gate", copy: "Readiness score above 90", Icon: Rocket }
  ];

  const filtered = useMemo(() => {
    return rows
      .filter((plan) => {
        const text = `${plan.title} ${plan.reference} ${plan.category} ${plan.status}`.toLowerCase();
        const missingItems = getMissingItems(plan);
        return (
          text.includes(query.toLowerCase()) &&
          (status === "all" || plan.status.toLowerCase() === status) &&
          (category === "all" || plan.category === category) &&
          (pack === "all" || (pack === "free" && plan.freePackEnabled) || (pack === "premium" && plan.premiumPackEnabled) || (pack === "cad" && plan.cadPackEnabled)) &&
          (missing === "all" || missingItems.some((item) => item.toLowerCase().includes(missing)))
        );
      })
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        if (sort === "reference") return a.reference.localeCompare(b.reference);
        if (sort === "most-viewed") return b.views - a.views;
        if (sort === "readiness") return getReadinessScore(b) - getReadinessScore(a);
        if (sort === "oldest") return a.reference.localeCompare(b.reference);
        return b.reference.localeCompare(a.reference);
      });
  }, [rows, query, status, category, pack, missing, sort]);

  async function persistPlan(plan: Plan) {
    const response = await fetch("/api/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(plan) });
    return response.ok;
  }

  async function updatePlanStatus(id: string, nextStatus: PlanStatus) {
    const source = rows.find((plan) => plan.id === id);
    if (!source) return false;
    const updated = { ...source, status: nextStatus, updatedDate: "Updated now" };
    const saved = await persistPlan(updated);
    if (saved) setRows((current) => current.map((plan) => plan.id === id ? updated : plan));
    return saved;
  }

  async function duplicatePlan(id: string) {
    const source = rows.find((plan) => plan.id === id);
    if (!source) return false;
    const title = `${source.title} Copy`;
    const copy = { ...source, id: `plan-${Date.now()}`, title, slug: `${slugify(title)}-${Date.now().toString().slice(-4)}`, reference: generatePlanReference(rows), status: "Draft" as PlanStatus, updatedDate: "Updated now", updatedAt: new Date().toISOString().slice(0, 10) };
    const saved = await persistPlan(copy);
    if (saved) setRows((current) => [copy, ...current]);
    return saved;
  }

  async function deletePlan(id: string) {
    const response = await fetch("/api/plans", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (!response.ok) return false;
    setRows((current) => current.filter((plan) => plan.id !== id));
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
    return true;
  }

  async function applyBulkStatus(nextStatus: PlanStatus) {
    const results = await Promise.all(selectedIds.map((id) => updatePlanStatus(id, nextStatus)));
    return results.every(Boolean);
  }

  async function duplicateSelectedPlans() {
    const results = await Promise.all(selectedIds.map((id) => duplicatePlan(id)));
    return results.every(Boolean);
  }

  async function deleteSelectedPlans() {
    const results = await Promise.all(selectedIds.map((id) => deletePlan(id)));
    return results.every(Boolean);
  }

  return (
    <Card className="overflow-hidden">
      {!compact ? (
        <div className="grid gap-4 border-b border-slate-100 p-4">
          <div className="grid gap-3 lg:grid-cols-4">
            {qualityGates.map(({ label, copy, Icon }) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-3">
                <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-sky-600" /><p className="text-sm font-black text-slate-950">{label}</p></div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{copy}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Input placeholder="Search plans..." value={query} onChange={(event) => setQuery(event.target.value)} />
            <Select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></Select>
            <Select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</Select>
            <Select value={pack} onChange={(event) => setPack(event.target.value)}><option value="all">All packs</option><option value="free">Free</option><option value="premium">Premium</option><option value="cad">CAD/Revit</option></Select>
            <Select value={missing} onChange={(event) => setMissing(event.target.value)}><option value="all">All data</option><option value="image">Missing image</option><option value="seo">Missing SEO</option><option value="price">Missing price</option><option value="pdf">Missing PDF</option><option value="link">Missing Gumroad link</option></Select>
            <Select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="title">Title</option><option value="reference">Reference</option><option value="readiness">Readiness score</option><option value="most-viewed">Most viewed</option></Select>
          </div>
          <div className="grid gap-2 min-[420px]:grid-cols-2 md:flex md:flex-wrap">
            <AdminActionButton className="w-full md:w-auto" message={`${selectedIds.length} plan(s) published in this session.`} onAction={() => applyBulkStatus("Published")}>Publish selected</AdminActionButton>
            <AdminActionButton className="w-full md:w-auto" message={`${selectedIds.length} plan(s) moved to draft.`} onAction={() => applyBulkStatus("Draft")}>Move to draft</AdminActionButton>
            <AdminActionButton className="w-full md:w-auto" message={`${selectedIds.length} plan(s) archived.`} onAction={() => applyBulkStatus("Archived")}>Archive selected</AdminActionButton>
            <AdminActionButton className="w-full md:w-auto" message={`${selectedIds.length} selected plan(s) duplicated as drafts.`} onAction={duplicateSelectedPlans}>Duplicate selected</AdminActionButton>
            <AdminActionButton className="w-full md:w-auto" variant="premium" message="Mock AI SEO improvement queued."><Wand2 className="h-4 w-4" />AI improve SEO</AdminActionButton>
            <AdminActionButton className="w-full md:w-auto" message="Pack validation complete in MVP mode.">Validate packs</AdminActionButton>
            <AdminActionButton className="w-full md:w-auto" variant="danger" message={`${selectedIds.length} selected plan(s) deleted.`} onAction={deleteSelectedPlans}>Delete selected</AdminActionButton>
          </div>
        </div>
      ) : null}
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[1260px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              {["", "Image", "Title", "Reference", "Size", "Category", "Status", "Packs", "SEO Score", "Readiness", "Views", "Updated", "Actions"].map((head) => <th key={head} className="px-4 py-3 font-bold">{head}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((plan) => (
              <tr key={plan.id} className="bg-white align-top transition hover:bg-sky-50/40">
                <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(plan.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, plan.id] : current.filter((id) => id !== plan.id))} className="h-4 w-4 rounded border-slate-300" /></td>
                <td className="px-4 py-4">
                  {plan.mainImage ? <Image src={plan.mainImage} alt="" width={80} height={56} sizes="80px" className="h-14 w-20 rounded-md object-cover" /> : <div className="grid h-14 w-20 place-items-center rounded-md bg-slate-100 text-[10px] font-bold uppercase text-slate-400">No image</div>}
                </td>
                <td className="px-4 py-4"><p className="max-w-64 font-semibold text-slate-950">{plan.title}</p><p className="mt-1 text-xs text-slate-500">{getMissingItems(plan).length ? `Missing: ${getMissingItems(plan).join(", ")}` : "Complete enough for publishing"}</p></td>
                <td className="px-4 py-4 text-slate-600">{plan.reference}</td>
                <td className="px-4 py-4 text-slate-600"><p className="font-semibold text-slate-800">{formatAreaDual(plan.totalArea, true)}</p><p className="mt-1 text-xs">{formatPlotDual(plan.plotWidth, plan.plotLength, true)}</p></td>
                <td className="px-4 py-4 text-slate-600">{plan.category}</td>
                <td className="px-4 py-4"><AdminStatusBadge status={plan.status} /></td>
                <td className="px-4 py-4"><div className="flex flex-wrap gap-1">{plan.freePackEnabled ? <AdminPackBadge label="Free" /> : null}{plan.premiumPackEnabled ? <AdminPackBadge label="Premium" /> : null}{plan.cadPackEnabled ? <AdminPackBadge label="CAD/Revit" /> : null}</div></td>
                <td className="px-4 py-4"><AdminScoreBadge score={getPlanSeoScore(plan)} label={getPlanSeoScore(plan) >= 80 ? "SEO Good" : "SEO Missing"} /></td>
                <td className="px-4 py-4"><AdminScoreBadge score={getReadinessScore(plan)} label={getReadinessScore(plan) >= 80 ? "Ready" : "Incomplete"} /></td>
                <td className="px-4 py-4">{plan.views.toLocaleString()}</td>
                <td className="px-4 py-4">{plan.updatedDate}</td>
                <td className="px-4 py-4">
                  <div className="flex min-w-[24rem] flex-wrap gap-2">
                    <Button href={`/admin/plans/${plan.id}/edit`} variant="outline" className="px-3"><Pencil className="h-4 w-4" /> Edit</Button>
                    <Button href={`/plans/${plan.slug}`} variant="outline" className="px-3"><Eye className="h-4 w-4" /> Preview</Button>
                    <AdminActionButton variant="outline" className="px-3" message="Plan duplicated and persisted as a draft." onAction={() => duplicatePlan(plan.id)}><Copy className="h-4 w-4" /> Duplicate</AdminActionButton>
                    <AdminActionButton variant="outline" className="px-3" message={plan.status === "Published" ? "Plan moved to draft." : "Plan published."} onAction={() => updatePlanStatus(plan.id, plan.status === "Published" ? "Draft" : "Published")}><UploadCloud className="h-4 w-4" /> {plan.status === "Published" ? "Unpublish" : "Publish"}</AdminActionButton>
                    <AdminActionButton variant="outline" className="px-3" message="SEO check complete. Review score column for guidance."><SearchCheck className="h-4 w-4" /> SEO</AdminActionButton>
                    <AdminActionButton variant="outline" className="px-3" message="Plan archived and persisted." onAction={() => updatePlanStatus(plan.id, "Archived")}><Archive className="h-4 w-4" /> Archive</AdminActionButton>
                    <AdminActionButton variant="danger" className="px-3" message="Plan deletion requested." onAction={() => deletePlan(plan.id)}><Trash2 className="h-4 w-4" /> Delete</AdminActionButton>
                  </div>
                </td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td colSpan={13} className="px-4 py-10 text-center">
                  <p className="text-lg font-black text-slate-950">No plans match these filters</p>
                  <p className="mt-1 text-sm text-slate-500">Adjust the search, clear filters, or add a new plan to the catalog.</p>
                  <div className="mt-4"><Button href="/admin/plans/new">Add New Plan</Button></div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
