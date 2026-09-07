import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Animation: button-press
 * Trigger: hover, focus-visible, and active (pointer or keyboard)
 * Duration: 180ms  Easing: hover
 * Properties: transform (translateY 1px, scale 0.985) + colour tokens
 * Stagger: n/a
 * Reduced motion: the global duration collapse removes the movement; the
 *   colour change still lands, so feedback is never lost.
 */

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

/**
 * Solid tonal fills per spec §4. Primary = primary-container (#0f5257) with
 * white ink, pressed to primary (#003a3e). No gradients, no glow shadows.
 */
const VARIANTS: Record<Variant, string> = {
  primary: cn(
    "bg-primary-container text-on-primary shadow-raised",
    "active:bg-primary",
  ),
  secondary: cn(
    "bg-surface-container-lowest text-primary ring-1 ring-inset ring-outline-variant",
    "hover:bg-surface-container",
  ),
  outline: cn(
    "ring-1 ring-inset ring-outline-variant bg-transparent text-primary",
    "hover:bg-surface-container",
  ),
  ghost: "bg-transparent text-primary hover:bg-surface-container",
  danger: cn(
    "bg-error text-on-error shadow-raised",
    "hover:bg-error/90",
  ),
};

const SIZES: Record<Size, string> = {
  sm: "h-touch px-3.5 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-touch-standard px-6 text-base",
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
        "rounded-xl font-semibold tracking-[-0.005em]",
        // Only compositor-friendly properties plus paint-level colour swaps.
        "transition-[transform,background-color,border-color,color,box-shadow]",
        "duration-micro ease-hover",
        "hover:[will-change:transform] active:translate-y-px active:scale-[0.985]",
        // Own focus treatment; suppress the global outline so they do not stack.
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none",
        VARIANTS[variant],
        SIZES[size],
        block && "w-full",
        className,
      )}
      {...props}
    />
  );
}
