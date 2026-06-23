import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn("focus-ring min-h-28 min-w-0 max-w-full w-full resize-y rounded-xl border border-slate-200 bg-white/95 px-3.5 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition hover:border-slate-300", className)} {...props} />;
}
