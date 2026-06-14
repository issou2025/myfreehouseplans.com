import { adminPipelineStages } from "@/lib/mockAdminOps";
import { Card } from "@/components/ui/Card";

export function AdminPublishingPipeline() {
  const total = adminPipelineStages.reduce((sum, stage) => sum + stage.count, 0);
  return (
    <Card className="p-5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-black text-slate-950">Publishing Pipeline</h2>
          <p className="mt-1 text-sm text-slate-600">Mock operational view from import to published catalog.</p>
        </div>
        <p className="text-sm font-bold text-slate-500">{total} content items</p>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {adminPipelineStages.map((stage) => (
          <div key={stage.label} className="rounded-2xl bg-slate-50 p-4">
            <div className={`h-2 rounded-full ${stage.color}`} />
            <p className="mt-3 text-sm font-bold text-slate-700">{stage.label}</p>
            <p className="mt-1 text-3xl font-black text-slate-950">{stage.count}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
