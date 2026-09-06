import { useId, useMemo } from "react";
import type { GeoPoint, RoadEvent, RoadEventType } from "@/types";
import { DEMO_ROUTE } from "@/config/demoData";
import { ROAD_EVENT_LABEL } from "@/config/labels";
import { cn } from "@/lib/cn";

/**
 * Dependency-free schematic map: projects lat/lng onto an SVG. Used for the live
 * ride (keeps the hero flow off WebGL for reliability) and as the fallback when
 * MapLibre can't initialise (PRD §49).
 */

const W = 320;
const H = 420;
const PAD = 34;

const FILL: Record<RoadEventType, string> = {
  pothole: "fill-hazard-pothole",
  speed_breaker: "fill-hazard-speedbreaker",
  waterlogging: "fill-hazard-waterlogging",
  debris: "fill-hazard-debris",
};

function bounds(points: GeoPoint[]) {
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };
}

export function SchematicMap({
  roadEvents,
  rider,
  highlightId,
  showRoute = true,
  onSelect,
  className,
}: {
  roadEvents: RoadEvent[];
  rider?: GeoPoint | null;
  highlightId?: string;
  showRoute?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const mapId = useId().replace(/:/g, "");
  const gridId = `${mapId}-grid`;
  const vignetteId = `${mapId}-vignette`;
  const project = useMemo(() => {
    const all: GeoPoint[] = [
      ...DEMO_ROUTE,
      ...roadEvents.map((e) => ({ latitude: e.latitude, longitude: e.longitude })),
      ...(rider ? [rider] : []),
    ];
    const b = bounds(all);
    const spanLat = Math.max(1e-5, b.maxLat - b.minLat);
    const spanLng = Math.max(1e-5, b.maxLng - b.minLng);
    return (p: GeoPoint) => ({
      x: PAD + ((p.longitude - b.minLng) / spanLng) * (W - 2 * PAD),
      y: PAD + ((b.maxLat - p.latitude) / spanLat) * (H - 2 * PAD),
    });
  }, [roadEvents, rider]);

  const routePath = useMemo(() => {
    return DEMO_ROUTE.map((p, i) => {
      const { x, y } = project(p);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
  }, [project]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="Road map"
    >
      <defs>
        <pattern id={gridId} width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M26 0H0V26" fill="none" stroke="rgb(var(--c-border) / 0.5)" strokeWidth="1" />
        </pattern>
        <radialGradient id={vignetteId} cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor="rgb(var(--c-primary) / 0.10)" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      <rect width={W} height={H} fill="rgb(var(--c-bg))" />
      <rect width={W} height={H} fill={`url(#${gridId})`} />
      <rect width={W} height={H} fill={`url(#${vignetteId})`} />

      {showRoute && (
        <path
          d={routePath}
          fill="none"
          stroke="rgb(var(--c-accent) / 0.55)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1 9"
        />
      )}

      {roadEvents.map((ev) => {
        const { x, y } = project(ev);
        const highlighted = ev.id === highlightId;
        const r = 5 + ev.confidence * 5;
        return (
          <g
            key={ev.id}
            transform={`translate(${x} ${y})`}
            onClick={() => onSelect?.(ev.id)}
            onKeyDown={(event) => {
              if (onSelect && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                onSelect(ev.id);
              }
            }}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={onSelect ? `${ROAD_EVENT_LABEL[ev.type]} details` : undefined}
            className={cn(onSelect && "cursor-pointer")}
          >
            {highlighted && (
              <circle r={r} className="fill-primary/40 animate-pulse-ring" style={{ transformOrigin: "center" }} />
            )}
            <circle r={r} className={cn(FILL[ev.type], "opacity-90")} />
            <circle r={r} fill="none" stroke="rgb(255 255 255 / 0.6)" strokeWidth="1.5" />
          </g>
        );
      })}

      {rider && (
        <g transform={`translate(${project(rider).x} ${project(rider).y})`}>
          <circle r="13" className="fill-accent/25 animate-pulse-ring" style={{ transformOrigin: "center" }} />
          <circle r="6.5" className="fill-accent" />
          <circle r="6.5" fill="none" stroke="white" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}
