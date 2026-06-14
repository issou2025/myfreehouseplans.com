"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, Clipboard, Eye, Plus, RotateCcw, Trash2, Wand2 } from "lucide-react";
import type { Plan, PlanScores, PlanStatus } from "@/types/plan";
import { AdminFileUpload, type UploadedFile } from "@/components/admin/AdminFileUpload";
import { AdminReadinessChecklist } from "@/components/admin/AdminReadinessChecklist";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { getPlanSeoScore, getReadinessScore } from "@/lib/adminMetrics";
import { getStoredPlans, mergePlans, upsertStoredPlan } from "@/lib/localPlanStore";
import { mockCategories } from "@/lib/mockCategories";
import { mockPlans } from "@/lib/mockPlans";
import { calculatePriorityScore, calculateSmartScore } from "@/lib/planRanking";
import { generatePlanReference, getReferenceYear, isReferenceUnique, normalizePlanReference } from "@/lib/planReferences";
import { slugify } from "@/lib/slug";
import { formatAreaDual, formatLengthDual, formatPlotDual } from "@/lib/unitFormat";

type FeedbackTone = "success" | "error" | "warning" | "info";
type Feedback = { tone: FeedbackTone; message: string };

function Section({ number, title, helper, children }: { number: string; title: string; helper: string; children: ReactNode }) {
  return (
    <Card className="grid gap-5 p-4 sm:p-6">
      <div className="flex min-w-0 gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">{number}</span>
        <div className="min-w-0">
          <h2 className="safe-break text-xl font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{helper}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

function Field({ label, helper, children }: { label: string; helper?: string; children: ReactNode }) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-700">
      {label}
      {children}
      {helper ? <span className="text-xs font-normal leading-5 text-slate-500">{helper}</span> : null}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 shrink-0 rounded border-slate-300" />
      <span className="safe-break">{label}</span>
    </label>
  );
}

const featureOptions = ["Terrace", "Veranda", "Courtyard", "Garage", "Future extension", "Low cost", "Hot climate friendly", "Build in phases"];
const defaultFaq = [
  { question: "What is included in the free PDF?", answer: "The free PDF is a preview for first review and may be watermarked." },
  { question: "Can this plan be modified?", answer: "Yes. A local professional should adapt the plan to your land, budget and codes." },
  { question: "Can I use this plan directly for construction?", answer: "No. It must be reviewed by a qualified local architect or engineer before construction." }
];

function createBlankPlan(existingPlans: Plan[]): Plan {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: `plan-${Date.now()}`,
    title: "",
    slug: "",
    reference: generatePlanReference(existingPlans),
    shortDescription: "",
    description: "",
    category: "",
    tags: [],
    totalArea: 0,
    builtArea: 0,
    livingArea: 0,
    plotWidth: 0,
    plotLength: 0,
    minimumPlotWidth: 0,
    minimumPlotLength: 0,
    bedrooms: 0,
    bathrooms: 0,
    livingRooms: 1,
    kitchens: 1,
    floors: 1,
    roofType: "",
    architecturalStyle: "",
    foundationType: "",
    structureType: "",
    constructionDifficulty: "Medium",
    climateTags: [],
    features: [],
    mainImage: "",
    galleryImages: [],
    freePackEnabled: true,
    premiumPackEnabled: true,
    cadPackEnabled: false,
    freePdfUrl: "",
    premiumUrl: "",
    cadUrl: "",
    premiumPdfUrl: "",
    premiumZipUrl: "",
    dwgFileUrl: "",
    revitFileUrl: "",
    ifcFileUrl: "",
    cadZipUrl: "",
    premiumPrice: 9.99,
    cadPrice: 29.99,
    currency: "USD",
    badges: [],
    scores: { functionality: 80, comfort: 75, constructionSimplicity: 75, costEfficiency: 75, hotClimateAdaptation: 75, futureExtension: 70, naturalVentilation: 75, familySuitability: 75 },
    bestFor: [],
    beCareful: [],
    seoTitle: "",
    seoDescription: "",
    metaDescription: "",
    focusKeyword: "",
    faq: defaultFaq,
    status: "Draft",
    views: 0,
    featured: false,
    popular: false,
    isNew: true,
    showOnHomepage: true,
    showInCategory: true,
    manualRank: existingPlans.length + 1,
    categoryRank: existingPlans.length + 1,
    homepageRank: existingPlans.length + 1,
    createdAt: today,
    updatedAt: today,
    updatedDate: "Updated now"
  };
}

