import type { Metadata } from "next";
import { Box, FileCode2, Files, Layers3 } from "lucide-react";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { PlanCard } from "@/components/public/PlanCard";
import { ProjectJourney } from "@/components/public/ProjectJourney";
import { PublicPageHero } from "@/components/public/PublicPageHero";
import { RelatedArticles, RelatedTools } from "@/components/public/RelatedContent";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { readPlans } from "@/lib/planData";
import { sortPlansForCatalog } from "@/lib/planRanking";

export const metadata: Metadata = {
  title: "CAD and Revit House Plan Packages | myfreehouseplans.com",
  description: "Browse editable DWG, Revit and IFC house plan packages for architects, engineers and builders."
};

export const dynamic = "force-dynamic";

export default async function CadRevitPage() {
  const plans = sortPlansForCatalog(await readPlans()).filter((plan) => plan.cadPackEnabled);
  const rows = [["PDF", "Viewing, printing and review", "Homeowners and first checks"], ["DWG", "Editable 2D CAD drawings", "Architects, technicians and builders"], ["Revit", "BIM model with coordinated views", "BIM users, students and professionals"], ["IFC", "Open BIM exchange format", "Cross-platform coordination"]];
  return <><Header /><main><PublicPageHero eyebrow="Professional editable files" title="Give your project team files they can actually work with." description="Choose DWG, Revit and IFC packages when architects, engineers, technicians or builders need editable source files instead of a static drawing." icon={Layers3} actions={<><Button href="#editable-plans">Browse editable plans</Button><Button href="/contact" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">Ask about file compatibility</Button></>} highlights={[{ label: "2D editing", value: "DWG drawing files", icon: FileCode2 }, { label: "BIM workflow", value: "Revit models and coordinated views", icon: Box }, { label: "Open exchange", value: "IFC for cross-platform coordination", icon: Files }]} /><ProjectJourney current="choose" /><div className="section-shell py-10 sm:py-14"><div className="grid gap-4 md:hidden">{rows.map(([a, b, c]) => <Card key={a} className="p-4"><p className="text-xl font-black text-slate-950">{a}</p><p className="mt-2 text-sm text-slate-600">{b}</p><p className="mt-2 text-xs font-semibold text-violet-700">{c}</p></Card>)}</div><Card className="hidden overflow-x-auto md:block"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Format</th><th className="px-4 py-3">Best use</th><th className="px-4 py-3">Who needs it</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map(([a, b, c]) => <tr key={a}><td className="px-4 py-4 font-bold text-slate-950">{a}</td><td className="px-4 py-4 text-slate-600">{b}</td><td className="px-4 py-4 text-slate-600">{c}</td></tr>)}</tbody></table></Card><div id="editable-plans" className="mt-10 scroll-mt-32 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}</div><RelatedTools /><RelatedArticles /></div></main><Footer /></>;
}
