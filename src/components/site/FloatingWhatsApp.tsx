import { getPublicContact } from "../../lib/siteContent";
import { TrackedContactLink } from "./TrackedContactLink";

export async function FloatingWhatsApp() {
  const { whatsApp } = await getPublicContact();
  if (!whatsApp) return null;
  return <TrackedContactLink
    className="floating-whatsapp"
    href={`https://wa.me/${whatsApp}`}
    channel="whatsapp"
    pageGroup="contact"
    target="_blank"
    rel="noreferrer"
  ><span aria-hidden="true">↗</span><span>WhatsApp HGR</span></TrackedContactLink>;
}
