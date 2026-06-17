import type { Metadata } from "next";
import { FileCheck2, FileText, Layers3, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { PackComparison } from "@/components/public/PackComparison";
import { PlanCard } from "@/components/public/PlanCard";
import { ProjectJourney } from "@/components/public/ProjectJourney";
import { PublicPageHero } from "@/components/public/PublicPageHero";
import { RelatedArticles, RelatedTools } from "@/components/public/RelatedContent";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { readPlans } from "@/lib/planData";
import { sortPlansForCatalog } from "@/lib/planRanking";

export const metadata: Metadata = { title: "Premium House Plans | myfreehouseplans.com", description: "Explore complete premium PDF house plan packages for serious project review." };

export const revalidate = 60;

export default async function PremiumPlansPage() {
  const plans = sortPlansForCatalog(await readPlans()).filter((plan) => plan.premiumPackEnabled);
  return <><Header /><main><PublicPageHero eyebrow="Complete drawing packages" title="Move from a promising preview to a serious project review." description="Premium PDF packages provide the coordinated drawings and clear documentation needed for deeper review with builders and local professionals." icon={FileText} actions={<><Button href="#premium-plans">Browse premium plans</Button><Button href="/free-house-plans" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">Start with free previews</Button></>} highlights={[{ label: "Complete documents", value: "Plans, elevations and sections", icon: FileCheck2 }, { label: "Professional handoff", value: "Clearer conversations with your team", icon: ShieldCheck }, { label: "Editable upgrade", value: "CAD and Revit options available", icon: Layers3 }]} /><ProjectJourney current="choose" /><div className="section-shell py-10 sm:py-14"><div className="grid gap-4 md:grid-cols-3">{["Complete PDF drawings", "Elevations and sections", "Metric and imperial versions"].map((item) => <Card key={item} className="p-4 sm:p-6"><p className="text-lg font-bold text-slate-950">{item}</p><p className="mt-2 text-sm leading-6 text-slate-600">Prepared for a more professional review process than a basic preview.</p></Card>)}</div><section className="mt-12"><h2 className="mb-5 text-3xl font-black text-slate-950">Free vs Premium vs CAD/Revit</h2><PackComparison /></section><section id="premium-plans" className="mt-12 scroll-mt-32 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}</section><div className="mt-12 rounded-3xl bg-slate-950 p-5 text-white sm:p-8"><h2 className="text-2xl font-black">Need editable files too?</h2><p className="mt-2 text-slate-300">Upgrade to CAD/Revit packs when your architect, engineer or builder needs editable source files.</p><div className="mt-5 flex flex-col gap-2 sm:flex-row"><Button href="/cad-revit-house-plans" className="w-full sm:w-auto">Browse CAD/Revit Packs</Button><Button href="/free-house-plans" variant="outline" className="w-full sm:w-auto">Compare Free Plans</Button></div></div><RelatedTools /><RelatedArticles /></div></main><Footer /></>;
}
