import type { ReactNode } from "react";

/** Adds an opt-in motion hook; all content remains present without motion. */
export function MotionRegion({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`motion-region ${className}`.trim()} data-motion="optional">{children}</div>;
}
