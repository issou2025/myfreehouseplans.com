import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CTASection() {
  return (
    <section className="section-shell py-10 sm:py-16">
      <div className="relative overflow-hidden rounded-[1.5rem] bg-slate-950 px-4 py-8 shadow-[0_30px_100px_rgba(15,23,42,0.25)] min-[380px]:px-6 sm:rounded-[2rem] sm:px-10 sm:py-14">
      <div className="absolute inset-0 subtle-grid opacity-20" />
      <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-sky-500/25 blur-3xl" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-balance text-2xl font-black text-white sm:text-3xl md:text-4xl">Ready to compare serious house plans?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Start with free previews, then upgrade only when you need full PDF, CAD, Revit or IFC files.</p>
        </div>
        <div className="grid gap-2 min-[420px]:grid-cols-2 md:flex md:flex-wrap md:gap-3">
          <Button href="/plans">Browse Plans <ArrowRight className="h-4 w-4" /></Button>
          <Button href="/contact" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950"><MessageCircle className="h-4 w-4" /> Request Custom Plan</Button>
        </div>
      </div></div>
    </section>
  );
}
