import { CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/Card";

const items = ["Title completed", "Main image added", "Category selected", "Free PDF added", "Premium link added", "SEO title added", "Meta description added", "Technical details completed", "Gallery images added"];

export function AdminChecklist() {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-slate-950">Publication readiness</p>
        <p className="text-2xl font-black text-sky-600">82/100</p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => (
          <p key={item} className="flex items-center gap-2 text-sm text-slate-600">
            {index < 7 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-slate-300" />} {item}
          </p>
        ))}
      </div>
    </Card>
  );
}
