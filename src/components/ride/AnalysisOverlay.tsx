import { useEffect, useState } from "react";
import type { RideAnalysis } from "@/store/rideStore";
import { OverlayShell } from "./OverlayShell";
import { SignalRow, type SignalState } from "@/components/analysis/SignalRow";
import { Icon } from "@/components/ui/Icon";
import { MANOEUVRE_LABEL, ROAD_EVENT_LABEL } from "@/config/labels";
import { manoeuvreQuestion } from "@/lib/ui";
import { cn } from "@/lib/cn";

interface RowDef {
  icon: string;
  label: string;
  detail: string;
  final: boolean;
}

/**
 * Beat 2 — Vouch investigates three signals in sequence (motion → road context
 * → rear approach), each resolving to a check or a dash. This is the visible
 * "understanding the context" step.
 */
export function AnalysisOverlay({
  analysis,
  onAdvance,
}: {
  analysis: RideAnalysis;
  onAdvance: () => void;
}) {
  const { result, sensorEvent } = analysis;
  const rows = buildRows(analysis);

  // Staged reveal: 0 → 1 → 2 → 3 (all resolved).
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    const t1 = setTimeout(() => setStep(1), 250);
    const t2 = setTimeout(() => setStep(2), 1100);
    const t3 = setTimeout(() => setStep(3), 1950);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [analysis.runId]);

  const rowState = (i: number): SignalState =>
    step > i ? (rows[i].final ? "on" : "off") : "checking";

  return (
    <OverlayShell onSkip={onAdvance}>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-info">
          <Icon name="ScanLine" className="h-4 w-4 animate-pulse" />
          Understanding the context
        </div>
        <h2 className="mb-5 text-2xl font-extrabold text-content">
          {manoeuvreQuestion(result.eventType)}
        </h2>

        <div className="space-y-2.5">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                "transition-opacity duration-300",
                step < i ? "opacity-40" : "opacity-100",
              )}
            >
              <SignalRow
                icon={row.icon}
                label={row.label}
                detail={rowState(i) === "checking" ? "Checking…" : row.detail}
                state={rowState(i)}
              />
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-xs text-muted">
          Speed at manoeuvre · {Math.round(sensorEvent.motion.speed)} km/h
        </p>
      </div>
    </OverlayShell>
  );
}

function buildRows(analysis: RideAnalysis): RowDef[] {
  const { result, sensorEvent } = analysis;
  const cam = result.cameraDetection;

  const roadDetail = result.nearbyEvent
    ? `${ROAD_EVENT_LABEL[result.nearbyEvent.type]} · ${result.hazardDistanceM}m ahead`
    : "No known hazard nearby";

  const rearDetail =
    result.signals.rearApproach && cam
      ? `${cam.object === "vehicle" ? "Vehicle" : "Obstacle"} approaching · ${cam.relativeDistance}m`
      : "Nothing approaching from behind";

  return [
    {
      icon: "Activity",
      label: "Motion signal",
      detail: `${MANOEUVRE_LABEL[result.eventType]} · ${sensorEvent.motion.lateralG.toFixed(2)}g lateral`,
      final: result.signals.motion,
    },
    {
      icon: "MapPin",
      label: "Road context",
      detail: roadDetail,
      final: result.signals.roadContext,
    },
    {
      icon: "Car",
      label: "Rear approach",
      detail: rearDetail,
      final: result.signals.rearApproach,
    },
  ];
}
