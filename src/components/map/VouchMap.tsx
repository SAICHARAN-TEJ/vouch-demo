import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { GeoPoint, RoadEvent, RoadEventType } from "@/types";
import { DEMO_ROUTE } from "@/config/demoData";
import { ROAD_EVENT_LABEL } from "@/config/labels";
import { cn } from "@/lib/cn";
import { useAnimationConfig } from "@/hooks/useAnimationConfig";
import { basemapStyle } from "./basemapStyle";
import { SchematicMap } from "./SchematicMap";

/**
 * Animation: marker entrance / ambient pulse / hover lift / recenter-flight
 * Trigger: markers (re)drawn on data change — 480ms scale-in entrance;
 *   the featured hazard and the rider dot carry an ambient 2s pulse ring;
 *   pointer hover lifts a hazard marker 180ms; the recenter button eases
 *   the camera back to the demo corridor over 600ms.
 * Duration: 480ms entrance (scale-in)  Easing: entrance curve
 *            600ms fitBounds camera ease (instant under reduced motion)
 *            2s infinite ambient pulse on featured markers
 * Properties: transform + opacity only — compositor-friendly, no layout.
 * Stagger: n/a
 * Reduced motion: entrance and pulse collapse via motion-reduce:animate-none;
 *   recenter uses duration 0 so the camera never animates.
 *
 * Interactive map (MapLibre GL) over a hand-built OpenFreeMap basemap style
 * (see basemapStyle.ts): the teal demo route corridor is drawn as GL line
 * layers, hazards render as confidence-sized DOM markers, and the camera
 * frames the whole corridor on load. Falls back to the schematic map if the
 * GL context or tiles never arrive, so the Map screen always renders.
 *
 * Marker grammar per spec §4 Road Map: the strongest hazard (or an explicit
 * highlightId) gets the reference label + stem + dot stack; every other
 * hazard renders as a tonal dot with a white rim and soft shadow, sized
 * by confidence so stronger signals read larger at a glance.
 */

/** Inline style (no style.json fetch); VITE_MAP_STYLE_URL can still override. */
const STYLE: string | StyleSpecification =
  import.meta.env.VITE_MAP_STYLE_URL || basemapStyle();

/** Camera frame: the whole demo corridor, clear of the chip deck + controls. */
const ROUTE_BOUNDS = new maplibregl.LngLatBounds();
for (const p of DEMO_ROUTE) {
  ROUTE_BOUNDS.extend([p.longitude, p.latitude]);
}
const FIT_PADDING = { top: 60, bottom: 80, left: 40, right: 40 };
const FIT_MAX_ZOOM = 14.2;

/** Tonal dot fills per hazard channel (spec §1 light system). */
const DOT_BG: Record<RoadEventType, string> = {
  pothole: "bg-hazard-pothole",
  speed_breaker: "bg-hazard-speedbreaker",
  waterlogging: "bg-hazard-waterlogging",
  debris: "bg-hazard-debris",
};

/** Ambient pulse fills for featured markers — same hue, low alpha. */
const PULSE_BG: Record<RoadEventType, string> = {
  pothole: "bg-hazard-pothole/40",
  speed_breaker: "bg-hazard-speedbreaker/40",
  waterlogging: "bg-hazard-waterlogging/40",
  debris: "bg-hazard-debris/40",
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
  // Width/height are set per-marker from confidence; only the tonal skin
  // and entrance live in classes. Entrance animates the visual span, so
  // the parent button's hover transform is never fought by a filling
  // animation.
  return cn(
    "block rounded-full ring-2 ring-white/90 shadow-raised animate-scale-in motion-reduce:animate-none",
    DOT_BG[type],
  );
}

