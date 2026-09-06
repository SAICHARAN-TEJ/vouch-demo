import type { RideAnalysis } from "@/store/rideStore";
import { OverlayShell } from "./OverlayShell";
import { RoadEventCard } from "@/components/road/RoadEventCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * Beat 4 — the manoeuvre becomes shared road intelligence. The rider's report
 * strengthens the hazard for everyone behind them (PRD §13, §14).
 */
export function RoadEventOverlay({
  analysis,
  onAdvance,
}: {
  analysis: RideAnalysis;
  onAdvance: () => void;
}) {
  const event = analysis.roadEvent;
  if (!event) return null;

  return (
    <OverlayShell
      footer={
        <Button block size="lg" onClick={onAdvance}>
          Continue riding
          <Icon name="Navigation" className="h-5 w-5" />
        </Button>
      }
    >
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/30 animate-scale-in">
            <Icon name="Users" className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-extrabold text-content">
            Added to shared road intelligence
          </h2>
          <p className="mt-2 max-w-[28ch] text-sm text-muted">
            Your report strengthened this hazard for every rider behind you.
          </p>
        </div>

        <div className="animate-fade-up [animation-delay:150ms]">
          <RoadEventCard event={event} highlight />
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-primary animate-fade-up [animation-delay:300ms]">
          <Icon name="Plus" className="h-3.5 w-3.5" />
          Your report added · confidence now {Math.round(event.confidence * 100)}%
        </div>
      </div>
    </OverlayShell>
  );
}
