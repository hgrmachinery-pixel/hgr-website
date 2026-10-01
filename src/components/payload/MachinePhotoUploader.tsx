"use client";

import { useDocumentInfo } from "@payloadcms/ui";
import { useCallback, useEffect, useRef, useState } from "react";

import { MACHINE_PHOTO_CATEGORIES, MACHINE_PHOTO_CATEGORY_LABELS, PHOTO_REVIEW_CHECKLIST, measuredUploadProgress, planImageBatch, runBounded, type MachinePhotoCategory, type PhotoReviewChecklist } from "@/lib/machines/media";

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
    update(item.id, { derivativeId: result.derivativeId, derivativeFilename: result.filename, digest: result.digest, status: "needs-review", progress: 100, progressKnown: true, error: undefined, review: {}, redactions: [] });
  }, [update]);

  const upload = useCallback(async (item: QueueItem, retry = false) => {
    try {
      if (retry && item.masterId) {
        update(item.id, { status: "processing", error: undefined });
        await process(item);
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
          if (xhr.status < 200 || xhr.status >= 300) return reject(new Error(`Master upload failed (${xhr.status})`));
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
      await process({ ...item, masterId: created.id });
    } catch (error) {
      update(item.id, { status: "failed", error: humanError(error) });
    }
  }, [machineId, process, update]);

  const addFiles = async (files: FileList | null) => {
    if (!files || !limits || !machineId) return;
    const selected = Array.from(files);
    try {
      planImageBatch(selected, 3, {
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
    await runBounded(rows, 3, (item) => upload(item));
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
      return process(item, item.redactions).catch((error) => update(item.id, { status: "failed", error: humanError(error) }));
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

  if (collectionSlug !== "machines" || !machineId) return null;
  return (
    <section style={{ border: "1px solid #E2E2E2", borderRadius: 8, padding: 16, margin: "12px 0", color: "#171717" }} aria-label="Machine photo uploader">
      <h3 style={{ margin: "0 0 8px" }}>Machine photos</h3>
      <p>Each photo is saved as a private master, processed separately, and begins as Needs Review.</p>
      <label style={{ display: "block", marginBottom: 8 }}>
        Photo category
        <select value={category} onChange={(event) => setCategory(event.target.value as MachinePhotoCategory)} style={{ display: "block", minHeight: 40, width: "100%", marginTop: 4 }}>
          {MACHINE_PHOTO_CATEGORIES.map((value) => <option key={value} value={value}>{MACHINE_PHOTO_CATEGORY_LABELS[value]}</option>)}
        </select>
      </label>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(event) => void addFiles(event.currentTarget.files)} />
      {limitError && <p role="alert">{limitError}</p>}
      <ol style={{ listStyle: "none", padding: 0, display: "grid", gap: 16 }}>
        {queue.map((item) => <li key={item.id} style={{ borderTop: "1px solid #E2E2E2", paddingTop: 12 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <PreviewImage file={item.file} alt="Local photo preview" style={{ width: 140, height: 100, objectFit: "cover", borderRadius: 4 }} />
            <div style={{ flex: "1 1 220px" }}>
              <strong>{item.file.name}</strong>
              <p>{MACHINE_PHOTO_CATEGORY_LABELS[item.category]} · {item.status === "needs-review" ? "Needs Review" : item.status}</p>
              {(item.status === "uploading" || item.status === "processing") && <progress aria-label={`Upload progress for ${item.file.name}`} max={100} value={item.progressKnown ? item.progress : undefined} style={{ width: "100%" }} />}
              {item.status === "uploading" && item.progress === 0 && <span>Uploading…</span>}
              {item.status === "processing" && <span>Processing image…</span>}
              {item.status === "failed" && <><p role="alert">{item.error}</p><button type="button" onClick={() => void upload(item, true)}>Retry this photo</button></>}
              {item.status === "needs-review" && <>
                {item.derivativeFilename && <figure style={{ margin: "12px 0" }}>
                  <img src={`/api/machine-media/file/${encodeURIComponent(item.derivativeFilename)}`} alt="Processed photo for human review" style={{ display: "block", width: "100%", maxWidth: 480, height: "auto" }} />
                  <figcaption>Review this processed version. It is private until approved and published.</figcaption>
                </figure>}
                <p>Review the exact photo for every item below. Sensitive details must be blurred and reviewed again.</p>
                <label style={{ display: "block", marginBottom: 8 }}>Factual alternative text
                  <input value={item.altText} maxLength={250} onChange={(event) => update(item.id, { altText: event.target.value })} placeholder="Describe only what is visible" style={{ display: "block", width: "100%", minHeight: 40 }} />
                  <small>Do not infer machine specifications or identifiers.</small>
                </label>
                <button type="button" onClick={() => void saveAltText(item)}>Save alternative text</button>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 6 }}>
                  {PHOTO_REVIEW_CHECKLIST.map((key) => <label key={key}>{checklistLabel[key]} <select value={item.review[key] ?? ""} onChange={(event) => setReviewAnswer(item, key, event.target.value as ReviewAnswer)}>
                    <option value="">Choose…</option><option value="clear">Checked — clear</option><option value="found">Sensitive item found</option><option value="uncertain">Uncertain — ask Owner</option>
                  </select></label>)}
                </div>
                {PHOTO_REVIEW_CHECKLIST.some((key) => item.review[key] === "found") && <>
                  <p>Drag over each sensitive identifier to blur it, then process a new revision.</p>
                  <div onPointerDown={(event) => beginRedaction(item, event)} onPointerMove={(event) => moveRedaction(item, event)} onPointerUp={() => endRedaction(item)} style={{ position: "relative", maxWidth: 480, touchAction: "none", cursor: "crosshair" }}>
                    <PreviewImage file={item.file} alt="Photo to redact; drag over sensitive information" style={{ display: "block", width: "100%", height: "auto" }} />
                    {[...item.redactions, ...(item.draftRegion ? [item.draftRegion] : [])].map((box, index) => <span key={index} style={{ position: "absolute", left: `${box.left * 100}%`, top: `${box.top * 100}%`, width: `${box.width * 100}%`, height: `${box.height * 100}%`, background: "#111", opacity: 0.7, border: "2px solid #F86C00", pointerEvents: "none" }} />)}
                  </div>
                  {item.redactions.length > 0 && <button type="button" onClick={() => update(item.id, { redactions: item.redactions.slice(0, -1) })}>Undo last blur area</button>}
                </>}
                <button type="button" onClick={() => void submitReview(item)}>Submit human review</button>
                {item.error && <p role="alert">{item.error}</p>}
              </>}
              {item.status === "approved" && <p>Human review approved. The image remains private until added to the machine’s public gallery and the machine is published.</p>}
            </div>
          </div>
        </li>)}
      </ol>
    </section>
  );
}
