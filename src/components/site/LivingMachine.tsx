"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export type LivingMachineLayerName = "background" | "ground" | "body" | "boom" | "stick" | "bucket" | "shadow";

export type LivingMachineConfig = {
  /** Scene beats are normalized against the full pinned scene scroll range. */
  progress: { restingUntil: number; boomStarts: number; stickStarts: number; bucketStarts: number; finish: number };
  mobileBreakpoint: number;
  poses: { resting: { boom: number; stick: number; bucket: number }; final: { boom: number; stick: number; bucket: number } };
  pivots: { boom: { x: number; y: number }; stick: { x: number; y: number }; bucket: { x: number; y: number } };
  scene: {
    scrollLengthVh: number;
    frameHeightVh: number;
  };
};

export const defaultLivingMachineConfig: LivingMachineConfig = {
  progress: { restingUntil: 0.2, boomStarts: 0.35, stickStarts: 0.55, bucketStarts: 0.75, finish: 1 },
  mobileBreakpoint: 700,
  poses: { resting: { boom: 0, stick: 0, bucket: 0 }, final: { boom: -26, stick: 18, bucket: -26 } },
  pivots: { boom: { x: 44, y: 50 }, stick: { x: 50, y: 8 }, bucket: { x: 18, y: 5 } },
  scene: { scrollLengthVh: 180, frameHeightVh: 80 },
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
  presentation?: "scene" | "backdrop";
  progressScope?: "scene" | "homepage";
};

const layerOrder: readonly LivingMachineLayerName[] = ["background", "ground", "shadow", "body", "boom", "stick", "bucket"];

