import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bath, BedDouble, FileArchive, FileText, Home, Layers, Ruler, ShieldCheck, Sparkles } from "lucide-react";
import { PackComparison } from "@/components/public/PackComparison";
import { Footer } from "@/components/public/Footer";
import { FutureExtensionSimulator } from "@/components/public/FutureExtensionSimulator";
import { Header } from "@/components/public/Header";
import { PlanCard } from "@/components/public/PlanCard";
import { PlanImageGallery } from "@/components/public/PlanImageGallery";
import { PlotCheckerMock } from "@/components/public/PlotCheckerMock";
import { ProjectJourney } from "@/components/public/ProjectJourney";
import { NextStepCTA, RelatedArticles, RelatedPlans, RelatedTools } from "@/components/public/RelatedContent";
import { SmartPlanAnalysis } from "@/components/public/SmartPlanAnalysis";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { readPlans } from "@/lib/planData";
import { getPlanPreviewImages } from "@/lib/planImages";
import { isPlanFileAvailable } from "@/lib/planFileAvailability";
import { getPlanCheckoutUrl, getRequestHref, isGumroadUrl } from "@/lib/payments";
import { formatAreaDual, formatPlotDual } from "@/lib/unitFormat";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const plan = (await readPlans()).find((item) => item.slug === slug && item.status === "Published");
  return { title: plan ? `${plan.title} | myfreehouseplans.com` : "Plan not found", description: plan?.shortDescription };
}

