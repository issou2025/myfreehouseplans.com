import { jsonError, jsonSuccess } from "@/lib/apiResponse";
import { cleanText, getClientKey, rateLimit, readJsonBody } from "@/lib/security";
import { createCloudinaryUploadRequest } from "@/lib/uploadStorage";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!rateLimit(`upload-signature:${getClientKey(request)}`, 60, 60_000)) {
    return jsonError("Too many upload requests. Please wait and try again.", 429);
  }

  try {
    const body = await readJsonBody<{ name?: string; type?: string; size?: number }>(request, 16 * 1024);
    const name = cleanText(body.name, 240);
    const type = cleanText(body.type, 120);
    if (!name) return jsonError("File name is required.", 400);
    const imageTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
      ".avif": "image/avif"
    };
    const extension = path.extname(name).toLowerCase();
    if (!imageTypes[extension] || imageTypes[extension] !== type) return jsonError("Direct cloud uploads are limited to validated image types.", 400);
    if (!Number.isFinite(body.size) || Number(body.size) <= 0 || Number(body.size) > 10 * 1024 * 1024) return jsonError("Image size must be between 1 byte and 10MB.", 400);
    const upload = createCloudinaryUploadRequest(name, type);
    if (!upload) return jsonError("Cloudinary is not configured.", 503);
    return jsonSuccess("Upload signature created.", upload);
  } catch {
    return jsonError("Unable to prepare upload.", 500);
  }
}
