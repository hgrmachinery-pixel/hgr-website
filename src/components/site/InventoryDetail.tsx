import Link from "next/link";
import type { PublicInventoryItem } from "../../lib/inventory/publicInventory";
import { InventoryEnquiry } from "./InventoryEnquiry";
import { TrackedContactLink } from "./TrackedContactLink";
import { getPublicOrigin } from "../../lib/siteMetadata";
import { InventoryGallery } from "./InventoryGallery";

const labels: Record<string, string> = { available: "Available", reserved: "Reserved", sold: "Sold", unavailable: "Unavailable", "enquiry-only": "Enquiry only" };

export function InventoryDetail({ item, phone, whatsApp, email }: { item: PublicInventoryItem; phone?: string; whatsApp?: string; email?: string }) {
  const path = `/${item.kind === "spare-part" ? "spare-parts" : "lubricants"}/${item.slug}`;
  const canonicalURL = new URL(path, getPublicOrigin() ?? "https://hgrmachinery.com").toString();
  const title = `${item.name} · ${item.referenceNumber}`;
  const image = item.featuredImage;
  const facts = item.kind === "spare-part"
    ? [["Brand / Maker", item.brand], ["Part category", item.category], ["Manufacturer part number", item.manufacturerPartNumber], ["Condition", item.condition], ["Compatible machine brand", item.compatibilityConfirmed ? item.compatibleMachineBrand : undefined], ["Compatible machine model", item.compatibilityConfirmed ? item.compatibleMachineModel : undefined]]
    : [["Brand", item.brand], ["Product code", item.productCode], ["Product type / application", item.productType], ["Grade / specification", item.grade], ["Pack size", item.packSize], ["Compatible machine brand", item.compatibilityConfirmed ? item.compatibleMachineBrand : undefined], ["Compatible machine model", item.compatibilityConfirmed ? item.compatibleMachineModel : undefined]];
  return <main className="page-shell inventory-detail">
    <nav aria-label="Breadcrumb"><ol className="breadcrumbs"><li><Link href="/">Home</Link></li><li><Link href={item.kind === "spare-part" ? "/spare-parts" : "/lubricants"}>{item.kind === "spare-part" ? "Spare Parts" : "Lubricants"}</Link></li><li aria-current="page">{item.name}</li></ol></nav>
    <header className="inspection-hero inventory-detail__hero">
      <div className="inspection-hero__media">
        {image ? <img src={image.largeUrl ?? image.cardUrl ?? image.url} srcSet={image.srcSet} sizes="(max-width: 900px) 100vw, 50vw" alt={image.altText ?? ""} fetchPriority="high" /> : <div className="inspection-hero__empty" role="img" aria-label="Product photo is not available">Product photo not available</div>}
      </div>
      <div className="inspection-hero__details">
        <p className="eyebrow">HGR {item.kind === "spare-part" ? "spare part" : "lubricant"} reference · {item.referenceNumber}</p>
        <p className={`machine-status machine-status--${item.availability === "enquiry-only" ? "unavailable" : item.availability}`}>{labels[item.availability] ?? "Availability to confirm"}</p>
        <h1>{title}</h1>
        {item.price && <p className="inspection-hero__price">{item.price.mode === "public" ? `RM ${item.price.amount.toLocaleString("en-MY")}` : "Contact for Price"}</p>}
        {item.shortDescription && <p className="inspection-hero__summary">{item.shortDescription}</p>}
        <div className="inspection-hero__actions"><a className="button button--primary" href="#inventory-enquiry">Ask HGR about this item <span aria-hidden="true">↗</span></a></div>
        <p className="inspection-hero__fineprint">Availability and suitability can be confirmed by HGR.</p>
      </div>
    </header>
    <InventoryGallery images={item.gallery.filter((photo) => photo.id !== item.featuredImage?.id)} />
    <section className="machine-overview inventory-detail__overview" aria-labelledby="inventory-overview-title"><p className="eyebrow">About this item</p><h2 id="inventory-overview-title">Details</h2>{item.description ? <p>{item.description}</p> : <p>No further description has been provided.</p>}</section>
    <section className="machine-passport inventory-detail__facts" aria-labelledby="inventory-facts-title"><header className="machine-passport__header"><div><p className="eyebrow">Recorded item details</p><h2 id="inventory-facts-title">Specifications</h2></div><span>HGR · PUBLISHED DETAILS</span></header><div className="machine-passport__groups"><section className="machine-passport__group"><dl>{facts.filter((row): row is [string, string] => typeof row[1] === "string" && row[1].trim().length > 0).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{label === "Condition" ? titleCase(value) : value}</dd></div>)}<div><dt>Availability</dt><dd>{labels[item.availability] ?? "Availability to confirm"}</dd></div><div><dt>HGR Reference</dt><dd>{item.referenceNumber}</dd></div></dl></section></div><p className="machine-passport__note">Details shown are the information HGR has listed. Contact HGR if you need clarification.</p></section>
    <section id="inventory-enquiry" className="arrange-inspection inventory-detail__enquiry" aria-labelledby="inventory-enquiry-title"><div className="arrange-inspection__intro"><p className="eyebrow">Next step · {item.referenceNumber}</p><h2 id="inventory-enquiry-title">Ask HGR about this {item.kind === "spare-part" ? "part" : "product"}</h2><p>Send an enquiry about this specific item. This does not reserve or purchase it.</p><div className="direct-contact" aria-label="Direct contact options">{phone && <TrackedContactLink className="button button--quiet" href={`tel:${phone.replace(/[^+\d]/g, "")}`} channel="phone">Call HGR</TrackedContactLink>}{whatsApp && <TrackedContactLink className="button button--quiet" href={`https://wa.me/${whatsApp}?text=${encodeURIComponent(`Hello HGR, I would like to ask about ${title}: ${canonicalURL}`)}`} channel="whatsapp" target="_blank" rel="noreferrer">WhatsApp HGR</TrackedContactLink>}{email && <TrackedContactLink className="button button--quiet" href={`mailto:${email}`} channel="email">Email HGR</TrackedContactLink>}</div></div><div className="machine-enquiry"><h3>Send an enquiry</h3><InventoryEnquiry kind="general" inventory={{ name: item.name, type: item.kind, referenceNumber: item.referenceNumber, canonicalURL: path }} /></div></section>
  </main>;
}

function titleCase(value: string) { return value.replace(/\b\w/g, (letter) => letter.toUpperCase()); }
