import { Calculator, FileSearch, Hammer, MapPinned, SearchCheck } from "lucide-react";
import { BlogCard } from "@/components/public/BlogCard";
import { PlanCard } from "@/components/public/PlanCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { mockBlogPosts } from "@/lib/mockBlogPosts";
import { mockPlans } from "@/lib/mockPlans";
import { getRelatedPlans, sortPlansForCatalog } from "@/lib/planRanking";

const tools = [
  { title: "Plot Compatibility Checker", href: "/tools#plot-checker", icon: MapPinned, copy: "Check if this plan can work with your land size and setbacks." },
  { title: "Construction Cost Estimator", href: "/tools#calculators", icon: Calculator, copy: "Estimate a rough budget before you commit to a pack." },
  { title: "House Plan Finder", href: "/tools#plan-finder", icon: FileSearch, copy: "Match bedrooms, plot size, style and package format." }
];

export function RelatedPlans({ currentPlanId, category }: { currentPlanId?: string; category?: string }) {
  const currentPlan = mockPlans.find((plan) => plan.id === currentPlanId);
  const plans = currentPlan
    ? getRelatedPlans(currentPlan, mockPlans)
    : sortPlansForCatalog(mockPlans).filter((plan) => plan.id !== currentPlanId && (!category || plan.category === category)).slice(0, 3);

  return (
    <section className="mt-12">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-sky-600">Keep exploring</p>
          <h2 className="text-3xl font-black text-slate-950">Similar house plans</h2>
        </div>
        <Button href="/plans" variant="outline">View all plans</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">{plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}</div>
    </section>
  );
}

export function RelatedArticles({ currentPostId }: { currentPostId?: string }) {
  const posts = mockBlogPosts.filter((post) => post.id !== currentPostId).slice(0, 3);
  return (
    <section className="mt-12">
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-sky-600">Useful guides</p>
          <h2 className="text-3xl font-black text-slate-950">Articles that help you decide</h2>
        </div>
        <Button href="/blog" variant="outline">Read blog</Button>
      </div>
      <div className="grid gap-6 md:grid-cols-3">{posts.map((post) => <BlogCard key={post.id} post={post} />)}</div>
    </section>
  );
}

export function RelatedTools() {
  return (
    <section className="mt-12">
      <div className="mb-5">
        <p className="text-sm font-bold uppercase tracking-wide text-sky-600">Next step tools</p>
        <h2 className="text-3xl font-black text-slate-950">Check the plan before you build</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.title} className="p-5">
              <Icon className="h-6 w-6 text-sky-600" />
              <h3 className="safe-break mt-4 text-lg font-black text-slate-950">{tool.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{tool.copy}</p>
              <Button href={tool.href} variant="outline" className="mt-4 w-full">Open tool</Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export function NextStepCTA() {
  return (
    <section className="mt-12 grid gap-4 lg:grid-cols-2">
      <Card className="bg-slate-950 p-6 text-white">
        <Hammer className="h-6 w-6 text-sky-300" />
        <h2 className="mt-4 text-2xl font-black">Want a custom version?</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">Send your plot size, country, preferred style and package needs. We will turn them into a clear modification brief.</p>
        <Button href="/contact" className="mt-5 w-full sm:w-auto">Request Custom Plan</Button>
      </Card>
      <Card className="p-6">
        <SearchCheck className="h-6 w-6 text-sky-600" />
        <h2 className="mt-4 text-2xl font-black text-slate-950">Not sure this plan fits your land?</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Use the plot checker mock and read the guide before buying a professional package.</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row"><Button href="/tools#plot-checker" variant="secondary">Check My Plot</Button><Button href="/blog/how-to-know-if-a-plan-fits-your-land" variant="outline">Read Guide</Button></div>
      </Card>
    </section>
  );
}
