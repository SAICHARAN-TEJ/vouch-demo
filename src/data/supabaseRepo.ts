import type { SupabaseClient } from "@supabase/supabase-js";
import type { Rider, RiderEvent, RoadEvent, Trip } from "@/types";
import type {
  RiderEventRow,
  RiderRow,
  RoadEventRow,
  TripRow,
} from "@/types/db";
import { toRoadEvent } from "@/types/db";
import { supabase } from "@/lib/supabase";
import {
  DEMO_DAY_END_ISO,
  DEMO_DAY_START_ISO,
  DEMO_RIDER,
  DEMO_TODAY_DISTANCE_KM,
  DEMO_TRIP_ID,
  freshRoadEvents,
  freshRider,
} from "@/config/demoData";
import type { VouchRepository } from "./types";

function client(): SupabaseClient {
  if (!supabase) throw new Error("Supabase is not configured");
  return supabase;
}

function toRoadEventRow(e: RoadEvent): RoadEventRow {
  return {
    id: e.id,
    type: e.type,
    latitude: e.latitude,
    longitude: e.longitude,
    confidence: e.confidence,
    status: e.status,
    reports: e.reports,
    riders: e.riders,
    first_detected: e.firstDetected,
    last_confirmed: e.lastConfirmed,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  };
}

function toRiderEventRow(e: RiderEvent): RiderEventRow {
  return {
    id: e.id,
    trip_id: e.tripId,
    rider_id: e.riderId,
    event_type: e.eventType,
    latitude: e.latitude,
    longitude: e.longitude,
    motion_data: e.motionData,
    context_result: e.contextResult,
    confidence: e.confidence,
    created_at: e.createdAt,
  };
}

function toRiderRow(rider: Rider): RiderRow {
  return {
    id: rider.id,
    name: rider.name,
    vouch_score: rider.vouchScore,
    score_factors: rider.scoreFactors,
    total_distance: rider.totalDistance,
    created_at: rider.createdAt,
  };
}

function toTripRow(trip: Trip): TripRow {
  return {
    id: trip.id,
    rider_id: trip.riderId,
    start_time: trip.startTime,
    end_time: trip.endTime,
    distance: trip.distance,
    score_change: trip.scoreChange,
    created_at: trip.createdAt,
  };
}

function fromRiderEventRow(row: RiderEventRow): RiderEvent {
  return {
    id: row.id,
    tripId: row.trip_id,
    riderId: row.rider_id,
    eventType: row.event_type as RiderEvent["eventType"],
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    motionData: row.motion_data,
    contextResult: row.context_result,
    confidence: Number(row.confidence),
    createdAt: row.created_at,
  };
}

function fromRiderRow(row: RiderRow): Rider {
  return {
    id: row.id,
    name: row.name,
    vouchScore: row.vouch_score,
    scoreFactors: row.score_factors ?? freshRider().scoreFactors,
    totalDistance: Number(row.total_distance),
    createdAt: row.created_at,
  };
}

function fromTripRow(row: TripRow): Trip {
  return {
    id: row.id,
    riderId: row.rider_id,
    startTime: row.start_time,
    endTime: row.end_time,
    distance: Number(row.distance),
    scoreChange: row.score_change,
    createdAt: row.created_at,
  };
}

class SupabaseRepository implements VouchRepository {
  readonly source = "supabase" as const;

  /** Ping the DB; false if unreachable or unmigrated → caller falls back. */
  async healthCheck(): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from("road_events")
        .select("id")
        .limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  async getRider(): Promise<Rider> {
    const { data, error } = await client()
      .from("riders")
      .select("*")
      .eq("id", DEMO_RIDER.id)
      .maybeSingle();
    if (error) throw new Error(`Unable to load rider: ${error.message}`);
    if (!data) return freshRider();
    return fromRiderRow(data as RiderRow);
  }

  async saveRider(rider: Rider): Promise<Rider> {
    const { data, error } = await client()
      .from("riders")
      .upsert(toRiderRow(rider))
      .select()
      .single();
    if (error || !data) {
      throw new Error(`Unable to save rider: ${error?.message ?? "no row returned"}`);
    }
    return fromRiderRow(data as RiderRow);
  }

