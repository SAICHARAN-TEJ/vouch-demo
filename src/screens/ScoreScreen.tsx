import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useScoreStore } from "@/store/scoreStore";
import { BASE_SCORE } from "@/engine/scoreEngine";
import { cn } from "@/lib/cn";
import { AnimatedNumber, ScrollReveal } from "@/components/motion";

function trustLabel(score: number): string {
  if (score >= 85) return "Trusted rider";
  if (score >= 70) return "Building trust";
  return "New rider";
}

/**
 * Animation: score-entrance
 * Trigger: mount + scroll into view per section
 * Duration: 480ms  Easing: entrance
 * Properties: transform + opacity only
 * Stagger: 70–90ms across ledger rows
 * Reduced motion: global collapse renders the final state instantly.
 *
 * Light system per spec §4 Rider Score recipe: white score hero with the ONE
 * allowed soft decoration (primary-fixed blur disc), tertiary-fixed "Live
 * Guard" chip, tonal ledger rows on surface-container-low, h-2.5 primary
 * progress bars.
 */
export function ScoreScreen() {
  const factors = useScoreStore((s) => s.factors);
  const score = useScoreStore((s) => s.score);

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Vouch Score" subtitle="Contextual riding behaviour" />

      <div className="flex flex-col gap-6 p-4 pb-8">
        {/* Score hero — the one soft decor: a primary-fixed blur disc. */}
        <Card glow className="relative isolate flex flex-col items-center overflow-hidden py-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-primary-fixed/40 blur-2xl"
          />
          <div className="relative z-10 mb-5 flex w-full items-center justify-between px-1">
            <div>
              <p className="eyebrow">Current signal</p>
              <p className="mt-1 text-xs text-muted">Context-adjusted rider profile</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary-fixed px-2.5 py-1 text-label-sm font-semibold text-on-tertiary-fixed">
              <span className="h-2 w-2 rounded-full bg-tertiary animate-breathe" />
              Live Guard
            </span>
          </div>
          <div className="relative z-10">
            <ProgressRing value={score} size={180} stroke={13} label="Vouch Score out of 100">
              <div className="text-center">
                <div className="metric text-6xl font-extrabold text-content">
                  <AnimatedNumber value={score} duration="slow" />
                </div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  out of 100
                </div>
              </div>
            </ProgressRing>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-tertiary-fixed px-3.5 py-1.5 text-sm font-bold text-on-tertiary-fixed">
            <Icon name="ShieldCheck" className="h-4 w-4" />
            {trustLabel(score)}
          </div>
        </Card>

        {/* Breakdown ledger */}
        <div>
          <div className="mb-2 flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Signal ledger</p>
              <h2 className="mt-1 text-sm font-bold text-content">How it's calculated</h2>
            </div>
            <span className="text-[11px] text-muted">base + context</span>
          </div>
          <Card padded={false} className="overflow-hidden divide-y divide-outline-variant/40">
            <ScrollReveal revealId="score-base" distance={8}>
              <Row label="Base score" value={BASE_SCORE} muted />
            </ScrollReveal>
            {factors.map((f) => (
              <ScrollReveal key={f.key} revealId={`score-factor-${f.key}`} delay={70} distance={8}>
                <Row label={f.label} value={f.delta} delta />
              </ScrollReveal>
            ))}
            <div className="flex items-center justify-between bg-primary/[0.05] px-4 py-4">
              <div>
                <span className="font-bold text-content">Total</span>
                <p className="mt-0.5 text-[11px] text-muted">Your current Vouch Score</p>
              </div>
              <span className="metric text-xl font-extrabold text-primary">
                <AnimatedNumber value={score} duration="slow" />
              </span>
            </div>
          </Card>
        </div>

        {/* Disclaimer (PRD §16) */}
        <div className="rounded-xl bg-surface-container-low p-3.5">
          <div className="flex gap-2.5">
            <Icon name="Info" className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
            <p className="text-xs leading-relaxed text-muted">
              The Vouch Score is a concept demonstration of contextual riding
              behaviour. It is <span className="font-semibold text-content">not</span> an
              insurance, legal, credit, or official safety score.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  delta,
  muted,
}: {
  label: string;
  value: number;
  delta?: boolean;
  muted?: boolean;
}) {
  const positive = value > 0;
  const sign = delta ? (positive ? "+" : "") : "";
  return (
    <div className="flex min-h-[53px] items-center justify-between gap-4 px-4 py-3.5">
      <span className={cn("text-sm", muted ? "text-muted" : "text-content")}>{label}</span>
      <span
        className={cn(
          "tnum text-sm font-bold",
          !delta && "text-content",
          delta && positive && "text-tertiary",
          delta && !positive && "text-error",
        )}
      >
        <AnimatedNumber value={value} duration="fast" prefix={delta ? sign : undefined} />
      </span>
    </div>
  );
}
