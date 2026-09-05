/**
 * Human-readable labels shared by the Context Engine (for explanations) and
 * the UI. Central so wording stays consistent across screens.
 */
import type {
  ManoeuvreType,
  RoadEventStatus,
  RoadEventType,
  Verdict,
} from "@/types";

export const MANOEUVRE_LABEL: Record<ManoeuvreType, string> = {
  normal: "Normal riding",
  lateral_manoeuvre: "Lateral movement",
  hard_braking: "Hard braking",
  sudden_swerve: "Sudden swerve",
};

export const ROAD_EVENT_LABEL: Record<RoadEventType, string> = {
  pothole: "Pothole",
  speed_breaker: "Speed breaker",
  waterlogging: "Waterlogging",
  debris: "Road debris",
};

export const ROAD_EVENT_STATUS_LABEL: Record<RoadEventStatus, string> = {
  possible: "Possible",
  probable: "Probable",
  confirmed: "Confirmed",
};

/** Big verdict headline. Both justified tiers read "Likely Justified". */
export const VERDICT_LABEL: Record<Verdict, string> = {
  likely_justified: "Likely Justified",
  high_confidence_likely_justified: "Likely Justified",
  context_unclear: "Context Unclear",
};

/** Short qualifier shown under the verdict headline. */
export const VERDICT_QUALIFIER: Record<Verdict, string> = {
  likely_justified: "Based on available context",
  high_confidence_likely_justified: "High confidence · multiple signals",
  context_unclear: "Not enough supporting signals",
};

/** Turn a machine context tag (e.g. "pothole_detected") into a label. */
export function contextTagLabel(tag: string): string {
  const map: Record<string, string> = {
    pothole_detected: "Pothole detected",
    speed_breaker_detected: "Speed breaker detected",
    waterlogging_detected: "Waterlogging detected",
    debris_detected: "Road debris detected",
    vehicle_approaching: "Vehicle approaching",
    obstacle_detected: "Obstacle detected",
  };
  if (map[tag]) return map[tag];
  // Fallback: "some_tag" -> "Some tag"
  const s = tag.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