  async getTodayDistance(): Promise<number> {
    const { data, error } = await client()
      .from("trips")
      .select("distance")
      .eq("rider_id", DEMO_RIDER.id)
      .gte("start_time", DEMO_DAY_START_ISO)
      .lt("start_time", DEMO_DAY_END_ISO);
    if (error) throw new Error(`Unable to load today's distance: ${error.message}`);
    const total = (data ?? []).reduce((sum, row) => sum + Number(row.distance), 0);
    return Math.max(DEMO_TODAY_DISTANCE_KM, Number(total.toFixed(1)));
  }

  async getRoadEvents(): Promise<RoadEvent[]> {
    const { data, error } = await client()
      .from("road_events")
      .select("*")
      .order("confidence", { ascending: false });
    if (error) throw new Error(`Unable to load road events: ${error.message}`);
    if (!data) return [];
    return (data as RoadEventRow[]).map(toRoadEvent);
  }

  async getHistory(): Promise<RiderEvent[]> {
    const { data, error } = await client()
      .from("rider_events")
      .select("*")
      .eq("rider_id", DEMO_RIDER.id)
      .gte("created_at", DEMO_DAY_START_ISO)
      .lt("created_at", DEMO_DAY_END_ISO)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Unable to load history: ${error.message}`);
    if (!data) return [];
    return (data as RiderEventRow[]).map(fromRiderEventRow);
  }

  async saveRoadEvent(event: RoadEvent): Promise<RoadEvent> {
    const { data, error } = await client()
      .from("road_events")
      .upsert(toRoadEventRow(event))
      .select()
      .single();
    if (error || !data) {
      throw new Error(`Unable to save road event: ${error?.message ?? "no row returned"}`);
    }
    return toRoadEvent(data as RoadEventRow);
  }

  async addReport(roadEventId: string, riderId: string): Promise<boolean> {
    const { data, error } = await client()
      .from("road_reports")
      .upsert(
        { road_event_id: roadEventId, rider_id: riderId },
        { onConflict: "road_event_id,rider_id", ignoreDuplicates: true },
      )
      .select("id")
      .maybeSingle();
    if (error) throw new Error(`Unable to save road report: ${error.message}`);
    return Boolean(data);
  }

  async saveRiderEvent(event: RiderEvent): Promise<RiderEvent> {
    const { data, error } = await client()
      .from("rider_events")
      .insert(toRiderEventRow(event))
      .select()
      .single();
    if (error || !data) {
      throw new Error(`Unable to save rider event: ${error?.message ?? "no row returned"}`);
    }
    return fromRiderEventRow(data as RiderEventRow);
  }

  async saveTrip(trip: Trip): Promise<Trip> {
    const { data, error } = await client()
      .from("trips")
      .upsert(toTripRow(trip))
      .select()
      .single();
    if (error || !data) {
      throw new Error(`Unable to save trip: ${error?.message ?? "no row returned"}`);
    }
    return fromTripRow(data as TripRow);
  }

  subscribeRoadEvents(onChange: () => void): () => void {
    if (!supabase) return () => {};
    const sb = supabase;
    const channel = sb
      .channel("road_events_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "road_events" },
        () => onChange(),
      )
      .subscribe();
    return () => {
      sb.removeChannel(channel);
    };
  }

  async resetDemo(): Promise<void> {
    const db = client();
    const seedEvents = freshRoadEvents();
    const roadDelete = await db.from("road_events").delete().neq("id", "__seed_reset_placeholder__");
    if (roadDelete.error) throw new Error(`Unable to reset road events: ${roadDelete.error.message}`);
    const roadSeed = await db.from("road_events").upsert(seedEvents.map(toRoadEventRow));
    if (roadSeed.error) throw new Error(`Unable to restore road events: ${roadSeed.error.message}`);

    const deletes = await Promise.all([
      db.from("rider_events").delete().eq("trip_id", DEMO_TRIP_ID),
      db.from("road_reports").delete().eq("rider_id", DEMO_RIDER.id),
      db.from("trips").delete().eq("id", DEMO_TRIP_ID),
      db.from("riders").upsert(toRiderRow(freshRider())),
    ]);
    const failure = deletes.find((result) => result.error);
    if (failure?.error) throw new Error(`Unable to reset demo: ${failure.error.message}`);
  }
}

export const supabaseRepo = new SupabaseRepository();
