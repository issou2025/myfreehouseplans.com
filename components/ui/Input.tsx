import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("focus-ring min-w-0 max-w-full w-full rounded-xl border border-slate-200 bg-white/95 px-3.5 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition hover:border-slate-300", className)} {...props} />;
}
