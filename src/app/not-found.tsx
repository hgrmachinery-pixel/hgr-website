import Link from "next/link";

export default function NotFound() {
  return <main className="page-shell not-found">
    <p className="eyebrow">Page not found</p>
    <h1 className="page-title">We couldn't find that page</h1>
    <p className="page-intro">The link may have changed. You can browse the excavators or contact HGR for help.</p>
    <div className="not-found__actions"><Link className="button button--primary" href="/used-excavators">Browse used excavators</Link><Link className="button button--quiet" href="/contact">Contact HGR</Link><Link href="/">Go to the homepage</Link></div>
  </main>;
}
