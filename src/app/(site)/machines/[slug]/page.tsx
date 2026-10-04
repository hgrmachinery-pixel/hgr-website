import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { MachineGallery } from "../../../../components/site/MachineGallery";
import { MachineVideo } from "../../../../components/site/MachineVideo";
import { MachineOverview } from "../../../../components/site/MachineOverview";
import { MachinePassport } from "../../../../components/site/MachinePassport";
import { MachineSupportingDocuments } from "../../../../components/site/MachineSupportingDocuments";
import { InspectionProgress } from "../../../../components/site/InspectionProgress";
import { RelatedMachines } from "../../../../components/site/RelatedMachines";
import { buildInspectionImageGroups, buildPassportGroups } from "../../../../lib/machines/inspection";
import { getPublicMachineForSlug, getPublicMachines } from "../../../../lib/machines/publicQueries";
import { publicImageSrcSet, publicMachinePath } from "../../../../lib/machines/publicInventory";
import { EnquiryForm } from "../../../../components/site/EnquiryForm";
import { getPublicContact } from "../../../../lib/siteContent";
import { buildMachineMetadata, buildMachineStructuredData, getIndexingPolicy, getPublicOrigin, serializeJsonLd } from "../../../../lib/siteMetadata";
import { TrackAnalyticsEvent } from "../../../../components/site/AnalyticsProvider";
import { TrackedContactLink } from "../../../../components/site/TrackedContactLink";
import { createAnalyticsEvent } from "../../../../lib/analytics/events.ts";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await getPublicMachineForSlug(slug);
  const machine = resolved.machine;
  if (!machine || resolved.unavailable) return { robots: getIndexingPolicy() };
  return { ...buildMachineMetadata(machine, getPublicOrigin()), robots: getIndexingPolicy() };
}