export default async function PlanDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const plan = (await readPlans()).find((item) => item.slug === slug && item.status === "Published");
  if (!plan) notFound();
  const previewImages = getPlanPreviewImages(plan);
  const details = [
    ["Total area", formatAreaDual(plan.totalArea), Ruler],
    ["Plot size", formatPlotDual(plan.plotWidth, plan.plotLength), Home],
    ["Bedrooms", plan.bedrooms, BedDouble],
    ["Bathrooms", plan.bathrooms, Bath],
    ["Floors", plan.floors, Layers],
    ["Roof type", plan.roofType, Home],
    ["Style", plan.architecturalStyle, Sparkles],
    ["Files", plan.badges.filter((b) => ["DWG", "Revit", "IFC", "Premium PDF"].includes(b)).join(", "), FileText]
  ] as const;
  const freePdfUrl = isPlanFileAvailable(plan.freePdfUrl) ? plan.freePdfUrl : "";
  const premiumCheckoutUrl = getPlanCheckoutUrl(plan, "premium");
  const cadCheckoutUrl = getPlanCheckoutUrl(plan, "cad");
  const requestHref = (pack: string) => getRequestHref(plan, pack);
  const freePdfHref = freePdfUrl || requestHref("Free PDF");
  const premiumHref = premiumCheckoutUrl || requestHref("Premium PDF");
  const cadHref = cadCheckoutUrl || requestHref("CAD/Revit pack");
  const premiumHasFiles = [plan.premiumPdfUrl, plan.premiumZipUrl].some(isPlanFileAvailable);
  const cadHasFiles = [plan.cadZipUrl, plan.dwgFileUrl, plan.revitFileUrl, plan.ifcFileUrl].some(isPlanFileAvailable);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: plan.title,
    description: plan.shortDescription,
    sku: plan.reference,
    offers: { "@type": "Offer", price: plan.premiumPrice, priceCurrency: plan.currency ?? "USD", url: premiumCheckoutUrl || undefined }
  };
  const fileAvailability = [
    { label: "Free PDF", value: plan.freePdfUrl, icon: FileText, kind: "free" as const, available: Boolean(freePdfUrl), href: freePdfHref, button: freePdfUrl ? "Open free preview" : "Request free PDF", note: freePdfUrl || "Request this preview from support." },
    { label: "Premium PDF", value: plan.premiumPdfUrl, icon: FileText, kind: "premium" as const, available: premiumHasFiles || Boolean(premiumCheckoutUrl), href: premiumHref, button: premiumCheckoutUrl ? "Buy Premium PDF" : "Request Premium PDF", note: premiumCheckoutUrl ? "Secure Gumroad checkout before delivery." : "Available on request." },
    { label: "Premium ZIP", value: plan.premiumZipUrl, icon: FileArchive, kind: "premium" as const, available: premiumHasFiles || Boolean(premiumCheckoutUrl), href: premiumHref, button: premiumCheckoutUrl ? "Buy Premium Pack" : "Request Premium Pack", note: premiumCheckoutUrl ? "Delivered after secure checkout." : "Available on request." },
    { label: "DWG", value: plan.dwgFileUrl, icon: FileText, kind: "cad" as const, available: cadHasFiles || Boolean(cadCheckoutUrl), href: cadHref, button: cadCheckoutUrl ? "Buy CAD/Revit Pack" : "Request CAD/Revit", note: cadCheckoutUrl ? "Included in the professional checkout." : "Available on request." },
    { label: "Revit RVT", value: plan.revitFileUrl, icon: FileText, kind: "cad" as const, available: cadHasFiles || Boolean(cadCheckoutUrl), href: cadHref, button: cadCheckoutUrl ? "Buy CAD/Revit Pack" : "Request CAD/Revit", note: cadCheckoutUrl ? "Included in the professional checkout." : "Available on request." },
    { label: "IFC", value: plan.ifcFileUrl, icon: FileText, kind: "cad" as const, available: cadHasFiles || Boolean(cadCheckoutUrl), href: cadHref, button: cadCheckoutUrl ? "Buy CAD/Revit Pack" : "Request CAD/Revit", note: cadCheckoutUrl ? "Included in the professional checkout." : "Available on request." },
    { label: "CAD/Revit ZIP", value: plan.cadZipUrl, icon: FileArchive, kind: "cad" as const, available: cadHasFiles || Boolean(cadCheckoutUrl), href: cadHref, button: cadCheckoutUrl ? "Buy CAD/Revit Pack" : "Request CAD/Revit", note: cadCheckoutUrl ? "Delivered after secure checkout." : "Available on request." }
  ].filter((item) => item.available && (item.kind !== "free" || isPlanFileAvailable(item.value)));

  return (
    <>
      <Header />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <section className="relative overflow-hidden bg-slate-950 py-5 text-white sm:py-10">
          <div className="absolute inset-0 subtle-grid opacity-20" />
          <div className="section-shell relative">
            <p className="safe-break text-sm font-semibold text-slate-300">Home / Plans / {plan.title}</p>
            <div className="mt-4 grid gap-5 sm:mt-6 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <PlanImageGallery images={previewImages} title={plan.title} />
          <Card className="h-fit border-white/10 bg-white/95 p-4 text-slate-700 sm:p-6 lg:sticky lg:top-24">
            <div className="flex flex-wrap gap-2">{plan.badges.map((badge) => <Badge key={badge} tone={badge.includes("Free") ? "green" : badge.includes("DWG") || badge.includes("Revit") || badge.includes("IFC") ? "purple" : "amber"}>{badge}</Badge>)}</div>
            <h1 className="safe-break mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{plan.title}</h1>
            <p className="mt-2 text-sm font-bold text-sky-600">{plan.reference}</p>
            <p className="mt-4 leading-7 text-slate-600">{plan.shortDescription}</p>
            <div className="mt-5 grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">{details.map(([k, v, Icon]) => <div key={String(k)} className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-3"><Icon className="mb-2 h-4 w-4 text-sky-500" /><p className="text-xs text-slate-500">{k}</p><p className="safe-break font-bold text-slate-950">{v}</p></div>)}</div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2"><Button href={freePdfHref} className="w-full">{freePdfUrl ? "Download Free PDF" : "Request Free PDF"}</Button><Button href={premiumHref} className={`w-full ${isGumroadUrl(premiumHref) ? "gumroad-button" : ""}`} variant="premium">{premiumCheckoutUrl ? "Buy Premium PDF" : "Request Premium PDF"}</Button><Button href={cadHref} className={`w-full ${isGumroadUrl(cadHref) ? "gumroad-button" : ""}`} variant="secondary">{cadCheckoutUrl ? "Buy CAD/Revit Pack" : "Request CAD/Revit Pack"}</Button><Button href={`/contact?plan=${encodeURIComponent(plan.reference)}&title=${encodeURIComponent(plan.title)}`} className="w-full" variant="outline">Request Modification</Button></div>
            <p className="mt-4 flex gap-2 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"><ShieldCheck className="h-4 w-4" /> Local professional review required before construction.</p>
          </Card>
            </div>
          </div>
        </section>
        <ProjectJourney current="choose" />
        <div className="section-shell pb-24 pt-10 sm:py-12">
        <section><SmartPlanAnalysis plan={plan} /></section>
        <section id="plot-checker" className="mt-8 scroll-mt-32"><PlotCheckerMock plan={plan} /></section>
        <section id="future-extension" className="mt-8 scroll-mt-32"><FutureExtensionSimulator plan={plan} /></section>
        <section className="mt-12"><div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end"><div className="min-w-0"><p className="text-sm font-bold uppercase tracking-wide text-sky-600">Which pack do I need?</p><h2 className="safe-break text-3xl font-black text-slate-950">Choose Your Package</h2></div><Card className="max-w-xl p-4 text-sm leading-6 text-slate-600">Start free to review the layout. Choose Premium PDF for serious planning. Choose CAD/Revit when a professional needs editable source files.</Card></div><PackComparison /></section>
        <section className="mt-12">
          <h2 className="text-3xl font-black text-slate-950">File availability</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fileAvailability.map((file) => {
              const Icon = file.icon;
              return <Card key={file.label} className="p-4"><Icon className="h-5 w-5 text-sky-600" /><p className="mt-3 font-black text-slate-950">{file.label}</p><p className="safe-break mt-1 text-xs text-slate-500">{file.note}</p><Button href={file.href} variant="outline" className={`mt-4 w-full ${isGumroadUrl(file.href) ? "gumroad-button" : ""}`}>{file.button}</Button></Card>;
            })}
          </div>
        </section>
        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <Card className="p-4 sm:p-6"><h2 className="text-2xl font-black text-slate-950">What&apos;s included</h2><ul className="mt-4 grid gap-2 text-slate-600"><li>- Free PDF preview for first review</li><li>- Premium PDF drawings with dimensions and elevations</li><li>- CAD/Revit/IFC package when available</li><li>- 3D preview images and technical summary</li></ul></Card>
          <Card className="border-amber-100 bg-amber-50/70 p-4 sm:p-6"><h2 className="text-2xl font-black text-slate-950">Before you build</h2><p className="mt-4 leading-7 text-slate-700">This plan must be reviewed and adapted by a local architect, engineer or qualified professional before construction. Soil conditions, local regulations, climate and structural requirements may vary by country and city.</p></Card>
        </section>
        <section className="mt-12"><h2 className="text-3xl font-black text-slate-950">Full Description</h2><p className="mt-4 max-w-4xl leading-8 text-slate-600">{plan.description}</p></section>
        <section className="mt-12"><h2 className="text-3xl font-black text-slate-950">FAQ</h2><div className="mt-5 grid gap-3">{["Can I use this plan directly for construction?", "What is included in the free PDF?", "What is the difference between PDF, DWG, Revit and IFC?", "Can this plan be modified?", `Can this plan fit a ${formatPlotDual(plan.plotWidth, plan.plotLength, true)} plot?`].map((q) => <Card key={q} className="p-5"><p className="font-bold text-slate-950">{q}</p><p className="mt-2 text-sm leading-6 text-slate-600">Use this page as a professional preview. Final construction use requires local review and adaptation.</p></Card>)}</div></section>
        <NextStepCTA />
        <RelatedTools />
        <RelatedArticles />
        <RelatedPlans currentPlanId={plan.id} category={plan.category} />
        </div>
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-16px_50px_rgba(15,23,42,0.16)] backdrop-blur lg:hidden">
          <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
            <Button href={freePdfHref} className="w-full">{freePdfUrl ? "Free PDF" : "Request PDF"}</Button>
            <Button href={premiumHref} className={`w-full ${isGumroadUrl(premiumHref) ? "gumroad-button" : ""}`} variant="premium">{premiumCheckoutUrl ? "Buy Pack" : "Request Pack"}</Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
