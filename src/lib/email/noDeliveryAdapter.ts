import type { EmailAdapter } from "payload";

// Phase 2 keeps recovery credentials out of logs while real email delivery is
// deferred to the approved email-provider work in Phase 5.
export const noDeliveryEmailAdapter: EmailAdapter = () => ({
  name: "hgr-no-delivery",
  defaultFromAddress: "no-reply@example.invalid",
  defaultFromName: "HGR Website",
  sendEmail: async () => ({ accepted: false }),
});
