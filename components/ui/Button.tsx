import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { isExternalUrl } from "@/lib/payments";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel" | "download"> & {
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
    const { disabled: _disabled, type: _type, target, rel, download, ...linkProps } = props;
    const anchorProps = linkProps as AnchorHTMLAttributes<HTMLAnchorElement>;
    if (isExternalUrl(href)) {
      return (
        <a href={href} className={classes} target={target ?? "_blank"} rel={rel ?? "noopener noreferrer"} download={download} {...anchorProps}>
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...anchorProps}>
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
