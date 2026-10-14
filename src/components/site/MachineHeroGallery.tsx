"use client";

import { useState } from "react";
import type { PublicImageCandidate } from "../../lib/machines/publicInventory";

export function MachineHeroGallery({ images }: { images: PublicImageCandidate[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const active = images[activeIndex];

  return <section id="machine-photos" className="machine-gallery machine-gallery--hero" data-inspection-area aria-labelledby="machine-photos-title">
    <div className="machine-gallery__hero-grid">
      <button className={`machine-gallery__active${zoomed ? " machine-gallery__active--zoomed" : ""}`} type="button" onClick={() => setZoomed(!zoomed)} aria-label={zoomed ? "Reduce machine photo" : "Zoom machine photo"}>
        <img src={active.largeUrl ?? active.cardUrl ?? active.url} srcSet={undefined} alt={active.altText ?? ""} fetchPriority="high" />
        <span className="machine-gallery__zoom-label">{zoomed ? "Reduce" : "View larger"}</span>
      </button>
      <div className="machine-gallery__thumbs" role="group" aria-label="Choose a machine photo">
        {images.map((image, index) => <button key={`${image.url}-${index}`} type="button" onClick={() => { setActiveIndex(index); setZoomed(false); }} aria-label={`Show photo ${index + 1}${image.category ? `, ${image.category}` : ""}`} aria-pressed={index === activeIndex}>
          <img src={image.thumbnailUrl ?? image.url} alt="" loading="lazy" />
        </button>)}
      </div>
    </div>
    <div className="machine-gallery__hero-caption"><div><p className="eyebrow">Machine photographs</p><h2 id="machine-photos-title">{active.category ?? "Exterior"}</h2></div><span>{activeIndex + 1} / {images.length}</span></div>
    <nav className="machine-gallery__index" aria-label="Photo categories">{[...new Set(images.map((image) => image.category ?? "Other photos"))].map((category) => <button key={category} type="button" onClick={() => { const first = images.findIndex((image) => (image.category ?? "Other photos") === category); setActiveIndex(first); setZoomed(false); }}>{category}</button>)}</nav>
  </section>;
}
