import type { Metadata } from "next";
import { LegalPageShell } from "@/components/public/LegalPageShell";
import { legalPages } from "@/lib/mockSiteControls";

export const metadata: Metadata = { title: "Before You Build | myfreehouseplans.com", description: "Important professional review notice before building from any house plan." };

export default function BeforeYouBuildPage() {
  return <LegalPageShell page={legalPages.find((page) => page.slug === "before-you-build") ?? legalPages[0]} />;
}
