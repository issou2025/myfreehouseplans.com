import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const packs = [
  { name: "Free Preview", price: "$0", features: ["Watermarked PDF", "Basic floor plan", "Main dimensions", "Good for first review"], tone: "green" as const },
  { name: "Premium PDF Pack", price: "$9.99", features: ["Complete PDF drawings", "Floor plans", "Elevations", "Sections", "Metric and imperial versions"], tone: "amber" as const, recommended: true },
  { name: "Ultimate CAD/Revit Pack", price: "From $29.99", features: ["DWG file", "Revit model", "IFC file", "Complete PDF", "Editable source files", "3D images"], tone: "purple" as const, recommended: true }
];

export function PackComparison() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {packs.map((pack) => (
        <Card key={pack.name} className={`relative overflow-hidden p-4 hover:-translate-y-1 sm:p-6 ${pack.name.includes("CAD") ? "border-violet-200 bg-gradient-to-br from-white to-violet-50" : ""}`}>
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-sky-200/30 blur-2xl" />
          {pack.recommended ? <Badge tone={pack.tone} className="mb-3 sm:absolute sm:right-4 sm:top-4">Recommended</Badge> : null}
          <p className="relative text-lg font-black text-slate-950">{pack.name}</p>
          <p className="mt-3 text-3xl font-black text-slate-950">{pack.price}</p>
          <div className="mt-5 grid gap-3">
            {pack.features.map((feature) => <p key={feature} className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> {feature}</p>)}
          </div>
          <Button href={pack.name.includes("Free") ? "/free-house-plans" : pack.name.includes("CAD") ? "/cad-revit-house-plans" : "/premium-house-plans"} className="mt-6 w-full" variant={pack.name.includes("Free") ? "outline" : pack.name.includes("CAD") ? "secondary" : "premium"}>Select Pack</Button>
        </Card>
      ))}
    </div>
  );
}
