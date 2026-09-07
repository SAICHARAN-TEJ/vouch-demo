import { useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { ConfidenceBar } from "@/components/ui/ConfidenceBar";
import { ExplanationCard } from "@/components/analysis/ExplanationCard";
import { ContextTags } from "@/components/analysis/ContextTags";
import { SignalRow } from "@/components/analysis/SignalRow";
import { StaggerContainer, StaggerItem } from "@/components/motion";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useHistory } from "@/hooks/queries";
import { displayTimeForRiderEvent } from "@/config/demoData";
import { MANOEUVRE_LABEL, VERDICT_LABEL } from "@/config/labels";
import { isJustified } from "@/engine/contextEngine";
import type { ManoeuvreType, RiderEvent } from "@/types";
import { cn } from "@/lib/cn";

const MANOEUVRE_ICON: Record<ManoeuvreType, string> = {
  normal: "Route",
  lateral_manoeuvre: "MoveHorizontal",
  hard_braking: "Octagon",
  sudden_swerve: "Activity",
};

/**
 * Animation: history-entrance
 * Trigger: mount + toggle expansion (animate-fade-up on the detail block)
 * Duration: 480ms  Easing: entrance
 * Properties: transform + opacity only
 * Stagger: 100ms tight stagger on trip cards
 * Reduced motion: global collapse renders final state instantly.
 *
 * Light system per spec §4 Trip Log recipe: white cards with mono eyebrows,
 * icon tiles on surface-container, teal verified accents.
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
            <p className="eyebrow mb-1.5 text-primary">Archive / Demo day</p>
            <h2 className="font-display text-lg font-bold text-content">Context records</h2>
            <p className="mt-1 text-xs text-muted">Motion events with the road story intact.</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="eyebrow">Events logged</p>
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
          <StaggerContainer className="flex flex-col gap-2.5" delay={100} stagger="tight">
            {history.map((ev) => (
              <StaggerItem key={ev.id}>
                <HistoryItem
                  ev={ev}
                  open={openId === ev.id}
                  onToggle={() => setOpenId((id) => (id === ev.id ? null : ev.id))}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
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
            "grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-surface-container",
            justified ? "text-tertiary" : "text-secondary",
          )}
        >
          <Icon name={MANOEUVRE_ICON[ev.eventType]} className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-content">
              {MANOEUVRE_LABEL[ev.eventType]}
            </h3>
            <Badge tone={justified ? "justified" : "caution"}>
              {VERDICT_LABEL[r.verdict]}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted">{displayTimeForRiderEvent(ev)}</p>
        </div>
        <Icon
          name="ChevronRight"
          className={cn("h-5 w-5 shrink-0 text-muted transition-transform group-hover:text-content", open && "rotate-90")}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-outline-variant/40 bg-surface-container-low/40 px-4 pb-4 pt-3 animate-fade-up">
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
