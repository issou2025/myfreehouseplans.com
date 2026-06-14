import { Badge } from "@/components/ui/Badge";

export function AdminPackBadge({ label }: { label: "Free" | "Premium" | "CAD/Revit" }) {
  const tone = label === "Free" ? "green" : label === "Premium" ? "orange" : "blue";
  return <Badge tone={tone}>{label}</Badge>;
}
