import type { CollectionConfig } from "payload";

import { publishedPageRead, staffAccess } from "../lib/machines/access";

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "Page", plural: "Pages" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
    listSearchableFields: ["title", "slug"],
    description: "Manage page copy and contact information used on the website.",
  },
  access: {
    create: staffAccess,
    read: publishedPageRead,
    update: staffAccess,
    delete: staffAccess,
    readVersions: staffAccess,
  },
  versions: { drafts: true, maxPerDoc: 50 },
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
