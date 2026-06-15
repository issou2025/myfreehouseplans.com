import path from "path";
import { NextResponse } from "next/server";
import { readUpload } from "@/lib/uploadStorage";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
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

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name: requestedName } = await params;
  const name = path.basename(requestedName);
  if (!name || name !== requestedName) {
    return NextResponse.json({ success: false, message: "File not found." }, { status: 404 });
  }

  try {
    const bytes = await readUpload(name);
    const extension = path.extname(name).toLowerCase();
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentTypes[extension] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `${extension === ".pdf" || extension.startsWith(".") && ![".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(extension) ? "attachment" : "inline"}; filename="${name}"`,
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow"
      }
    });
  } catch {
    return NextResponse.json({ success: false, message: "File not found." }, { status: 404 });
  }
}
