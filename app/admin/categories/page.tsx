"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Eye, EyeOff, FileImage, FolderPlus, Globe2, Hash, Image, ListTree, Search, Sparkles, Tags, Text, Type } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminScoreBadge } from "@/components/admin/AdminScoreBadge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { mockCategories } from "@/lib/mockCategories";
import type { Category } from "@/types/category";

type CategoryForm = {
  name: string;
  slug: string;
  seoTitle: string;
  metaDescription: string;
  imageUrl: string;
  parentCategory: string;
  description: string;
  featured: boolean;
  visible: boolean;
};

const emptyCategoryForm: CategoryForm = {
  name: "",
  slug: "",
  seoTitle: "",
  metaDescription: "",
  imageUrl: "",
  parentCategory: "House Plans",
  description: "",
  featured: false,
  visible: true
};

const quickCategories = [
  "Duplex House Plans",
  "Two Story House Plans",
  "Bungalow House Plans",
  "Luxury Villa Plans"
];

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

function IconField({ label, icon: Icon, children }: { label: string; icon: typeof Tags; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span className="flex items-center gap-2"><Icon className="h-4 w-4 text-sky-600" /> {label}</span>
      {children}
    </label>
  );
}

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState(mockCategories);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<CategoryForm>(emptyCategoryForm);
  const [formError, setFormError] = useState("");
  const filtered = useMemo(() => rows.filter((cat) => `${cat.name} ${cat.slug}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);

  function setField<K extends keyof CategoryForm>(key: K, value: CategoryForm[K]) {
    setForm((current) => {
      if (key === "name") {
        const name = String(value);
        const currentAutoSlug = !current.slug || current.slug === slugify(current.name);
        return { ...current, name, slug: currentAutoSlug ? slugify(name) : current.slug };
      }
      return { ...current, [key]: value };
    });
    setFormError("");
  }

  function applyPreset(name: string) {
    const slug = slugify(name);
    setForm((current) => ({
      ...current,
      name,
      slug,
      seoTitle: `${name} | myfreehouseplans.com`,
      metaDescription: `Browse ${name.toLowerCase()} with free previews, PDF packs and editable CAD/Revit options.`,
      description: `Curated ${name.toLowerCase()} for homeowners, builders and design professionals.`
    }));
    setFormError("");
  }

  function addCategory() {
    if (!form.name.trim()) {
      setFormError("Category name is required.");
      return;
    }

    const slug = slugify(form.slug || form.name);
    if (!slug) {
      setFormError("Add a valid slug.");
      return;
    }

    if (rows.some((category) => category.slug === slug)) {
      setFormError("A category with this slug already exists.");
      return;
    }

    const nextCategory: Category = {
      id: `category-${Date.now()}`,
      name: form.name.trim(),
      slug,
      description: form.description.trim() || `Curated ${form.name.trim().toLowerCase()} for new plan listings.`,
      seoTitle: form.seoTitle.trim() || `${form.name.trim()} | myfreehouseplans.com`,
      metaDescription: form.metaDescription.trim() || `Browse ${form.name.trim().toLowerCase()} with free previews and professional files.`,
      imageUrl: form.imageUrl.trim(),
      parentCategory: form.parentCategory.trim() || "House Plans",
      planCount: 0,
      publishedCount: form.visible ? 0 : 0,
      draftCount: 0,
      featured: form.featured,
      visible: form.visible,
      seoScore: form.metaDescription.trim() && form.description.trim() ? 72 : 48
    };

    setRows((current) => [nextCategory, ...current]);
    setForm(emptyCategoryForm);
  }

  return (
    <div>
      <AdminPageHeader title="Categories" subtitle="Manage category landing pages, SEO metadata, images and publishing quality." />
      <div className="mb-6 grid gap-4 md:grid-cols-4">{rows.slice(0, 4).map((cat) => <Card key={cat.id} className="p-5"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-600"><Tags className="h-5 w-5" /></div><p className="font-bold text-slate-950">{cat.name}</p></div><p className="mt-3 text-3xl font-black text-sky-600">{cat.planCount}</p><p className="text-xs text-slate-500">{cat.publishedCount} published - {cat.draftCount} drafts</p></Card>)}</div>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-9" placeholder="Search categories..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Name", "Slug", "Plans", "Published", "Drafts", "SEO", "Featured", "Visible", "Actions"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">{filtered.map((cat) => <tr key={cat.id}><td className="px-4 py-3 font-semibold text-slate-950"><span className="flex items-center gap-2"><Tags className="h-4 w-4 text-sky-600" />{cat.name}</span></td><td className="px-4 py-3"><span className="flex items-center gap-2 text-slate-600"><Hash className="h-4 w-4 text-slate-400" />{cat.slug}</span></td><td className="px-4 py-3">{cat.planCount}</td><td className="px-4 py-3">{cat.publishedCount}</td><td className="px-4 py-3">{cat.draftCount}</td><td className="px-4 py-3"><AdminScoreBadge score={cat.seoScore ?? 60} /></td><td className="px-4 py-3">{cat.featured ? <span className="inline-flex items-center gap-1 text-amber-700"><Sparkles className="h-4 w-4" /> Yes</span> : "No"}</td><td className="px-4 py-3">{cat.visible === false ? <span className="inline-flex items-center gap-1 text-slate-500"><EyeOff className="h-4 w-4" /> Hidden</span> : <span className="inline-flex items-center gap-1 text-emerald-700"><Eye className="h-4 w-4" /> Visible</span>}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><AdminActionButton message="Category edit placeholder opened.">Edit</AdminActionButton><AdminActionButton message={cat.featured ? "Category unfeatured." : "Category marked featured."} onAction={() => setRows((current) => current.map((item) => item.id === cat.id ? { ...item, featured: !item.featured } : item))}>{cat.featured ? "Unfeature" : "Feature"}</AdminActionButton><AdminActionButton message={cat.visible === false ? "Category made visible." : "Category hidden."} onAction={() => setRows((current) => current.map((item) => item.id === cat.id ? { ...item, visible: item.visible === false } : item))}>{cat.visible === false ? "Show" : "Hide"}</AdminActionButton><AdminActionButton variant="danger" message="Category removed from this session." onAction={() => setRows((current) => current.filter((item) => item.id !== cat.id))}>Delete</AdminActionButton></div></td></tr>)}</tbody>
            </table>
          </div>
        </Card>
        <Card className="h-fit p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-50 text-sky-600"><FolderPlus className="h-5 w-5" /></div>
            <div>
              <h2 className="text-xl font-black text-slate-950">Add category</h2>
              <p className="text-xs font-semibold text-slate-500">Type a name, check the slug, save.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {quickCategories.map((name) => <button key={name} type="button" className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700" onClick={() => applyPreset(name)}>{name}</button>)}
          </div>
          <div className="mt-5 grid gap-4">
            <IconField label="Name" icon={Type}><Input value={form.name} placeholder="Duplex House Plans" onChange={(event) => setField("name", event.target.value)} /></IconField>
            <IconField label="Slug" icon={Hash}><Input value={form.slug} placeholder="duplex-house-plans" onChange={(event) => setField("slug", slugify(event.target.value))} /></IconField>
            <IconField label="SEO title" icon={Globe2}><Input value={form.seoTitle} placeholder="Duplex House Plans | myfreehouseplans.com" onChange={(event) => setField("seoTitle", event.target.value)} /></IconField>
            <IconField label="Meta description" icon={Text}><Input value={form.metaDescription} placeholder="Short Google description..." onChange={(event) => setField("metaDescription", event.target.value)} /></IconField>
            <IconField label="Image URL" icon={FileImage}><Input value={form.imageUrl} placeholder="https://..." onChange={(event) => setField("imageUrl", event.target.value)} /></IconField>
            <IconField label="Parent category" icon={ListTree}><Input value={form.parentCategory} onChange={(event) => setField("parentCategory", event.target.value)} /></IconField>
            <IconField label="Description" icon={Image}><Textarea value={form.description} placeholder="What this category contains..." onChange={(event) => setField("description", event.target.value)} /></IconField>
          </div>
          <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.featured} onChange={(event) => setField("featured", event.target.checked)} /> Featured category</label>
          <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.visible} onChange={(event) => setField("visible", event.target.checked)} /> Visible on public site</label>
          {formError ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{formError}</p> : null}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <AdminActionButton className="w-full sm:w-auto" message="Category saved in this browser session." onAction={addCategory}><FolderPlus className="h-4 w-4" /> Save Category</AdminActionButton>
            <AdminActionButton variant="outline" className="w-full sm:w-auto" message="Category form cleared." onAction={() => { setForm(emptyCategoryForm); setFormError(""); }}>Clear</AdminActionButton>
          </div>
        </Card>
      </div>
    </div>
  );
}
