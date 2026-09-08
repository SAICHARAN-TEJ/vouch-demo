import { useParams } from "react-router-dom";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { SchematicMap } from "@/components/map/SchematicMap";
import { ScrollReveal } from "@/components/motion";
import { RoadEventCard } from "@/components/road/RoadEventCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { useRoadEvents } from "@/hooks/queries";
import { ROAD_EVENT_LABEL } from "@/config/labels";

/**
 * Animation: road-event-entrance
 * Trigger: mount + scroll into view per section
 * Duration: 480ms  Easing: entrance
 * Properties: transform + opacity only
 * Stagger: 35ms steps across detail rows
 * Reduced motion: global collapse renders the final state instantly.
 *
 * Reads like evidence: EVENT → LOCATION → SIGNAL → CONTEXT → VERDICT. The
 * conclusion block ("Your movement was a response to the road") is the
 * emotional close of the screen — the whole product idea in one sentence.
 */
export function RoadEventScreen() {
  const { id } = useParams<{ id: string }>();
  const { data: roadEvents = [], isLoading, error } = useRoadEvents();
  const event = roadEvents.find((e) => e.id === id);

  if (!isLoading && !event) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title="Hazard" back />
        <div className="mt-16 text-center">
          <Icon name="TriangleAlert" className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-2 text-sm text-muted">
            {error ? "Unable to load this hazard right now." : "This hazard no longer exists."}
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col">
        <ScreenHeader title="Hazard" back />
        <div className="flex flex-col gap-3 p-4">
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col overflow-hidden">
      <ScreenHeader title={ROAD_EVENT_LABEL[event.type]} subtitle="Shared road intelligence" back />

      <div className="relative flex flex-col gap-5 p-4 pb-8">
        <ScrollReveal revealId={`road-event-field-${event.id}`} distance={8}>
          <section
            aria-label="Hazard location"
            className="relative h-[clamp(220px,34vh,280px)] overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-low shadow-raised"
          >
            <SchematicMap
              roadEvents={[event]}
              highlightId={event.id}
              showRoute={false}
              className="absolute inset-0"
            />

            <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3">
              <div className="rounded-lg bg-surface-container-lowest px-2.5 py-2 shadow-raised">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                  Chennai sector
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-content">
                  <Icon name="Radar" className="h-3.5 w-3.5 text-primary" />
                  Shared hazard signal
                </p>
              </div>
              <div className="rounded-lg bg-surface-container-lowest px-2.5 py-2 text-right shadow-raised">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                  Confidence
                </p>
                <p className="tnum mt-0.5 font-display text-xl font-bold leading-none text-primary">
                  {Math.round(event.confidence * 100)}%
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-outline-variant/50 bg-surface-container-lowest/95 px-3 py-2.5">
              <div className="flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                <span>Location lock</span>
                <span className="tnum text-content">{event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}</span>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal revealId={`road-event-summary-${event.id}`} delay={70} distance={8}>
          <RoadEventCard event={event} highlight />
        </ScrollReveal>

        <section aria-labelledby="event-evidence-heading">
          <ScrollReveal revealId={`road-event-evidence-heading-${event.id}`} delay={110} distance={8}>
            <div className="mb-2 flex items-end justify-between gap-3 border-b border-outline-variant/50 pb-3">
              <div>
                <h2 id="event-evidence-heading" className="mt-1 font-display text-lg font-bold text-content">
                  Event evidence
                </h2>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted">
                <Icon name="Activity" className="h-3.5 w-3.5" />
                Live aggregate
              </span>
            </div>
          </ScrollReveal>

          <Card padded={false} className="mt-3 overflow-hidden divide-y divide-outline-variant/40">
            <ScrollReveal revealId={`road-event-first-detected-${event.id}`} delay={140} distance={8}>
              <DetailRow icon="Clock" label="First detected" value={event.firstDetected} />
            </ScrollReveal>
            <ScrollReveal revealId={`road-event-last-confirmed-${event.id}`} delay={175} distance={8}>
              <DetailRow icon="Clock" label="Last confirmed" value={event.lastConfirmed} />
            </ScrollReveal>
            <ScrollReveal revealId={`road-event-riders-${event.id}`} delay={210} distance={8}>
              <DetailRow icon="Users" label="Distinct riders" value={String(event.riders)} />
            </ScrollReveal>
            <ScrollReveal revealId={`road-event-reports-${event.id}`} delay={245} distance={8}>
              <DetailRow icon="Activity" label="Total reports" value={String(event.reports)} />
            </ScrollReveal>
          </Card>
        </section>

        <ScrollReveal revealId={`road-event-note-${event.id}`} delay={315} distance={8}>
          <div className="rounded-xl bg-primary-fixed/40 p-3.5">
            <div className="flex gap-2.5">
              <Icon name="Sparkles" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-on-primary-fixed-variant">
                This hazard's confidence grows as more riders independently confirm it —
                turning individual manoeuvres into shared road intelligence.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[53px] items-center justify-between gap-4 px-4 py-3.5">
      <span className="inline-flex items-center gap-2 text-sm text-muted">
        <Icon name={icon} className="h-4 w-4" />
        {label}
      </span>
      <span className="tnum text-sm font-semibold text-content">{value}</span>
    </div>
  );
}
