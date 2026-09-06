import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";

/* =====================================================================
 * CANONICAL SOURCE OF TRUTH FOR MOTION TOKENS
 * ---------------------------------------------------------------------
 * THIS FILE IS CANONICAL. `EASE_CSS`, `DURATION` and `STAGGER` below are
 * the single definition of Vouch's motion vocabulary. Two other layers
 * MIRROR them and must never be edited first:
 *
 *   1. src/index.css  (`:root` custom properties)
 *   2. tailwind.config.js  (`theme.extend` motion scales + `safelist`)
 *
 * Change order is always: hook -> index.css -> tailwind.config.js.
 *
 * MIRROR MAP — every key below must exist in both mirrors.
 *
 *   EASE_CSS.entrance  -> css `--ease-entrance`  -> tw transitionTimingFunction.entrance
 *   EASE_CSS.exit      -> css `--ease-exit`      -> tw transitionTimingFunction.exit
 *   EASE_CSS.elastic   -> css `--ease-elastic`   -> tw transitionTimingFunction.elastic
 *   EASE_CSS.hover     -> css `--ease-hover`     -> tw transitionTimingFunction.hover
 *   EASE_CSS.dramatic  -> css `--ease-dramatic`  -> tw transitionTimingFunction.dramatic
 *
 *   DURATION.micro     -> css `--dur-micro`      -> tw transitionDuration.micro
 *   DURATION.fast      -> css `--dur-fast`       -> tw transitionDuration.fast
 *   DURATION.entrance  -> css `--dur-entrance`   -> tw transitionDuration.entrance
 *   DURATION.slow      -> css `--dur-slow`       -> tw transitionDuration.slow
 *   DURATION.page      -> css `--dur-page`       -> tw transitionDuration.page
 *   DURATION.ambient   -> css `--dur-ambient`    -> tw transitionDuration.ambient
 *
 *   STAGGER.tight      -> css `--stagger-tight`  -> tw transitionDelay["stagger-tight"]
 *   STAGGER.base       -> css `--stagger-base`   -> tw transitionDelay.stagger
 *   STAGGER.loose      -> css `--stagger-loose`  -> tw transitionDelay["stagger-loose"]
 *
 * `--stagger` remains in index.css as a back-compat alias for
 * `--stagger-base`. Do not add new consumers of the bare alias.
 *
 * SPRING, RISE and LIFT are JS-only — framer-motion has no CSS equivalent,
 * so they are deliberately NOT mirrored.
 *
 * Because Tailwind's JIT only emits classes it literally sees, the motion
 * utilities are safelisted in tailwind.config.js. Adding a token here means
 * extending that safelist too, or the class will not exist at runtime.
 * ===================================================================== */

/**
 * Central motion vocabulary for Vouch.
 *
 * House rules, enforced by convention rather than types:
 *  - Animate `transform` and `opacity` only. Never width/height/top/left/
 *    margin/padding — those trigger layout on every frame.
 *  - `will-change` is set on interaction start and cleared when it settles.
 *  - Scroll reveals fire once, at 0.1–0.3 visibility.
 */

/* ------------------------------------------------------------------ *
 * Easing
 * ------------------------------------------------------------------ */

/** Bezier control points, in the order framer-motion expects. */
export const EASE_POINTS = {
  /** Decelerating, long tail. Things arriving. */
  entrance: [0.16, 1, 0.3, 1],
  /** Accelerating. Things leaving — should feel like they were taken away. */
  exit: [0.7, 0, 0.84, 0],
  /** Overshoots both ends. Confirmations and toggles only. */
  elastic: [0.68, -0.55, 0.265, 1.55],
  /** Standard symmetric ease. Hover and press feedback. */
  hover: [0.4, 0, 0.2, 1],
  /** Very slow in, very fast out. Page-level and reveal moments. */
  dramatic: [0.87, 0, 0.13, 1],
} as const;

export type EaseName = keyof typeof EASE_POINTS;

/** CSS `cubic-bezier(...)` strings, for inline styles and CSS animations. */
export const EASE_CSS: Record<EaseName, string> = {
  entrance: "cubic-bezier(0.16, 1, 0.3, 1)",
  exit: "cubic-bezier(0.7, 0, 0.84, 0)",
  elastic: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  hover: "cubic-bezier(0.4, 0, 0.2, 1)",
  dramatic: "cubic-bezier(0.87, 0, 0.13, 1)",
};

/** The same curves as framer-motion tuples. */
export const EASE: Record<EaseName, [number, number, number, number]> = {
  entrance: [...EASE_POINTS.entrance],
  exit: [...EASE_POINTS.exit],
  elastic: [...EASE_POINTS.elastic],
  hover: [...EASE_POINTS.hover],
  dramatic: [...EASE_POINTS.dramatic],
};

