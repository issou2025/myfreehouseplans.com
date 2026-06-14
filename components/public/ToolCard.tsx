import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function ToolCard({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) {
  const available = title.includes("Plot Compatibility") || title.includes("House Plan Finder");
  return (
    <Card className="group relative overflow-hidden p-5 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky-100 blur-2xl transition group-hover:bg-sky-200" />
      <div className="relative flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-sm"><Icon className="h-5 w-5" /></div>
        <Badge tone={available ? "green" : "slate"}>{available ? "Available" : "Coming Soon"}</Badge>
      </div>
      <p className="relative mt-5 text-lg font-black text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <Button href={available ? "/tools#interactive-tools" : "/contact"} className="mt-5 w-full" variant={available ? "primary" : "outline"}>{available ? "Open Tool" : "Request this tool"}</Button>
    </Card>
  );
}
