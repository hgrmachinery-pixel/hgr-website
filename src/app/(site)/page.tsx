import Link from "next/link";
import { MachineCard } from "../../components/site/MachineCard";
import { TrackedContactLink } from "../../components/site/TrackedContactLink";
import { getAvailableHomepageMachines, publicImageSrcSet } from "../../lib/machines/publicInventory";
import { getPublicMachines } from "../../lib/machines/publicQueries";
import { getPublishedPage, getPublicContact, lexicalPlainText } from "../../lib/siteContent";
import { buildRouteMetadata, getIndexingPolicy, getPublicOrigin } from "../../lib/siteMetadata";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return buildRouteMetadata({
    title: "Used Machines",
    description: "Browse HGR’s used excavator inventory in Malaysia and enquire about used machines, repair services, spare parts, lubricants and rental equipment.",
    path: "/",
    origin: getPublicOrigin(),
    robots: getIndexingPolicy(),
  });
}

const serviceAreas = [
  { slug: "machinery-services", title: "Repair & Services", href: "/repair-services" },
  { slug: "spare-parts", title: "Spare Parts", href: "/spare-parts" },
  { slug: "lubricants", title: "Lubricants", href: "/lubricants" },
  { slug: "rental", title: "Rental", href: "/rental" },
];

const primaryBrands = ["Volvo", "Komatsu", "Caterpillar", "Hitachi", "Kobelco", "Sumitomo"];
const secondaryBrands = ["Doosan", "Hyundai", "SANY", "XCMG", "Shantui", "JCB", "Case", "Kubota", "Yanmar", "Takeuchi", "LiuGong", "SDLG"];
const approvedBrandLists = [primaryBrands, secondaryBrands];

function approvedBrands(inventoryBrands: (string | undefined)[]) {
  const activeNames = new Set(inventoryBrands.filter((brand): brand is string => Boolean(brand)).map((brand) => brand.trim().toLocaleLowerCase("en")));
  return approvedBrandLists.map((brands) => brands.filter((brand) => activeNames.has(brand.toLocaleLowerCase("en"))));
}

