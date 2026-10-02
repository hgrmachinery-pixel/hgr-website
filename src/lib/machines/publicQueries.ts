import { isPublicMediaDeliveryVerified } from "./media.ts";
import { getRelationId, projectPublicMachineWithMedia, sortPublicMachines } from "./publicInventory.ts";
import type { Payload, Where } from "payload";

/** Fictional inventory used only for a deliberate local visual review. */
const localReviewMachines = [
  { id: "demo-1", hgrId: "HGR-900001", slug: "demo-komatsu-pc200-8-hgr-900001", _status: "published", archived: false, stockStatus: "available", brand: "Komatsu", model: "PC200-8", year: 2018, hours: 6840, engine: "Komatsu SAA6D107E", operatingWeight: "20,000 kg", condition: "Good", countryOfOrigin: "Japan", machineOriginStatus: "Local Used", priceMode: "contact", description: "Fictional sample record for local layout review. Specifications are not real.", gallery: [] },
  { id: "demo-2", hgrId: "HGR-900002", slug: "demo-caterpillar-320d-hgr-900002", _status: "published", archived: false, stockStatus: "available", brand: "Caterpillar", model: "320D", year: 2016, hours: 9120, condition: "Used", countryOfOrigin: "Japan", priceMode: "contact", description: "Fictional sample record for local layout review. Specifications are not real.", gallery: [] },
  { id: "demo-3", hgrId: "HGR-900003", slug: "demo-hitachi-zx200-5g-hgr-900003", _status: "published", archived: false, stockStatus: "reserved", brand: "Hitachi", model: "ZX200-5G", year: 2019, hours: 5010, condition: "Good", priceMode: "public", price: 328000, description: "Fictional sample record for local layout review. Specifications are not real.", gallery: [] },
  { id: "demo-4", hgrId: "HGR-900004", slug: "demo-kobelco-sk200-10-hgr-900004", _status: "published", archived: false, stockStatus: "sold", brand: "Kobelco", model: "SK200-10", year: 2017, hours: 7350, condition: "Used", priceMode: "contact", description: "Fictional sample record for local layout review. Specifications are not real.", gallery: [] },
].map((machine) => ({ ...machine, _reviewSample: true }));

export function isLocalReviewMode() {
  return process.env.HGR_LOCAL_UI_REVIEW === "true" && process.env.NODE_ENV !== "production";
}

function localReviewInventory() {
  return { machines: localReviewMachines.map((machine) => ({ ...projectPublicMachineWithMedia(machine, false)!, id: machine.id, _reviewSample: true })), unavailable: false };
}

async function mapBounded<T, R>(items: T[], concurrency: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let index = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current]);
    }
  }));
  return results;
}

async function resolveMachineMedia(payload: Payload, document: Record<string, unknown>, deliveryVerified: boolean, includeGallery: boolean) {
  if (!deliveryVerified) return projectPublicMachineWithMedia(document, false);
  async function resolve(relation: unknown) {
    const id = getRelationId(relation);
    if (id === undefined) return undefined;
    try {
      return await payload.findByID({ collection: "machine-media", id, depth: 0, overrideAccess: false });
    } catch {
      return undefined;
    }
  }
  const featured = await resolve(document.featuredImage);
  const rawGallery = Array.isArray(document.gallery) ? document.gallery.slice(0, 100) : document.gallery ? [document.gallery] : [];
  const gallery = includeGallery ? (await mapBounded(rawGallery, 5, resolve)).filter(Boolean) : [];
  return projectPublicMachineWithMedia({ ...document, featuredImage: featured, gallery }, true);
}

export async function getPublicMachines() {
  if (isLocalReviewMode()) return localReviewInventory();
  const [{ default: config }, { getPayload }] = await Promise.all([import("@payload-config"), import("payload")]);
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "machines",
      where: { and: [{ _status: { equals: "published" } }, { archived: { not_equals: true } }] },
      limit: 500,
      page: 1,
      depth: 0,
      overrideAccess: false,
      sort: "hgrId",
    });
    const deliveryVerified = isPublicMediaDeliveryVerified();
    const machines = (await mapBounded(result.docs, 8, (document) =>
      resolveMachineMedia(payload, document as unknown as Record<string, unknown>, deliveryVerified, false)))
      .filter((machine): machine is NonNullable<typeof machine> => machine !== null);
    return { machines: sortPublicMachines(machines), unavailable: false };
  } catch {
    return { machines: [], unavailable: true };
  }
}

export async function getPublicMachineForSlug(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { machine: null, unavailable: false };
  if (isLocalReviewMode()) {
    const document = localReviewMachines.find((machine) => machine.slug === slug);
    return { machine: document ? { ...projectPublicMachineWithMedia(document, false)!, id: document.id, _reviewSample: true } : null, unavailable: false };
  }
  const [{ default: config }, { getPayload }, { sql }] = await Promise.all([import("@payload-config"), import("payload"), import("@payloadcms/db-postgres")]);
  try {
    const payload = await getPayload({ config });
    const constraints: Where[] = [
      { _status: { equals: "published" } },
      { archived: { not_equals: true } },
    ];
    const current = await payload.find({
      collection: "machines",
      where: { and: [...constraints, { slug: { equals: slug } }] },
      limit: 2,
      page: 1,
      depth: 0,
      overrideAccess: false,
    });
    let targetID: string | number | undefined;
    if (current.docs.length === 1) {
      targetID = current.docs[0].id;
    } else if (current.docs.length > 1) {
      return { machine: null, unavailable: false };
    } else {
      // previousSlugs is intentionally unreadable to anonymous users. This
      // parameterized JSONB containment lookup returns IDs only. The result is
      // narrowed to published/non-archived rows and fetched again through
      // ordinary public collection access before projection.
      const historical = await payload.db.execute({
        drizzle: payload.db.drizzle,
        sql: sql`SELECT "id" FROM "machines" WHERE "_status" = 'published' AND "archived" IS NOT TRUE AND "previous_slugs" @> ${JSON.stringify([slug])}::jsonb LIMIT 2`,
      });
      if (historical.rows.length !== 1) return { machine: null, unavailable: false };
      const id = historical.rows[0]?.id;
      if (typeof id !== "string" && typeof id !== "number") return { machine: null, unavailable: false };
      targetID = id;
    }
    if (targetID === undefined) return { machine: null, unavailable: false };
    const document = await payload.findByID({ collection: "machines", id: targetID, depth: 0, overrideAccess: false });
    if (document._status !== "published" || document.archived === true) return { machine: null, unavailable: false };
    return {
      machine: await resolveMachineMedia(payload, document as unknown as Record<string, unknown>, isPublicMediaDeliveryVerified(), true),
      unavailable: false,
    };
  } catch {
    return { machine: null, unavailable: true };
  }
}
