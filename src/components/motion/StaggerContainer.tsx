import { forwardRef, useContext, useMemo, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { StaggerVariantContext, type StaggerVariant } from "./staggerContext";
import {
  useAnimationConfig,
  type DurationName,
  type EaseName,
  type StaggerName,
} from "@/hooks/useAnimationConfig";

/**
 * Animation: stagger-entrance
 * Trigger: mount of the container (variants cascade to children)
 * Duration: 480ms per item  Easing: entrance
 * Properties: transform (translate3d Y) + opacity
 * Stagger: 70ms default, 50–100ms range via the `stagger` prop
 * Reduced motion: children appear together with no travel; the cascade
 *   collapses to zero delay rather than being removed, so ordering logic
 *   downstream is unaffected.
 *
 * Composition
 * -----------
 * `AnimatedCard` participates directly — it reads the container context and
 * publishes matching `variants`, so no wrapper element is inserted and CSS grid
 * or flex layout is untouched:
 *
 *   <StaggerContainer className="grid grid-cols-2 gap-3">
 *     {items.map((i) => <AnimatedCard key={i.id}>{i.label}</AnimatedCard>)}
 *   </StaggerContainer>
 *
 * `StaggerItem` exists for children that are NOT motion components (plain divs,
 * text rows, third-party components). Do not wrap an `AnimatedCard` in a
 * `StaggerItem` inside a grid: the item div becomes the grid child and the card
 * loses its track.
 */

export interface StaggerContainerProps
  extends Omit<HTMLMotionProps<"div">, "ref" | "variants" | "children"> {
  /**
   * HTMLMotionProps widens `children` to accept MotionValue. This container
   * puts children inside a context provider, so narrow it back to ReactNode.
   */
  children?: ReactNode;
  /** Step between children. Token or explicit ms. */
  stagger?: StaggerName | number;
  /** Delay before the first child starts, in ms. */
  delay?: number;
  /** Per-item duration. */
  duration?: DurationName | number;
  /** Per-item easing. */
  easing?: EaseName;
  /** Direction items travel in from. Defaults to "up" (rise into place). */
  direction?: "up" | "down" | "none";
}

/**
 * Orchestrates a group entrance. Wrap a list; `AnimatedCard` children join the
 * cascade automatically, other children go in a `StaggerItem`. Either way the
 * timing is framer's variant propagation — no per-child delay arithmetic in
 * screen code.
 */
export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  function StaggerContainer(
    {
      stagger = "base",
      delay = 0,
      duration = "entrance",
      easing = "entrance",
      direction = "up",
      className,
      children,
      ...props
    },
    ref,
  ) {
    const a = useAnimationConfig();
    const step = a.stepDelay(1, stagger);
    const offset =
      direction === "none" ? 0 : direction === "down" ? -a.rise : a.rise;

    const ctx = useMemo<StaggerVariant>(
      () => ({ offset, transition: a.transition(duration, easing) }),
      [offset, a, duration, easing],
    );

    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="shown"
        variants={{
          hidden: {},
          shown: {
            transition: {
              staggerChildren: step / 1000,
              delayChildren: a.reduced ? 0 : delay / 1000,
            },
          },
        }}
        className={cn(className)}
        {...props}
      >
        {/* Children read the shared offset/transition from context; framer
            drives the cascade itself via variant propagation. */}
        <StaggerVariantContext.Provider value={ctx}>
          {children}
        </StaggerVariantContext.Provider>
      </motion.div>
    );
  },
);

export interface StaggerItemProps
  extends Omit<HTMLMotionProps<"div">, "ref" | "variants"> {
  /** Override the container's per-item duration. */
  duration?: DurationName | number;
  /** Override the container's per-item easing. */
  easing?: EaseName;
}

/**
 * One participant in a `StaggerContainer` cascade. Falls back to a plain
 * entrance if rendered outside a container, so it is safe to use alone.
 *
 * Only needed for non-motion children — `AnimatedCard` joins the cascade on its
 * own and does not want this wrapper (it would take over as the grid item).
 */
export const StaggerItem = forwardRef<HTMLDivElement, StaggerItemProps>(
  function StaggerItem({ duration, easing, className, ...props }, ref) {
    const a = useAnimationConfig();
    const ctx = useContext(StaggerVariantContext);

    const offset = ctx?.offset ?? a.rise;
    const transition =
      duration || easing
        ? a.transition(duration ?? "entrance", easing ?? "entrance")
        : (ctx?.transition ?? a.transition());

    return (
      <motion.div
        ref={ref}
        // Outside a container there is no parent to trigger the variants, so
        // drive them locally.
        initial={ctx ? undefined : "hidden"}
        animate={ctx ? undefined : "shown"}
        variants={{
          hidden: { opacity: 0, y: offset },
          shown: { opacity: 1, y: 0, transition },
        }}
        className={cn(className)}
        {...props}
      />
    );
  },
);
