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
  return buildRouteMetadata({ title: "Spare Parts", description: "Browse HGR spare parts. Confirm availability and suitability with our team.", path: "/spare-parts", origin: getPublicOrigin(), robots: getIndexingPolicy() });
}

export default async function SparePartsPage() {
  const [{ items, unavailable }, contact] = await Promise.all([getPublicInventoryItems("spare-part"), getPublicContact()]);
  return <main className="page-shell">
    <TrackAnalyticsEvent event={createAnalyticsEvent({ name: "inventory_list_view" })} />
    <p className="eyebrow">HGR inventory</p><h1 className="page-title">Spare Parts</h1>
    <p className="page-intro">Browse spare parts listed by HGR. Availability and compatibility can be confirmed by our team.</p>
    {unavailable ? <section className="empty-state" role="status"><h2>We couldn&apos;t load the spare parts list.</h2><p>Please try again, or contact HGR for help.</p><Link className="button button--quiet" href="/contact">Contact HGR</Link></section> : items.length === 0 ? <section className="empty-state"><h2>No spare parts are listed right now.</h2><p>Contact HGR to ask about the part you need.</p><DirectLinks phone={contact.phone} whatsApp={contact.whatsApp} email={contact.email} /></section> : <><p>{items.length} {items.length === 1 ? "part" : "parts"} listed</p><div className="machine-grid" id="spare-parts-list">{items.map((item) => <InventoryCard key={item.referenceNumber} item={item} />)}</div></>}
  </main>;
}

function DirectLinks({ phone, whatsApp, email }: { phone?: string; whatsApp?: string; email?: string }) {
  return <div className="direct-contact" aria-label="Contact HGR">{phone && <a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>Call HGR</a>}{whatsApp && <a href={`https://wa.me/${whatsApp}`} target="_blank" rel="noreferrer">WhatsApp HGR</a>}{email && <a href={`mailto:${email}`}>Email HGR</a>}</div>;
}
