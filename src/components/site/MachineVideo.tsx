"use client";

import { useState } from "react";

export function MachineVideo({ src, title }: { src?: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  if (!src) return null;
  return <section className="machine-video"><h2>Machine video</h2>
    {playing ? <iframe title={`${title} video`} src={src} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <button className="machine-video__load" type="button" onClick={() => setPlaying(true)}>Load YouTube video for {title}</button>}
  </section>;
}
