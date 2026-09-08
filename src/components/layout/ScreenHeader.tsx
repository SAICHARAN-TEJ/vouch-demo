import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Brand } from "@/components/ui/Brand";
import { cn } from "@/lib/cn";

/**
 * Animation: header-back-press
 * Trigger: hover / focus-visible / active on the back control
 * Duration: 180ms  Easing: hover
 * Properties: transform (translateX -1px on hover, scale on press) + colour
 * Stagger: n/a
 * Reduced motion: colour-only feedback.
 *
 * Slim screen chrome: brand row with logo + screen name on the left and the
 * status slot on the right. The old in-app "status bar" strip (fake clock +
 * signal glyphs) was removed — a real handset already draws its own status
 * bar, and a static one reads as a mockup. This header owns the screen's
 * `<h1>` — e2e asserts every screen heading, so the title must stay a real
 * heading element.
 */
export function ScreenHeader({
  title,
  subtitle,
  back,
  onBack,
  right,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  back?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  className?: string;
}) {
  const navigate = useNavigate();
  const handleBack = onBack ?? (() => navigate(-1));

  return (
    <header
      className={cn(
        "sticky top-0 z-20",
        // gutter-tight (16px) matches the screens' p-4 content line.
        "bg-surface-container-lowest/95 px-gutter-tight py-2.5 backdrop-blur-md",
        // Safe-area aware: on a notched handset the sticky header is what sits
        // under the cutout, so it absorbs the inset rather than every screen.
        "pt-[max(0.75rem,env(safe-area-inset-top))]",
        className,
      )}
      style={{ boxShadow: "0 1px 8px rgb(0 0 0 / 0.04)" }}
    >
      <div className="flex min-h-14 items-center gap-3">
        {back ? (
          <button
            onClick={handleBack}
            aria-label="Back"
            className={cn(
              "tap-target grid shrink-0 place-items-center rounded-lg text-primary",
              "transition-[transform,background-color,color] duration-micro ease-hover",
              "hover:-translate-x-px hover:bg-surface-container active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            )}
          >
            <Icon name="ArrowLeft" className="h-5 w-5" />
          </button>
        ) : (
          <Brand size={32} showText={false} className="h-8 w-8 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="font-display text-headline-sm font-bold tracking-tight text-primary">
              Vouch
            </span>
            {subtitle && (
              <span className="truncate font-mono text-label-sm uppercase tracking-[0.04em] text-on-surface-variant">
                {subtitle}
              </span>
            )}
          </div>
          <h1 className="truncate text-body-lg font-semibold leading-tight text-on-surface">
            {title}
          </h1>
        </div>
        {right}
      </div>
    </header>
  );
}
