import { useCallback, useEffect, useRef, useState } from "react";
import { getRepository } from "@/data";
import { DEMO_RIDER, DEMO_TRIP_ID, demoNow } from "@/config/demoData";
import { useRideStore } from "@/store/rideStore";
import { useScoreStore } from "@/store/scoreStore";
import { useQueryClient } from "@tanstack/react-query";
import { qk } from "./queries";

/** Persists the live ride snapshot without coupling the ride state machine to a backend. */
export function useTripPersistence() {
  const phase = useRideStore((state) => state.phase);
  const startedAt = useRideStore((state) => state.startedAt);
  const distanceKm = useRideStore((state) => state.distanceKm);
  const score = useScoreStore((state) => state.score);
  const scoreAtStart = useRideStore((state) => state.scoreAtStart);
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const startedAtRef = useRef(startedAt);
  const distanceRef = useRef(distanceKm);
  const scoreRef = useRef(score);
  const scoreAtStartRef = useRef(scoreAtStart ?? score);
  const finishedRef = useRef<string | null>(null);
  const initializedStartRef = useRef<string | null>(null);
  const pendingRef = useRef<Promise<boolean> | null>(null);

  startedAtRef.current = startedAt;
  distanceRef.current = distanceKm;
  scoreRef.current = score;
  if (scoreAtStart !== null) scoreAtStartRef.current = scoreAtStart;

  const persist = useCallback((endTime: string | null = null) => {
    const previous = pendingRef.current;
    const promise = (async (): Promise<boolean> => {
      if (previous) await previous.catch(() => false);
      const startTime = startedAtRef.current;
      if (!startTime) return true;

      try {
        const repo = await getRepository();
        await repo.saveTrip({
          id: DEMO_TRIP_ID,
          riderId: DEMO_RIDER.id,
          startTime,
          endTime,
          distance: Number(distanceRef.current.toFixed(3)),
          scoreChange: scoreRef.current - scoreAtStartRef.current,
          createdAt: startTime,
        });
        await queryClient.invalidateQueries({ queryKey: qk.todayDistance });
        if (endTime) {
          const rider = await repo.getRider();
          await repo.saveRider({
            ...rider,
            totalDistance: Number((rider.totalDistance + distanceRef.current).toFixed(3)),
          });
        }
        setError(null);
        return true;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to save ride");
        return false;
      }
    })();

    pendingRef.current = promise;
    void promise.then(() => {
      if (pendingRef.current === promise) pendingRef.current = null;
    });
    return promise;
  }, [queryClient]);

  useEffect(() => {
    if (phase === "idle" || !startedAt) return;

    if (initializedStartRef.current !== startedAt) {
      initializedStartRef.current = startedAt;
      scoreAtStartRef.current = scoreRef.current;
    }
    void persist();
    const timer = window.setInterval(() => {
      void persist();
    }, 5_000);
    return () => window.clearInterval(timer);
  }, [phase, startedAt, persist]);

  const finish = useCallback(async () => {
    const startTime = startedAtRef.current;
    if (!startTime || finishedRef.current === startTime) return true;
    const saved = await persist(demoNow().toISOString());
    if (saved) finishedRef.current = startTime;
    return saved;
  }, [persist]);

  return { finish, error };
}
