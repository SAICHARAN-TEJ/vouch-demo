import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { VouchMap } from "@/components/map/VouchMap";
import { ScrollReveal } from "@/components/motion";
import { RoadEventCard } from "@/components/road/RoadEventCard";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { Icon } from "@/components/ui/Icon";
import { useRoadEvents } from "@/hooks/queries";
import type { RoadEventType } from "@/types";
import { ROAD_EVENT_LABEL } from "@/config/labels";
import { hazardBg } from "@/lib/ui";
import { cn } from "@/lib/cn";

const CATEGORIES: RoadEventType[] = [
  "pothole",
  "speed_breaker",
  "waterlogging",
  "debris",
];

type Filter = "all" | RoadEventType;

/**
 * Animation: map-entrance
 * Trigger: mount + scroll into view per section
 * Duration: 480ms  Easing: entrance
 * Properties: transform + opacity only
 * Reduced motion: global collapse renders the final state instantly.
 *
 * Map-dominant layout: a tall map viewport, a horizontally scrollable
 * hazard-category filter deck (active = primary fill with a count chip),
 * a recenter control, and the reported-hazard list filtered by the same
 * filter. Filter chips are toggle buttons (pressed/not-pressed) — the old
 * role="tab" markup had no tablist keyboard semantics behind it.
 */
export function MapScreen() {
  const navigate = useNavigate();
  const { data: roadEvents = [], isLoading, error } = useRoadEvents();
  const [filter, setFilter] = useState<Filter>("all");
  const [recenterKey, setRecenterKey] = useState(0);

  // Stable identity so VouchMap's marker effect doesn't re-run on every render.
  const open = useCallback((id: string) => navigate(`/road/${id}`), [navigate]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: roadEvents.length,
      pothole: 0,
      speed_breaker: 0,
      waterlogging: 0,
      debris: 0,
    };
    for (const ev of roadEvents) c[ev.type] += 1;
    return c;
  }, [roadEvents]);

  const visible = useMemo(
    () =>
      [...roadEvents]
        .filter((ev) => filter === "all" || ev.type === filter)
        .sort((a, b) => b.confidence - a.confidence),
    [roadEvents, filter],
  );

  return (
    <div className="relative flex flex-col overflow-hidden">
      <ScreenHeader
        title="Road Map"
        subtitle="Live shared intelligence"
        right={<SourceBadge />}
      />

      <div className="relative px-4 pb-8 pt-4">
        <ScrollReveal revealId="map-field" distance={8}>
          <section
            aria-label="Shared hazard map"
            className="relative h-[clamp(420px,60vh,560px)] overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-low shadow-raised"
          >
            <VouchMap
              roadEvents={visible}
              recenterKey={recenterKey}
              onSelect={open}
              className="absolute inset-0"
            />

            {/* Top chip — inert so map interaction stays unobstructed. */}
            <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3">
              <div className="rounded-lg bg-surface-container-lowest px-2.5 py-2 shadow-raised">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
                  Chennai sector
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-content">
                  <Icon name="Radar" className="h-3.5 w-3.5 text-primary" />
                  Shared road layer
                </p>
              </div>
              <div className="rounded-lg bg-surface-container-lowest px-2.5 py-2 text-right shadow-raised">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                  In view
                </p>
                <p className="tnum mt-0.5 font-display text-xl font-bold leading-none text-content">
                  {visible.length.toString().padStart(2, "0")}
                </p>
              </div>
            </div>

            {/* Recenter control — eases the live map back to Chennai centre. */}
            <button
              type="button"
              onClick={() => setRecenterKey((k) => k + 1)}
              aria-label="Recenter map"
              className={cn(
                "tap-target absolute bottom-3 right-3 grid h-12 w-12 place-items-center rounded-lg",
                "bg-surface-container-lowest text-primary shadow-lifted",
                "transition-[transform,background-color] duration-micro ease-hover",
                "hover:bg-surface-container active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
              )}
            >
              <Icon name="LocateFixed" className="h-5 w-5" />
            </button>
          </section>
        </ScrollReveal>

        {/* Hazard category filter deck — filters both map and list. */}
        <ScrollReveal revealId="map-filter-tabs" delay={60} distance={8}>
          <div className="relative">
            <div
              role="group"
              aria-label="Filter hazards by category"
              className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1"
            >
              <FilterTab
                active={filter === "all"}
                onClick={() => setFilter("all")}
                label="All"
                count={counts.all}
              />
              {CATEGORIES.map((t) => (
                <FilterTab
                  key={t}
                  active={filter === t}
                  onClick={() => setFilter(t)}
                  label={ROAD_EVENT_LABEL[t]}
                  count={counts[t]}
                  dotClass={hazardBg(t)}
                />
              ))}
            </div>
            {/* Scroll affordance: a right-edge fade hinting the deck scrolls
                on phones where the chips don't all fit. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-bg to-transparent"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal revealId="map-hazard-heading" delay={90} distance={8}>
          <div className="mt-5 flex items-end justify-between gap-3 border-b border-outline-variant/50 pb-3">
            <div>
              <h2 className="font-display text-lg font-bold text-content">Reported hazards</h2>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-muted">
              <Icon name="Users" className="h-3.5 w-3.5" />
              Shared by riders
            </span>
          </div>
        </ScrollReveal>

        {error && (
          <div role="alert" className="mt-3 rounded-xl bg-error-container/60 p-3 text-xs text-on-error-container">
            Unable to refresh shared hazards. Showing the last available data.
          </div>
        )}

        <div className="mt-3">
          {isLoading && (
            <div role="group" aria-label="Loading hazards" className="flex flex-col gap-2.5">
              {[0, 1, 2].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}
          {!isLoading && !error && visible.length === 0 && (
            <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low px-5 py-8 text-center">
              <Icon name="Radar" className="mx-auto h-7 w-7 text-muted" />
              <p className="mt-2 text-sm font-semibold text-content">
                {filter === "all" ? "Road looks clear" : `No ${ROAD_EVENT_LABEL[filter].toLowerCase()} reported`}
              </p>
              <p className="mt-1 text-xs text-muted">
                {filter === "all"
                  ? "No hazards shared by riders in this area yet."
                  : "Try a different category, or clear the filter."}
              </p>
            </div>
          )}
          {!isLoading && visible.length > 0 && (
            <div className="space-y-2.5">
              {visible.map((ev) => (
                <RoadEventCard key={ev.id} event={ev} onClick={() => open(ev.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * One hazard category filter chip. Active = primary fill with a count chip;
 * inactive = white surface with the category's tonal dot. Height clears the
 * 44px floor.
 */
function FilterTab({
  active,
  onClick,
  label,
  count,
  dotClass,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  dotClass?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "tap-target inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold",
        "transition-[background-color,color] duration-micro ease-hover",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        active
          ? "bg-primary text-on-primary"
          : "bg-surface-container-lowest text-on-surface-variant ring-1 ring-inset ring-outline-variant/60 hover:bg-surface-container",
      )}
    >
      {!active && dotClass && (
        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", dotClass)} aria-hidden="true" />
      )}
      <span className="whitespace-nowrap">{label}</span>
      {active && (
        <span className="ml-0.5 rounded bg-surface/20 px-1.5 py-0.5 text-[10px] font-bold tnum">
          {count}
        </span>
      )}
    </button>
  );
}
