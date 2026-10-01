"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import { useState } from "react";

type DocumentData = {
  documentKind?: unknown;
  workflowStatus?: unknown;
  contentDigest?: unknown;
};

export function SubmitDocumentForReview() {
  const { id, collectionSlug, data } = useDocumentInfo();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const document = data as DocumentData | undefined;

  if (
    collectionSlug !== "machine-documents" ||
    !id ||
    document?.documentKind !== "redacted-copy"
  ) return null;

  if (document.workflowStatus === "submitted") {
    return <p role="status">Submitted to the Owner for review.</p>;
  }

  const submit = async () => {
    if (typeof document.contentDigest !== "string") {
      setMessage("Save this redacted copy before submitting it.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/machine-documents/submit", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, digest: document.contentDigest }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The document could not be submitted.");
      setMessage("Submitted to the Owner for review.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The document could not be submitted.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label="Document review submission" style={{ margin: "12px 0", padding: 12, border: "1px solid #E2E2E2", borderRadius: 8 }}>
      <button type="button" disabled={busy || document.workflowStatus !== "draft"} onClick={() => void submit()}>
        {busy ? "Submitting…" : "Submit for Owner review"}
      </button>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
