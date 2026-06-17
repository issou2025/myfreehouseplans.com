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
  primary: "bg-slate-950 text-white shadow-[0_8px_20px_rgba(15,23,42,0.16)] hover:bg-slate-800",
  secondary: "bg-sky-700 text-white shadow-[0_8px_20px_rgba(14,116,144,0.18)] hover:bg-sky-800",
  outline: "border border-slate-300 bg-white text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950",
  danger: "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600",
  premium: "bg-amber-500 text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600"
};

export function Button({ className, variant = "primary", href, children, ...props }: ButtonProps) {
  const classes = cn("focus-ring inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-center text-sm font-bold transition duration-200 active:translate-y-px", variants[variant], className);

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
