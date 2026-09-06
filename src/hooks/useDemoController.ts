import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getRepository } from "@/data";
import { analyseContext } from "@/engine/contextEngine";
import { strengthenRoadEvent } from "@/engine/aggregation";
import { sensorProvider } from "@/sensors";
import { cameraProvider } from "@/camera";
import { useScoreStore } from "@/store/scoreStore";
import { useRideStore } from "@/store/rideStore";
import { DEMO_RIDER, DEMO_TRIP_ID, demoNow } from "@/config/demoData";
import type { ScenarioDef } from "@/config/scenarios";
import type { RiderEvent, RoadEvent } from "@/types";
import { qk } from "./queries";

/**
 * Orchestrates a single demo manoeuvre end-to-end — the seam between the mock
 * providers and the real engine. The exact same pipeline would run for a real
 * Android sensor/camera event; only the trigger source differs (PRD §48).
 */
export function useDemoController() {
  const qc = useQueryClient();
  const activeRef = useRef(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trigger = useCallback(
    async (scenario: ScenarioDef) => {
      if (activeRef.current) return false;

      activeRef.current = true;
      setIsBusy(true);
      setError(null);

      try {
        const repo = await getRepository();
        if (useRideStore.getState().phase === "idle") {
          useRideStore.getState().startRide(useScoreStore.getState().score);
        }

        // 1. Producers emit real event objects from the scenario.
        const sensorEvent = sensorProvider.trigger(scenario);
        const cameraDetection = cameraProvider.trigger(scenario);
        const roadEvents = await repo.getRoadEvents();

        // 2. Deterministic engine reaches a verdict.
        const result = analyseContext({
          sensorEvent,
          location: scenario.location,
          nearbyRoadEvents: roadEvents,
          cameraDetection,
          timestamp: Date.now(),
        });

        // 3. Aggregation: strengthen the targeted hazard (shared intelligence).
        let affected: RoadEvent | null = null;
        const targetId = scenario.effect.strengthenRoadEventId;
        if (targetId) {
          const target = roadEvents.find((e) => e.id === targetId);
          if (target) {
            const added = await repo.addReport(target.id, DEMO_RIDER.id);
            affected = added
              ? strengthenRoadEvent(target, { newRider: scenario.effect.newRider, now: demoNow() })
              : target;
            if (added) await repo.saveRoadEvent(affected);
          }
        }

        // 4. Score + history.
        const scoreChange = useScoreStore.getState().applyEvent(result);
        const scoreState = useScoreStore.getState();
        const rider = await repo.getRider();
        await repo.saveRider({
          ...rider,
          vouchScore: scoreState.score,
          scoreFactors: scoreState.factors,
        });

        const riderEvent: RiderEvent = {
          id: `rider-event-${Date.now()}`,
          tripId: DEMO_TRIP_ID,
          riderId: DEMO_RIDER.id,
          eventType: result.eventType,
          latitude: scenario.location.latitude,
          longitude: scenario.location.longitude,
          motionData: sensorEvent.motion,
          contextResult: result,
          confidence: sensorEvent.confidence,
          createdAt: demoNow().toISOString(),
        };
        await repo.saveRiderEvent(riderEvent);

        // 5. Refresh dependent screens (Map / Home / History) + realtime peers.
        await Promise.all([
          qc.invalidateQueries({ queryKey: qk.roadEvents }),
          qc.invalidateQueries({ queryKey: qk.history }),
          qc.invalidateQueries({ queryKey: qk.rider }),
        ]);

        // 6. Kick off the on-screen hero overlay sequence.
        useRideStore.getState().startAnalysis({
          scenario,
          sensorEvent,
          cameraDetection,
          result,
          roadEvent: affected,
          scoreChange,
        });
        return true;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Demo scenario failed");
        return false;
      } finally {
        activeRef.current = false;
        setIsBusy(false);
      }
    },
    [qc],
  );

  const reset = useCallback(async () => {
    if (activeRef.current) return false;

    activeRef.current = true;
    setIsBusy(true);
    setError(null);

    try {
      const repo = await getRepository();
      await repo.resetDemo();
      useScoreStore.getState().reset();
      useRideStore.getState().resetRide();
      await qc.invalidateQueries();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Demo reset failed");
      return false;
    } finally {
      activeRef.current = false;
      setIsBusy(false);
    }
  }, [qc]);

  return { trigger, reset, isBusy, error };
}
