import { useEffect } from "react";
import { useRideStore, type RidePhase } from "@/store/rideStore";

/**
 * Timed hero sequence. Each overlay phase auto-advances after a hold, so an
 * unattended run always completes; overlays also expose a tap-to-continue that
 * calls advance() directly, letting a presenter control the beat.
 */
const DURATIONS: Partial<Record<RidePhase, number>> = {
  manoeuvre: 1400,
  analysis: 2800,
  verdict: 3600,
  roadEvent: 5200,
  resumed: 1600,
};

export function useHeroSequence() {
  const phase = useRideStore((s) => s.phase);
  const runId = useRideStore((s) => s.analysis?.runId ?? 0);

  useEffect(() => {
    const d = DURATIONS[phase];
    if (!d) return;
    const t = setTimeout(() => useRideStore.getState().advance(), d);
    return () => clearTimeout(t);
  }, [phase, runId]);
}
