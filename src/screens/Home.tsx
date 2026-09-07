import { useNavigate } from "react-router-dom";
import { Brand } from "@/components/ui/Brand";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StatTile } from "@/components/ui/StatTile";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { useRider, useRoadEvents, useHistory, useTodayDistance } from "@/hooks/queries";
import { useScoreStore } from "@/store/scoreStore";
import { useRideStore } from "@/store/rideStore";
import { DEMO_TODAY_DISTANCE_KM } from "@/config/demoData";
import {
  AnimatedCard,
  AnimatedNumber,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion";

function trustLabel(score: number): string {
  if (score >= 85) return "Trusted rider";
  if (score >= 70) return "Building trust";
  return "New rider";
}

/**
 * Animation: home-orchestrated-entrance
 * Trigger: mount / route arrival
 * Duration: 480ms per item  Easing: entrance
 * Properties: transform + opacity only
 * Stagger: 80ms via StaggerContainer; StatTile grid 80ms; shared-map card
 *   enters with the cascade
 * Reduced motion: global collapse; every state renders instantly.
 *
 * Light system per spec §4 Home recipe: identity row with greeting + status
 * dot, white hero card with the score ring, solid primary-container CTA
 * with a "Live Radar" sub-pill, white stat tiles, tonal inner chips.
 */
export function Home() {
  const navigate = useNavigate();
  const { data: rider, error: riderError } = useRider();
  const { data: roadEvents = [], error: roadEventsError } = useRoadEvents();
  const { data: history = [], error: historyError } = useHistory();
  const { data: todayDistance = DEMO_TODAY_DISTANCE_KM, error: distanceError } = useTodayDistance();
  const score = useScoreStore((s) => s.score);
  const startRide = useRideStore((s) => s.startRide);

  const verifiedHazards = roadEvents.filter((e) => e.status === "confirmed").length;

  const startLiveRide = () => {
    startRide(score);
    navigate("/ride");
  };

  return (
    <div className="flex flex-col gap-5 p-4 pb-8">
      {/* Identity row */}
      <div className="flex items-center justify-between pt-1">
        <Brand />
        <div className="flex items-center gap-2">
          <SourceBadge />
          <button
            onClick={() => navigate("/demo")}
            aria-label="Demo controls"
            className="grid h-touch w-touch place-items-center rounded-lg text-primary transition-colors hover:bg-surface-container"
          >
            <Icon name="Sparkles" className="h-5 w-5" />
          </button>
        </div>
      </div>

      {(riderError || roadEventsError || historyError || distanceError) && (
        <div role="alert" className="rounded-xl bg-error-container/60 p-3 text-xs text-on-error-container">
          Some live data is unavailable. The demo can continue with local controls.
        </div>
      )}

      {/* Greeting + status dot */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-body-sm text-muted">Welcome back,</p>
          <h1 className="text-headline-lg-mobile font-bold text-content">{rider?.name ?? "Rider"}</h1>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-tertiary-fixed-dim/25 px-2.5 py-1 text-label-sm font-medium text-tertiary">
          <span className="h-2 w-2 rounded-full bg-tertiary animate-breathe" />
          Ready
        </span>
      </div>

      {/* Score hero card */}
      <Card glow className="flex items-center gap-5">
        <ProgressRing value={score} size={120} stroke={11} label="Vouch Score">
          <div className="text-center">
            <div className="tnum text-3xl font-extrabold text-content">
              <AnimatedNumber value={score} duration="slow" />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">
              / 100
            </div>
          </div>
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <div className="eyebrow">Vouch Score</div>
          <div className="mt-0.5 text-label-lg font-bold text-primary">{trustLabel(score)}</div>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Built from context, not just actions.
          </p>
          <button
            onClick={() => navigate("/score")}
            className="-ml-3 -my-3 mt-0 inline-flex items-center gap-1 rounded-lg px-3 py-3.5 text-xs font-semibold text-primary transition hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          >
            View breakdown
            <Icon name="ChevronRight" className="h-3.5 w-3.5" />
          </button>
        </div>
      </Card>

      {/* Primary CTA per spec: primary-container fill + Live Radar sub-pill */}
      <Button block size="lg" onClick={startLiveRide} className="justify-between px-stack-xl">
        <span className="inline-flex items-center gap-2">
          <Icon name="Radar" className="h-5 w-5" />
          Start Live Ride
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-on-primary/10 px-2.5 py-1 text-label-sm font-medium">
          <span className="h-2 w-2 rounded-full bg-tertiary-fixed animate-breathe" />
          Live Radar
        </span>
      </Button>

      {/* Today stats */}
      <div>
        <h2 className="mb-2 text-sm font-bold text-content">Today</h2>
        <StaggerContainer className="grid grid-cols-3 gap-2.5" delay={80}>
          <StaggerItem>
            <StatTile
              icon="Route"
              value={todayDistance}
              label="Distance"
              sub="km"
              className="h-full"
            />
          </StaggerItem>
          <StaggerItem>
            <StatTile
              icon="Activity"
              value={history.length}
              label="Road events"
              accent="text-secondary"
              className="h-full"
            />
          </StaggerItem>
          <StaggerItem>
            <StatTile
              icon="ShieldCheck"
              value={verifiedHazards}
              label="Verified"
              sub="hazards"
              accent="text-tertiary"
              className="h-full"
            />
          </StaggerItem>
        </StaggerContainer>
      </div>

      {/* Shared intelligence teaser */}
      <AnimatedCard interactive noEntrance className="p-0">
        <Card padded={false} className="overflow-hidden border-0 bg-transparent shadow-none">
          <button
            type="button"
            onClick={() => navigate("/map")}
            className="flex min-h-[76px] w-full items-center gap-3 p-4 text-left transition-colors hover:bg-surface-container/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-surface-container text-primary">
              <Icon name="Map" className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-content">Shared road map</div>
              <p className="text-xs text-muted">
                {roadEvents.length} hazards reported by riders nearby
              </p>
            </div>
            <Icon name="ChevronRight" className="h-5 w-5 text-muted" />
          </button>
        </Card>
      </AnimatedCard>
    </div>
  );
}
