import { create } from "zustand";
import type {
  CameraDetection,
  ContextResult,
  GeoPoint,
  RoadEvent,
  SensorEvent,
} from "@/types";
import type { ScenarioDef } from "@/config/scenarios";
import { DEMO_ROUTE, DEMO_START_POSITION, demoNow } from "@/config/demoData";
import { distanceMeters } from "@/lib/geo";

/**
 * The live-ride state machine (PRD hero flow). Screens 4–7 render as full-bleed
 * overlays driven by `phase`, so the whole hero sequence feels like one live
 * product rather than a set of routed pages.
 *
 *   idle → riding → manoeuvre → analysis → verdict → [roadEvent] → resumed → riding
 */
export type RidePhase =
  | "idle"
  | "riding"
  | "manoeuvre"
  | "analysis"
  | "verdict"
  | "roadEvent"
  | "resumed";

/** Everything produced by a single triggered manoeuvre, shown across overlays. */
export interface RideAnalysis {
  runId: number;
  scenario: ScenarioDef;
  sensorEvent: SensorEvent;
  cameraDetection: CameraDetection | null;
  result: ContextResult;
  /** The hazard strengthened/created by this manoeuvre, if any. */
  roadEvent: RoadEvent | null;
  scoreChange: number;
}

interface RideState {
  phase: RidePhase;
  position: GeoPoint;
  /** Distance travelled along the route, in km (0 → DEMO_ROUTE_LENGTH_KM). */
  routeKm: number;
  speedKmh: number;
  distanceKm: number;
  elapsedS: number;
  startedAt: string | null;
  scoreAtStart: number | null;
  analysis: RideAnalysis | null;

  startRide: (initialScore?: number) => void;
  endRide: () => void;
  tick: () => void;
  startAnalysis: (a: Omit<RideAnalysis, "runId">) => void;
  advance: () => void;
  resetRide: () => void;
}

const START_SPEED = 34;

/**
 * The map dot runs a few times faster than real time so a short demo session
 * still shows visible progress along the 7.3 km route. The HUD odometer and
 * trip distance stay real-time (speed × seconds); only the dot's pace along
 * the route is compressed.
 */
const TIME_SCALE = 6;

/** Cumulative distance in metres from the route start to each vertex. */
const ROUTE_METRES: number[] = (() => {
  const cum = [0];
  for (let i = 1; i < DEMO_ROUTE.length; i++) {
    cum.push(
      cum[i - 1] + distanceMeters(DEMO_ROUTE[i - 1], DEMO_ROUTE[i]),
    );
  }
  return cum;
})();

const ROUTE_LENGTH_KM = ROUTE_METRES[ROUTE_METRES.length - 1] / 1000;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Interpolate a position at a distance (km) along the route, wrapping. */
function positionAtKm(km: number): GeoPoint {
  const total = ROUTE_LENGTH_KM;
  const wrapped = ((km % total) + total) % total;
  const m = wrapped * 1000;
  // Binary search for the segment containing this metre mark.
  let lo = 0;
  let hi = ROUTE_METRES.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (ROUTE_METRES[mid] <= m) lo = mid;
    else hi = mid;
  }
  const segLen = ROUTE_METRES[hi] - ROUTE_METRES[lo] || 1;
  const frac = (m - ROUTE_METRES[lo]) / segLen;
  const a = DEMO_ROUTE[lo];
  const b = DEMO_ROUTE[hi];
  return {
    latitude: lerp(a.latitude, b.latitude, frac),
    longitude: lerp(a.longitude, b.longitude, frac),
  };
}

/** Distance along the route (km) of the closest on-route point to p. */
function nearestRouteKm(p: GeoPoint): number {
  let bestM = 0;
  let bestD = Infinity;
  // Project p onto every segment; keep the closest hit.
  for (let i = 0; i < DEMO_ROUTE.length - 1; i++) {
    const a = DEMO_ROUTE[i];
    const b = DEMO_ROUTE[i + 1];
    const ax = a.longitude;
    const ay = a.latitude;
    const bx = b.longitude;
    const by = b.latitude;
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(
      0,
      Math.min(1, ((p.longitude - ax) * dx + (p.latitude - ay) * dy) / len2),
    );
    const qx = ax + dx * t;
    const qy = ay + dy * t;
    const d = (p.longitude - qx) ** 2 + (p.latitude - qy) ** 2;
    if (d < bestD) {
      bestD = d;
      bestM = ROUTE_METRES[i] + distanceMeters(a, { latitude: qy, longitude: qx });
    }
  }
  return bestM / 1000;
}

/** Next phase given the current one and whether an analysis produced a hazard. */
function nextPhase(phase: RidePhase, hasRoadEvent: boolean): RidePhase {
  switch (phase) {
    case "manoeuvre":
      return "analysis";
    case "analysis":
      return "verdict";
    case "verdict":
      return hasRoadEvent ? "roadEvent" : "resumed";
    case "roadEvent":
      return "resumed";
    case "resumed":
      return "riding";
    default:
      return phase;
  }
}

export const useRideStore = create<RideState>((set) => ({
  phase: "idle",
  position: DEMO_START_POSITION,
  routeKm: 0,
  speedKmh: START_SPEED,
  distanceKm: 0,
  elapsedS: 0,
  startedAt: null,
  scoreAtStart: null,
  analysis: null,

  startRide: (initialScore) =>
    set({
      phase: "riding",
      position: DEMO_START_POSITION,
      routeKm: 0,
      speedKmh: START_SPEED,
      distanceKm: 0,
      elapsedS: 0,
      startedAt: demoNow().toISOString(),
      scoreAtStart: initialScore ?? null,
      analysis: null,
    }),

  endRide: () => set({ phase: "idle", startedAt: null, scoreAtStart: null }),

  tick: () =>
    set((s) => {
      if (s.phase !== "riding") return s;
      const elapsedS = s.elapsedS + 1;
      const speedKmh = Math.round(START_SPEED + 6 * Math.sin(elapsedS / 3));
      // The dot moves TIME_SCALE× faster than the odometer so the demo shows
      // visible progress along the route within a short session.
      const routeKm = s.routeKm + (speedKmh * TIME_SCALE) / 3600;
      return {
        elapsedS,
        speedKmh,
        routeKm,
        position: positionAtKm(routeKm),
        distanceKm: s.distanceKm + speedKmh / 3600,
      };
    }),

  startAnalysis: (a) =>
    set((s) => ({
      phase: "manoeuvre",
      // Snap the map to where the manoeuvre happened so the hazard lines up.
      position: a.scenario.location,
      // Sync the route cursor to the same spot so resumed→riding continues
      // from here instead of teleporting back to the pre-manoeuvre point.
      routeKm: nearestRouteKm(a.scenario.location),
      analysis: { ...a, runId: (s.analysis?.runId ?? 0) + 1 },
    })),

  advance: () =>
    set((s) => {
      const next = nextPhase(s.phase, Boolean(s.analysis?.roadEvent));
      if (s.phase === "resumed") {
        return { phase: "riding", analysis: null };
      }
      return { phase: next };
    }),

  resetRide: () =>
    set({
      phase: "idle",
      position: DEMO_START_POSITION,
      routeKm: 0,
      speedKmh: START_SPEED,
      distanceKm: 0,
      elapsedS: 0,
      startedAt: null,
      scoreAtStart: null,
      analysis: null,
    }),
}));
