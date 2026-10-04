import type { ReactNode } from "react";

/**
 * Media boundary for the homepage Living Machine. Future renderers can be
 * supplied without changing the homepage layout or its content hierarchy.
 * The current Wave 1 renderer is deliberately static and has no client JS.
 */
export type LivingMachineSource =
  | { kind: "static-image"; src: string; alt: string }
  | { kind: "layered-image"; layers: readonly { src: string; alt: string }[] }
  | { kind: "video"; src: string; poster?: string; alt: string }
  | { kind: "ai-frames"; frames: readonly string[]; alt: string }
  | { kind: "canvas"; render: (canvas: HTMLCanvasElement) => void }
  | { kind: "webgl"; render: (canvas: HTMLCanvasElement) => void };

type LivingMachineProps = {
  source?: LivingMachineSource;
  fallback?: ReactNode;
};

export function LivingMachine({ source, fallback }: LivingMachineProps) {
  if (!source) {
    return <div className="living-machine__empty" aria-label="Excavator image not available">
      <span className="living-machine__sun" aria-hidden="true" />
      <span className="living-machine__horizon" aria-hidden="true" />
      <span className="living-machine__label">A closer look at real machines</span>
    </div>;
  }

  if (source.kind === "static-image") {
    return <div className="living-machine__media"><img src={source.src} alt={source.alt} fetchPriority="high" /></div>;
  }

  // Later renderers can implement the remaining discriminated source types
  // behind this stable boundary. Keep the approved fallback visible meanwhile.
  return <div className="living-machine__media" aria-label="Machine media preview">{fallback}</div>;
}
