import type { CollectionConfig } from "payload";

import { APPROVE_PUBLIC_DOCUMENTS, hasPermission } from "../lib/auth/permissions.ts";

export const Roles: CollectionConfig = {
  slug: "roles",
  labels: { singular: "Staff Role", plural: "Staff Roles" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "key", "updatedAt"],
    description: "Staff roles and their named permissions.",
  },
  access: {
    admin: ({ req }) => hasPermission(req, APPROVE_PUBLIC_DOCUMENTS),
    create: ({ req }) => hasPermission(req, APPROVE_PUBLIC_DOCUMENTS),
    read: ({ req }) => hasPermission(req, APPROVE_PUBLIC_DOCUMENTS),
    update: ({ req }) => hasPermission(req, APPROVE_PUBLIC_DOCUMENTS),
    // Keep role records, including custom roles, from being removed and
    // accidentally orphaning staff accounts or audit history.
    delete: () => false,
  },
  hooks: {
    beforeChange: [async ({ data, operation, originalDoc, req }) => {
      // Collection access can be bypassed by trusted Local API calls. Keep
      // permission administration guarded in the hook as well.
      if (!await hasPermission(req, APPROVE_PUBLIC_DOCUMENTS)) {
        throw new Error("Only a user with Approve Public Documents may manage roles.");
      }
      if (operation === "update" && data.key !== undefined && data.key !== originalDoc?.key) {
        throw new Error("A role's stable key cannot be changed.");
      }

      const key = operation === "create" ? data.key : originalDoc?.key;
      const permissions = data.permissions ?? originalDoc?.permissions;
      if (
        key === "owner" &&
        (!Array.isArray(permissions) || !permissions.includes(APPROVE_PUBLIC_DOCUMENTS))
      ) {
        throw new Error("The Owner role must retain Approve Public Documents.");
      }
      return data;
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
