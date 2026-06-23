import type { Metadata } from "next";
import { ArrowRight, Building2, CheckCircle2, FileText, Layers3, MapPinned, ShieldCheck } from "lucide-react";
import { CTASection } from "@/components/public/CTASection";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { ProjectJourney } from "@/components/public/ProjectJourney";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SafeImage } from "@/components/public/SafeImage";

export const metadata: Metadata = {
  title: "About",
  description: "Learn how myfreehouseplans.com helps homeowners compare free previews, premium PDFs, and editable CAD/Revit house plan files."
};

const values = [
  { title: "Preview before commitment", copy: "Free plan previews help families compare size, layout and style before paying for complete drawing packs.", icon: FileText },
  { title: "Practical build context", copy: "Plan cards focus on plot fit, climate notes, construction complexity, budget and professional review needs.", icon: MapPinned },
  { title: "Professional file paths", copy: "Premium PDF, DWG, Revit and IFC options give builders, architects and engineers clearer project handoffs.", icon: Layers3 }
];

const checks = ["Free and premium plan discovery", "Clear upgrade path for editable files", "Useful guidance before construction", "Designed for future payments and accounts"];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <SafeImage src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=85" alt="" fill sizes="100vw" className="object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/45" />
          <div className="absolute inset-0 subtle-grid opacity-20" />
          <div className="section-shell relative grid gap-8 py-12 lg:grid-cols-[1fr_0.75fr] lg:items-end lg:py-20">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-sky-200">About the marketplace</p>
              <h1 className="text-balance safe-break mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">House plan decisions should feel clear, visual and practical.</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                myfreehouseplans.com helps homeowners, builders, architects, engineers and students compare plans before construction pressure begins.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button href="/plans">Browse Plans <ArrowRight className="h-4 w-4" /></Button>
                <Button href="/contact" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">Request a Custom Plan</Button>
              </div>
            </div>
            <Card className="border-white/10 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-xl">
              <Building2 className="h-9 w-9 text-sky-300" />
              <p className="mt-4 text-2xl font-black">Built for serious comparison</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">The platform brings plan discovery, previews, tools, guide content and custom requests into one calm buying flow.</p>
            </Card>
          </div>
        </section>
        <ProjectJourney current="discover" />

        <section className="section-shell py-10 sm:py-14">
          <div className="grid gap-4 md:grid-cols-3">
            {values.map(({ title, copy, icon: Icon }) => (
              <Card key={title} className="p-5 sm:p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-sky-600"><Icon className="h-5 w-5" /></span>
                <h2 className="mt-4 text-xl font-black text-slate-950">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{copy}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="bg-white/70">
          <div className="section-shell grid gap-8 py-10 sm:py-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="section-kicker">Deployment-ready foundation</p>
              <h2 className="section-title">Designed to Grow Beyond the First Version</h2>
              <p className="mt-3 leading-7 text-slate-600">
                This version keeps the public experience polished while leaving room for database-backed plans, media management, authentication, analytics and checkout flows.
              </p>
            </div>
            <div className="grid gap-3 min-[520px]:grid-cols-2">
              {checks.map((item) => (
                <p key={item} className="flex gap-3 rounded-2xl bg-white p-4 font-semibold text-slate-700 shadow-sm">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell py-10 sm:py-14">
          <Card className="grid gap-5 overflow-hidden bg-slate-950 p-6 text-white sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <ShieldCheck className="h-10 w-10 text-emerald-300" />
            <div>
              <h2 className="text-2xl font-black">Important building note</h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">Plans should always be reviewed and adapted by a local qualified professional before construction, permitting or structural work.</p>
            </div>
            <Button href="/before-you-build" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">Read Guide</Button>
          </Card>
        </section>

        <CTASection />
      </main>
      <Footer />
    </>
  );
}
