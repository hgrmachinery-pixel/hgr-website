import Link from "next/link";
import { notFound } from "next/navigation";
import { EnquiryForm } from "../../../components/site/EnquiryForm";
import { getPublishedPage, getPublicContact, lexicalPlainText } from "../../../lib/siteContent";

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

export default async function SupportingPage({ params }: { params: Promise<{ supportingPage: string }> }) {
  const { supportingPage } = await params;
  if (!Object.prototype.hasOwnProperty.call(pages, supportingPage)) notFound();
  const key = supportingPage as keyof typeof pages;
  const definition = pages[key];
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
      <DirectContact phone={contact.phone} whatsApp={contact.whatsApp} email={contact.email} location={contact.yardLocation} />
    </section>}
    {!definition.kind && !legal && <p className="supporting-page__cta"><Link className="button button--primary" href="/contact">Contact HGR</Link></p>}
  </main>;
}

function DirectContact({ phone, whatsApp, email, location }: { phone?: string; whatsApp?: string; email?: string; location?: string }) {
  if (!phone && !whatsApp && !email && !location) return null;
  return <div className="direct-contact" aria-label="Other contact options">
    {phone && <a href={`tel:${phone.replace(/[^+\d]/g, "")}`}>Call HGR</a>}
    {whatsApp && <a href={`https://wa.me/${whatsApp}`} target="_blank" rel="noreferrer">WhatsApp HGR</a>}
    {email && <a href={`mailto:${email}`}>{email}</a>}
    {location && <p>{location}</p>}
  </div>;
}
