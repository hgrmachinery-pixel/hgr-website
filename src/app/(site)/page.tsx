import Link from "next/link";
import { LivingMachine } from "../../components/site/LivingMachine";
import { MachineCard } from "../../components/site/MachineCard";
import { MotionRegion } from "../../components/site/MotionRegion";
import { TrackedContactLink } from "../../components/site/TrackedContactLink";
import { getAvailableHomepageMachines } from "../../lib/machines/publicInventory";
import { getPublicMachines } from "../../lib/machines/publicQueries";
import { getPublishedPage, getPublicContact, lexicalPlainText } from "../../lib/siteContent";
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

const supportingAreas = [
  { slug: "rental", title: "Rental", eyebrow: "When the right opportunity comes up", href: "/rental", group: "rental" as const },
  { slug: "machinery-services", title: "Machinery Services", eyebrow: "Talk with HGR about your machine", href: "/machinery-services", group: "machinery-services" as const },
  { slug: "lubricants", title: "Lubricants", eyebrow: "Enquiries and product information", href: "/lubricants", group: "lubricants" as const },
];

export default async function HomePage() {
  const [inventory, contact, aboutPage, areaPages] = await Promise.all([
    getPublicMachines(),
    getPublicContact(),
    getPublishedPage("about"),
    Promise.all(supportingAreas.map((area) => getPublishedPage(area.slug))),
  ]);
  const available = getAvailableHomepageMachines(inventory.machines);
  const aboutCopy = lexicalPlainText(aboutPage?.body).slice(0, 2);
  const contactHref = contact.whatsApp ? `https://wa.me/${contact.whatsApp}`
    : contact.phone ? `tel:${contact.phone.replace(/[^+\d]/g, "")}` : "/contact";

  return <main id="main-content" className="home-page">
    <section className="home-hero" aria-labelledby="home-title">
      <div className="home-hero__copy">
        <p className="eyebrow"><span className="eyebrow__line" aria-hidden="true" />Used excavators · HGR Equipment Resources</p>
        <h1 id="home-title">Find the machine<br /><span>for your next job.</span></h1>
        <p className="home-hero__intro">Explore real used excavators from HGR. Review the details available, then speak with our team about the machine that fits your work.</p>
        <div className="home-hero__actions">
          <Link className="button button--primary" href="/used-excavators#available">Explore available excavators <span aria-hidden="true">↗</span></Link>
          <Link className="home-hero__secondary" href="/contact">Talk to HGR <span aria-hidden="true">→</span></Link>
        </div>
        <div className="home-hero__note"><span className="home-hero__note-mark" aria-hidden="true">H</span><span>Every listing is a specific machine.<br />Ask us for the details you need.</span></div>
      </div>
      <MotionRegion className="home-hero__visual-wrap">
        <div className="home-hero__visual-label"><span>THE HGR YARD</span><span>01 / MACHINES</span></div>
        <LivingMachine />
        <div className="home-hero__visual-foot"><span>Real machines. Direct conversations.</span><span aria-hidden="true">↘</span></div>
      </MotionRegion>
      <a className="home-hero__scroll" href="#available"><span aria-hidden="true">↓</span>Scroll to explore</a>
    </section>

    <section className="home-inventory section-shell" id="available" aria-labelledby="available-title">
      <div className="home-section-heading">
        <div><p className="eyebrow">The current selection</p><h2 id="available-title">Available excavators</h2><p>See what’s ready to discuss. Each listing is one individual machine.</p></div>
        <Link className="text-link" href="/used-excavators">View all excavators <span aria-hidden="true">↗</span></Link>
      </div>
      {inventory.unavailable ? <section className="empty-state" role="status"><h3>We couldn’t load the excavator list. Please try again.</h3><p>If the problem continues, contact HGR directly.</p><Link className="button button--quiet" href="/contact">Send an enquiry</Link></section> : available.length > 0 ? <div className="machine-grid home-machine-grid">{available.map((machine) => <MachineCard key={machine.hgrId} machine={machine} image={machine.featuredImage} />)}</div> : <section className="empty-state"><h3>No excavators are listed right now.</h3><p>Check back soon, or contact HGR to ask about current stock.</p><Link className="button button--quiet" href="/contact">Contact HGR</Link></section>}
      {available.length > 0 && <div className="home-inventory__bottom"><span>Availability can change. Contact HGR to confirm current details.</span><Link href="/used-excavators">Browse the full inventory <span aria-hidden="true">→</span></Link></div>}
    </section>

    <section className="home-contact-band" aria-labelledby="viewing-title">
      <div className="home-contact-band__mark" aria-hidden="true">HGR<span> / YARD</span></div>
      <div><p className="eyebrow">Want to take a closer look?</p><h2 id="viewing-title">Let’s talk about the right machine.</h2><p>Ask a question or arrange a machine viewing with HGR.</p></div>
      {contact.whatsApp || contact.phone ? <TrackedContactLink className="button button--light" href={contactHref} channel={contact.whatsApp ? "whatsapp" : "phone"} pageGroup="contact" target={contact.whatsApp ? "_blank" : undefined} rel={contact.whatsApp ? "noreferrer" : undefined}>Contact HGR <span aria-hidden="true">↗</span></TrackedContactLink> : <Link className="button button--light" href="/contact">Contact HGR <span aria-hidden="true">↗</span></Link>}
    </section>

    <section className="home-support section-shell" aria-labelledby="support-title">
      <div className="home-section-heading">
        <div><p className="eyebrow">Beyond the inventory</p><h2 id="support-title">Other ways HGR can help</h2><p>Explore HGR’s supporting business areas and send an enquiry.</p></div>
      </div>
      <div className="support-grid">{supportingAreas.map((area, index) => {
        const page = areaPages[index];
        const copy = lexicalPlainText(page?.body)[0];
        return <article className="support-card" key={area.slug}>
          <span className="support-card__number">0{index + 1}</span><p className="eyebrow">{area.eyebrow}</p><h3>{typeof page?.title === "string" ? page.title : area.title}</h3>
          <p>{copy ?? "Contact HGR to discuss your enquiry."}</p><Link className="text-link" href={area.href}>Learn more <span aria-hidden="true">↗</span></Link>
        </article>;
      })}</div>
    </section>

    <section className="home-about" aria-labelledby="about-title">
      <div className="home-about__inner"><div><p className="eyebrow">About HGR</p><h2 id="about-title">A straightforward way to explore real machinery.</h2></div><div className="home-about__copy">{aboutCopy.length ? aboutCopy.map((line, index) => <p key={`${index}-${line.slice(0, 24)}`}>{line}</p>) : <p>HGR Equipment Resources is a Malaysian used heavy machinery business focused primarily on used excavators.</p>}<Link className="text-link" href="/about">More about HGR <span aria-hidden="true">↗</span></Link></div></div>
    </section>

    <section className="home-last-cta" aria-labelledby="last-cta-title"><p className="eyebrow">Your next step</p><h2 id="last-cta-title">Have a machine in mind?</h2><p>Browse the current excavators, or tell HGR what you’re looking for.</p><div className="home-hero__actions"><Link className="button button--primary" href="/used-excavators">Browse excavators <span aria-hidden="true">↗</span></Link><Link className="button button--quiet" href="/contact">Send an enquiry</Link></div></section>
  </main>;
}
