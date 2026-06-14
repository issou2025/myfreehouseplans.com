import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

type AdminStatCardProps = {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  href?: string;
  tone?: "sky" | "green" | "amber" | "purple" | "red" | "slate";
};

const tones = {
  sky: "bg-sky-50 text-sky-600 group-hover:bg-sky-100",
  green: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
  amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
  purple: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
  red: "bg-red-50 text-red-600 group-hover:bg-red-100",
  slate: "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
};

export function AdminStatCard({ label, value, trend, icon: Icon, href, tone = "sky" }: AdminStatCardProps) {
  const content = (
    <Card className="group relative overflow-hidden p-5 hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(15,23,42,0.12)]">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-100 blur-2xl transition group-hover:bg-sky-200" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 break-words text-3xl font-black text-slate-950">{value}</p>
          <p className="mt-2 text-xs font-semibold text-emerald-600">{trend}</p>
        </div>
        <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
      </div>
    </Card>
  );

  if (!href) return content;
  return <Link href={href} className="block min-w-0">{content}</Link>;
}
