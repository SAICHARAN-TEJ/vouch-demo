import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/** Splash — brand + core principle, auto-advances to Home (PRD §7). */
export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate("/home", { replace: true }), 2400);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="bg-grid relative flex h-full flex-col items-center justify-center overflow-hidden px-8 text-center">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative animate-scale-in">
        <img
          src="/vouch.svg"
          width={92}
          height={92}
          alt="Vouch"
          className="mx-auto animate-float drop-shadow-[0_0_30px_rgb(var(--c-primary)/0.5)]"
        />
      </div>

      <div className="relative mt-6 animate-fade-up">
        <h1 className="text-gradient text-4xl font-extrabold tracking-tight">Vouch</h1>
      </div>

      <p className="relative mt-4 max-w-[24ch] text-balance text-base font-medium text-muted animate-fade-up [animation-delay:150ms]">
        Don't judge the action.
        <br />
        <span className="text-content">Understand the context.</span>
      </p>

      <div className="relative mt-10 w-full max-w-xs animate-fade-up [animation-delay:300ms]">
        <Button block size="lg" onClick={() => navigate("/home", { replace: true })}>
          Get started
          <Icon name="ChevronRight" className="h-5 w-5" />
        </Button>
      </div>

      <p className="absolute bottom-6 text-xs text-muted/70">
        Road intelligence for riders · Demo
      </p>
    </div>
  );
}
