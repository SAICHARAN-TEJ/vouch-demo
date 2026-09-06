import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Circular progress ring (SVG). Colour is set via the `progressClassName`
 * Tailwind stroke utility (e.g. "stroke-primary") so it themes with tokens.
 */
export function ProgressRing({
  value,
  size = 148,
  stroke = 12,
  progressClassName = "stroke-primary",
  trackClassName = "stroke-border",
  children,
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  progressClassName?: string;
  trackClassName?: string;
  children?: ReactNode;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped / 100);

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={trackClassName}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-1000 ease-out", progressClassName)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
