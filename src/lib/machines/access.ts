import type { Access } from "payload";

export const staffAccess: Access = ({ req }) => Boolean(req.user);
export const denyAccess: Access = () => false;

export const publishedMachineRead: Access = ({ req }) =>
  req.user
    ? true
    : {
        _status: { equals: "published" },
        archived: { not_equals: true },
      };

export const publishedPageRead: Access = ({ req }) =>
  req.user ? true : { _status: { equals: "published" } };

export function publicPriceRead({ req, doc }: { req: { user?: unknown }; doc?: { priceMode?: string } }) {
  return Boolean(req.user) || doc?.priceMode === "public";
}

export function publicSerialRead({
  req,
  doc,
}: {
  req: { user?: unknown };
  doc?: { showSerialPublicly?: boolean };
}) {
  return Boolean(req.user) || doc?.showSerialPublicly === true;
}
