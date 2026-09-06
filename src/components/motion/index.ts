/**
 * Motion primitives.
 *
 * Every component here is forwardRef'd, prop-configurable (delay / duration /
 * easing), and routes its timing through `useAnimationConfig()` so
 * `prefers-reduced-motion` is honoured without the caller doing anything.
 *
 * Rules these all obey:
 *  - transform and opacity only
 *  - `will-change` is left to framer-motion, which already applies it to the
 *    values it animates — do not hand-write it alongside framer
 *  - scroll reveals fire once, at 0.1–0.3 visibility
 *
 * Composition: `AnimatedCard` joins a `StaggerContainer` cascade on its own via
 * `StaggerVariantContext` — no wrapper element, so grid/flex layout survives.
 * `StaggerItem` is only for children that are not motion components.
 */
export { AnimatedCard, type AnimatedCardProps } from "./AnimatedCard";
export { AnimatedNumber, type AnimatedNumberProps } from "./AnimatedNumber";
export {
  StaggerContainer,
  StaggerItem,
  type StaggerContainerProps,
  type StaggerItemProps,
} from "./StaggerContainer";
export {
  StaggerVariantContext,
  useStaggerVariants,
  type StaggerVariant,
} from "./staggerContext";
export {
  ScrollReveal,
  resetScrollReveals,
  type ScrollRevealProps,
} from "./ScrollReveal";
export { PageTransition, type PageTransitionProps } from "./PageTransition";
