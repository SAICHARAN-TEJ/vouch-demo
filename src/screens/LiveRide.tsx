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
export function LiveRide() { const navigate = useNavigate(); const phase = useRideStore((s) => s.phase); const position = useRideStore((s) => s.position); const analysis = useRideStore((s) => s.analysis); const startRide = useRideStore((s) => s.startRide); const endRide = useRideStore((s) => s.endRide); const score = useScoreStore((s) => s.score); const { data: roadEvents = [] } = useRoadEvents(); useRideSimulation(); useHeroSequence(); const { finish, error: tripError } = useTripPersistence(); useEffect(() => { if (phase === "idle") startRide(score); }, []); const exit = async () => { if (!(await finish())) return; endRide(); navigate("/home"); }; const highlightId = (phase === "verdict" || phase === "roadEvent" || phase === "resumed") && analysis?.roadEvent ? analysis.roadEvent.id : undefined; return <div className="relative h-full w-full overflow-hidden"><SchematicMap roadEvents={roadEvents} rider={position} highlightId={highlightId} className="absolute inset-0" /><div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/40 via-transparent to-bg/60" /><RideHud onExit={() => void exit()} />{tripError && <div role="alert" className="pointer-events-none absolute left-4 right-4 top-28 z-20 rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger ring-1 ring-inset ring-danger/25">{tripError}</div>}<DemoBar /><HeroOverlay /></div>; }
