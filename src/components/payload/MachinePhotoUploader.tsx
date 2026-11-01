"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import { useCallback, useEffect, useRef, useState } from "react";

import { MACHINE_PHOTO_CATEGORIES, MACHINE_PHOTO_CATEGORY_LABELS, PHOTO_REVIEW_CHECKLIST, machinePhotoUploadFailure, measuredUploadProgress, planImageBatch, runBounded, type MachinePhotoCategory, type PhotoReviewChecklist } from "@/lib/machines/media";

type ReviewAnswer = "clear" | "found" | "uncertain" | "";
type Status = "queued" | "uploading" | "processing" | "needs-review" | "approved" | "failed";
type QueueItem = {
  id: string;
  file: File;
  status: Status;
  progress: number;
  progressKnown: boolean;
  category: MachinePhotoCategory;
  altText: string;
  masterId?: string | number;
  derivativeId?: string | number;
  derivativeFilename?: string;
  digest?: string;
  error?: string;
  failureStage?: "upload" | "processing";
  review: Partial<Record<keyof PhotoReviewChecklist, ReviewAnswer>>;
  redactions: Array<{ left: number; top: number; width: number; height: number }>;
  dragStart?: { x: number; y: number };
  draftRegion?: { left: number; top: number; width: number; height: number };
};

const checklistLabel: Record<keyof PhotoReviewChecklist, string> = {
  manufacturerSerialNumbers: "Manufacturer serial numbers",
  chassisVinNumbers: "Chassis / VIN numbers",
  engineNumbers: "Engine numbers",
  registrationNumbers: "Registration numbers",
  qrCodes: "QR codes",
  barcodes: "Barcodes",
  customerLabels: "Customer labels",
  deliveryInformation: "Delivery information",
  personalInformation: "Personal information",
  otherSensitiveIdentifiers: "Other sensitive identifiers",
};

function humanError(value: unknown) {
  return value instanceof Error ? value.message : "The upload could not be completed.";
}

function PreviewImage({ file, alt, style }: { file: File; alt: string; style?: React.CSSProperties }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url ? <img src={url} alt={alt} style={style} /> : <span aria-hidden="true">Preparing preview…</span>;
}

const statusLabel: Record<Status, string> = {
  queued: "Queued",
  uploading: "Uploading",
  processing: "Processing",
  "needs-review": "Needs review",
  approved: "Approved",
  failed: "Failed",
};

