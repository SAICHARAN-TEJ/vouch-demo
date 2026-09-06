/**
 * THE CONTEXT ENGINE — the heart of Vouch (PRD §20, §21).
 *
 * "Don't judge the action. Understand the context."
 *
 * Deterministic correlation logic. NO LLMs, no randomness — the same inputs
 * always yield the same verdict, which is exactly what a repeatable demo needs.
 * It correlates three investigative signals around a manoeuvre:
 *
 *   1. Motion        — was there an unusual movement?
 *   2. Road context  — is there a known hazard nearby?
 *   3. Rear context  — was something approaching from behind?
 *
 * and concludes with a contextual verdict, never an absolute "safe/unsafe".
 */
import type { ContextInput, ContextResult, RoadEvent } from "@/types";
import { distanceMeters } from "@/lib/geo";
import { MANOEUVRE_LABEL, ROAD_EVENT_LABEL } from "@/config/labels";

/** A road event within this many metres counts as "nearby" the manoeuvre. */
export const NEARBY_THRESHOLD_M = 60;

/** Minimum camera confidence for a rear detection to count as a signal. */
const MIN_CAMERA_CONFIDENCE = 0.5;

/** Fixed confidence tiers keep the demo deterministic and PRD-aligned (§14, §20). */
const CONFIDENCE = {
  bothSignals: 0.91,
  roadOnly: 0.79,
  rearOnly: 0.74,
  unclearManoeuvre: 0.4,
  noManoeuvre: 0.2,
} as const;

/** Find the closest known road event within the nearby threshold. */
function findNearbyHazard(
  input: ContextInput,
): { event: RoadEvent; distanceM: number } | null {
  let best: { event: RoadEvent; distanceM: number } | null = null;
  for (const event of input.nearbyRoadEvents) {
    const distanceM = distanceMeters(input.location, {
      latitude: event.latitude,
      longitude: event.longitude,
    });
    if (distanceM <= NEARBY_THRESHOLD_M && (!best || distanceM < best.distanceM)) {
      best = { event, distanceM };
    }
  }
  return best;
}

/** Compose a plain-language explanation from the signals that fired. */
function buildExplanation(
  input: ContextInput,
  hazard: RoadEvent | null,
  rearApproach: boolean,
): string {
  const move = MANOEUVRE_LABEL[input.sensorEvent.type];
  const isManoeuvre = input.sensorEvent.type !== "normal";

  if (!isManoeuvre) {
    return "Normal riding — no unusual manoeuvre detected.";
  }

  const hazardWord = hazard ? ROAD_EVENT_LABEL[hazard.type].toLowerCase() : null;
  const rearWord =
    input.cameraDetection?.object === "vehicle"
      ? "an approaching vehicle"
      : "an approaching obstacle";

  if (hazardWord && rearApproach) {
    return `${move} coincided with a nearby ${hazardWord} and ${rearWord} from behind.`;
  }
  if (hazardWord) {
    return `${move} coincided with a nearby ${hazardWord} on the road.`;
  }
  if (rearApproach) {
    return `${move} coincided with ${rearWord} from behind.`;
  }
  return `${move} detected with no supporting road or surrounding context.`;
}

/**
 * Correlate the inputs and produce a contextual verdict.
 * This is the single source of truth used by BOTH the demo path and (later)
 * the production path — they only differ in where the inputs come from.
 */
export function analyseContext(input: ContextInput): ContextResult {
  const isManoeuvre = input.sensorEvent.type !== "normal";

  // No manoeuvre → nothing to investigate. Vouch only gathers context to
  // explain a manoeuvre, so normal riding yields no context signals.
  if (!isManoeuvre) {
    return {
      eventType: input.sensorEvent.type,
      context: [],
      confidence: CONFIDENCE.noManoeuvre,
      verdict: "context_unclear",
      explanation: "Normal riding — no unusual manoeuvre detected.",
      signals: { motion: false, roadContext: false, rearApproach: false },
      nearbyEvent: null,
      cameraDetection: input.cameraDetection ?? null,
      hazardDistanceM: null,
    };
  }

  // Signal 2 — road context.
  const nearby = findNearbyHazard(input);
  const hasRoadContext = Boolean(nearby);

  // Signal 3 — rear/surrounding context.
  const cam = input.cameraDetection;
  const hasRearApproach = Boolean(
    cam &&
      cam.object !== "none" &&
      cam.relativeMotion === "approaching" &&
      cam.confidence >= MIN_CAMERA_CONFIDENCE,
  );

  const signals = {
    motion: isManoeuvre,
    roadContext: hasRoadContext,
    rearApproach: hasRearApproach,
  };

  // Build the machine context tags.
  const context: string[] = [];
  if (nearby) context.push(`${nearby.event.type}_detected`);
  if (hasRearApproach) {
    context.push(cam?.object === "vehicle" ? "vehicle_approaching" : "obstacle_detected");
  }

  // Verdict + confidence (PRD §21 deterministic rules). At this point a
  // manoeuvre is guaranteed (normal riding returned early above).
  let verdict: ContextResult["verdict"];
  let confidence: number;

  if (hasRoadContext && hasRearApproach) {
    verdict = "high_confidence_likely_justified";
    confidence = CONFIDENCE.bothSignals;
  } else if (hasRoadContext || hasRearApproach) {
    verdict = "likely_justified";
    confidence = hasRoadContext ? CONFIDENCE.roadOnly : CONFIDENCE.rearOnly;
  } else {
    verdict = "context_unclear";
    confidence = CONFIDENCE.unclearManoeuvre;
  }

  return {
    eventType: input.sensorEvent.type,
    context,
    confidence,
    verdict,
    explanation: buildExplanation(input, nearby?.event ?? null, hasRearApproach),
    signals,
    nearbyEvent: nearby?.event ?? null,
    cameraDetection: cam ?? null,
    hazardDistanceM: nearby ? Math.round(nearby.distanceM) : null,
  };
}

/** Convenience: is a verdict one of the "justified" tiers? */
export function isJustified(verdict: ContextResult["verdict"]): boolean {
  return (
    verdict === "likely_justified" ||
    verdict === "high_confidence_likely_justified"
  );
}
