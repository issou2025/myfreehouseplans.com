"use client";

import { Eye, Pencil, Power, Wrench } from "lucide-react";
import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const initialTools = ["House Area Calculator", "Construction Cost Estimator", "Concrete Volume Calculator", "Brick Quantity Calculator", "Floor Plan Analyzer", "Plot Compatibility Checker", "House Plan Finder", "Room Size Checker"].map((name, index) => ({
  id: `tool-${index}`,
  name,
  active: index === 5,
  updated: `May ${20 + index}, 2026`
}));

export default function AdminToolsPage() {
  const [tools, setTools] = useState(initialTools);

  return (
    <div>
      <AdminPageHeader title="Tools Manager" subtitle="Activate, preview and prepare public calculators, smart plan tools and SEO placeholders." />
      <Card className="mb-5 border-sky-100 bg-sky-50/70 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2"><Wrench className="h-5 w-5 text-sky-600" /><h2 className="text-xl font-black text-slate-950">Public Tool Controls</h2></div>
            <p className="mt-1 text-sm leading-6 text-slate-600">Inactive tools stay in MVP preparation mode; active tools are available from the public tools page.</p>
          </div>
          <AdminActionButton message="Tool order saved in MVP mode.">Save Tool Settings</AdminActionButton>
        </div>
      </Card>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[940px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Tool", "Status", "Public URL", "Description", "SEO title", "Meta description", "Last updated", "Actions"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{tools.map((tool) => <tr key={tool.id} className="hover:bg-sky-50/40"><td className="px-4 py-3 font-semibold text-slate-950">{tool.name}</td><td className="px-4 py-3"><AdminStatusBadge status={tool.active ? "Active" : "Coming soon"} /></td><td className="px-4 py-3">/tools</td><td className="px-4 py-3">Helpful planning tool for house plan buyers.</td><td className="px-4 py-3">{tool.name} | myfreehouseplans.com</td><td className="px-4 py-3">Use {tool.name.toLowerCase()} before choosing your plan.</td><td className="px-4 py-3">{tool.updated}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><AdminActionButton message="Tool settings saved in MVP mode."><Pencil className="h-4 w-4" /> Edit</AdminActionButton><AdminActionButton message={tool.active ? "Tool deactivated in this session." : "Tool activated in this session."} onAction={() => setTools((current) => current.map((item) => item.id === tool.id ? { ...item, active: !item.active } : item))}><Power className="h-4 w-4" /> {tool.active ? "Deactivate" : "Activate"}</AdminActionButton><Button href="/tools" variant="outline"><Eye className="h-4 w-4" /> Preview</Button></div></td></tr>)}</tbody>
        </table>
      </Card>
    </div>
  );
}
