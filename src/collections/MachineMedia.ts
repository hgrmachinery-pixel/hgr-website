import type { CollectionConfig } from "payload";

import { denyAccess, staffAccess } from "../lib/machines/access";
import { generatedMachineImageName } from "../lib/machines/media";

export const MachineMedia: CollectionConfig = {
  slug: "machine-media",
  labels: { singular: "Machine Image", plural: "Machine Images" },
  admin: {
    useAsTitle: "filename",
    description: "Machine photographs only. Sensitive documents do not belong here.",
  },
  access: {
    create: staffAccess,
    read: staffAccess,
    update: staffAccess,
    delete: denyAccess,
  },
  hooks: {
    beforeOperation: [({ operation, req }) => {
      if (operation === "create" && req.file) {
        req.file.name = generatedMachineImageName(req.file.mimetype);
      }
    }],
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
