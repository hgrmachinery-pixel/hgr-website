import type { CollectionConfig, PayloadRequest } from "payload";

import { isStaffUser } from "../lib/machines/access.ts";

type StaffRole = "owner" | "website-administrator";

async function userCount(req: PayloadRequest): Promise<number> {
  const result = await req.payload.count({
    collection: "users",
    overrideAccess: true,
    req,
  });
  return result.totalDocs;
}

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    cookies: {
      secure: process.env.SERVER_URL?.startsWith("https://") === true,
      sameSite: "Lax",
    },
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 60 * 60,
  },
  labels: { singular: "Staff Account", plural: "Staff Accounts" },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "role", "updatedAt"],
    description: "Protected HGR owner and website administrator accounts.",
  },
  disableDuplicate: true,
  access: {
    admin: ({ req }) => isStaffUser(req.user),
    create: async ({ req }) => {
      const user = req.user;
      if (!isStaffUser(user) || user.role !== "owner") return false;
      return (await userCount(req)) < 2;
    },
    read: async ({ id, req }) => {
      const user = req.user;
      if (!isStaffUser(user)) return false;
      if (user.role === "owner") return true;
      return id !== undefined && String(user.id) === String(id);
    },
    update: ({ id, req }) => {
      const user = req.user;
      return isStaffUser(user) &&
        (user.role === "owner" || String(user.id) === String(id));
    },
    delete: () => false,
    unlock: ({ req }) => {
      const user = req.user;
      return isStaffUser(user) && user.role === "owner";
    },
  },
  hooks: {
    beforeChange: [async ({ data, operation, originalDoc, req }) => {
      const user = req.user;
      if (operation === "update") {
        const originalRole = originalDoc?.role as StaffRole | undefined;
        if (data.role !== undefined && data.role !== originalRole) {
          throw new Error("Staff account identity cannot be changed.");
        }
        data.role = originalRole;
        return data;
      }

      const count = await userCount(req);
      if (count === 0) {
        // Payload's built-in first-register endpoint intentionally bypasses
        // create access. The hook assigns the sole initial owner server-side.
        data.role = "owner";
        return data;
      }

      if (
        count === 1 &&
        isStaffUser(user) &&
        user.role === "owner"
      ) {
        data.role = "website-administrator";
        return data;
      }

      throw new Error("Only the first owner and one administrator account are allowed.");
    }],
  },
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      unique: true,
      options: [
        { label: "Owner", value: "owner" },
        { label: "Website Administrator", value: "website-administrator" },
      ],
      admin: { position: "sidebar", readOnly: true },
      access: { update: () => false },
    },
  ],
};
