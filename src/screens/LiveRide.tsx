import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SchematicMap } from "@/components/map/SchematicMap";
import { RideHud } from "@/components/ride/RideHud";
import { DemoBar } from "@/components/ride/DemoBar";
import { HeroOverlay } from "@/components/ride/HeroOverlay";
import { useRoadEvents } from "@/hooks/queries";
import { useRideSimulation } from "@/hooks/useRideSimulation";
import { useHeroSequence } from "@/hooks/useHeroSequence";
import { useTripPersistence } from "@/hooks/useTripPersistence";
import { useRideStore } from "@/store/rideStore";
import { useScoreStore } from "@/store/scoreStore";

/**
 * The live ride — the stage for the whole hero flow. The map + HUD run
 * underneath; hero-flow beats render as overlays driven by `phase`.
 *
 * Full-bleed NO_NAV screen per AppShell. Light system per spec §4 Active Ride:
 * the SchematicMap paints the light basemap; soft tonal edge washes keep the
 * floating chrome legible without darkening the map body.
 */
export function LiveRide() {
  const navigate = useNavigate();
  const phase = useRideStore((s) => s.phase);
  const position = useRideStore((s) => s.position);
  const analysis = useRideStore((s) => s.analysis);
  const startRide = useRideStore((s) => s.startRide);
  const endRide = useRideStore((s) => s.endRide);
  const score = useScoreStore((s) => s.score);
  const { data: roadEvents = [] } = useRoadEvents();

  useRideSimulation();
  useHeroSequence();
  const { finish, error: tripError } = useTripPersistence();

  // Initialize once on entry. A mount-only effect prevents reset from
  // immediately restarting the ride while this route remains mounted.
  useEffect(() => {
    if (phase === "idle") startRide(score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exit = async () => {
    if (!(await finish())) return;
    endRide();
    navigate("/home");
  };

  // Pulse the affected hazard once the flow reaches the "shared intelligence" beat.
  const highlightId =
    (phase === "verdict" || phase === "roadEvent" || phase === "resumed") && analysis?.roadEvent
      ? analysis.roadEvent.id
      : undefined;

  return (
    <div className="relative h-full w-full overflow-hidden bg-surface-container-low">
      <SchematicMap
        roadEvents={roadEvents}
        rider={position}
        highlightId={highlightId}
        className="absolute inset-0"
      />
      {/* Soft tonal washes at the very edges so the floating HUD/DemoBar
          chrome stays legible over the light map. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-surface-container-low/85 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-surface-container-low/70 to-transparent" />

      <RideHud onExit={() => void exit()} />
      {tripError && (
        <div role="alert" className="pointer-events-none absolute left-4 right-4 top-28 z-20 rounded-xl bg-error-container px-3 py-2 text-xs text-on-error-container">
          {tripError}
        </div>
      )}
      <DemoBar />
      <HeroOverlay />
    </div>
  );
}
