import { FolderSync, Upload } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { AdminMediaGrid } from "@/components/admin/AdminMediaGrid";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";

export default function AdminMediaPage() {
  return <div><AdminPageHeader title="Media Library" subtitle="Upload and manage local MVP files for images, PDFs, CAD, Revit, IFC and ZIP packages." /><div className="mb-6 grid gap-4 lg:grid-cols-[1fr_0.75fr]"><Card className="flex flex-col items-center justify-center gap-3 border-dashed p-8 text-center text-slate-600"><Upload className="h-8 w-8 text-sky-500" /><p className="font-bold text-slate-950">Local upload workflow enabled</p><p className="text-sm">Files uploaded here are stored in <span className="font-semibold">public/uploads</span> for local development and can later move to Cloudinary, S3 or R2.</p></Card><Card className="p-5"><div className="flex items-center gap-2"><FolderSync className="h-5 w-5 text-sky-600" /><h2 className="text-xl font-black text-slate-950">Media Operations</h2></div><div className="mt-4 grid gap-2"><AdminActionButton message="Unused media scan complete in MVP mode.">Find unused media</AdminActionButton><AdminActionButton message="Alt text audit complete. Review image fields in plans.">Find missing alt text</AdminActionButton><AdminActionButton message="Migration map prepared as a future Cloudinary task.">Prepare Cloudinary migration map</AdminActionButton></div></Card></div><AdminMediaGrid /></div>;
}
