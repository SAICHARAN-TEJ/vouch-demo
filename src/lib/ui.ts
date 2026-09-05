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
