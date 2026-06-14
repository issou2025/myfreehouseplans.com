import { BookOpen, Download, Eye, FileText, Folder, Globe2, Home, Image, ListOrdered, Mail, Megaphone, MousePointerClick, PencilLine, SearchCheck, Star, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminCommandCenter, AdminOpsStrip } from "@/components/admin/AdminCommandCenter";
import { AdminMessageTable } from "@/components/admin/AdminMessageTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPlanTable } from "@/components/admin/AdminPlanTable";
import { AdminPublishingPipeline } from "@/components/admin/AdminPublishingPipeline";
import { AdminReadinessChecklist } from "@/components/admin/AdminReadinessChecklist";
import { AdminScoreBadge } from "@/components/admin/AdminScoreBadge";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getMissingItems, getPlanSeoScore, getReadinessScore } from "@/lib/adminMetrics";
import { mockBlogPosts } from "@/lib/mockBlogPosts";
import { mockMessages } from "@/lib/mockMessages";
import { readPlans } from "@/lib/planData";
import { calculatePriorityScore, sortPlansForCatalog } from "@/lib/planRanking";
import type { Plan } from "@/types/plan";

export const dynamic = "force-dynamic";

function AttentionList({ title, plans, empty }: { title: string; plans: Plan[]; empty: string }) {
  return (
    <Card className="p-5">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-3">
        {plans.length ? plans.slice(0, 4).map((plan) => (
          <div key={plan.id} className="flex flex-col justify-between gap-3 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="font-semibold text-slate-950">{plan.title}</p>
              <p className="mt-1 text-xs text-slate-500">{getMissingItems(plan).join(", ") || "Review recommended"}</p>
            </div>
            <Button href={`/admin/plans/${plan.id}/edit`} className="w-full sm:w-auto" variant="outline">Fix</Button>
          </div>
        )) : <p className="text-sm text-slate-500">{empty}</p>}
      </div>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const plans = await readPlans();
  const published = plans.filter((p) => p.status === "Published");
  const drafts = plans.filter((p) => p.status === "Draft");
  const free = plans.filter((p) => p.freePackEnabled);
  const premium = plans.filter((p) => p.premiumPackEnabled);
  const cad = plans.filter((p) => p.cadPackEnabled);
  const totalViews = plans.reduce((sum, plan) => sum + plan.views, 0);
  const totalDownloads = plans.reduce((sum, plan) => sum + (plan.downloads ?? 0), 0);
  const totalPremiumClicks = plans.reduce((sum, plan) => sum + (plan.premiumClicks ?? 0), 0);
  const totalCadClicks = plans.reduce((sum, plan) => sum + (plan.cadClicks ?? 0), 0);

  const stats = [
    ["Total Plans", String(plans.length), "Catalog inventory", Folder, "/admin/plans", "sky"],
    ["Published Plans", String(published.length), "Visible publicly", Eye, "/admin/plans", "green"],
    ["Draft Plans", String(drafts.length), "Needs editorial work", PencilLine, "/admin/plans", "amber"],
    ["Featured Plans", String(plans.filter((p) => p.featured).length), "Homepage priority", Star, "/admin/ranking", "purple"],
    ["Free Plans", String(free.length), "Preview enabled", Download, "/admin/plans", "green"],
    ["Premium Plans", String(premium.length), "PDF pack enabled", Star, "/admin/plans", "amber"],
    ["CAD/Revit Plans", String(cad.length), "Editable files", FileText, "/admin/plans", "purple"],
    ["Blog Posts", String(mockBlogPosts.length), "SEO articles", BookOpen, "/admin/blog", "sky"],
    ["Media Files", "2", "Local uploads", Image, "/admin/media", "slate"],
    ["New Messages", String(mockMessages.filter((m) => m.status === "New").length), "Needs response", Mail, "/admin/messages", "red"],
    ["Mock Views", totalViews.toLocaleString(), "+12% this week", TrendingUp, "/admin/analytics", "sky"],
    ["Mock Downloads", totalDownloads.toLocaleString(), "+18% this week", Download, "/admin/analytics", "green"],
    ["Premium Clicks", totalPremiumClicks.toLocaleString(), "+9% this week", MousePointerClick, "/admin/analytics", "amber"],
    ["CAD/Revit Clicks", totalCadClicks.toLocaleString(), "+7% this week", FileText, "/admin/analytics", "purple"]
  ] as const;

  const needingSeo = plans.filter((plan) => getPlanSeoScore(plan) < 85);
  const missingImages = plans.filter((plan) => !plan.mainImage || !plan.galleryImages.length);
  const topPlans = [...plans].sort((a, b) => b.views - a.views).slice(0, 5);
  const rankedPlans = sortPlansForCatalog(plans);
  const rankingAlerts = rankedPlans.filter((plan) => !plan.manualRank || calculatePriorityScore(plan) < 70);
  const quickActions: Array<{ label: string; href: string; Icon: LucideIcon }> = [
    { label: "Add New Plan", href: "/admin/plans/new", Icon: PencilLine },
    { label: "Upload Media", href: "/admin/media", Icon: Image },
    { label: "Create Blog Post", href: "/admin/blog/new", Icon: BookOpen },
    { label: "Marketing Center", href: "/admin/marketing", Icon: Megaphone },
    { label: "Manage Ranking", href: "/admin/ranking", Icon: ListOrdered },
    { label: "Edit Homepage", href: "/admin/homepage", Icon: Home },
    { label: "Manage SEO", href: "/admin/seo", Icon: SearchCheck },
    { label: "View Public Site", href: "/", Icon: Globe2 }
  ];

  return (
    <div>
      <AdminPageHeader title="Dashboard" subtitle="A powerful CMS command center for publishing quality, SEO readiness, traffic signals and marketplace operations." actions={<Button href="/admin/plans/new">Add New Plan</Button>} />
      <AdminOpsStrip />
      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {quickActions.map(({ label, href, Icon }) => (
          <Button key={label} href={href} variant={label === "Add New Plan" ? "primary" : "outline"} className="w-full">
            <Icon className="h-4 w-4" /> {label}
          </Button>
        ))}
      </section>
      <section className="mt-6"><AdminCommandCenter /></section>
      <section className="mt-6"><AdminPublishingPipeline /></section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, value, trend, icon, href, tone]) => <AdminStatCard key={label} label={label} value={value} trend={trend} icon={icon} href={href} tone={tone} />)}
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-black text-slate-950">Recent Plans</h2>
        <AdminPlanTable plans={plans.slice(0, 5)} compact />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <AttentionList title="Ranking Alerts" plans={rankingAlerts} empty="Ranking rules look healthy." />
        <AttentionList title="Plans Needing SEO Improvement" plans={needingSeo} empty="All plans have strong SEO." />
        <AttentionList title="Plans Missing Images" plans={missingImages} empty="All plans have image coverage." />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-5">
          <h2 className="text-xl font-black text-slate-950">Mock Traffic Overview</h2>
          <div className="mt-5 grid gap-4">
            {[
              ["Visitors", 100, "48,200"],
              ["Plan views", 72, totalViews.toLocaleString()],
              ["Free downloads", 38, totalDownloads.toLocaleString()],
              ["Premium clicks", 18, totalPremiumClicks.toLocaleString()],
              ["CAD/Revit clicks", 9, totalCadClicks.toLocaleString()]
            ].map(([label, width, value]) => (
              <div key={String(label)}>
                <div className="mb-2 flex justify-between text-sm font-semibold text-slate-700"><span>{label}</span><span>{value}</span></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-sky-500" style={{ width: `${width}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-xl font-black text-slate-950">Top Performing Plans</h2>
          <div className="mt-4 grid gap-3">
            {topPlans.map((plan) => (
              <div key={plan.id} className="flex flex-col justify-between gap-3 rounded-lg bg-slate-50 p-3 min-[420px]:flex-row min-[420px]:items-center">
                <div className="min-w-0"><p className="safe-break font-semibold text-slate-950">{plan.title}</p><p className="text-xs text-slate-500">{plan.views.toLocaleString()} views</p></div>
                <AdminScoreBadge score={getReadinessScore(plan)} />
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div>
          <h2 className="mb-4 text-2xl font-black text-slate-950">Latest Messages</h2>
          <AdminMessageTable messages={mockMessages.slice(0, 4)} compact />
        </div>
        <AdminReadinessChecklist plan={plans[0]} />
      </section>
    </div>
  );
}
