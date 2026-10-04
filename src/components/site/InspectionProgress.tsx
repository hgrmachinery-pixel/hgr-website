"use client";

import { useState } from "react";

export type InspectionProgressArea = { id: string; label: string };

/** Tracks page sections that entered view in this visit; it is not a machine assessment. */
export function InspectionProgress({ areas }: { areas: InspectionProgressArea[] }) {
  const [viewed, setViewed] = useState<Set<string>>(() => new Set());

  function toggleViewed(id: string) {
    setViewed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return <nav className="inspection-progress" aria-label="Inspection sections">
    <div className="inspection-progress__heading"><div><p className="eyebrow">Your visit</p><h2>Inspection progress</h2></div><p aria-live="polite">{viewed.size} of {areas.length} viewed</p></div>
    <ol>{areas.map((area) => {
      const isViewed = viewed.has(area.id);
      return <li key={area.id}><a className="inspection-progress__link" href={`#${area.id}`}><span>{area.label}</span><span aria-hidden="true">↗</span></a><button className="inspection-progress__toggle" type="button" aria-pressed={isViewed} onClick={() => toggleViewed(area.id)}><span className="inspection-progress__mark" aria-hidden="true">{isViewed ? "✓" : ""}</span>{isViewed ? "Viewed" : "Mark viewed"}</button></li>;
    })}</ol>
    <p className="inspection-progress__note">Open a section, review it, then mark it viewed. Progress is temporary and is not a certification or condition assessment.</p>
  </nav>;
}
