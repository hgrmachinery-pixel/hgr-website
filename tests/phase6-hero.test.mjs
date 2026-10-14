import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const home = await readFile(new URL("../src/app/(site)/page.tsx", import.meta.url), "utf8");
const inventory = await readFile(new URL("../src/app/(site)/used-excavators/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/app/(site)/site.css", import.meta.url), "utf8");
const header = await readFile(new URL("../src/app/(site)/siteHeader.tsx", import.meta.url), "utf8");
const footer = await readFile(new URL("../src/components/site/SiteFooter.tsx", import.meta.url), "utf8");

test("homepage leads with the used-machine proposition and both immediate actions", () => {
  assert.match(home, /<h1 id="home-title">Find the machine/);
  assert.match(home, /View Available Equipment/);
  assert.match(home, /href="\/used-excavators#available"/);
  assert.match(home, /Enquire on WhatsApp/);
  assert.ok(home.indexOf("home-hero") < home.indexOf("Available Equipment"));
  assert.ok(home.indexOf("Available Equipment") < home.indexOf("<MachineCard"));
});

test("homepage uses a real available machine photo when approved and excludes Living Machine", () => {
  assert.match(home, /getAvailableHomepageMachines\(inventory\.machines\)/);
  assert.match(home, /image=\{machine\.featuredImage\}/);
  assert.match(home, /heroImage && <figure className="home-hero__visual"/);
  assert.doesNotMatch(home, /LivingMachine|hero-motion|hero-animation/);
  assert.match(css, /prefers-reduced-motion/);
});

test("homepage follows the approved section order and includes real trust and service content", () => {
  const sections = ["home-hero", "home-inventory", "home-contact-band", "home-why", "home-support", "home-brands", "home-about", "home-last-cta"];
  let previous = -1;
  for (const section of sections) {
    const current = home.indexOf(`className="${section}`);
    assert.ok(current > previous, `${section} appears in the approved order`);
    previous = current;
  }
  for (const label of ["Repair & Services", "Spare Parts", "Lubricants", "Rental", "Trusted Brands", "Klang, Selangor"]) assert.ok(home.includes(label));
  assert.match(home, /HGR Equipment Resources supplies quality used heavy equipment, repair services, spare parts, lubricants and rental equipment throughout Malaysia\./);
  assert.match(header, /Used Machines/);
  assert.match(header, /WhatsApp HGR/);
  assert.match(footer, /Used Machines/);
  assert.match(footer, /WhatsApp HGR/);
  assert.match(home, /const primaryBrands = \["Volvo", "Komatsu", "Caterpillar", "Hitachi", "Kobelco", "Sumitomo"\]/);
  assert.match(home, /const secondaryBrands = \["Doosan", "Hyundai", "SANY", "XCMG", "Shantui", "JCB", "Case", "Kubota", "Yanmar", "Takeuchi", "LiuGong", "SDLG"\]/);
  assert.match(home, /activeNames\.has\(brand\.toLocaleLowerCase\("en"\)\)/);
});

test("home and inventory use approved zero-stock and service-error copy with enquiry recovery", () => {
  assert.match(home, /No machines are listed as available right now\./);
  assert.match(home, /Contact HGR to ask about current stock\./);
  assert.match(home, /We couldn’t load the machine list\. Please try again\./);
  assert.match(inventory, /No excavators are listed right now\./);
  assert.match(inventory, /Check back soon, or send HGR an enquiry to ask about available stock\./);
  assert.match(inventory, /We couldn(?:'|&apos;)t load the excavator list\. Please try again\. If the problem continues, send HGR an enquiry\./);
  for (const source of [home, inventory]) assert.match(source, /href="\/contact"/);
});
