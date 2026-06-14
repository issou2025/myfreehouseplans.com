import { Badge } from "@/components/ui/Badge";

export function AdminScoreBadge({ score, label }: { score: number; label?: string }) {
  const tone = score >= 85 ? "green" : score >= 65 ? "orange" : "red";
  return <Badge tone={tone}>{label ? `${label} ` : ""}{score}/100</Badge>;
}
