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
        <div role="alert" className="mb-3 rounded-xl bg-danger/10 px-3 py-2 text-xs text-danger ring-1 ring-inset ring-danger/25">
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
                "glass flex items-center gap-2 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/10",
                s.tone === "caution" && "hover:bg-caution/10",
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5",
                  s.tone === "caution" ? "text-caution" : "text-primary",
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
          className="group flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary font-bold text-primary-fg shadow-glow transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
        >
          <Icon name="Zap" className="h-5 w-5 transition group-hover:scale-110" />
          Simulate Manoeuvre
        </button>

        <button
          onClick={() => setOpen((v) => !v)}
          disabled={isBusy}
          aria-label="More scenarios"
          className={cn(
            "grid h-14 w-14 shrink-0 place-items-center rounded-2xl glass text-content transition active:scale-[0.98]",
            open && "bg-white/10",
          )}
        >
          <Icon name={open ? "X" : "Sparkles"} className="h-5 w-5" />
        </button>

        <button
          onClick={() => void doReset()}
          disabled={isBusy}
          aria-label="Reset demo"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl glass text-muted transition hover:text-content active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
        >
          <Icon name="RotateCcw" className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
