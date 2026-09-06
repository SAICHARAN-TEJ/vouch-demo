import { useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { ConfidenceBar } from "@/components/ui/ConfidenceBar";
import { ExplanationCard } from "@/components/analysis/ExplanationCard";
import { ContextTags } from "@/components/analysis/ContextTags";
import { SignalRow } from "@/components/analysis/SignalRow";
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

export function HistoryScreen() {
  const { data: history = [], isLoading, error } = useHistory();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Ride History" subtitle="Today's analysed manoeuvres" />

      <div className="flex flex-col gap-2.5 p-4 pb-8">
        {isLoading && <p className="text-sm text-muted">Loading history…</p>}
        {error && (
          <div role="alert" className="rounded-xl bg-danger/10 p-3 text-xs text-danger ring-1 ring-inset ring-danger/25">
            Unable to load ride history. Try again after reconnecting.
          </div>
        )}
        {!isLoading && history.length === 0 && (
          <div className="mt-16 text-center">
            <Icon name="Clock" className="mx-auto h-8 w-8 text-muted" />
            <p className="mt-2 text-sm text-muted">No manoeuvres analysed yet.</p>
          </div>
        )}
        {history.map((ev) => (
          <HistoryItem
            key={ev.id}
            ev={ev}
            open={openId === ev.id}
            onToggle={() => setOpenId((id) => (id === ev.id ? null : ev.id))}
          />
        ))}
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
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-white/[0.03]"
      >
        <div
          className={cn(
            "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5",
            justified ? "text-justified" : "text-caution",
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
          className={cn("h-5 w-5 shrink-0 text-muted transition", open && "rotate-90")}
        />
      </button>

      {open && (
        <div className="space-y-3 px-4 pb-4 animate-fade-up">
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
