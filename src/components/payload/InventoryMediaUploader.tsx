"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import { useMemo, useState } from "react";
import { inventoryMediaCategories, inventoryMediaReviewChecklist } from "@/lib/inventory/media";

const checklistLabels: Record<(typeof inventoryMediaReviewChecklist)[number], string> = {
  imageQuality: "Image is clear and suitable",
  sensitiveIdentifiers: "No sensitive serials or identifiers are visible",
  personalInformation: "No personal information is visible",
  customerInformation: "No customer or delivery information is visible",
  accurateAltText: "Alternative text accurately describes the image context",
};

export function InventoryMediaUploader() {
  const { id, collectionSlug } = useDocumentInfo();
  const type = collectionSlug === "spare-parts" ? "spare-part" : collectionSlug === "lubricants" ? "lubricant" : undefined;
  const [category, setCategory] = useState<(typeof inventoryMediaCategories)[number]["value"]>("featured");
  const [file, setFile] = useState<File>();
  const [derivativeId, setDerivativeId] = useState<string | number>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const ready = useMemo(() => inventoryMediaReviewChecklist.every((key) => checks[key]), [checks]);
  if (!type || !id) return null;

  const uploadAndProcess = async () => {
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData();
      form.append("_payload", JSON.stringify({ ownerType: type, ownerId: String(id), category, assetKind: "master", reviewStatus: "needs-review", altText: `Photo for this ${type === "spare-part" ? "part" : "product"}` }));
      form.append("file", file, file.name);
      const createdResponse = await fetch("/api/inventory-media", { method: "POST", credentials: "same-origin", cache: "no-store", body: form });
      const createdJSON = await createdResponse.json();
      if (!createdResponse.ok) throw new Error(createdJSON.errors?.[0]?.message || "Photo upload failed.");
      const master = createdJSON.doc ?? createdJSON;
      const processedResponse = await fetch("/api/inventory-media/process", { method: "POST", credentials: "same-origin", cache: "no-store", headers: { "Content-Type": file.type, "X-HGR-Inventory-Media-Id": String(master.id) }, body: file });
      const processed = await processedResponse.json();
      if (!processedResponse.ok) throw new Error(processed.error || "Image processing failed.");
      setDerivativeId(processed.derivativeId);
      setMessage("Processed preview is ready. Inspect it below, complete the checklist, then approve or reject it.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The image could not be processed.");
    } finally { setBusy(false); }
  };

  const submitReview = async (status: "approved" | "rejected") => {
    if (status === "approved" && !ready || derivativeId === undefined) return;
    setBusy(true);
    setMessage("");
    try {
      const reviewResponse = await fetch("/api/inventory-media/review", { method: "POST", credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: derivativeId, status, checklist: Object.fromEntries(inventoryMediaReviewChecklist.map((key) => [key, checks[key] ? "clear" : "uncertain"])), publishInGallery: status === "approved" }) });
      const reviewed = await reviewResponse.json();
      if (!reviewResponse.ok) throw new Error(reviewed.error || "Image review could not be saved.");
      setMessage(status === "approved" ? "Image approved and added to this item’s photo gallery." : "Image rejected and will remain private.");
      setFile(undefined);
      setDerivativeId(undefined);
      setChecks({});
      if (status === "approved") window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The image could not be processed.");
    } finally { setBusy(false); }
  };

  return <section style={{ border: "1px solid #E2E2E2", borderRadius: 8, padding: 16, margin: "12px 0", color: "#171717" }} aria-label="Inventory image workflow">
    <h3 style={{ margin: "0 0 8px" }}>Product photos</h3>
    <p>Photos stay private until processed and approved. Review every check before you approve an image.</p>
    <label>Photo category <select value={category} onChange={(event) => setCategory(event.target.value as typeof category)}>{inventoryMediaCategories.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}</select></label>
    <label style={{ display: "block", margin: "12px 0" }}>Choose an image <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => setFile(event.currentTarget.files?.[0])} /></label>
    {derivativeId !== undefined && <>
      <figure><img src={`/api/inventory-media/file/${derivativeId}?size=large`} alt={`Processed photo preview for this ${type === "spare-part" ? "part" : "product"}`} style={{ display: "block", maxWidth: "100%", maxHeight: 420, objectFit: "contain", background: "#f5f5f5" }} /><figcaption>Processed preview. The private original remains unchanged.</figcaption></figure>
      <fieldset><legend>Human review checklist</legend>{inventoryMediaReviewChecklist.map((key) => <label key={key} style={{ display: "block", margin: "6px 0" }}><input type="checkbox" checked={Boolean(checks[key])} onChange={(event) => setChecks((current) => ({ ...current, [key]: event.currentTarget.checked }))} /> {checklistLabels[key]}</label>)}</fieldset>
      <button type="button" disabled={!ready || busy} onClick={() => submitReview("approved")}>{busy ? "Saving…" : "Approve and add to gallery"}</button>
      <button type="button" disabled={busy} onClick={() => submitReview("rejected")}>Reject and keep private</button>
    </>}
    {!derivativeId && <button type="button" disabled={!file || busy} onClick={uploadAndProcess}>{busy ? "Processing…" : "Upload and prepare preview"}</button>}
    {message && <p role="status">{message}</p>}
  </section>;
}
