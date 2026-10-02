import type { CollectionConfig } from "payload";

import { hasOwnerAuthority } from "../lib/auth/permissions.ts";
import { publishedPageRead, staffAccess } from "../lib/machines/access.ts";

const legalSlugs = new Set(["privacy-policy", "website-terms"]);

function slugIsLegal(value: unknown): boolean {
  return typeof value === "string" && legalSlugs.has(value);
}

async function pageHasLegalSlug(req: Parameters<typeof hasOwnerAuthority>[0], id: string | number): Promise<boolean> {
  const versions = await Promise.all([
    req.payload.findByID({ collection: "pages", id, draft: false, depth: 0, overrideAccess: true, req }),
    req.payload.findByID({ collection: "pages", id, draft: true, depth: 0, overrideAccess: true, req }),
  ]);
  return versions.some((page) => slugIsLegal(page.slug));
}

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Page", plural: "Pages" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
    listSearchableFields: ["title", "slug"],
    description: "Manage published website copy. Only the Owner may save, publish or remove Privacy Policy and Website Terms pages; publishing confirms approval of the exact wording.",
  },
  access: {
    create: staffAccess,
    read: publishedPageRead,
    update: staffAccess,
    delete: staffAccess,
    readVersions: staffAccess,
  },
  versions: { drafts: true, maxPerDoc: 50 },
  hooks: {
    beforeChange: [async ({ data, operation, originalDoc, req }) => {
      const legal = slugIsLegal(data.slug) || slugIsLegal(originalDoc?.slug) ||
        (operation === "update" && originalDoc?.id !== undefined && await pageHasLegalSlug(req, originalDoc.id));
      if (legal && !await hasOwnerAuthority(req)) {
        throw new Error("Only the Owner may save or publish Privacy Policy or Website Terms content. Publishing confirms Owner review and approval of the exact wording.");
      }
      return data;
    }],
    beforeDelete: [async ({ id, req }) => {
      const legal = await pageHasLegalSlug(req, id);
      if (legal && !await hasOwnerAuthority(req)) {
        throw new Error("Only the Owner may delete Privacy Policy or Website Terms content.");
      }
    }],
  },
  fields: [
    { name: "title", type: "text", required: true, maxLength: 160 },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      maxLength: 120,
    },
    { name: "seoTitle", label: "SEO Title", type: "text", maxLength: 70 },
    {
      name: "seoDescription",
      label: "SEO Description",
      type: "textarea",
      maxLength: 180,
    },
    {
      name: "body",
      label: "Page Content",
      type: "richText",
      required: true,
    },
  ],
};
