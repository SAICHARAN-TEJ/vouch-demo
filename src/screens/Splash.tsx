import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brand } from "@/components/ui/Brand";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * Animation: splash-arrive
 * Trigger: mount
 * Duration: 3.5s float loop on the mark; 480ms fade-ups at 0/150/300ms
 * Easing: entrance
 * Properties: transform + opacity only
 * Stagger: 150ms steps (mark → tagline → copy → CTA)
 * Reduced motion: the global duration collapse lands every state instantly.
 *
 * Light canvas per spec §5: flat #f9f9ff, no grid, no glow washes. The brand
 * mark is the spec §2 logo.
 */
export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate("/home", { replace: true }), 2400);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-surface px-8 text-center">
      {/* One soft tonal decoration: a primary-fixed halo behind the mark,
          the only blur the light system allows (spec §4 score-hero decor). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[30%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-fixed/50 blur-2xl"
      />
      <div className="pointer-events-none absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent" />

      <Brand
        size={92}
        showText={false}
        className="relative animate-float"
      />

      <div className="relative mt-6 animate-fade-up">
        <p className="eyebrow mb-2 text-primary/80">Instrument-grade road intelligence</p>
        <h1 className="display text-5xl font-extrabold tracking-tight text-content">Vouch</h1>
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
