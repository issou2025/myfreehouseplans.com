import { AdminPlanForm } from "@/components/admin/AdminPlanForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function AdminNewPlanPage() {
  return <div><AdminPageHeader title="Add Plan" subtitle="Create a complete listing with technical data, gallery, pack pricing, SEO, FAQ and publishing readiness." /><AdminPlanForm /></div>;
}
