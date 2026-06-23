import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSiteUrl, siteName } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | House Plans, PDF, CAD and BIM`,
    template: `%s | ${siteName}`
  },
  description: "Explore house plan concepts with plot-fit checks, clear technical details and professional PDF, DWG, Revit and IFC packages for local review and adaptation.",
  keywords: ["house plans", "free house plans", "plot fit checker", "PDF house plans", "DWG house plans", "Revit house plans", "BIM house plans"],
  alternates: { canonical: "/" },
  applicationName: siteName,
  manifest: "/manifest.webmanifest",
  icons: { icon: "/brand-mark.svg", apple: "/brand-mark.svg" },
  openGraph: {
    title: `${siteName} | Practical house plans for real projects`,
    description: "House plan discovery, plot checks and professional PDF, CAD and BIM files.",
    url: siteUrl,
    siteName,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | House Plans`,
    description: "Compare house plans with technical data, plot-fit tools and professional files."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 }
  }
};

export const viewport = {
  themeColor: "#020617",
  colorScheme: "light"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
