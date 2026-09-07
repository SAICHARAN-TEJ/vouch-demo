import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * Animation: header-back-press
 * Trigger: hover / focus-visible / active on the back control
 * Duration: 180ms  Easing: hover
 * Properties: transform (translateX -1px on hover, scale on press) + colour
 * Stagger: n/a
 * Reduced motion: colour-only feedback.
 *
 * Fixed screen chrome per spec §3: an in-app status strip (mono time +
 * network/wifi/battery glyphs) over an h-16 brand row. The row carries the
 * logo + screen name on the left and the status slot on the right. This
 * header owns the screen's `<h1>` — e2e asserts every screen heading, so
 * the title must stay a real heading element, not decorative chrome text.
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
        "bg-surface/90 px-gutter-tight pb-2.5 backdrop-blur-xl",
        // Safe-area aware: on a notched handset the sticky header is what sits
        // under the cutout, so it absorbs the inset rather than every screen.
        "pt-[max(0.75rem,env(safe-area-inset-top))]",
        className,
      )}
      style={{ boxShadow: "0 1px 8px rgb(0 0 0 / 0.04)" }}
    >
      {/* Row 1 — in-app status strip: mono clock + connectivity glyphs. */}
      <div
        className="flex h-7 items-center justify-between text-on-surface-variant"
        aria-hidden="true"
      >
        <span className="font-mono text-label-sm font-medium tracking-[0.04em]">
          12:45
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="Signal" className="h-4 w-4" strokeWidth={2} />
          <Icon name="Wifi" className="h-4 w-4" strokeWidth={2} />
          <Icon name="BatteryFull" className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>

      {/* Row 2 — brand row. Back key sits in place of the logo when used. */}
      <div className="flex min-h-16 items-center gap-3">
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
          <img
            src="/vouch.svg"
            width={32}
            height={32}
            alt=""
            className="h-8 w-8 shrink-0 rounded-lg"
          />
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
