import type { Access } from "payload";

export type StaffUser = {
  collection: "users";
  id: string | number;
};

export function isStaffUser(user: unknown): user is StaffUser {
  if (!user || typeof user !== "object") return false;
  const candidate = user as { collection?: unknown; id?: unknown };
  return candidate.collection === "users" &&
    (typeof candidate.id === "string" || typeof candidate.id === "number");
}

export const staffAccess: Access = ({ req }) => isStaffUser(req.user);
export const denyAccess: Access = () => false;

export const publishedMachineRead: Access = ({ req }) =>
  isStaffUser(req.user)
    ? true
    : {
        _status: { equals: "published" },
        archived: { not_equals: true },
      };

export const publishedPageRead: Access = ({ req }) =>
  isStaffUser(req.user) ? true : { _status: { equals: "published" } };

export function publicPriceRead({ req, doc }: { req: { user?: unknown }; doc?: { priceMode?: string } }) {
  return isStaffUser(req.user) || doc?.priceMode === "public";
}

export function publicSerialRead({
  req,
  doc,
}: {
  req: { user?: unknown };
  doc?: { showSerialPublicly?: boolean };
}) {
  return isStaffUser(req.user) || doc?.showSerialPublicly === true;
}
