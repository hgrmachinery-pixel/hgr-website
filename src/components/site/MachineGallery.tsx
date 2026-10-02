"use client";

import { useMemo, useState } from "react";
import type { PublicImageCandidate } from "../../lib/machines/publicInventory";
import { MACHINE_PHOTO_CATEGORY_LABELS } from "../../lib/machines/media.ts";

export function MachineGallery({ images }: { images: PublicImageCandidate[] }) {
  const categories = useMemo(() => [...new Set(images.map((image) => image.category).filter((value): value is string => Boolean(value)))], [images]);
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState(0);
  const visible = category === "all" ? images : images.filter((image) => image.category === category);
  if (visible.length === 0) return <div className="machine-gallery__empty" role="img" aria-label="Machine photos are not currently available">Machine photos are not currently available.</div>;

  const current = visible[Math.min(selected, visible.length - 1)];
  const move = (delta: number) => setSelected((index) => (index + delta + visible.length) % visible.length);
  return (
    <section className="machine-gallery" aria-label="Machine photo gallery" onKeyDown={(event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
    }}>
      <div className="machine-gallery__filters" aria-label="Photo categories">
        <button type="button" aria-pressed={category === "all"} onClick={() => { setCategory("all"); setSelected(0); }}>All photos</button>
        {categories.map((item) => <button type="button" key={item} aria-pressed={category === item} onClick={() => { setCategory(item); setSelected(0); }}>{MACHINE_PHOTO_CATEGORY_LABELS[item as keyof typeof MACHINE_PHOTO_CATEGORY_LABELS] ?? "Other details"}</button>)}
      </div>
      <div className="machine-gallery__featured">
        <button type="button" aria-label="Previous photo" onClick={() => move(-1)}>‹</button>
        <img src={current.url} alt={current.altText ?? "Machine photo"} />
        <button type="button" aria-label="Next photo" onClick={() => move(1)}>›</button>
      </div>
      <p aria-live="polite">Photo {selected + 1} of {visible.length}{current.category ? ` · ${MACHINE_PHOTO_CATEGORY_LABELS[current.category as keyof typeof MACHINE_PHOTO_CATEGORY_LABELS] ?? "Other details"}` : ""}</p>
      <div className="machine-gallery__thumbs" aria-label="Choose a photo">
        {visible.map((image, index) => <button type="button" key={`${image.url}-${index}`} aria-label={`Show photo ${index + 1}${image.altText ? `: ${image.altText}` : ""}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><img src={image.url} alt="" loading="lazy" /></button>)}
      </div>
    </section>
  );
}
