import type { Plan, PlanImage } from "@/types/plan";

export function getPlanPreviewImages(plan: Plan): PlanImage[] {
  const candidates: Array<PlanImage | null> = [
    ...(plan.images ?? []),
    plan.mainImage ? { id: "main", url: plan.mainImage, alt: plan.mainImageAlt ?? plan.title, title: "Main preview" } : null,
    ...plan.galleryImages.map((url, index) => ({
      id: `gallery-${index + 1}`,
      url,
      alt: plan.galleryImageAlt ?? `${plan.title} gallery image ${index + 1}`,
      title: `Gallery image ${index + 1}`
    })),
    plan.floorPlanImage ? { id: "floor-plan", url: plan.floorPlanImage, alt: `${plan.title} floor plan`, title: "Floor plan" } : null,
    plan.elevationImage ? { id: "elevation", url: plan.elevationImage, alt: `${plan.title} elevation`, title: "Elevation" } : null,
    plan.threeDViewImage ? { id: "3d-view", url: plan.threeDViewImage, alt: `${plan.title} 3D view`, title: "3D view" } : null,
    plan.threeDImage ? { id: "3d-image", url: plan.threeDImage, alt: `${plan.title} 3D image`, title: "3D image" } : null,
    plan.cadPreviewImage ? { id: "cad-preview", url: plan.cadPreviewImage, alt: `${plan.title} CAD preview`, title: "CAD preview" } : null,
    plan.revitPreviewImage ? { id: "revit-preview", url: plan.revitPreviewImage, alt: `${plan.title} Revit preview`, title: "Revit preview" } : null
  ];

  const seen = new Set<string>();
  return candidates.filter((image): image is PlanImage => {
    if (!image?.url || seen.has(image.url)) return false;
    seen.add(image.url);
    return true;
  });
}
