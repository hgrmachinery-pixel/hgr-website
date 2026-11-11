import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync(new URL("../src/components/payload/MachinePhotoUploader.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../src/app/(payload)/machine-photo-uploader.css", import.meta.url), "utf8");
const layout = readFileSync(new URL("../src/app/(payload)/layout.tsx", import.meta.url), "utf8");
const machines = readFileSync(new URL("../src/collections/Machines.ts", import.meta.url), "utf8");

test("machine photo manager exposes per-image preview, category, status and actionable errors", () => {
  for (const expected of ["hgr-photo-card__preview", "hgr-photo-category", "hgr-photo-status", "hgr-photo-card__error", "Master photo upload failed", "Image processing failed", "Retry upload", "Retry processing", "aria-live", "derivativeFilename"]) {
    assert.ok(component.includes(expected), `missing uploader UI contract: ${expected}`);
  }
});

test("machine photo manager includes narrow-screen layout and readable focus/status treatments", () => {
  assert.match(styles, /@media\s*\(max-width:\s*680px\)/);
  assert.match(styles, /@media\s*\(max-width:\s*400px\)/);
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /hgr-photo-status--failed/);
  assert.match(layout, /\.\/machine-photo-uploader\.css/);
});

test("machine photo manager is in the form flow and only its list scrolls", () => {
  assert.match(machines, /type: "ui",\s*name: "machinePhotosManager",\s*admin: \{ components: \{ Field: "@\/components\/payload\/MachinePhotoUploader#MachinePhotoUploader"/);
  assert.doesNotMatch(machines, /beforeDocumentControls: \[[^\]]*MachinePhotoUploader/);
  assert.match(styles, /\.hgr-photo-queue[^}]*max-height: min\(58vh, 620px\)[^}]*overflow-y: auto/s);
  assert.match(styles, /\.hgr-photo-manager[^}]*position: relative[^}]*width: 100%[^}]*min-width: 0/s);
  assert.match(component, /className="hgr-photo-queue" tabIndex=\{0\} aria-label=/);
});

test("processing retry retains selected blur regions and does not replace the private master", () => {
  assert.match(component, /if \(retry && item\.masterId\)[\s\S]*?process\(item, item\.redactions\)/);
  assert.match(component, /body: item\.file/);
  assert.match(component, /X-HGR-Machine-Photo-Master/);
});

test("normal upload completes ready without mandatory review and keeps gallery snapshot hidden", () => {
  assert.match(component, /status: "ready"/);
  assert.match(component, /Ready for publication/);
  assert.match(component, /Optional photo review and sensitive-content safeguards/);
  assert.match(machines, /name: "gallery"[\s\S]*?admin: \{ hidden: true, readOnly: true \}/);
  assert.match(machines, /eligible = candidates[\s\S]*?data\.gallery = eligibleIds/);
  assert.match(machines, /eligible\.find\(\(photo\) => photo\.category === "general-exterior"\)/);
});

test("sensitive review is recorded server-side before redaction and remains required afterward", () => {
  assert.match(component, /fetch\("\/api\/machine-media\/review"[\s\S]*?if \(response\.status === 400 && found && item\.redactions\.length > 0\)/);
  assert.ok(component.indexOf('fetch("/api/machine-media/review"') < component.indexOf("if (response.status === 400 && found && item.redactions.length > 0)"));
  assert.match(component, /status: "needs-review", error: "Sensitive content was recorded/);
  assert.match(component, /Required sensitive-content review/);
  assert.match(machines, /data\._status === "published" && context\.machinePhotoProcessing !== true/);
});
