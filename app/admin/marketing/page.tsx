import { ArrowRight, BadgePercent, BarChart3, CalendarDays, CheckCircle2, ClipboardCheck, DollarSign, FileText, Flame, Globe2, Layers3, Mail, Megaphone, MousePointerClick, SearchCheck, Sparkles, Target, TrendingUp, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { mockBlogPosts } from "@/lib/mockBlogPosts";
import { readPlans } from "@/lib/planData";

export const dynamic = "force-dynamic";

const campaigns = [
  { name: "Free PDF Lead Magnet", channel: "SEO + Homepage", goal: "Grow email leads", status: "Live", metric: "2,840 leads", lift: "+18%" },
  { name: "20x20m / 66x66 ft Plot Plan Finder", channel: "Search", goal: "Capture high intent visitors", status: "Testing", metric: "14.2% CTR", lift: "+9%" },
  { name: "CAD/Revit Pro Pack", channel: "Retargeting", goal: "Sell editable files", status: "Ready", metric: "$4,900 est.", lift: "+7%" },
  { name: "Before You Build Guides", channel: "Content", goal: "Educate and nurture", status: "Draft", metric: "12 posts", lift: "+22%" }
] as const;

const funnel = [
  { label: "Visitors", value: "48,200", width: 100, icon: Users },
  { label: "Plan viewers", value: "19,430", width: 72, icon: Globe2 },
  { label: "Free PDF leads", value: "7,410", width: 44, icon: FileText },
  { label: "Premium intent", value: "2,080", width: 22, icon: MousePointerClick },
  { label: "CAD/Revit intent", value: "860", width: 12, icon: Layers3 }
] as const;

const offers = [
  { title: "Starter Preview", price: "Free", copy: "Watermarked PDF preview in exchange for email and project intent.", icon: FileText },
  { title: "Premium PDF Pack", price: "$49", copy: "Dimensioned plan pack with stronger build-ready positioning.", icon: BadgePercent },
  { title: "CAD/Revit Pro", price: "$149+", copy: "Editable professional files for architects, engineers and contractors.", icon: Layers3 }
] as const;

const landingPages = [
  ["Free 3 Bedroom House Plans PDF", "/free-house-plans", "Lead magnet", "High"],
  ["Modern House Plans for 20x20m / 66x66 ft Plot", "/plans?plot=20x20", "SEO landing", "High"],
  ["CAD and Revit House Plans", "/cad-revit-house-plans", "Revenue page", "Medium"],
  ["Low Cost House Plans for Hot Climate", "/plans?style=low-cost", "SEO landing", "Medium"],
  ["Premium House Plans", "/premium-house-plans", "Conversion page", "High"]
] as const;

const calendar = [
  ["Mon", "Publish SEO landing page", "20x20m / 66x66 ft plot plan page"],
  ["Tue", "Improve offer copy", "Premium PDF comparison"],
  ["Wed", "Email campaign", "Free preview follow-up"],
  ["Thu", "Retargeting angle", "CAD/Revit professional files"],
  ["Fri", "Content refresh", "Before-you-build checklist"]
] as const;

function MarketingCard({ title, value, copy, icon: Icon }: { title: string; value: string; copy: string; icon: LucideIcon }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="safe-break mt-1 text-3xl font-black text-slate-950">{value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-600">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </Card>
  );
}

function FunnelBar({ label, value, width, icon: Icon }: { label: string; value: string; width: number; icon: LucideIcon }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
        <span className="flex min-w-0 items-center gap-2"><Icon className="h-4 w-4 shrink-0 text-sky-600" /> <span className="truncate">{label}</span></span>
        <span className="shrink-0">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-sky-500" style={{ width: `${width}%` }} /></div>
    </div>
  );
}

