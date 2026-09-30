import type { Access, CollectionConfig } from "payload";

const authenticated: Access = ({ req: { user } }) => Boolean(user);

// Only generated test content belongs here; this is not the HGR inventory.
export const FoundationFixture: CollectionConfig = {
  slug: "foundation-fixtures",
  labels: {
    singular: "Synthetic foundation fixture",
    plural: "Synthetic foundation fixtures",
  },
  admin: {
    useAsTitle: "title",
    description:
      "Fake, disposable test content only. Never upload business or customer documents.",
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    disableLocalStorage: true,
    filesRequiredOnCreate: true,
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    pasteURL: false,
    imageSizes: [
      {
        name: "card",
        width: 640,
        withoutEnlargement: true,
      },
    ],
    adminThumbnail: "card",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      maxLength: 120,
    },
  ],
};
