import type { BadgeTone } from "@/components/ui/Badge";
import type {
  ManoeuvreType,
  RoadEventStatus,
  RoadEventType,
  Verdict,
} from "@/types";
import { isJustified } from "@/engine/contextEngine";

/** The question Vouch poses about a manoeuvre — the core "ask why" beat. */
export function manoeuvreQuestion(type: ManoeuvreType): string {
  switch (type) {
    case "hard_braking":
      return "Why did you brake?";
    case "sudden_swerve":
    case "lateral_manoeuvre":
      return "Why did you swerve?";
    default:
      return "What just happened?";
  }
}

/** Trust tier for the current Vouch Score — one definition across screens. */
export function trustLabel(score: number): string {
  if (score >= 85) return "Trusted rider";
  if (score >= 70) return "Building trust";
  return "New rider";
}

/**
 * A place name for demo coordinates. The demo route runs along Anna Salai
 * (Mount Road), so latitude bands map to calm corridor names — raw
 * coordinates stay in the location-lock footers where precision belongs.
 */
const CORRIDORS: { range: [number, number]; name: string }[] = [
  { range: [13.02, 13.028], name: "Saidapet stretch" },
  { range: [13.028, 13.036], name: "Little Mount" },
  { range: [13.036, 13.044], name: "Teynampet stretch" },
  { range: [13.044, 13.051], name: "Mount Road corridor" },
  { range: [13.051, 13.063], name: "Gemini Junction north" },
];

export function areaLabel(latitude: number, _longitude: number): string {
  const hit = CORRIDORS.find(
    (c) => latitude >= c.range[0] && latitude < c.range[1],
  );
  return hit?.name ?? "Chennai sector";
}

/** Badge/colour tone for a verdict. */
export function verdictTone(verdict: Verdict): BadgeTone {
  return isJustified(verdict) ? "justified" : "caution";
}

/** Icon name for a verdict headline. */
export function verdictIcon(verdict: Verdict): string {
  return isJustified(verdict) ? "ShieldCheck" : "ShieldQuestion";
}

/** Aggregation-status tone (confirmed → strong, possible → soft). */
export function statusTone(status: RoadEventStatus): BadgeTone {
  switch (status) {
    case "confirmed":
      return "justified";
    case "probable":
      return "info";
    default:
      return "caution";
  }
}

const HAZARD_TEXT: Record<RoadEventType, string> = {
  pothole: "text-hazard-pothole",
  speed_breaker: "text-hazard-speedbreaker",
  waterlogging: "text-hazard-waterlogging",
  debris: "text-hazard-debris",
};

const HAZARD_BG: Record<RoadEventType, string> = {
  pothole: "bg-hazard-pothole",
  speed_breaker: "bg-hazard-speedbreaker",
  waterlogging: "bg-hazard-waterlogging",
  debris: "bg-hazard-debris",
};

export function hazardText(type: RoadEventType): string {
  return HAZARD_TEXT[type];
}

export function hazardBg(type: RoadEventType): string {
  return HAZARD_BG[type];
}
