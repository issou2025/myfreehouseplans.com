import { AdminPlanForm } from "@/components/admin/AdminPlanForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { readPlans } from "@/lib/planData";

export default async function AdminEditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const plans = await readPlans();
  const plan = plans.find((item) => item.id === id);
  if (!plan) return <div><AdminPageHeader title="Plan not found" subtitle="This plan does not exist or is no longer available." /></div>;
  return <div><AdminPageHeader title="Edit Plan" subtitle={`Editing ${plan.title}. Review quality, SEO, packs and publishing readiness before release.`} /><AdminPlanForm plan={plan} planId={id} /></div>;
}
