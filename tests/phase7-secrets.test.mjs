import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

function trackedFiles() {
  return execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" })
    .split("\0")
    .filter(Boolean);
}

function trackedRealEnvironmentFiles(files) {
  return files.filter((file) => /(?:^|\/)\.env(?:\.[^/]+)?$/i.test(file) && file.toLowerCase() !== ".env.example");
}

function credentialAssignmentFindings(content) {
  const names = new Set(["DATABASE_URL", "PAYLOAD_SECRET", "PREVIEW_SECRET", "SMTP_PASSWORD", "GOOGLE_APPLICATION_CREDENTIALS"]);
  const findings = [];
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)[ \t]*=[ \t]*(.*?)[ \t]*$/);
    if (!match || !names.has(match[1])) continue;
    const rawValue = match[2];
    const value = rawValue.replace(/^(?:"([^"]*)"|'([^']*)')$/, (_all, doubleQuoted, singleQuoted) => doubleQuoted ?? singleQuoted);
    if (!value || /^(?:your-[a-z0-9-]+-here|placeholder|example|changeme|replace-me)$/i.test(value)) continue;
    if (/^synthetic-(?:build-only|test-only|example|placeholder)(?:-[a-z0-9-]+)*$/i.test(value)) continue;
    findings.push("credential-assignment");
  }
  return findings;
}

test("environment templates contain variable names only and real env files are ignored", () => {
  const template = readFileSync(join(root, ".env.example"), "utf8");
  const unsafeLines = template.split(/\r?\n/).flatMap((line, index) => {
    if (!line || line.startsWith("#") || /^[A-Z][A-Z0-9_]*=$/.test(line) || line === "HGR_LOCAL_UI_REVIEW=false") return [];
    return [index + 1];
  });
  assert.equal(unsafeLines.length, 0, `environment example has an unapproved value on line(s): ${unsafeLines.join(", ")}`);

  const ignore = readFileSync(join(root, ".gitignore"), "utf8");
  for (const rule of [/^\.env$/m, /^\.env\.\*$/m, /^!\.env\.example$/m]) {
    assert.match(ignore, rule, "environment files must remain ignored while the example is tracked");
  }
  assert.deepEqual(trackedRealEnvironmentFiles(trackedFiles()), [], "real environment files must not be tracked");
  assert.deepEqual(trackedRealEnvironmentFiles([".env", ".env.local", "config/.env.production", ".env.example"]), [".env", ".env.local", "config/.env.production"]);
});

test("tracked source has no common credential material and reports names/categories only", () => {
  const rules = [
    ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i],
    ["aws-access-key", /\bAKIA[0-9A-Z]{16}\b/],
    ["google-api-key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ];
  assert.deepEqual(credentialAssignmentFindings('DATABASE_URL="nonempty-fixture"\nSMTP_PASSWORD=\'quoted-fixture\''), ["credential-assignment", "credential-assignment"]);
  assert.deepEqual(credentialAssignmentFindings('SMTP_PASSWORD="fixture@localhost"\nPAYLOAD_SECRET=fixture@127.0.0.1'), ["credential-assignment", "credential-assignment"]);
  assert.deepEqual(credentialAssignmentFindings("DATABASE_URL=\nPAYLOAD_SECRET=your-payload-secret-here\nSMTP_PASSWORD=placeholder"), []);
  const findings = [];
  for (const file of trackedFiles()) {
    if (file.startsWith("node_modules/") || file === ".env.example") continue;
    const content = readFileSync(join(root, file), "utf8");
    for (const [category, pattern] of rules) {
      const match = content.match(pattern);
      if (!match) continue;
      if (category === "credential-assignment" && /^(?:your-[a-z0-9-]+-here|placeholder|example|changeme|replace-me)$/i.test(match[0].split("=").at(-1).trim())) continue;
      findings.push(`${file} (${category})`);
    }
    for (const category of credentialAssignmentFindings(content)) findings.push(`${file} (${category})`);
  }
  assert.equal(findings.length, 0, `tracked credential pattern found in: ${findings.join(", ")}`);
});
