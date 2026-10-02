import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="site-brand" href="/" aria-label="HGR homepage"><span className="site-brand__mark">HGR</span><span>Equipment Resources</span></Link>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/used-excavators">Used Excavators</Link><Link href="/rental">Rental</Link>
        <Link href="/machinery-services">Machinery Services</Link><Link href="/lubricants">Lubricants</Link>
        <Link href="/about">About</Link><Link href="/contact">Contact</Link>
      </nav>
    </header>
  );
}
