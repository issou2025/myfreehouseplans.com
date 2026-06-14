import { jsonError, jsonSuccess } from "@/lib/apiResponse";
import { cleanText, getClientKey, rateLimit } from "@/lib/security";
import { createCloudinaryUploadRequest } from "@/lib/uploadStorage";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!rateLimit(`upload-signature:${getClientKey(request)}`, 60, 60_000)) {
    return jsonError("Too many upload requests. Please wait and try again.", 429);
  }

  try {
    const body = (await request.json()) as { name?: string; type?: string; size?: number };
    const name = cleanText(body.name, 240);
    const type = cleanText(body.type, 120);
    if (!name) return jsonError("File name is required.", 400);
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".pdf", ".dwg", ".dxf", ".rvt", ".ifc", ".zip"];
    if (!allowed.includes(path.extname(name).toLowerCase())) return jsonError("Unsupported file type.", 400);
    if (!Number.isFinite(body.size) || Number(body.size) <= 0 || Number(body.size) > 200 * 1024 * 1024) return jsonError("File size must be between 1 byte and 200MB.", 400);
    const upload = createCloudinaryUploadRequest(name, type);
    if (!upload) return jsonError("Cloudinary is not configured.", 503);
    return jsonSuccess("Upload signature created.", upload);
  } catch {
    return jsonError("Unable to prepare upload.", 500);
  }
}