/** Reference label + stem + pulsing dot stack for the featured hazard. */
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

  const dotWrap = document.createElement("span");
  dotWrap.className = "relative grid place-items-center";
  dotWrap.setAttribute("aria-hidden", "true");

  const pulse = document.createElement("span");
  pulse.className = cn(
    "absolute h-6 w-6 rounded-full animate-pulse-ring motion-reduce:animate-none",
    PULSE_BG[ev.type],
  );
  pulse.setAttribute("aria-hidden", "true");

  const dot = document.createElement("span");
  dot.className = cn(
    "relative h-3 w-3 rounded-full ring-2 ring-white/90 shadow-raised animate-scale-in motion-reduce:animate-none",
    DOT_BG[ev.type],
  );
  dot.setAttribute("aria-hidden", "true");

  dotWrap.append(pulse, dot);
  el.append(label, stem, dotWrap);
  el.onclick = () => onSelect?.(ev.id);
  return el;
}

/**
 * Recenter support: increment `recenterKey` from the parent to ease the
 * camera back to the demo corridor. The schematic fallback ignores it
 * (no camera).
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
  /** Increment to recenter the camera on the demo corridor. */
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
        style: STYLE,
        // Frame the whole demo corridor on first paint, keeping the chip
        // deck and the recenter control clear of the data.
        bounds: ROUTE_BOUNDS,
        fitBoundsOptions: {
          padding: FIT_PADDING,
          maxZoom: FIT_MAX_ZOOM,
          duration: 0,
        },
        attributionControl: false,
        // Demo-map tuning: north-up only, no fade or expired-tile refresh
        // work — fewer GPU frames per gesture on mobile.
        dragRotate: false,
        touchPitch: false,
        maxPitch: 0,
        fadeDuration: 0,
        refreshExpiredTiles: false,
        minZoom: 9,
        maxZoom: 17,
      });
    } catch {
      setFailed(true);
      return;
    }
    mapRef.current = map;

    // The vector tiles are OpenStreetMap data served by OpenFreeMap —
    // credit stays visible, tucked bottom-left away from the controls.
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: ["© OpenStreetMap contributors", "© OpenFreeMap"],
      }),
      "bottom-left",
    );

    map.on("error", () => {
      // Non-fatal once the style is in hand: a single tile 404 must not tear
      // down a working map (the previous handler failed on ANY error, so one
      // bad tile permanently hid the live map for the rest of the session).
      // Init-time failures — unreachable style, dead GL context — still fall
      // back immediately; the 8s style timer below backstops slow networks.
      if (!cancelled && !readyRef.current && !map.isStyleLoaded()) setFailed(true);
    });

    // If the style never loads (offline / no WebGL / slow mobile network),
    // fall back gracefully. 8s accommodates first-visit tile fetches on 3G.
    const failTimer = setTimeout(() => {
      if (!cancelled && !readyRef.current) setFailed(true);
    }, 8000);

    map.on("load", () => {
      if (cancelled) return;
      // Draw the demo route corridor as GL layers under the markers: solid
      // teal casing with the darker schematic dash on top, so the pre-load
      // schematic hands off to a matching view.
      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: DEMO_ROUTE.map((p) => [p.longitude, p.latitude]),
          },
        },
      });
      map.addLayer({
        id: "route-casing",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#0f5257",
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 5, 16, 11],
        },
      });
      map.addLayer({
        id: "route-dash",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#003a3e",
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 1.5, 16, 3],
          "line-dasharray": [1.2, 1.6],
        },
      });
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

  // Ease the camera back to the demo corridor when the parent asks (and the
  // map is ready). Reduced motion jumps instead of flying.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || recenterKey === 0) return;
    map.fitBounds(ROUTE_BOUNDS, {
      padding: FIT_PADDING,
      maxZoom: FIT_MAX_ZOOM,
      duration: a.reduced ? 0 : 600,
    });
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
              // Confidence-scaled: stronger signals read larger at a glance.
              const size = Math.max(16, Math.round(8 + ev.confidence * 16));
              visual.style.width = `${size}px`;
              visual.style.height = `${size}px`;
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
      el.className = "relative grid place-items-center";
      const pulse = document.createElement("span");
      pulse.className =
        "absolute h-8 w-8 rounded-full bg-primary/25 animate-pulse-ring motion-reduce:animate-none";
      const dot = document.createElement("span");
      dot.className =
        "relative h-3.5 w-3.5 rounded-full bg-primary ring-2 ring-white/90 shadow-raised animate-scale-in motion-reduce:animate-none";
      el.append(pulse, dot);
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
