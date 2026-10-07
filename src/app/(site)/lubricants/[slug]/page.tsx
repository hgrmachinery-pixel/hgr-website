import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { InventoryDetail } from "../../../../components/site/InventoryDetail";
import { getPublicInventoryItem } from "../../../../lib/inventory/publicInventory";
import { getPublicContact } from "../../../../lib/siteContent";
import { buildRouteMetadata, getIndexingPolicy, getPublicOrigin } from "../../../../lib/siteMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { item } = await getPublicInventoryItem("lubricant", slug);
  if (!item) return { robots: getIndexingPolicy() };
  return buildRouteMetadata({ title: item.seoTitle || `${item.name} · ${item.referenceNumber}`, description: item.seoDescription || item.shortDescription || item.description || `${item.name} (${item.referenceNumber}). Ask HGR about product availability and application.`, path: `/lubricants/${item.slug}`, origin: getPublicOrigin(), robots: getIndexingPolicy() });
}

export default async function LubricantDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ item, unavailable }, contact] = await Promise.all([getPublicInventoryItem("lubricant", slug), getPublicContact()]);
  if (unavailable || !item) notFound();
  if (item.slug !== slug) permanentRedirect(`/lubricants/${item.slug}`);
  return <InventoryDetail item={item} phone={contact.phone} whatsApp={contact.whatsApp} email={contact.email} />;
}
