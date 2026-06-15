import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { getSiteUrl, siteName } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} | Smart House Plans, PDF, CAD and BIM`,
    template: `%s | ${siteName}`
  },
  description: "Discover buildable house plans with plot-fit analysis, technical scores and professional PDF, DWG, Revit and IFC packages.",
  keywords: ["house plans", "free house plans", "plot fit checker", "PDF house plans", "DWG house plans", "Revit house plans", "BIM house plans"],
  alternates: { canonical: "/" },
  applicationName: siteName,
  manifest: "/manifest.webmanifest",
  icons: { icon: "/brand-mark.svg", apple: "/brand-mark.svg" },
  openGraph: {
    title: `${siteName} | Architecture intelligence for real projects`,
    description: "Smart house plan discovery, plot checks and professional PDF, CAD and BIM files.",
    url: siteUrl,
    siteName,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Smart House Plans`,
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
        <Script src="https://gumroad.com/js/gumroad.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
