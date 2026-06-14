import Image from "next/image";
import { ImageOff } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { Card } from "@/components/ui/Card";

export function AdminImagePreview({ src, title }: { src?: string; title: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative flex aspect-[16/10] items-center justify-center bg-slate-100">
        {src ? <Image src={src} alt={title} fill sizes="(max-width: 1023px) 100vw, 50vw" unoptimized className="object-cover" /> : <div className="grid place-items-center text-slate-400"><ImageOff className="h-8 w-8" /><span className="mt-2 text-xs font-semibold">No image</span></div>}
      </div>
      <div className="p-4">
        <p className="font-semibold text-slate-950">{title}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <AdminActionButton variant="outline" message="Media library selection queued in MVP mode.">Choose from Media Library</AdminActionButton>
          <AdminActionButton variant="outline" message="Image marked as main preview in MVP mode.">Set as Main Image</AdminActionButton>
          <AdminActionButton variant="danger" message="Image removed from this preview only.">Remove</AdminActionButton>
        </div>
      </div>
    </Card>
  );
}
