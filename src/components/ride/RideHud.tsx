import type { ReactNode } from "react";
import { useRideStore } from "@/store/rideStore";
import { Icon } from "@/components/ui/Icon";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { cn } from "@/lib/cn";

/**
 * Animation: none by design.
 * Telemetry updates every second via AnimatedNumber; any looping pulse or
 * breathing on a live HUD fights the numbers for attention and costs
 * battery. State is communicated by layout and colour, not motion.
 *
 * Live ride HUD — glanceable in a fraction of a second:
 *   row 1: monitoring state + end-ride control
 *   hero: SPEED — the one number a rider actually needs mid-ride
 *   row 3: distance + elapsed, deliberately secondary
 *
 * Panels are solid surface-container-lowest at 95% — no backdrop blur (a
 * blur layer under live-updating numbers is a guaranteed mobile jank
 * source), no pill chrome. Safe-area top inset keeps the status pill off
 * the notch on notched handsets.
 */
export function RideHud({ onExit }: { onExit?: () => void }) {
  const speedKmh = useRideStore((s) => s.speedKmh);
  const distanceKm = useRideStore((s) => s.distanceKm);
  const elapsedS = useRideStore((s) => s.elapsedS);
  const phase = useRideStore((s) => s.phase);
  const live = phase === "riding";

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="flex items-start justify-between gap-3">
        {/* Monitoring state pill */}
        <div
          className={cn(
            "inline-flex min-h-touch items-center gap-2 rounded-full px-3.5 py-1.5 shadow-raised",
            "bg-surface-container-lowest/95",
          )}
        >
          <span
            className={cn("h-2 w-2 rounded-full", live ? "bg-tertiary" : "bg-muted")}
            aria-hidden="true"
          />
          <span className="text-xs font-semibold tracking-wide text-content">
            {live ? "Monitoring" : "Paused"}
          </span>
        </div>

        {onExit && (
          <button
            onClick={onExit}
            aria-label="End ride"
            className="pointer-events-auto grid h-touch w-touch shrink-0 place-items-center rounded-xl bg-surface-container-lowest/95 text-muted shadow-raised transition-[color,background-color] duration-micro hover:bg-surface-container hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <Icon name="X" className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Speed hero — the glanceable number */}
      <div className="mt-3 inline-flex items-baseline gap-2 rounded-xl bg-surface-container-lowest/95 px-4 py-3 shadow-raised">
        <span className="metric font-mono text-4xl font-bold leading-none text-primary">
          <AnimatedNumber value={speedKmh} duration="fast" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          km/h
        </span>
      </div>

      {/* Secondary telemetry */}
      <div className="mt-2 flex gap-2">
        <SecondaryTile
          value={<AnimatedNumber value={distanceKm} decimals={1} duration="fast" />}
          unit="km"
          label="Distance"
        />
        <SecondaryTile
          value={<AnimatedNumber value={elapsedS} duration="fast" format={formatElapsed} />}
          unit=""
          label="Time"
        />
      </div>
    </div>
  );
}

function SecondaryTile({
  value,
  unit,
  label,
}: {
  value: ReactNode;
  unit: string;
  label: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-surface-container-lowest/95 px-3 py-2 shadow-raised">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </div>
      <div className="tnum mt-0.5 truncate text-sm font-bold leading-none text-content">
        {value}
        {unit && <span className="ml-1 text-[10px] font-semibold text-muted">{unit}</span>}
      </div>
    </div>
  );
}

function formatElapsed(s: number): string {
  // AnimatedNumber hands the formatter fractional intermediates while it
  // eases between ticks — floor so the HUD counts whole seconds only.
  const whole = Math.floor(s);
  const m = Math.floor(whole / 60);
  const sec = whole % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
