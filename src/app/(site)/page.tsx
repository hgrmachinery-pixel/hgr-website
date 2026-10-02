import Link from "next/link";
import { MachineCard } from "../../components/site/MachineCard";
import { getAvailableHomepageMachines } from "../../lib/machines/publicInventory";
import { getPublicMachines } from "../../lib/machines/publicQueries";
import { buildRouteMetadata, getIndexingPolicy, getPublicOrigin } from "../../lib/siteMetadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return buildRouteMetadata({
    title: "Used Excavators",
    description: "Browse HGR’s used excavator inventory and inspect the details available for each machine.",
    path: "/",
    origin: getPublicOrigin(),
    robots: getIndexingPolicy(),
  });
}

export default async function HomePage() {
  const inventory = await getPublicMachines();
  const available = getAvailableHomepageMachines(inventory.machines);
  return <main className="page-shell">
    <p className="eyebrow">HGR equipment resources</p>
    <h1 className="page-title">Used Excavators</h1>
    <p className="page-intro">Browse HGR’s used excavator inventory and inspect the details available for each machine.</p>
    <div className="section-heading"><h2>Available Excavators</h2><Link href="/used-excavators">View all excavators</Link></div>
    {inventory.unavailable ? <section className="empty-state" role="status"><h2>Inventory is temporarily unavailable</h2><p>Please try again later.</p></section> : available.length > 0 ? <div className="machine-grid">{available.map((machine) => <MachineCard key={machine.hgrId} machine={machine} image={machine.featuredImage} />)}</div> : <section className="empty-state"><h2>No excavators are currently listed as available</h2><p>Check the full inventory for Reserved or Sold machines.</p><Link className="button button--primary" href="/used-excavators">Browse all excavators</Link></section>}
  </main>;
}
