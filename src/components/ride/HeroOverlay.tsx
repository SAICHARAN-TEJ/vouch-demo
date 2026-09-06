import { useRideStore } from "@/store/rideStore";
import { ManoeuvreOverlay } from "./ManoeuvreOverlay";
import { AnalysisOverlay } from "./AnalysisOverlay";
import { VerdictOverlay } from "./VerdictOverlay";
import { RoadEventOverlay } from "./RoadEventOverlay";
import { OverlayShell } from "./OverlayShell";
import { Icon } from "@/components/ui/Icon";

/**
 * Renders the correct hero-flow beat for the current ride phase. Beats
 * auto-advance via useHeroSequence, and each is also tappable so a presenter
 * can control the pace (PRD hero flow).
 */
export function HeroOverlay() {
  const phase = useRideStore((s) => s.phase);
  const analysis = useRideStore((s) => s.analysis);
  const advance = useRideStore((s) => s.advance);

  if (!analysis) return null;

  switch (phase) {
    case "manoeuvre":
      return <ManoeuvreOverlay analysis={analysis} onAdvance={advance} />;
    case "analysis":
      return <AnalysisOverlay analysis={analysis} onAdvance={advance} />;
    case "verdict":
      return <VerdictOverlay analysis={analysis} onAdvance={advance} />;
    case "roadEvent":
      return <RoadEventOverlay analysis={analysis} onAdvance={advance} />;
    case "resumed":
      return <ResumedOverlay />;
    default:
      return null;
  }
}

/** Brief "back to riding" beat before the live ride resumes. */
function ResumedOverlay() {
  return (
    <OverlayShell
      className="items-center justify-center text-center"
      scrimClassName="bg-bg/70"
    >
      <div className="flex flex-col items-center animate-scale-in">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-justified/15 ring-1 ring-justified/30">
          <Icon name="Check" className="h-8 w-8 text-justified" strokeWidth={3} />
        </div>
        <h2 className="text-xl font-bold text-content">Context saved</h2>
        <p className="mt-1 text-sm text-muted">Resuming your ride…</p>
      </div>
    </OverlayShell>
  );
}
