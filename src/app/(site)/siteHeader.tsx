import Link from "next/link";
import { NavigationToggle } from "../../components/site/NavigationToggle";
import { TrackedContactLink } from "../../components/site/TrackedContactLink";
import { getPublicContact } from "../../lib/siteContent";

export async function SiteHeader() {
  const contact = await getPublicContact();
  const whatsappHref = contact.whatsApp ? `https://wa.me/${contact.whatsApp}` : "/contact";
  return (
    <header className="site-header">
      <Link className="site-brand" href="/" aria-label="HGR homepage"><span className="site-brand__mark">HGR</span><span>Equipment Resources</span></Link>
      <NavigationToggle><nav className="site-nav" aria-label="Main navigation">
        <Link href="/used-excavators">Used Machines</Link><Link href="/repair-services">Repair &amp; Services</Link><Link href="/spare-parts">Spare Parts</Link><Link href="/lubricants">Lubricants</Link><Link href="/rental">Rental</Link>
        <Link href="/about">About</Link><Link href="/contact">Contact</Link>
      </nav></NavigationToggle>
      {contact.whatsApp ? <TrackedContactLink className="site-header__contact" href={whatsappHref} channel="whatsapp" pageGroup="contact" target="_blank" rel="noreferrer">WhatsApp HGR</TrackedContactLink> : <Link className="site-header__contact" href="/contact">Contact HGR</Link>}
    </header>
  );
}
