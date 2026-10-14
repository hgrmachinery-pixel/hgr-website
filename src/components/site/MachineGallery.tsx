"use client";

import type { InspectionImageGroup } from "../../lib/machines/inspection";
import { publicImageSrcSet } from "../../lib/machines/publicInventory";
import { InventoryGallery } from "./InventoryGallery";
import { MachineHeroGallery } from "./MachineHeroGallery";

export type FutureImageEnhancement = { src: string; srcSet?: string; disclosure: string };

/** A sequenced evidence gallery. Future image treatments can wrap each static image without changing its journey. */
export function MachineGallery({ groups, enhancements = {} }: { groups: InspectionImageGroup[]; enhancements?: Record<string, FutureImageEnhancement> }) {
  const allImages = groups.flatMap((group) => group.images.map((image) => ({ ...image, category: image.category ?? group.title })));
  if (allImages.length > 0) return <MachineHeroGallery images={allImages} />;
  if (groups.length === 0) return <section id="machine-photos" className="machine-gallery__empty" data-inspection-area aria-labelledby="machine-photos-title">
    <p className="eyebrow">Inspection photographs</p><h2 id="machine-photos-title">Photos for this machine</h2><p>Machine photos are not currently available.</p>
  </section>;

  // Keep the machine inspection navigation and evidence grouping; the shared gallery
  // component now owns the responsive image rendering used across inventory types.
  if (Object.keys(enhancements).length === 0) return <section id="machine-photos" data-inspection-area>
    <header className="machine-gallery__header"><div><p className="eyebrow">Inspection photographs</p><h2 id="machine-photos-title">Walk around the machine</h2><p>Move through the available views. Each photo is shown in the category recorded for it.</p></div><span>{groups.reduce((sum, group) => sum + group.images.length, 0)} photos</span></header>
    <nav className="machine-gallery__index" aria-label="Photo sections">{groups.map((group, index) => <a key={group.id} href={`#photo-${group.id}`}><span>0{index + 1}</span>{group.title}<span>({group.images.length})</span></a>)}</nav>
    {groups.map((group) => <section id={`photo-${group.id}`} className="inspection-photo-group" data-inspection-area key={group.id} aria-label={group.title}><h3>{group.title}</h3><InventoryGallery images={group.images.map((image) => ({ id: image.url, url: image.url, cardUrl: image.thumbnailUrl ?? image.url, thumbnailUrl: image.thumbnailUrl, largeUrl: image.url, srcSet: publicImageSrcSet(image), altText: image.altText ?? "", order: 0 }))} title={group.title} variant="machine" /></section>)}
  </section>;

  const total = groups.reduce((sum, group) => sum + group.images.length, 0);
  let photoNumber = 0;
  return <section id="machine-photos" className="machine-gallery" data-inspection-area aria-labelledby="machine-photos-title">
    <header className="machine-gallery__header"><div><p className="eyebrow">Inspection photographs</p><h2 id="machine-photos-title">Walk around the machine</h2><p>Move through the available views. Each photo is shown in the category recorded for it.</p></div><span>{total} {total === 1 ? "photo" : "photos"}</span></header>
    <nav className="machine-gallery__index" aria-label="Photo sections">{groups.map((group, index) => <a key={group.id} href={`#photo-${group.id}`}><span>0{index + 1}</span>{group.title}<span>({group.images.length})</span></a>)}</nav>
    <div className="inspection-photo-groups">{groups.map((group, groupIndex) => <section id={`photo-${group.id}`} className="inspection-photo-group" data-inspection-area key={group.id} aria-labelledby={`photo-title-${group.id}`}>
      <header><span className="inspection-photo-group__index">0{groupIndex + 1}</span><h3 id={`photo-title-${group.id}`}>{group.title}</h3><span>{group.images.length} {group.images.length === 1 ? "view" : "views"}</span></header>
      <div className="inspection-photo-grid">{group.images.map((image, index) => {
        photoNumber += 1;
        const current = image;
        const enhancement = enhancements[image.url];
        return <figure className="inspection-photo" key={`${group.id}-${image.url}-${index}`}>
          <div className="inspection-photo__frame" data-media-kind={enhancement ? "enhanced-preview" : "original"}>
            <picture>
              {enhancement && <source srcSet={enhancement.srcSet ?? enhancement.src} sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 40vw" />}
              <img src={image.thumbnailUrl ?? image.url} srcSet={publicImageSrcSet(current)} sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 40vw" alt={current.altText ?? ""} loading={photoNumber === 1 ? "eager" : "lazy"} fetchPriority={photoNumber === 1 ? "high" : "auto"} />
            </picture>
          </div>
          <figcaption><span>{enhancement?.disclosure ?? image.altText ?? `${group.title} photo`}</span><span>{String(photoNumber).padStart(2, "0")} / {String(total).padStart(2, "0")}</span></figcaption>
        </figure>;
      })}</div>
    </section>)}</div>
  </section>;
}
