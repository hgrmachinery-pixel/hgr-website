"use client";

import { useState } from "react";

export type MachineVideoSource =
  | { kind: "youtube"; embedUrl: string }
  | { kind: "self-hosted"; url: string; poster?: string }
  | { kind: "ai-walkthrough"; url: string; poster?: string };

export function MachineVideo({ src, title, futureSource }: { src?: string; title: string; futureSource?: MachineVideoSource }) {
  const [playing, setPlaying] = useState(false);
  const youtubeSrc = src ?? (futureSource?.kind === "youtube" ? futureSource.embedUrl : undefined);
  return <section id="machine-video" className="machine-video" data-inspection-area aria-labelledby="machine-video-title"><p className="eyebrow">Moving images</p><h2 id="machine-video-title">Video walkthrough</h2>
    {youtubeSrc ? <>
      {playing ? <iframe title={`${title} video`} src={youtubeSrc} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /> : <button className="machine-video__load" type="button" onClick={() => setPlaying(true)}>Load YouTube video for {title}</button>}
    </> : <div className="machine-video__placeholder"><span aria-hidden="true">▶</span><p>{futureSource ? "This video source is reserved for a future player." : "No video walkthrough has been added for this machine."}</p></div>}
  </section>;
}