function textToList(value: string) {
  return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

function listToText(value?: string[]) {
  return value?.join("\n") ?? "";
}

function updateScore(scores: PlanScores, key: keyof PlanScores, value: string): PlanScores {
  return { ...scores, [key]: Math.max(0, Math.min(100, Number(value) || 0)) };
}

function readinessLabel(score: number) {
  if (score >= 92) return "Excellent";
  if (score >= 80) return "Ready";
  if (score >= 55) return "Good Enough to Publish";
  return "Incomplete";
}

export function AdminPlanForm({ plan, planId }: { plan?: Plan; planId?: string }) {
  const [allPlans, setAllPlans] = useState<Plan[]>(mockPlans);
  const [form, setForm] = useState<Plan>(() => plan ? { ...plan, reference: normalizePlanReference(plan.reference) } : createBlankPlan(mockPlans));
  const [initialForm, setInitialForm] = useState<Plan>(form);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [quickMode, setQuickMode] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadPlans() {
      try {
        const response = await fetch("/api/plans", { cache: "no-store" });
        const payload = (await response.json()) as { success?: boolean; data?: { plans?: Plan[] } };
        const serverPlans = payload.data?.plans ?? [];
        const merged = mergePlans(serverPlans.length ? serverPlans : mockPlans, getStoredPlans());
        const found = planId ? merged.find((item) => item.id === planId) : undefined;
        const next = found ?? (plan ? { ...plan, reference: normalizePlanReference(plan.reference) } : createBlankPlan(merged));
        if (!active) return;
        setAllPlans(merged);
        setForm(next);
        setInitialForm(next);
      } catch {
        const merged = mergePlans(mockPlans, getStoredPlans());
        const next = plan ? { ...plan, reference: normalizePlanReference(plan.reference) } : createBlankPlan(merged);
        if (!active) return;
        setAllPlans(merged);
        setForm(next);
        setInitialForm(next);
      }
    }
    loadPlans();
    return () => { active = false; };
  }, [plan, planId]);

  const categories = useMemo(() => mockCategories.map((category) => category.name), []);
  const referenceIsUnique = isReferenceUnique(form.reference, allPlans, form.id);
  const normalizedReference = normalizePlanReference(form.reference);
  const readiness = getReadinessScore(form);
  const publicHref = form.slug ? `/plans/${form.slug}` : "/plans";
  const feedbackClasses: Record<FeedbackTone, string> = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-sky-200 bg-sky-50 text-sky-800"
  };

  function setField<K extends keyof Plan>(key: K, value: Plan[K]) {
    setForm((current) => ({ ...current, [key]: value, updatedAt: new Date().toISOString().slice(0, 10), updatedDate: "Updated now" }));
  }

  function setUpload(key: keyof Plan, files: UploadedFile[]) {
    const value = files.map((file) => file.url).join(", ");
    if (key === "galleryImages") {
      setField("galleryImages", files.map((file) => file.url));
      return;
    }
    setField(key, value as Plan[typeof key]);
    setFeedback({ tone: "success", message: "Upload saved to this plan." });
  }

  function validateForSave(nextStatus: PlanStatus) {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!form.title.trim()) errors.push("Title is required.");
    if (!form.slug.trim()) errors.push("Slug is required.");
    if (!form.reference.trim()) errors.push("Reference is required.");
    if (!referenceIsUnique) errors.push("Reference already exists.");
    if (nextStatus === "Published" && !form.category) errors.push("Category is required before publishing.");
    if (nextStatus === "Published" && !form.mainImage) warnings.push("Main image is recommended.");
    if (nextStatus === "Published" && !form.description) warnings.push("Description is recommended.");
    if (nextStatus === "Published" && !form.seoTitle) warnings.push("SEO title is recommended.");
    if (nextStatus === "Published" && !form.seoDescription) warnings.push("Meta description is recommended.");
    if (nextStatus === "Published" && !form.freePackEnabled && !form.premiumPackEnabled && !form.cadPackEnabled) warnings.push("At least one pack is recommended.");
    return { errors, warnings };
  }

  async function savePlan(nextStatus: PlanStatus) {
    const { errors, warnings } = validateForSave(nextStatus);
    if (errors.length) {
      setFeedback({ tone: "error", message: errors.join(" ") });
      return;
    }

    const rankedBase: Plan = {
      ...form,
      slug: form.slug || slugify(form.title),
      reference: normalizedReference,
      status: nextStatus,
      publishedAt: nextStatus === "Published" ? new Date().toISOString().slice(0, 10) : form.publishedAt,
      premiumUrl: form.premiumUrl || form.premiumPdfUrl || "",
      cadUrl: form.cadUrl || form.cadZipUrl || "",
      metaDescription: form.seoDescription,
      badges: [
        ...(form.freePackEnabled ? ["Free Preview"] : []),
        ...(form.premiumPackEnabled ? ["Premium PDF"] : []),
        ...(form.cadPackEnabled ? ["DWG", "Revit"] : []),
        ...(form.features ?? [])
      ]
    };
    const saved: Plan = {
      ...rankedBase,
      smartScore: calculateSmartScore(rankedBase),
      seoScore: getPlanSeoScore(rankedBase),
      readinessScore: getReadinessScore(rankedBase),
      priorityScore: calculatePriorityScore(rankedBase)
    };
    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saved)
      });
      const data = (await response.json()) as { success?: boolean; message?: string; errors?: Record<string, string> };
      if (!response.ok || !data.success) {
        setFeedback({ tone: "error", message: data.message ?? "Server could not save this plan." });
        return;
      }
    } catch {
      setFeedback({ tone: "error", message: "The server could not persist this plan. Check the database configuration and try again." });
      return;
    }
    const nextPlans = upsertStoredPlan(saved, mockPlans);
    setAllPlans(nextPlans);
    setForm(saved);
    setInitialForm(saved);
    setFeedback({
      tone: warnings.length ? "warning" : "success",
      message: nextStatus === "Published"
        ? `Plan published and persisted successfully. ${warnings.join(" ")}`
        : "Draft saved successfully."
    });
  }

  function regenerateReference() {
    const year = getReferenceYear(form.reference);
    setField("reference", generatePlanReference(allPlans.filter((item) => item.id !== form.id), year));
    setFeedback({ tone: "success", message: "A new unique reference was generated." });
  }

  function copyReference() {
    navigator.clipboard?.writeText(normalizedReference);
    setFeedback({ tone: "success", message: "Reference copied." });
  }

  function generateSeo() {
    setField("seoTitle", form.title ? `${form.title} | PDF DWG Revit House Plan` : "");
    setField("seoDescription", form.shortDescription || form.description.slice(0, 155));
    setField("focusKeyword", form.title.toLowerCase());
    setField("mainImageAlt", form.title ? `${form.title} exterior preview` : "");
    setFeedback({ tone: "success", message: "SEO fields generated from the plan title and description." });
  }

  const checklist = [
    ["Title", Boolean(form.title)],
    ["Reference", Boolean(form.reference) && referenceIsUnique],
    ["Category", Boolean(form.category)],
    ["Main image", Boolean(form.mainImage)],
    ["Description", Boolean(form.description)],
    ["At least one pack", form.freePackEnabled || form.premiumPackEnabled || form.cadPackEnabled],
    ["SEO title", Boolean(form.seoTitle)],
    ["Meta description", Boolean(form.seoDescription)]
  ] as const;

  return (
    <div className="grid gap-5 pb-24 sm:pb-6">
      <Card className="sticky top-[88px] z-30 border-sky-100 bg-white/95 p-3 shadow-[0_18px_60px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid gap-2 sm:grid-cols-4">
            <div><p className="text-xs font-bold uppercase text-slate-500">Reference</p><p className="safe-break font-black text-slate-950">{normalizedReference}</p></div>
            <div><p className="text-xs font-bold uppercase text-slate-500">Status</p><p className="font-black text-slate-950">{form.status}</p></div>
            <div><p className="text-xs font-bold uppercase text-slate-500">Readiness</p><p className="font-black text-sky-700">{readiness}% - {readinessLabel(readiness)}</p></div>
            <div><p className="text-xs font-bold uppercase text-slate-500">Time</p><p className="font-black text-emerald-700">Under 12 minutes</p></div>
          </div>
          <div className="grid gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap">
            <Button type="button" variant="outline" onClick={() => savePlan("Draft")}>Save Draft</Button>
            <Button href={publicHref} variant="secondary"><Eye className="h-4 w-4" /> Preview</Button>
            <Button type="button" onClick={() => savePlan("Published")}>Publish Now</Button>
            {form.status === "Published" ? <Button href={publicHref} variant="outline">View Public Page</Button> : null}
          </div>
        </div>
      </Card>

      {feedback ? <div className={`rounded-2xl border p-4 text-sm font-semibold ${feedbackClasses[feedback.tone]}`}>{feedback.message}</div> : null}

      <Card className="border-emerald-100 bg-emerald-50/80 p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-emerald-700">Quick Publish Mode</p>
            <h2 className="safe-break mt-1 text-2xl font-black text-slate-950">Add title, category, image, file, price, then publish.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">Estimated publishing time: under 12 minutes. Advanced fields remain available below.</p>
          </div>
          <Toggle label="Quick mode" checked={quickMode} onChange={setQuickMode} />
        </div>
      </Card>

      <Section number="1" title="Essential Information" helper="Start here. These fields are the only critical fields required to publish.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Plan title" helper="Use a clear title like Modern 3 Bedroom House Plan for 20x20m / 66x66 ft Plot."><Input value={form.title} onChange={(event) => { setField("title", event.target.value); if (!form.slug) setField("slug", slugify(event.target.value)); }} /></Field>
          <Field label="Slug" helper="Auto-generated from title. You can edit it if needed."><div className="grid gap-2 sm:grid-cols-[1fr_auto]"><Input value={form.slug} onChange={(event) => setField("slug", slugify(event.target.value))} /><Button type="button" variant="outline" onClick={() => setField("slug", slugify(form.title))}><Wand2 className="h-4 w-4" /> Generate</Button></div></Field>
          <Field label="Reference" helper="This reference is generated automatically and must be unique."><div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]"><Input value={form.reference} onChange={(event) => setField("reference", normalizePlanReference(event.target.value))} className={referenceIsUnique ? "" : "border-red-300"} /><Button type="button" variant="outline" onClick={regenerateReference}>Regenerate</Button><Button type="button" variant="outline" onClick={copyReference}><Clipboard className="h-4 w-4" /> Copy</Button></div></Field>
          <Field label="Category" helper="Choose the main category where this plan should appear."><Select value={form.category} onChange={(event) => setField("category", event.target.value)}><option value="">Select category</option>{categories.map((category) => <option key={category}>{category}</option>)}</Select></Field>
          <Field label="Status"><Select value={form.status} onChange={(event) => setField("status", event.target.value as PlanStatus)}><option>Draft</option><option>Published</option><option>Archived</option></Select></Field>
          <Field label="Short description"><Textarea value={form.shortDescription} onChange={(event) => setField("shortDescription", event.target.value)} /></Field>
        </div>
        <Field label="Full description"><Textarea className="min-h-36" value={form.description} onChange={(event) => setField("description", event.target.value)} /></Field>
      </Section>

      <Section number="2" title="Images" helper="The main image appears first in catalog cards and on the public plan page.">
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminFileUpload label="Upload Main Image" description="This image appears first on catalog and detail pages." accept=".jpg,.jpeg,.png,.webp,.avif" value={form.mainImage} onUploaded={(files) => setUpload("mainImage", files)} />
          <AdminFileUpload label="Upload Gallery Images" description="Upload floor plans, elevations, sections, roof plans, technical details, interiors and exterior views. Every image appears automatically in the customer preview gallery." accept=".jpg,.jpeg,.png,.webp,.avif" multiple value={form.galleryImages.join(", ")} onUploaded={(files) => setUpload("galleryImages", files)} />
          <AdminFileUpload label="Upload Floor Plan Image" accept=".jpg,.jpeg,.png,.webp,.avif" value={form.floorPlanImage} onUploaded={(files) => setUpload("floorPlanImage", files)} />
          <AdminFileUpload label="Upload 3D View Image" accept=".jpg,.jpeg,.png,.webp,.avif" value={form.threeDImage ?? form.threeDViewImage} onUploaded={(files) => setUpload("threeDImage", files)} />
        </div>
      </Section>

      <Section number="3" title="Files and Packs" helper="Enable the packs you want to sell or offer. Important upload buttons are always visible.">
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="grid gap-4 p-4">
            <Toggle label="Enable Free Preview Pack" checked={form.freePackEnabled} onChange={(checked) => setField("freePackEnabled", checked)} />
            <AdminFileUpload label="Upload Free PDF" description="This file is downloadable by visitors." accept=".pdf" value={form.freePdfUrl} onUploaded={(files) => setUpload("freePdfUrl", files)} />
            <Field label="Button label"><Input value={form.freePackDescription ?? "Download Free PDF"} onChange={(event) => setField("freePackDescription", event.target.value)} /></Field>
          </Card>
          <Card className="grid gap-4 border-amber-100 bg-amber-50/50 p-4">
            <Toggle label="Enable Premium PDF Pack" checked={form.premiumPackEnabled} onChange={(checked) => setField("premiumPackEnabled", checked)} />
            <Field label="Premium price"><Input type="number" value={form.premiumPrice} onChange={(event) => setField("premiumPrice", Number(event.target.value))} /></Field>
            <AdminFileUpload label="Upload Premium PDF or ZIP" accept=".pdf,.zip" value={form.premiumPdfUrl || form.premiumZipUrl} onUploaded={(files) => { setUpload(files[0]?.name.toLowerCase().endsWith(".zip") ? "premiumZipUrl" : "premiumPdfUrl", files); }} />
            <Field label="Payment link placeholder" helper="Use this field for Gumroad, payment link, or future checkout URL."><Input value={form.premiumUrl} onChange={(event) => setField("premiumUrl", event.target.value)} /></Field>
          </Card>
          <Card className="grid gap-4 border-violet-100 bg-violet-50/50 p-4">
            <Toggle label="Enable CAD/Revit Pack" checked={form.cadPackEnabled} onChange={(checked) => setField("cadPackEnabled", checked)} />
            <Field label="CAD/Revit price"><Input type="number" value={form.cadPrice} onChange={(event) => setField("cadPrice", Number(event.target.value))} /></Field>
            <AdminFileUpload label="Upload DWG / Revit / IFC / ZIP" accept=".dwg,.dxf,.rvt,.ifc,.zip" value={form.cadZipUrl || form.dwgFileUrl || form.revitFileUrl || form.ifcFileUrl} onUploaded={(files) => setUpload("cadZipUrl", files)} />
            <Field label="Payment link placeholder"><Input value={form.cadUrl} onChange={(event) => setField("cadUrl", event.target.value)} /></Field>
          </Card>
        </div>
      </Section>

      <Section number="4" title="Technical Details" helper="Enter metric values as the source of truth. The admin preview shows feet and square feet for American buyers.">
        <div className="grid gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm font-semibold text-slate-700 sm:grid-cols-3">
          <p><span className="block text-xs uppercase text-sky-700">Total area</span>{formatAreaDual(form.totalArea || 0)}</p>
          <p><span className="block text-xs uppercase text-sky-700">Plot size</span>{formatPlotDual(form.plotWidth || 0, form.plotLength || 0)}</p>
          <p><span className="block text-xs uppercase text-sky-700">Quick US sense</span>{formatLengthDual(form.plotWidth || 0)} wide</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Total area, m2" helper={`${formatAreaDual(form.totalArea || 0)} shown publicly.`}><Input type="number" value={form.totalArea} onChange={(event) => setField("totalArea", Number(event.target.value))} /></Field>
          <Field label="Plot width, m" helper={`${formatLengthDual(form.plotWidth || 0)} shown publicly.`}><Input type="number" value={form.plotWidth} onChange={(event) => setField("plotWidth", Number(event.target.value))} /></Field>
          <Field label="Plot length, m" helper={`${formatLengthDual(form.plotLength || 0)} shown publicly.`}><Input type="number" value={form.plotLength} onChange={(event) => setField("plotLength", Number(event.target.value))} /></Field>
          <Field label="Bedrooms"><Input type="number" value={form.bedrooms} onChange={(event) => setField("bedrooms", Number(event.target.value))} /></Field>
          <Field label="Bathrooms"><Input type="number" value={form.bathrooms} onChange={(event) => setField("bathrooms", Number(event.target.value))} /></Field>
          <Field label="Floors"><Input type="number" value={form.floors} onChange={(event) => setField("floors", Number(event.target.value))} /></Field>
          <Field label="Roof type"><Input value={form.roofType} onChange={(event) => setField("roofType", event.target.value)} /></Field>
          <Field label="Architectural style"><Input value={form.architecturalStyle} onChange={(event) => setField("architecturalStyle", event.target.value)} /></Field>
          <Field label="Construction difficulty"><Select value={form.constructionDifficulty ?? "Medium"} onChange={(event) => setField("constructionDifficulty", event.target.value as Plan["constructionDifficulty"])}><option>Easy</option><option>Medium</option><option>Advanced</option></Select></Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{featureOptions.map((feature) => <Toggle key={feature} label={feature} checked={form.features?.includes(feature) ?? false} onChange={(checked) => setField("features", checked ? [...(form.features ?? []), feature] : (form.features ?? []).filter((item) => item !== feature))} />)}</div>
        {!quickMode ? (
          <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer font-bold text-slate-950">Advanced details</summary>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Foundation type"><Input value={form.foundationType} onChange={(event) => setField("foundationType", event.target.value)} /></Field>
              <Field label="Structure type"><Input value={form.structureType} onChange={(event) => setField("structureType", event.target.value)} /></Field>
              <Field label="Built area, m2" helper={`${formatAreaDual(form.builtArea || 0)} shown publicly when used.`}><Input type="number" value={form.builtArea} onChange={(event) => setField("builtArea", Number(event.target.value))} /></Field>
              <Field label="Living rooms"><Input type="number" value={form.livingRooms} onChange={(event) => setField("livingRooms", Number(event.target.value))} /></Field>
            </div>
          </details>
        ) : null}
      </Section>

      <Section number="5" title="SEO Quick Setup" helper="Good SEO helps people find this plan on Google. You can generate fields quickly.">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button type="button" variant="outline" onClick={generateSeo}><Wand2 className="h-4 w-4" /> Generate SEO from plan title</Button>
          <Button type="button" variant="outline" onClick={() => setField("seoTitle", form.title)}>Copy title to SEO title</Button>
          <Button type="button" variant="outline" onClick={() => setField("seoDescription", form.shortDescription)}>Copy short description</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={`SEO title (${(form.seoTitle ?? "").length}/60)`}><Input value={form.seoTitle ?? ""} onChange={(event) => setField("seoTitle", event.target.value)} /></Field>
          <Field label="Focus keyword"><Input value={form.focusKeyword ?? ""} onChange={(event) => setField("focusKeyword", event.target.value)} /></Field>
          <Field label={`Meta description (${(form.seoDescription ?? "").length}/160)`}><Textarea value={form.seoDescription ?? ""} onChange={(event) => setField("seoDescription", event.target.value)} /></Field>
          <Field label="Image alt text"><Textarea value={form.mainImageAlt ?? ""} onChange={(event) => setField("mainImageAlt", event.target.value)} /></Field>
        </div>
        <p className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">SEO score: {getPlanSeoScore(form)}%. {!form.seoTitle || !form.seoDescription ? "Missing SEO fields can be improved later." : "SEO basics look ready."}</p>
      </Section>

      {!quickMode ? (
        <>
          <Section number="6" title="Smart Analysis Optional" helper="Helpful buyer guidance. These fields improve trust but do not block publishing.">
            <div className="grid gap-4 md:grid-cols-5">
              {([
                ["functionality", "Functionality"],
                ["comfort", "Comfort"],
                ["costEfficiency", "Cost efficiency"],
                ["hotClimateAdaptation", "Hot climate"],
                ["futureExtension", "Future extension"]
              ] as Array<[keyof PlanScores, string]>).map(([key, label]) => <Field key={key} label={label}><Input type="number" value={Number(form.scores[key]) || 0} onChange={(event) => setField("scores", updateScore(form.scores, key, event.target.value))} /></Field>)}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Best for"><Textarea value={listToText(form.bestFor)} onChange={(event) => setField("bestFor", textToList(event.target.value))} /></Field>
              <Field label="Be careful"><Textarea value={listToText(form.beCareful)} onChange={(event) => setField("beCareful", textToList(event.target.value))} /></Field>
            </div>
          </Section>

          <Section number="7" title="FAQ Optional" helper="Three default FAQ blocks are ready. Add or remove as needed.">
            <div className="grid gap-4">
              {(form.faq ?? []).map((faq, index) => (
                <Card key={index} className="grid gap-3 p-4">
                  <Field label={`Question ${index + 1}`}><Input value={faq.question} onChange={(event) => setField("faq", (form.faq ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, question: event.target.value } : item))} /></Field>
                  <Field label="Answer"><Textarea value={faq.answer} onChange={(event) => setField("faq", (form.faq ?? []).map((item, itemIndex) => itemIndex === index ? { ...item, answer: event.target.value } : item))} /></Field>
                  <Button type="button" variant="danger" className="w-full sm:w-auto" onClick={() => setField("faq", (form.faq ?? []).filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="h-4 w-4" /> Remove FAQ</Button>
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={() => setField("faq", [...(form.faq ?? []), { question: "", answer: "" }])}><Plus className="h-4 w-4" /> Add FAQ</Button>
            </div>
          </Section>
        </>
      ) : null}

      <Section number={quickMode ? "6" : "8"} title="Final Check and Publish" helper="Only title, slug, unique reference and category block publishing. Everything else is a warning.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {checklist.map(([label, complete]) => (
            <p key={label} className={`flex items-center gap-2 rounded-2xl p-3 text-sm font-bold ${complete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}><CheckCircle2 className="h-4 w-4" /> {label}</p>
          ))}
        </div>
        <AdminReadinessChecklist plan={form} />
        <div className="grid gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap">
          <Button type="button" variant="outline" onClick={() => savePlan("Draft")}>Save Draft</Button>
          <Button href={publicHref} variant="secondary">Preview</Button>
          <Button type="button" onClick={() => savePlan("Published")}>Publish Now</Button>
          <Button type="button" variant="danger" onClick={() => { setForm(initialForm); setFeedback({ tone: "info", message: "Form reset to the last saved values." }); }}><RotateCcw className="h-4 w-4" /> Reset</Button>
        </div>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-18px_50px_rgba(15,23,42,0.16)] backdrop-blur sm:hidden">
        <div className="grid grid-cols-3 gap-2">
          <Button type="button" variant="outline" className="px-2" onClick={() => savePlan("Draft")}>Save</Button>
          <Button href={publicHref} variant="secondary" className="px-2">Preview</Button>
          <Button type="button" className="px-2" onClick={() => savePlan("Published")}>Publish</Button>
        </div>
      </div>
    </div>
  );
}