export function MachinePhotoUploader() {
  const { id: machineId, collectionSlug } = useDocumentInfo();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [category, setCategory] = useState<MachinePhotoCategory>("general-exterior");
  const [limits, setLimits] = useState<{ perFileBytes: number; batchBytes: number }>();
  const [limitError, setLimitError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef(queue);
  queueRef.current = queue;

  useEffect(() => {
    if (!machineId || collectionSlug !== "machines") return;
    fetch("/api/machine-media/limits", { credentials: "same-origin", cache: "no-store" })
      .then(async (response) => {
        const value = await response.json();
        if (!response.ok) throw new Error(value.error || "Photo upload limits are unavailable");
        setLimits(value);
      })
      .catch((error) => setLimitError(humanError(error)));
  }, [machineId, collectionSlug]);

  const update = useCallback((id: string, change: Partial<QueueItem>) => {
    setQueue((current) => current.map((item) => item.id === id ? { ...item, ...change } : item));
  }, []);

  const process = useCallback(async (item: QueueItem, redactions: QueueItem["redactions"] = []) => {
    if (!item.masterId) throw new Error("The private source master is missing");
    const response = await fetch("/api/machine-media/process", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        "Content-Type": item.file.type,
        "X-HGR-Machine-Photo-Master": String(item.masterId),
        ...(redactions.length ? { "X-HGR-Redactions": JSON.stringify(redactions) } : {}),
      },
      body: item.file,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Image processing failed");
    update(item.id, { derivativeId: result.derivativeId, derivativeFilename: result.filename, digest: result.digest, status: "needs-review", progress: 100, progressKnown: true, error: undefined, failureStage: undefined, review: {}, redactions: [] });
  }, [update]);

  const upload = useCallback(async (item: QueueItem, retry = false) => {
    let failureStage: QueueItem["failureStage"] = "upload";
    try {
      if (retry && item.masterId) {
        failureStage = "processing";
        update(item.id, { status: "processing", error: undefined });
        await process(item, item.redactions);
        return;
      }
      update(item.id, { status: "uploading", progress: 0, error: undefined });
      const form = new FormData();
      form.append("_payload", JSON.stringify({ machine: machineId, category: item.category, altText: item.altText }));
      form.append("file", item.file, item.file.name);
      const created = await new Promise<{ id: string | number }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/machine-media", true);
        xhr.withCredentials = true;
        xhr.upload.addEventListener("progress", (event) => {
          const progress = measuredUploadProgress(event.loaded, event.total, event.lengthComputable);
          if (progress !== undefined) update(item.id, { progress, progressKnown: true });
        });
        xhr.addEventListener("load", () => {
          if (xhr.status < 200 || xhr.status >= 300) return reject(new Error(machinePhotoUploadFailure(xhr.status, xhr.responseText)));
          try {
            const json = JSON.parse(xhr.responseText);
            const doc = json.doc ?? json;
            if (doc?.id === undefined) return reject(new Error("Payload did not return the saved master ID"));
            resolve(doc);
          } catch { reject(new Error("Payload returned an unreadable upload response")); }
        });
        xhr.addEventListener("error", () => reject(new Error("Network error while uploading this image")));
        xhr.addEventListener("abort", () => reject(new Error("Upload was cancelled")));
        xhr.send(form);
      });
      update(item.id, { masterId: created.id, status: "processing", progress: 99, progressKnown: true });
      failureStage = "processing";
      await process({ ...item, masterId: created.id });
    } catch (error) {
      update(item.id, { status: "failed", error: humanError(error), failureStage });
    }
  }, [machineId, process, update]);

  const addFiles = async (files: FileList | null) => {
    if (!files || !limits || !machineId) return;
    const selected = Array.from(files);
    try {
      planImageBatch(selected, 1, {
        HGR_MACHINE_PHOTO_MAX_FILE_BYTES: String(limits.perFileBytes),
        HGR_MACHINE_PHOTO_MAX_BATCH_BYTES: String(limits.batchBytes),
      });
    } catch (error) {
      setLimitError(humanError(error));
      return;
    }
    setLimitError("");
    const rows: QueueItem[] = selected.map((file) => ({
      id: crypto.randomUUID(), file, status: "queued", progress: 0, progressKnown: false, category, altText: "", review: {}, redactions: [],
    }));
    setQueue((current) => [...current, ...rows]);
    await runBounded(rows, 1, (item) => upload(item));
    if (inputRef.current) inputRef.current.value = "";
  };

  const setReviewAnswer = (item: QueueItem, key: keyof PhotoReviewChecklist, answer: ReviewAnswer) =>
    update(item.id, { review: { ...item.review, [key]: answer } });

  const submitReview = async (item: QueueItem) => {
    const checklist = Object.fromEntries(PHOTO_REVIEW_CHECKLIST.map((key) => [key, item.review[key]])) as Partial<PhotoReviewChecklist>;
    const uncertain = PHOTO_REVIEW_CHECKLIST.some((key) => checklist[key] === "uncertain");
    const found = PHOTO_REVIEW_CHECKLIST.some((key) => checklist[key] === "found");
    if (uncertain) return update(item.id, { error: "Keep this photo private and escalate the uncertainty to the Owner." });
    if (found) {
      if (!item.redactions.length) return update(item.id, { error: "Add a blur area around every sensitive identifier, then process a new revision." });
      update(item.id, { status: "processing", error: undefined });
      return process(item, item.redactions).catch((error) => update(item.id, { status: "failed", error: humanError(error), failureStage: "processing" }));
    }
    if (PHOTO_REVIEW_CHECKLIST.some((key) => checklist[key] !== "clear")) return update(item.id, { error: "Complete every review item before approval." });
    const response = await fetch("/api/machine-media/review", {
      method: "POST", credentials: "same-origin", cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.derivativeId, digest: item.digest, checklist }),
    });
    const result = await response.json();
    if (!response.ok) return update(item.id, { error: result.error || "Review could not be saved." });
    update(item.id, { status: "approved", error: undefined });
  };

  const saveAltText = async (item: QueueItem) => {
    if (item.derivativeId === undefined) return;
    const response = await fetch(`/api/machine-media/${item.derivativeId}`, {
      method: "PATCH", credentials: "same-origin", cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ altText: item.altText }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      return update(item.id, { error: result.errors?.[0]?.message || "Alternative text could not be saved." });
    }
    update(item.id, { error: undefined });
  };

  const beginRedaction = (item: QueueItem, event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    event.currentTarget.setPointerCapture(event.pointerId);
    update(item.id, { dragStart: { x, y }, draftRegion: { left: x, top: y, width: 0, height: 0 } });
  };
  const moveRedaction = (item: QueueItem, event: React.PointerEvent<HTMLDivElement>) => {
    if (!item.dragStart) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    update(item.id, { draftRegion: { left: Math.min(x, item.dragStart.x), top: Math.min(y, item.dragStart.y), width: Math.abs(x - item.dragStart.x), height: Math.abs(y - item.dragStart.y) } });
  };
  const endRedaction = (item: QueueItem) => {
    const region = item.draftRegion;
    if (region && region.width > 0.01 && region.height > 0.01) update(item.id, { redactions: [...item.redactions, region], draftRegion: undefined, dragStart: undefined });
    else update(item.id, { draftRegion: undefined, dragStart: undefined });
  };

  const busy = queue.some((item) => item.status === "uploading" || item.status === "processing");

  if (collectionSlug !== "machines" || !machineId) return null;
  return (
    <section className="hgr-photo-manager" aria-label="Machine photo manager">
      <header className="hgr-photo-manager__header">
        <div>
          <p className="hgr-photo-manager__eyebrow">Inventory photos</p>
          <h3>Machine photos</h3>
          <p>Uploads are kept as private originals. Processed versions stay private until human review and machine publication.</p>
        </div>
        <span className="hgr-photo-manager__count" aria-live="polite">{queue.length} {queue.length === 1 ? "photo" : "photos"}</span>
      </header>
      <div className="hgr-photo-manager__controls">
        <label className="hgr-photo-manager__field">
          <span>Category for new photos</span>
          <select value={category} onChange={(event) => setCategory(event.target.value as MachinePhotoCategory)}>
            {MACHINE_PHOTO_CATEGORIES.map((value) => <option key={value} value={value}>{MACHINE_PHOTO_CATEGORY_LABELS[value]}</option>)}
          </select>
        </label>
        <label className="hgr-photo-manager__picker">
          <span>Add photos</span>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={!limits || busy} onChange={(event) => void addFiles(event.currentTarget.files)} />
          {!limits && !limitError && <small>Checking upload limits…</small>}
          {busy && <small>Wait for the current photo to finish before adding another batch.</small>}
        </label>
      </div>
      {limitError && <p className="hgr-photo-manager__alert" role="alert">{limitError}</p>}
      {queue.length === 0 ? <div className="hgr-photo-manager__empty">Choose a category, then add the machine photos you want to prepare.</div> :
      <ol className="hgr-photo-queue" tabIndex={0} aria-label="Machine photo queue. Scroll to review all photos.">
        {queue.map((item) => <li key={item.id} className="hgr-photo-card">
          <div className="hgr-photo-card__preview">
            <PreviewImage file={item.file} alt={`Local preview of ${item.file.name}`} />
          </div>
          <div className="hgr-photo-card__body">
            <div className="hgr-photo-card__topline">
              <div className="hgr-photo-card__identity">
                <strong title={item.file.name}>{item.file.name}</strong>
                <span className="hgr-photo-category">{MACHINE_PHOTO_CATEGORY_LABELS[item.category]}</span>
              </div>
              <span className={`hgr-photo-status hgr-photo-status--${item.status}`} role="status" aria-live="polite">{statusLabel[item.status]}</span>
            </div>
            {(item.status === "uploading" || item.status === "processing") && <div className="hgr-photo-progress">
              <progress aria-label={`${statusLabel[item.status]} ${item.file.name}`} max={100} value={item.status === "processing" ? undefined : item.progressKnown ? item.progress : undefined} />
              <span>{item.status === "processing" ? "Preparing a review copy…" : item.progressKnown ? `${item.progress}% uploaded` : "Uploading photo…"}</span>
            </div>}
            {item.status === "failed" && <div className="hgr-photo-card__error" role="alert">
              <strong>{item.failureStage === "processing" ? "Image processing failed" : "Master photo upload failed"}</strong>
              <p>{item.error || "The request failed without an explanation."}</p>
              <button type="button" onClick={() => void upload(item, true)}>{item.masterId ? "Retry processing" : "Retry upload"}</button>
            </div>}
              {item.status === "needs-review" && <>
                {item.derivativeFilename && <figure className="hgr-photo-review-preview">
                  <img src={`/api/machine-media/file/${encodeURIComponent(item.derivativeFilename)}`} alt="Processed photo for human review" />
                  <figcaption>Review copy · private pending approval</figcaption>
                </figure>}
                <details className="hgr-photo-review">
                  <summary>Review image and approval checklist</summary>
                  <p>Check the exact processed photo. Sensitive details must be blurred and reviewed again.</p>
                  <label className="hgr-photo-manager__field">Factual alternative text
                  <input value={item.altText} maxLength={250} onChange={(event) => update(item.id, { altText: event.target.value })} placeholder="Describe only what is visible" />
                  <small>Do not infer machine specifications or identifiers.</small>
                  </label>
                  <button type="button" onClick={() => void saveAltText(item)}>Save alternative text</button>
                  <div className="hgr-photo-review__checklist">
                    {PHOTO_REVIEW_CHECKLIST.map((key) => <label key={key}>{checklistLabel[key]} <select value={item.review[key] ?? ""} onChange={(event) => setReviewAnswer(item, key, event.target.value as ReviewAnswer)}>
                      <option value="">Choose…</option><option value="clear">Checked — clear</option><option value="found">Sensitive item found</option><option value="uncertain">Uncertain — ask Owner</option>
                    </select></label>)}
                  </div>
                {PHOTO_REVIEW_CHECKLIST.some((key) => item.review[key] === "found") && <>
                  <p>Drag over each sensitive identifier to blur it, then process a new revision.</p>
                  <div className="hgr-photo-redaction" onPointerDown={(event) => beginRedaction(item, event)} onPointerMove={(event) => moveRedaction(item, event)} onPointerUp={() => endRedaction(item)}>
                    <PreviewImage file={item.file} alt="Photo to redact; drag over sensitive information" />
                    {[...item.redactions, ...(item.draftRegion ? [item.draftRegion] : [])].map((box, index) => <span key={index} style={{ position: "absolute", left: `${box.left * 100}%`, top: `${box.top * 100}%`, width: `${box.width * 100}%`, height: `${box.height * 100}%`, background: "#111", opacity: 0.7, border: "2px solid #F86C00", pointerEvents: "none" }} />)}
                  </div>
                  {item.redactions.length > 0 && <button type="button" onClick={() => update(item.id, { redactions: item.redactions.slice(0, -1) })}>Undo last blur area</button>}
                </>}
                  {item.error && <p className="hgr-photo-manager__alert" role="alert">{item.error}</p>}
                  <button type="button" onClick={() => void submitReview(item)}>Submit human review</button>
                </details>
              </>}
            {item.status === "approved" && <p className="hgr-photo-card__approved">Human review approved. The image remains private until added to the machine’s public gallery and the machine is published.</p>}
          </div>
        </li>)}
      </ol>
      }
    </section>
  );
}
