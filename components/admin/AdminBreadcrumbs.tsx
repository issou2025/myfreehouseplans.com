"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function humanize(segment: string) {
  if (segment === "admin") return "Admin";
  if (segment === "new") return "New";
  if (segment === "edit") return "Edit";
  return segment.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return (
    <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const current = index === segments.length - 1;
        return (
          <span key={href} className="flex items-center gap-2">
            {index > 0 ? <span>/</span> : null}
            {current ? <span className="text-slate-800">{humanize(segment)}</span> : <Link href={href} className="hover:text-sky-600">{humanize(segment)}</Link>}
          </span>
        );
      })}
    </nav>
  );
}
