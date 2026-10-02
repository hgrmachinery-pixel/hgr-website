import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { MachineCard } from "../../../../components/site/MachineCard";
import { MachineGallery } from "../../../../components/site/MachineGallery";
import { MachineVideo } from "../../../../components/site/MachineVideo";
import { getPublicMachineForSlug, getPublicMachines } from "../../../../lib/machines/publicQueries";
import { publicMachinePath } from "../../../../lib/machines/publicInventory";
import { EnquiryForm } from "../../../../components/site/EnquiryForm";
import { getPublicContact } from "../../../../lib/siteContent";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: true } };

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
  const title = [machine.year, machine.brand, machine.model].filter(Boolean).join(" ") || `Excavator ${machine.reference}`;
  const contact = await getPublicContact();
  const origin = process.env.SERVER_URL;
  const canonicalURL = origin ? new URL(publicMachinePath(machine.slug), origin).toString() : undefined;
  const whatsappMessage = canonicalURL ? `Hello HGR, I am interested in ${title} (${machine.reference}): ${canonicalURL}` : undefined;
  const specifications = [
    ["Year of Manufacture", machine.year?.toString()],
    ["Hours", machine.hours?.toLocaleString("en-MY")],
    ["Engine", machine.engine],
    ["Operating weight", machine.operatingWeight],
    ["Condition", machine.condition?.replaceAll("-", " ")],
    ["Country of origin", machine.countryOfOrigin],
    ["Machine origin / registration status", machine.machineOriginStatus],
    ["Registration date", machine.registrationDate],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return <main className="page-shell">
    <div className="machine-detail__top"><Link href="/used-excavators">← All used excavators</Link><p className={`machine-status machine-status--${machine.stockStatus}`}>{statusLabel(machine.stockStatus)}</p><h1 className="page-title">{title}</h1><p className="machine-card__reference">Reference: {machine.reference}</p></div>
    <div className="machine-detail__layout">
      <MachineGallery images={images} />
      <section aria-label="Machine details">
        <p className="machine-card__price machine-detail__price">{machine.price?.mode === "public" ? `RM ${machine.price.amount.toLocaleString("en-MY")}` : machine.price?.mode === "contact" ? "Contact for Price" : ""}</p>
        {machine.stockStatus === "reserved" && <div className="empty-state"><h2>This machine is reserved</h2><p>You can browse other excavators currently marked Available.</p><Link href="/used-excavators?status=available">Browse available excavators</Link></div>}
        {machine.stockStatus === "sold" && <div className="empty-state"><h2>This machine is sold</h2><p>This page is kept as a record of this specific machine.</p><Link href="/used-excavators?status=available">Browse available excavators</Link></div>}
        {machine.description && <section><h2>Details</h2><p className="page-intro">{machine.description}</p></section>}
        {specifications.length > 0 && <section><h2>Specifications</h2><dl className="machine-detail__facts">{specifications.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>}
        <MachineVideo src={machine.videoUrl} title={title} />
        {machine.stockStatus === "available" && <Link className="button button--primary" href="/used-excavators">View all excavators</Link>}
        <section className="machine-enquiry" aria-labelledby="machine-enquiry-title">
          <h2 id="machine-enquiry-title">Enquire about this machine</h2>
          <div className="direct-contact" aria-label="Direct contact options">
            {contact.phone && <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>Call HGR</a>}
            {contact.whatsApp && whatsappMessage && <a href={`https://wa.me/${contact.whatsApp}?text=${encodeURIComponent(whatsappMessage)}`} target="_blank" rel="noreferrer">WhatsApp about this machine</a>}
          </div>
          <EnquiryForm kind="machine" machineSlug={machine.slug} />
          <p className="enquiry-form__hint">Please confirm this machine's current location with HGR before travelling.</p>
        </section>
      </section>
    </div>
    {available.length > 0 && <section><div className="section-heading"><h2>Available excavators</h2><Link href="/used-excavators?status=available">View all</Link></div><div className="machine-grid">{available.map((item) => <MachineCard key={item.hgrId} machine={item} image={item.featuredImage} />)}</div></section>}
    {available.length === 0 && <p className="section-heading"><Link href="/used-excavators">Return to all excavators</Link></p>}
  </main>;
}

function statusLabel(status: "available" | "reserved" | "sold") {
  return status[0].toUpperCase() + status.slice(1);
}
