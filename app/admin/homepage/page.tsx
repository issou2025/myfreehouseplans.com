import { LayoutTemplate, PlusCircle } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ControlShell, EditableRow, MockField } from "@/components/admin/AdminControlTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { homepageSections } from "@/lib/mockSiteControls";

export default function AdminHomepageBuilderPage() {
  const visible = homepageSections.filter((section) => section.status === "Visible").length;

  return (
    <div className="grid gap-6">
      <AdminPageHeader title="Homepage Builder" subtitle="Control hero copy, section visibility, CTAs, order and featured content placeholders for the public homepage." actions={<Button href="/" variant="outline">Preview Homepage</Button>} />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5"><LayoutTemplate className="h-6 w-6 text-sky-600" /><p className="mt-3 text-sm font-semibold text-slate-500">Homepage sections</p><p className="mt-1 text-3xl font-black text-slate-950">{homepageSections.length}</p></Card>
        <Card className="p-5"><p className="text-sm font-semibold text-slate-500">Visible sections</p><p className="mt-1 text-3xl font-black text-emerald-600">{visible}</p></Card>
        <Card className="p-5"><p className="text-sm font-semibold text-slate-500">Draft controls</p><p className="mt-1 text-3xl font-black text-amber-600">Mock</p></Card>
      </div>
      <ControlShell title="Homepage Sections" description="Use these controls as the future data model for a database-backed homepage CMS.">
        <div className="grid gap-4">
          {homepageSections.map((section) => (
            <EditableRow key={section.id} title={section.name} subtitle={section.subtitle} status={section.status} order={section.order}>
              <MockField label="Section title" value={section.title} />
              <MockField label="CTA" value={`${section.ctaLabel} -> ${section.ctaUrl}`} />
            </EditableRow>
          ))}
        </div>
      </ControlShell>
      <Card className="p-5">
        <h2 className="text-xl font-black text-slate-950">Featured Item Slots</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">Placeholder controls for assigning featured plans, categories, tools and blog posts to homepage sections.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">{["Hero plan", "Featured plans", "Featured categories", "Latest guides"].map((slot) => <AdminActionButton key={slot} variant="outline" message={`${slot} slot saved in MVP mode.`}><PlusCircle className="h-4 w-4" /> {slot}</AdminActionButton>)}</div>
      </Card>
    </div>
  );
}
