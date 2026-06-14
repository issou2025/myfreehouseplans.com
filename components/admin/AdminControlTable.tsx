import type { ReactNode } from "react";
import { Eye, EyeOff, GripVertical, Pencil, Save } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function ControlShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <Card className="min-w-0 p-4 sm:p-6">
      <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <h2 className="safe-break text-2xl font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <AdminActionButton variant="outline" className="w-full sm:w-auto" message="Mock CMS settings saved for this session."><Save className="h-4 w-4" /> Save Mock Changes</AdminActionButton>
      </div>
      <div className="mt-5">{children}</div>
    </Card>
  );
}

export function VisibilityBadge({ status }: { status: "Visible" | "Hidden" }) {
  return <Badge tone={status === "Visible" ? "green" : "slate"}>{status === "Visible" ? <Eye className="mr-1 h-3 w-3" /> : <EyeOff className="mr-1 h-3 w-3" />}{status}</Badge>;
}

export function EditableRow({ title, subtitle, status, order, children }: { title: string; subtitle?: string; status: "Visible" | "Hidden"; order?: number; children?: ReactNode }) {
  return (
    <div className="grid gap-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-50 text-slate-400"><GripVertical className="h-5 w-5" /></div>
        {typeof order === "number" ? <Badge tone="blue">#{order}</Badge> : null}
      </div>
      <div className="min-w-0">
        <p className="safe-break font-black text-slate-950">{title}</p>
        {subtitle ? <p className="safe-break mt-1 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
        {children ? <div className="mt-3 grid gap-3 md:grid-cols-2">{children}</div> : null}
      </div>
      <div className="flex flex-wrap gap-2 lg:justify-end">
        <VisibilityBadge status={status} />
        <AdminActionButton variant="outline" className="w-full sm:w-auto" message="Row is editable in MVP mock mode."><Pencil className="h-4 w-4" /> Edit</AdminActionButton>
      </div>
    </div>
  );
}

export function MockField({ label, value, textarea = false }: { label: string; value: string; textarea?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      {textarea ? <Textarea defaultValue={value} /> : <Input defaultValue={value} />}
    </label>
  );
}
