import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "premium";
  children: ReactNode;
};

const variants = {
  primary: "bg-gradient-to-r from-sky-500 via-sky-500 to-blue-600 text-white shadow-[0_12px_30px_rgba(14,165,233,0.28)] hover:brightness-105 hover:shadow-[0_16px_38px_rgba(14,165,233,0.34)]",
  secondary: "bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.2)] hover:bg-slate-800",
  outline: "border border-slate-200/80 bg-white/85 text-slate-800 shadow-sm backdrop-blur hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800",
  ghost: "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950",
  danger: "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600",
  premium: "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-white shadow-lg shadow-amber-500/25 hover:brightness-105"
};

export function Button({ className, variant = "primary", href, children, ...props }: ButtonProps) {
  const classes = cn("focus-ring inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-center text-sm font-bold transition duration-300 hover:-translate-y-0.5 active:translate-y-0", variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
