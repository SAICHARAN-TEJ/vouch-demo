import { useDataSource } from "@/hooks/queries";
import { Icon } from "./Icon";
import { cn } from "@/lib/cn";

/**
 * Animation: source-pulse
 * Trigger: mount, loops only while the source is live
 * Duration: 2.4s  Easing: hover curve, symmetric so it has no visible beat
 * Properties: opacity of a decorative dot
 * Stagger: n/a
 * Reduced motion: the dot holds at full opacity.
 *
 * Shows which backend is serving data — "Live" (Supabase) or "Local" (seeded
 * fallback). Makes the graceful-degradation story visible during the demo. The
 * status dot only breathes when the connection is real; local is deliberately
 * inert so the two states are distinguishable without reading the label.
 */
export function SourceBadge({ className }: { className?: string }) {
  const { data: source } = useDataSource();
  const live = source === "supabase";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
        "text-[11px] font-semibold tracking-[0.01em] ring-1 ring-inset",
        live
          ? "bg-primary/[0.13] text-primary ring-primary/30"
          : "bg-content/[0.06] text-muted ring-border",
        className,
      )}
    >
      <span className="relative grid h-3 w-3 place-items-center">
        <Icon
          name={live ? "Wifi" : "Database"}
          className="h-3 w-3"
          strokeWidth={2.25}
        />
        {live && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-primary animate-breathe"
          />
        )}
      </span>
      {live ? "Live" : "Local"}
    </span>
  );
}
