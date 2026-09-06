import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { useStaggerVariants } from "./staggerContext";
import {
  useAnimationConfig,
  type DurationName,
  type EaseName,
} from "@/hooks/useAnimationConfig";

/**
 * Animation: card-lift
 * Trigger: pointer hover (lift), pointer or key press (settle)
 * Duration: 180ms hover, 180ms press  Easing: hover
 * Properties: transform (translate3d, scale), box-shadow token swap
 * Stagger: n/a for the lift; the entrance can join a parent cascade
 * Reduced motion: no translate or scale; the shadow still swaps to level 2 so
 *   hover remains perceivable without movement.
 *
 * Composition with StaggerContainer
 * ---------------------------------
 * An AnimatedCard rendered anywhere inside a `StaggerContainer` picks the
 * cascade up automatically through context — no wrapper element:
 *
 *   <StaggerContainer className="grid grid-cols-2 gap-3">
 *     {rides.map((r) => <AnimatedCard key={r.id}>{r.label}</AnimatedCard>)}
 *   </StaggerContainer>
 *
 * In that mode the card publishes `variants` only and leaves
 * `initial`/`animate`/`transition` to framer's parent propagation, so `delay`,
 * `duration` and `easing` are owned by the container. Outside a container the
 * card runs its own standalone entrance and those props apply as normal.
 *
 * Do NOT wrap an AnimatedCard in `StaggerItem` inside a grid or flex layout:
 * StaggerItem emits a real div, which becomes the grid item and pushes the card
 * out of the track. StaggerItem is for non-motion children only.
 *
 * Focus: there is deliberately NO focus transform. `whileFocus` fires for mouse
 * clicks too, which strands a clicked card in the lifted state, and framer has
 * no focus-visible equivalent. Keyboard users get the CSS `focus-visible:` ring
 * instead — that is the accessible affordance; the lift was decoration. Do not
 * reintroduce a focus lift via `animate`: that would also break the variant
 * propagation the stagger composition above depends on.
 *
 * will-change: left entirely to framer-motion, which already applies it to the
 * values it animates.
 */

export interface AnimatedCardProps
  extends Omit<
    HTMLMotionProps<"div">,
    "ref" | "initial" | "animate" | "variants"
  > {
  /** Adds the live "signal" rim. Matches Card's `glow` prop. */
  glow?: boolean;
  /** Default padding. Set false for edge-to-edge content. */
  padded?: boolean;
  /**
   * Enables hover/press motion. Defaults to true when an onClick is present,
   * false otherwise — a static card should not react to the pointer.
   */
  interactive?: boolean;
  /** Entrance delay in ms. Owned by the container inside a StaggerContainer. */
  delay?: number;
  /**
   * Entrance duration token or explicit ms. Owned by the container inside a
   * StaggerContainer.
   */
  duration?: DurationName | number;
  /** Entrance easing token. Owned by the container inside a StaggerContainer. */
  easing?: EaseName;
  /** Skip the entrance animation entirely. Wins over everything else. */
  noEntrance?: boolean;
  /**
   * Custom entrance variants — the sanctioned escape hatch for bespoke
   * orchestration. An explicit value here takes precedence over the variants
   * derived from a surrounding StaggerContainer.
   *
   * `initial` and `animate` are deliberately NOT part of this component's API:
   * they are managed internally, because a caller overriding one of them
   * silently disables the entrance or severs parent variant propagation.
   */
  variants?: HTMLMotionProps<"div">["variants"];
}

/**
 * The resting surface of the app, with elevation that responds to input.
 *
 * A clickable card is keyboard operable (tab stop + Enter/Space) but keeps its
 * native `div` role on purpose — see `src/components/ui/Card.tsx` for the same
 * contract and the reasoning. Screens that need real button semantics nest an
 * actual <button> inside a `padded={false}` card.
 */
export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  function AnimatedCard(
    {
      glow,
      padded = true,
      interactive,
      delay = 0,
      duration = "entrance",
      easing = "entrance",
      noEntrance = false,
      variants,
      className,
      onClick,
      onKeyDown,
      tabIndex,
      ...props
    },
    ref,
  ) {
    const a = useAnimationConfig();
    const staggerVariants = useStaggerVariants();
    const isInteractive = interactive ?? Boolean(onClick);
    const clickable = Boolean(onClick);

    // `initial` / `animate` are internally owned. They are absent from the
    // public prop type, and stripped again here so an untyped spread at a call
    // site cannot ride the rest-spread through and sever the entrance.
    // Everything else — onPointerEnter/Leave, onFocus/Blur, onAnimationStart/
    // Complete — passes straight through untouched via `rest`.
    const { initial: _initial, animate: _animate, ...rest } = props as typeof props &
      Pick<HTMLMotionProps<"div">, "initial" | "animate">;

    // Precedence: noEntrance opts out of everything > explicit caller variants >
    // container cascade > standalone self-driven entrance.
    const entranceVariants = noEntrance ? undefined : (variants ?? staggerVariants ?? undefined);
    // Only drive initial/animate ourselves when nothing above us will. With
    // variants in play framer propagates the label down from the container, and
    // a local initial/animate would sever that link.
    const selfDriven = !noEntrance && !entranceVariants;

    const motionState = isInteractive && !a.reduced
      ? {
          whileHover: { y: a.lift, scale: 1.006 },
          whileTap: { y: -1, scale: 0.994 },
        }
      : {};

    return (
      <motion.div
        ref={ref}
        initial={selfDriven ? { opacity: 0, y: a.rise } : undefined}
        animate={selfDriven ? { opacity: 1, y: 0 } : undefined}
        variants={entranceVariants}
        transition={selfDriven ? a.transition(duration, easing, delay) : undefined}
        onClick={onClick}
        onKeyDown={(event) => {
          // Compose, never replace: the caller's handler runs first and can
          // opt out of card activation with preventDefault().
          onKeyDown?.(event);
          if (
            event.defaultPrevented ||
            !onClick ||
            // A keystroke bubbling up from a nested button/input/link must not
            // also activate the card.
            event.currentTarget !== event.target ||
            (event.key !== "Enter" && event.key !== " ")
          ) {
            return;
          }
          // Space would otherwise scroll the page.
          event.preventDefault();
          event.currentTarget.click();
        }}
        tabIndex={clickable ? (tabIndex ?? 0) : tabIndex}
        className={cn(
          "card",
          padded && "p-4",
          glow && "shadow-signal",
          // Level 1 → level 2 on hover. Colour and shadow ride CSS
          // transitions; position is handled by framer above. The
          // focus-visible ring is the only focus affordance.
          isInteractive &&
            "cursor-pointer transition-[box-shadow,background-color] duration-micro ease-hover hover:card-lifted hover:bg-elevated/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          className,
        )}
        {...motionState}
        {...rest}
      />
    );
  },
);
