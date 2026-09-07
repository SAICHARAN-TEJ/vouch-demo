import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

/**
 * Compact metric tile: icon chip + big value + caption.
 *
 * Light system per spec §4: white card, icon tile on surface-container.
 * The value uses `.metric` (display face, tabular figures) so numbers across
 * a row of tiles line up on their digits.
 */
export function StatTile({
  icon,
  value,
  label,
  sub,
  className,
  accent = "text-primary",
}: {
  icon?: string;
  value: ReactNode;
  label: string;
  sub?: ReactNode;
  className?: string;
  accent?: string;
}) {
  return (
    <div
      className={cn(
        "card p-3.5 transition-[background-color,box-shadow] duration-micro ease-hover",
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            "mb-2.5 inline-grid h-8 w-8 place-items-center rounded-lg",
            "bg-surface-container ring-1 ring-inset ring-outline-variant/60",
            accent,
          )}
        >
          <Icon name={icon} className="h-4 w-4" strokeWidth={2.25} />
        </div>
      )}
      <div className="metric text-2xl leading-none text-content">{value}</div>
      <div className="mt-1.5 text-xs font-medium text-muted">{label}</div>
      {sub && <div className="mt-0.5 text-[11px] text-muted/80">{sub}</div>}
    </div>
  );
}