/* ------------------------------------------------------------------ *
 * Duration
 * ------------------------------------------------------------------ */

/**
 * Milliseconds. The bands are deliberate:
 *  micro    150–200  press, hover, colour shifts
 *  fast     200–300  chips, badges, small state swaps
 *  entrance 400–600  cards and content arriving
 *  slow     550–650  meters and rings filling to a value
 *  page     600–800  route transitions
 *  ambient  8000+    looping background motion
 *
 * Mirrored as `--dur-*` in src/index.css and `transitionDuration` in
 * tailwind.config.js. See the MIRROR MAP at the top of this file.
 */
export const DURATION = {
  micro: 180,
  fast: 240,
  entrance: 480,
  slow: 600,
  page: 700,
  ambient: 14_000,
} as const;

export type DurationName = keyof typeof DURATION;

/**
 * Stagger steps, in ms. Above ~100ms a list starts to feel slow.
 *
 * Mirrored as `--stagger-{tight,base,loose}` in src/index.css and
 * `transitionDelay` in tailwind.config.js.
 */
export const STAGGER = {
  tight: 50,
  base: 70,
  loose: 100,
} as const;

export type StaggerName = keyof typeof STAGGER;

/** Spring presets for framer-motion. Used by nav indicators and toggles. */
export const SPRING = {
  /** Snappy, barely overshoots. Active-state indicators. */
  indicator: { type: "spring", stiffness: 520, damping: 34, mass: 0.7 },
  /** Softer, noticeable settle. Larger surfaces. */
  panel: { type: "spring", stiffness: 260, damping: 26, mass: 0.9 },
} as const;

/** Distance in px for a standard rise-on-entrance. */
export const RISE = 14;

/** Hover lift for interactive cards. */
export const LIFT = -4;

const msToS = (ms: number) => ms / 1000;

export interface AnimationConfig {
  /** True when the user asked for reduced motion. */
  reduced: boolean;
  ease: typeof EASE;
  easeCss: Record<EaseName, string>;
  duration: typeof DURATION;
  stagger: typeof STAGGER;
  spring: typeof SPRING;
  /** Entrance travel distance — collapses to 0 under reduced motion. */
  rise: number;
  /** Hover lift — collapses to 0 under reduced motion. */
  lift: number;
  /**
   * Build a framer-motion tween transition. Returns a near-instant tween
   * when reduced motion is on, so state still changes but nothing moves.
   */
  transition: (
    duration?: DurationName | number,
    ease?: EaseName,
    delay?: number,
  ) => { duration: number; ease: [number, number, number, number]; delay: number };
  /** A spring transition, degraded to an instant tween under reduced motion. */
  springTransition: (preset?: keyof typeof SPRING) =>
    | (typeof SPRING)[keyof typeof SPRING]
    | { duration: number; ease: [number, number, number, number]; delay: number };
  /** Per-item delay for a staggered list. 0 under reduced motion. */
  stepDelay: (index: number, step?: StaggerName | number) => number;
  /** Scale a duration; returns ~0 under reduced motion. */
  ms: (duration: DurationName | number) => number;
  /** Same, in seconds, for framer-motion. */
  seconds: (duration: DurationName | number) => number;
}

/**
 * Reduced-motion-aware accessor for every motion token.
 *
 * Every animated component in `src/components/motion/` goes through this, so
 * honouring `prefers-reduced-motion` is automatic rather than something each
 * component has to remember.
 */
export function useAnimationConfig(): AnimationConfig {
  // null before the media query resolves; treat that as "motion allowed".
  const reduced = useReducedMotion() === true;

  return useMemo<AnimationConfig>(() => {
    const ms = (d: DurationName | number) => {
      if (reduced) return 1;
      return typeof d === "number" ? d : DURATION[d];
    };

    const seconds = (d: DurationName | number) => msToS(ms(d));

    return {
      reduced,
      ease: EASE,
      easeCss: EASE_CSS,
      duration: DURATION,
      stagger: STAGGER,
      spring: SPRING,
      rise: reduced ? 0 : RISE,
      lift: reduced ? 0 : LIFT,
      ms,
      seconds,
      transition: (duration = "entrance", ease = "entrance", delay = 0) => ({
        duration: seconds(duration),
        ease: EASE[ease],
        delay: reduced ? 0 : msToS(delay),
      }),
      springTransition: (preset = "indicator") =>
        reduced
          ? { duration: 0.001, ease: EASE.hover, delay: 0 }
          : SPRING[preset],
      stepDelay: (index, step = "base") => {
        if (reduced) return 0;
        const size = typeof step === "number" ? step : STAGGER[step];
        return index * size;
      },
    };
  }, [reduced]);
}
