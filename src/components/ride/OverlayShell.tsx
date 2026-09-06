import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Full-bleed overlay container for the hero flow. Renders absolutely within the
 * ride screen (not the viewport) so it stays inside the phone frame on desktop.
 */
export function OverlayShell({
  children,
  footer,
  onSkip,
  className,
  scrimClassName,
}: {
  children: ReactNode;
  footer?: ReactNode;
  /** If set, tapping the body advances the flow (used for auto beats). */
  onSkip?: () => void;
  className?: string;
  scrimClassName?: string;
}) {
  return (
    <div className="absolute inset-0 z-30 flex animate-fade-in flex-col">
      <div className={cn("absolute inset-0 bg-bg/85 backdrop-blur-md", scrimClassName)} />
      <div
        onClick={onSkip}
        onKeyDown={(event) => {
          if (onSkip && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onSkip();
          }
        }}
        role={onSkip ? "button" : undefined}
        tabIndex={onSkip ? 0 : undefined}
        aria-label={onSkip ? "Continue" : undefined}
        className={cn(
          "no-scrollbar relative z-10 flex flex-1 flex-col overflow-y-auto p-6",
          onSkip && "cursor-pointer",
          onSkip && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60",
          className,
        )}
      >
        {children}
      </div>
      {footer && <div className="relative z-10 p-5 pt-0">{footer}</div>}
    </div>
  );
}
