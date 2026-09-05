/**
 * Supabase row shapes (snake_case, as stored in Postgres) and the mapping
 * boundary to the camelCase domain model in `domain.ts`.
 *
 * Keeping DB rows separate from domain types means the rest of the app never
 * deals with snake_case, and a schema tweak only ripples through the mappers
 * in `data/supabaseRepo.ts`.
 */
import type {
  ContextResult,
  MotionData,
  RoadEvent,
  RoadEventStatus,
  RoadEventType,
  ScoreFactor,
} from "./domain";

export interface RoadEventRow {
  id: string;
  type: RoadEventType;
  latitude: number;
  longitude: number;
  confidence: number;
  status: RoadEventStatus;
  reports: number;
  riders: number;
  first_detected: string;
  last_confirmed: string;
  created_at: string;
  updated_at: string;
}

export interface RiderRow {
  id: string;
  name: string;
  vouch_score: number;
  score_factors: ScoreFactor[] | null;
  total_distance: number;
  created_at: string;
}

export interface TripRow {
  id: string;
  rider_id: string;
  start_time: string;
  end_time: string | null;
  distance: number;
  score_change: number;
  created_at: string;
}

export interface RiderEventRow {
  id: string;
  trip_id: string;
  rider_id: string;
  event_type: string;
  latitude: number;
  longitude: number;
  motion_data: MotionData;
  context_result: ContextResult;
  confidence: number;
  created_at: string;
}

export interface RoadReportRow {
  id: string;
  road_event_id: string;
  rider_id: string;
  created_at: string;
}

/** Map a Postgres road_events row to the domain RoadEvent. */
export function toRoadEvent(row: RoadEventRow): RoadEvent {
  return {
    id: row.id,
    type: row.type,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    confidence: Number(row.confidence),
    status: row.status,
    reports: row.reports,
    riders: row.riders,
    firstDetected: row.first_detected,
    lastConfirmed: row.last_confirmed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
