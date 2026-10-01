import { createHash } from "node:crypto";
import sharp from "sharp";

import { validateRedactions, type NormalizedRedaction } from "./media.ts";

export function photoContentDigest(buffer: Buffer): string {
  return `sha256:${createHash("sha256").update(buffer).digest("hex")}`;
}

export async function createResponsiveMachineImage(input: Buffer): Promise<Buffer> {
  if (!Buffer.isBuffer(input) || input.length === 0) throw new Error("A non-empty image buffer is required");
  return sharp(input, { failOn: "error", limitInputPixels: 100_000_000 })
    .rotate()
    .webp({ quality: 84, effort: 4 })
    .toBuffer();
}

export async function blurSensitiveAreas(input: Buffer, redactions: NormalizedRedaction[]): Promise<Buffer> {
  if (!validateRedactions(redactions)) throw new Error("One or more blur regions are invalid");
  const source = sharp(input, { failOn: "error", limitInputPixels: 100_000_000 }).rotate();
  const { width, height } = await source.metadata();
  if (!width || !height) throw new Error("Image dimensions are unavailable");
  const composites = await Promise.all(redactions.map(async (box) => {
    const left = Math.floor(box.left * width);
    const top = Math.floor(box.top * height);
    const regionWidth = Math.max(1, Math.min(width - left, Math.ceil(box.width * width)));
    const regionHeight = Math.max(1, Math.min(height - top, Math.ceil(box.height * height)));
    const region = await source.clone().extract({ left, top, width: regionWidth, height: regionHeight }).blur(Math.max(10, Math.min(80, Math.round(Math.min(regionWidth, regionHeight) / 5)))).png().toBuffer();
    return { input: region, left, top };
  }));
  return source.composite(composites).webp({ quality: 84, effort: 4 }).toBuffer();
}

export async function createResponsiveMachineImages(input: Buffer) {
  if (!Buffer.isBuffer(input) || input.length === 0) throw new Error("A non-empty image buffer is required");
  const pipeline = sharp(input, { failOn: "error", limitInputPixels: 100_000_000 }).rotate();
  const metadata = await pipeline.metadata();
  if (!metadata.width || !metadata.height) throw new Error("Image dimensions are unavailable");
  const widths = [480, 960, 1600].filter((width) => width < metadata.width!);
  const outputs = await Promise.all([
    ...widths.map(async (width) => ({ width, buffer: await pipeline.clone().resize({ width, withoutEnlargement: true }).webp({ quality: 84, effort: 4 }).toBuffer() })),
    { width: metadata.width, buffer: await pipeline.clone().webp({ quality: 84, effort: 4 }).toBuffer() },
  ]);
  return outputs;
}

export type WatermarkMode = "none" | "hgr-logo" | "hgr-logo-domain";
export type WatermarkOptions = { mode: WatermarkMode; placement: "top-left" | "top-right" | "bottom-left" | "bottom-right"; sizePercent: number; opacity: number; margin: number; approvedArtwork?: boolean; logoSvg?: string; domain?: string };
export const DEFAULT_WATERMARK_OPTIONS: Readonly<WatermarkOptions> = Object.freeze({
  mode: "none",
  placement: "bottom-right",
  sizePercent: 12,
  opacity: 0.7,
  margin: 24,
  approvedArtwork: false,
});

export function validateWatermarkOptions(options: WatermarkOptions): string | undefined {
  if (!Number.isFinite(options.sizePercent) || options.sizePercent < 1 || options.sizePercent > 40) return "Watermark size must be between 1% and 40%";
  if (!Number.isFinite(options.opacity) || options.opacity <= 0 || options.opacity > 1) return "Watermark opacity must be greater than 0 and at most 1";
  if (!Number.isSafeInteger(options.margin) || options.margin < 0 || options.margin > 500) return "Watermark margin is invalid";
  if (options.mode !== "none" && (!options.approvedArtwork || !options.logoSvg)) return "HGR watermark artwork and settings require owner approval";
  if (options.mode !== "none" && /<script|<foreignObject|(?:href|src)\s*=|<!ENTITY|url\s*\(/i.test(options.logoSvg ?? "")) return "Watermark artwork contains unsupported active content";
  if (options.mode === "hgr-logo-domain" && (!options.domain || !/^[a-z0-9.-]+$/i.test(options.domain))) return "A valid domain is required for this watermark mode";
  return undefined;
}

export async function applyWatermark(input: Buffer, options: WatermarkOptions): Promise<Buffer> {
  const error = validateWatermarkOptions(options);
  if (error) throw new Error(error);
  if (options.mode === "none") return Buffer.from(input);
  const image = sharp(input, { failOn: "error", limitInputPixels: 100_000_000 });
  const { width, height } = await image.metadata();
  if (!width || !height) throw new Error("Image dimensions are unavailable");
  const watermarkWidth = Math.round(width * options.sizePercent / 100);
  const domain = (options.domain ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
  const domainText = options.mode === "hgr-logo-domain" ? `<text x="50%" y="95%" text-anchor="middle" fill="white" font-size="${Math.max(12, Math.round(watermarkWidth / 12))}">${domain}</text>` : "";
  const logoSvg = (options.logoSvg ?? "").replace(/<\?xml[^>]*\?>/gi, "").replace(/<!DOCTYPE[^>]*>/gi, "");
  const logo = await sharp(Buffer.from(logoSvg), { failOn: "error", limitInputPixels: 5_000_000 }).resize({ width: watermarkWidth, height: Math.round(watermarkWidth * 0.25), fit: "inside" }).png().toBuffer();
  const svg = Buffer.from(`<svg width="${watermarkWidth}" height="${Math.round(watermarkWidth * 0.3)}" xmlns="http://www.w3.org/2000/svg"><g opacity="${options.opacity}"><image x="0" y="0" width="100%" height="80%" href="data:image/png;base64,${logo.toString("base64")}"/>${domainText}</g></svg>`);
  const horizontal = options.placement.endsWith("right") ? width - watermarkWidth - options.margin : options.margin;
  const overlayHeight = Math.round(watermarkWidth * 0.3);
  const vertical = options.placement.startsWith("bottom") ? height - overlayHeight - options.margin : options.margin;
  return image.composite([{ input: svg, left: Math.max(0, horizontal), top: Math.max(0, vertical) }]).webp({ quality: 84 }).toBuffer();
}
