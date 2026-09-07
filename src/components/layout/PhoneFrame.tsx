import type { ReactNode } from "react";

/**
 * Centers the app in a phone-sized frame on desktop and goes full-bleed on
 * mobile. All screens live inside this so the demo reads as a real handset app.
 *
 * Light surround per spec §5: the desktop atmosphere is a quiet
 * surface-container-low canvas (painted by the body), a soft device shadow
 * and a thin outline-variant ring. No blurred colour washes, no grid.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] w-full justify-center overflow-hidden bg-transparent sm:py-4">
      <div
        className={[
          "relative flex h-[100dvh] w-full max-w-[var(--phone-w)] flex-col overflow-hidden bg-bg",
          // Desktop: a seated bezel. The thin ring reads as the device edge,
          // the soft shadow as the handset lifting off the desk surface.
          "sm:h-[calc(100dvh-2rem)] sm:rounded-bezel sm:shadow-lifted",
          "sm:ring-1 sm:ring-border/60",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}
