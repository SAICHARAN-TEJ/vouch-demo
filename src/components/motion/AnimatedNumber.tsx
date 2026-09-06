import { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  EASE_POINTS,
  useAnimationConfig,
  type DurationName,
  type EaseName,
} from "@/hooks/useAnimationConfig";

/**
 * Animation: number-count
 * Trigger: mount, and any change to `value`
 * Duration: 700ms default (page band)  Easing: entrance (applied as a
 *   cubic-bezier solved per frame, not a CSS transition)
 * Properties: text content only — no layout properties are animated, and
 *   `.tnum` tabular figures keep the glyph box fixed so nothing reflows.
 * Stagger: n/a
 * Reduced motion: snaps straight to the final value on the first frame.
 */

/** Solve a cubic bezier for y at time t. Newton-Raphson, then bisect. */
function bezier(p1: number, p2: number, p3: number, p4: number) {
  const cx = 3 * p1;
  const bx = 3 * (p3 - p1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p2;
  const by = 3 * (p4 - p2) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    let t = x;
    for (let i = 0; i < 8; i += 1) {
      const dx = sampleX(t) - x;
      if (Math.abs(dx) < 1e-5) return sampleY(t);
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }

    let lo = 0;
    let hi = 1;
    t = x;
    while (lo < hi) {
      const mid = sampleX(t);
      if (Math.abs(mid - x) < 1e-5) break;
      if (x > mid) lo = t;
      else hi = t;
      t = (hi + lo) / 2;
      if (hi - lo < 1e-6) break;
    }
    return sampleY(t);
  };
}

const SOLVERS: Record<EaseName, (x: number) => number> = {
  entrance: bezier(...(EASE_POINTS.entrance as unknown as [number, number, number, number])),
  exit: bezier(...(EASE_POINTS.exit as unknown as [number, number, number, number])),
  elastic: bezier(...(EASE_POINTS.elastic as unknown as [number, number, number, number])),
  hover: bezier(...(EASE_POINTS.hover as unknown as [number, number, number, number])),
  dramatic: bezier(...(EASE_POINTS.dramatic as unknown as [number, number, number, number])),
};

export interface AnimatedNumberProps {
  /** Target value. Changing it re-runs the count from wherever it is now. */
  value: number;
  /** Decimal places in the rendered output. */
  decimals?: number;
  /**
   * Count start on the INITIAL MOUNT ONLY. Defaults to 0.
   *
   * Subsequent changes to `value` deliberately ignore this and re-target from
   * whatever is currently displayed — see the component doc block.
   */
  from?: number;
  /** Duration token or explicit ms. */
  duration?: DurationName | number;
  /** Easing token used to shape the interpolation. */
  easing?: EaseName;
  /** Delay in ms before counting begins. */
  delay?: number;
  /** Rendered before the number. */
  prefix?: string;
  /** Rendered after the number. */
  suffix?: string;
  /** Custom formatter. Overrides `decimals`. */
  format?: (value: number) => string;
  className?: string;
}

/**
 * Eased count-up for telemetry readouts.
 *
 * Uses requestAnimationFrame rather than a CSS transition because the value is
 * text: there is nothing for the compositor to interpolate. Always paired with
 * `.tnum` so digit width is fixed and the surrounding layout cannot shift
 * while the number runs.
 *
 * Re-targeting: `from` seeds the very first run only. Every later change to
 * `value` counts from the CURRENTLY DISPLAYED number, not from `from`. That is
 * what a live readout needs — a HUD ticking 12 → 18 → 25 should keep climbing,
 * not snap back to `from` and re-run each time.
 */
export const AnimatedNumber = forwardRef<HTMLSpanElement, AnimatedNumberProps>(
  function AnimatedNumber(
    {
      value,
      decimals = 0,
      from = 0,
      duration = "page",
      easing = "entrance",
      delay = 0,
      prefix,
      suffix,
      format,
      className,
    },
    ref,
  ) {
    const a = useAnimationConfig();
    const [display, setDisplay] = useState(() => (a.reduced ? value : from));
    // Mirrors `display`. The effect cleanup needs the number that is actually
    // on screen; reading the `display` state there would read the value from
    // the render that ran the effect, which is stale by the time we unwind.
    const displayRef = useRef(a.reduced ? value : from);
    // Where the current run starts. Re-targeting mid-count picks up from here
    // instead of snapping back to `from`.
    const originRef = useRef(a.reduced ? value : from);
    const frameRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      // Single write path: every displayed value goes through here so state
      // and ref can never drift.
      const commit = (next: number) => {
        displayRef.current = next;
        setDisplay(next);
      };

      const totalMs = a.ms(duration);

      if (a.reduced || totalMs <= 1) {
        originRef.current = value;
        commit(value);
        return;
      }

      const start = originRef.current;
      const span = value - start;
      if (span === 0) {
        commit(value);
        return;
      }

      const solve = SOLVERS[easing];
      let startedAt = 0;

      const step = (now: number) => {
        if (!startedAt) startedAt = now;
        const t = Math.min(1, (now - startedAt) / totalMs);
        const next = start + span * solve(t);
        commit(next);
        if (t < 1) {
          frameRef.current = requestAnimationFrame(step);
        } else {
          originRef.current = value;
        }
      };

      const begin = () => {
        frameRef.current = requestAnimationFrame(step);
      };

      if (delay > 0) {
        timerRef.current = setTimeout(begin, delay);
      } else {
        begin();
      }

      return () => {
        cancelAnimationFrame(frameRef.current);
        if (timerRef.current) clearTimeout(timerRef.current);
        // Preserve wherever we actually stopped so an interrupted run resumes
        // smoothly from the visible number.
        originRef.current = displayRef.current;
      };
    }, [value, duration, easing, delay, a.reduced]);

    const text = format
      ? format(display)
      : display.toFixed(decimals);

    return (
      <span ref={ref} className={cn("tnum", className)}>
        {prefix}
        {text}
        {suffix}
      </span>
    );
  },
);
