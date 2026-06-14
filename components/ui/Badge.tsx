import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  children: ReactNode;
  tone?: "blue" | "green" | "orange" | "slate" | "red" | "purple" | "amber" | "navy";
  className?: string;
};

const tones = {
  blue: "bg-sky-50 text-sky-700 ring-sky-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  orange: "bg-orange-50 text-orange-700 ring-orange-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  purple: "bg-violet-50 text-violet-700 ring-violet-100",
  navy: "bg-slate-950 text-white ring-slate-800",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  red: "bg-red-50 text-red-700 ring-red-100"
};

export function Badge({ children, tone = "slate", className }: BadgeProps) {
  return <span className={cn("inline-flex max-w-full items-center rounded-full px-3 py-1.5 text-xs font-bold ring-1", tones[tone], className)}>{children}</span>;
}
