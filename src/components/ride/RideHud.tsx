import type { ReactNode } from "react";
import { useRideStore } from "@/store/rideStore";
import { Icon } from "@/components/ui/Icon";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";

/** Live telemetry overlaid on the ride map: speed, distance, elapsed + status. */
export function RideHud({ onExit }: { onExit?: () => void }) {
  const speedKmh = useRideStore((s) => s.speedKmh);
  const distanceKm = useRideStore((s) => s.distanceKm);
  const elapsedS = useRideStore((s) => s.elapsedS);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        {/* Status pill */}
        <div className="glass flex min-h-touch items-center gap-2 rounded-full px-3.5 py-1.5 shadow-raised">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-semibold tracking-wide text-content">Vouch monitoring</span>
        </div>

        {onExit && (
          <button
            onClick={onExit}
            aria-label="End ride"
            className="pointer-events-auto grid h-touch w-touch shrink-0 place-items-center rounded-control glass text-muted transition-[color,background-color] duration-micro hover:bg-content/[0.08] hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <Icon name="X" className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Telemetry cluster */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <HudTile value={<AnimatedNumber value={speedKmh} duration="fast" />} unit="km/h" />
        <HudTile value={<AnimatedNumber value={distanceKm} decimals={1} duration="fast" />} unit="km" />
        <HudTile
          value={<AnimatedNumber value={elapsedS} duration="fast" format={formatElapsed} />}
          unit="time"
        />
      </div>
    </div>
  );
}

function HudTile({ value, unit }: { value: ReactNode; unit: string }) {
  return (
    <div className="glass min-w-0 rounded-panel px-3 py-2.5 shadow-raised sm:px-3.5">
      <div className="metric truncate text-xl font-extrabold leading-none text-content sm:text-2xl">{value}</div>
      <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
        {unit}
      </div>
    </div>
  );
}

function formatElapsed(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
