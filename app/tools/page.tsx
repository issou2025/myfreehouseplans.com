import { Calculator, ClipboardCheck, DraftingCompass, Hammer, Home, MapPinned, Paintbrush, Ruler, Search, Shapes, SquareStack } from "lucide-react";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { HousePlanFinderMock } from "@/components/public/HousePlanFinderMock";
import { PlotCheckerMock } from "@/components/public/PlotCheckerMock";
import { ProjectJourney } from "@/components/public/ProjectJourney";
import { PublicPageHero } from "@/components/public/PublicPageHero";
import { RelatedArticles, RelatedPlans } from "@/components/public/RelatedContent";
import { ToolCard } from "@/components/public/ToolCard";
import { Button } from "@/components/ui/Button";

const tools = [
  ["House Area Calculator", "Estimate room, floor and total house area.", Home],
  ["Construction Cost Estimator", "Plan early budgets by area and quality level.", Calculator],
  ["Concrete Volume Calculator", "Estimate concrete needs for slabs, beams and columns.", Shapes],
  ["Brick Quantity Calculator", "Estimate blocks or bricks for walls.", SquareStack],
  ["Mortar Calculator", "Calculate mortar quantities for masonry work.", Hammer],
  ["Paint Quantity Calculator", "Estimate paint requirements for walls and ceilings.", Paintbrush],
  ["Floor Plan Analyzer", "Review circulation, comfort and buildability signals.", ClipboardCheck],
  ["House Plan Finder", "Match plans to bedrooms, budget and plot size.", Search],
  ["Room Size Checker", "Check whether room dimensions feel practical.", Ruler]
] as const;

export default function ToolsPage() {
  return <><Header /><main><PublicPageHero eyebrow="Project decision workspace" title="Use your real constraints to make a better plan choice." description="Start with land dimensions, setbacks, rooms and budget. These tools turn a broad catalog into a shorter, more useful decision list." icon={ClipboardCheck} actions={<><Button href="#plot-checker">Check my plot</Button><Button href="#plan-finder" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white hover:text-slate-950">Find matching plans</Button></>} highlights={[{ label: "Plot compatibility", value: "Setbacks, road and buildable area", icon: MapPinned }, { label: "Plan matching", value: "Rooms, budget, style and plot", icon: Search }, { label: "Dual units", value: "Meters and feet throughout", icon: Ruler }]} /><ProjectJourney current="check" /><div className="section-shell py-10 sm:py-12"><section id="plot-checker" className="scroll-mt-32"><PlotCheckerMock /></section><section id="plan-finder" className="mt-8 scroll-mt-32"><HousePlanFinderMock /></section><section id="calculators" className="mt-10 scroll-mt-32 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{tools.map(([title, description, icon]) => <ToolCard key={title} title={title} description={description} icon={icon} />)}<ToolCard title="Plot Compatibility Checker" description="Check land dimensions and setback logic before buying files." icon={DraftingCompass} /></section><RelatedPlans /><RelatedArticles /></div></main><Footer /></>;
}
