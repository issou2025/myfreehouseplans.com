"use client";

import { useState } from "react";
import Image from "next/image";
import { FileArchive, FileImage, FileText, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export type UploadedFile = {
  url: string;
  name: string;
  size: number;
  type: string;
};

type UploadApiResponse = {
  success: boolean;
  message: string;
  data?: UploadedFile;
  errors?: Record<string, string>;
};

type SignatureResponse = {
  success: boolean;
  data?: { uploadUrl: string; fields: Record<string, string> };
};

type AdminFileUploadProps = {
  label: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  value?: string;
  onUploaded?: (files: UploadedFile[]) => void;
};

function formatSize(size: number) {
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

function FileIcon({ file }: { file: UploadedFile }) {
  const name = file.name.toLowerCase();
  if (/\.(jpg|jpeg|png|webp|avif)$/.test(name)) return <FileImage className="h-5 w-5 text-sky-600" />;
  if (/\.(zip|rar)$/.test(name)) return <FileArchive className="h-5 w-5 text-purple-600" />;
  return <FileText className="h-5 w-5 text-amber-600" />;
}

export function AdminFileUpload({ label, description, accept, multiple = false, value, onUploaded }: AdminFileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(value ? [{ url: value, name: value.split("/").pop() ?? "Existing file", size: 0, type: "existing" }] : []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function uploadFile(file: File): Promise<UploadedFile> {
    const signatureResponse = await fetch("/api/upload/signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: file.name, type: file.type, size: file.size })
    });

    if (signatureResponse.ok) {
      const signature = (await signatureResponse.json()) as SignatureResponse;
      if (signature.success && signature.data) {
        const cloudBody = new FormData();
        cloudBody.append("file", file);
        Object.entries(signature.data.fields).forEach(([key, value]) => cloudBody.append(key, value));
        const cloudResponse = await fetch(signature.data.uploadUrl, { method: "POST", body: cloudBody });
        const cloudData = (await cloudResponse.json()) as { secure_url?: string; error?: { message?: string } };
        if (!cloudResponse.ok || !cloudData.secure_url) throw new Error(cloudData.error?.message || "Cloud upload failed.");
        return { url: cloudData.secure_url, name: file.name, size: file.size, type: file.type };
      }
    }

    const body = new FormData();
    body.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body });
    const data = (await response.json()) as UploadApiResponse;
    if (!response.ok || !data.success || !data.data) throw new Error(data.errors?.file ?? data.message ?? "Upload failed.");
    return data.data;
  }

  async function uploadFiles(selectedFiles: FileList | null) {
    if (!selectedFiles?.length) return;
    setLoading(true);
    setError("");
    const uploaded: UploadedFile[] = [];

    try {
      for (const file of Array.from(selectedFiles)) {
        try {
          uploaded.push(await uploadFile(file));
        } catch (uploadError) {
          setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
        }
      }
    } catch {
      setError("Upload failed. Please check the file and try again.");
    } finally {
      setLoading(false);
    }

    if (uploaded.length) {
      const nextFiles = multiple ? [...files, ...uploaded] : uploaded.slice(0, 1);
      setFiles(nextFiles);
      onUploaded?.(nextFiles);
    }
  }

  function removeFile(url: string) {
    const nextFiles = files.filter((file) => file.url !== url);
    setFiles(nextFiles);
    onUploaded?.(nextFiles);
  }

  return (
    <Card
      className={`grid gap-4 border-dashed p-4 transition ${dragging ? "border-sky-400 bg-sky-50" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        uploadFiles(event.dataTransfer.files);
      }}
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="safe-break font-black text-slate-950">{label}</p>
          {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        <label className="focus-ring inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-600 sm:w-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {loading ? "Uploading..." : "Choose File"}
          <input type="file" accept={accept} multiple={multiple} className="sr-only" onChange={(event) => uploadFiles(event.target.files)} />
        </label>
      </div>
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-center text-sm font-semibold text-slate-500">
        Drag files here or use Choose File. Professional uploads support images, PDF, DWG, DXF, RVT, IFC and ZIP.
      </div>
      {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
      <div className="grid gap-2">
        {files.map((file) => (
          <div key={file.url} className="grid gap-3 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-white">
              {/\.(jpg|jpeg|png|webp|avif)$/.test(file.name.toLowerCase()) || file.url.match(/\.(jpg|jpeg|png|webp|avif)$/) ? <Image src={file.url} alt="" width={48} height={48} sizes="48px" unoptimized className="h-full w-full object-cover" /> : <FileIcon file={file} />}
            </div>
            <div className="min-w-0">
              <p className="safe-break text-sm font-bold text-slate-950">{file.name}</p>
              <p className="safe-break mt-1 text-xs text-slate-500">{file.url}{file.size ? ` - ${formatSize(file.size)}` : ""}</p>
            </div>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => removeFile(file.url)}><X className="h-4 w-4" /> Remove</Button>
          </div>
        ))}
      </div>
      <Input readOnly value={files.map((file) => file.url).join(", ")} placeholder="Uploaded file URL appears here" />
    </Card>
  );
}
