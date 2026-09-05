import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRepository } from "@/data";
import type { Rider, RiderEvent, RoadEvent } from "@/types";

/** Central query keys so invalidation stays consistent across hooks. */
export const qk = {
  rider: ["rider"] as const,
  todayDistance: ["todayDistance"] as const,
  roadEvents: ["roadEvents"] as const,
  history: ["history"] as const,
  source: ["source"] as const,
};

export function useRider() {
  return useQuery<Rider>({
    queryKey: qk.rider,
    queryFn: async () => (await getRepository()).getRider(),
  });
}

export function useTodayDistance() {
  return useQuery<number>({
    queryKey: qk.todayDistance,
    queryFn: async () => (await getRepository()).getTodayDistance(),
  });
}

/** Road events + live subscription. Realtime (Supabase) invalidates the cache;
 *  the local adapter's subscribe is a no-op and we invalidate optimistically. */
export function useRoadEvents() {
  const qc = useQueryClient();
  const query = useQuery<RoadEvent[]>({
    queryKey: qk.roadEvents,
    queryFn: async () => (await getRepository()).getRoadEvents(),
  });

  useEffect(() => {
    let active = true;
    let unsub = () => {};
    getRepository().then((repo) => {
      if (!active) return;
      unsub = repo.subscribeRoadEvents(() =>
        qc.invalidateQueries({ queryKey: qk.roadEvents }),
      );
    });
    return () => {
      active = false;
      unsub();
    };
  }, [qc]);

  return query;
}

export function useHistory() {
  return useQuery<RiderEvent[]>({
    queryKey: qk.history,
    queryFn: async () => (await getRepository()).getHistory(),
  });
}

/** Which backend is actually serving data ("supabase" | "local"). */
export function useDataSource() {
  return useQuery<"supabase" | "local">({
    queryKey: qk.source,
    queryFn: async () => (await getRepository()).source,
    staleTime: Infinity,
  });
}
