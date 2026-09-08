/**
 * Seeded demo data (PRD §19). Chennai demo coordinates along the real Anna
 * Salai (Mount Road) alignment — used only to make the demo deterministic and
 * repeatable. All road-event numbers are chosen so the hero scenario visibly
 * ticks the pothole up to the exact figures shown on the Road Event screen
 * (PRD §14): 8 reports / 7 riders / 91% confidence, once THIS rider
 * contributes a report.
 */
import type {
  GeoPoint,
  Rider,
  RiderEvent,
  RoadEvent,
  ScoreFactor,
} from "@/types";

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
 * The rider's route through Chennai for the live ride: the real Anna Salai
 * (Mount Road) centerline, ~7.3 km from Saidapet to Gemini Junction. The
 * rider advances along these points during the simulation.
 */
export const DEMO_ROUTE: GeoPoint[] = [
  { latitude: 13.020375, longitude: 80.225136 },
  { latitude: 13.020694, longitude: 80.225313 },
  { latitude: 13.020730, longitude: 80.225393 },
  { latitude: 13.021199, longitude: 80.225435 },
  { latitude: 13.021861, longitude: 80.225775 },
  { latitude: 13.021962, longitude: 80.226072 },
  { latitude: 13.022111, longitude: 80.226072 },
  { latitude: 13.022411, longitude: 80.226163 },
  { latitude: 13.022442, longitude: 80.226641 },
  { latitude: 13.022666, longitude: 80.226730 },
  { latitude: 13.022722, longitude: 80.227125 },
  { latitude: 13.023184, longitude: 80.227466 },
  { latitude: 13.023568, longitude: 80.227496 },
  { latitude: 13.023614, longitude: 80.227658 },
  { latitude: 13.023724, longitude: 80.227800 },
  { latitude: 13.024039, longitude: 80.227994 },
  { latitude: 13.024043, longitude: 80.228159 },
  { latitude: 13.024188, longitude: 80.228385 },
  { latitude: 13.024372, longitude: 80.228482 },
  { latitude: 13.024561, longitude: 80.228955 },
  { latitude: 13.024843, longitude: 80.229256 },
  { latitude: 13.024966, longitude: 80.229560 },
  { latitude: 13.025082, longitude: 80.229604 },
  { latitude: 13.025325, longitude: 80.229838 },
  { latitude: 13.025540, longitude: 80.230284 },
  { latitude: 13.025690, longitude: 80.230295 },
  { latitude: 13.025758, longitude: 80.230660 },
  { latitude: 13.025863, longitude: 80.230777 },
  { latitude: 13.025901, longitude: 80.230963 },
  { latitude: 13.025959, longitude: 80.230974 },
  { latitude: 13.025965, longitude: 80.231368 },
  { latitude: 13.026092, longitude: 80.231427 },
  { latitude: 13.026211, longitude: 80.231709 },
  { latitude: 13.026388, longitude: 80.232321 },
  { latitude: 13.026400, longitude: 80.232521 },
  { latitude: 13.026464, longitude: 80.232554 },
  { latitude: 13.026496, longitude: 80.232890 },
  { latitude: 13.026685, longitude: 80.233073 },
  { latitude: 13.027361, longitude: 80.234384 },
  { latitude: 13.027628, longitude: 80.234603 },
  { latitude: 13.027896, longitude: 80.235392 },
  { latitude: 13.028025, longitude: 80.235620 },
  { latitude: 13.028160, longitude: 80.235676 },
  { latitude: 13.028197, longitude: 80.235783 },
  { latitude: 13.028904, longitude: 80.236359 },
  { latitude: 13.029344, longitude: 80.236847 },
  { latitude: 13.029617, longitude: 80.237318 },
  { latitude: 13.029796, longitude: 80.237419 },
  { latitude: 13.029824, longitude: 80.237702 },
  { latitude: 13.030070, longitude: 80.237739 },
  { latitude: 13.030453, longitude: 80.238431 },
  { latitude: 13.030746, longitude: 80.239143 },
  { latitude: 13.030769, longitude: 80.239395 },
  { latitude: 13.030823, longitude: 80.239457 },
  { latitude: 13.031031, longitude: 80.239503 },
  { latitude: 13.031051, longitude: 80.239661 },
  { latitude: 13.031198, longitude: 80.239959 },
  { latitude: 13.031217, longitude: 80.240240 },
  { latitude: 13.031959, longitude: 80.241684 },
  { latitude: 13.032121, longitude: 80.241754 },
  { latitude: 13.032203, longitude: 80.241845 },
  { latitude: 13.032203, longitude: 80.242111 },
  { latitude: 13.032232, longitude: 80.242183 },
  { latitude: 13.032388, longitude: 80.242234 },
  { latitude: 13.032401, longitude: 80.242470 },
  { latitude: 13.032601, longitude: 80.242526 },
  { latitude: 13.032626, longitude: 80.242763 },
  { latitude: 13.032758, longitude: 80.242922 },
  { latitude: 13.032946, longitude: 80.243297 },
  { latitude: 13.033248, longitude: 80.243525 },
  { latitude: 13.033381, longitude: 80.243731 },
  { latitude: 13.033530, longitude: 80.243803 },
  { latitude: 13.033612, longitude: 80.243910 },
  { latitude: 13.033868, longitude: 80.244321 },
  { latitude: 13.033908, longitude: 80.244460 },
  { latitude: 13.033988, longitude: 80.244467 },
  { latitude: 13.034144, longitude: 80.244913 },
  { latitude: 13.034471, longitude: 80.245059 },
  { latitude: 13.034748, longitude: 80.245545 },
  { latitude: 13.034834, longitude: 80.245563 },
  { latitude: 13.034842, longitude: 80.245646 },
  { latitude: 13.035173, longitude: 80.245991 },
  { latitude: 13.035560, longitude: 80.246031 },
  { latitude: 13.036068, longitude: 80.246205 },
  { latitude: 13.036103, longitude: 80.246185 },
  { latitude: 13.036213, longitude: 80.246323 },
  { latitude: 13.037415, longitude: 80.246421 },
  { latitude: 13.037510, longitude: 80.246638 },
  { latitude: 13.038173, longitude: 80.246682 },
  { latitude: 13.038417, longitude: 80.246787 },
  { latitude: 13.039083, longitude: 80.246837 },
  { latitude: 13.039216, longitude: 80.246971 },
  { latitude: 13.040069, longitude: 80.247050 },
  { latitude: 13.040093, longitude: 80.247179 },
  { latitude: 13.040747, longitude: 80.247307 },
  { latitude: 13.041116, longitude: 80.247307 },
  { latitude: 13.041139, longitude: 80.247377 },
  { latitude: 13.041439, longitude: 80.247388 },
  { latitude: 13.041446, longitude: 80.247423 },
  { latitude: 13.041733, longitude: 80.247378 },
  { latitude: 13.041750, longitude: 80.247429 },
  { latitude: 13.042391, longitude: 80.247492 },
  { latitude: 13.042503, longitude: 80.247631 },
  { latitude: 13.042922, longitude: 80.247656 },
  { latitude: 13.043031, longitude: 80.247778 },
  { latitude: 13.043510, longitude: 80.247846 },
  { latitude: 13.043532, longitude: 80.247906 },
  { latitude: 13.044723, longitude: 80.247976 },
  { latitude: 13.045213, longitude: 80.248083 },
  { latitude: 13.045404, longitude: 80.248083 },
  { latitude: 13.045712, longitude: 80.248266 },
  { latitude: 13.046821, longitude: 80.248370 },
  { latitude: 13.047104, longitude: 80.248593 },
  { latitude: 13.047243, longitude: 80.248625 },
  { latitude: 13.047310, longitude: 80.248732 },
  { latitude: 13.047415, longitude: 80.248738 },
  { latitude: 13.047563, longitude: 80.248842 },
  { latitude: 13.047643, longitude: 80.249035 },
  { latitude: 13.047897, longitude: 80.249272 },
  { latitude: 13.048105, longitude: 80.249347 },
  { latitude: 13.048265, longitude: 80.249509 },
  { latitude: 13.048550, longitude: 80.249630 },
  { latitude: 13.048919, longitude: 80.249708 },
  { latitude: 13.049338, longitude: 80.249728 },
  { latitude: 13.049837, longitude: 80.249842 },
  { latitude: 13.049857, longitude: 80.249900 },
  { latitude: 13.049338, longitude: 80.249822 },
  { latitude: 13.049293, longitude: 80.250362 },
  { latitude: 13.049283, longitude: 80.250534 },
  { latitude: 13.049670, longitude: 80.251823 },
  { latitude: 13.049599, longitude: 80.253116 },
  { latitude: 13.051757, longitude: 80.251426 },
  { latitude: 13.051954, longitude: 80.251161 },
  { latitude: 13.052059, longitude: 80.250858 },
  { latitude: 13.052193, longitude: 80.250734 },
  { latitude: 13.052391, longitude: 80.250756 },
  { latitude: 13.052523, longitude: 80.250859 },
  { latitude: 13.052604, longitude: 80.251155 },
  { latitude: 13.053444, longitude: 80.252351 },
  { latitude: 13.053471, longitude: 80.252455 },
  { latitude: 13.055737, longitude: 80.255518 },
  { latitude: 13.057495, longitude: 80.254864 },
  { latitude: 13.058196, longitude: 80.254249 },
  { latitude: 13.058397, longitude: 80.254175 },
  { latitude: 13.058994, longitude: 80.254145 },
  { latitude: 13.061626, longitude: 80.254465 },
  { latitude: 13.062353, longitude: 80.253018 },
  { latitude: 13.062019, longitude: 80.252792 },
  { latitude: 13.061686, longitude: 80.252723 },
  { latitude: 13.061704, longitude: 80.252559 },
];

export const DEMO_START_POSITION: GeoPoint = DEMO_ROUTE[0];

/** Map center for the shared road map + live ride. */
export const CHENNAI_CENTER: GeoPoint = { latitude: 13.0401, longitude: 80.2472 };

/** The hero pothole's location (mid-route). */
export const HERO_POTHOLE_LOCATION: GeoPoint = { latitude: 13.047472, longitude: 80.248778 };

/**
 * Where the rider is when the hero manoeuvre fires — ~8 m south of the pothole,
 * i.e. the pothole is "detected 8m ahead" (PRD §12).
 */
export const HERO_RIDER_LOCATION: GeoPoint = { latitude: 13.047412, longitude: 80.248738 };

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
    latitude: 13.028234,
    longitude: 80.235813,
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
    latitude: 13.033756,
    longitude: 80.244142,
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
    latitude: 13.056591,
    longitude: 80.2552,
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
    latitude: 13.047403,
    longitude: 80.248737,
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
    latitude: 13.037204,
    longitude: 80.246404,
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
    latitude: 13.025472,
    longitude: 80.230143,
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
