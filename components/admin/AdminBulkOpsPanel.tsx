import { Database, FileInput, ListChecks, Wand2 } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { adminSavedViews } from "@/lib/mockAdminOps";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export function AdminBulkOpsPanel() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-5">
        <div className="flex items-center gap-3"><FileInput className="h-5 w-5 text-sky-600" /><h2 className="text-xl font-black text-slate-950">Bulk Import Workspace</h2></div>
        <p className="mt-2 text-sm leading-6 text-slate-600">Mock-only import surface for future CSV, JSON, media ZIP and CAD/Revit package ingestion.</p>
        <div className="mt-4 grid gap-3">
          {["Import plans from CSV", "Attach media URLs in bulk", "Map categories and tags", "Validate SEO and pack fields"].map((item) => <p key={item} className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{item}</p>)}
        </div>
        <AdminActionButton className="mt-4 w-full" variant="outline" message="Bulk import is queued for the future database phase."><Database className="h-4 w-4" /> Import roadmap noted</AdminActionButton>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-3"><ListChecks className="h-5 w-5 text-sky-600" /><h2 className="text-xl font-black text-slate-950">Saved CMS Views</h2></div>
        <div className="mt-4 flex flex-wrap gap-2">
          {adminSavedViews.map((view) => <Badge key={view} tone="blue">{view}</Badge>)}
        </div>
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-bold text-slate-950">Smart batch actions</p>
              <p className="mt-1 text-sm text-slate-600">Apply tags, mark for SEO review, update pack status, or queue for publishing.</p>
            </div>
            <AdminActionButton variant="premium" className="w-full sm:w-auto" message="Mock batch completed for selected CMS view."><Wand2 className="h-4 w-4" /> Run Mock Batch</AdminActionButton>
          </div>
        </div>
      </Card>
    </div>
  );
}
