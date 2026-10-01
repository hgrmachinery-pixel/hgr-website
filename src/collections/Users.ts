import type { CollectionConfig, PayloadRequest } from "payload";
import { sql } from "@payloadcms/db-postgres";

import { isStaffUser } from "../lib/machines/access.ts";
import { hasOwnerAuthority } from "../lib/auth/permissions.ts";

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
  return hasOwnerAuthority(req);
}

async function lockOwnerRole(req: PayloadRequest): Promise<string | number> {
  const transactionID = await req.transactionID;
  const session = transactionID
    ? req.payload.db.sessions?.[String(transactionID)]?.db
    : undefined;
  if (!transactionID || !session) {
    throw new Error("First-owner account creation requires an active database transaction.");
  }
  const result = await req.payload.db.execute({
    db: session as Parameters<typeof req.payload.db.execute>[0]["db"],
    drizzle: req.payload.db.drizzle,
    sql: sql`SELECT "id" FROM "roles" WHERE "key" = 'owner' FOR UPDATE`,
  });
  if (!result.rows[0]) {
    throw new Error("The seeded Owner role is missing; staff registration is unavailable.");
  }
  const ownerID = (result.rows[0] as { id?: unknown }).id;
  if (typeof ownerID !== "number" && typeof ownerID !== "string") {
    throw new Error("The seeded Owner role has an invalid identity.");
  }
  return ownerID;
}

async function isFirstAccount(req: PayloadRequest): Promise<boolean> {
  if (await userCount(req) !== 0) return false;
  // This stable migration-created row serializes concurrent first-account attempts.
  await lockOwnerRole(req);
  return await userCount(req) === 0;
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
    // Access checks are also used by Payload's permission probe. Keep them
    // side-effect-free; the transaction lock and authoritative recount happen
    // in beforeChange when a create is actually attempted.
    create: async ({ req }) => (await userCount(req)) === 0 || canManageUsers(req),
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
        if (incomingRole !== undefined && String(incomingRole) !== String(previousRole)) {
          if (!await canManageUsers(req)) {
            throw new Error("Only the current Owner may change staff roles.");
          }
          const ownerID = await lockOwnerRole(req);
          const touchesOwner = String(previousRole) === String(ownerID) || String(incomingRole) === String(ownerID);
          if (touchesOwner && String(previousRole) === String(ownerID) && String(incomingRole) !== String(ownerID)) {
            const result = await req.payload.count({
              collection: "users",
              where: { role: { equals: ownerID } },
              overrideAccess: true,
              req,
            });
            if (result.totalDocs <= 1) {
              throw new Error("The last Owner account cannot be demoted.");
            }
          }
        }
        return data;
      }

      if (await isFirstAccount(req)) {
        // The first account is bound to the pre-seeded Owner role. Ignore any
        // client-supplied relationship so bootstrap cannot choose a weaker role.
        data.role = await ownerRoleID(req);
        return data;
      }

      if (!await canManageUsers(req)) {
        throw new Error("Only the current Owner may create staff accounts.");
      }
      if (relationID(data.role) === undefined) {
        throw new Error("Choose a staff role for the new account.");
      }
      return data;
    }],
    beforeDelete: [async ({ id, req }) => {
      if (!await canManageUsers(req)) {
        throw new Error("Only the current Owner may delete staff accounts.");
      }
      const ownerID = await ownerRoleID(req);
      const target = await req.payload.findByID({
        collection: "users",
        id,
        depth: 0,
        overrideAccess: true,
        req,
      });
      if (String(relationID(target.role)) === String(ownerID)) {
        const lockedOwnerID = await lockOwnerRole(req);
        if (String(lockedOwnerID) !== String(ownerID)) {
          throw new Error("The Owner role changed while checking account deletion.");
        }
        const result = await req.payload.count({
          collection: "users",
          where: { role: { equals: ownerID } },
          overrideAccess: true,
          req,
        });
        if (result.totalDocs <= 1) {
          throw new Error("The last Owner account cannot be deleted.");
        }
      }
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
