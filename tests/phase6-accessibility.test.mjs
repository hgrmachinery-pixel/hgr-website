import assert from "node:assert/strict";
import test from "node:test";
import { submitEnquiry, validateEnquiry } from "../src/lib/enquiries/submit.ts";
import { readFile } from "node:fs/promises";

test("general enquiry validation returns safe field-keyed errors", () => {
  const result = validateEnquiry({ kind: "general", name: "", phone: "abc", email: "bad", message: "", subject: "" });
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.deepEqual(result.fieldErrors, {
    name: "Name is required.",
    phone: "Enter a valid Malaysian mobile number.",
    email: "Enter a valid email address.",
    message: "Message is required.",
    subject: "Subject is required.",
  });
  assert.doesNotMatch(JSON.stringify(result.fieldErrors), /bad|abc/);
});

test("optional empty email is accepted and valid submissions keep adapter outcomes", async () => {
  const valid = { kind: "general", name: "HGR", phone: "+60 12 345 6789", subject: "General", email: "", message: "Hello" };
  assert.equal(validateEnquiry(valid).ok, true);
  const accepted = await submitEnquiry(valid, async () => ({ accepted: true }));
  const unavailable = await submitEnquiry(valid, async () => ({ accepted: false }));
  const failed = await submitEnquiry(valid, async () => { throw new Error("private adapter detail"); });
  assert.deepEqual(accepted, { status: "accepted" });
  assert.deepEqual(unavailable, { status: "unavailable" });
  assert.deepEqual(failed, { status: "failed" });
});

test("enquiry errors are associated with current controls and summarized", async () => {
  const form = await readFile(new URL("../src/components/site/EnquiryForm.tsx", import.meta.url), "utf8");
  const action = await readFile(new URL("../src/app/(site)/contact/actions.ts", import.meta.url), "utf8");
  assert.match(form, /role="alert"/);
  assert.match(form, /aria-invalid/);
  assert.match(form, /aria-describedby/);
  assert.match(form, /href={`#\$\{name\}`}/);
  assert.match(form, /id: name/);
  assert.match(form, /fieldErrors\?\.\[name/);
  assert.match(action, /fieldErrors\?: EnquiryFieldErrors/);
  assert.match(action, /fieldErrors: result\.fieldErrors/);
  assert.match(form, /htmlFor=/);
});
