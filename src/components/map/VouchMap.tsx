import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { GeoPoint, RoadEvent, RoadEventType } from "@/types";
import { CHENNAI_CENTER } from "@/config/demoData";
import { ROAD_EVENT_LABEL } from "@/config/labels";
import { cn } from "@/lib/cn";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";
import { SchematicMap } from "./SchematicMap";

/**
 * Animation: marker-hover / recenter-flight
 * Trigger: pointer hover on a hazard marker / recenter button press
 * Duration: 180ms hover transform  Easing: hover
 *            600ms flyTo camera ease (or instant jumpTo under reduced motion)
 * Properties: transform (translateY on markers; camera pan on recenter) —
 *   compositor-friendly, no layout
 * Stagger: n/a
 * Reduced motion: hover still lands via the global duration collapse;
 *   recenter uses jumpTo so the camera never animates.
 *
 * Interactive map (MapLibre GL). Falls back to the schematic map if the GL
 * context or style fails to initialise, so the Map screen always renders.
 *
 * Marker grammar per spec §4 Road Map: the strongest hazard (or an explicit
 * highlightId) gets the reference label + stem + dot stack; every other
 * hazard renders as a larger tonal dot with a white rim and soft shadow.
 */

const DEFAULT_STYLE =
  import.meta.env.VITE_MAP_STYLE_URL || "https://demotiles.maplibre.org/style.json";

/** Tonal dot fills per hazard channel (spec §1 light system). */
const DOT_BG: Record<RoadEventType, string> = {
  pothole: "bg-hazard-pothole",
  speed_breaker: "bg-hazard-speedbreaker",
  waterlogging: "bg-hazard-waterlogging",
  debris: "bg-hazard-debris",
};

/** Label-chip pairs for the top-hazard stack — all AA on their fills. */
const CHIP: Record<RoadEventType, string> = {
  pothole: "bg-hazard-pothole text-on-secondary-fixed",
  speed_breaker: "bg-hazard-speedbreaker text-on-primary",
  waterlogging: "bg-hazard-waterlogging text-on-primary",
  debris: "bg-hazard-debris text-on-primary",
};

/** The featured hazard: explicit highlight, else the highest-confidence event. */
function topHazardId(roadEvents: RoadEvent[], highlightId?: string): string | undefined {
  if (highlightId !== undefined) return highlightId;
  if (!roadEvents.length) return undefined;
  return roadEvents.reduce(
    (best, ev) => (ev.confidence > best.confidence ? ev : best),
    roadEvents[0],
  ).id;
}

// Literal class strings (statically present so Tailwind includes them).
function markerClass(): string {
  return cn(
    "tap-target group grid place-items-center rounded-full border-0 bg-transparent p-0 cursor-pointer transition-transform duration-micro ease-hover",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "hover:scale-125",
  );
}

function markerVisualClass(type: RoadEventType): string {
  return cn(
    "block h-4 w-4 rounded-full ring-2 ring-white/90 shadow-raised transition-transform",
    DOT_BG[type],
  );
}

/** Reference label + stem + dot stack for the featured hazard. */
function topMarkerElement(ev: RoadEvent, onSelect?: (id: string) => void): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.className = cn(
    "tap-target flex flex-col items-center gap-0.5 rounded border-0 bg-transparent p-0 cursor-pointer",
    "transition-transform duration-micro ease-hover hover:-translate-y-0.5",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  );
  // The accessible name is applied by the caller after the marker is added
  // to the map — MapLibre stamps its default ("Map marker") onto the
  // element during construction, clobbering any name set beforehand.

  const label = document.createElement("span");
  label.className = cn(
    "whitespace-nowrap rounded px-2.5 py-1 text-[11px] font-semibold shadow-raised",
    CHIP[ev.type],
  );
  label.textContent = ROAD_EVENT_LABEL[ev.type];
  label.setAttribute("aria-hidden", "true");

  const stem = document.createElement("span");
  stem.className = cn("h-3 w-0.5", DOT_BG[ev.type]);
  stem.setAttribute("aria-hidden", "true");

  const dot = document.createElement("span");
  dot.className = cn(
    "h-3 w-3 rounded-full ring-2 ring-white/90 shadow-raised",
    DOT_BG[ev.type],
  );
  dot.setAttribute("aria-hidden", "true");

  el.append(label, stem, dot);
  el.onclick = () => onSelect?.(ev.id);
  return el;
}

/**
 * Recenter support: increment `recenterKey` from the parent to ease the camera
 * back to CHENNAI_CENTER. The schematic fallback ignores it (no camera).
 */
