import { Badge } from "@/components/ui/Badge";
import type { PlanStatus } from "@/types/plan";

export function AdminStatusBadge({ status }: { status: PlanStatus | "New" | "Read" | "Replied" | "Archived" | "Active" | "Coming soon" }) {
  const tone = status === "Published" || status === "Replied" || status === "Active" ? "green" : status === "Draft" || status === "New" || status === "Coming soon" ? "orange" : "slate";
  return <Badge tone={tone}>{status}</Badge>;
}
