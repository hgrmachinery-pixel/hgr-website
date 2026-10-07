import Link from "next/link";
import type { Metadata } from "next";
import { InventoryCard } from "../../../components/site/InventoryCard";
import { TrackAnalyticsEvent } from "../../../components/site/AnalyticsProvider";
import { createAnalyticsEvent } from "../../../lib/analytics/events.ts";
import { getPublicContact } from "../../../lib/siteContent";
import { getPublicInventoryItems } from "../../../lib/inventory/publicInventory";
import { buildRouteMetadata, getIndexingPolicy, getPublicOrigin } from "../../../lib/siteMetadata";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return buildRouteMetadata({ title: "Lubricants", description: "Browse lubricant products listed by HGR. Contact our team about availability and application.", path: "/lubricants", origin: getPublicOrigin(), robots: getIndexingPolicy() });
}

export default async function LubricantsPage() {
  const [{ items, unavailable }, contact] = await Promise.all([getPublicInventoryItems("lubricant"), getPublicContact()]);
  return <main className="page-shell">
    <TrackAnalyticsEvent event={createAnalyticsEvent({ name: "inventory_list_view" })} />
    <p className="eyebrow">HGR inventory</p><h1 className="page-title">Lubricants</h1>
    <p className="page-intro">Browse lubricant products listed by HGR. Contact our team to confirm availability and suitability for your application.</p>
    {unavailable ? <section className="empty-state" role="status"><h2>We couldn&apos;t load the lubricant list.</h2><p>Please try again, or contact HGR for help.</p><Link className="button button--quiet" href="/contact">Contact HGR</Link></section> : items.length === 0 ? <section className="empty-state"><h2>No lubricant products are listed right now.</h2><p>Contact HGR to ask about a product or application.</p><DirectLinks phone={contact.phone} whatsApp={contact.whatsApp} email={contact.email} /></section> : <><p>{items.length} {items.length === 1 ? "product" : "products"} listed</p><div className="machine-grid" id="lubricants-list">{items.map((item) => <InventoryCard key={item.referenceNumber} item={item} />)}</div></>}
  </main>;
}

function DirectLinks({ phone, whatsApp, email }: { phone?: string; whatsApp?: string; email?: string }) {
  return <div className="direct-contact" aria-label="Contact HGR">{phone && <a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>Call HGR</a>}{whatsApp && <a href={`https://wa.me/${whatsApp}`} target="_blank" rel="noreferrer">WhatsApp HGR</a>}{email && <a href={`mailto:${email}`}>Email HGR</a>}</div>;
}
