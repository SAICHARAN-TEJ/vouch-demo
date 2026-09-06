/**
 * Demo scenarios (PRD §18). Each scenario is a declarative description of the
 * raw signals a ride would produce. The Mock sensor/camera providers read these
 * to emit real `SensorEvent` / `CameraDetection` objects — identical in shape to
 * what an Android provider would emit — so the Context Engine and UI are
 * completely unaware they're being driven by a demo button (PRD §48).
 *
 * The hero scenario is `pothole_vehicle` → high-confidence "likely justified".
 */
import type {
  CameraDetection,
  GeoPoint,
  ManoeuvreType,
  MotionData,
} from "@/types";
import {
  DEMO_ROUTE,
  HERO_POTHOLE_ID,
  HERO_RIDER_LOCATION,
} from "./demoData";

export type ScenarioId =
  | "normal"
  | "pothole"
  | "sudden_brake"
  | "vehicle_approaching"
  | "pothole_vehicle"
  | "unexplained_swerve";

export type ScenarioTone = "neutral" | "positive" | "caution";

export interface ScenarioEffect {
  /** If set, this road event is strengthened with a new report. */
  strengthenRoadEventId?: string;
  /** Whether this rider counts as a new distinct reporter. */
  newRider?: boolean;
}

export interface ScenarioDef {
  id: ScenarioId;
  label: string;
  description: string;
  tone: ScenarioTone;
  isHero: boolean;
  /** Lucide icon name, resolved in the UI. */
  icon: string;
  sensor: {
    type: ManoeuvreType;
    confidence: number;
    /** Motion sample without a timestamp (added when the event is produced). */
    motion: Omit<MotionData, "timestamp">;
  };
  /** Rear-camera detection without a timestamp, or null if nothing detected. */
  camera: Omit<CameraDetection, "timestamp"> | null;
  /** Where the manoeuvre occurs (drives road-context proximity). */
  location: GeoPoint;
  effect: ScenarioEffect;
}

/** A location with no seeded hazard within the engine's nearby threshold. */
const CLEAR_LOCATION: GeoPoint = DEMO_ROUTE[1];

export const SCENARIOS: Record<ScenarioId, ScenarioDef> = {
  normal: {
    id: "normal",
    label: "Normal Ride",
    description: "Steady riding, no unusual movement.",
    tone: "neutral",
    isHero: false,
    icon: "Route",
    sensor: {
      type: "normal",
      confidence: 0.2,
      motion: { lateralG: 0.05, longitudinalG: -0.03, gyroZ: 3, speed: 31 },
    },
    camera: null,
    location: DEMO_ROUTE[5],
    effect: {},
  },

  pothole: {
    id: "pothole",
    label: "Pothole",
    description: "Swerve near a known pothole — road context only.",
    tone: "positive",
    isHero: false,
    icon: "CircleDot",
    sensor: {
      type: "lateral_manoeuvre",
      confidence: 0.86,
      motion: { lateralG: 0.45, longitudinalG: -0.06, gyroZ: 30, speed: 32 },
    },
    camera: null,
    location: HERO_RIDER_LOCATION,
    effect: { strengthenRoadEventId: HERO_POTHOLE_ID, newRider: true },
  },

  sudden_brake: {
    id: "sudden_brake",
    label: "Sudden Brake",
    description: "Hard braking as an obstacle is detected ahead.",
    tone: "positive",
    isHero: false,
    icon: "Octagon",
    sensor: {
      type: "hard_braking",
      confidence: 0.88,
      motion: { lateralG: 0.08, longitudinalG: -0.62, gyroZ: 5, speed: 44 },
    },
    camera: {
      object: "obstacle",
      relativeDistance: 12,
      relativeMotion: "approaching",
      confidence: 0.8,
    },
    location: CLEAR_LOCATION,
    effect: {},
  },

  vehicle_approaching: {
    id: "vehicle_approaching",
    label: "Vehicle Approaching",
    description: "Lateral shift as a vehicle closes in from behind.",
    tone: "positive",
    isHero: false,
    icon: "Car",
    sensor: {
      type: "lateral_manoeuvre",
      confidence: 0.84,
      motion: { lateralG: 0.5, longitudinalG: -0.05, gyroZ: 34, speed: 36 },
    },
    camera: {
      object: "vehicle",
      relativeDistance: 15,
      relativeMotion: "approaching",
      confidence: 0.82,
    },
    location: CLEAR_LOCATION,
    effect: {},
  },

  // ── HERO ────────────────────────────────────────────────────────────────
  pothole_vehicle: {
    id: "pothole_vehicle",
    label: "Pothole + Vehicle",
    description:
      "Sudden lateral movement — pothole ahead AND a vehicle approaching from behind.",
    tone: "positive",
    isHero: true,
    icon: "Zap",
    sensor: {
      type: "lateral_manoeuvre",
      confidence: 0.92,
      motion: { lateralG: 0.58, longitudinalG: -0.08, gyroZ: 41, speed: 38 },
    },
    camera: {
      object: "vehicle",
      relativeDistance: 14,
      relativeMotion: "approaching",
      confidence: 0.9,
    },
    location: HERO_RIDER_LOCATION,
    effect: { strengthenRoadEventId: HERO_POTHOLE_ID, newRider: true },
  },

  unexplained_swerve: {
    id: "unexplained_swerve",
    label: "Unexplained Swerve",
    description: "A swerve with no supporting road or surrounding context.",
    tone: "caution",
    isHero: false,
    icon: "HelpCircle",
    sensor: {
      type: "sudden_swerve",
      confidence: 0.8,
      motion: { lateralG: 0.52, longitudinalG: -0.04, gyroZ: 38, speed: 33 },
    },
    camera: null,
    location: CLEAR_LOCATION,
    effect: {},
  },
};

/** Ordered list for the demo control panel (PRD §18 order). */
export const SCENARIO_LIST: ScenarioDef[] = [
  SCENARIOS.normal,
  SCENARIOS.pothole,
  SCENARIOS.sudden_brake,
  SCENARIOS.vehicle_approaching,
  SCENARIOS.pothole_vehicle,
  SCENARIOS.unexplained_swerve,
];

export const HERO_SCENARIO_ID: ScenarioId = "pothole_vehicle";
