import { describe, expect, it } from "vitest";
import { DEMO_TRIP_ID, freshRoadEvents } from "@/config/demoData";
import { localRepo } from "./localRepo";

describe("local repository", () => {
  it("restores road events and history after reset", async () => {
    const seed = freshRoadEvents()[0];

    await localRepo.saveRoadEvent({ ...seed, reports: seed.reports + 1 });
    await localRepo.saveRiderEvent({
      id: "test-rider-event",
      tripId: DEMO_TRIP_ID,
      riderId: "rider-demo-1",
      eventType: "lateral_manoeuvre",
      latitude: seed.latitude,
      longitude: seed.longitude,
      motionData: {
        lateralG: 0.4,
        longitudinalG: 0,
        gyroZ: 20,
        speed: 30,
        timestamp: 1,
      },
      contextResult: {
        eventType: "lateral_manoeuvre",
        context: [],
        confidence: 0.4,
        verdict: "context_unclear",
        explanation: "Test event",
        signals: { motion: true, roadContext: false, rearApproach: false },
        nearbyEvent: null,
        cameraDetection: null,
        hazardDistanceM: null,
      },
      confidence: 0.8,
      createdAt: new Date().toISOString(),
    });

    await localRepo.resetDemo();

    await expect(localRepo.getRoadEvents()).resolves.toEqual(freshRoadEvents());
    await expect(localRepo.getHistory()).resolves.toHaveLength(3);
  });
});
