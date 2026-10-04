"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export type LivingMachineLayerName = "background" | "ground" | "body" | "boom" | "stick" | "bucket" | "shadow";

export type LivingMachineConfig = {
  /** Stable artwork-independent scroll scene settings. */
  progress: { start: number; holdUntil: number; finish: number };
  mobileBreakpoint: number;
  poses: {
    resting: { boom: number; stick: number; bucket: number };
    working: { boom: number; stick: number; bucket: number };
  };
};

export const defaultLivingMachineConfig: LivingMachineConfig = {
  progress: { start: 0.2, holdUntil: 0.2, finish: 0.9 },
  mobileBreakpoint: 700,
  // SVG transform angles in degrees, tuned later against the approved HGR cutout.
  poses: {
    resting: { boom: 0, stick: 0, bucket: 0 },
    working: { boom: -18, stick: 9, bucket: -6 },
  },
};

export type LivingMachineAssets = Partial<Record<LivingMachineLayerName, string>>;
export type LivingMachineSource =
  | { kind: "static-image"; src: string; alt: string }
  | { kind: "layered-image"; assets: LivingMachineAssets; alt: string }
  | { kind: "frame-sequence"; frames: readonly string[]; alt: string }
  | { kind: "video"; src: string; poster?: string; alt: string }
  | { kind: "canvas" | "webgl"; alt: string; mount: (canvas: HTMLCanvasElement) => () => void };

type LivingMachineProps = {
  source?: LivingMachineSource;
  config?: LivingMachineConfig;
};

const layerOrder: readonly LivingMachineLayerName[] = ["background", "ground", "shadow", "body", "boom", "stick", "bucket"];

/** Scroll-linked renderer boundary. Artwork and pose configuration can change without changing the homepage. */
export function LivingMachine({ source, config = defaultLivingMachineConfig }: LivingMachineProps) {
  const sceneRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [staticMode, setStaticMode] = useState(true);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMode = () => setStaticMode(reduceMotion.matches || window.innerWidth <= config.mobileBreakpoint);
    updateMode();
    reduceMotion.addEventListener("change", updateMode);
    window.addEventListener("resize", updateMode, { passive: true });
    return () => {
      reduceMotion.removeEventListener("change", updateMode);
      window.removeEventListener("resize", updateMode);
    };
  }, [config.mobileBreakpoint]);

  useEffect(() => {
    if (staticMode || !sceneRef.current) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scene = sceneRef.current;
        if (!scene) return;
        const rect = scene.getBoundingClientRect();
        const travel = Math.max(1, scene.offsetHeight - window.innerHeight);
        const raw = Math.min(1, Math.max(0, -rect.top / travel));
        const { start, holdUntil, finish } = config.progress;
        const normalized = raw <= holdUntil ? 0 : Math.min(1, Math.max(0, (raw - start) / Math.max(0.01, finish - start)));
        setProgress(normalized);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [config.progress, staticMode]);

  useEffect(() => {
    if (!source || (source.kind !== "canvas" && source.kind !== "webgl") || !canvasRef.current) return;
    return source.mount(canvasRef.current);
  }, [source]);

  const pose = (part: "boom" | "stick" | "bucket") => {
    const from = config.poses.resting[part];
    return from + (config.poses.working[part] - from) * progress;
  };

  return <figure ref={sceneRef} className="living-machine" aria-label={source?.alt ?? "Placeholder excavator scene for local design review"}>
    {!source && <div className="living-machine__placeholder" aria-hidden="true">
      <span className="living-machine__sun" />
      <span className="living-machine__ground" />
      <span className="living-machine__shadow" />
      <span className="living-machine__track" />
      <span className="living-machine__body" />
      <span className="living-machine__boom" style={{ "--boom-angle": `${staticMode ? 0 : pose("boom")}deg` } as CSSProperties} />
      <span className="living-machine__stick" style={{ "--stick-angle": `${staticMode ? 0 : pose("stick")}deg` } as CSSProperties} />
      <span className="living-machine__bucket" style={{ "--bucket-angle": `${staticMode ? 0 : pose("bucket")}deg` } as CSSProperties} />
      <span className="living-machine__placeholder-label">Temporary illustration · not an HGR machine</span>
    </div>}
    {source?.kind === "static-image" && <img className="living-machine__static" src={source.src} alt={source.alt} loading="lazy" decoding="async" />}
    {source?.kind === "layered-image" && <div className="living-machine__layers" aria-hidden="true">{layerOrder.map((layer) => source.assets[layer] && <img key={layer} className={`living-machine__layer living-machine__layer--${layer}`} src={source.assets[layer]} alt="" loading="lazy" decoding="async" />)}</div>}
    {source?.kind === "frame-sequence" && <img className="living-machine__static" src={source.frames[0] ?? ""} alt={source.alt} loading="lazy" decoding="async" />}
    {source?.kind === "video" && <video className="living-machine__static" src={source.src} poster={source.poster} muted playsInline preload="none" aria-label={source.alt} />}
    {(source?.kind === "canvas" || source?.kind === "webgl") && <canvas ref={canvasRef} className="living-machine__static" aria-label={source.alt} />}
  </figure>;
}
