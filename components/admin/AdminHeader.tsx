"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Bell, ChevronRight, Folder, Home, Image, Menu, Plus, Search, Settings, UserCircle, X } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { adminLinks, AdminSidebarContent } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const mobileLinks = [
  { label: "Dash", href: "/admin", icon: Home },
  { label: "Plans", href: "/admin/plans", icon: Folder },
  { label: "Media", href: "/admin/media", icon: Image },
  { label: "Home", href: "/admin/homepage", icon: Settings }
];

export function AdminHeader() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [feedback, setFeedback] = useState("");

  const currentPage = useMemo(() => {
    const exact = adminLinks.find((link) => link.href === pathname);
    const parent = [...adminLinks].sort((a, b) => b.href.length - a.href.length).find((link) => link.href !== "/admin" && pathname.startsWith(link.href));
    return exact ?? parent ?? adminLinks[0];
  }, [pathname]);
  const CurrentIcon = currentPage.icon;

  const handleSearch = () => {
    const value = query.trim();
    setFeedback(value ? `Search indexing is not connected yet for "${value}".` : "Type a keyword to search admin content.");
    window.setTimeout(() => setFeedback(""), 2400);
  };

  return (
    <header className="sticky top-0 z-40 max-w-full overflow-visible border-b border-white/60 bg-white/80 px-3 py-3 shadow-sm shadow-slate-950/5 backdrop-blur-xl sm:px-6 sm:py-4 lg:px-8">
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-white lg:hidden"
            aria-label="Open admin navigation"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden h-12 w-12 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100 sm:grid">
            <CurrentIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
              <Link href="/admin" className="text-sky-600 hover:text-sky-700">Admin CMS</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span>{currentPage.label}</span>
            </div>
            <h1 className="safe-break text-xl font-black text-slate-950 sm:text-2xl">{currentPage.label}</h1>
            <p className="mt-0.5 hidden text-sm font-semibold text-slate-500 sm:block">{currentPage.helper}</p>
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-3 xl:flex xl:flex-wrap xl:items-center">
          <form
            className="relative min-w-0"
            onSubmit={(event) => {
              event.preventDefault();
              handleSearch();
            }}
          >
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input className="w-full pl-9 xl:w-64" placeholder="Search admin..." value={query} onChange={(event) => setQuery(event.target.value)} />
            {feedback ? <span className="absolute left-0 top-full z-50 mt-1 w-full rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-xl">{feedback}</span> : null}
          </form>
          <Button href="/admin/plans/new" className="w-full px-3 sm:w-auto sm:px-5"><Plus className="h-4 w-4" /> Add New Plan</Button>
          <AdminActionButton variant="outline" className="w-full px-3 sm:w-auto" message="No new admin notifications."><Bell className="h-5 w-5" /><span className="sm:hidden">Notifications</span></AdminActionButton>
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm md:flex"><UserCircle className="h-4 w-4" /> Admin</div>
        </div>
      </div>
      <nav className="mt-3 grid grid-cols-2 gap-2 min-[420px]:grid-cols-4 lg:hidden">
        {mobileLinks.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-xl border px-2 text-xs font-bold shadow-sm",
              pathname === href || (href !== "/admin" && pathname.startsWith(href)) ? "border-sky-200 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-700"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0 bg-slate-950/55" aria-label="Close admin navigation" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[min(88vw,22rem)] overflow-y-auto bg-slate-950 text-white shadow-2xl">
            <div className="flex justify-end px-4 pt-4">
              <button type="button" className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white" aria-label="Close admin navigation" onClick={() => setDrawerOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <AdminSidebarContent pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      ) : null}
    </header>
  );
}
