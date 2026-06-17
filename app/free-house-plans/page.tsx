import type { Metadata } from "next";
import { Download, FileCheck2, Layers3, SearchCheck } from "lucide-react";
import { CTASection } from "@/components/public/CTASection";
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

export const metadata: Metadata = {
  title: "Free House Plans PDF | myfreehouseplans.com",
  description: "Download free house plan previews and explore premium construction packages."
};

export const revalidate = 60;

export default async function FreePlansPage() {
  const plans = sortPlansForCatalog(await readPlans()).filter((plan) => plan.freePackEnabled);
  return (
    <>
      <Header />
      <main>
        <PublicPageHero eyebrow="Start free, decide carefully" title="Review house plans before paying for complete files." description="Use free PDF previews to study layouts, dimensions and room organization. Upgrade only when a plan has earned a place on your shortlist." icon={FileCheck2} actions={<><Button href="#free-plans">Browse free previews</Button><Button href="/tools#plot-checker" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">Check plot fit first</Button></>} highlights={[{ label: "First review", value: "Layout and key dimensions", icon: SearchCheck }, { label: "Immediate access", value: `${plans.length} free previews available`, icon: Download }, { label: "Clear upgrade path", value: "Premium PDF, DWG, Revit and IFC", icon: Layers3 }]} />
        <ProjectJourney current="choose" />
        <section id="free-plans" className="section-shell scroll-mt-32 py-10 sm:py-14">
          <Card className="mt-8 border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-slate-700 sm:p-6">Free previews help you review the layout, room organization, basic dimensions and plan concept before deciding whether a full construction package is worth buying.</Card>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}</div>
        </section>
        <section className="section-shell py-10 sm:py-12"><h2 className="mb-5 text-3xl font-black text-slate-950">Upgrade when ready</h2><PackComparison /></section>
        <section className="section-shell py-10 sm:py-12"><h2 className="text-3xl font-black text-slate-950">FAQ</h2><div className="mt-4 grid gap-3 text-slate-600"><p>Free PDFs are for first review and may be watermarked.</p><p>Premium files provide more complete drawings and technical information.</p><p>Always ask a local professional to adapt any plan before construction.</p></div><RelatedTools /><RelatedArticles /></section>
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
