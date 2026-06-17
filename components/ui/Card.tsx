import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-w-0 rounded-lg border border-slate-200/80 bg-white shadow-[0_10px_34px_rgba(15,23,42,0.06)] transition duration-200", className)} {...props} />;
}
