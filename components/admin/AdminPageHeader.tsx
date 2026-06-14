import type { ReactNode } from "react";
import { BarChart3, BookOpen, FileText, Folder, Home, Image, LayoutDashboard, Mail, Menu, PlusCircle, Search, Settings, ShieldCheck, Tags, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";

const titleIcons: Array<[string, LucideIcon]> = [
  ["dashboard", LayoutDashboard],
  ["analytics", BarChart3],
  ["blog", BookOpen],
  ["categor", Tags],
  ["footer", FileText],
  ["homepage", Home],
  ["legal", ShieldCheck],
  ["media", Image],
  ["message", Mail],
  ["navigation", Menu],
  ["plan", Folder],
  ["ranking", BarChart3],
  ["seo", Search],
  ["setting", Settings],
  ["tool", Wrench]
];

function getTitleIcon(title: string) {
  const normalized = title.toLowerCase();
  return titleIcons.find(([keyword]) => normalized.includes(keyword))?.[1] ?? PlusCircle;
}

export function AdminPageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  const Icon = getTitleIcon(title);
  return (
    <div className="mb-6 flex min-w-0 flex-col gap-4">
      <AdminBreadcrumbs />
      <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="flex min-w-0 gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-950/10">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="safe-break text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
            {subtitle ? <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex min-w-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
