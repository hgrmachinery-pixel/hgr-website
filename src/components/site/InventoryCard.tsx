import Link from "next/link";
import type { PublicInventoryItem } from "../../lib/inventory/publicInventory";

const labels: Record<string, string> = { available: "Available", reserved: "Reserved", sold: "Sold", unavailable: "Unavailable", "enquiry-only": "Enquiry only" };

export function InventoryCard({ item }: { item: PublicInventoryItem }) {
  const href = `/${item.kind === "spare-part" ? "spare-parts" : "lubricants"}/${item.slug}`;
  const image = item.featuredImage;
  return <article className="machine-card inventory-card">
    <Link className="machine-card__link" href={href}>
      <div className="machine-card__image" aria-label={image ? undefined : "Product photo unavailable"}>
        {image ? <img src={image.cardUrl ?? image.url} srcSet={image.srcSet} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" alt={image.altText ?? ""} loading="lazy" /> : <span>Photo unavailable</span>}
      </div>
      <div className="machine-card__content">
        <p className={`machine-status machine-status--${item.availability === "enquiry-only" ? "unavailable" : item.availability}`}>{labels[item.availability] ?? "Availability to confirm"}</p>
        <h2>{item.name}</h2>
        <p className="machine-card__reference">{item.brand ? `${item.brand} · ` : ""}Reference: {item.referenceNumber}</p>
        {item.shortDescription && <p>{item.shortDescription}</p>}
        <p className="machine-card__price">{item.price?.mode === "public" ? `RM ${item.price.amount.toLocaleString("en-MY")}` : "Contact for Price"}</p>
      </div>
    </Link>
  </article>;
}