/** Scroll-linked renderer boundary. Artwork and pose configuration can change without changing the homepage. */
export function LivingMachine({ source, config = defaultLivingMachineConfig, presentation = "scene", progressScope = "scene" }: LivingMachineProps) {
  const sceneRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneStartRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [staticMode, setStaticMode] = useState(false);

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
        sceneStartRef.current ??= rect.top + window.scrollY;
        const frameHeight = scene.querySelector<HTMLElement>(".living-machine__frame")?.clientHeight ?? window.innerHeight;
        const scope = progressScope === "homepage" ? scene.closest<HTMLElement>(".home-page") : null;
        const homepageStart = progressScope === "homepage" && scope
          ? scope.getBoundingClientRect().top + window.scrollY
          : 0;
        const travel = progressScope === "homepage" && scope
          ? Math.max(1, document.documentElement.scrollHeight - window.innerHeight - homepageStart)
          : Math.max(1, scene.offsetHeight - frameHeight);
        const start = progressScope === "homepage" && scope
          ? homepageStart
          : (sceneStartRef.current ?? 0);
        const rawProgress = Math.min(1, Math.max(0, (window.scrollY - start) / travel));
        const normalized = rawProgress <= config.progress.restingUntil ? 0 : rawProgress;
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
  }, [config.progress, progressScope, staticMode]);

  useEffect(() => {
    if (!source || (source.kind !== "canvas" && source.kind !== "webgl") || !canvasRef.current) return;
    return source.mount(canvasRef.current);
  }, [source]);

  const pose = (part: "boom" | "stick" | "bucket", start: number) => {
    const localProgress = Math.max(0, Math.min(1, (progress - start) / (config.progress.finish - start)));
    const from = config.poses.resting[part];
    return from + (config.poses.final[part] - from) * localProgress;
  };
  const layerStyle = (part: "boom" | "stick" | "bucket"): CSSProperties => ({
    "--layer-angle": `${staticMode ? 0 : pose(part, config.progress[`${part}Starts`])}deg`,
    "--layer-pivot-x": `${config.pivots[part].x}%`,
    "--layer-pivot-y": `${config.pivots[part].y}%`,
  } as CSSProperties);

  return <figure ref={sceneRef} className={`living-machine${presentation === "backdrop" ? " living-machine--backdrop" : ""}${staticMode ? " living-machine--static" : ""}`} style={{ "--scene-length": `${config.scene.scrollLengthVh}vh`, "--scene-frame": `${config.scene.frameHeightVh}vh` } as CSSProperties} aria-hidden={presentation === "backdrop" ? true : undefined} aria-label={presentation === "scene" ? source?.alt ?? "Temporary illustrated excavator for the Living Machine prototype" : undefined}>
    <div className="living-machine__frame">
    {!source && <div className="living-machine__placeholder" aria-hidden="true">
      <span className="living-machine__sun" />
      <svg className="living-machine__art" viewBox="0 0 1000 600" role="presentation" aria-hidden="true">
        <path d="M0 460H1000" stroke="#cec8bf" strokeWidth="3" />
        <ellipse cx="430" cy="500" rx="270" ry="34" fill="#c7c1b8" opacity=".55" />
        <path d="M210 428h398a66 66 0 0 1 0 132H210a66 66 0 0 1 0-132Z" fill="#44423e" />
        <path d="M235 447h350a47 47 0 0 1 0 94H235a47 47 0 0 1 0-94Z" fill="#77736d" />
        <path d="M246 449v90m37-92v94m37-94v94m37-94v94m37-94v94m37-94v94m37-94v94m37-94v94m37-94v94" stroke="#514d47" strokeWidth="9" />
        <path d="m294 420 32-112 82-42 205 20 51 61-10 73Z" fill="#ed760b" />
        <path d="m373 307 31-36 123 9 30 47H376Z" fill="#f4a13c" />
        <g className="living-machine__boom" transform={`translate(430 300) rotate(${staticMode ? 0 : pose("boom", config.progress.boomStarts)})`}>
          <path d="M0 0 20-18 43-8 156-290 112-306Z" fill="#f18318" stroke="#d76306" strokeWidth="8" strokeLinejoin="round" />
          <path d="m21-32 98-244" stroke="#ffba60" strokeWidth="10" strokeLinecap="round" />
          <g className="living-machine__stick" transform={`translate(156 -290) rotate(${staticMode ? 0 : pose("stick", config.progress.stickStarts)})`}>
            <path d="M0 0 37 7 164 320 123 339Z" fill="#ed7a0e" stroke="#d76306" strokeWidth="8" strokeLinejoin="round" />
            <path d="m28 34 111 274" stroke="#ffba60" strokeWidth="9" strokeLinecap="round" />
            <g className="living-machine__bucket" transform={`translate(128 320) rotate(${staticMode ? 0 : pose("bucket", config.progress.bucketStarts)})`}>
              <path d="m0 0 39 12 45 55-18 68-39-5 15-53-39-28Z" fill="#48443e" stroke="#302d29" strokeWidth="7" strokeLinejoin="round" />
            </g>
          </g>
        </g>
        <circle cx="430" cy="297" r="17" fill="#4d4943" /><circle cx="430" cy="297" r="7" fill="#f6a344" />
        <circle cx="585" cy="316" r="12" fill="#4d4943" /><circle cx="585" cy="316" r="5" fill="#f6a344" />
      </svg>
      <span className="living-machine__placeholder-label">Temporary illustration · not an HGR machine</span>
    </div>}
    {source?.kind === "static-image" && <img className="living-machine__static" src={source.src} alt={source.alt} loading="lazy" decoding="async" />}
    {source?.kind === "layered-image" && <div className="living-machine__layers" aria-hidden="true">{layerOrder.map((layer) => source.assets[layer] && <img key={layer} className={`living-machine__layer living-machine__layer--${layer}`} style={layer === "boom" || layer === "stick" || layer === "bucket" ? layerStyle(layer) : undefined} src={source.assets[layer]} alt="" loading="lazy" decoding="async" />)}</div>}
    {source?.kind === "frame-sequence" && <img className="living-machine__static" src={source.frames[0] ?? ""} alt={source.alt} loading="lazy" decoding="async" />}
    {source?.kind === "video" && <video className="living-machine__static" src={source.src} poster={source.poster} muted playsInline preload="none" aria-label={source.alt} />}
    {(source?.kind === "canvas" || source?.kind === "webgl") && <canvas ref={canvasRef} className="living-machine__static" aria-label={source.alt} />}
    <div className="living-machine__progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
    </div>
  </figure>;
}