export default async function MachineDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resolved = await getPublicMachineForSlug(slug);
  if (resolved.unavailable) notFound();
  const machine = resolved.machine;
  if (!machine) notFound();
  if (machine.slug !== slug) permanentRedirect(publicMachinePath(machine.slug));
  const inventory = await getPublicMachines();
  const images = machine.images;
  const available = inventory.machines.filter((item) => item.stockStatus === "available" && item.hgrId !== machine.hgrId).slice(0, 3);
  const imageGroups = buildInspectionImageGroups(images);
  const passportGroups = buildPassportGroups(machine);
  const title = [machine.year, machine.brand, machine.model].filter(Boolean).join(" ") || `Excavator ${machine.reference}`;
  const contact = await getPublicContact();
  const origin = getPublicOrigin();
  const canonicalURL = origin ? new URL(publicMachinePath(machine.slug), origin).toString() : undefined;
  const inspectionAreas = [
    { id: "machine-overview", label: "Overview" },
    ...(imageGroups.length ? imageGroups.map((group) => ({ id: `photo-${group.id}`, label: group.title })) : [{ id: "machine-photos", label: "Photos" }]),
    { id: "machine-passport", label: "Machine passport" },
    { id: "machine-video", label: "Video walkthrough" },
    { id: "supporting-documents", label: "Documents" },
    { id: "arrange-inspection", label: "Contact HGR" },
    { id: "related-machines", label: "Related machines" },
  ];
  const isAvailable = machine.stockStatus === "available";
  const viewingMessage = canonicalURL ? `Hello HGR, I would like to arrange an inspection of ${title} (${machine.reference}): ${canonicalURL}` : undefined;

  return <main id="main-content" className="machine-inspection page-shell">
    <TrackAnalyticsEvent event={createAnalyticsEvent({ name: "machine_view", machineReference: machine.reference })} />
    {origin && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildMachineStructuredData(machine, origin)) }} />}
    <nav aria-label="Breadcrumb"><ol className="breadcrumbs"><li><Link href="/">Home</Link></li><li><Link href="/used-excavators">Used Excavators</Link></li><li aria-current="page">{title} ({machine.reference})</li></ol></nav>
    <header className="inspection-hero" aria-labelledby="machine-title">
      <div className="inspection-hero__media">
        {machine.featuredImage ? <img src={machine.featuredImage.largeUrl ?? machine.featuredImage.cardUrl ?? machine.featuredImage.url} srcSet={publicImageSrcSet(machine.featuredImage)} sizes="(max-width: 800px) 100vw, 60vw" alt={machine.featuredImage.altText ?? ""} fetchPriority="high" /> : <div className="inspection-hero__empty" role="img" aria-label="Featured machine photo is not available">Featured machine photo not available</div>}
        {machine.featuredImage?.category && <span className="inspection-hero__caption">{photoCategoryTitle(machine.featuredImage.category)}</span>}
      </div>
      <div className="inspection-hero__details">
        <p className="eyebrow">HGR machine reference · {machine.reference}</p>
        <p className={`machine-status machine-status--${machine.stockStatus}`}>{statusLabel(machine.stockStatus)}</p>
        <h1 id="machine-title">{title}</h1>
        {machine.price && <p className="inspection-hero__price">{machine.price.mode === "public" ? `RM ${machine.price.amount.toLocaleString("en-MY")}` : "Contact for Price"}</p>}
        <p className="inspection-hero__summary">Review the machine details and available photographs, then contact HGR to discuss this specific unit.</p>
        <div className="inspection-hero__actions">
          <a className="button button--primary" href="#arrange-inspection">{isAvailable ? "Arrange Inspection" : "Ask HGR about this machine"}<span aria-hidden="true">↗</span></a>
          {contact.whatsApp && viewingMessage && <TrackedContactLink className="button button--quiet" href={`https://wa.me/${contact.whatsApp}?text=${encodeURIComponent(viewingMessage)}`} channel="whatsapp" machineReference={machine.reference} target="_blank" rel="noreferrer">WhatsApp HGR</TrackedContactLink>}
        </div>
        <p className="inspection-hero__fineprint">Availability can change. Confirm current details with HGR.</p>
      </div>
    </header>
    <InspectionProgress areas={inspectionAreas} />
    <MachineOverview description={machine.description} />
    <MachineGallery groups={imageGroups} />
    <MachinePassport groups={passportGroups} />
    <MachineVideo src={machine.videoUrl} title={title} />
    <MachineSupportingDocuments />
    <section id="arrange-inspection" className="arrange-inspection" data-inspection-area aria-labelledby="arrange-inspection-title">
      <div className="arrange-inspection__intro"><p className="eyebrow">Next step · {machine.reference}</p><h2 id="arrange-inspection-title">{isAvailable ? "Arrange an inspection" : `Ask HGR about this ${statusLabel(machine.stockStatus).toLowerCase()} machine`}</h2><p>{isAvailable ? "Send an enquiry about this machine or contact HGR directly." : "This page records one specific machine. Contact HGR if you have a question or want to discuss other available excavators."}</p>
        <div className="direct-contact" aria-label="Direct contact options">
          {contact.phone && <TrackedContactLink className="button button--quiet" href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`} channel="phone" machineReference={machine.reference}>Call HGR</TrackedContactLink>}
          {contact.whatsApp && viewingMessage && <TrackedContactLink className="button button--quiet" href={`https://wa.me/${contact.whatsApp}?text=${encodeURIComponent(viewingMessage)}`} channel="whatsapp" machineReference={machine.reference} target="_blank" rel="noreferrer">WhatsApp about this machine</TrackedContactLink>}
        </div>
      </div>
      <div className="machine-enquiry"><h3>Send a machine enquiry</h3><EnquiryForm kind="machine" machineSlug={machine.slug} machineName={title} machineReference={machine.reference} /></div>
    </section>
    <RelatedMachines items={available.map((item) => ({ machine: item, image: item.featuredImage }))} />
  </main>;
}

function statusLabel(status: "available" | "reserved" | "sold") {
  return status[0].toUpperCase() + status.slice(1);
}

function photoCategoryTitle(category: string) {
  const labels: Record<string, string> = { "general-exterior": "General / Exterior", "side-view-1": "Side View 1", "side-view-2": "Side View 2", "front-view": "Front View", "rear-view": "Rear View", "cabin-interior": "Cabin / Interior", "hour-meter": "Hour Meter", "chassis-serial-number": "Chassis / Serial Number", engine: "Engine", "undercarriage-tracks": "Undercarriage / Tracks", "boom-arm-bucket": "Boom / Arm / Bucket", "other-details": "Other / Details" };
  return labels[category] ?? "Machine photograph";
}
