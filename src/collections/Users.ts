import type { CollectionConfig, PayloadRequest } from "payload";

import { isStaffUser } from "../lib/machines/access.ts";
import { APPROVE_PUBLIC_DOCUMENTS, hasPermission } from "../lib/auth/permissions.ts";

async function userCount(req: PayloadRequest): Promise<number> {
  const result = await req.payload.count({
    collection: "users",
    overrideAccess: true,
    req,
  });
  return result.totalDocs;
}

function relationID(value: unknown): string | number | undefined {
  if (typeof value === "string" || typeof value === "number") return value;
  if (!value || typeof value !== "object") return undefined;
  const id = (value as { id?: unknown }).id;
  return typeof id === "string" || typeof id === "number" ? id : undefined;
}

async function ownerRoleID(req: PayloadRequest): Promise<string | number> {
  const result = await req.payload.find({
    collection: "roles",
    where: { key: { equals: "owner" } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  });
  const id = result.docs[0]?.id;
  if (typeof id !== "string" && typeof id !== "number") {
    throw new Error("The seeded Owner role is missing; staff registration is unavailable.");
  }
  return id;
}

async function canManageUsers(req: PayloadRequest): Promise<boolean> {
  return hasPermission(req, APPROVE_PUBLIC_DOCUMENTS);
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
      if (await userCount(req) === 0) return true;
      return canManageUsers(req);
    },
    read: async ({ id, req }) => {
      const user = req.user;
      if (!isStaffUser(user)) return false;
      if (await canManageUsers(req)) return true;
      return id !== undefined && String(user.id) === String(id);
    },
    update: async ({ id, req }) => {
      const user = req.user;
      if (!isStaffUser(user)) return false;
      if (await canManageUsers(req)) return true;
      return String(user.id) === String(id);
    },
    delete: () => false,
    unlock: ({ req }) => canManageUsers(req),
  },
  hooks: {
    beforeChange: [async ({ data, operation, originalDoc, req }) => {
      if (operation === "update") {
        const previousRole = relationID(originalDoc?.role);
        const incomingRole = relationID(data.role);
        if (incomingRole !== undefined && incomingRole !== previousRole) {
          if (!await canManageUsers(req)) {
            throw new Error("Only a user with Approve Public Documents may change staff roles.");
          }
        }
        return data;
      }

      if (await userCount(req) === 0) {
        // The first account is bound to the pre-seeded Owner role. Ignore any
        // client-supplied relationship so bootstrap cannot choose a weaker role.
        data.role = await ownerRoleID(req);
        return data;
      }

      if (!await canManageUsers(req)) {
        throw new Error("Only a user with Approve Public Documents may create staff accounts.");
      }
      if (relationID(data.role) === undefined) {
        throw new Error("Choose a staff role for the new account.");
      }
      return data;
    }],
  },
  fields: [
    {
      name: "role",
      label: "Staff Role",
      type: "relationship",
      relationTo: "roles",
      required: true,
      admin: { position: "sidebar" },
      access: {
        update: ({ req }) => canManageUsers(req),
        read: ({ req }) => isStaffUser(req.user),
      },
    },
  ],
};
