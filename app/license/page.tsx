import type { Metadata } from "next";
import { LegalPageShell } from "@/components/public/LegalPageShell";
import { legalPages } from "@/lib/mockSiteControls";

export const metadata: Metadata = { title: "License | myfreehouseplans.com", description: "Plan file license information for myfreehouseplans.com." };

export default function LicensePage() {
  return <LegalPageShell page={legalPages.find((page) => page.slug === "license") ?? legalPages[0]} />;
}
