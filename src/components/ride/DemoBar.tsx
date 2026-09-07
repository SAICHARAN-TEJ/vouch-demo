import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SCENARIO_LIST, SCENARIOS, type ScenarioDef } from "@/config/scenarios";
import { useDemoController } from "@/hooks/useDemoController";
import { useRideStore } from "@/store/rideStore";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * Live-ride demo trigger bar. The hero "Simulate Manoeuvre" button is one tap;
 * the other five scenarios (PRD §18) are tucked behind "More" so the primary
 * demo path stays front-and-centre. Only active while actually riding.
 *
 * Light system per spec §4: hero = primary-container fill, controls on white
 * glass panels. All labels, keyboard access and busy states unchanged.
 */
export function DemoBar() {
  const navigate = useNavigate();
  const phase = useRideStore((s) => s.phase);
  const { trigger, reset, isBusy, error } = useDemoController();
  const [open, setOpen] = useState(false);

  if (phase !== "riding") return null;

  const others = SCENARIO_LIST.filter((s) => !s.isHero);

  const fire = async (scenario: ScenarioDef) => {
    if (isBusy) return;
    setOpen(false);
    await trigger(scenario);
  };

  const doReset = async () => {
    if (await reset()) navigate("/home");
  };

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 p-4">
      {error && (
        <div role="alert" className="mb-3 rounded-xl bg-error-container/60 px-3 py-2 text-xs text-on-error-container">
          {error}
        </div>
      )}
      {open && (
        <div className="mb-3 grid grid-cols-2 gap-2 animate-fade-up">
          {others.map((s) => (
            <button
              key={s.id}
              onClick={() => void fire(s)}
              disabled={isBusy}
              className={cn(
                "flex items-center gap-2 rounded-xl bg-surface-container-lowest p-2.5 text-left shadow-raised ring-1 ring-inset ring-outline-variant/50 transition hover:bg-surface-container",
                s.tone === "caution" && "hover:bg-secondary-fixed/30",
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                  s.tone === "caution"
                    ? "bg-secondary-fixed text-secondary"
                    : "bg-surface-container text-primary",
                )}
              >
                <Icon name={s.icon} className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-content">
                  {s.label}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => void fire(SCENARIOS.pothole_vehicle)}
          disabled={isBusy}
          className="group flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-container font-bold text-on-primary shadow-raised transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
        >
          <Icon name="Zap" className="h-5 w-5 transition group-hover:scale-110" />
          Simulate Manoeuvre
        </button>

        <button
          onClick={() => setOpen((v) => !v)}
          disabled={isBusy}
          aria-label="More scenarios"
          className={cn(
            "grid h-14 w-14 shrink-0 place-items-center rounded-xl glass text-content transition active:scale-[0.98]",
            open && "bg-surface-container",
          )}
        >
          <Icon name={open ? "X" : "Sparkles"} className="h-5 w-5" />
        </button>

        <button
          onClick={() => void doReset()}
          disabled={isBusy}
          aria-label="Reset demo"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-xl glass text-muted transition hover:text-content active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
        >
          <Icon name="RotateCcw" className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
