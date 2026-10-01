import { draftMode } from "next/headers";
import { getPayload } from "payload";

import config from "@payload-config";
import { createPreviewHandler } from "@/lib/machines/preview";

const serverURL = process.env.SERVER_URL;
const previewSecret = process.env.PREVIEW_SECRET;
if (!serverURL || !previewSecret || previewSecret.length < 32) {
  throw new Error("Draft preview requires SERVER_URL and a 32-character PREVIEW_SECRET.");
}

const handlePreview = createPreviewHandler({
  serverURL,
  secret: previewSecret,
  authenticate: async (request) => {
    const payload = await getPayload({ config });
    const result = await payload.auth({ headers: request.headers });
    return result.user as { id: string | number; collection?: string } | null;
  },
  findMachine: async (id, user) => {
    const payload = await getPayload({ config });
    const machine = await payload.findByID({
      collection: "machines",
      id,
      draft: true,
      depth: 0,
      overrideAccess: false,
      user,
    });
    return machine as { id: string | number; slug?: string; archived?: boolean };
  },
  enableDraft: async () => {
    await (await draftMode()).enable();
  },
});

export const GET = handlePreview;
