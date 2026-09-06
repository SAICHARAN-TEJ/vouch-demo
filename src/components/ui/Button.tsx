import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Animation: button-press
 * Trigger: hover, focus-visible, and active (pointer or keyboard)
 * Duration: 180ms  Easing: hover
 * Properties: transform (translateY 1px, scale 0.985) + colour/shadow tokens
 * Stagger: n/a
 * Reduced motion: the global duration collapse removes the movement; the
 *   colour and shadow change still lands, so feedback is never lost.
 */

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

/**
 * Variants are lit surfaces, not flat fills. Primary carries a top-to-bottom
 * falloff so it reads as an illuminated key, and the signal shadow puts the
 * primary hue into the shadow rather than neutral gray.
 */
const VARIANTS: Record<Variant, string> = {
  primary: cn(
    "bg-gradient-to-b from-primary to-primary/80 text-primary-fg shadow-signal",
    "hover:to-primary hover:brightness-[1.06]",
    "active:brightness-[0.97]",
  ),
  secondary: cn(
    "bg-elevated text-content hairline shadow-seated",
    "hover:bg-elevated/70 hover:border-border",
  ),
  outline: cn(
    "hairline bg-transparent text-content",
    "hover:border-primary/55 hover:bg-primary/[0.07] hover:text-primary",
  ),
  ghost: "bg-transparent text-muted hover:bg-content/[0.06] hover:text-content",
  danger: cn(
    "bg-gradient-to-b from-danger to-danger/80 text-primary-fg",
    "shadow-[0_0_0_1px_rgb(var(--c-danger)/0.35),0_10px_28px_-14px_rgb(var(--c-danger)/0.5)]",
    "hover:to-danger hover:brightness-[1.06]",
  ),
};

const SIZES: Record<Size, string> = {
  sm: "h-touch px-3.5 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-14 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Every size clears 44px on its shortest edge.
        "tap-target inline-flex select-none items-center justify-center gap-2",
        "rounded-control font-semibold tracking-[-0.005em]",
        // Only compositor-friendly properties plus paint-level colour swaps.
        "transition-[transform,box-shadow,background-color,border-color,color,filter]",
        "duration-micro ease-hover",
        "hover:[will-change:transform] active:translate-y-px active:scale-[0.985]",
        // Own focus treatment; suppress the global outline so they do not stack.
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none disabled:saturate-50",
        VARIANTS[variant],
        SIZES[size],
        block && "w-full",
        className,
      )}
      {...props}
    />
  );
}
