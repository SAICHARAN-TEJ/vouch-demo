import type { ReactNode } from "react";

/**
 * Animation: frame-ambient
 * Trigger: mount, loops (desktop only, decorative)
 * Duration: 18s  Easing: hover curve, symmetric
 * Properties: transform (translate + scale of two blurred washes)
 * Stagger: the two washes run at different scales so they never sync
 * Reduced motion: both washes hold still; the colour stays.
 *
 * Centers the app in a phone-sized frame on desktop and goes full-bleed on
 * mobile. All screens live inside this so the demo reads as a real handset app.
 *
 * The desktop surround is deliberately asymmetric — the jade wash sits high
 * left, the blue low right — so the page does not read as a centred box on a
 * flat field.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] w-full justify-center overflow-hidden bg-transparent sm:py-4">
      {/* Desktop-only atmosphere. Hidden on mobile, where the app is
          full-bleed and this would just cost paint. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden sm:block"
      >
        <div className="absolute -left-24 -top-32 h-[34rem] w-[34rem] rounded-full bg-primary/[0.07] blur-[120px] animate-drift" />
        <div
          className="absolute -bottom-40 -right-16 h-[30rem] w-[30rem] rounded-full bg-accent/[0.06] blur-[120px] animate-drift"
          style={{ animationDelay: "-7s", animationDuration: "24s" }}
        />
        <div className="bg-grid absolute inset-0 opacity-[0.35]" />
      </div>

      <div
        className={[
          "relative flex h-[100dvh] w-full max-w-[var(--phone-w)] flex-col overflow-hidden bg-bg",
          // Desktop: a seated bezel. The inset hairline reads as glass edge,
          // the outer shadow as the device lifting off the page.
          "sm:h-[calc(100dvh-2rem)] sm:rounded-bezel sm:shadow-lifted",
          "sm:ring-1 sm:ring-inset sm:ring-border/70",
        ].join(" ")}
      >
        {/* Top inner sheen — sells the glass without a border on all four
            sides, which would look like a CSS box. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-30 h-px bg-gradient-to-r from-transparent via-content/15 to-transparent"
        />
        {children}
      </div>
    </div>
  );
}
