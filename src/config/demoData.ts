/**
 * Seeded demo data (PRD §19). Chennai demo coordinates — clearly synthetic,
 * used only to make the demo deterministic and repeatable. All road-event
 * numbers are chosen so the hero scenario visibly ticks the pothole up to the
 * exact figures shown on the Road Event screen (PRD §14): 8 reports / 7 riders
 * / 91% confidence, once THIS rider contributes a report.
 */
import type {
  GeoPoint,
  Rider,
  RiderEvent,
  RoadEvent,
  ScoreFactor,
} from "@/types";
import { offsetMeters } from "@/lib/geo";

/** Demo rider (a Chennai delivery rider). */
export const DEMO_SCORE_FACTORS: ScoreFactor[] = [
  { key: "context_aware", label: "Context-aware riding", delta: 8 },
  { key: "smooth_acceleration", label: "Smooth acceleration", delta: 4 },
  { key: "safe_braking", label: "Safe braking", delta: 3 },
  { key: "unexplained_manoeuvres", label: "Unexplained manoeuvres", delta: -2 },
];

export const DEMO_RIDER: Rider = {
  id: "rider-demo-1",
  name: "Rahul K.",
  vouchScore: 87,
  scoreFactors: DEMO_SCORE_FACTORS,
  totalDistance: 2847.6, // lifetime km
  createdAt: "2025-11-02T06:00:00.000Z",
};

/** Home dashboard figures (PRD §9). Today-scoped, distinct from lifetime. */
export const DEMO_TODAY_DISTANCE_KM = 18.4;

/** Synthetic demo day used by both local and Supabase history queries. */
export const DEMO_DAY_START_ISO = "2026-09-03T00:00:00.000Z";
export const DEMO_DAY_END_ISO = "2026-09-04T00:00:00.000Z";

/** Keep newly generated demo events on the same synthetic day as the seed. */
export function demoNow(): Date {
  const current = new Date();
  const demo = new Date(DEMO_DAY_START_ISO);
  demo.setUTCHours(
    current.getUTCHours(),
    current.getUTCMinutes(),
    current.getUTCSeconds(),
    current.getUTCMilliseconds(),
  );
  return demo;
}

/**
 * The rider's route through Chennai for the live ride (rough Anna Salai
 * corridor). The rider advances along these points during the simulation.
 */
export const DEMO_ROUTE: GeoPoint[] = [
  { latitude: 13.05, longitude: 80.234 },
  { latitude: 13.0545, longitude: 80.2385 },
  { latitude: 13.0602, longitude: 80.242 },
  { latitude: 13.0655, longitude: 80.2455 },
  { latitude: 13.07, longitude: 80.2498 },
  { latitude: 13.0748, longitude: 80.253 },
  { latitude: 13.08, longitude: 80.2568 },
  { latitude: 13.0847, longitude: 80.261 },
];

export const DEMO_START_POSITION: GeoPoint = DEMO_ROUTE[0];

/** Map center for the shared road map + live ride. */
export const CHENNAI_CENTER: GeoPoint = { latitude: 13.0674, longitude: 80.2478 };

/** The hero pothole's location (mid-route). */
export const HERO_POTHOLE_LOCATION: GeoPoint = { latitude: 13.07, longitude: 80.2498 };

/**
 * Where the rider is when the hero manoeuvre fires — ~8 m south of the pothole,
 * i.e. the pothole is "detected 8m ahead" (PRD §12).
 */
export const HERO_RIDER_LOCATION: GeoPoint = offsetMeters(
  HERO_POTHOLE_LOCATION,
  -8,
  0,
);

/** Stable id for the hero pothole so the scenario can target it. */
export const HERO_POTHOLE_ID = "road-pothole-hero";

/**
 * Seeded shared road events (PRD §19). Status follows the aggregation tiers
 * (PRD §22): 1 → possible, 3 → probable, 5+ → confirmed.
 */
export const SEED_ROAD_EVENTS: RoadEvent[] = [
  {
    id: HERO_POTHOLE_ID,
    type: "pothole",
    latitude: HERO_POTHOLE_LOCATION.latitude,
    longitude: HERO_POTHOLE_LOCATION.longitude,
    confidence: 0.88,
    status: "confirmed",
    reports: 7,
    riders: 6,
    firstDetected: "09:42",
    lastConfirmed: "10:18",
    createdAt: "2026-09-03T04:12:00.000Z",
    updatedAt: "2026-09-03T04:48:00.000Z",
  },
  {
    id: "road-speedbreaker-1",
    type: "speed_breaker",
    latitude: 13.0602,
    longitude: 80.2422,
    confidence: 0.84,
    status: "confirmed",
    reports: 5,
    riders: 4,
    firstDetected: "08:55",
    lastConfirmed: "10:02",
    createdAt: "2026-09-03T03:25:00.000Z",
    updatedAt: "2026-09-03T04:32:00.000Z",
  },
  {
    id: "road-waterlogging-1",
    type: "waterlogging",
    latitude: 13.0655,
    longitude: 80.245,
    confidence: 0.76,
    status: "probable",
    reports: 3,
    riders: 3,
    firstDetected: "09:10",
    lastConfirmed: "09:58",
    createdAt: "2026-09-03T03:40:00.000Z",
    updatedAt: "2026-09-03T04:28:00.000Z",
  },
  {
    id: "road-debris-1",
    type: "debris",
    latitude: 13.08,
    longitude: 80.2568,
    confidence: 0.69,
    status: "possible",
    reports: 2,
    riders: 2,
    firstDetected: "09:33",
    lastConfirmed: "09:47",
    createdAt: "2026-09-03T04:03:00.000Z",
    updatedAt: "2026-09-03T04:17:00.000Z",
  },
];

