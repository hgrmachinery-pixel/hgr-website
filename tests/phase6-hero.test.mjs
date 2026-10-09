import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const home = await readFile(new URL("../src/app/(site)/page.tsx", import.meta.url), "utf8");
const inventory = await readFile(new URL("../src/app/(site)/used-excavators/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/app/(site)/site.css", import.meta.url), "utf8");

test("homepage leads with the excavator proposition and both immediate actions", () => {
  assert.match(home, /<h1 id="home-title">Find the machine/);
  assert.match(home, /Explore available excavators/);
  assert.match(home, /href="\/used-excavators#available"/);
  assert.match(home, /href="\/contact"/);
  assert.ok(home.indexOf("home-hero") < home.indexOf("Available excavators"));
  assert.ok(home.indexOf("Available excavators") < home.indexOf("<MachineCard"));
});

test("homepage keeps a useful static fallback and uses only projected featured media", () => {
  assert.match(home, /getAvailableHomepageMachines\(inventory\.machines\)/);
  assert.match(home, /image=\{machine\.featuredImage\}/);
  assert.doesNotMatch(home, /<img|<Image|background-image|hero-motion|hero-animation/);
  assert.match(css, /prefers-reduced-motion/);
});

test("home and inventory use approved zero-stock and service-error copy with enquiry recovery", () => {
  assert.match(home, /No excavators are listed right now\./);
  assert.match(home, /contact HGR to ask about current stock\./);
  assert.match(home, /We couldn(?:'|&apos;|’|’)t load the excavator list\. Please try again\./);
  assert.match(inventory, /No excavators are listed right now\./);
  assert.match(inventory, /Check back soon, or send HGR an enquiry to ask about available stock\./);
  assert.match(inventory, /We couldn(?:'|&apos;)t load the excavator list\. Please try again\. If the problem continues, send HGR an enquiry\./);
  for (const source of [home, inventory]) assert.match(source, /href="\/contact"/);
});
