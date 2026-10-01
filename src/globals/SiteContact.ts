import type { GlobalConfig } from "payload";

import { staffAccess } from "../lib/machines/access";

export const SiteContact: GlobalConfig = {
  slug: "site-contact",
  label: "Site Contact",
  access: {
    read: () => true,
    update: staffAccess,
  },
  fields: [
    { name: "phone", label: "Contact Phone", type: "text", maxLength: 40 },
    { name: "whatsApp", label: "WhatsApp Number", type: "text", maxLength: 40 },
    { name: "email", label: "Contact Email", type: "email" },
    {
      name: "yardLocation",
      label: "Yard / Location",
      type: "textarea",
      maxLength: 500,
    },
  ],
};
