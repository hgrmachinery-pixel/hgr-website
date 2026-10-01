import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationURL = new URL("../src/migrations/20261001_171946_phase3_media_documents.ts", import.meta.url);

test("Phase 3 migration seeds roles and maps only recognized legacy assignments", async () => {
  const source = await readFile(migrationURL, "utf8");
  const up = source.slice(source.indexOf("export async function up"), source.indexOf("export async function down"));

  assert.match(up, /\('Owner', 'owner'\),\s*\('Website Administrator', 'website-administrator'\)/);
  assert.match(up, /'Approve Public Documents'/);
  assert.match(up, /WHERE "role"::text NOT IN \('owner', 'website-administrator'\)/);
  assert.match(up, /WHEN 'owner' THEN 'owner'[\s\S]*WHEN 'website-administrator' THEN 'website-administrator'/);
  assert.ok(up.indexOf("UPDATE \"users\" AS u SET \"role_id\"") < up.indexOf('ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL'));
  assert.match(up, /existing photos need reviewed identity, digest, and human-review backfill/);
  assert.doesNotMatch(up, /UPDATE "machine_media"/);
  assert.match(up, /CREATE TRIGGER asset_audit_events_append_only[\s\S]*BEFORE UPDATE OR DELETE/);
  assert.match(up, /ON DELETE restrict/);
  assert.match(up, /CREATE SEQUENCE public\.hgr_machine_photo_seq/);
});

test("Phase 3 rollback holds locks, refuses history or unrepresentable role data, and never cascades", async () => {
  const source = await readFile(migrationURL, "utf8");
  const down = source.slice(source.indexOf("export async function down"));
  const lockAt = down.indexOf("LOCK TABLE public.asset_audit_events");
  const preflightAt = down.indexOf("DO $$");
  const triggerDropAt = down.indexOf("DROP TRIGGER asset_audit_events_append_only");
  const dropTableAt = down.indexOf('DROP TABLE "asset_audit_events"');
  const sequenceDropAt = down.indexOf("DROP SEQUENCE public.hgr_machine_photo_seq");

  assert.ok(lockAt >= 0 && lockAt < preflightAt);
  assert.ok(preflightAt < sequenceDropAt && sequenceDropAt < triggerDropAt && triggerDropAt < dropTableAt);
  assert.match(down, /IF EXISTS \(SELECT 1 FROM public\.asset_audit_events\)[\s\S]*permanent asset audit history is populated/);
  assert.match(down, /IF EXISTS \(SELECT 1 FROM public\.machine_documents\)[\s\S]*document revisions exist/);
  assert.match(down, /embedded lifecycle history is populated/);
  assert.match(down, /custom or modified roles cannot be represented/);
  assert.match(down, /additional or changed role permissions cannot be represented/);
  assert.match(down, /multiple users share a role/);
  assert.match(down, /UPDATE "users" AS u SET "role" = CASE r\."key"/);
  assert.match(down, /ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL/);
  assert.doesNotMatch(down, /\bCASCADE\b/);
});
