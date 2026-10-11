import Link from "next/link";

const links = [
  ["Used Excavators", "/used-excavators"],
  ["Rental", "/rental"],
  ["Repair & Services", "/repair-services"],
  ["Spare Parts", "/spare-parts"],
  ["Lubricants", "/lubricants"],
  ["About", "/about"],
  ["Contact", "/contact"],
] as const;

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="site-footer__main">
      <Link className="site-footer__brand" href="/" aria-label="HGR Equipment Resources homepage">HGR<span>Equipment Resources</span></Link>
      <p>Used excavators and direct enquiries.</p>
      <nav aria-label="Footer navigation">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
    </div>
    <div className="site-footer__legal"><span>HGR Equipment Resources</span><nav aria-label="Legal navigation"><Link href="/privacy-policy">Privacy Policy</Link><Link href="/website-terms">Website Terms</Link></nav></div>
  </footer>;
}
