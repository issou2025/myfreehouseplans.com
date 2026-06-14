"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpDown,
  BarChart3,
  BookOpen,
  Boxes,
  Columns3,
  FileText,
  Gauge,
  Home,
  Image,
  LayoutDashboard,
  Mail,
  Menu,
  Megaphone,
  PlusCircle,
  Search,
  Settings,
  ShieldCheck,
  Tags,
  Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";

export const adminGroups = [
  {
    label: "Overview",
    icon: Gauge,
    links: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard, helper: "Command center" },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3, helper: "Traffic signals" },
      { label: "Marketing", href: "/admin/marketing", icon: Megaphone, helper: "Growth engine" },
      { label: "Messages", href: "/admin/messages", icon: Mail, helper: "Client requests" }
    ]
  },
  {
    label: "Catalog",
    icon: Boxes,
    links: [
      { label: "Plans", href: "/admin/plans", icon: Home, helper: "Manage inventory" },
      { label: "Add Plan", href: "/admin/plans/new", icon: PlusCircle, helper: "Create listing" },
      { label: "Categories", href: "/admin/categories", icon: Tags, helper: "Group plans" },
      { label: "Ranking Manager", href: "/admin/ranking", icon: ArrowUpDown, helper: "Sort visibility" }
    ]
  },
  {
    label: "Content",
    icon: FileText,
    links: [
      { label: "Blog", href: "/admin/blog", icon: BookOpen, helper: "SEO articles" },
      { label: "Media Library", href: "/admin/media", icon: Image, helper: "Files and images" },
      { label: "SEO Center", href: "/admin/seo", icon: Search, helper: "Search quality" },
      { label: "Tools", href: "/admin/tools", icon: Wrench, helper: "Public tools" }
    ]
  },
  {
    label: "Site Setup",
    icon: Settings,
    links: [
      { label: "Homepage Builder", href: "/admin/homepage", icon: Home, helper: "Front page" },
      { label: "Navigation", href: "/admin/navigation", icon: Menu, helper: "Menus" },
      { label: "Footer", href: "/admin/footer", icon: Columns3, helper: "Footer links" },
      { label: "Legal Pages", href: "/admin/legal", icon: ShieldCheck, helper: "Policies" },
      { label: "Settings", href: "/admin/settings", icon: Settings, helper: "Site controls" }
    ]
  }
];

export const adminLinks = adminGroups.flatMap((group) => group.links);

export function AdminSidebarContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="relative border-b border-white/10 p-5">
        <Link href="/admin" className="flex min-w-0 items-center gap-3" onClick={onNavigate}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-500 text-sm font-black shadow-lg shadow-sky-500/25">MF</span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-black">myfreehouseplans</span>
            <span className="text-xs text-slate-400">Marketplace CMS</span>
          </span>
        </Link>
        <Link
          href="/admin/plans/new"
          onClick={onNavigate}
          className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:bg-sky-50"
        >
          <PlusCircle className="h-4 w-4 text-sky-600" />
          Quick Add Plan
        </Link>
      </div>
      <nav className="relative grid max-h-[calc(100vh-9rem)] gap-5 overflow-y-auto px-3 py-5">
        {adminGroups.map(({ label: groupLabel, icon: GroupIcon, links }) => (
          <section key={groupLabel} className="grid gap-1">
            <div className="flex items-center gap-2 px-3 pb-1 text-[0.7rem] font-black uppercase tracking-wide text-slate-500">
              <GroupIcon className="h-3.5 w-3.5" />
              <span>{groupLabel}</span>
            </div>
            {links.map(({ label, href, icon: Icon, helper }) => {
              const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
              return (
                <Link
                  key={label}
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex min-h-12 min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                    active ? "bg-white text-slate-950 shadow-lg shadow-sky-500/10" : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", active ? "bg-sky-50 text-sky-600" : "bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-sky-200")}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{label}</span>
                    <span className={cn("block truncate text-xs", active ? "text-slate-500" : "text-slate-500 group-hover:text-slate-300")}>{helper}</span>
                  </span>
                </Link>
              );
            })}
          </section>
        ))}
      </nav>
    </>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="relative hidden max-w-full overflow-hidden border-r border-white/10 bg-slate-950 text-white lg:sticky lg:top-0 lg:block lg:min-h-screen">
      <AdminSidebarContent pathname={pathname} />
    </aside>
  );
}
