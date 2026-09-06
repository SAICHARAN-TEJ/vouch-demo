import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brand } from "@/components/ui/Brand";
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
      <div className="pointer-events-none absolute inset-x-8 top-1/4 h-64 bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <Brand
        size={92}
        showText={false}
        className="relative animate-float drop-shadow-[0_0_30px_rgb(var(--c-primary)/0.5)]"
      />

      <div className="relative mt-6 animate-fade-up">
        <p className="eyebrow mb-2 text-primary/80">Instrument-grade road intelligence</p>
        <h1 className="display text-gradient text-5xl font-extrabold tracking-tight">Vouch</h1>
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

      <p className="absolute bottom-6 text-xs text-muted/80">
        Road intelligence for riders · Demo
      </p>
    </div>
  );
}
