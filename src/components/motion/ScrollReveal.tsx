import { forwardRef, useCallback, useEffect, useRef } from "react";
import { motion, useInView, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import {
  useAnimationConfig,
  type DurationName,
  type EaseName,
} from "@/hooks/useAnimationConfig";

/**
 * Animation: scroll-reveal
 * Trigger: IntersectionObserver via useInView, 20% visible (0.1–0.3 band), once
 * Duration: 480ms  Easing: entrance
 * Properties: transform (translate3d Y, optional scale) + opacity
 * Stagger: n/a — compose with StaggerContainer for groups
 * Reduced motion: rendered in its final state immediately, no transform.
 */

/**
 * Ids already revealed this session. Keyed reveals play at most once per page
 * load, so returning to a screen shows content already in place instead of
 * re-animating. That is what makes repeat visits feel fast rather than showy.
 */
const SEEN = new Set<string>();

/** Clears the session reveal memory. AppShell calls this on every route change
 *  so each screen visit plays its reveal once, rather than once ever. */
export function resetScrollReveals() {
  SEEN.clear();
}

export interface ScrollRevealProps
  extends Omit<HTMLMotionProps<"div">, "ref" | "variants"> {
  /**
   * Stable id. When provided, this element reveals at most once per session.
   * Without an id the reveal still fires only once per mount.
   */
  revealId?: string;
  /** Visible fraction that triggers the reveal. Clamped to 0.1–0.3. */
  threshold?: number;
  /** Delay in ms after the trigger. */
  delay?: number;
  duration?: DurationName | number;
  easing?: EaseName;
  /** Travel distance in px. Defaults to the standard 14px rise. */
  distance?: number;
  /** Adds a slight scale-up alongside the rise. */
  scale?: boolean;
}

export const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  function ScrollReveal(
    {
      revealId,
      threshold = 0.2,
      delay = 0,
      duration = "entrance",
      easing = "entrance",
      distance,
      scale = false,
      className,
      ...props
    },
    ref,
  ) {
    const a = useAnimationConfig();
    const localRef = useRef<HTMLDivElement | null>(null);

    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        localRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    // Skip means "already earned its reveal, or the user does not want one".
    const skip = a.reduced || (revealId ? SEEN.has(revealId) : false);

    const inView = useInView(localRef, {
      once: true,
      amount: Math.min(0.3, Math.max(0.1, threshold)),
      initial: skip,
    });

    const shown = skip || inView;

    useEffect(() => {
      if (shown && revealId) SEEN.add(revealId);
    }, [shown, revealId]);

    const travel = skip ? 0 : (distance ?? a.rise);
    const hidden = {
      opacity: 0,
      y: travel,
      scale: scale && !skip ? 0.985 : 1,
    };

    return (
      <motion.div
        ref={setRef}
        // `initial={false}` adopts the animate state on first paint, so a
        // skipped reveal costs nothing and never flashes.
        initial={skip ? false : hidden}
        animate={shown ? { opacity: 1, y: 0, scale: 1 } : hidden}
        transition={a.transition(duration, easing, delay)}
        className={cn(className)}
        {...props}
      />
    );
  },
);
