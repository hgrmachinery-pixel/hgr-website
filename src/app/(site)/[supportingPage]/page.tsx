import Link from "next/link";
import { notFound } from "next/navigation";
import { EnquiryForm } from "../../../components/site/EnquiryForm";
import { getPublishedPage, getPublicContact, lexicalPlainText } from "../../../lib/siteContent";
import type { Metadata } from "next";
import { buildSupportingPageMetadata, getIndexingPolicy, getPublicOrigin } from "../../../lib/siteMetadata";
import { TrackedContactLink } from "../../../components/site/TrackedContactLink";
import type { SupportingPageGroup } from "../../../lib/analytics/events.ts";

const pages = {
  rental: { title: "Rental enquiries", intro: "Tell us about your project. Availability and suitability are confirmed by HGR; this form does not make a booking.", kind: "rental" },
  "machinery-services": { title: "Machinery services", intro: "Send a request with the machine location and issue so HGR can review your enquiry.", kind: "service" },
  lubricants: { title: "Lubricants", intro: "Ask HGR about a lubricant product or application.", kind: "lubricant" },
  about: { title: "About HGR", intro: "HGR Equipment Resources is a Malaysian used heavy machinery business focused primarily on used excavators.", kind: null },
  contact: { title: "Contact HGR", intro: "Send a general enquiry. Add the machine you are interested in if your message is about a particular unit.", kind: "general" },
  "privacy-policy": { title: "Privacy Policy", intro: "", kind: null },
  "website-terms": { title: "Website Terms", intro: "", kind: null },
} as const;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ supportingPage: string }> }): Promise<Metadata> {
  const { supportingPage } = await params;
  if (!Object.prototype.hasOwnProperty.call(pages, supportingPage)) return { robots: { index: false, follow: true } };
  const key = supportingPage as keyof typeof pages;
  const definition = pages[key];
  const page = await getPublishedPage(key);
  const visibleText = lexicalPlainText(page?.body).join(" ");
  const metadata = buildSupportingPageMetadata({
    slug: key,
    title: typeof page?.title === "string" ? page.title : definition.title,
    visibleText,
    fallbackDescription: definition.intro,
    origin: getPublicOrigin(),
    robots: getIndexingPolicy(),
  });
  return metadata ?? { robots: { index: false, follow: true } };
}

export default async function SupportingPage({ params }: { params: Promise<{ supportingPage: string }> }) {
  const { supportingPage } = await params;
  if (!Object.prototype.hasOwnProperty.call(pages, supportingPage)) notFound();
  const key = supportingPage as keyof typeof pages;
  const definition = pages[key];
  const pageGroup: SupportingPageGroup | undefined = key === "contact" ? "contact"
    : key === "rental" ? "rental"
      : key === "machinery-services" ? "machinery-services"
        : key === "lubricants" ? "lubricants"
          : key === "about" ? "about" : undefined;
  const page = await getPublishedPage(key);
  const legal = key === "privacy-policy" || key === "website-terms";
  const body = lexicalPlainText(page?.body);
  if (legal && (!page || body.length === 0)) notFound();
  const contact = await getPublicContact();
  const title = typeof page?.title === "string" ? page.title : definition.title;
  return <main className="page-shell">
    <p className="eyebrow">HGR Equipment Resources</p>
    <h1 className="page-title">{title}</h1>
    {page ? <div className="supporting-page__copy">{body.map((line, index) => <p key={`${index}-${line.slice(0, 24)}`}>{line}</p>)}</div> : <p className="page-intro">{definition.intro}</p>}
    {!page && !legal && <div className="supporting-page__editable-note"><p>Page information can be updated by HGR in the website content manager.</p></div>}
    {definition.kind && <section className="supporting-page__form"><h2>{definition.kind === "general" ? "Send an enquiry" : "Tell us what you need"}</h2><EnquiryForm kind={definition.kind} />
      <DirectContact phone={contact.phone} whatsApp={contact.whatsApp} email={contact.email} location={contact.yardLocation} pageGroup={pageGroup} />
    </section>}
    {!definition.kind && !legal && <p className="supporting-page__cta"><Link className="button button--primary" href="/contact">Contact HGR</Link></p>}
  </main>;
}

function DirectContact({ phone, whatsApp, email, location, pageGroup }: { phone?: string; whatsApp?: string; email?: string; location?: string; pageGroup?: SupportingPageGroup }) {
  if (!phone && !whatsApp && !email && !location) return null;
  return <div className="direct-contact" aria-label="Other contact options">
    {phone && <TrackedContactLink href={`tel:${phone.replace(/[^+\d]/g, "")}`} channel="phone" pageGroup={pageGroup}>Call HGR</TrackedContactLink>}
    {whatsApp && <TrackedContactLink href={`https://wa.me/${whatsApp}`} channel="whatsapp" pageGroup={pageGroup} target="_blank" rel="noreferrer">WhatsApp HGR</TrackedContactLink>}
    {email && <TrackedContactLink href={`mailto:${email}`} channel="email" pageGroup={pageGroup}>{email}</TrackedContactLink>}
    {location && <p>{location}</p>}
  </div>;
}
