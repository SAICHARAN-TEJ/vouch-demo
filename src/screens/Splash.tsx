import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brand } from "@/components/ui/Brand";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * Animation: splash-arrive
 * Trigger: mount
 * Duration: 480ms fade-ups at 0/120ms
 * Easing: entrance
 * Properties: transform + opacity only — one quiet entrance, no loops
 * Stagger: 120ms steps (mark → tagline → CTA)
 * Reduced motion: the global duration collapse lands every state instantly.
 *
 * Calm light canvas: flat tonal surface, the brand mark, the product line,
 * and one CTA. No floating loops, no blur halos, no decorative rules — a
 * real rider app opens quietly and gets out of the way.
 */
export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate("/home", { replace: true }), 2400);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-surface px-8 text-center">
      <Brand size={88} showText={false} className="relative animate-fade-up" />

      <div className="relative mt-6 animate-fade-up [animation-delay:120ms]">
        <h1 className="display text-5xl font-extrabold tracking-tight text-content">Vouch</h1>
        <p className="mt-3 max-w-[26ch] text-balance text-base font-medium text-muted">
          Don't judge the action.
          <br />
          <span className="text-content">Understand the context.</span>
        </p>
      </div>

      <div className="relative mt-10 w-full max-w-xs animate-fade-up [animation-delay:240ms]">
        <Button block size="lg" onClick={() => navigate("/home", { replace: true })}>
          Get started
          <Icon name="ChevronRight" className="h-5 w-5" />
        </Button>
      </div>

      <p className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] text-xs text-muted/80">
        Road intelligence for riders · Demo
      </p>
    </div>
  );
}
