import { Save, Settings2 } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

const sections = [
  { title: "Site Identity", fields: ["Site name", "Tagline", "Logo URL", "Favicon URL"] },
  { title: "Contact", fields: ["Email", "WhatsApp", "Phone", "Country", "Address"] },
  { title: "Social Links", fields: ["Facebook", "Instagram", "YouTube", "TikTok", "LinkedIn", "Pinterest"] },
  { title: "Default SEO", fields: ["Default title", "Default description", "Default Open Graph image", "Default keywords"] },
  { title: "Pack Settings", fields: ["Default free pack label", "Default premium pack label", "Default CAD/Revit pack label", "Default currency", "Default premium price", "Default CAD/Revit price"] }
];

export default function AdminSettingsPage() {
  return (
    <div>
      <AdminPageHeader title="Settings" subtitle="Central configuration placeholders for site identity, contact information, default SEO, pack labels and legal text." />
      <Card className="mb-5 border-sky-100 bg-sky-50/80 p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div><div className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-sky-700" /><h2 className="text-xl font-black text-slate-950">Configuration Control</h2></div><p className="mt-2 text-sm text-slate-700">Mock settings are grouped for future database-backed configuration, roles and audit logs.</p></div>
          <AdminActionButton variant="outline" className="w-full sm:w-auto" message="Configuration snapshot saved in this browser session."><Save className="h-4 w-4" /> Save snapshot</AdminActionButton>
        </div>
      </Card>
      <div className="grid gap-5">
        {sections.map((section) => (
          <Card key={section.title} className="p-6">
            <h2 className="text-xl font-black text-slate-950">{section.title}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {section.fields.map((field) => <label key={field} className="text-sm font-semibold text-slate-700">{field}<Input className="mt-2" placeholder={field === "Site name" ? "myfreehouseplans.com" : field} /></label>)}
            </div>
          </Card>
        ))}
        <Card className="p-6">
          <h2 className="text-xl font-black text-slate-950">Legal Text</h2>
          {["Before you build warning", "License note", "Refund note placeholder"].map((field) => <label key={field} className="mt-4 grid gap-2 text-sm font-semibold text-slate-700">{field}<Textarea defaultValue={field === "Before you build warning" ? "This plan must be reviewed and adapted by a local architect, engineer or qualified professional before construction." : ""} /></label>)}
        </Card>
      </div>
      <AdminActionButton className="mt-6 w-full sm:w-auto" message="Settings saved in MVP session mode.">Save Settings</AdminActionButton>
    </div>
  );
}
