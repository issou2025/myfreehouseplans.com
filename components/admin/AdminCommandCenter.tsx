import { Bot, CalendarDays, CheckCircle2, ClipboardList, Rocket, SearchCheck } from "lucide-react";
import { adminAutomationRules, adminContentCalendar, adminQualityTasks } from "@/lib/mockAdminOps";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const priorityTone = {
  High: "red",
  Medium: "orange",
  Low: "slate"
} as const;

export function AdminCommandCenter() {
  return (
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <Card className="min-w-0 overflow-hidden">
        <div className="bg-gradient-to-br from-slate-950 to-sky-800 p-5 text-white sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-wide text-sky-200">CMS command center</p>
              <h2 className="mt-2 text-2xl font-black">Today&apos;s publishing priorities</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">A practical queue for plans, SEO, media, support and growth work before anything goes live.</p>
            </div>
            <Button href="/admin/plans/new" variant="premium" className="w-full sm:w-auto"><Rocket className="h-4 w-4" /> Ship Plan</Button>
          </div>
        </div>
        <div className="grid gap-3 p-4 sm:p-5">
          {adminQualityTasks.map((task) => (
            <div key={task.title} className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
                  <Badge tone="blue">{task.area}</Badge>
                  <Badge tone={task.status === "Ready" ? "green" : task.status === "Blocked" ? "red" : "slate"}>{task.status}</Badge>
                </div>
                <p className="safe-break mt-3 font-bold text-slate-950">{task.title}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">Owner: {task.owner}</p>
              </div>
              <AdminActionButton variant="outline" className="w-full md:w-auto" message={`${task.area} task opened in MVP mode.`}>Open</AdminActionButton>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid min-w-0 gap-6">
        <Card className="min-w-0 p-5">
          <div className="flex min-w-0 items-center gap-3"><Bot className="h-5 w-5 shrink-0 text-sky-600" /><h2 className="safe-break text-xl font-black text-slate-950">Mock Automation Rules</h2></div>
          <div className="mt-4 grid gap-3">
            {adminAutomationRules.slice(0, 5).map((rule) => <p key={rule} className="flex gap-2 text-sm leading-6 text-slate-600"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {rule}</p>)}
          </div>
        </Card>
        <Card className="min-w-0 p-5">
          <div className="flex min-w-0 items-center gap-3"><CalendarDays className="h-5 w-5 shrink-0 text-sky-600" /><h2 className="safe-break text-xl font-black text-slate-950">Content Calendar</h2></div>
          <div className="mt-4 grid gap-3">
            {adminContentCalendar.map((item) => <div key={item.item} className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-sky-600">{item.date} - {item.type}</p><p className="safe-break mt-1 text-sm font-semibold text-slate-800">{item.item}</p></div>)}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function AdminOpsStrip() {
  const items = [
    ["Quality queue", "5", ClipboardList],
    ["SEO fixes", "12", SearchCheck],
    ["Ready to publish", "11", Rocket],
    ["Automations", "6", Bot]
  ] as const;
  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, value, Icon]) => <Card key={label} className="min-w-0 p-4"><div className="flex min-w-0 items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-950">{value}</p></div><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-50 text-sky-600"><Icon className="h-5 w-5" /></div></div></Card>)}
    </div>
  );
}
