import type { Rider, RiderEvent, RoadEvent, Trip } from "@/types";

/**
 * The data-access contract used by the entire app. The UI and hooks depend only
 * on this interface — never on Supabase or the local store directly — so the
 * backend can be swapped or fall back transparently (PRD §28, §49).
 */
export interface VouchRepository {
  readonly source: "supabase" | "local";

  getRider(): Promise<Rider>;
  saveRider(rider: Rider): Promise<Rider>;
  getTodayDistance(): Promise<number>;
  getRoadEvents(): Promise<RoadEvent[]>;
  /** Rider event history, most recent first. */
  getHistory(): Promise<RiderEvent[]>;

  /** Insert or update a road event (used to strengthen/create hazards). */
  saveRoadEvent(event: RoadEvent): Promise<RoadEvent>;
  /** Record that a rider reported a hazard (audit trail for aggregation). */
  addReport(roadEventId: string, riderId: string): Promise<boolean>;
  /** Persist an analysed rider event to history. */
  saveRiderEvent(event: RiderEvent): Promise<RiderEvent>;
  /** Persist the current live-trip snapshot. */
  saveTrip(trip: Trip): Promise<Trip>;

  /**
   * Subscribe to road-event changes (realtime). `onChange` fires when any road
   * event is inserted/updated. Returns an unsubscribe function. The local
   * adapter is a no-op.
   */
  subscribeRoadEvents(onChange: () => void): () => void;

  /** Restore the demo to its pristine seeded state (PRD §18 Reset). */
  resetDemo(): Promise<void>;
}
