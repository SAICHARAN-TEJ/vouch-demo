import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Animation: card-lift (CSS)
 * Trigger: hover / focus-visible on a card that has an onClick
 * Duration: 180ms  Easing: hover
 * Properties: transform (translateY -4px) + box-shadow level swap
 * Stagger: n/a
 * Reduced motion: every transform is gated behind Tailwind's `motion-safe:`
 *   variant, so `prefers-reduced-motion: reduce` gets NO movement at all —
 *   not merely a collapsed duration. The colour, shadow and focus-ring
 *   feedback still lands, so the card remains obviously interactive and
 *   obviously focused. The `will-change` hint is gated the same way, since
 *   there is no transform to promote when motion is off.
 *
 * This is the CSS-only card. For entrance animation or spring press feedback
 * use `AnimatedCard` from `@/components/motion` — same visual language, driven
 * by framer-motion.
 *
 * Note: a clickable Card gets keyboard focus and Enter/Space activation, but
 * deliberately keeps its native `div` role. Screens that need real button
 * semantics nest an actual <button> inside a `padded={false}` Card, which is
 * the better pattern and is what the existing screens already do.
 */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the live "signal" rim — used for hero and active surfaces. */
  glow?: boolean;
  padded?: boolean;
}

export function Card({
  glow,
  padded = true,
  className,
  onClick,
  onKeyDown,
  tabIndex,
  ...props
}: CardProps) {
  const clickable = Boolean(onClick);

  return (
    <div
      className={cn(
        "card",
        padded && "p-4",
        glow && "shadow-signal",
        clickable &&
          "cursor-pointer transition-[transform,box-shadow,background-color] duration-micro ease-hover hover:card-lifted focus-visible:card-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        // Every transform, and the will-change hint that only exists to
        // promote it, is motion-safe: reduced-motion users get the elevation,
        // colour and ring affordances with zero movement.
        clickable &&
          "motion-safe:hover:[will-change:transform] motion-safe:hover:-translate-y-1 motion-safe:focus-visible:-translate-y-1 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.995]",
        className,
      )}
      onClick={onClick}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          event.defaultPrevented ||
          !onClick ||
          event.currentTarget !== event.target ||
          (event.key !== "Enter" && event.key !== " ")
        ) {
          return;
        }
        event.preventDefault();
        event.currentTarget.click();
      }}
      tabIndex={clickable ? (tabIndex ?? 0) : tabIndex}
      {...props}
    />
  );
}
