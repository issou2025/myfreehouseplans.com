"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Boxes, CheckCircle2, ChevronDown, ClipboardCheck, Compass, FileCheck2, FileText, GitCompareArrows, Home, Info, Mail, MapPinned, Menu, MessageCircle, PenTool, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

const mobileLinks: Array<[string, string, LucideIcon]> = [
  ["Home", "/", Home],
  ["Browse House Plans", "/plans", Boxes],
  ["Check My Land", "/tools#plot-checker", MapPinned],
  ["Free Plans", "/free-house-plans", FileCheck2],
  ["Premium", "/premium-house-plans", FileText],
  ["Professional Files", "/cad-revit-house-plans", Compass],
  ["Helpful Guides", "/blog", BookOpen],
  ["Ask for Help", "/contact", Mail]
];

const planLinks: Array<[string, string, string, LucideIcon]> = [
  ["Browse all plans", "/plans", "See every design and compare your favorites", Boxes],
  ["Start with free plans", "/free-house-plans", "Review layouts before paying", FileCheck2],
  ["Get complete drawings", "/premium-house-plans", "PDF files for a deeper project review", FileText],
  ["Get editable files", "/cad-revit-house-plans", "CAD and Revit files for professionals", Compass]
];

const journeyLinks: Array<[string, string, LucideIcon]> = [
  ["Start with plot", "/tools#plot-checker", ClipboardCheck],
  ["Browse & compare", "/plans", GitCompareArrows],
  ["Check land fit", "/tools#plot-checker", MapPinned],
  ["Request changes", "/contact", PenTool]
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => href === "/" ? pathname === href : pathname.startsWith(href);
  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 shadow-[0_8px_35px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
      <div className="hidden border-b border-slate-100/80 bg-slate-950 text-white lg:block">
        <div className="section-shell flex h-8 items-center justify-between gap-4 text-[11px] font-bold">
          <p className="flex items-center gap-2 text-slate-300"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> Practical plan previews, plot checks and professional file options</p>
          <div className="flex items-center gap-5">
            <Link href="/before-you-build" className="text-slate-300 transition hover:text-white">Before you build</Link>
            <Link href="/about" className="text-slate-300 transition hover:text-white">How it works</Link>
            <Link href="/contact" className="text-sky-300 transition hover:text-white">Project support</Link>
          </div>
        </div>
      </div>
      <div className="section-shell flex min-w-0 items-center justify-between gap-2 py-2.5 sm:gap-3 sm:py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[1rem] bg-gradient-to-br from-slate-950 via-slate-900 to-sky-600 text-white shadow-[0_10px_25px_rgba(14,165,233,0.25)] sm:h-11 sm:w-11"><Sparkles className="h-4 w-4" /></span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-black tracking-tight text-slate-950 min-[380px]:text-sm sm:text-lg">myfreehouseplans<span className="text-sky-500">.com</span></span>
            <span className="hidden text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 sm:block">Plan smarter. Build confidently.</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-600 lg:flex">
          <div className="group relative">
            <button className={`flex items-center gap-1.5 rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950 ${pathname.startsWith("/plans") || pathname.includes("house-plans") ? "bg-slate-950 text-white hover:bg-slate-950 hover:text-white" : ""}`}>
              <Boxes className="h-3.5 w-3.5" /> House Plans <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" />
            </button>
            <div className="invisible absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-4 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100">
              <div className="grid grid-cols-2 gap-2 rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
                {planLinks.map(([label, href, copy, Icon]) => (
                  <Link key={href} href={href} className="group/item flex gap-3 rounded-2xl p-3 transition hover:bg-sky-50">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 group-hover/item:bg-sky-600 group-hover/item:text-white"><Icon className="h-4 w-4" /></span>
                    <span><span className="block font-black text-slate-950">{label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{copy}</span></span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {[["Check My Land", "/tools#plot-checker", MapPinned], ["Guides", "/blog", BookOpen], ["About", "/about", Info]].map(([label, href, Icon]) => (
            <Link key={String(href)} href={String(href)} className={`flex items-center gap-1.5 rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-950 ${isActive(String(href)) ? "bg-slate-950 text-white shadow-lg shadow-slate-950/15 hover:bg-slate-950 hover:text-white" : ""}`}>
              <Icon className="h-3.5 w-3.5" />{String(label)}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 xl:flex">
          <Button href="/contact" variant="ghost"><MessageCircle className="h-4 w-4" /> Ask for help</Button>
          <Button href="/plans"><Search className="h-4 w-4" /> Find a Plan</Button>
        </div>
        <button className="focus-ring min-h-11 min-w-11 shrink-0 rounded-xl border border-slate-200 bg-white p-2 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="section-shell pb-4 lg:hidden">
          <div className="grid gap-1 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl">
            <div className="mb-2 flex items-center gap-2 rounded-2xl bg-slate-950 p-3 text-xs font-bold text-slate-200"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Start anywhere. We will guide the next step.</div>
            {mobileLinks.map(([label, href, Icon]) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-sky-50 ${isActive(href) ? "bg-sky-50 text-sky-700" : ""}`} onClick={() => setOpen(false)}><Icon className="h-4 w-4" />{label}</Link>)}
            <div className="mt-2 border-t border-slate-100 pt-2">
              <p className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">Smart path</p>
              {journeyLinks.map(([label, href, Icon]) => (
                <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700" onClick={() => setOpen(false)}>
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
            <Button href="/plans" className="mt-2 w-full"><Search className="h-4 w-4" /> Find a House Plan</Button>
            <Button href="/contact" variant="outline" className="w-full"><MessageCircle className="h-4 w-4" /> Ask a Question</Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
