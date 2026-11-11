import { createHash } from "node:crypto";
import sharp from "sharp";

import { redactionPixelBounds, validateRedactions, type NormalizedRedaction } from "./media.ts";

export const DEFAULT_MACHINE_PHOTO_MAX_PIXELS = 20_000_000;
export const MACHINE_PHOTO_MAX_DIMENSION = 1600;

export function configuredMachinePhotoMaxPixels(environment: Record<string, string | undefined> = process.env): number {
  const raw = environment.HGR_MACHINE_PHOTO_MAX_PIXELS?.trim();
  if (!raw) return DEFAULT_MACHINE_PHOTO_MAX_PIXELS;
  if (!/^[1-9][0-9]*$/.test(raw)) throw new Error("HGR_MACHINE_PHOTO_MAX_PIXELS must be a positive whole number");
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) throw new Error("HGR_MACHINE_PHOTO_MAX_PIXELS is outside the supported range");
  return value;
}

export class MachinePhotoPixelLimitError extends Error {
  constructor() {
    super("Photo dimensions exceed the configured pixel limit");
    this.name = "MachinePhotoPixelLimitError";
  }
}

/** Reads image headers only, then rejects excessive dimensions before pixel decoding. */
export async function inspectMachinePhoto(input: Buffer, maxPixels = configuredMachinePhotoMaxPixels()) {
  if (!Buffer.isBuffer(input) || input.length === 0) throw new Error("A non-empty image buffer is required");
  // Metadata reads the encoded header; keeping this unrestricted lets us return
  // our own limit error before any pixel decode while the decode pipeline below
  // still enforces Sharp's hard limit.
  const metadata = await sharp(input, { failOn: "error" }).metadata();
  if (!metadata.width || !metadata.height) throw new Error("Image dimensions are unavailable");
  if (metadata.width * metadata.height > maxPixels) throw new MachinePhotoPixelLimitError();
  return metadata;
}

export function photoContentDigest(buffer: Buffer): string {
  return `sha256:${createHash("sha256").update(buffer).digest("hex")}`;
}

export async function createResponsiveMachineImage(input: Buffer, maxPixels = configuredMachinePhotoMaxPixels()): Promise<Buffer> {
  if (!Buffer.isBuffer(input) || input.length === 0) throw new Error("A non-empty image buffer is required");
  await inspectMachinePhoto(input, maxPixels);
  return sharp(input, { failOn: "error", limitInputPixels: maxPixels })
    .rotate()
    .resize({ width: MACHINE_PHOTO_MAX_DIMENSION, height: MACHINE_PHOTO_MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84, effort: 4 })
    .toBuffer();
}

