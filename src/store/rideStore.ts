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
  routeT: number; // fractional index along DEMO_ROUTE
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

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Interpolate a position along the demo route for a fractional index. */
function positionAt(t: number): GeoPoint {
  const n = DEMO_ROUTE.length;
  const wrapped = ((t % (n - 1)) + (n - 1)) % (n - 1);
  const i = Math.floor(wrapped);
  const frac = wrapped - i;
  const a = DEMO_ROUTE[i];
  const b = DEMO_ROUTE[Math.min(i + 1, n - 1)];
  return {
    latitude: lerp(a.latitude, b.latitude, frac),
    longitude: lerp(a.longitude, b.longitude, frac),
  };
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
  routeT: 0,
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
      routeT: 0,
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
      const routeT = s.routeT + 0.06;
      return {
        elapsedS,
        speedKmh,
        routeT,
        position: positionAt(routeT),
        distanceKm: s.distanceKm + speedKmh / 3600,
      };
    }),

  startAnalysis: (a) =>
    set((s) => ({
      phase: "manoeuvre",
      // Snap the map to where the manoeuvre happened so the hazard lines up.
      position: a.scenario.location,
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
      routeT: 0,
      speedKmh: START_SPEED,
      distanceKm: 0,
      elapsedS: 0,
      startedAt: null,
      scoreAtStart: null,
      analysis: null,
    }),
}));
