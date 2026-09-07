import type { RideAnalysis } from "@/store/rideStore";
import { OverlayShell } from "./OverlayShell";
import { Icon } from "@/components/ui/Icon";
import { MANOEUVRE_LABEL } from "@/config/labels";
import { manoeuvreQuestion } from "@/lib/ui";

/**
 * Beat 1 — a manoeuvre is detected and Vouch poses the central question.
 * "Don't judge the action. Understand the context."
 */
export function ManoeuvreOverlay({
  analysis,
  onAdvance,
}: {
  analysis: RideAnalysis;
  onAdvance: () => void;
}) {
  const type = analysis.result.eventType;

  return (
    <OverlayShell onSkip={onAdvance} className="items-center justify-center text-center">
      <div className="flex flex-col items-center">
        {/* Pulsing detection ring — solid concentric rings, no blur halos */}
        <div className="relative mb-8 grid h-32 w-32 place-items-center">
          <span className="absolute inset-0 rounded-full bg-secondary-fixed/40 animate-pulse-ring" />
          <span className="absolute inset-3 rounded-full bg-secondary-fixed/60 animate-pulse-ring [animation-delay:200ms]" />
          <span className="relative grid h-20 w-20 place-items-center rounded-full bg-secondary-fixed text-secondary ring-1 ring-secondary/40">
            <Icon name="MoveHorizontal" className="h-9 w-9" strokeWidth={2.25} />
          </span>
        </div>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-secondary-fixed/45 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary ring-1 ring-secondary/30">
          <Icon name="Activity" className="h-3.5 w-3.5" />
          Manoeuvre detected
        </div>

        <div className="text-lg font-semibold text-muted animate-fade-up">
          {MANOEUVRE_LABEL[type]}
        </div>

        <h2 className="mt-3 max-w-[16ch] text-3xl font-extrabold leading-tight text-content animate-fade-up [animation-delay:120ms]">
          {manoeuvreQuestion(type)}
        </h2>

        <p className="mt-3 max-w-[26ch] text-sm text-muted animate-fade-up [animation-delay:240ms]">
          Vouch doesn't judge the action — it looks for the context.
        </p>
      </div>
    </OverlayShell>
  );
}
