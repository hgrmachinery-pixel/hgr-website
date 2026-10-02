"use client";

import { useState } from "react";
import { useDocumentInfo } from "@payloadcms/ui";

export function CopyMachineLink() {
  const { initialData } = useDocumentInfo();
  const [message, setMessage] = useState("");
  const slug = typeof initialData?.slug === "string" ? initialData.slug : "";
  const base = process.env.NEXT_PUBLIC_SERVER_URL;
  if (!slug || !base) return null;
  const url = new URL(`/machines/${encodeURIComponent(slug)}`, base).toString();

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Machine link copied.");
    } catch {
      setMessage("Copy was blocked by this browser. Select the link below to copy it.");
    }
  }

  return <div className="copy-machine-link"><button type="button" onClick={copy}>Copy Machine Link</button><input aria-label="Public machine link" readOnly value={url} onFocus={(event) => event.currentTarget.select()} /><span role="status">{message}</span></div>;
}