export default async function HomePage() {
  const [inventory, contact, servicePages] = await Promise.all([
    getPublicMachines(),
    getPublicContact(),
    Promise.all(serviceAreas.map((area) => getPublishedPage(area.slug))),
  ]);
  const available = getAvailableHomepageMachines(inventory.machines);
  const heroImage = available.find((machine) => machine.featuredImage)?.featuredImage;
  const aboutImage = available.find((machine) => machine.featuredImage && machine.featuredImage !== heroImage)?.featuredImage ?? heroImage;
  const [activePrimaryBrands, activeSecondaryBrands] = approvedBrands(inventory.machines.filter((machine) => machine.stockStatus !== "sold").map((machine) => machine.brand));
  const whatsappHref = contact.whatsApp ? `https://wa.me/${contact.whatsApp}` : undefined;

  return <main id="main-content" className="home-page">
    <div className="home-content">
      <section className={heroImage ? "home-hero" : "home-hero home-hero--text-only"} aria-labelledby="home-title">
        <div className="home-hero__copy">
          <p className="eyebrow"><span className="eyebrow__line" aria-hidden="true" />HGR Equipment Resources · Malaysia</p>
          <h1 id="home-title">Find the machine<br /><span>for your next job.</span></h1>
          <p className="home-hero__intro">Explore used machines from HGR, review the details available, and speak with our team about what you need.</p>
          <div className="home-hero__actions">
            <Link className="button button--primary" href="/used-excavators#available">View Available Equipment <span aria-hidden="true">↗</span></Link>
            {whatsappHref ? <TrackedContactLink className="home-hero__secondary" href={whatsappHref} channel="whatsapp" pageGroup="contact" target="_blank" rel="noreferrer">Enquire on WhatsApp <span aria-hidden="true">→</span></TrackedContactLink> : <Link className="home-hero__secondary" href="/contact">Enquire with HGR <span aria-hidden="true">→</span></Link>}
          </div>
        </div>
        {heroImage && <figure className="home-hero__visual">
          <img src={heroImage.largeUrl ?? heroImage.cardUrl ?? heroImage.url} srcSet={publicImageSrcSet(heroImage)} sizes="(max-width: 900px) 100vw, 52vw" alt={heroImage.altText?.trim() || "Used machine available from HGR"} fetchPriority="high" />
          <figcaption>Real machine photography from HGR’s available inventory.</figcaption>
        </figure>}
      </section>

      <section className="home-inventory section-shell" id="available" aria-labelledby="available-title">
        <div className="home-section-heading">
          <div><p className="eyebrow">Current selection</p><h2 id="available-title">Available Equipment</h2><p>Machines HGR currently lists as available.</p></div>
          <Link className="text-link" href="/used-excavators">View All Used Machines <span aria-hidden="true">↗</span></Link>
        </div>
        {inventory.unavailable ? <section className="empty-state" role="status"><h3>We couldn’t load the machine list. Please try again.</h3><p>If the problem continues, contact HGR directly.</p><Link className="button button--quiet" href="/contact">Send an enquiry</Link></section> : available.length > 0 ? <div className="machine-grid home-machine-grid">{available.map((machine) => <MachineCard key={machine.hgrId} machine={machine} image={machine.featuredImage} />)}</div> : <section className="empty-state"><h3>No machines are listed as available right now.</h3><p>Contact HGR to ask about current stock.</p><Link className="button button--quiet" href="/contact">Contact HGR</Link></section>}
        {available.length > 0 && <div className="home-inventory__bottom"><span>Availability can change. Contact HGR to confirm current details.</span><Link href="/used-excavators">Browse all used machines <span aria-hidden="true">→</span></Link></div>}
      </section>

      <section className="home-contact-band" aria-labelledby="find-machine-title">
        <div><p className="eyebrow">Looking for something specific?</p><h2 id="find-machine-title">Can’t find your machine?</h2><p>Tell HGR what machine you are looking for.</p></div>
        <div className="home-contact-band__actions">
          {whatsappHref ? <TrackedContactLink className="button button--light" href={whatsappHref} channel="whatsapp" pageGroup="contact" target="_blank" rel="noreferrer">Ask HGR on WhatsApp <span aria-hidden="true">↗</span></TrackedContactLink> : <Link className="button button--light" href="/contact">Ask HGR <span aria-hidden="true">↗</span></Link>}
          <Link className="home-hero__secondary" href="/contact">Send an enquiry <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className="home-why section-shell" aria-labelledby="why-title">
        <div className="home-why__copy"><p className="eyebrow">Build Trust First</p><h2 id="why-title">A real business. A place to view machines.</h2><p>Contact HGR to ask about a machine or arrange a viewing at the Klang, Selangor yard, preferably by appointment.</p><Link className="text-link" href="/contact">Arrange a machine viewing <span aria-hidden="true">↗</span></Link></div>
        <div className="home-why__facts" aria-label="HGR location"><span className="home-why__mark" aria-hidden="true">HGR</span><p>Klang, Selangor</p><p>Malaysia</p></div>
      </section>

      <section className="home-support section-shell" aria-labelledby="support-title">
        <div className="home-section-heading"><div><p className="eyebrow">HGR Equipment Resources</p><h2 id="support-title">Services</h2><p>Contact HGR about these core business areas.</p></div></div>
        <div className="support-grid support-grid--four">{serviceAreas.map((area, index) => {
          const page = servicePages[index];
          const copy = lexicalPlainText(page?.body)[0];
          return <article className="support-card" key={area.slug}>
            <span className="support-card__number">0{index + 1}</span><h3>{area.title}</h3>
            <p>{copy ?? `Contact HGR to enquire about ${area.title.toLocaleLowerCase("en").replace("repair & services", "repair and services")}.`}</p><Link className="text-link" href={area.href}>Explore {area.title} <span aria-hidden="true">↗</span></Link>
          </article>;
        })}</div>
      </section>

      <section className="home-brands" aria-labelledby="brands-title"><div className="home-brands__inner">
        <p className="eyebrow">Equipment represented in HGR’s business</p><h2 id="brands-title">Trusted Brands</h2>
        {activePrimaryBrands.length + activeSecondaryBrands.length > 0 ? <>
          {activePrimaryBrands.length > 0 && <div className="home-brands__group"><h3>Primary brands</h3><ul>{activePrimaryBrands.map((brand) => <li key={brand}>{brand}</li>)}</ul></div>}
          {activeSecondaryBrands.length > 0 && <div className="home-brands__group home-brands__group--secondary"><h3>Other brands</h3><ul>{activeSecondaryBrands.map((brand) => <li key={brand}>{brand}</li>)}</ul></div>}
        </> : <p>Contact HGR to ask about a brand or model.</p>}
        <p className="home-brands__note">HGR handles selected brands. Displayed brands do not imply official partnerships or endorsement.</p>
        <Link className="text-link" href="/used-excavators">Explore available equipment <span aria-hidden="true">↗</span></Link>
      </div></section>

      <section className="home-about" aria-labelledby="about-title">
        <div className="home-about__inner"><div><p className="eyebrow">About HGR</p><h2 id="about-title">Equipment and services throughout Malaysia.</h2>{aboutImage && <img className="home-about__image" src={aboutImage.largeUrl ?? aboutImage.cardUrl ?? aboutImage.url} srcSet={publicImageSrcSet(aboutImage)} sizes="(max-width: 700px) 100vw, 40vw" alt={aboutImage.altText?.trim() || "HGR used machinery"} loading="lazy" />}</div><div className="home-about__copy"><p>HGR Equipment Resources supplies quality used heavy equipment, repair services, spare parts, lubricants and rental equipment throughout Malaysia.</p><Link className="text-link" href="/about">More about HGR <span aria-hidden="true">↗</span></Link></div></div>
      </section>

      <section className="home-last-cta" aria-labelledby="last-cta-title"><p className="eyebrow">Your next step</p><h2 id="last-cta-title">Have a machine in mind?</h2><p>Ask HGR about equipment, arrange a viewing, or send an enquiry.</p><div className="home-hero__actions">
        {whatsappHref ? <TrackedContactLink className="button button--primary" href={whatsappHref} channel="whatsapp" pageGroup="contact" target="_blank" rel="noreferrer">Contact HGR on WhatsApp <span aria-hidden="true">↗</span></TrackedContactLink> : <Link className="button button--primary" href="/contact">Contact HGR <span aria-hidden="true">↗</span></Link>}
        {contact.phone && <TrackedContactLink className="button button--quiet" href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`} channel="phone" pageGroup="contact">Call HGR</TrackedContactLink>}
        <Link className="button button--quiet" href="/contact">Send an enquiry</Link>
      </div></section>
    </div>
  </main>;
}
