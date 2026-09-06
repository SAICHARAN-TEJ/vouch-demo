import { createContext, useContext, useMemo } from "react";
import type { Variants } from "framer-motion";

/**
 * Shared stagger plumbing.
 *
 * This lives in its own module rather than inside `StaggerContainer.tsx` so
 * that `AnimatedCard` can read the context without the two components
 * importing each other — the container renders arbitrary children, and a card
 * that imported the container would close an import cycle.
 */

/** Per-child entrance shape published by a `StaggerContainer`. */
export interface StaggerVariant {
  /** Y travel distance in px. Collapses to 0 under reduced motion. */
  offset: number;
  /** Tween each child lands with. Delay is owned by framer's stagger, not this. */
  transition: {
    duration: number;
    ease: [number, number, number, number];
    delay: number;
  };
}

export const StaggerVariantContext = createContext<StaggerVariant | null>(null);

/**
 * Variants for a child that wants the surrounding `StaggerContainer` to drive
 * its entrance. Returns `null` when there is no container above, so the caller
 * can fall back to its own standalone entrance.
 *
 * A child using these must set `variants` and must NOT set `initial`,
 * `animate` or `transition`: framer-motion only propagates variant labels down
 * to children that have not declared their own animation state.
 */
export function useStaggerVariants(): Variants | null {
  const ctx = useContext(StaggerVariantContext);

  return useMemo(() => {
    if (!ctx) return null;
    return {
      hidden: { opacity: 0, y: ctx.offset },
      shown: { opacity: 1, y: 0, transition: ctx.transition },
    };
  }, [ctx]);
}
