import type { PayloadRequest } from "payload";

import { isStaffUser } from "../machines/access.ts";

export const APPROVE_PUBLIC_DOCUMENTS = "Approve Public Documents";

export const BUILT_IN_ROLE_SEEDS = [
  {
    name: "Owner",
    key: "owner",
    permissions: [{ name: APPROVE_PUBLIC_DOCUMENTS }],
  },
  {
    name: "Website Administrator",
    key: "website-administrator",
    permissions: [],
  },
] as const;

function relationID(value: unknown): string | number | undefined {
  if (typeof value === "string" || typeof value === "number") return value;
  if (!value || typeof value !== "object") return undefined;
  const id = (value as { id?: unknown }).id;
  return typeof id === "string" || typeof id === "number" ? id : undefined;
}

/** Resolve permissions from the current persisted user and role on each call. */
export async function hasPermission(
  req: PayloadRequest,
  permission: string,
): Promise<boolean> {
  const identity = req.user;
  if (!isStaffUser(identity) || !permission.trim()) return false;

  const user = await req.payload.findByID({
    collection: "users",
    id: identity.id,
    depth: 0,
    overrideAccess: true,
    req,
  });
  const roleID = relationID((user as { role?: unknown }).role);
  if (roleID === undefined) return false;

  const role = await req.payload.findByID({
    collection: "roles",
    id: roleID,
    depth: 0,
    overrideAccess: true,
    req,
  });
  const rolePermissions = (role as { permissions?: unknown }).permissions;
  return Array.isArray(rolePermissions) && rolePermissions.some((entry) =>
    entry !== null && typeof entry === "object" &&
    (entry as { name?: unknown }).name === permission,
  );
}
