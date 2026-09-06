import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";

/**
 * Animation: ring-sweep
 * Trigger: mount and on every value change
 * Duration: 700ms  Easing: entrance
 * Properties: stroke-dashoffset (SVG geometry — no layout, and there is no
 *   transform-based way to draw a partial arc)
 * Stagger: n/a
 * Reduced motion: the arc renders at its final offset with no sweep.
 *
 * Starts at 12 o'clock and sweeps clockwise. The track is inset-shadowed to
 * read as a machined channel, and the arc carries a soft bloom in its own hue.
 *
 * Accessibility: `role="progressbar"` derives its accessible name from aria
 * attributes and drops descendant content from the accessibility tree, so it
 * lives on an inner wrapper around the svg ONLY. `children` (the visible
 * readout) stay outside it and remain readable by assistive tech.
 */
export function ProgressRing({
  value,
  size = 148,
  stroke = 12,
  progressClassName = "stroke-primary",
  trackClassName = "stroke-border",
  label = "Progress",
  children,
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  progressClassName?: string;
  trackClassName?: string;
  /** Accessible name for the progressbar. */
  label?: string;
  children?: ReactNode;
}) {
  const a = useAnimationConfig();
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped / 100);

  return (
    <div
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
    >
      {/* Ambient bloom behind the ring: gives the readout a lit-instrument
          quality that a flat stroke cannot. Purely decorative. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[12%] rounded-full bg-primary/[0.07] blur-xl"
      />
      {/* The progressbar wraps the svg alone. `grid place-items-center` is
          inherited from the parent for the wrapper itself; the wrapper is
          `grid` too so the svg stays centred inside it. */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="grid place-items-center"
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden="true"
          focusable="false"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            className={trackClassName}
            opacity={0.55}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className={cn(
              "transition-[stroke-dashoffset] ease-entrance",
              a.reduced ? "duration-0" : "duration-page",
              progressClassName,
            )}
            style={{
              filter: "drop-shadow(0 0 6px rgb(var(--c-primary) / 0.45))",
            }}
          />
        </svg>
      </div>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
