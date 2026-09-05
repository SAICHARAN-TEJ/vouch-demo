import { useEffect } from "react";
import { useRideStore } from "@/store/rideStore";

/** Advances the live-ride simulation once per second while actively riding. */
export function useRideSimulation() {
  const phase = useRideStore((s) => s.phase);
  useEffect(() => {
    if (phase !== "riding") return;
    const id = setInterval(() => useRideStore.getState().tick(), 1000);
    return () => clearInterval(id);
  }, [phase]);
}
