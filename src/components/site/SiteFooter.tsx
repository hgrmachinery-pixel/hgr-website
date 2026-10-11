import Link from "next/link";
import { getPublicContact } from "../../lib/siteContent";

const links = [
  ["Used Excavators", "/used-excavators"],
  ["Rental", "/rental"],
  ["Repair & Services", "/repair-services"],
  ["Spare Parts", "/spare-parts"],
  ["Lubricants", "/lubricants"],
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;

export async function SiteFooter() {
  const contact = await getPublicContact();
  return <footer className="site-footer">
    <div className="site-footer__main">
      <Link className="site-footer__brand" href="/" aria-label={`${contact.companyName ?? "HGR Equipment Resources"} homepage`}>{contact.companyName ?? <>HGR<span>Equipment Resources</span></>}</Link>
      <p>Used excavators and direct enquiries.</p>
      {(contact.phone || contact.salesEmail || contact.supportEmail || contact.yardAddress || contact.directionsURL || contact.socials.length > 0) && <address className="site-footer__contact">
        {contact.phone && <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>{contact.phone}</a>}
        {contact.salesEmail && <a href={`mailto:${contact.salesEmail}`}>Sales: {contact.salesEmail}</a>}
        {contact.supportEmail && <a href={`mailto:${contact.supportEmail}`}>Support: {contact.supportEmail}</a>}
        {contact.yardAddress && <span>{contact.yardAddress}</span>}
        {contact.directionsURL && <a href={contact.directionsURL} target="_blank" rel="noreferrer">Google Maps directions</a>}
        {contact.socials.map(({ label, url }) => <a key={label} href={url} target="_blank" rel="noreferrer">{label}</a>)}
      </address>}
      <nav aria-label="Footer navigation">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    </div>
    <div className="site-footer__legal"><span>{contact.companyName ?? "HGR Equipment Resources"}{contact.registrationNumber && ` · Registration ${contact.registrationNumber}`}</span><nav aria-label="Legal navigation"><Link href="/privacy-policy">Privacy Policy</Link><Link href="/website-terms">Website Terms</Link></nav></div>
  </footer>;
}