export async function blurSensitiveAreas(input: Buffer, redactions: NormalizedRedaction[], maxPixels = configuredMachinePhotoMaxPixels()): Promise<Buffer> {
  if (!validateRedactions(redactions)) throw new Error("One or more blur regions are invalid");
  await inspectMachinePhoto(input, maxPixels);
  const source = sharp(input, { failOn: "error", limitInputPixels: maxPixels }).rotate();
  const dimensions = await source.metadata();
  const { width, height } = dimensions.autoOrient;
  if (!width || !height) throw new Error("Image dimensions are unavailable");
  const composites = await Promise.all(redactions.map(async (box) => {
    const { left, top, width: regionWidth, height: regionHeight } = redactionPixelBounds(box, dimensions);
    const region = await source.clone().extract({ left, top, width: regionWidth, height: regionHeight }).blur(Math.max(10, Math.min(80, Math.round(Math.min(regionWidth, regionHeight) / 5)))).png().toBuffer();
    return { input: region, left, top };
  }));
  return source.composite(composites)
    .resize({ width: MACHINE_PHOTO_MAX_DIMENSION, height: MACHINE_PHOTO_MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 84, effort: 4 }).toBuffer();
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

export type WatermarkMode = "none" | "hgr-logo" | "hgr-logo-domain" | "domain-text";
export type WatermarkOptions = { mode: WatermarkMode; placement: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center-lower"; sizePercent: number; opacity: number; margin: number; approvedArtwork?: boolean; logoSvg?: string; domain?: string };
export const DEFAULT_WATERMARK_OPTIONS: Readonly<WatermarkOptions> = Object.freeze({
  mode: "domain-text",
  placement: "center-lower",
  sizePercent: 6,
  opacity: 0.5,
  margin: 24,
  domain: "hgrmachinery.com",
});

export function validateWatermarkOptions(options: WatermarkOptions): string | undefined {
  if (!Number.isFinite(options.sizePercent) || options.sizePercent < 1 || options.sizePercent > 40) return "Watermark size must be between 1% and 40%";
  if (!Number.isFinite(options.opacity) || options.opacity <= 0 || options.opacity > 1) return "Watermark opacity must be greater than 0 and at most 1";
  if (!Number.isSafeInteger(options.margin) || options.margin < 0 || options.margin > 500) return "Watermark margin is invalid";
  if (["hgr-logo", "hgr-logo-domain"].includes(options.mode) && (!options.approvedArtwork || !options.logoSvg)) return "HGR watermark artwork and settings require owner approval";
  if (options.mode !== "none" && /<script|<foreignObject|(?:href|src)\s*=|<!ENTITY|url\s*\(/i.test(options.logoSvg ?? "")) return "Watermark artwork contains unsupported active content";
  if (["hgr-logo-domain", "domain-text"].includes(options.mode) && (!options.domain || !/^[a-z0-9.-]+$/i.test(options.domain))) return "A valid domain is required for this watermark mode";
  return undefined;
}

// A small embedded 5x7 bitmap font keeps Sharp/libvips from depending on
// system fonts, which are not consistently installed in Railway containers.
const WATERMARK_GLYPHS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  a: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  b: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  c: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  d: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  e: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  f: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  g: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  h: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  i: ["111", "010", "010", "010", "010", "010", "111"],
  j: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  k: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  l: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  m: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  n: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  o: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  p: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  r: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  s: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  t: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  u: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  v: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  w: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  x: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  5: ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  6: ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  9: ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  ".": ["000", "000", "000", "000", "000", "110", "110"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
});

/** Build font-independent SVG paths for the approved HGR domain watermark. */
export function buildDomainWatermarkSvg(width: number, height: number, options: WatermarkOptions): Buffer {
  const domain = (options.domain ?? "").toLowerCase();
  const glyphs = [...domain].map((character) => {
    const glyph = WATERMARK_GLYPHS[character];
    if (!glyph) throw new Error(`Unsupported watermark character: ${character}`);
    return glyph;
  });
  const fontSize = Math.max(1, Math.round(width * options.sizePercent / 100));
  const cellWidth = fontSize / 11;
  const cellHeight = fontSize / 7;
  const advance = cellWidth * 6;
  const textWidth = Math.max(0, glyphs.length * advance - cellWidth);
  const left = (width - textWidth) / 2;
  const top = height * 0.58 - fontSize / 2;
  const rectangles: string[] = [];

  glyphs.forEach((glyph, characterIndex) => {
    glyph.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        if (pixel === "1") {
          const rectX = (left + characterIndex * advance + x * cellWidth).toFixed(2);
          const rectY = (top + y * cellHeight).toFixed(2);
          rectangles.push(`M${rectX} ${rectY}h${cellWidth.toFixed(2)}v${cellHeight.toFixed(2)}h-${cellWidth.toFixed(2)}z`);
        }
      });
    });
  });

  return Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><path fill="white" fill-opacity="${options.opacity}" d="${rectangles.join("")}"/></svg>`);
}

export async function applyWatermark(input: Buffer, options: WatermarkOptions): Promise<Buffer> {
  const error = validateWatermarkOptions(options);
  if (error) throw new Error(error);
  if (options.mode === "none") return Buffer.from(input);
  const image = sharp(input, { failOn: "error", limitInputPixels: 100_000_000 });
  const { width, height } = await image.metadata();
  if (!width || !height) throw new Error("Image dimensions are unavailable");
  if (options.mode === "domain-text") return image.composite([{ input: buildDomainWatermarkSvg(width, height, options), left: 0, top: 0 }]).webp({ quality: 84 }).toBuffer();
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
