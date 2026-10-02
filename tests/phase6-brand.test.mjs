import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const css = await readFile(new URL("../src/app/(site)/site.css", import.meta.url), "utf8");
const header = await readFile(new URL("../src/app/(site)/siteHeader.tsx", import.meta.url), "utf8");

function luminance(hex) {
  const channels = hex.replace("#", "").match(/.{2}/g).map((channel) => parseInt(channel, 16) / 255);
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

const textPairs = [
  ["#171717", "#ffffff", "primary text on paper"],
  ["#5f6368", "#ffffff", "secondary text on paper"],
  ["#5f6368", "#f5f5f5", "secondary text on soft surface"],
  ["#ffffff", "#151515", "dark feature text"],
  ["#d0d0d0", "#151515", "dark feature secondary text"],
  ["#205c34", "#e8f4ec", "available status"],
  ["#6b4200", "#fff2dc", "reserved status"],
  ["#3c3c3c", "#ededed", "sold status"],
  ["#171717", "#f89800", "default primary action"],
  ["#171717", "#f86c00", "hover primary action"],
  ["#171717", "#e85f00", "active primary action"],
];

test("every used palette and action text pairing meets its WCAG text threshold", () => {
  for (const [foreground, background, label] of textPairs) {
    assert.ok(contrast(foreground, background) >= 4.5, `${label}: ${contrast(foreground, background).toFixed(2)}:1`);
  }
  assert.ok(contrast("#171717", "#f86c00") >= 4.5, "white text on orange is prohibited; action text stays dark");
});

test("the focus indicator contrasts on light, dark and action surfaces", () => {
  const outline = "#1267a5";
  assert.ok(contrast(outline, "#ffffff") >= 3, "blue outline against light surface");
  assert.ok(contrast(outline, "#222222") >= 3 || contrast("#ffffff", "#222222") >= 3, "dark surface needs a contrasting keyline");
  assert.ok(contrast(outline, "#f89800") >= 3 || contrast("#171717", "#f89800") >= 3, "orange action needs a contrasting keyline");
  assert.match(css, /--hgr-focus:\s*#1267a5/i);
  assert.match(css, /outline:\s*3px solid var\(--hgr-focus\)/i);
  assert.match(css, /focus-visible[^{]*\{[^}]*box-shadow:/s);
});

test("shared styles provide the approved type scale and minimum interactive targets", () => {
  for (const size of ["16px", "14px", "24px", "40px"]) assert.ok(css.includes(size), `missing ${size} type role`);
  assert.match(css, /font-weight:\s*400/);
  assert.match(css, /font-weight:\s*600/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /min-width:\s*44px/);
  assert.match(css, /flex-wrap:\s*wrap/);
  assert.match(css, /prefers-reduced-motion/);
});

test("navigation keeps six destinations in order and the logo is the only home link", () => {
  const routes = ["/used-excavators", "/rental", "/machinery-services", "/lubricants", "/about", "/contact"];
  const nav = header.slice(header.indexOf("<nav"), header.indexOf("</nav>"));
  const actual = [...nav.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(actual, routes);
  assert.match(header, /className="site-brand" href="\/"/);
  assert.doesNotMatch(nav, /href="\/"/);
});
