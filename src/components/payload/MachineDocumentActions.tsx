"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import { useEffect, useState } from "react";

type DocumentData = { documentKind?: unknown; workflowStatus?: unknown; contentDigest?: unknown };
const reviewItems = [
  ["manufacturerSerials", "Manufacturer serial numbers"], ["chassisVIN", "Chassis / VIN numbers"],
  ["engineNumbers", "Engine numbers"], ["registrationNumbers", "Registration numbers"],
  ["qrCodes", "QR codes"], ["barcodes", "Barcodes"], ["customerLabels", "Customer labels"],
  ["deliveryInformation", "Delivery information"], ["personalInformation", "Personal information"],
  ["otherSensitiveIdentifiers", "Other sensitive identifiers"],
] as const;

type Checklist = Record<(typeof reviewItems)[number][0], "clear" | "redacted" | "uncertain" | "">;
const emptyChecklist = (): Checklist => Object.fromEntries(reviewItems.map(([key]) => [key, ""])) as Checklist;

export function MachineDocumentActions() {
  const { id, collectionSlug, data } = useDocumentInfo();
  const document = data as DocumentData | undefined;
  const [canPublish, setCanPublish] = useState(false);
  const [capabilityLoaded, setCapabilityLoaded] = useState(false);
  const [capabilityError, setCapabilityError] = useState(false);
  const [checklist, setChecklist] = useState<Checklist>(emptyChecklist);
  const [attested, setAttested] = useState(false);
  const [previewedDigest, setPreviewedDigest] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (collectionSlug !== "machine-documents") return;
    let active = true;
    void fetch("/api/machine-documents/capability", { credentials: "same-origin", cache: "no-store" })
      .then((response) => { if (!response.ok) throw new Error("Permission check failed"); return response.json(); })
      .then((result) => { if (active) { setCanPublish(result.canPublish === true); setCapabilityLoaded(true); } })
      .catch(() => { if (active) { setCanPublish(false); setCapabilityError(true); setCapabilityLoaded(true); } });
    return () => { active = false; };
  }, [collectionSlug]);

  useEffect(() => {
    setPreviewedDigest("");
    setChecklist(emptyChecklist());
    setAttested(false);
  }, [document?.contentDigest]);

  if (collectionSlug !== "machine-documents" || !id || !document || document.documentKind !== "redacted-copy") return null;
  const digest = typeof document.contentDigest === "string" ? document.contentDigest : "";
  const submitted = document.workflowStatus === "submitted";
  const published = document.workflowStatus === "published";

  const post = async (action: "submit" | "publish", body: Record<string, unknown>) => {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/machine-documents/${action}`, {
        method: "POST", credentials: "same-origin", cache: "no-store",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The document action could not be completed.");
      setMessage(action === "submit" ? "Submitted for Owner review." : "Published. Approval and publication were recorded.");
      if (action === "publish") window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The document action could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  const preview = async () => {
    if (!digest) return;
    const previewURL = `/api/machine-documents/preview?id=${encodeURIComponent(String(id))}&digest=${encodeURIComponent(digest)}`;
    const previewTab = window.open("about:blank", "_blank");
    if (!previewTab) { setMessage("Allow the preview window, then try again."); return; }
    previewTab.opener = null;
    setBusy(true);
    setMessage("Loading the exact redacted revision for private preview…");
    try {
      const response = await fetch(previewURL, { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "The private preview is unavailable.");
      }
      const objectURL = URL.createObjectURL(await response.blob());
      previewTab.location.href = objectURL;
      setPreviewedDigest(digest);
      setMessage("Preview opened. Review the exact redacted copy before publishing.");
    } catch (error) {
      previewTab.close();
      setMessage(error instanceof Error ? error.message : "The private preview is unavailable.");
    } finally {
      setBusy(false);
    }
  };

  const checklistComplete = reviewItems.every(([key]) => checklist[key] === "clear" || checklist[key] === "redacted");
  return (
    <section aria-label="Document review and publication" style={{ margin: "12px 0", padding: 12, border: "1px solid #E2E2E2", borderRadius: 8 }}>
      {!capabilityError && capabilityLoaded && !canPublish && document.workflowStatus === "draft" && (
        <button type="button" disabled={busy || !digest} onClick={() => void post("submit", { id, digest })}>Submit for Owner review</button>
      )}
      {canPublish && (document.workflowStatus === "draft" || submitted || published) && (
        <div style={{ marginTop: 10 }}>
          <button type="button" disabled={busy || !digest} onClick={preview}>Preview as Public</button>
          {!published && <>
            <p>Check this exact redacted copy for sensitive information. Mark each item clear or redacted; uncertainty must be resolved before publishing.</p>
            <fieldset style={{ border: 0, padding: 0 }}>
              <legend>Public document privacy review</legend>
              {reviewItems.map(([key, label]) => (
                <label key={key} style={{ display: "block", margin: "6px 0" }}>
                  {label}{" "}
                  <select value={checklist[key]} onChange={(event) => setChecklist((current) => ({ ...current, [key]: event.target.value as Checklist[typeof key] }))}>
                    <option value="">Choose…</option><option value="clear">Clear</option><option value="redacted">Redacted</option><option value="uncertain">Uncertain — do not publish</option>
                  </select>
                </label>
              ))}
            </fieldset>
            <label style={{ display: "block", margin: "8px 0" }}>
              <input type="checkbox" checked={attested} onChange={(event) => setAttested(event.target.checked)} /> I reviewed this exact revision using Preview as Public and completed the human privacy review.
            </label>
            <button type="button" disabled={busy || previewedDigest !== digest || !checklistComplete || !attested} onClick={() => void post("publish", { id, digest, checklist })}>Publish</button>
          </>}
        </div>
      )}
      {capabilityError && <p role="status">Permission could not be checked. Refresh before continuing.</p>}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
