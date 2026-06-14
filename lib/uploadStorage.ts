import { mkdir, readFile, writeFile } from "fs/promises";
import crypto from "crypto";
import path from "path";

const publicUploadDir = path.join(process.cwd(), "public", "uploads");

type SavedUpload = {
  provider: "cloudinary" | "disk";
  url: string;
  storedName: string;
};

export function hasCloudinary() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

export function getUploadProvider() {
  return hasCloudinary() ? "cloudinary" : "disk";
}

function getCloudinaryResourceType(mimeType: string) {
  if (mimeType.startsWith("image/")) return "image";
  return "raw";
}

function signCloudinaryParams(params: Record<string, string>) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto
    .createHash("sha1")
    .update(`${payload}${process.env.CLOUDINARY_API_SECRET}`)
    .digest("hex");
}

export function createCloudinaryUploadRequest(fileName: string, mimeType: string) {
  if (!hasCloudinary()) return null;
  const parsed = path.parse(fileName);
  const base = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "upload";
  const publicId = `${base}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  const timestamp = String(Math.floor(Date.now() / 1000));
  const folder = process.env.CLOUDINARY_FOLDER || "myhouseplans";
  const resourceType = getCloudinaryResourceType(mimeType);
  const signature = signCloudinaryParams({ folder, public_id: publicId, timestamp });
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    fields: {
      api_key: process.env.CLOUDINARY_API_KEY as string,
      folder,
      public_id: publicId,
      timestamp,
      signature
    }
  };
}

export function getUploadDir() {
  return process.env.UPLOAD_DIR || publicUploadDir;
}

export function getUploadUrl(fileName: string) {
  return process.env.UPLOAD_DIR ? `/api/files/${fileName}` : `/uploads/${fileName}`;
}

export function getUploadPath(fileName: string) {
  const uploadDir = path.resolve(getUploadDir());
  const filePath = path.resolve(uploadDir, fileName);
  if (!filePath.startsWith(`${uploadDir}${path.sep}`)) {
    throw new Error("Unsafe upload path rejected.");
  }
  return filePath;
}

export async function saveUpload(fileName: string, bytes: Buffer) {
  if (hasCloudinary()) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME as string;
    const apiKey = process.env.CLOUDINARY_API_KEY as string;
    const folder = process.env.CLOUDINARY_FOLDER || "myhouseplans";
    const parsed = path.parse(fileName);
    const publicId = parsed.name;
    const timestamp = String(Math.floor(Date.now() / 1000));
    const resourceType = getCloudinaryResourceType(getMimeType(parsed.ext));
    const signature = signCloudinaryParams({ folder, public_id: publicId, timestamp });
    const formData = new FormData();
    const fileBytes = new Uint8Array(bytes);
    const blob = new Blob([fileBytes], { type: getMimeType(parsed.ext) });

    formData.append("file", blob, fileName);
    formData.append("api_key", apiKey);
    formData.append("folder", folder);
    formData.append("public_id", publicId);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
      method: "POST",
      body: formData
    });
    const data = (await response.json()) as { secure_url?: string; public_id?: string; error?: { message?: string } };

    if (!response.ok || !data.secure_url) {
      throw new Error(data.error?.message || "Cloudinary upload failed.");
    }

    return {
      provider: "cloudinary",
      url: data.secure_url,
      storedName: data.public_id || publicId
    } satisfies SavedUpload;
  }

  if (process.env.VERCEL === "1" || process.env.REQUIRE_CLOUD_UPLOADS === "true") {
    throw new Error("Cloudinary is required for durable uploads on this deployment.");
  }

  const uploadDir = path.resolve(getUploadDir());
  await mkdir(uploadDir, { recursive: true });
  await writeFile(getUploadPath(fileName), bytes, { flag: "wx" });
  return {
    provider: "disk",
    url: getUploadUrl(fileName),
    storedName: fileName
  } satisfies SavedUpload;
}

export async function readUpload(fileName: string) {
  return readFile(getUploadPath(fileName));
}

function getMimeType(extension: string) {
  const normalized = extension.toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".pdf": "application/pdf",
    ".dwg": "application/octet-stream",
    ".dxf": "application/octet-stream",
    ".rvt": "application/octet-stream",
    ".ifc": "application/octet-stream",
    ".zip": "application/zip"
  };
  return mimeTypes[normalized] || "application/octet-stream";
}
