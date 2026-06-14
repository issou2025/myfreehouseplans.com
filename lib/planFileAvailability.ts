import { existsSync } from "fs";
import path from "path";
import { getUploadPath } from "@/lib/uploadStorage";

export function isPlanFileAvailable(value?: string) {
  if (!value || value === "#") return false;
  if (/^https?:\/\//i.test(value)) return true;

  if (value.startsWith("/uploads/")) {
    const fileName = path.basename(value);
    return fileName === value.slice("/uploads/".length) && existsSync(path.join(process.cwd(), "public", "uploads", fileName));
  }

  if (value.startsWith("/api/files/")) {
    const fileName = path.basename(value);
    if (fileName !== value.slice("/api/files/".length)) return false;
    try {
      return existsSync(getUploadPath(fileName));
    } catch {
      return false;
    }
  }

  return value.startsWith("/");
}
