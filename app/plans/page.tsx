import type { Metadata } from "next";
import { Suspense } from "react";
import { GitCompareArrows, MapPinned, SearchCheck } from "lucide-react";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { PlanCatalogClient } from "@/components/public/PlanCatalogClient";
import { ProjectJourney } from "@/components/public/ProjectJourney";
import { PublicPageHero } from "@/components/public/PublicPageHero";
import { Button } from "@/components/ui/Button";
import { readPlans } from "@/lib/planData";
import { sortPlansForCatalog } from "@/lib/planRanking";

export const metadata: Metadata = {
  title: "House Plans | myfreehouseplans.com",
  description: "Browse modern house plans by bedrooms, area, plot size, style and file format."
};

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const rankedPlans = sortPlansForCatalog(await readPlans());
  return (
    <>
      <Header />
      <main>
        <PublicPageHero
          eyebrow="Smart plan catalog"
          title="Find a house plan that works beyond the first impression."
          description="Search by rooms, area, plot dimensions, style and file format. Compare up to three plans and test the strongest options against your land."
          icon={SearchCheck}
          actions={<><Button href="#catalog">Browse the catalog</Button><Button href="/tools#plot-checker" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">Check my plot</Button></>}
          highlights={[
            { label: "Decision tools", value: "Search, filters and side-by-side comparison", icon: GitCompareArrows },
            { label: "Land context", value: "Metric and feet plot dimensions", icon: MapPinned },
            { label: "Useful results", value: `${rankedPlans.length} plans ready to explore`, icon: SearchCheck }
          ]}
        />
        <ProjectJourney current="discover" />
        <section id="catalog" className="section-shell scroll-mt-32 py-10">
          <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">Loading smart catalog...</div>}>
            <PlanCatalogClient plans={rankedPlans} />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  );
}
