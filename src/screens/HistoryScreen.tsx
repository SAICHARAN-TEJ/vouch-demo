import { useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { ConfidenceBar } from "@/components/ui/ConfidenceBar";
import { ExplanationCard } from "@/components/analysis/ExplanationCard";
import { ContextTags } from "@/components/analysis/ContextTags";
import { SignalRow } from "@/components/analysis/SignalRow";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useHistory } from "@/hooks/queries";
import { displayTimeForRiderEvent } from "@/config/demoData";
import { MANOEUVRE_LABEL, VERDICT_LABEL } from "@/config/labels";
import { isJustified } from "@/engine/contextEngine";
import { areaLabel } from "@/lib/ui";
import type { ManoeuvreType, RiderEvent } from "@/types";
import { cn } from "@/lib/cn";

const MANOEUVRE_ICON: Record<ManoeuvreType, string> = {
  normal: "Route",
  lateral_manoeuvre: "MoveHorizontal",
  hard_braking: "Octagon",
  sudden_swerve: "Activity",
};

/**
 * Animation: history-item-toggle
 * Trigger: expanding a record (animate-fade-up on the detail block only)
 * Duration: 480ms  Easing: entrance
 * Properties: transform + opacity only — no list-wide cascade
 * Reduced motion: global collapse renders final state instantly.
 *
 * A ride journal, verdict-first: the OUTCOME ("Justified") is the loudest
 * element in each row, the manoeuvre second, time and place third. That
 * ordering is the product story — Vouch remembers why you moved, not just
 * that you moved.
 */
export function HistoryScreen() {
  const { data: history = [], isLoading, error } = useHistory();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="relative flex flex-col overflow-hidden">
      <ScreenHeader title="Ride History" subtitle="Today's analysed manoeuvres" />

      <div className="relative flex flex-col gap-5 p-4 pb-8">
        <div className="flex items-end justify-between gap-4 border-b border-outline-variant/50 pb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-content">Context records</h2>
            <p className="mt-1 text-xs text-muted">Motion events with the road story intact.</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
              Events logged
            </p>
            <p className="tnum mt-1 font-display text-2xl font-extrabold leading-none text-content">
              {isLoading ? "--" : history.length.toString().padStart(2, "0")}
            </p>
          </div>
        </div>

        {isLoading && (
          <div role="group" aria-label="Loading history" className="flex flex-col gap-2.5">
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} meter={false} />
            ))}
          </div>
        )}
        {error && (
          <div role="alert" className="rounded-xl bg-error-container/60 p-3 text-xs text-on-error-container">
            Unable to load ride history. Try again after reconnecting.
          </div>
        )}
        {!isLoading && !error && history.length === 0 && (
          <div className="mt-12 rounded-xl border border-dashed border-outline-variant bg-surface-container-low px-5 py-10 text-center">
            <Icon name="Clock" className="mx-auto h-8 w-8 text-muted" />
            <p className="mt-2 text-sm text-muted">No manoeuvres analysed yet.</p>
          </div>
        )}
        {!isLoading && history.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {history.map((ev) => (
              <HistoryItem
                key={ev.id}
                ev={ev}
                open={openId === ev.id}
                onToggle={() => setOpenId((id) => (id === ev.id ? null : ev.id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryItem({
  ev,
  open,
  onToggle,
}: {
  ev: RiderEvent;
  open: boolean;
  onToggle: () => void;
}) {
  const r = ev.contextResult;
  const justified = isJustified(r.verdict);
  const rows = signalRows(ev);

  return (
    <Card padded={false} className="overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="group flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-surface-container-low/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-lg",
            justified ? "bg-tertiary-fixed/40 text-tertiary" : "bg-secondary-fixed/40 text-secondary",
          )}
        >
          <Icon name={MANOEUVRE_ICON[ev.eventType]} className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          {/* Verdict first — the outcome is the headline, the action second. */}
          <div className="text-sm font-bold leading-tight text-content">
            {justified ? "Justified" : "Unclear"}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
            <span className="truncate">{MANOEUVRE_LABEL[ev.eventType]}</span>
            <span aria-hidden="true" className="text-muted/60">·</span>
            <span className="tnum shrink-0">{displayTimeForRiderEvent(ev)}</span>
          </div>
        </div>
        <Icon
          name="ChevronRight"
          className={cn("h-5 w-5 shrink-0 text-muted transition-transform group-hover:text-content", open && "rotate-90")}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-outline-variant/40 bg-surface-container-low/40 px-4 pb-4 pt-3 animate-fade-up">
          <div className="flex items-center justify-between gap-3">
            <Badge tone={justified ? "justified" : "caution"}>
              {VERDICT_LABEL[r.verdict]}
            </Badge>
            <span className="text-xs text-muted">
              {areaLabel(ev.latitude, ev.longitude)}
            </span>
          </div>
          <ConfidenceBar value={r.confidence} tone={justified ? "justified" : "caution"} />
          <ExplanationCard explanation={r.explanation} />
          {r.context.length > 0 && <ContextTags tags={r.context} />}
          <div className="space-y-2">
            {rows.map((row) => (
              <SignalRow
                key={row.label}
                icon={row.icon}
                label={row.label}
                detail={row.detail}
                state={row.on ? "on" : "off"}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function signalRows(ev: RiderEvent) {
  const r = ev.contextResult;
  return [
    {
      icon: "Activity",
      label: "Motion signal",
      detail: `${MANOEUVRE_LABEL[ev.eventType]} · ${ev.motionData.lateralG.toFixed(2)}g lateral`,
      on: r.signals.motion,
    },
    {
      icon: "MapPin",
      label: "Road context",
      detail: r.signals.roadContext ? "Known hazard nearby" : "No known hazard nearby",
      on: r.signals.roadContext,
    },
    {
      icon: "Car",
      label: "Rear approach",
      detail: r.signals.rearApproach ? "Vehicle approaching from behind" : "Nothing approaching",
      on: r.signals.rearApproach,
    },
  ];
}
