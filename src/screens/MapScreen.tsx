import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { VouchMap } from "@/components/map/VouchMap";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/motion";
import { RoadEventCard } from "@/components/road/RoadEventCard";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { Icon } from "@/components/ui/Icon";
import { useRoadEvents } from "@/hooks/queries";
import type { RoadEventType } from "@/types";
import { ROAD_EVENT_LABEL } from "@/config/labels";
import { hazardBg } from "@/lib/ui";

const LEGEND: RoadEventType[] = ["pothole", "speed_breaker", "waterlogging", "debris"];

export function MapScreen() {
  const navigate = useNavigate();
  const { data: roadEvents = [], isLoading, error } = useRoadEvents();

  const sorted = [...roadEvents].sort((a, b) => b.confidence - a.confidence);
  const open = (id: string) => navigate(`/road/${id}`);
  const strongestSignal = sorted[0]?.confidence ?? 0;

  return (
    <div className="relative flex flex-col overflow-hidden">
      <ScreenHeader
        title="Road Map"
        subtitle="Live shared intelligence"
        right={<SourceBadge />}
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-header h-48 bg-grid-fine opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="relative px-4 pb-8 pt-4">
        <ScrollReveal revealId="map-field" distance={8}>
          <section
            aria-label="Shared hazard map"
            className="relative h-[clamp(330px,46vh,390px)] overflow-hidden rounded-control border border-border/80 bg-bg shadow-raised"
          >
            <VouchMap roadEvents={roadEvents} onSelect={open} className="absolute inset-0" />

            {/* The overlays are inert so map pan, zoom and hazard selection remain unobstructed. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-scan opacity-25" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg/65 via-transparent to-bg/85" />
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 border-l border-t border-primary/45" />
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-180 border-l border-t border-primary/45" />

            <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3">
              <div className="rounded-control border border-border/70 bg-bg/80 px-2.5 py-2 shadow-seated backdrop-blur-md">
                <p className="eyebrow text-primary">Chennai sector</p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-content">
                  <Icon name="Radar" className="h-3.5 w-3.5 text-primary" />
                  Shared road layer
                </p>
              </div>
              <div className="rounded-control border border-border/70 bg-bg/80 px-2.5 py-2 text-right shadow-seated backdrop-blur-md">
                <p className="eyebrow">Active signals</p>
                <p className="tnum mt-0.5 font-display text-xl font-bold leading-none text-content">
                  {roadEvents.length.toString().padStart(2, "0")}
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-border/60 bg-bg/80 px-3 pb-3 pt-2.5 backdrop-blur-md">
              <div className="mb-2 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                <span>Hazard channels</span>
                <span className="tnum text-primary">Peak {Math.round(strongestSignal * 100)}%</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {LEGEND.map((t) => (
                  <span key={t} className="inline-flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-content">
                    <span className={`h-2 w-2 shrink-0 rounded-full shadow-[0_0_8px_currentColor] ${hazardBg(t)}`} />
                    <span className="truncate">{ROAD_EVENT_LABEL[t]}</span>
                  </span>
                ))}
              </div>
            </div>

            <span aria-hidden="true" className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-primary/70" />
            <span aria-hidden="true" className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-primary/70" />
            <span aria-hidden="true" className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-primary/70" />
            <span aria-hidden="true" className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b border-r border-primary/70" />
          </section>
        </ScrollReveal>

        <ScrollReveal revealId="map-hazard-heading" delay={90} distance={8}>
          <div className="mt-6 flex items-end justify-between gap-3 border-b border-border/60 pb-3">
            <div>
              <p className="eyebrow mb-1.5 text-primary">Signal queue</p>
              <h2 className="font-display text-lg font-bold text-content">Reported hazards</h2>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted">
              <Icon name="Users" className="h-3.5 w-3.5" />
              Community-sourced
            </span>
          </div>
        </ScrollReveal>

        {error && (
          <div role="alert" className="mt-3 rounded-control bg-danger/10 p-3 text-xs text-danger ring-1 ring-inset ring-danger/25">
            Unable to refresh shared hazards. Showing the last available data.
          </div>
        )}

        <div className="mt-3">
          {isLoading && <p className="text-sm text-muted">Loading hazards…</p>}
          {!isLoading && sorted.length === 0 && (
            <p className="text-sm text-muted">No hazards reported yet.</p>
          )}
          <StaggerContainer className="space-y-2.5" delay={140} stagger="tight">
            {sorted.map((ev) => (
              <StaggerItem key={ev.id}>
                <RoadEventCard event={ev} onClick={() => open(ev.id)} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </div>
  );
}
