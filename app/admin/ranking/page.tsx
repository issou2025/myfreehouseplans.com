import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminRankingManager } from "@/components/admin/AdminRankingManager";
import { Button } from "@/components/ui/Button";
import { readPlans } from "@/lib/planData";

export const dynamic = "force-dynamic";

export default async function AdminRankingPage() {
  const plans = await readPlans();
  return (
    <div>
      <AdminPageHeader
        title="Ranking Manager"
        subtitle="Control catalog order, homepage placement, featured flags and intelligent priority scoring."
        actions={<Button href="/plans" variant="outline">Preview Catalog</Button>}
      />
      <AdminRankingManager plans={plans} />
    </div>
  );
}
