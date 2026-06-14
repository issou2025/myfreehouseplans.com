import type { Metadata } from "next";
import { LegalPageShell } from "@/components/public/LegalPageShell";
import { legalPages } from "@/lib/mockSiteControls";

export const metadata: Metadata = { title: "Terms | myfreehouseplans.com", description: "Terms for using myfreehouseplans.com and its digital house plan services." };

export default function TermsPage() {
  return <LegalPageShell page={legalPages.find((page) => page.slug === "terms") ?? legalPages[0]} />;
}
