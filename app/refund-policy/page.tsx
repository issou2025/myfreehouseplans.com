import type { Metadata } from "next";
import { LegalPageShell } from "@/components/public/LegalPageShell";
import { legalPages } from "@/lib/mockSiteControls";

export const metadata: Metadata = { title: "Refund Policy | myfreehouseplans.com", description: "Refund policy placeholder for future digital house plan packs." };

export default function RefundPolicyPage() {
  return <LegalPageShell page={legalPages.find((page) => page.slug === "refund-policy") ?? legalPages[0]} />;
}
