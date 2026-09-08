import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Tinted tonal chips per spec §4 — a light container wash with tonal ink and
 * a ring of the same hue. Small radii (4px), never pills.
 */
export type BadgeTone =
  | "neutral"
  | "primary"
  | "justified"
  | "caution"
  | "danger"
  | "info";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-container text-on-surface-variant ring-outline-variant",
  primary: "bg-primary/10 text-primary ring-primary/25",
  justified: "bg-tertiary-fixed/40 text-tertiary ring-tertiary/30",
  caution: "bg-secondary-fixed/45 text-secondary ring-secondary/30",
  // text-error, not text-on-error-container: the error-container wash and its
  // "on" ink are near-identical pinks, which made danger badges unreadable.
  danger: "bg-error-container/60 text-error ring-error/30",
  info: "bg-primary/10 text-info ring-info/30",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded-sm px-2.5 py-1",
        // Slight positive tracking: at 12px, tight letterforms read as a
        // smudge. This keeps short status words crisp.
        "text-xs font-semibold tracking-[0.01em] ring-1 ring-inset",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
