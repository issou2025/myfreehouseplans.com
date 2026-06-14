import { BarChart3, Download, Eye, MousePointerClick, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Card } from "@/components/ui/Card";
import { mockBlogPosts } from "@/lib/mockBlogPosts";
import { readPlans } from "@/lib/planData";

export const dynamic = "force-dynamic";

function Bar({ label, value, width }: { label: string; value: string; width: number }) {
  return <div><div className="mb-2 flex justify-between text-sm font-semibold text-slate-700"><span>{label}</span><span>{value}</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-sky-500" style={{ width: `${width}%` }} /></div></div>;
}

export default async function AdminAnalyticsPage() {
  const plans = await readPlans();
  const totalViews = plans.reduce((sum, plan) => sum + plan.views, 0);
  const downloads = plans.reduce((sum, plan) => sum + (plan.downloads ?? 0), 0);
  const premium = plans.reduce((sum, plan) => sum + (plan.premiumClicks ?? 0), 0);
  const cad = plans.reduce((sum, plan) => sum + (plan.cadClicks ?? 0), 0);
  return (
    <div>
      <AdminPageHeader title="Analytics" subtitle="Mock analytics for marketplace traffic, plan performance, countries, search terms and conversion signals." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Total visits" value="48,200" trend="+12%" icon={Users} />
        <AdminStatCard label="Plan page views" value={totalViews.toLocaleString()} trend="+9%" icon={Eye} />
        <AdminStatCard label="Free downloads" value={downloads.toLocaleString()} trend="+18%" icon={Download} />
        <AdminStatCard label="Premium clicks" value={premium.toLocaleString()} trend="+7%" icon={MousePointerClick} />
        <AdminStatCard label="CAD/Revit clicks" value={cad.toLocaleString()} trend="+5%" icon={BarChart3} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-6"><h2 className="text-xl font-black text-slate-950">Conversion Funnel</h2><div className="mt-5 grid gap-4"><Bar label="Visitors" value="48,200" width={100} /><Bar label="Plan views" value={totalViews.toLocaleString()} width={72} /><Bar label="Free downloads" value={downloads.toLocaleString()} width={38} /><Bar label="Premium clicks" value={premium.toLocaleString()} width={18} /><Bar label="CAD/Revit clicks" value={cad.toLocaleString()} width={9} /></div></Card>
        <Card className="p-6"><h2 className="text-xl font-black text-slate-950">Top Countries</h2><div className="mt-5 grid gap-4">{[["Nigeria", "12,400", 88], ["Niger", "9,100", 70], ["Ghana", "6,200", 52], ["United States", "5,800", 48], ["France", "3,900", 35]].map(([label, value, width]) => <Bar key={label} label={String(label)} value={String(value)} width={Number(width)} />)}</div></Card>
        <Card className="p-6"><h2 className="text-xl font-black text-slate-950">Top Plans</h2><div className="mt-4 grid gap-3">{[...plans].sort((a, b) => b.views - a.views).slice(0, 5).map((plan) => <p key={plan.id} className="flex justify-between rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">{plan.title}</span><span>{plan.views.toLocaleString()}</span></p>)}</div></Card>
        <Card className="p-6"><h2 className="text-xl font-black text-slate-950">Top Blog Posts and Search Terms</h2><div className="mt-4 grid gap-3">{mockBlogPosts.slice(0, 3).map((post) => <p key={post.id} className="rounded-lg bg-slate-50 p-3 text-sm font-semibold">{post.title}</p>)}{["free 3 bedroom house plans pdf", "20x20m / 66x66 ft house plan", "revit house plan files"].map((term) => <p key={term} className="rounded-lg bg-sky-50 p-3 text-sm font-semibold text-sky-700">{term}</p>)}</div></Card>
      </div>
    </div>
  );
}