export function VouchMap({
  roadEvents,
  rider,
  highlightId,
  recenterKey = 0,
  onSelect,
  className,
}: {
  roadEvents: RoadEvent[];
  rider?: GeoPoint | null;
  highlightId?: string;
  /** Increment to recenter the camera on CHENNAI_CENTER. */
  recenterKey?: number;
  onSelect?: (id: string) => void;
  className?: string;
}) {
  const a = useAnimationConfig();
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const readyRef = useRef(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  // Initialise the map once.
  useEffect(() => {
    if (!ref.current || failed) return;
    let cancelled = false;
    let map: maplibregl.Map;
    readyRef.current = false;
    try {
      map = new maplibregl.Map({
        container: ref.current,
        style: DEFAULT_STYLE,
        center: [CHENNAI_CENTER.longitude, CHENNAI_CENTER.latitude],
        zoom: 12.3,
        attributionControl: false,
      });
    } catch {
      setFailed(true);
      return;
    }
    mapRef.current = map;

    map.on("error", () => {
      if (!cancelled) setFailed(true);
    });

    // If the style never loads (offline / no WebGL / slow mobile network),
    // fall back gracefully. 8s accommodates first-visit tile fetches on 3G.
    const failTimer = setTimeout(() => {
      if (!cancelled && !readyRef.current) setFailed(true);
    }, 8000);

    map.on("load", () => {
      if (cancelled) return;
      clearTimeout(failTimer);
      readyRef.current = true;
      setReady(true);
    });

    return () => {
      cancelled = true;
      clearTimeout(failTimer);
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      readyRef.current = false;
      setReady(false);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failed]);

  // Recenter the camera when the parent asks (and the map is ready).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || recenterKey === 0) return;
    const center: [number, number] = [
      CHENNAI_CENTER.longitude,
      CHENNAI_CENTER.latitude,
    ];
    if (a.reduced) {
      map.jumpTo({ center, zoom: 12.3 });
    } else {
      map.flyTo({ center, zoom: 12.3, duration: 600 });
    }
  }, [recenterKey, ready, a.reduced]);

  // (Re)draw markers whenever data or readiness changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || failed || !ready) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const topId = topHazardId(roadEvents, highlightId);

    for (const ev of roadEvents) {
      const el =
        ev.id === topId
          ? topMarkerElement(ev, onSelect)
          : (() => {
              const btn = document.createElement("button");
              btn.className = markerClass();
              btn.type = "button";
              const visual = document.createElement("span");
              visual.className = markerVisualClass(ev.type);
              visual.setAttribute("aria-hidden", "true");
              btn.appendChild(visual);
              btn.onclick = () => onSelect?.(ev.id);
              return btn;
            })();

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([ev.longitude, ev.latitude])
        .addTo(map);
      // Re-apply the accessible name after construction — MapLibre's default
      // ("Map marker") is stamped onto the element during addTo, clobbering
      // any name set beforehand. Post-addTo names persist.
      el.setAttribute("aria-label", `${ROAD_EVENT_LABEL[ev.type]} details`);
      markersRef.current.push(marker);
    }

    if (rider) {
      const el = document.createElement("div");
      el.className = "block h-4 w-4 rounded-full bg-primary ring-4 ring-primary/25";
      markersRef.current.push(
        new maplibregl.Marker({ element: el })
          .setLngLat([rider.longitude, rider.latitude])
          .addTo(map),
      );
    }
  }, [roadEvents, rider, highlightId, onSelect, failed, ready]);

  if (failed) {
    return (
      <SchematicMap
        roadEvents={roadEvents}
        rider={rider}
        highlightId={highlightId}
        onSelect={onSelect}
        className={className}
      />
    );
  }

  return (
    <div className={cn("relative h-full w-full", className)}>
      {/* Keep the map useful while remote tiles/style data are loading. */}
      <SchematicMap
        roadEvents={roadEvents}
        rider={rider}
        highlightId={highlightId}
        onSelect={onSelect}
        className={cn("absolute inset-0", ready && "pointer-events-none opacity-0")}
      />
      <div
        ref={ref}
        className={cn(
          "absolute inset-0 transition-opacity duration-fast",
          ready ? "opacity-100" : "opacity-0",
        )}
        aria-hidden={!ready}
      />
      {!ready && (
        /* Sits below the host screen's top chip deck so the two never collide. */
        <div className="pointer-events-none absolute right-3 top-16 rounded-lg bg-surface-container-lowest px-2.5 py-1 text-[10px] font-semibold text-muted shadow-raised">
          Loading live map
        </div>
      )}
    </div>
  );
}
