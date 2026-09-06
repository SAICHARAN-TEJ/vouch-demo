import type { RideAnalysis } from "@/store/rideStore";
import { OverlayShell } from "./OverlayShell";
import { VerdictHeadline } from "@/components/analysis/VerdictHeadline";
import { ExplanationCard } from "@/components/analysis/ExplanationCard";
import { ContextTags } from "@/components/analysis/ContextTags";
import { ConfidenceBar } from "@/components/ui/ConfidenceBar";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { isJustified } from "@/engine/contextEngine";
import { cn } from "@/lib/cn";

/**
 * Beat 3 — the contextual verdict. Confidence, reasoning, context tags and the
 * resulting Vouch Score change. This is the emotional peak of the demo.
 */
export function VerdictOverlay({
  analysis,
  onAdvance,
}: {
  analysis: RideAnalysis;
  onAdvance: () => void;
}) {
  const { result, scoreChange } = analysis;
  const justified = isJustified(result.verdict);
  const tone = justified ? "justified" : "caution";

  return (
    <OverlayShell
      footer={
        <Button block size="lg" onClick={onAdvance}>
          Continue
          <Icon name="ChevronRight" className="h-5 w-5" />
        </Button>
      }
    >
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-4">
        <div className="animate-scale-in">
          <VerdictHeadline verdict={result.verdict} />
        </div>

        <div className="mt-6 animate-fade-up [animation-delay:150ms]">
          <ConfidenceBar value={result.confidence} tone={tone} />
        </div>

        <div className="mt-4 animate-fade-up [animation-delay:250ms]">
          <ExplanationCard explanation={result.explanation} />
        </div>

        {result.context.length > 0 && (
          <div className="mt-3 animate-fade-up [animation-delay:350ms]">
            <ContextTags tags={result.context} />
          </div>
        )}

        <div className="mt-5 flex justify-center animate-fade-up [animation-delay:450ms]">
          <ScoreDelta change={scoreChange} />
        </div>
      </div>
    </OverlayShell>
  );
}

function ScoreDelta({ change }: { change: number }) {
  if (change === 0) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-muted hairline">
        <Icon name="Gauge" className="h-4 w-4" />
        No score change
      </div>
    );
  }
  const positive = change > 0;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ring-1",
        positive
          ? "bg-justified/15 text-justified ring-justified/30"
          : "bg-danger/15 text-danger ring-danger/30",
      )}
    >
      <Icon name={positive ? "TrendingUp" : "TrendingDown"} className="h-4 w-4" />
      <span className="tnum">
        {positive ? "+" : ""}
        {change}
      </span>
      Vouch Score
    </div>
  );
}
