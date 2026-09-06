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

export function ScoreScreen() {
  const factors = useScoreStore((s) => s.factors);
  const score = useScoreStore((s) => s.score);

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Vouch Score" subtitle="Contextual riding behaviour" />

      <div className="flex flex-col gap-6 p-4 pb-8">
        {/* Ring */}
        <Card glow className="relative isolate flex flex-col items-center overflow-hidden py-7">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grid-fine opacity-20" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/[0.08] blur-3xl" />
          <div className="relative z-10 mb-5 flex w-full items-center justify-between px-1">
            <div>
              <p className="eyebrow">Current signal</p>
              <p className="mt-1 text-xs text-muted">Context-adjusted rider profile</p>
            </div>
            <span className="tnum rounded-control bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary ring-1 ring-inset ring-primary/20">
              Live
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
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/15 px-3.5 py-1.5 text-sm font-bold text-primary ring-1 ring-primary/30">
            <Icon name="ShieldCheck" className="h-4 w-4" />
            {trustLabel(score)}
          </div>
        </Card>

        {/* Breakdown */}
        <div>
          <div className="mb-2 flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Signal ledger</p>
              <h2 className="mt-1 text-sm font-bold text-content">How it's calculated</h2>
            </div>
            <span className="text-[11px] text-muted">base + context</span>
          </div>
          <Card padded={false} className="overflow-hidden divide-y divide-border/60">
            <ScrollReveal revealId="score-base" distance={8}>
              <Row label="Base score" value={BASE_SCORE} muted />
            </ScrollReveal>
            {factors.map((f) => (
              <ScrollReveal key={f.key} revealId={`score-factor-${f.key}`} delay={70} distance={8}>
                <Row label={f.label} value={f.delta} delta />
              </ScrollReveal>
            ))}
            <div className="flex items-center justify-between bg-primary/[0.045] px-4 py-4">
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
        <div className="rounded-xl bg-white/[0.03] p-3.5 hairline">
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
          delta && positive && "text-justified",
          delta && !positive && "text-danger",
        )}
      >
        <AnimatedNumber value={value} duration="fast" prefix={delta ? sign : undefined} />
      </span>
    </div>
  );
}
