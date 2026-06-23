"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Eye } from "lucide-react";
import type { PlanImage } from "@/types/plan";
import { SafeImage } from "@/components/public/SafeImage";

const InteractiveImagePreview = dynamic(
  () => import("@/components/public/InteractiveImagePreview").then((module) => module.InteractiveImagePreview),
  { ssr: false }
);

export function PlanImageGallery({
  images,
  title
}: {
  images: PlanImage[];
  title: string;
}) {
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [initialIndex, setInitialIndex] = useState<number>(0);
  const mainImage = images[0];

  function openPreview(index: number) {
    setInitialIndex(index);
    setIsPreviewOpen(true);
  }

  if (!mainImage) return null;

  return (
    <>
      <div className="grid gap-4">
        <button type="button" onClick={() => openPreview(0)} className="focus-ring group relative overflow-hidden rounded-[2rem] text-left shadow-2xl" aria-label={`Preview ${title}`}>
          <span className="relative block aspect-[16/10] w-full">
            <SafeImage src={mainImage.url} alt={mainImage.alt ?? title} fill sizes="(max-width: 1023px) 100vw, 60vw" className="object-cover transition duration-500 group-hover:scale-105" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
          <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/55 px-4 py-2 text-sm font-bold text-white backdrop-blur">
            <Eye className="h-4 w-4" /> Preview all {images.length} images
          </span>
        </button>
        <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible">
          {images.slice(1).map((image, index) => (
            <button key={image.id} type="button" onClick={() => openPreview(index + 1)} className="focus-ring group relative w-56 shrink-0 overflow-hidden rounded-3xl text-left shadow-lg sm:w-full" aria-label={`Preview ${image.title ?? `${title} image ${index + 2}`}`}>
              <span className="relative block aspect-[16/10] w-full">
                <SafeImage src={image.url} alt={image.alt ?? `${title} preview ${index + 2}`} fill sizes="(max-width: 639px) 224px, 30vw" className="object-cover transition duration-500 group-hover:scale-105" />
              </span>
              <span className="absolute inset-0 grid place-items-center bg-slate-950/0 text-white opacity-0 transition group-hover:bg-slate-950/35 group-hover:opacity-100"><Eye className="h-6 w-6" /></span>
            </button>
          ))}
        </div>
      </div>
      <InteractiveImagePreview images={images} initialIndex={initialIndex} isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
    </>
  );
}
