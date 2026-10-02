import Link from "next/link";
import type { PublicMachine } from "../../lib/machines/publicProjection";
import type { PublicImageCandidate } from "../../lib/machines/publicInventory";
import { publicImageSrcSet, publicMachinePath } from "../../lib/machines/publicInventory";

const statusLabels = { available: "Available", reserved: "Reserved", sold: "Sold" } as const;

export function MachineCard({ machine, image }: { machine: PublicMachine; image?: PublicImageCandidate }) {
  const title = [machine.year, machine.brand, machine.model].filter(Boolean).join(" ") || `Excavator ${machine.reference}`;
  return (
    <article className="machine-card">
      <Link className="machine-card__link" href={publicMachinePath(machine.slug)}>
        <div className="machine-card__image" aria-label={image ? undefined : "Machine photo unavailable"}>
          {image ? <img src={image.cardUrl ?? image.url} srcSet={publicImageSrcSet(image)} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" alt={image.altText ?? ""} loading="lazy" /> : <span>Photo unavailable</span>}
        </div>
        <div className="machine-card__content">
          <p className={`machine-status machine-status--${machine.stockStatus}`}>{statusLabels[machine.stockStatus]}</p>
          <h2>{title}</h2>
          <p className="machine-card__reference">Reference: {machine.reference}</p>
          {machine.hours !== undefined && <p>{machine.hours.toLocaleString("en-MY")} hours</p>}
          <p className="machine-card__price">
            {machine.price?.mode === "public" ? `RM ${machine.price.amount.toLocaleString("en-MY")}` : machine.price?.mode === "contact" ? "Contact for Price" : ""}
          </p>
        </div>
      </Link>
    </article>
  );
}
