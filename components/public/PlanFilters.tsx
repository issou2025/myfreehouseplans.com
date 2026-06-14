import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";

export function PlanFilters() {
  const toggles = ["Free", "Premium", "CAD", "Hot climate friendly", "Future extension ready", "Low cost construction", "With terrace"];
  return (
    <Card className="p-5">
      <p className="text-lg font-bold text-slate-950">Filters</p>
      <div className="mt-5 grid gap-4">
        <label className="text-sm font-semibold text-slate-700">Bedrooms<Input placeholder="2, 3, 4..." className="mt-2" /></label>
        <label className="text-sm font-semibold text-slate-700">Bathrooms<Input placeholder="1, 2, 3..." className="mt-2" /></label>
        <label className="text-sm font-semibold text-slate-700">Total area<Input placeholder="80-250 m2 / 861-2,691 sq ft" className="mt-2" /></label>
        <label className="text-sm font-semibold text-slate-700">Plot width<Input placeholder="10 m / 33 ft, 20 m / 66 ft" className="mt-2" /></label>
        <label className="text-sm font-semibold text-slate-700">Plot length<Input placeholder="20 m / 66 ft, 30 m / 98 ft" className="mt-2" /></label>
        <label className="text-sm font-semibold text-slate-700">Floors<Select className="mt-2"><option>Any</option><option>1 floor</option><option>2 floors</option></Select></label>
        <label className="text-sm font-semibold text-slate-700">Style<Select className="mt-2"><option>Any style</option><option>Modern</option><option>African contemporary</option><option>Low cost</option></Select></label>
        <label className="text-sm font-semibold text-slate-700">Roof type<Select className="mt-2"><option>Any roof</option><option>Flat</option><option>Hip</option><option>Gable</option></Select></label>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {toggles.map((toggle) => <Badge key={toggle} tone="slate">{toggle}</Badge>)}
      </div>
    </Card>
  );
}
