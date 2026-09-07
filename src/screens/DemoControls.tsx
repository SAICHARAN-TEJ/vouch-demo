import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SourceBadge } from "@/components/ui/SourceBadge";
import { SCENARIO_LIST, type ScenarioDef } from "@/config/scenarios";
import { useDemoController } from "@/hooks/useDemoController";
import { cn } from "@/lib/cn";

/**
 * Light system per spec §4: scenario cards on white surfaces with tonal icon
 * tiles; the hero scenario gets the primary emphasis ring. All functionality,
 * labels and keyboard access unchanged (e2e asserts "Pothole + Vehicle",
 * "Reset demo", "Demo Controls").
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

        <div className="space-y-2.5">
          {SCENARIO_LIST.map((s) => (
            <button
              key={s.id}
              onClick={() => void run(s)}
              disabled={isBusy}
              className={cn(
                "card flex w-full items-center gap-3 p-3.5 text-left transition hover:bg-surface-container-low/40 disabled:cursor-wait disabled:opacity-60",
                s.isHero && "ring-1 ring-primary/40",
              )}
            >
              <div
                className={cn(
                  "grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-surface-container",
                  s.tone === "caution" ? "text-secondary" : "text-primary",
                )}
              >
                <Icon name={s.icon} className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-content">{s.label}</h3>
                  {s.isHero && (
                    <span className="rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                      Hero
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs leading-snug text-muted">{s.description}</p>
              </div>
              <Icon name="Play" className="h-4 w-4 shrink-0 text-muted" />
            </button>
          ))}
        </div>

        <Button variant="outline" block onClick={doReset} disabled={isBusy}>
          <Icon name="RotateCcw" className="h-4 w-4" />
          Reset demo to initial state
        </Button>
      </div>
    </div>
  );
}