/**
 * Seeded rider event history for "Today" (PRD §17). These three establish the
 * Home dashboard's "Road Events: 3" (today's rider events) and demonstrate
 * that Vouch keeps a history, not a single verdict.
 */
export const SEED_RIDER_EVENTS: RiderEvent[] = [
  {
    id: "rider-event-seed-1",
    tripId: "trip-earlier-1",
    riderId: DEMO_RIDER.id,
    eventType: "lateral_manoeuvre",
    latitude: 13.0602,
    longitude: 80.242,
    motionData: {
      lateralG: 0.42,
      longitudinalG: -0.05,
      gyroZ: 28,
      speed: 34,
      timestamp: 0,
    },
    confidence: 0.9,
    createdAt: "2026-09-03T04:12:00.000Z",
    contextResult: {
      eventType: "lateral_manoeuvre",
      context: ["pothole_detected"],
      confidence: 0.9,
      verdict: "likely_justified",
      explanation:
        "Lateral movement coincided with a nearby pothole on the road.",
      signals: { motion: true, roadContext: true, rearApproach: false },
      nearbyEvent: null,
      cameraDetection: null,
      hazardDistanceM: 9,
    },
  },
  {
    id: "rider-event-seed-2",
    tripId: "trip-earlier-1",
    riderId: DEMO_RIDER.id,
    eventType: "hard_braking",
    latitude: 13.0655,
    longitude: 80.2455,
    motionData: {
      lateralG: 0.06,
      longitudinalG: -0.58,
      gyroZ: 4,
      speed: 41,
      timestamp: 0,
    },
    confidence: 0.86,
    createdAt: "2026-09-03T02:47:00.000Z",
    contextResult: {
      eventType: "hard_braking",
      context: ["obstacle_detected"],
      confidence: 0.82,
      verdict: "likely_justified",
      explanation: "Hard braking coincided with an obstacle detected ahead.",
      signals: { motion: true, roadContext: false, rearApproach: true },
      nearbyEvent: null,
      cameraDetection: null,
      hazardDistanceM: null,
    },
  },
  {
    id: "rider-event-seed-3",
    tripId: "trip-earlier-1",
    riderId: DEMO_RIDER.id,
    eventType: "lateral_manoeuvre",
    latitude: 13.0545,
    longitude: 80.2385,
    motionData: {
      lateralG: 0.38,
      longitudinalG: -0.02,
      gyroZ: 22,
      speed: 29,
      timestamp: 0,
    },
    confidence: 0.71,
    createdAt: "2026-09-03T02:21:00.000Z",
    contextResult: {
      eventType: "lateral_manoeuvre",
      context: [],
      confidence: 0.4,
      verdict: "context_unclear",
      explanation:
        "Lateral movement detected with no supporting road or surrounding context.",
      signals: { motion: true, roadContext: false, rearApproach: false },
      nearbyEvent: null,
      cameraDetection: null,
      hazardDistanceM: null,
    },
  },
];

/** Convenience: labels for display times of the seed history (PRD §17). */
export const SEED_RIDER_EVENT_TIMES: Record<string, string> = {
  "rider-event-seed-1": "09:42",
  "rider-event-seed-2": "08:17",
  "rider-event-seed-3": "07:51",
};

/** The rider's current in-progress trip. */
export const DEMO_TRIP_ID = "trip-live-1";

/** Deep clone helpers so the local repo can reset to pristine seed state. */
export function freshRoadEvents(): RoadEvent[] {
  return SEED_ROAD_EVENTS.map((e) => ({ ...e }));
}

export function freshRiderEvents(): RiderEvent[] {
  return SEED_RIDER_EVENTS.map((e) => ({
    ...e,
    contextResult: {
      ...e.contextResult,
      signals: { ...e.contextResult.signals },
      context: [...e.contextResult.context],
    },
    motionData: { ...e.motionData },
  }));
}

export function freshRider(): Rider {
  return {
    ...DEMO_RIDER,
    scoreFactors: DEMO_SCORE_FACTORS.map((factor) => ({ ...factor })),
  };
}

/** A helper used by history display to fetch a friendly timestamp. */
export function displayTimeForRiderEvent(ev: RiderEvent): string {
  return SEED_RIDER_EVENT_TIMES[ev.id] ?? formatClock(ev.createdAt);
}

function formatClock(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
