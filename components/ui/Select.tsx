import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn("focus-ring w-full rounded-xl border border-slate-200 bg-white/95 px-3.5 py-3 text-sm text-slate-900 shadow-sm transition hover:border-slate-300", className)} {...props}>
      {children}
    </select>
  );
}
