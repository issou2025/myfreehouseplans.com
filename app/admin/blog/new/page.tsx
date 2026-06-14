"use client";

import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminFileUpload } from "@/components/admin/AdminFileUpload";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminScoreBadge } from "@/components/admin/AdminScoreBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Textarea";

export default function AdminNewBlogPage() {
  const tabs = [
    { label: "Content", content: <Card className="grid gap-5 p-6"><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Title<Input className="mt-2" /></label><label className="text-sm font-semibold text-slate-700">Slug<Input className="mt-2" /></label><label className="text-sm font-semibold text-slate-700">Category<Select className="mt-2"><option>House Plan Guides</option><option>Construction Cost</option><option>CAD / Revit / BIM</option><option>African House Plans</option></Select></label><label className="text-sm font-semibold text-slate-700">Status<Select className="mt-2"><option>Draft</option><option>Published</option></Select></label><label className="text-sm font-semibold text-slate-700">Author<Input className="mt-2" defaultValue="myfreehouseplans.com Editorial" /></label><label className="text-sm font-semibold text-slate-700">Reading time<Input className="mt-2" placeholder="7 min read" /></label></div><label className="grid gap-2 text-sm font-semibold text-slate-700">Excerpt<Textarea /></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Content<Textarea className="min-h-72" /></label><AdminFileUpload label="Cover image upload" description="Upload a blog cover image from your computer." accept=".jpg,.jpeg,.png,.webp,.avif" /><label className="grid gap-2 text-sm font-semibold text-slate-700">Cover image URL<Input /></label></Card> },
    { label: "SEO", content: <Card className="grid gap-4 p-6"><div className="flex justify-between"><h2 className="text-xl font-black text-slate-950">Blog SEO</h2><AdminScoreBadge score={64} /></div>{["SEO title", "Meta description", "Keywords", "Focus keyword"].map((field) => <label key={field} className="grid gap-2 text-sm font-semibold text-slate-700">{field}<Input /></label>)}</Card> },
    { label: "Related Plans", content: <Card className="grid gap-4 p-6"><h2 className="text-xl font-black text-slate-950">Related Plans</h2><label className="grid gap-2 text-sm font-semibold text-slate-700">Related plan IDs placeholder<Input placeholder="plan-001, plan-003" /></label></Card> },
    { label: "Publishing", content: <Card className="p-6"><h2 className="text-xl font-black text-slate-950">Publishing</h2><p className="mt-2 text-sm text-slate-600">Review title, cover image, excerpt, SEO fields and related plans before publishing.</p><div className="mt-5 flex flex-wrap gap-3"><AdminActionButton variant="outline" message="Blog draft saved in this browser session.">Save Draft</AdminActionButton><AdminActionButton message="Blog article published in MVP session mode.">Publish</AdminActionButton><Button href="/blog" variant="outline">Preview</Button></div></Card> }
  ];
  return <div><AdminPageHeader title="New Blog Post" subtitle="Create SEO-ready editorial content with related plans and publishing checks." /><Tabs tabs={tabs} /></div>;
}
