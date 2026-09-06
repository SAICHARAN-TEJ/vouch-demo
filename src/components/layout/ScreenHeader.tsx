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
 * Sticky, blurred screen header with optional back button and right slot.
 *
 * The subtitle is promoted to an eyebrow above the title. In an instrument
 * layout the small label establishes context first and the title lands as the
 * answer — reading it in the other order makes the title feel unlabelled.
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
        "sticky top-0 z-20 flex min-h-header items-center gap-3",
        // gutter-tight (16px), not gutter (20px): the existing screens pad
        // their content with p-4, and the header title has to sit on the same
        // vertical line as the content beneath it.
        "bg-bg/80 px-gutter-tight py-2.5 backdrop-blur-xl",
        // Safe-area aware: on a notched handset the sticky header is what sits
        // under the cutout, so it absorbs the inset rather than every screen.
        "pt-[max(0.625rem,env(safe-area-inset-top))]",
        className,
      )}
    >
      {back && (
        <button
          onClick={handleBack}
          aria-label="Back"
          className={cn(
            "tap-target grid shrink-0 place-items-center rounded-control hairline text-muted",
            "transition-[transform,background-color,color,border-color] duration-micro ease-hover",
            "hover:-translate-x-px hover:bg-content/[0.06] hover:text-content",
            "active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          )}
        >
          <Icon name="ArrowLeft" className="h-5 w-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        {subtitle && <p className="eyebrow truncate text-muted">{subtitle}</p>}
        <h1 className="truncate font-display text-base font-bold tracking-[-0.02em] text-content">
          {title}
        </h1>
      </div>
      {right}

      {/* Asymmetric rule: full strength under the title, fading out to the
          right. A uniform 1px border makes every screen look the same. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-primary/25 via-border to-transparent"
      />
    </header>
  );
}
