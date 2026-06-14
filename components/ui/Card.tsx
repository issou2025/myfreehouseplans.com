import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-w-0 rounded-[1.5rem] border border-white/90 bg-white/90 shadow-[0_20px_70px_rgba(15,23,42,0.075)] ring-1 ring-slate-900/[0.035] backdrop-blur-xl transition duration-300", className)} {...props} />;
}
