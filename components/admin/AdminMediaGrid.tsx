"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FileArchive, FileImage, FileText } from "lucide-react";
import { AdminFileUpload, type UploadedFile } from "@/components/admin/AdminFileUpload";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { mockPlans } from "@/lib/mockPlans";

type MediaFile = { src: string; url: string; name: string; type: string; size: string; usedIn: string };

const files: MediaFile[] = mockPlans.slice(0, 8).map((plan, index) => ({ src: plan.mainImage, url: plan.mainImage, name: `${plan.slug}.${index % 3 === 0 ? "pdf" : "jpg"}`, type: index % 3 === 0 ? "PDF" : "image", size: `${(1.2 + index * 0.4).toFixed(1)} MB`, usedIn: plan.title })).concat([
  { src: "", name: "duplex-revit-package.rvt", type: "Revit", size: "42 MB", usedIn: "Duplex House Plan with Revit Files" },
  { src: "", name: "modern-plan-dwg.zip", type: "ZIP", size: "18 MB", usedIn: "Modern 3 Bedroom House Plan" },
  { src: "", name: "courtyard-ifc.ifc", type: "IFC", size: "9 MB", usedIn: "Modern 4 Bedroom House Plan with Courtyard" }
].map((file) => ({ ...file, url: `/uploads/${file.name}` })));

function getMediaType(file: UploadedFile) {
  const name = file.name.toLowerCase();
  if (/\.(jpg|jpeg|png|webp|avif)$/.test(name)) return "image";
  if (name.endsWith(".pdf")) return "PDF";
  if (name.endsWith(".dwg") || name.endsWith(".dxf")) return "DWG";
  if (name.endsWith(".rvt")) return "Revit";
  if (name.endsWith(".ifc")) return "IFC";
  return "ZIP";
}

function formatSize(size: number) {
  return size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`;
}

export function AdminMediaGrid() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const [hiddenUrls, setHiddenUrls] = useState<string[]>([]);
  const allFiles = useMemo(() => [...uploadedFiles, ...files].filter((file) => !hiddenUrls.includes(file.url)), [uploadedFiles, hiddenUrls]);
  const filtered = useMemo(() => allFiles.filter((file) => file.name.toLowerCase().includes(query.toLowerCase()) && (type === "all" || file.type === type)), [allFiles, query, type]);

  function addUploads(uploaded: UploadedFile[]) {
    setUploadedFiles((current) => [
      ...uploaded.map((file) => ({ src: file.url, url: file.url, name: file.name, type: getMediaType(file), size: formatSize(file.size), usedIn: "Uploaded in this local session" })),
      ...current
    ]);
  }

  return (
    <div>
      <div className="mb-5">
        <AdminFileUpload label="Upload media from computer" description="Images max 10MB, PDF max 50MB, CAD/BIM/ZIP max 200MB. Files are stored locally in public/uploads for this MVP." accept=".jpg,.jpeg,.png,.webp,.avif,.pdf,.dwg,.dxf,.rvt,.ifc,.zip" multiple onUploaded={addUploads} />
      </div>
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_180px_180px]">
        <Input placeholder="Search media..." value={query} onChange={(event) => setQuery(event.target.value)} />
        <Select value={type} onChange={(event) => setType(event.target.value)}><option value="all">All types</option><option>image</option><option>PDF</option><option>DWG</option><option>Revit</option><option>IFC</option><option>ZIP</option></Select>
        <Select value={view} onChange={(event) => setView(event.target.value as "grid" | "list")}><option value="grid">Grid view</option><option value="list">List view</option></Select>
      </div>
      <div className={view === "grid" ? "grid gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4" : "grid gap-3"}>
        {filtered.map((file) => (
          <Card key={file.name} className={view === "grid" ? "overflow-hidden" : "flex flex-col gap-4 p-4 sm:flex-row sm:items-center"}>
            <div className={`${view === "grid" ? "flex aspect-[4/3] items-center justify-center bg-slate-100" : "flex h-16 w-20 shrink-0 items-center justify-center rounded-md bg-slate-100"} relative overflow-hidden`}>
              {file.src ? <Image src={file.src} alt="" fill sizes={view === "grid" ? "(max-width: 419px) 100vw, (max-width: 1279px) 50vw, 25vw" : "80px"} unoptimized className="object-cover" /> : file.type === "ZIP" ? <FileArchive className="h-8 w-8 text-slate-400" /> : file.type === "image" ? <FileImage className="h-8 w-8 text-slate-400" /> : <FileText className="h-8 w-8 text-slate-400" />}
            </div>
            <div className={view === "grid" ? "p-4" : "flex flex-1 items-center justify-between gap-4"}>
              <div><p className="truncate font-semibold text-slate-950">{file.name}</p><p className="mt-1 text-xs text-slate-500">{file.type} - {file.size} - Used in {file.usedIn}</p><p className="safe-break mt-1 text-xs text-sky-600">{file.url}</p></div>
              <div className="mt-4 grid gap-2 min-[420px]:grid-cols-3"><AdminActionButton message="File URL copied." onAction={() => navigator.clipboard?.writeText(file.url).catch(() => undefined)}>Copy URL</AdminActionButton><AdminActionButton message="File selected for the next plan field placeholder.">Select</AdminActionButton><AdminActionButton variant="danger" message="File hidden from this session." onAction={() => setHiddenUrls((current) => [...current, file.url])}>Delete</AdminActionButton></div>
            </div>
          </Card>
        ))}
        {!filtered.length ? (
          <Card className="p-8 text-center">
            <p className="text-xl font-black text-slate-950">No media found</p>
            <p className="mt-2 text-sm text-slate-500">Upload a file or adjust the search and type filter.</p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
