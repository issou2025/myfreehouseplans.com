import path from "path";

function startsWith(bytes: Buffer, signature: number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

function ascii(bytes: Buffer, start = 0, end = bytes.length) {
  return bytes.subarray(start, end).toString("ascii");
}

export function hasValidFileSignature(fileName: string, bytes: Buffer) {
  const extension = path.extname(fileName).toLowerCase();
  if (bytes.length < 4) return false;

  if (extension === ".jpg" || extension === ".jpeg") return startsWith(bytes, [0xff, 0xd8, 0xff]);
  if (extension === ".png") return startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (extension === ".webp") return ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP";
  if (extension === ".avif") return ascii(bytes, 4, 8) === "ftyp" && /avif|avis/.test(ascii(bytes, 8, 32));
  if (extension === ".pdf") return ascii(bytes, 0, 5) === "%PDF-";
  if (extension === ".zip") return startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) || startsWith(bytes, [0x50, 0x4b, 0x05, 0x06]);
  if (extension === ".dwg") return /^AC10\d{2}/.test(ascii(bytes, 0, 6));
  if (extension === ".dxf") return /SECTION/i.test(ascii(bytes, 0, Math.min(bytes.length, 512)));
  if (extension === ".ifc") return ascii(bytes, 0, Math.min(bytes.length, 64)).includes("ISO-10303-21");
  if (extension === ".rvt") return startsWith(bytes, [0xd0, 0xcf, 0x11, 0xe0]) || startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]);
  return false;
}
