import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";

/**
 * Animation: confidence-fill
 * Trigger: mount and on every value change
 * Duration: 600ms  Easing: entrance
 * Properties: transform (scaleX from a left origin) — not width, so the fill
 *   is composited and never triggers layout
 * Stagger: n/a
 * Reduced motion: the bar renders at its final length immediately.
 *
 * A leading edge cap sits at the tip of the fill so the meter reads as a live
 * instrument rather than a static bar.
 */

type Tone = "primary" | "justified" | "caution" | "danger" | "info";

const CAP: Record<Tone, string> = {
  primary: "shadow-[0_0_12px_-1px_rgb(var(--c-primary)/0.55)]",
  justified: "shadow-[0_0_12px_-1px_rgb(var(--c-justified)/0.55)]",
  caution: "shadow-[0_0_12px_-1px_rgb(var(--c-caution)/0.55)]",
  danger: "shadow-[0_0_12px_-1px_rgb(var(--c-danger)/0.55)]",
  info: "shadow-[0_0_12px_-1px_rgb(var(--c-info)/0.55)]",
};

/**
 * The fill is darkest at its base and brightest at the tip, so the leading edge
 * reads as the live value. A gradient does this without an extra element and
 * without being distorted by scaleX, which a positioned cap would be.
 */
const GRADIENT: Record<Tone, string> = {
  primary: "bg-gradient-to-r from-primary/45 to-primary",
  justified: "bg-gradient-to-r from-justified/45 to-justified",
  caution: "bg-gradient-to-r from-caution/45 to-caution",
  danger: "bg-gradient-to-r from-danger/45 to-danger",
  info: "bg-gradient-to-r from-info/45 to-info",
};

/** Horizontal 0..1 confidence meter with an animated fill and a % readout. */
export function ConfidenceBar({
  value,
  tone = "primary",
  label = "Confidence",
  showValue = true,
  className,
}: {
  value: number; // 0..1
  tone?: Tone;
  label?: string;
  showValue?: boolean;
  className?: string;
}) {
  const a = useAnimationConfig();
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  const [shown, setShown] = useState(a.reduced ? pct : 0);

  useEffect(() => {
    if (a.reduced) {
      setShown(pct);
      return;
    }
    /* Double rAF. A single frame is not reliably enough for the browser to
       paint the 0 state before the target lands, which makes the bar jump
       straight to its value with no animation. The outer frame lets the
       initial render commit; the inner one flips to the target. */
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShown(pct));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [pct, a.reduced]);

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-baseline justify-between text-xs">
          {label && <span className="text-muted">{label}</span>}
          {showValue && (
            <span className="tnum font-semibold text-content">{pct}%</span>
          )}
        </div>
      )}
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-content/[0.09] shadow-seated"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        {/* scaleX on a full-width child: no layout, no width interpolation. */}
        <div
          className={cn(
            "h-full w-full origin-left rounded-full transition-transform ease-entrance",
            a.reduced ? "duration-0" : "duration-[600ms]",
            GRADIENT[tone],
            pct > 0 && CAP[tone],
          )}
          style={{ transform: `scaleX(${shown / 100})` }}
        />
      </div>
    </div>
  );
}
