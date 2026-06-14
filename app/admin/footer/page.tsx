import { Columns3, PlusCircle } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ControlShell, MockField, VisibilityBadge } from "@/components/admin/AdminControlTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { footerColumns } from "@/lib/mockSiteControls";

export default function AdminFooterPage() {
  return (
    <div className="grid gap-6">
      <AdminPageHeader title="Footer Manager" subtitle="Control footer columns, labels, URLs and legal/resource links from a professional mock CMS screen." actions={<Button href="/" variant="outline">Preview Footer</Button>} />
      <Card className="p-5">
        <Columns3 className="h-6 w-6 text-sky-600" />
        <h2 className="mt-3 text-xl font-black text-slate-950">Footer Navigation Hub</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">A strong footer improves SEO, trust and internal linking across plans, tools, resources, company pages and legal notices.</p>
      </Card>
      <ControlShell title="Footer Columns" description="Edit column headings and link groups for the public footer.">
        <div className="grid gap-4 xl:grid-cols-2">
          {footerColumns.map((column) => (
            <Card key={column.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><h3 className="safe-break text-lg font-black text-slate-950">{column.title}</h3><p className="mt-1 text-xs font-semibold text-slate-500">{column.links.length} links</p></div>
                <AdminActionButton variant="outline" message="Footer link added as an MVP placeholder."><PlusCircle className="h-4 w-4" /> Add Link</AdminActionButton>
              </div>
              <div className="mt-4 grid gap-3">
                <MockField label="Column title" value={column.title} />
                {column.links.map((link) => (
                  <div key={`${column.id}-${link.label}`} className="grid gap-2 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                    <MockField label="Label" value={link.label} />
                    <MockField label="URL" value={link.url} />
                    <VisibilityBadge status={link.status} />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </ControlShell>
    </div>
  );
}
