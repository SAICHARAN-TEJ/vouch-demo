import type { Rider, RiderEvent, RoadEvent, Trip } from "@/types";
import {
  DEMO_DAY_END_ISO,
  DEMO_DAY_START_ISO,
  DEMO_RIDER,
  DEMO_TODAY_DISTANCE_KM,
  freshRiderEvents,
  freshRider,
  freshRoadEvents,
} from "@/config/demoData";
import type { VouchRepository } from "./types";

/**
 * In-memory, seeded repository. This is the reliability backstop: the demo runs
 * end-to-end on this even with no Supabase credentials and no network (PRD §49).
 * State lives in module scope so every reader shares one instance.
 */
class LocalRepository implements VouchRepository {
  readonly source = "local" as const;

  private roadEvents: RoadEvent[] = freshRoadEvents();
  private history: RiderEvent[] = freshRiderEvents();
  private rider: Rider = freshRider();
  private trips: Trip[] = [];
  private reports = new Set<string>();

  async getRider(): Promise<Rider> {
    return { ...this.rider, scoreFactors: this.rider.scoreFactors.map((f) => ({ ...f })) };
  }

  async saveRider(rider: Rider): Promise<Rider> {
    this.rider = { ...rider, scoreFactors: rider.scoreFactors.map((f) => ({ ...f })) };
    return this.getRider();
  }

  async getTodayDistance(): Promise<number> {
    const tripDistance = this.trips
      .filter((trip) => trip.riderId === DEMO_RIDER.id)
      .filter((trip) => trip.startTime >= DEMO_DAY_START_ISO && trip.startTime < DEMO_DAY_END_ISO)
      .reduce((total, trip) => total + trip.distance, 0);
    return Math.max(DEMO_TODAY_DISTANCE_KM, Number(tripDistance.toFixed(1)));
  }

  async getRoadEvents(): Promise<RoadEvent[]> {
    return this.roadEvents.map((e) => ({ ...e }));
  }

  async getHistory(): Promise<RiderEvent[]> {
    return this.history
      .filter((event) => event.riderId === DEMO_RIDER.id)
      .filter((event) => event.createdAt >= DEMO_DAY_START_ISO && event.createdAt < DEMO_DAY_END_ISO)
      .map((e) => ({ ...e }));
  }

  async saveRoadEvent(event: RoadEvent): Promise<RoadEvent> {
    const idx = this.roadEvents.findIndex((e) => e.id === event.id);
    if (idx >= 0) this.roadEvents[idx] = { ...event };
    else this.roadEvents.push({ ...event });
    return { ...event };
  }

  async addReport(roadEventId: string, riderId: string): Promise<boolean> {
    const key = `${roadEventId}:${riderId}`;
    if (this.reports.has(key)) return false;
    this.reports.add(key);
    return true;
  }

  async saveRiderEvent(event: RiderEvent): Promise<RiderEvent> {
    this.history = [{ ...event }, ...this.history];
    return { ...event };
  }

  async saveTrip(trip: Trip): Promise<Trip> {
    const index = this.trips.findIndex((current) => current.id === trip.id);
    if (index >= 0) this.trips[index] = { ...trip };
    else this.trips.push({ ...trip });
    return { ...trip };
  }

  subscribeRoadEvents(): () => void {
    // No realtime locally; changes are applied optimistically by the caller.
    return () => {};
  }

  async resetDemo(): Promise<void> {
    this.roadEvents = freshRoadEvents();
    this.history = freshRiderEvents();
    this.rider = freshRider();
    this.trips = [];
    this.reports.clear();
  }
}

export const localRepo = new LocalRepository();
