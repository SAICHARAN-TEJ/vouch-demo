import { forwardRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/cn";
import {
  useAnimationConfig,
  type DurationName,
  type EaseName,
} from "@/hooks/useAnimationConfig";

/**
 * Animation: page-transition
 * Trigger: `location.pathname` change (or an explicit `transitionKey`)
 * Duration: 700ms in / 240ms out  Easing: entrance in, exit out
 * Properties: transform (translate3d Y) + opacity
 * Stagger: n/a — the incoming screen's own StaggerContainer handles cascade
 * Reduced motion: no AnimatePresence at all; children render directly.
 *
 * Purely presentational. It reads the current location but never navigates, so
 * route config and history behaviour are untouched.
 *
 * IMPORTANT for callers: pass the *resolved* route element as `children`
 * (`useOutlet()`), not `<Outlet />`. `Outlet` reads router context, so an
 * outgoing copy of it would re-render as the incoming screen and you would
 * briefly see the new screen twice.
 *
 * `mode="popLayout"` takes the leaving screen out of the layout flow so the
 * two screens never stack and push the scroll container.
 *
 * The first mount animates too. Routes that must not animate (a splash, or any
 * full-bleed screen that sizes itself with `h-full`) should bypass this
 * component entirely rather than suppress the initial animation — an extra
 * wrapper would give them an auto-height parent to resolve against.
 */

export interface PageTransitionProps {
  children: ReactNode;
  /** Override the key that drives the transition. Defaults to the pathname. */
  transitionKey?: string;
  /** Enter duration. */
  duration?: DurationName | number;
  /** Enter easing. */
  easing?: EaseName;
  /** Delay in ms before the incoming screen animates. */
  delay?: number;
  /** Enter travel distance in px. */
  distance?: number;
  className?: string;
}

export const PageTransition = forwardRef<HTMLDivElement, PageTransitionProps>(
  function PageTransition(
    {
      children,
      transitionKey,
      duration = "page",
      easing = "entrance",
      delay = 0,
      distance = 12,
      className,
    },
    ref,
  ) {
    const a = useAnimationConfig();
    const { pathname } = useLocation();
    const key = transitionKey ?? pathname;

    if (a.reduced) {
      return (
        <div ref={ref} className={cn(className)}>
          {children}
        </div>
      );
    }

    return (
      <AnimatePresence mode="popLayout">
        <motion.div
          key={key}
          ref={ref}
          initial={{ opacity: 0, y: distance }}
          animate={{ opacity: 1, y: 0 }}
          // Leaving should feel like the screen was taken away: shorter, and
          // on the accelerating curve.
          exit={{
            opacity: 0,
            y: -Math.round(distance * 0.5),
            transition: { duration: a.seconds("fast"), ease: a.ease.exit },
          }}
          transition={a.transition(duration, easing, delay)}
          className={cn(className)}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  },
);
