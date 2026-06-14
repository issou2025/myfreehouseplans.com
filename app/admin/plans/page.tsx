import { AdminBulkOpsPanel } from "@/components/admin/AdminBulkOpsPanel";
import { AdminPlanTable } from "@/components/admin/AdminPlanTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPublishingPipeline } from "@/components/admin/AdminPublishingPipeline";
import { Button } from "@/components/ui/Button";
import { readPlans } from "@/lib/planData";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const plans = await readPlans();
  return <div><AdminPageHeader title="Plans" subtitle="Search, filter, score, import, validate and bulk-manage the full house plan catalog." actions={<Button href="/admin/plans/new">Add Plan</Button>} /><AdminPublishingPipeline /><section className="mt-6"><AdminBulkOpsPanel /></section><section className="mt-6"><AdminPlanTable plans={plans} /></section></div>;
}
