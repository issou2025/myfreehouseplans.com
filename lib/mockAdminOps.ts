export type AdminTaskPriority = "High" | "Medium" | "Low";
export type AdminTaskStatus = "Ready" | "Blocked" | "In review" | "Queued";

export const adminQualityTasks = [
  { title: "Add premium links to high-traffic plans", area: "Plans", priority: "High" as AdminTaskPriority, status: "Blocked" as AdminTaskStatus, owner: "Content manager" },
  { title: "Rewrite weak meta descriptions", area: "SEO", priority: "High" as AdminTaskPriority, status: "Ready" as AdminTaskStatus, owner: "SEO editor" },
  { title: "Prepare CAD/Revit landing page variants", area: "Programmatic SEO", priority: "Medium" as AdminTaskPriority, status: "Queued" as AdminTaskStatus, owner: "Growth" },
  { title: "Review gallery coverage for draft plans", area: "Media", priority: "Medium" as AdminTaskPriority, status: "In review" as AdminTaskStatus, owner: "Design desk" },
  { title: "Answer new custom plan requests", area: "Messages", priority: "High" as AdminTaskPriority, status: "Ready" as AdminTaskStatus, owner: "Support" }
];

export const adminPipelineStages = [
  { label: "Imported", count: 14, color: "bg-slate-500" },
  { label: "Drafting", count: 8, color: "bg-orange-500" },
  { label: "SEO Review", count: 6, color: "bg-sky-500" },
  { label: "Media Review", count: 4, color: "bg-violet-500" },
  { label: "Ready", count: 11, color: "bg-emerald-500" },
  { label: "Published", count: 42, color: "bg-slate-950" }
];

export const adminAutomationRules = [
  "Generate slug from title when blank",
  "Flag plans with premium pack enabled but missing payment link",
  "Flag CAD/Revit plans without DWG/Revit/IFC badges",
  "Warn when SEO title is below 45 characters",
  "Warn when main image alt text is missing",
  "Suggest 20x20m / 66x66 ft and 20x10m / 66x33 ft landing pages from plot tags"
];

export const adminContentCalendar = [
  { date: "May 29", item: "Publish 3 Bedroom 20x20m / 66x66 ft collection", type: "SEO Page" },
  { date: "May 30", item: "Upload CAD previews for duplex pack", type: "Media" },
  { date: "Jun 02", item: "Release cost estimator landing copy", type: "Tool" },
  { date: "Jun 04", item: "Update free PDF plan roundup", type: "Blog" }
];

export const adminSavedViews = [
  "Drafts missing SEO",
  "Published plans without CAD package",
  "High views, low premium clicks",
  "Free plans without blog internal links",
  "Plans ready to publish"
];
