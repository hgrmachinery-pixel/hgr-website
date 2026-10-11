import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { InventoryEnquiry } from "../../../components/site/InventoryEnquiry";
import { getPublishedPage, getPublicContact, lexicalPlainText } from "../../../lib/siteContent";
import type { Metadata } from "next";
import { buildSupportingPageMetadata, getIndexingPolicy, getPublicOrigin, serializeJsonLd } from "../../../lib/siteMetadata";
import { TrackedContactLink } from "../../../components/site/TrackedContactLink";
import type { SupportingPageGroup } from "../../../lib/analytics/events.ts";
import { redirect } from "next/navigation";
import { safeGoogleMapsEmbedURL } from "../../../lib/siteContact";

const pages = {
  rental: { title: "Rental enquiries", intro: "Tell us about your project. Availability and suitability are confirmed by HGR; this form does not make a booking.", kind: "rental" },
  "repair-services": { title: "Repair & Services", intro: "Send a request with the machine location and issue so HGR can review your repair and service enquiry.", kind: "service" },
  "spare-parts": { title: "Spare Parts", intro: "Contact HGR to ask about parts for your machinery.", kind: null },
  lubricants: { title: "Lubricants", intro: "Ask HGR about a lubricant product or application.", kind: "lubricant" },
  about: { title: "About HGR", intro: "HGR Equipment Resources is a Malaysian used heavy machinery business focused primarily on used excavators.", kind: null },
  contact: { title: "Contact HGR", intro: "Send a general enquiry. Add the machine you are interested in if your message is about a particular unit.", kind: "general" },
  "privacy-policy": { title: "Privacy Policy", intro: "", kind: null },
  "website-terms": { title: "Website Terms", intro: "", kind: null },
} as const;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ supportingPage: string }> }): Promise<Metadata> {
  const { supportingPage } = await params;
  if (supportingPage === "machinery-services") return { robots: { index: false, follow: true } };
  if (!Object.prototype.hasOwnProperty.call(pages, supportingPage)) return { robots: { index: false, follow: true } };
  const key = supportingPage as keyof typeof pages;
  const definition = pages[key];
  const contentSlug = key === "repair-services" ? "machinery-services" : key;
  const page = await getPublishedPage(contentSlug);
  const visibleText = lexicalPlainText(page?.body).join(" ");
  const metadata = buildSupportingPageMetadata({
    slug: key,
    title: key === "repair-services" ? definition.title : typeof page?.seoTitle === "string" && page.seoTitle.trim() ? page.seoTitle : typeof page?.title === "string" ? page.title : definition.title,
    visibleText: key === "repair-services" ? "" : visibleText,
    fallbackDescription: definition.intro,
    origin: getPublicOrigin(),
    robots: getIndexingPolicy(),
  });
  return metadata ?? { robots: { index: false, follow: true } };
}

export default async function SupportingPage({ params }: { params: Promise<{ supportingPage: string }> }) {
  const { supportingPage } = await params;
  if (supportingPage === "machinery-services") permanentRedirect("/repair-services");
  if (supportingPage === "spare-parts" || supportingPage === "lubricants") redirect(`/${supportingPage}`);
  if (!Object.prototype.hasOwnProperty.call(pages, supportingPage)) notFound();
  const key = supportingPage as keyof typeof pages;
  const definition = pages[key];
  const pageGroup: SupportingPageGroup | undefined = key === "contact" ? "contact"
    : key === "rental" ? "rental"
      : key === "repair-services" ? "machinery-services"
        : key === "lubricants" ? "lubricants"
          : key === "about" ? "about" : undefined;
  const contentSlug = key === "repair-services" ? "machinery-services" : key;
  const page = await getPublishedPage(contentSlug);
  const legal = key === "privacy-policy" || key === "website-terms";
  const body = lexicalPlainText(page?.body);
  if (legal && (!page || body.length === 0)) notFound();
  const contact = await getPublicContact();
  const title = key === "repair-services" ? definition.title : typeof page?.title === "string" ? page.title : definition.title;
  const origin = getPublicOrigin();
  const breadcrumbData = origin ? { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: new URL("/", origin).toString() },
    { "@type": "ListItem", position: 2, name: definition.title, item: new URL(`/${key}`, origin).toString() },
  ] } : undefined;
  return <main className="page-shell">
    <nav aria-label="Breadcrumb"><ol className="breadcrumbs"><li><Link href="/">Home</Link></li><li aria-current="page">{definition.title}</li></ol></nav>
    {breadcrumbData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbData) }} />}
    <p className="eyebrow">HGR Equipment Resources</p>
    <h1 className="page-title">{title}</h1>
    {key === "spare-parts" ? <SparePartsContent copy={body} /> : page ? <div className="supporting-page__copy">{body.map((line, index) => <p key={`${index}-${line.slice(0, 24)}`}>{line}</p>)}</div> : <p className="page-intro">{definition.intro}</p>}
    {!page && !legal && <div className="supporting-page__editable-note"><p>Page information can be updated by HGR in the website content manager.</p></div>}
    {key === "contact" && <OrganizationStructuredData contact={contact} origin={origin} />}
    {key === "contact" && <ContactLocation contact={contact} />}
    {definition.kind && <section className="supporting-page__form"><h2>{definition.kind === "general" ? "Send an enquiry" : "Tell us what you need"}</h2><InventoryEnquiry kind={definition.kind} inventory={key === "lubricants" ? { name: title, type: "lubricant" } : undefined} />
      <DirectContact phone={contact.phone} whatsApp={contact.whatsApp} email={contact.email} supportEmail={contact.supportEmail} location={contact.yardAddress} directionsURL={contact.directionsURL} pageGroup={pageGroup} />
    </section>}
    {!definition.kind && !legal && <p className="supporting-page__cta"><Link className="button button--primary" href="/contact">Contact HGR</Link></p>}
  </main>;
}

