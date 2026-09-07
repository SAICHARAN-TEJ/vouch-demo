import { useId, useMemo } from "react";
import type { GeoPoint, RoadEvent, RoadEventType } from "@/types";
import { DEMO_ROUTE } from "@/config/demoData";
import { ROAD_EVENT_LABEL } from "@/config/labels";
import { cn } from "@/lib/cn";

/**
 * Dependency-free schematic map: projects lat/lng onto an SVG. Used for the live
 * ride (keeps the hero flow off WebGL for reliability) and as the fallback when
 * MapLibre can't initialise (PRD §49).
 *
 * Light basemap per spec §4 Road Map: #f0f3ff base, #dee8ff arterial casing
 * with a white core, soft greenspace blobs, route casing #0f5257 under a
 * dashed #003a3e line, and the reference marker grammar: the featured hazard
 * (explicit highlightId, else highest confidence) gets a label chip + stem +
 * dot stack; other hazards render as tonal dots with white rims.
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

/** Label-chip inks pairing AA with each tonal fill (mirrors VouchMap). */
const CHIP_TEXT: Record<RoadEventType, string> = {
  pothole: "fill-on-secondary-fixed",
  speed_breaker: "fill-on-primary",
  waterlogging: "fill-on-primary",
  debris: "fill-on-primary",
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

/** The featured hazard: explicit highlight, else the highest-confidence event. */
function topHazard(roadEvents: RoadEvent[], highlightId?: string): RoadEvent | undefined {
  if (highlightId !== undefined) {
    return roadEvents.find((e) => e.id === highlightId);
  }
  if (!roadEvents.length) return undefined;
  return roadEvents.reduce(
    (best, ev) => (ev.confidence > best.confidence ? ev : best),
    roadEvents[0],
  );
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
  const chipId = `${mapId}-chip`;
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

  const top = topHazard(roadEvents, highlightId);
  const rest = top ? roadEvents.filter((e) => e.id !== top.id) : roadEvents;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label="Road map"
    >
      <defs>
        {/* Spec basemap grid: #dee8ff at 0.6 opacity, 0.75 width, 40u pitch. */}
        <pattern id={gridId} width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M40 0H0V40"
            fill="none"
            stroke="#dee8ff"
            strokeOpacity="0.6"
            strokeWidth="0.75"
          />
        </pattern>
      </defs>

      {/* Base canvas */}
      <rect width={W} height={H} fill="#f0f3ff" />
      <rect width={W} height={H} fill={`url(#${gridId})`} />

      {/* Greenspace blobs — soft tonal texture per spec */}
      <ellipse cx="60" cy="70" rx="52" ry="30" fill="#d8e3fb" opacity="0.5" />
      <ellipse cx="262" cy="360" rx="60" ry="38" fill="#d8e3fb" opacity="0.45" />
      <ellipse cx="250" cy="90" rx="34" ry="22" fill="#d8e3fb" opacity="0.4" />

      {/* Arterial roads: #dee8ff casing + white core */}
      <path
        d="M0 210 C 80 200, 130 235, 200 225 S 320 200, 320 200"
        fill="none"
        stroke="#dee8ff"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M0 210 C 80 200, 130 235, 200 225 S 320 200, 320 200"
        fill="none"
        stroke="#ffffff"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M160 0 C 150 90, 190 130, 175 210 S 150 340, 160 420"
        fill="none"
        stroke="#dee8ff"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M160 0 C 150 90, 190 130, 175 210 S 150 340, 160 420"
        fill="none"
        stroke="#ffffff"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {showRoute && (
        <>
          {/* Casing: deep teal under-stroke at low opacity */}
          <path
            d={routePath}
            fill="none"
            stroke="#0f5257"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
          {/* Route: deep teal dash on top */}
          <path
            d={routePath}
            fill="none"
            stroke="#003a3e"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2 2"
          />
        </>
      )}

      {/* Secondary hazard dots — tonal fills with white rims. */}
      {rest.map((ev) => {
        const { x, y } = project(ev);
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
            className={cn(
              onSelect &&
                "group cursor-pointer focus-visible:outline-none",
            )}
          >
            {onSelect && (
              <circle
                r="22"
                fill="transparent"
                pointerEvents="all"
                className="stroke-transparent stroke-0 transition-colors duration-fast group-focus-visible:stroke-primary group-focus-visible:stroke-[3px]"
              />
            )}
            <circle r={r} className={cn(FILL[ev.type], "opacity-95")} />
            <circle r={r} fill="none" stroke="rgb(255 255 255 / 0.9)" strokeWidth="1.5" />
          </g>
        );
      })}

      {/* Featured hazard: label chip + stem + dot stack (reference marker). */}
      {top && (() => {
        const { x, y } = project(top);
        const r = 6.5 + top.confidence * 3.5;
        const label = ROAD_EVENT_LABEL[top.type];
        // Measure-free label sizing: ~7px per char + padding, clamped to canvas.
        const chipW = Math.min(W - 2 * PAD, label.length * 7 + 10);
        const chipH = 16;
        const chipX = Math.max(PAD - 12, Math.min(W - PAD + 12 - chipW, x - chipW / 2));
        const chipY = Math.max(6, y - 46);
        return (
          <g
            data-testid="featured-hazard"
            transform={`translate(${x} ${y})`}
            onClick={() => onSelect?.(top.id)}
            onKeyDown={(event) => {
              if (onSelect && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                onSelect(top.id);
              }
            }}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={onSelect ? `${ROAD_EVENT_LABEL[top.type]} details` : undefined}
            className={cn(onSelect && "group cursor-pointer focus-visible:outline-none")}
          >
            {onSelect && (
              <circle
                r="26"
                fill="transparent"
                pointerEvents="all"
                className="stroke-transparent stroke-0 transition-colors duration-fast group-focus-visible:stroke-primary group-focus-visible:stroke-[3px]"
              />
            )}
            {/* Highlight pulse — solid ring, scale/opacity only. */}
            <circle
              r={r}
              className="fill-primary/25 animate-pulse-ring motion-reduce:animate-none"
              style={{ transformOrigin: "center" }}
            />
            <circle r={r} className={cn(FILL[top.type], "opacity-95")} />
            <circle r={r} fill="none" stroke="rgb(255 255 255 / 0.9)" strokeWidth="1.5" />
            {/* Stem from dot to chip */}
            <line
              x1="0"
              y1={-r}
              x2={chipX - x}
              y2={chipY + chipH - y}
              stroke="rgb(0 0 0 / 0.25)"
              strokeWidth="1"
            />
            {/* Label chip — positions in canvas space (undo translate). */}
            <g transform={`translate(${chipX - x} ${chipY - y})`}>
              <rect
                id={chipId}
                width={chipW}
                height={chipH}
                rx="4"
                className={FILL[top.type]}
              />
              <text
                x={chipW / 2}
                y={chipH / 2 + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                className={CHIP_TEXT[top.type]}
              >
                {label}
              </text>
            </g>
          </g>
        );
      })()}

      {rider && (
        <g transform={`translate(${project(rider).x} ${project(rider).y})`}>
          <circle r="13" className="fill-primary/20 animate-pulse-ring" style={{ transformOrigin: "center" }} />
          <circle r="6.5" className="fill-primary-container" />
          <circle r="6.6" fill="none" stroke="white" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}
