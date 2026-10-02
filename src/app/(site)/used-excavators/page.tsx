import Link from "next/link";
import { InventoryFilters } from "../../../components/site/InventoryFilters";
import { MachineCard } from "../../../components/site/MachineCard";
import { filterPublicMachines, inventoryBrandOptions, normalizeInventoryFilters, paginateMachines } from "../../../lib/machines/publicInventory";
import { getPublicMachines } from "../../../lib/machines/publicQueries";
import { buildInventoryMetadata, getIndexingPolicy, getPublicOrigin } from "../../../lib/siteMetadata";
import { TrackAnalyticsEvent } from "../../../components/site/AnalyticsProvider";
import { createAnalyticsEvent } from "../../../lib/analytics/events.ts";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function queryValue(value: string | string[] | undefined): string | undefined { return Array.isArray(value) ? value[0] : value; }

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  return buildInventoryMetadata(params, getPublicOrigin(), getIndexingPolicy());
}

export default async function UsedExcavatorsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const inventory = await getPublicMachines();
  const filters = normalizeInventoryFilters({ q: queryValue(params.q), brand: queryValue(params.brand), status: queryValue(params.status), page: queryValue(params.page) });
  const filtered = filterPublicMachines(inventory.machines, filters);
  const page = paginateMachines(filtered, filters.page, 12);

  return <main className="page-shell">
    <TrackAnalyticsEvent event={createAnalyticsEvent({ name: "inventory_list_view" })} />
    <p className="eyebrow">HGR inventory</p>
    <h1 className="page-title">Used Excavators</h1>
    <p className="page-intro">Browse excavators by brand, model and current stock status. Machine information is shown as entered by HGR.</p>
    <InventoryFilters brands={inventoryBrandOptions(inventory.machines)} query={filters.query} brand={filters.brand} status={filters.status} />
    {inventory.unavailable ? <section className="empty-state" role="status"><h2>We couldn&apos;t load the excavator list. Please try again. If the problem continues, send HGR an enquiry.</h2><Link className="button button--quiet" href="/contact">Send an enquiry</Link></section> : inventory.machines.length === 0 ? <section className="empty-state"><h2>No excavators are listed right now.</h2><p>Check back soon, or send HGR an enquiry to ask about available stock.</p><Link className="button button--quiet" href="/contact">Send an enquiry</Link></section> : page.items.length === 0 ? <section className="empty-state"><h2>No matching excavators</h2><p>Try changing your search or clearing the filters.</p><Link className="button button--quiet" href="/used-excavators">Clear filters</Link></section> : <>
      <p aria-live="polite">{filtered.length} {filtered.length === 1 ? "machine" : "machines"} found</p>
      <div className="machine-grid" id="available">{page.items.map((machine) => <MachineCard key={machine.hgrId} machine={machine} image={machine.featuredImage} />)}</div>
      {page.totalPages > 1 && <nav className="pagination" aria-label="Inventory pages">
        {page.page > 1 && <Link href={listingURL({ ...params, page: String(page.page - 1) })} rel="prev">Previous</Link>}
        {Array.from({ length: page.totalPages }, (_, index) => index + 1).map((number) => number === page.page ? <span key={number} aria-current="page">{number}</span> : <Link key={number} href={listingURL({ ...params, page: String(number) })}>{number}</Link>)}
        {page.page < page.totalPages && <Link href={listingURL({ ...params, page: String(page.page + 1) })} rel="next">Next</Link>}
      </nav>}
    </>}
  </main>;
}

function listingURL(params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();
  for (const key of ["q", "brand", "status", "page"]) {
    const value = params[key];
    const normalized = Array.isArray(value) ? value[0] : value;
    if (normalized) query.set(key, normalized);
  }
  return `/used-excavators?${query.toString()}`;
}
