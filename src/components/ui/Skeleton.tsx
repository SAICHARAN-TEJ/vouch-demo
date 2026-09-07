import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Animation: skeleton-sweep
 * Trigger: mount, loops while the skeleton is on screen
 * Duration: 1500ms per pass  Easing: hover (symmetric, so the sweep has no
 *   perceptible start or end)
 * Properties: transform (translateX of a ::after sheen) — the block itself
 *   never animates, so there is no layout or paint churn
 * Stagger: 90ms per line in `SkeletonText`
 * Reduced motion: the sweep stops; the tinted block remains as a static
 *   placeholder, which still communicates "content is coming".
 *
 * Light system per spec §5: bg-surface-container block with a white sheen.
 *
 * Deliberately not a spinner. A spinner says "wait"; a skeleton says "here is
 * the shape of what you are about to read", which is the honest signal for an
 * app whose whole job is showing structured telemetry.
 */

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Tailwind height utility, e.g. "h-4". */
  height?: string;
  /** Tailwind width utility, e.g. "w-2/3". */
  width?: string;
  /** Corner treatment. */
  shape?: "cell" | "control" | "panel" | "pill";
  /**
   * Animation offset in ms, for staggering groups. Emitted as the
   * `--skeleton-delay` custom property, which the `.skeleton::after` rule in
   * src/index.css consumes — a plain inline `animationDelay` would not reach
   * the pseudo-element that actually carries the sweep.
   */
  delay?: number;
}

const SHAPE = {
  cell: "rounded-sharp",
  control: "rounded-control",
  panel: "rounded-panel",
  pill: "rounded-full",
} as const;

/** The custom property the `.skeleton::after` sweep reads its delay from. */
interface SkeletonStyle extends CSSProperties {
  "--skeleton-delay"?: string;
}

export function Skeleton({
  height = "h-4",
  width = "w-full",
  shape = "control",
  delay = 0,
  className,
  style,
  ...props
}: SkeletonProps) {
  /* The sweep animates `.skeleton::after`, and `animationDelay` on this
     wrapper cannot reach a pseudo-element — it was silently inert. Hand the
     offset down as a custom property instead; index.css consumes it as
     `animation-delay: var(--skeleton-delay, 0ms)`. */
  const delayStyle: SkeletonStyle = { ...style, "--skeleton-delay": `${delay}ms` };

  return (
    <div
      aria-hidden="true"
      className={cn("skeleton", SHAPE[shape], height, width, className)}
      style={delayStyle}
      {...props}
    />
  );
}

/**
 * A block of skeleton lines with a ragged last line, so it reads as prose
 * rather than a stack of identical bars.
 */
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ["w-full", "w-11/12", "w-4/5", "w-3/5"];
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="h-3"
          width={i === lines - 1 ? "w-3/5" : widths[i % widths.length]}
          shape="cell"
          delay={i * 90}
        />
      ))}
    </div>
  );
}

/**
 * Card-shaped placeholder: icon chip, two text lines, meter. Mirrors the real
 * card geometry so nothing jumps when data lands.
 */
export function SkeletonCard({
  className,
  meter = true,
}: {
  className?: string;
  meter?: boolean;
}) {
  return (
    <div
      className={cn("card p-4", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="flex items-center gap-3">
        <Skeleton height="h-11" width="w-11" shape="control" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton height="h-3.5" width="w-1/2" shape="cell" />
          <Skeleton height="h-2.5" width="w-3/4" shape="cell" delay={90} />
        </div>
      </div>
      {meter && (
        <Skeleton height="h-2" shape="pill" delay={180} className="mt-4" />
      )}
    </div>
  );
}
