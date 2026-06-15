import crypto from "crypto";
import path from "path";
import { jsonError, jsonSuccess } from "@/lib/apiResponse";
import { getClientKey, rateLimit } from "@/lib/security";
import { saveUpload } from "@/lib/uploadStorage";
import { hasValidFileSignature } from "@/lib/fileValidation";

export const runtime = "nodejs";

const allowedTypes: Record<string, string[]> = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
  ".pdf": ["application/pdf"]
};
const MAX_CONTACT_FILE_SIZE = 8 * 1024 * 1024;

function sanitizeName(fileName: string) {
  const parsed = path.parse(fileName);
  const base = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "project-file";
  return `contact-${base}-${Date.now()}-${crypto.randomBytes(5).toString("hex")}${parsed.ext.toLowerCase()}`;
}

export async function POST(request: Request) {
  try {
    if (!rateLimit(`contact-upload:${getClientKey(request)}`, 5, 15 * 60_000)) {
      return jsonError("Too many upload attempts. Please wait and try again.", 429);
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("multipart/form-data")) {
      return jsonError("Upload a valid project file.", 400);
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return jsonError("No file received.", 400, { file: "Choose a file." });

    const extension = path.extname(file.name).toLowerCase();
    if (!allowedTypes[extension]?.includes(file.type)) {
      return jsonError("Unsupported file type.", 400, { file: "Use JPG, PNG, WebP or PDF." });
    }
    if (file.size <= 0 || file.size > MAX_CONTACT_FILE_SIZE) {
      return jsonError("File is too large.", 400, { file: "Maximum size is 8MB." });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (!hasValidFileSignature(file.name, bytes)) {
      return jsonError("File content does not match its extension.", 400, { file: "Choose a genuine JPG, PNG, WebP or PDF file." });
    }
    const savedUpload = await saveUpload(sanitizeName(file.name), bytes);
    return jsonSuccess("Project file uploaded.", {
      url: savedUpload.url,
      name: file.name,
      size: file.size
    }, 201);
  } catch {
    return jsonError("Unable to upload this project file right now.", 500);
  }
}
