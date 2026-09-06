import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { GeoPoint, RoadEvent, RoadEventType } from "@/types";
import { CHENNAI_CENTER } from "@/config/demoData";
import { ROAD_EVENT_LABEL } from "@/config/labels";
import { cn } from "@/lib/cn";
import { SchematicMap } from "./SchematicMap";

const DEFAULT_STYLE =
  import.meta.env.VITE_MAP_STYLE_URL || "https://demotiles.maplibre.org/style.json";

// Literal class strings (statically present so Tailwind includes them).
function markerClass(type: RoadEventType, highlight: boolean): string {
  const color: Record<RoadEventType, string> = {
    pothole: "bg-hazard-pothole",
    speed_breaker: "bg-hazard-speedbreaker",
    waterlogging: "bg-hazard-waterlogging",
    debris: "bg-hazard-debris",
  };
  return cn(
    "block rounded-full ring-2 ring-white/80 shadow-lg cursor-pointer transition hover:scale-125",
    color[type],
    highlight ? "h-5 w-5 ring-primary animate-pulse" : "h-3.5 w-3.5",
  );
}

/**
 * Interactive map (MapLibre GL). Falls back to the schematic map if the GL
 * context or style fails to initialise, so the Map screen always renders.
 */
export function VouchMap({
  roadEvents,
  rider,
  highlightId,
  onSelect,
  className,
}: {
  roadEvents: RoadEvent[];
  rider?: GeoPoint | null;
  highlightId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}) {
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

    // If the style never loads (offline / no WebGL), fall back gracefully.
    const failTimer = setTimeout(() => {
      if (!cancelled && !readyRef.current) setFailed(true);
    }, 4500);

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

  // (Re)draw markers whenever data or readiness changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || failed || !ready) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const ev of roadEvents) {
      const el = document.createElement("button");
      el.className = markerClass(ev.type, ev.id === highlightId);
      el.type = "button";
      el.setAttribute("aria-label", `${ROAD_EVENT_LABEL[ev.type]} details`);
      el.onclick = () => onSelect?.(ev.id);
      markersRef.current.push(
        new maplibregl.Marker({ element: el })
          .setLngLat([ev.longitude, ev.latitude])
          .addTo(map),
      );
    }

    if (rider) {
      const el = document.createElement("div");
      el.className = "block h-4 w-4 rounded-full bg-accent ring-4 ring-accent/30";
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
          "absolute inset-0 transition-opacity duration-300",
          ready ? "opacity-100" : "opacity-0",
        )}
        aria-hidden={!ready}
      />
      {!ready && (
        <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-bg/80 px-2.5 py-1 text-[10px] font-semibold text-muted ring-1 ring-border/60">
          Loading live map
        </div>
      )}
    </div>
  );
}
