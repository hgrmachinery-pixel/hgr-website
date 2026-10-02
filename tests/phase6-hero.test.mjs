import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const home = await readFile(new URL("../src/app/(site)/page.tsx", import.meta.url), "utf8");
const inventory = await readFile(new URL("../src/app/(site)/used-excavators/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/app/(site)/site.css", import.meta.url), "utf8");

test("homepage leads with the excavator proposition and both immediate actions", () => {
  assert.match(home, /<h1 className="page-title"[^>]*>Used Excavators<\/h1>/);
  assert.match(home, /View Available Excavators/);
  assert.match(home, /href="\/used-excavators#available"/);
  assert.match(home, /href="\/contact"/);
  assert.ok(home.indexOf("home-hero") < home.indexOf("Available Excavators"));
  assert.ok(home.indexOf("Available Excavators") < home.indexOf("<MachineCard"));
});

test("homepage keeps a useful static fallback and uses only projected featured media", () => {
  assert.match(home, /getAvailableHomepageMachines\(inventory\.machines\)/);
  assert.match(home, /image=\{machine\.featuredImage\}/);
  assert.doesNotMatch(home, /<img|<Image|background-image|hero-motion|hero-animation/);
  assert.match(css, /prefers-reduced-motion/);
});

test("home and inventory use approved zero-stock and service-error copy with enquiry recovery", () => {
  for (const source of [home, inventory]) {
    assert.match(source, /No excavators are listed right now\./);
    assert.match(source, /Check back soon, or send HGR an enquiry to ask about available stock\./);
    assert.match(source, /We couldn(?:'|&apos;)t load the excavator list\. Please try again\. If the problem continues, send HGR an enquiry\./);
    assert.match(source, /href="\/contact"/);
  }
});
