import Link from "next/link";
import { MachineCard } from "./MachineCard";
import type { PublicMachine } from "../../lib/machines/publicProjection";
import type { PublicImageCandidate } from "../../lib/machines/publicInventory";

export type RelatedMachine = { machine: PublicMachine; image?: PublicImageCandidate };

export function RelatedMachines({ items }: { items: RelatedMachine[] }) {
  if (!items.length) return <section id="related-machines" className="related-machines" data-inspection-area aria-labelledby="related-machines-title"><div className="inspection-section-heading"><div><p className="eyebrow">Keep exploring</p><h2 id="related-machines-title">Related machines</h2></div><Link href="/used-excavators">Browse all excavators</Link></div><p>No other available excavators are listed right now.</p></section>;
  return <section id="related-machines" className="related-machines" data-inspection-area aria-labelledby="related-machines-title">
    <div className="inspection-section-heading"><div><p className="eyebrow">Keep exploring</p><h2 id="related-machines-title">Other available excavators</h2></div><Link href="/used-excavators">Browse all excavators</Link></div>
    <div className="machine-grid">{items.map(({ machine, image }) => <MachineCard key={machine.hgrId} machine={machine} image={image} />)}</div>
  </section>;
}
