import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Tone is a tinted wash + a rim of the same hue, never a solid fill. Badges sit
 * on cards, and a solid chip would out-shout the numbers next to it.
 */
export type BadgeTone =
  | "neutral"
  | "primary"
  | "justified"
  | "caution"
  | "danger"
  | "info";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-content/[0.06] text-muted ring-border",
  primary: "bg-primary/[0.13] text-primary ring-primary/30",
  justified: "bg-justified/[0.13] text-justified ring-justified/30",
  caution: "bg-caution/[0.13] text-caution ring-caution/30",
  danger: "bg-danger/[0.13] text-danger ring-danger/30",
  info: "bg-info/[0.13] text-info ring-info/30",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 py-1",
        // Slight positive tracking: at 12px, tight letterforms in a pill read
        // as a smudge. This keeps short status words crisp.
        "text-xs font-semibold tracking-[0.01em] ring-1 ring-inset",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
