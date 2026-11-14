"use client";

import { useSelection } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

type BulkDeleteResponse = {
  deletedIDs?: Array<number | string>;
  cascadedIDs?: Array<number | string>;
  failures?: Array<{ id: number | string; message: string }>;
  error?: string;
};

export function MachineMediaBulkDelete({ collectionSlug, hasDeletePermission }: { collectionSlug: string; hasDeletePermission?: boolean }) {
  const { count, getSelectedIds, selectAll, toggleAll } = useSelection();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (collectionSlug !== "machine-media" || !hasDeletePermission || count < 2) return null;

  const acrossPages = selectAll === "allAvailable";

  async function deleteSelected() {
    if (acrossPages) {
      setMessage("For safe photo deletion, select images on this page instead of selecting all results across pages.");
      return;
    }
    const ids = getSelectedIds();
    if (ids.length < 2) {
      setMessage("Select at least two different machine images.");
      return;
    }
    if (!window.confirm(`Delete ${ids.length} selected machine images? Published-machine photos will be blocked. This cannot be undone.`)) return;

    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/machine-media/bulk-delete", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const result = await response.json() as BulkDeleteResponse;
      if (!response.ok) throw new Error(result.error || "The selected images could not be deleted.");

      const deletedCount = result.deletedIDs?.length ?? 0;
      const cascadedCount = result.cascadedIDs?.length ?? 0;
      const failures = result.failures ?? [];
      const summary = `${deletedCount} selected image${deletedCount === 1 ? "" : "s"} deleted${cascadedCount ? ` (${cascadedCount} through master-photo cleanup)` : ""}.`;
      const failureSummary = failures.length
        ? ` ${failures.length} failed: ${failures.map(({ id, message: failure }) => `ID ${id}: ${failure}`).join("; ")}`
        : "";
      setMessage(`${summary}${failureSummary}`);
      toggleAll();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The selected images could not be deleted.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="Delete selected machine images" style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px 0", flexWrap: "wrap" }}>
      <button
        type="button"
        disabled={busy || acrossPages}
        onClick={() => void deleteSelected()}
        style={{ background: "#F86C00", border: 0, borderRadius: 6, color: "#fff", cursor: busy || acrossPages ? "not-allowed" : "pointer", fontWeight: 600, padding: "9px 14px", opacity: busy || acrossPages ? 0.65 : 1 }}
      >
        {busy ? "Deleting selected images…" : `Delete ${count} selected images`}
      </button>
      {acrossPages && <span>Select images on this page individually for safe deletion.</span>}
      {message && <span role="status" aria-live="polite">{message}</span>}
    </section>
  );
}
