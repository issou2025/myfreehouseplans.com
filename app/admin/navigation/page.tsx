import { Menu, PlusCircle } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ControlShell, EditableRow, MockField } from "@/components/admin/AdminControlTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { navigationItems } from "@/lib/mockSiteControls";

export default function AdminNavigationPage() {
  return (
    <div className="grid gap-6">
      <AdminPageHeader title="Navigation Manager" subtitle="Manage public menu labels, URLs, order, visibility and future external-link behavior." actions={<Button href="/" variant="outline">View Public Header</Button>} />
      <Card className="p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div><Menu className="h-6 w-6 text-sky-600" /><h2 className="mt-3 text-xl font-black text-slate-950">Public Menu</h2><p className="mt-1 text-sm text-slate-600">These mock controls mirror the header navigation used by visitors.</p></div>
          <AdminActionButton className="w-full sm:w-auto" message="Menu item added as an MVP placeholder."><PlusCircle className="h-4 w-4" /> Add Menu Item</AdminActionButton>
        </div>
      </Card>
      <ControlShell title="Menu Items" description="Later these rows can be persisted to PostgreSQL or a headless CMS.">
        <div className="grid gap-4">
          {navigationItems.map((item) => (
            <EditableRow key={item.id} title={item.label} subtitle={item.url} status={item.status} order={item.order}>
              <MockField label="Label" value={item.label} />
              <MockField label="URL" value={item.url} />
            </EditableRow>
          ))}
        </div>
      </ControlShell>
    </div>
  );
}
