import { ArrowRight, Building2, Calculator, CheckCircle2, ClipboardCheck, FileStack, Layers3, MapPinned, PenTool, Route, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { BlogCard } from "@/components/public/BlogCard";
import { CategoryCard } from "@/components/public/CategoryCard";
import { CTASection } from "@/components/public/CTASection";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { HeroSection } from "@/components/public/HeroSection";
import { PlanCard } from "@/components/public/PlanCard";
import { PlotCheckerMock } from "@/components/public/PlotCheckerMock";
import { ProjectJourney } from "@/components/public/ProjectJourney";
import { TechnicalIntelligence } from "@/components/public/TechnicalIntelligence";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { mockBlogPosts } from "@/lib/mockBlogPosts";
import { readCategories } from "@/lib/categoryData";
import { readPlans } from "@/lib/planData";
import { sortPlansForHomepage } from "@/lib/planRanking";

export const revalidate = 60;

const filePaths = [
  { title: "Share the basics", href: "/tools#plan-finder", icon: ClipboardCheck, copy: "Use plot size, rooms and budget to narrow the catalog." },
  { title: "Review close matches", href: "/plans", icon: Sparkles, copy: "Compare layouts, areas, plot needs and available files." },
  { title: "Choose the files", href: "/premium-house-plans", icon: Layers3, copy: "Start with previews or move to full PDF and editable files." },
  { title: "Request adjustments", href: "/contact", icon: PenTool, copy: "Ask about room changes, file formats or a custom version." }
];

const assuranceLinks: Array<{ title: string; copy: string; icon: LucideIcon; href: string }> = [
  { title: "Plot fit", copy: "Check dimensions before choosing a plan.", icon: MapPinned, href: "/tools" },
  { title: "Plan edits", copy: "Ask for room, style or file modifications.", icon: PenTool, href: "/contact" },
  { title: "Build sequence", copy: "Read practical guidance before construction.", icon: Route, href: "/before-you-build" },
  { title: "Legal clarity", copy: "Understand licenses, refunds and terms.", icon: ShieldCheck, href: "/license" }
];

export default async function HomePage() {
  const [categories, plans] = await Promise.all([readCategories(), readPlans()]);
  const homepagePlans = sortPlansForHomepage(plans);
  const featuredCategories = categories.filter((category) => category.visible !== false && category.featured).slice(0, 4);
  const homepageCategories = featuredCategories.length ? featuredCategories : categories.filter((category) => category.visible !== false).slice(0, 4);
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ProjectJourney />
        <TechnicalIntelligence />
        <section className="section-shell py-12 sm:py-20">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"><div className="min-w-0"><p className="section-kicker">Explore by lifestyle</p><h2 className="section-title">Find the kind of home you have in mind</h2><p className="mt-2 max-w-2xl text-slate-600">Browse practical collections by style, size, room count and construction budget.</p></div><Button href="/plans" variant="outline" className="w-full sm:w-auto">Explore all plans <ArrowRight className="h-4 w-4" /></Button></div>
          <div className="mt-7 grid gap-4 min-[520px]:grid-cols-2 lg:grid-cols-4">{homepageCategories.map((category) => <CategoryCard key={category.id} category={category} />)}</div>
        </section>
        <section className="border-y border-white/80 bg-white/55 backdrop-blur">
          <div className="section-shell py-10 sm:py-20"><PlotCheckerMock /></div>
        </section>
        <section className="section-shell py-12 sm:py-20">
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-center lg:gap-8">
            <div className="min-w-0">
              <p className="section-kicker">Not sure where to start?</p>
              <h2 className="section-title">Move from idea to usable plan</h2>
              <p className="mt-3 leading-7 text-slate-600">Start with the constraints you already know. The site then keeps the plan, land and file choices in one place.</p>
              <div className="mt-5 grid gap-2 min-[420px]:grid-cols-2 sm:flex sm:flex-wrap sm:gap-3">
                <Button href="/tools"><ClipboardCheck className="h-4 w-4" /> Check my plot</Button>
                <Button href="/plans" variant="outline"><Sparkles className="h-4 w-4" /> Browse plans</Button>
              </div>
            </div>
            <div className="grid gap-3 min-[520px]:grid-cols-2 sm:gap-4">
              {filePaths.map(({ title, href, icon: Icon, copy }) => (
                <Card key={title} className="group p-4 hover:border-sky-200 hover:shadow-[0_16px_44px_rgba(14,165,233,0.09)] sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-md bg-slate-950 text-white"><Icon className="h-5 w-5" /></span>
                    <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-sky-600" />
                  </div>
                  <h3 className="mt-4 text-xl font-extrabold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
                  <Button href={href} variant="ghost" className="mt-4 w-full justify-start">Continue <ArrowRight className="h-4 w-4" /></Button>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <section className="section-shell py-12 sm:py-20">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"><div className="min-w-0"><p className="section-kicker">Popular right now</p><h2 className="section-title">Featured house plans</h2><p className="mt-2 text-slate-600">A hand-picked mix of practical family homes, compact layouts and buildable modern designs.</p></div><Button href="/plans" variant="outline" className="w-full sm:w-auto">View all plans</Button></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{homepagePlans.slice(0, 6).map((plan) => <PlanCard key={plan.id} plan={plan} />)}</div>
        </section>
        <section className="border-y border-white/80 bg-white/55 backdrop-blur">
          <div className="section-shell grid gap-4 py-10 sm:py-20 lg:grid-cols-3">
            <Card className="overflow-hidden p-5 sm:p-6"><FileStack className="h-8 w-8 text-sky-600 sm:h-9 sm:w-9" /><h2 className="mt-3 text-xl font-extrabold text-slate-950 sm:mt-4 sm:text-2xl">Free plan previews</h2><p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Start with watermarked PDF previews and key dimensions before buying complete files.</p><Button href="/free-house-plans" className="mt-4 sm:mt-5">Download free plans</Button></Card>
            <Card className="p-5 sm:p-6"><Building2 className="h-8 w-8 text-slate-700 sm:h-9 sm:w-9" /><h2 className="mt-3 text-xl font-extrabold text-slate-950 sm:mt-4 sm:text-2xl">CAD/Revit packs</h2><p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">DWG, Revit and IFC packages for professionals who need editable project files.</p><Button href="/cad-revit-house-plans" className="mt-4 sm:mt-5" variant="secondary">Browse CAD/Revit</Button></Card>
            <Card className="p-5 sm:p-6"><Calculator className="h-8 w-8 text-sky-600 sm:h-9 sm:w-9" /><h2 className="mt-3 text-xl font-extrabold text-slate-950 sm:mt-4 sm:text-2xl">Project tools</h2><p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">Use plan matching, plot checks, cost estimates and practical project calculators.</p><Button href="/tools" className="mt-4 sm:mt-5" variant="outline">Open tools</Button></Card>
          </div>
        </section>
        <section className="section-shell py-12 sm:py-20">
          <div className="grid gap-3 min-[520px]:grid-cols-2 lg:grid-cols-4">
            {assuranceLinks.map(({ title, copy, icon: Icon, href }) => (
              <Card key={title} className="p-4 sm:p-5">
                <Icon className="h-7 w-7 text-sky-600" />
                <h3 className="mt-4 text-lg font-extrabold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
                <Button href={href} variant="outline" className="mt-4 w-full">Go</Button>
              </Card>
            ))}
          </div>
        </section>
        <section className="section-shell py-12 sm:py-20">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
            <div className="min-w-0"><p className="section-kicker">Designed for real decisions</p><h2 className="section-title">The details you need before you build</h2><p className="mt-3 leading-7 text-slate-600">Every plan helps you understand the space, the land it needs, and the drawing formats available before you commit.</p></div>
            <div className="grid gap-3 min-[520px]:grid-cols-2 sm:gap-4">{["Clear dimensions in metric and US units", "Free previews before you purchase", "Practical plot-fit information", "Professional PDF, CAD and Revit options"].map((item) => <p key={item} className="flex gap-3 rounded-xl bg-white p-4 font-semibold text-slate-700 shadow-sm sm:rounded-2xl sm:p-5"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" /> {item}</p>)}</div>
          </div>
        </section>
        <section className="border-y border-white/80 bg-white/55 backdrop-blur">
          <div className="section-shell py-10 sm:py-20"><div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"><div className="min-w-0"><p className="section-kicker">Build with context</p><h2 className="section-title">Latest guides</h2><p className="mt-2 text-slate-600">Helpful articles for choosing, adapting and building from house plans.</p></div><ShieldCheck className="hidden h-10 w-10 shrink-0 text-sky-500 sm:block" /></div><div className="mt-5 grid gap-4 md:grid-cols-3">{mockBlogPosts.slice(0, 3).map((post) => <BlogCard key={post.id} post={post} />)}</div></div>
        </section>
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
