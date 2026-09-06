import { useRideStore } from "@/store/rideStore";
import { Icon } from "@/components/ui/Icon";

/** Live telemetry overlaid on the ride map: speed, distance, elapsed + status. */
export function RideHud({ onExit }: { onExit?: () => void }) {
  const speedKmh = useRideStore((s) => s.speedKmh);
  const distanceKm = useRideStore((s) => s.distanceKm);
  const elapsedS = useRideStore((s) => s.elapsedS);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4">
      <div className="flex items-start justify-between">
        {/* Status pill */}
        <div className="glass flex items-center gap-2 rounded-full px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <span className="text-xs font-semibold text-content">Vouch monitoring</span>
        </div>

        {onExit && (
          <button
            onClick={onExit}
            aria-label="End ride"
            className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full glass text-muted transition hover:text-content"
          >
            <Icon name="X" className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Telemetry cluster */}
      <div className="mt-3 flex items-stretch gap-2">
        <HudTile value={String(speedKmh)} unit="km/h" />
        <HudTile value={distanceKm.toFixed(1)} unit="km" />
        <HudTile value={formatElapsed(elapsedS)} unit="time" />
      </div>
    </div>
  );
}

function HudTile({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="glass rounded-2xl px-3.5 py-2">
      <div className="tnum text-2xl font-extrabold leading-none text-content">{value}</div>
      <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
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
