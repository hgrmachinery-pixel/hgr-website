import { randomUUID } from "node:crypto";

const extensionByMimeType: Record<string, string> = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function generatedMachineImageName(mimeType: string, identity = randomUUID()): string {
  const extension = extensionByMimeType[mimeType];
  if (!extension) throw new Error("Unsupported machine image format");
  return `machine-image-${identity}.${extension}`;
}