function SparePartsContent({ copy }: { copy: string[] }) {
  const sections = ["Introduction", "Spare Parts Categories", "Brands Supported"];
  return <div className="supporting-page__copy">
    <p className="page-intro">Contact HGR to ask about spare parts for your machinery. Availability and suitability can be confirmed by our team.</p>
    {sections.map((title, index) => <section key={title} aria-labelledby={`spare-parts-section-${index}`}>
      <h2 id={`spare-parts-section-${index}`}>{title}</h2>
      <p>{copy[index] ?? "Information will be added here."}</p>
    </section>)}
    <section aria-labelledby="spare-parts-contact"><h2 id="spare-parts-contact">Contact / WhatsApp</h2><p>Ask HGR about the part you need.</p><InventoryEnquiry kind="general" inventory={{ name: "Spare Parts enquiry", type: "spare-part" }} /></section>
  </div>;
}

function DirectContact({ phone, whatsApp, email, supportEmail, location, directionsURL, pageGroup }: { phone?: string; whatsApp?: string; email?: string; supportEmail?: string; location?: string; directionsURL?: string; pageGroup?: SupportingPageGroup }) {
  if (!phone && !whatsApp && !email && !supportEmail && !location && !directionsURL) return null;
  return <div className="direct-contact" aria-label="Other contact options">
    {phone && <TrackedContactLink href={`tel:${phone.replace(/[^+\d]/g, "")}`} channel="phone" pageGroup={pageGroup}>Call HGR</TrackedContactLink>}
    {whatsApp && <TrackedContactLink href={`https://wa.me/${whatsApp}`} channel="whatsapp" pageGroup={pageGroup} target="_blank" rel="noreferrer">WhatsApp HGR</TrackedContactLink>}
    {email && <TrackedContactLink href={`mailto:${email}`} channel="email" pageGroup={pageGroup}>{email}</TrackedContactLink>}
    {supportEmail && supportEmail !== email && <TrackedContactLink href={`mailto:${supportEmail}`} channel="email" pageGroup={pageGroup}>Support: {supportEmail}</TrackedContactLink>}
    {location && <p>{location}</p>}
    {directionsURL && <a className="button button--quiet" href={directionsURL} target="_blank" rel="noreferrer">Google Maps directions</a>}
  </div>;
}

function ContactLocation({ contact }: { contact: Awaited<ReturnType<typeof getPublicContact>> }) {
  const embedURL = safeGoogleMapsEmbedURL(contact.googleMapsEmbedURL);
  if (!contact.officeAddress && !contact.yardAddress && !embedURL && !contact.appointmentOnly && contact.weeklyHours.length === 0 && !contact.socials.length) return null;
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const hours = [...contact.weeklyHours].sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day));
  return <section className="contact-details" aria-label="Business contact details">
    <div>
      {contact.officeAddress && <p><strong>Office</strong><br />{contact.officeAddress}</p>}
      {contact.yardAddress && <p><strong>Yard</strong><br />{contact.yardAddress}</p>}
      {contact.appointmentOnly && <p>Visits are by appointment.</p>}
      {hours.length > 0 && <div><h2>Operating hours</h2><dl className="contact-details__hours">{hours.map(({ day, opens, closes }) => <div key={day}><dt>{day[0].toUpperCase() + day.slice(1)}</dt><dd>{opens}–{closes}</dd></div>)}</dl></div>}
      {contact.directionsURL && <a className="button button--quiet" href={contact.directionsURL} target="_blank" rel="noreferrer">Get directions</a>}
      {contact.socials.length > 0 && <nav aria-label="Social media">{contact.socials.map(({ label, url }) => <a key={label} href={url} target="_blank" rel="noreferrer">{label}</a>)}</nav>}
    </div>
    {embedURL && <iframe className="contact-details__map" src={embedURL} title="HGR location on Google Maps" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />}
  </section>;
}

function OrganizationStructuredData({ contact, origin }: { contact: Awaited<ReturnType<typeof getPublicContact>>; origin?: string }) {
  if (!origin) return null;
  const schema: Record<string, unknown> = { "@context": "https://schema.org", "@type": "Organization", url: new URL("/", origin).toString() };
  if (contact.companyName) schema.name = contact.companyName;
  if (contact.registrationNumber) schema.identifier = { "@type": "PropertyValue", propertyID: "Business registration number", value: contact.registrationNumber };
  if (contact.salesEmail) schema.email = contact.salesEmail;
  if (contact.phone) schema.telephone = contact.phone;
  if (contact.socials.length) schema.sameAs = contact.socials.map(({ url }) => url);
  const addresses = [contact.officeAddress, contact.yardAddress].filter(Boolean);
  if (addresses.length) schema.address = addresses.map((streetAddress) => ({ "@type": "PostalAddress", streetAddress, addressCountry: "MY" }));
  if (contact.weeklyHours.length) schema.openingHoursSpecification = contact.weeklyHours.map(({ day, opens, closes }) => ({
    "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${day[0].toUpperCase() + day.slice(1)}`, opens, closes,
  }));
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }} />;
}
