import type { Metadata } from "next";
import { LegalPageShell } from "@/components/public/LegalPageShell";
import { legalPages } from "@/lib/mockSiteControls";

export const metadata: Metadata = { title: "Privacy Policy | myfreehouseplans.com", description: "Privacy notice for myfreehouseplans.com." };

export default function PrivacyPage() {
  return <LegalPageShell page={legalPages.find((page) => page.slug === "privacy") ?? legalPages[0]} />;
}
