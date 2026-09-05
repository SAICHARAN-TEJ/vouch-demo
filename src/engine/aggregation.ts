/**
 * Road-event aggregation (PRD §22). Repeated, consistent rider observations
 * strengthen a hazard's confidence and status:
 *
 *   1 report   → possible
 *   3 reports  → probable
 *   5+ reports → confirmed
 *
 * The production version can swap in spatial clustering; the demo keeps it
 * deliberately simple and legible.
 */
import type { RoadEvent, RoadEventStatus, RoadEventType } from "@/types";

/** Each new consistent report nudges confidence up, with a hard cap. */
export const CONFIDENCE_STEP = 0.03;
export const CONFIDENCE_CAP = 0.97;
const NEW_EVENT_CONFIDENCE = 0.5;

export function statusForReports(reports: number): RoadEventStatus {
  if (reports >= 5) return "confirmed";
  if (reports >= 3) return "probable";
  return "possible";
}

function clampConfidence(value: number): number {
  return Math.min(CONFIDENCE_CAP, Math.max(0, Math.round(value * 100) / 100));
}

function clock(now: Date): string {
  return now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Strengthen an existing road event with a fresh report. Returns a NEW object
 * (never mutates) so React state updates cleanly. `newRider` widens the distinct
 * rider count; this is what turns the seeded hero pothole (7 reports / 6 riders
 * / 0.88) into the PRD §14 figures (8 / 7 / 0.91).
 */
export function strengthenRoadEvent(
  event: RoadEvent,
  opts: { newRider?: boolean; now?: Date } = {},
): RoadEvent {
  const now = opts.now ?? new Date();
  const reports = event.reports + 1;
  const riders = event.riders + (opts.newRider ? 1 : 0);
  return {
    ...event,
    reports,
    riders,
    confidence: clampConfidence(event.confidence + CONFIDENCE_STEP),
    status: statusForReports(reports),
    lastConfirmed: clock(now),
    updatedAt: now.toISOString(),
  };
}

/** Create a brand-new road event from a first observation. */
export function createRoadEvent(params: {
  id: string;
  type: RoadEventType;
  latitude: number;
  longitude: number;
  now?: Date;
}): RoadEvent {
  const now = params.now ?? new Date();
  const time = clock(now);
  return {
    id: params.id,
    type: params.type,
    latitude: params.latitude,
    longitude: params.longitude,
    confidence: NEW_EVENT_CONFIDENCE,
    status: statusForReports(1),
    reports: 1,
    riders: 1,
    firstDetected: time,
    lastConfirmed: time,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}
