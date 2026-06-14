export type VisibilityStatus = "Visible" | "Hidden";

export type HomepageSection = {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaUrl: string;
  order: number;
  status: VisibilityStatus;
};

export type NavigationItem = {
  id: string;
  label: string;
  url: string;
  order: number;
  status: VisibilityStatus;
  newTab: boolean;
};

export type FooterColumn = {
  id: string;
  title: string;
  links: Array<{ label: string; url: string; status: VisibilityStatus }>;
};

export type LegalPage = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string[];
  status: VisibilityStatus;
  updatedAt: string;
};

export const homepageSections: HomepageSection[] = [
  { id: "hero", name: "Hero", title: "Find Your Perfect House Plan", subtitle: "Free previews, premium PDF packs and editable CAD/Revit files.", ctaLabel: "Browse House Plans", ctaUrl: "/plans", order: 1, status: "Visible" },
  { id: "search", name: "Smart Search Panel", title: "Search by bedrooms, plot size and file format", subtitle: "Help visitors move quickly from idea to relevant plans.", ctaLabel: "Find My Plan", ctaUrl: "/tools", order: 2, status: "Visible" },
  { id: "categories", name: "Featured Categories", title: "Explore by need", subtitle: "Modern, small, low cost, African, CAD/Revit and plot-size categories.", ctaLabel: "View Catalog", ctaUrl: "/plans", order: 3, status: "Visible" },
  { id: "plans", name: "Featured Plans", title: "Featured House Plans", subtitle: "Curated plans with free previews and upgrade paths.", ctaLabel: "View All Plans", ctaUrl: "/plans", order: 4, status: "Visible" },
  { id: "free", name: "Free Plans Section", title: "Free House Plan Previews", subtitle: "Watermarked previews for early review.", ctaLabel: "Download Free Plans", ctaUrl: "/free-house-plans", order: 5, status: "Visible" },
  { id: "premium", name: "Premium Packs Section", title: "Premium PDF Packages", subtitle: "Complete drawing packs for serious review.", ctaLabel: "Explore Premium", ctaUrl: "/premium-house-plans", order: 6, status: "Visible" },
  { id: "cad", name: "CAD/Revit Section", title: "Professional CAD/Revit Packs", subtitle: "DWG, Revit, IFC and editable files.", ctaLabel: "Browse CAD/Revit", ctaUrl: "/cad-revit-house-plans", order: 7, status: "Visible" },
  { id: "tools", name: "Tools Section", title: "Smart Tools", subtitle: "Plot checking, cost estimates and plan finding.", ctaLabel: "Open Tools", ctaUrl: "/tools", order: 8, status: "Visible" },
  { id: "blog", name: "Blog Section", title: "Latest Guides", subtitle: "Educational content for better building decisions.", ctaLabel: "Read Blog", ctaUrl: "/blog", order: 9, status: "Visible" },
  { id: "cta", name: "Final CTA", title: "Need a custom plan?", subtitle: "Capture custom requests from serious users.", ctaLabel: "Request Custom Plan", ctaUrl: "/contact", order: 10, status: "Visible" }
];

export const navigationItems: NavigationItem[] = [
  { id: "home", label: "Home", url: "/", order: 1, status: "Visible", newTab: false },
  { id: "plans", label: "House Plans", url: "/plans", order: 2, status: "Visible", newTab: false },
  { id: "free", label: "Free Plans", url: "/free-house-plans", order: 3, status: "Visible", newTab: false },
  { id: "premium", label: "Premium Packs", url: "/premium-house-plans", order: 4, status: "Visible", newTab: false },
  { id: "cad", label: "CAD/Revit", url: "/cad-revit-house-plans", order: 5, status: "Visible", newTab: false },
  { id: "tools", label: "Tools", url: "/tools", order: 6, status: "Visible", newTab: false },
  { id: "blog", label: "Blog", url: "/blog", order: 7, status: "Visible", newTab: false },
  { id: "contact", label: "Contact", url: "/contact", order: 8, status: "Visible", newTab: false }
];

export const footerColumns: FooterColumn[] = [
  { id: "plans", title: "House Plans", links: [{ label: "All House Plans", url: "/plans", status: "Visible" }, { label: "Free House Plans", url: "/free-house-plans", status: "Visible" }, { label: "CAD/Revit Plans", url: "/cad-revit-house-plans", status: "Visible" }] },
  { id: "tools", title: "Tools", links: [{ label: "Area Calculator", url: "/tools", status: "Visible" }, { label: "Plot Checker", url: "/tools", status: "Visible" }, { label: "Plan Finder", url: "/tools", status: "Visible" }] },
  { id: "resources", title: "Resources", links: [{ label: "Blog", url: "/blog", status: "Visible" }, { label: "PDF vs DWG vs Revit", url: "/blog/pdf-vs-dwg-vs-revit-which-one-do-you-need", status: "Visible" }, { label: "Before You Build", url: "/before-you-build", status: "Visible" }] },
  { id: "company", title: "Company", links: [{ label: "About", url: "/about", status: "Visible" }, { label: "Contact", url: "/contact", status: "Visible" }, { label: "Custom Request", url: "/contact", status: "Visible" }] },
  { id: "legal", title: "Legal", links: [{ label: "Terms", url: "/terms", status: "Visible" }, { label: "Privacy Policy", url: "/privacy", status: "Visible" }, { label: "License", url: "/license", status: "Visible" }, { label: "Refund Policy", url: "/refund-policy", status: "Visible" }] }
];

export const legalPages: LegalPage[] = [
  { id: "terms", title: "Terms", slug: "terms", summary: "Basic marketplace usage terms for the MVP.", content: ["Use plan previews for evaluation only.", "Professional review is required before construction.", "Digital pack delivery and licensing will be refined before real payments."], status: "Visible", updatedAt: "May 28, 2026" },
  { id: "privacy", title: "Privacy Policy", slug: "privacy", summary: "Simple privacy notice for contact and request forms.", content: ["We collect form details only to answer requests in this MVP.", "No real analytics or payment tracking is connected yet.", "Future production services will need a full privacy update."], status: "Visible", updatedAt: "May 28, 2026" },
  { id: "license", title: "License", slug: "license", summary: "Plan file usage and professional adaptation guidance.", content: ["Free previews are for initial review.", "Premium and CAD files are licensed for project coordination and local adaptation.", "Redistribution rules should be finalized before launch."], status: "Visible", updatedAt: "May 28, 2026" },
  { id: "before-you-build", title: "Before You Build Notice", slug: "before-you-build", summary: "Important safety and compliance warning.", content: ["Every plan must be reviewed by a local architect, engineer or qualified professional.", "Soil, climate, codes, utilities and structural requirements vary by location.", "Do not start construction from an online plan without local adaptation."], status: "Visible", updatedAt: "May 28, 2026" },
  { id: "refund-policy", title: "Refund Policy", slug: "refund-policy", summary: "Placeholder refund terms for future digital products.", content: ["No real payments are processed in this MVP.", "Refund rules should be published before Stripe, Gumroad or any payment flow is activated.", "Custom services may require separate terms."], status: "Visible", updatedAt: "May 28, 2026" }
];
