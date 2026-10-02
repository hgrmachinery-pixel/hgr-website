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
    <section className="home-hero" aria-labelledby="home-title">
      <p className="eyebrow">HGR equipment resources</p>
      <h1 className="page-title" id="home-title">Used Excavators</h1>
      <p className="page-intro">Browse HGR’s used excavator inventory and inspect the details available for each machine.</p>
      <div className="home-hero__actions">
        <Link className="button button--primary" href="/used-excavators#available">View Available Excavators</Link>
        <Link className="button button--quiet" href="/contact">Send an enquiry</Link>
      </div>
    </section>
    <section aria-labelledby="available-title">
      <div className="section-heading"><h2 id="available-title">Available Excavators</h2><Link href="/used-excavators#available">View all excavators</Link></div>
      {inventory.unavailable ? <section className="empty-state" role="status"><h3>We couldn&apos;t load the excavator list. Please try again. If the problem continues, send HGR an enquiry.</h3><Link className="button button--quiet" href="/contact">Send an enquiry</Link></section> : available.length > 0 ? <div className="machine-grid">{available.map((machine) => <MachineCard key={machine.hgrId} machine={machine} image={machine.featuredImage} />)}</div> : <section className="empty-state"><h3>No excavators are listed right now.</h3><p>Check back soon, or send HGR an enquiry to ask about available stock.</p><Link className="button button--quiet" href="/contact">Send an enquiry</Link></section>}
    </section>
  </main>;
}
