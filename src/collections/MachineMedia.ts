import type { Access, CollectionConfig } from "payload";

const staffOnly: Access = ({ req }) => Boolean(req.user);

export const MachineMedia: CollectionConfig = {
  slug: "machine-media",
  labels: { singular: "Machine Image", plural: "Machine Images" },
  admin: {
    useAsTitle: "filename",
    description: "Machine photographs only. Sensitive documents do not belong here.",
  },
  access: {
    create: staffOnly,
    read: staffOnly,
    update: staffOnly,
    delete: () => false,
  },
  upload: {
    disableLocalStorage: true,
    filesRequiredOnCreate: true,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    pasteURL: false,
    imageSizes: [],
  },
  fields: [
    {
      name: "machine",
      type: "relationship",
      relationTo: "machines",
      required: false,
      index: true,
    },
    {
      name: "altText",
      label: "Alternative Text",
      type: "text",
      maxLength: 250,
    },
  ],
};
