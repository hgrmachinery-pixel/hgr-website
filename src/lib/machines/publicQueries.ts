import config from "@payload-config";
import { sql } from "@payloadcms/db-postgres";
import { getPayload, type Where } from "payload";
import { isPublicMediaDeliveryVerified } from "./media.ts";
import { getRelationId, projectPublicMachineWithMedia, sortPublicMachines } from "./publicInventory.ts";

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

async function resolveMachineMedia(payload: Awaited<ReturnType<typeof getPayload>>, document: Record<string, unknown>, deliveryVerified: boolean, includeGallery: boolean) {
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
