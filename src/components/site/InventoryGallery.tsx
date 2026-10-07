"use client";

import type { PublicInventoryImage } from "../../lib/inventory/publicInventory";

export function InventoryGallery({ images, title = "Product photos", variant = "inventory" }: { images: PublicInventoryImage[]; title?: string; variant?: "inventory" | "machine" }) {
  if (!images.length) return <section className="machine-gallery__empty" aria-label={title}><p className="eyebrow">{title}</p><p>Approved photos are not currently available.</p></section>;
  if (variant === "machine") return <div className="inspection-photo-grid">{images.map((image, index) => <figure className="inspection-photo" key={image.id}>
    <div className="inspection-photo__frame"><img src={image.thumbnailUrl ?? image.url} srcSet={image.srcSet} sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 40vw" alt={image.altText ?? ""} loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} /></div>
    <figcaption><span>{image.altText ?? `${title} photo`}</span></figcaption>
  </figure>)}</div>;
  return <section className="inventory-detail__gallery" aria-label={title}>
    {images.map((image, index) => <figure key={image.id}>
      <img src={image.largeUrl ?? image.cardUrl ?? image.url} srcSet={image.srcSet} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" alt={image.altText ?? ""} loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "auto"} />
    </figure>)}
  </section>;
}
