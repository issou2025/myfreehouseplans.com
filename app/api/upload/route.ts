import path from "path";
import crypto from "crypto";
import { jsonError, jsonSuccess } from "@/lib/apiResponse";
import { getClientKey, rateLimit } from "@/lib/security";
import { saveUpload } from "@/lib/uploadStorage";
import { hasValidFileSignature } from "@/lib/fileValidation";

export const runtime = "nodejs";

const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
const documentExtensions = [".pdf"];
const cadExtensions = [".dwg", ".dxf", ".rvt", ".ifc"];
const archiveExtensions = [".zip"];
const allowedExtensions = [...imageExtensions, ...documentExtensions, ...cadExtensions, ...archiveExtensions];
const mimeByExtension: Record<string, string[]> = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
  ".avif": ["image/avif"],
  ".pdf": ["application/pdf"],
  ".dwg": ["application/acad", "application/octet-stream", "image/vnd.dwg", ""],
  ".dxf": ["application/dxf", "application/octet-stream", "image/vnd.dxf", ""],
  ".rvt": ["application/octet-stream", ""],
  ".ifc": ["application/octet-stream", "application/x-step", "text/plain", ""],
  ".zip": ["application/zip", "application/x-zip-compressed", "application/octet-stream", ""]
};

function getMaxSize(extension: string) {
  if (imageExtensions.includes(extension)) return 10 * 1024 * 1024;
  if (documentExtensions.includes(extension)) return 50 * 1024 * 1024;
  return 200 * 1024 * 1024;
}

function sanitizeName(fileName: string) {
  const parsed = path.parse(fileName);
  const base = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "upload";
  return `${base}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${parsed.ext.toLowerCase()}`;
}

function isAllowedMime(extension: string, type: string) {
  const allowed = mimeByExtension[extension] ?? [];
  return allowed.includes(type);
}

export async function POST(request: Request) {
  try {
    if (process.env.VERCEL === "1" && !(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
      return jsonError("Cloudinary credentials are required for durable uploads on Vercel.", 503);
    }
    if (!rateLimit(`upload:${getClientKey(request)}`, 20, 60_000)) {
      return jsonError("Too many uploads. Please wait a minute and try again.", 429);
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return jsonError("No file received.", 400, { file: "Upload a file." });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return jsonError("No file received.", 400, { file: "Upload a file." });
    }

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonError("No file received.", 400, { file: "Upload a file." });
    }

    const extension = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return jsonError("Unsupported file type.", 400, { file: "Allowed files: JPG, PNG, WebP, AVIF, PDF, DWG, DXF, RVT, IFC, ZIP." });
    }

    if (!isAllowedMime(extension, file.type)) {
      return jsonError("File MIME type does not match the extension.", 400, { file: "Choose a valid file." });
    }

    const maxSize = getMaxSize(extension);
    if (file.size <= 0 || file.size > maxSize) {
      return jsonError("File is too large.", 400, { file: `Max size is ${Math.round(maxSize / 1024 / 1024)}MB.` });
    }

    const fileName = sanitizeName(file.name);
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!hasValidFileSignature(file.name, bytes)) {
      return jsonError("File content does not match its extension.", 400, { file: "Choose a genuine, non-corrupted file." });
    }
    const savedUpload = await saveUpload(fileName, bytes);

    return jsonSuccess("File uploaded.", {
      url: savedUpload.url,
      name: file.name,
      storedName: savedUpload.storedName,
      provider: savedUpload.provider,
      size: file.size,
      type: file.type || extension
    }, 201);
  } catch {
    return jsonError("Upload failed. Please try again with a valid file.", 500);
  }
}
