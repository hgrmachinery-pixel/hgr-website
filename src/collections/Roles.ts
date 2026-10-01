import type { CollectionConfig } from "payload";

import { APPROVE_PUBLIC_DOCUMENTS, hasOwnerAuthority } from "../lib/auth/permissions.ts";

export const Roles: CollectionConfig = {
  slug: "roles",
  labels: { singular: "Staff Role", plural: "Staff Roles" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "key", "updatedAt"],
    description: "Staff roles and their named permissions.",
  },
  access: {
    admin: ({ req }) => hasOwnerAuthority(req),
    create: ({ req }) => hasOwnerAuthority(req),
    read: ({ req }) => hasOwnerAuthority(req),
    update: ({ req }) => hasOwnerAuthority(req),
    // Keep role records, including custom roles, from being removed and
    // accidentally orphaning staff accounts or audit history.
    delete: () => false,
  },
  hooks: {
    beforeChange: [async ({ data, operation, originalDoc, req }) => {
      // Collection access can be bypassed by trusted Local API calls. Keep
      // permission administration guarded in the hook as well.
      if (!await hasOwnerAuthority(req)) {
        throw new Error("Only the current Owner may manage roles.");
      }
      if (operation === "update" && data.key !== undefined && data.key !== originalDoc?.key) {
        throw new Error("A role's stable key cannot be changed.");
      }

      const key = operation === "create" ? data.key : originalDoc?.key;
      const permissions = data.permissions === undefined
        ? originalDoc?.permissions
        : data.permissions;
      if (
        key === "owner" &&
        (!Array.isArray(permissions) || !permissions.some((entry) =>
          entry !== null && typeof entry === "object" &&
          (entry as { name?: unknown }).name === APPROVE_PUBLIC_DOCUMENTS,
        ))
      ) {
        throw new Error("The Owner role must retain Approve Public Documents.");
      }
      return data;
    }],
    beforeDelete: [async ({ id, req }) => {
      if (!await hasOwnerAuthority(req)) {
        throw new Error("Only the current Owner may delete roles.");
      }
      const role = await req.payload.findByID({
        collection: "roles",
        id,
        depth: 0,
        overrideAccess: true,
        req,
      });
      if (role.key === "owner" || role.key === "website-administrator") {
        throw new Error("Built-in staff roles cannot be deleted.");
      }
      const assigned = await req.payload.count({
        collection: "users",
        where: { role: { equals: id } },
        overrideAccess: true,
        req,
      });
      if (assigned.totalDocs > 0) {
        throw new Error("A role assigned to staff accounts cannot be deleted.");
      }
    }],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      maxLength: 80,
    },
    {
      name: "key",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { position: "sidebar" },
      access: { update: () => false },
    },
    {
      name: "permissions",
      type: "array",
      admin: { description: "Named capabilities granted to this role." },
      fields: [{ name: "name", type: "text", required: true, maxLength: 120 }],
    },
  ],
};
