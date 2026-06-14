import { FileText, ShieldAlert } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ControlShell, EditableRow, MockField } from "@/components/admin/AdminControlTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { legalPages } from "@/lib/mockSiteControls";

export default function AdminLegalPage() {
  return (
    <div className="grid gap-6">
      <AdminPageHeader title="Legal Pages" subtitle="Edit mock legal text for terms, privacy, license, before-you-build notice and refund policy." actions={<Button href="/before-you-build" variant="outline">Preview Legal</Button>} />
      <Card className="border-amber-100 bg-amber-50/80 p-5">
        <div className="flex gap-3">
          <ShieldAlert className="h-6 w-6 shrink-0 text-amber-600" />
          <div>
            <h2 className="font-black text-slate-950">MVP legal control center</h2>
            <p className="mt-1 text-sm leading-6 text-slate-700">These are professional placeholders. Before real sales, replace them with country-appropriate legal terms reviewed by a qualified professional.</p>
          </div>
        </div>
      </Card>
      <ControlShell title="Editable Legal Pages" description="Public legal routes exist and read from the same local mock content.">
        <div className="grid gap-4">
          {legalPages.map((page) => (
            <EditableRow key={page.id} title={page.title} subtitle={`${page.summary} Updated ${page.updatedAt}`} status={page.status}>
              <MockField label="Public slug" value={`/${page.slug}`} />
              <MockField label="Summary" value={page.summary} />
              <div className="md:col-span-2"><MockField label="Page content" value={page.content.join("\n\n")} textarea /></div>
              <Button href={`/${page.slug}`} variant="outline"><FileText className="h-4 w-4" /> Public Page</Button>
            </EditableRow>
          ))}
        </div>
      </ControlShell>
    </div>
  );
}