export default async function AdminMarketingPage() {
  const plans = await readPlans();
  const totalViews = plans.reduce((sum, plan) => sum + plan.views, 0);
  const premiumClicks = plans.reduce((sum, plan) => sum + (plan.premiumClicks ?? 0), 0);
  const cadClicks = plans.reduce((sum, plan) => sum + (plan.cadClicks ?? 0), 0);
  const leadRate = `${Math.round((plans.reduce((sum, plan) => sum + (plan.downloads ?? 0), 0) / Math.max(totalViews, 1)) * 100)}%`;
  const topPlans = [...plans].sort((a, b) => (b.premiumClicks ?? 0) + (b.cadClicks ?? 0) - ((a.premiumClicks ?? 0) + (a.cadClicks ?? 0))).slice(0, 4);

  return (
    <div>
      <AdminPageHeader
        title="Marketing Command Center"
        subtitle="Plan campaigns, conversion funnels, SEO landing pages, offers and growth actions from one admin workspace."
        actions={<Button href="/" variant="outline">Preview public site</Button>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Marketing Score" value="84/100" trend="Strong foundation" icon={Target} tone="green" />
        <AdminStatCard label="Lead Rate" value={leadRate} trend="Free PDF funnel" icon={Mail} tone="sky" />
        <AdminStatCard label="Premium Intent" value={premiumClicks.toLocaleString()} trend="+9% mock" icon={MousePointerClick} tone="amber" />
        <AdminStatCard label="CAD/Revit Intent" value={cadClicks.toLocaleString()} trend="+7% mock" icon={Layers3} tone="purple" />
        <AdminStatCard label="SEO Assets" value={String(mockBlogPosts.length + 5)} trend="Posts + landing pages" icon={SearchCheck} tone="sky" />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-slate-950 to-sky-800 p-5 text-white sm:p-6">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase tracking-wide text-sky-200">Growth cockpit</p>
                <h2 className="safe-break mt-2 text-2xl font-black">Turn plan traffic into leads, paid files and modification requests</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">A real marketing admin needs campaigns, offers, landing pages and daily actions, not just content editing.</p>
              </div>
              <AdminActionButton variant="premium" className="w-full lg:w-auto" message="Campaign launch queued in MVP mode.">
                <Megaphone className="h-4 w-4" /> Launch campaign
              </AdminActionButton>
            </div>
          </div>
          <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-3">
            <MarketingCard title="Estimated revenue" value="$8.7k" copy="Mock monthly upside from PDF and CAD/Revit intent." icon={DollarSign} />
            <MarketingCard title="Hot segments" value="6" copy="Plot size, bedroom count, file format and country clusters." icon={Flame} />
            <MarketingCard title="Growth tasks" value="18" copy="SEO, CTA, offer, email and landing page improvements." icon={ClipboardCheck} />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-sky-600" />
            <h2 className="text-xl font-black text-slate-950">Conversion Funnel</h2>
          </div>
          <div className="mt-5 grid gap-4">
            {funnel.map((item) => <FunnelBar key={item.label} {...item} />)}
          </div>
          <Button href="/admin/analytics" variant="outline" className="mt-5 w-full">Open analytics <ArrowRight className="h-4 w-4" /></Button>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="overflow-x-auto">
          <div className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-black text-slate-950">Campaign Board</h2>
              <p className="mt-1 text-sm text-slate-600">Mock campaigns with channel, goal, status and growth signal.</p>
            </div>
            <AdminActionButton message="New campaign draft created in MVP mode."><Sparkles className="h-4 w-4" /> New campaign</AdminActionButton>
          </div>
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Campaign", "Channel", "Goal", "Status", "Signal", "Action"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((campaign) => (
                <tr key={campaign.name}>
                  <td className="px-4 py-3 font-semibold text-slate-950">{campaign.name}</td>
                  <td className="px-4 py-3">{campaign.channel}</td>
                  <td className="px-4 py-3">{campaign.goal}</td>
                  <td className="px-4 py-3"><Badge tone={campaign.status === "Live" ? "green" : campaign.status === "Testing" ? "blue" : campaign.status === "Ready" ? "purple" : "slate"}>{campaign.status}</Badge></td>
                  <td className="px-4 py-3"><span className="font-bold text-emerald-600">{campaign.lift}</span> <span className="text-slate-500">{campaign.metric}</span></td>
                  <td className="px-4 py-3"><AdminActionButton variant="outline" message={`${campaign.name} opened in MVP mode.`}>Open</AdminActionButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-slate-950">Offer Ladder</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">A powerful marketing site needs a clean path from free value to paid professional files.</p>
          <div className="mt-4 grid gap-3">
            {offers.map(({ title, price, copy, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-black text-slate-950">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-sky-600 shadow-sm"><Icon className="h-4 w-4" /></span>
                </div>
                <p className="mt-3 text-2xl font-black text-slate-950">{price}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-5">
          <div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-sky-600" /><h2 className="text-xl font-black text-slate-950">Weekly Growth Calendar</h2></div>
          <div className="mt-4 grid gap-3">
            {calendar.map(([day, title, detail]) => (
              <div key={day} className="grid gap-3 rounded-2xl bg-slate-50 p-3 min-[520px]:grid-cols-[4rem_1fr_auto] min-[520px]:items-center">
                <span className="font-black text-sky-700">{day}</span>
                <div className="min-w-0"><p className="font-semibold text-slate-950">{title}</p><p className="text-sm text-slate-500">{detail}</p></div>
                <AdminActionButton variant="outline" className="w-full min-[520px]:w-auto" message={`${title} queued.`}>Queue</AdminActionButton>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-x-auto">
          <div className="p-5">
            <h2 className="text-xl font-black text-slate-950">Landing Page Pipeline</h2>
            <p className="mt-1 text-sm text-slate-600">Use this as the future control center for SEO pages, ad pages and conversion pages.</p>
          </div>
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Page", "URL", "Type", "Priority", "Action"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {landingPages.map(([page, url, type, priority]) => (
                <tr key={page}>
                  <td className="px-4 py-3 font-semibold text-slate-950">{page}</td>
                  <td className="px-4 py-3 text-slate-500">{url}</td>
                  <td className="px-4 py-3">{type}</td>
                  <td className="px-4 py-3"><Badge tone={priority === "High" ? "red" : "orange"}>{priority}</Badge></td>
                  <td className="px-4 py-3"><AdminActionButton variant="outline" message={`${page} added to the page optimization queue.`}>Optimize</AdminActionButton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-xl font-black text-slate-950">Top Revenue Opportunities</h2>
          <div className="mt-4 grid gap-3">
            {topPlans.map((plan) => (
              <div key={plan.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <p className="safe-break font-bold text-slate-950">{plan.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{(plan.premiumClicks ?? 0).toLocaleString()} premium clicks - {(plan.cadClicks ?? 0).toLocaleString()} CAD/Revit clicks</p>
                  </div>
                  <Button href={`/admin/plans/${plan.id}/edit`} variant="outline" className="w-full sm:w-auto">Improve offer</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-xl font-black text-slate-950">Conversion Checklist</h2>
          <div className="mt-4 grid gap-3">
            {["Hero has one clear product promise", "Every plan page has free and paid CTA", "Lead magnet captures email before download", "Premium PDF and CAD/Revit offers are separated", "Retargeting audience can be built from high-intent clicks", "SEO pages target plot size, rooms, style and file format"].map((item) => (
              <p key={item} className="flex gap-3 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="h-5 w-5 shrink-0" /> {item}
              </p>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-6 rounded-2xl border border-sky-100 bg-sky-50/80 p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-sky-700" /><h2 className="text-xl font-black text-slate-950">Next power move</h2></div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">Connect real analytics, email capture, Stripe products and campaign UTM tracking so this admin moves from mock marketing cockpit to real growth engine.</p>
          </div>
          <div className="grid gap-2 min-[420px]:grid-cols-2 lg:flex">
            <Button href="/admin/seo" variant="outline" className="w-full lg:w-auto">SEO Center</Button>
            <Button href="/admin/homepage" className="w-full lg:w-auto">Homepage Builder</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
