"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import { useState } from "react";

type DeleteResponse = {
  message?: unknown;
  errors?: Array<{ message?: unknown }>;
};

export function MachineDeleteAction() {
  const { id, collectionSlug, docPermissions, disableActions, apiURL } = useDocumentInfo();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const canDelete = Boolean(docPermissions && "delete" in docPermissions && docPermissions.delete === true);

  if (collectionSlug !== "machines" || !id || !canDelete || disableActions) return null;

  async function deleteMachine() {
    if (!window.confirm("Permanently delete this never-published draft machine? This cannot be undone.")) return;
    setBusy(true);
    setMessage("");
    try {
      const apiBase = (apiURL || "/api").replace(/\/$/, "");
      const response = await fetch(`${apiBase}/machines/${encodeURIComponent(String(id))}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
      const result = await response.json().catch((): DeleteResponse => ({}));
      if (!response.ok) {
        const detail = typeof result.message === "string"
          ? result.message
          : typeof result.errors?.[0]?.message === "string"
            ? result.errors[0].message
            : "The machine could not be deleted. Reload the page and try again.";
        throw new Error(detail);
      }
      setMessage("Machine deleted.");
      window.location.assign("/admin/collections/machines");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The machine could not be deleted. Reload the page and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="Machine deletion" style={{ marginBlock: 12 }}>
      <button type="button" disabled={busy} onClick={() => void deleteMachine()}>
        {busy ? "Deleting machine…" : "Delete Machine"}
      </button>
      <p role="status" aria-live="polite">{message}</p>
    </section>
  );
}
