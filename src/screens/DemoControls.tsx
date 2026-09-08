import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { SCENARIOS, SCENARIO_LIST, type ScenarioDef } from "@/config/scenarios";
import { useDemoController } from "@/hooks/useDemoController";
import { cn } from "@/lib/cn";

/**
 * Operator surface — grouped scenarios with the hero path first, a stronger
 * hero emphasis (primary tonal fill instead of a hairline ring), and the
 * reset as a distinct quiet action. The whole panel shares the Vouch visual
 * system but reads as a control room, not a rider screen.
 */
export function DemoControls() {
  const navigate = useNavigate();
  const { trigger, reset, isBusy, error } = useDemoController();

  const run = async (scenario: ScenarioDef) => {
    if (await trigger(scenario)) navigate("/ride");
  };

  const doReset = async () => {
    if (await reset()) navigate("/home");
  };

  const hero = SCENARIOS.pothole_vehicle;
  const heroLabel = hero.label;

  const contextScenarios = SCENARIO_LIST.filter(
    (s) => !s.isHero && s.tone !== "caution" && s.id !== "normal",
  );
  const ambiguousScenarios = SCENARIO_LIST.filter(
    (s) => s.tone === "caution" || s.id === "normal",
  );

  return (
    <div className="flex flex-col">
      <ScreenHeader
        title="Demo Controls"
        subtitle="Scenario simulator"
        back
        right={<SourceBadge />}
      />

      <div className="flex flex-col gap-4 p-4 pb-8">
        <div className="rounded-xl bg-surface-container-low p-3.5">
          <div className="flex gap-2.5">
            <Icon name="Info" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-xs leading-relaxed text-muted">
              Each scenario emits the same signal shapes real Android sensors and the
              on-device camera would — the Context Engine can't tell it's a demo.
            </p>
          </div>
        </div>

        {error && (
          <div role="alert" className="rounded-xl bg-error-container/60 p-3.5 text-sm text-on-error-container">
            {error}
          </div>
        )}

        {/* Hero scenario — the full pothole + vehicle sequence */}
        <section aria-label="Hero scenario">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">
              Full sequence
            </p>
            <span className="text-[11px] text-muted">recommended</span>
          </div>
          <button
            onClick={() => void run(hero)}
            disabled={isBusy}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl bg-primary-container p-4 text-left text-on-primary shadow-raised",
              "transition active:scale-[0.99] disabled:cursor-wait disabled:opacity-60",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            )}
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-on-primary/10">
              <Icon name={hero.icon} className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold">{heroLabel}</div>
              <p className="mt-0.5 text-xs leading-snug text-on-primary/80">
                {hero.description}
              </p>
            </div>
            <Icon name="Play" className="h-5 w-5 shrink-0" />
          </button>
        </section>

        {/* Isolated context scenarios */}
        <section aria-label="Context scenarios">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Single-signal scenarios
          </p>
          <div className="space-y-2.5">
            {contextScenarios.map((s) => (
              <ScenarioRow key={s.id} scenario={s} disabled={isBusy} onRun={run} />
            ))}
          </div>
        </section>

        {/* Ambiguous scenarios */}
        <section aria-label="Ambiguous scenarios">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            Edge cases
          </p>
          <div className="space-y-2.5">
            {ambiguousScenarios.map((s) => (
              <ScenarioRow key={s.id} scenario={s} disabled={isBusy} onRun={run} />
            ))}
          </div>
        </section>

        <Button variant="outline" block onClick={doReset} disabled={isBusy}>
          <Icon name="RotateCcw" className="h-4 w-4" />
          Reset demo to initial state
        </Button>
      </div>
    </div>
  );
}

function ScenarioRow({
  scenario,
  disabled,
  onRun,
}: {
  scenario: ScenarioDef;
  disabled: boolean;
  onRun: (scenario: ScenarioDef) => Promise<void>;
}) {
  return (
    <button
      onClick={() => void onRun(scenario)}
      disabled={disabled}
      className={cn(
        "card flex w-full items-center gap-3 p-3.5 text-left transition hover:bg-surface-container-low/40 disabled:cursor-wait disabled:opacity-60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      )}
    >
      <div
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-surface-container",
          scenario.tone === "caution" ? "text-secondary" : "text-primary",
        )}
      >
        <Icon name={scenario.icon} className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-content">{scenario.label}</div>
        <p className="mt-0.5 text-xs leading-snug text-muted">{scenario.description}</p>
      </div>
      <Icon name="Play" className="h-4 w-4 shrink-0 text-muted" />
    </button>
  );
}
