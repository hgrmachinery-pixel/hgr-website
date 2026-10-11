import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { projectPublicContact, safeGoogleMapsEmbedURL, safeHttpsURL } from "../src/lib/siteContact.ts";

test("Site Contact keeps its original fields and adds all five organized sections", async () => {
  const source = await readFile(new URL("../src/globals/SiteContact.ts", import.meta.url), "utf8");
  for (const field of ["phone", "whatsApp", "email", "yardLocation", "companyName", "registrationNumber", "supportEmail", "officeAddress", "googleMapsURL", "googleMapsEmbedURL", "weeklyHours", "appointmentOnly", "facebook", "instagram", "linkedin", "youtube", "tiktok"]) {
    assert.match(source, new RegExp(`name: "${field}"`));
  }
  for (const section of ["Company", "Contact", "Location", "Hours", "Social"]) assert.match(source, new RegExp(`label: "${section}"`));
});

test("public projection preserves configured legacy values and ignores invalid/unverified fields", () => {
  const result = projectPublicContact({
    phone: "+60 3 1234 5678", whatsApp: "+60 12 345 6789", email: "sales@example.com", yardLocation: "Klang, Selangor",
    supportEmail: "help@example.com", appointmentOnly: true,
    weeklyHours: [{ day: "monday", opens: "09:00", closes: "17:30" }, { day: "monday", opens: "08:00", closes: "17:00" }, { day: "tuesday", opens: "24:00", closes: "17:00" }],
    googleMapsURL: "https://maps.app.goo.gl/example", googleMapsEmbedURL: "https://attacker.example/maps/embed?x=1",
    facebook: "https://www.facebook.com/hgr", instagram: "http://instagram.com/hgr", linkedin: "https://example.com/fake",
  });
  assert.equal(result.phone, "+60 3 1234 5678");
  assert.equal(result.whatsApp, "60123456789");
  assert.equal(result.email, "sales@example.com");
  assert.equal(result.yardLocation, "Klang, Selangor");
  assert.equal(result.directionsURL, "https://maps.app.goo.gl/example");
  assert.equal(result.appointmentOnly, true);
  assert.deepEqual(result.weeklyHours, [{ day: "monday", opens: "09:00", closes: "17:30" }]);
  assert.equal(result.googleMapsEmbedURL, undefined);
  assert.deepEqual(result.socials.map(({ label }) => label), ["Facebook"]);
});

test("directions need no map API and embeds require Google's maps embed path", () => {
  const result = projectPublicContact({ yardLocation: "Klang, Selangor" });
  assert.equal(result.directionsURL, "https://www.google.com/maps/dir/?api=1&destination=Klang%2C%20Selangor");
  assert.equal(safeGoogleMapsEmbedURL("https://www.google.com/maps/embed?pb=fake"), "https://www.google.com/maps/embed?pb=fake");
  assert.equal(safeGoogleMapsEmbedURL("https://www.google.com/maps/search?q=Klang"), undefined);
  assert.equal(safeGoogleMapsEmbedURL("https://evil.example/maps/embed"), undefined);
  assert.equal(safeGoogleMapsEmbedURL("https://evil.www.google.com/maps/embed"), undefined);
  assert.equal(safeHttpsURL("javascript:alert(1)"), undefined);
  assert.equal(projectPublicContact({ whatsApp: "call HGR" }).whatsApp, undefined);
});

test("Site Contact migration only adds nullable fields and refuses rollback that would lose saved values", async () => {
  const migration = await readFile(new URL("../src/migrations/20261011_000000_site_contact_expansion.ts", import.meta.url), "utf8");
  assert.match(migration, /ADD COLUMN "company_name" varchar/);
  assert.doesNotMatch(migration, /DROP COLUMN "phone"|DROP COLUMN "whats_app"|DROP COLUMN "email"|DROP COLUMN "yard_location"/);
  assert.match(migration, /CREATE TABLE "site_contact_weekly_hours"/);
  assert.match(migration, /Refuse rollback when new values have been saved/);
});

test("Contact page reads shared contact fields and emits populated facts only in organization schema", async () => {
  const source = await readFile(new URL("../src/app/(site)/[supportingPage]/page.tsx", import.meta.url), "utf8");
  assert.match(source, /OrganizationStructuredData/);
  assert.match(source, /Google Maps directions/);
  assert.match(source, /safeGoogleMapsEmbedURL/);
  assert.match(source, /contact\.registrationNumber/);
  assert.match(source, /contact\.weeklyHours/);
});
