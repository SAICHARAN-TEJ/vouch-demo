/** @type {import('tailwindcss').Config} */

/* =====================================================================
   VOUCH — Tailwind theme (Stitch light system)
   ---------------------------------------------------------------------
   Every colour is an alias onto an RGB-channel CSS variable declared in
   src/index.css, so opacity modifiers (`bg-primary/15`) keep working and
   the palette stays single-sourced. Do not hard-code hex values here.

   The palette is the Material-3 tonal set from the Stitch reference
   (see .slim/stitch-reference/spec.md §1). Legacy semantic names
   (bg/surface/elevated/content/muted/…) are remapped onto the same
   channels so the whole app inherits the re-theme through the cascade —
   including src/components/motion/*, which must not be edited.
   ===================================================================== */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  /* ---------------------------------------------------------------------
     SAFELIST — motion vocabulary ONLY.
     Tailwind's JIT only emits classes it literally sees in `content`, so a
     token that nothing uses yet (e.g. `duration-slow`) would silently not
     exist. Safelisting the motion scale makes the design-system vocabulary
     verifiable in the built CSS and safe for code that composes these class
     names dynamically. Keep this minimal: motion only. Never safelist
     colours, spacing or layout — that reintroduces the bloat the JIT
     removed.
     --------------------------------------------------------------------- */
  safelist: [
    "duration-micro",
    "duration-fast",
    "duration-entrance",
    "duration-slow",
    "duration-page",
    "duration-ambient",
    "ease-entrance",
    "ease-exit",
    "ease-elastic",
    "ease-hover",
    "ease-dramatic",
    "delay-stagger-tight",
    "delay-stagger",
    "delay-stagger-loose",
  ],
  theme: {
    extend: {
      colors: {
        /* ---- Legacy semantic names (remapped to light channels) -------
           These MUST keep resolving: src/components/motion/AnimatedCard
           and src/lib/ui reference them and are outside edit scope. */
        bg: "rgb(var(--c-bg) / <alpha-value>)", // #f9f9ff background
        surface: "rgb(var(--c-surface) / <alpha-value>)", // #f0f3ff container-low
        elevated: "rgb(var(--c-elevated) / <alpha-value>)", // #e7eeff container
        border: "rgb(var(--c-border) / <alpha-value>)", // #bfc8c9 outline-variant
        content: "rgb(var(--c-text) / <alpha-value>)", // #111c2d on-surface
        muted: "rgb(var(--c-muted) / <alpha-value>)", // #404849 on-surface-variant

        primary: "rgb(var(--c-primary) / <alpha-value>)", // #003a3e
        "primary-fg": "rgb(var(--c-primary-fg) / <alpha-value>)", // #ffffff on-primary
        accent: "rgb(var(--c-accent) / <alpha-value>)", // #0f5257 primary-container
        signal: "rgb(var(--c-signal) / <alpha-value>)", // #2b676c surface-tint

        justified: "rgb(var(--c-justified) / <alpha-value>)", // #003c27 tertiary
        caution: "rgb(var(--c-caution) / <alpha-value>)", // #904d00 secondary
        danger: "rgb(var(--c-danger) / <alpha-value>)", // #ba1a1a error
        info: "rgb(var(--c-info) / <alpha-value>)", // #0b57d0 (see index.css)

        hazard: {
          pothole: "rgb(var(--c-hazard-pothole) / <alpha-value>)", // #fe932c
          speedbreaker: "rgb(var(--c-hazard-speedbreaker) / <alpha-value>)", // #904d00
          waterlogging: "rgb(var(--c-hazard-waterlogging) / <alpha-value>)", // #0f5257
          debris: "rgb(var(--c-hazard-debris) / <alpha-value>)", // #ba1a1a
        },

        /* ---- Stitch Material-3 tonal names (spec §1) --------------- */
        "surface-bright": "rgb(var(--c-bg) / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--c-surface-lowest) / <alpha-value>)",
        "surface-container-low": "rgb(var(--c-surface) / <alpha-value>)",
        "surface-container": "rgb(var(--c-elevated) / <alpha-value>)",
        "surface-container-high": "rgb(var(--c-surface-high) / <alpha-value>)",
        "surface-container-highest": "rgb(var(--c-surface-highest) / <alpha-value>)",
        "surface-variant": "rgb(var(--c-surface-highest) / <alpha-value>)",
        "surface-dim": "rgb(var(--c-surface-dim) / <alpha-value>)",
        "on-surface": "rgb(var(--c-text) / <alpha-value>)",
        "on-background": "rgb(var(--c-text) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--c-muted) / <alpha-value>)",
        outline: "rgb(var(--c-outline) / <alpha-value>)",
        "outline-variant": "rgb(var(--c-border) / <alpha-value>)",

        "on-primary": "rgb(var(--c-primary-fg) / <alpha-value>)",
        "primary-container": "rgb(var(--c-accent) / <alpha-value>)",
        "on-primary-container": "rgb(var(--c-on-primary-container) / <alpha-value>)",
        "primary-fixed": "rgb(var(--c-primary-fixed) / <alpha-value>)",
        "primary-fixed-dim": "rgb(var(--c-primary-fixed-dim) / <alpha-value>)",
        "on-primary-fixed": "rgb(var(--c-on-primary-fixed) / <alpha-value>)",
        "on-primary-fixed-variant": "rgb(var(--c-on-primary-fixed-variant) / <alpha-value>)",
        "surface-tint": "rgb(var(--c-signal) / <alpha-value>)",

        secondary: "rgb(var(--c-caution) / <alpha-value>)",
        "on-secondary": "rgb(var(--c-primary-fg) / <alpha-value>)",
        "secondary-container": "rgb(var(--c-hazard-pothole) / <alpha-value>)",
        "on-secondary-container": "rgb(var(--c-on-secondary-container) / <alpha-value>)",
        "secondary-fixed": "rgb(var(--c-secondary-fixed) / <alpha-value>)",
        "secondary-fixed-dim": "rgb(var(--c-secondary-fixed-dim) / <alpha-value>)",
        "on-secondary-fixed": "rgb(var(--c-on-secondary-fixed) / <alpha-value>)",
        "on-secondary-fixed-variant": "rgb(var(--c-on-secondary-fixed-variant) / <alpha-value>)",

        tertiary: "rgb(var(--c-justified) / <alpha-value>)",
        "on-tertiary": "rgb(var(--c-primary-fg) / <alpha-value>)",
        "tertiary-container": "rgb(var(--c-tertiary-container) / <alpha-value>)",
        "on-tertiary-container": "rgb(var(--c-on-tertiary-container) / <alpha-value>)",
        "tertiary-fixed": "rgb(var(--c-tertiary-fixed) / <alpha-value>)",
        "tertiary-fixed-dim": "rgb(var(--c-tertiary-fixed-dim) / <alpha-value>)",
        "on-tertiary-fixed": "rgb(var(--c-on-tertiary-fixed) / <alpha-value>)",
        "on-tertiary-fixed-variant": "rgb(var(--c-on-tertiary-fixed-variant) / <alpha-value>)",

        error: "rgb(var(--c-danger) / <alpha-value>)",
        "on-error": "rgb(var(--c-primary-fg) / <alpha-value>)",
        "error-container": "rgb(var(--c-error-container) / <alpha-value>)",
        "on-error-container": "rgb(var(--c-on-error-container) / <alpha-value>)",

        "inverse-surface": "rgb(var(--c-inverse-surface) / <alpha-value>)",
        "inverse-on-surface": "rgb(var(--c-inverse-on-surface) / <alpha-value>)",
        "inverse-primary": "rgb(var(--c-primary-fixed-dim) / <alpha-value>)",
      },

      /* ---------------------------------------------------------------
         RADIUS — Stitch scale (spec §1). 2 / 4 / 8 / 12px. No 9999px
         pills: `full` caps at 12px, which on chips reads as the
         reference's soft "pill". Small dots still render round because
         border-radius clamps at half the box. Legacy aliases (sharp,
         control, panel, bezel) are preserved so existing markup keeps
         resolving to the new steps.
         --------------------------------------------------------------- */
      borderRadius: {
        none: "0px",
        sharp: "2px", // data cells, meter fills, tick marks
        sm: "4px", // spec `lg` — small chips, tiles
        DEFAULT: "8px", // spec `xl` — rows, controls
        md: "8px",
        lg: "4px", // spec `lg` step (kept for literal spec strings)
        control: "8px", // buttons, chips, icon buttons, inputs
        xl: "8px", // cards, rows, buttons per recipes
        panel: "8px", // .card resting surface
        "2xl": "12px", // spec `full` step
        "3xl": "12px",
        bezel: "30px", // the phone frame, and nothing else
        full: "12px", // reference pills; clamps to circles on dots
      },

      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        // Headlines AND body: the reference uses Jakarta everywhere except
        // the mono label register.
        display: [
          "Plus Jakarta Sans",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },

      /* ---------------------------------------------------------------
         TYPE SCALE — legacy steps preserved for existing markup, plus
         the Stitch named steps (spec §1) with their exact weights,
         tracking and leading baked in. `label-*` carries JetBrains Mono
         via the `.eyebrow`/`font-mono` pair at usage sites.
         --------------------------------------------------------------- */
      fontSize: {
        "2xs": ["10.5px", { lineHeight: "14px", letterSpacing: "0.06em" }],
        xs: ["12.5px", { lineHeight: "17px", letterSpacing: "0.005em" }],
        sm: ["13.5px", { lineHeight: "19px", letterSpacing: "0em" }],
        base: ["15px", { lineHeight: "22px", letterSpacing: "-0.005em" }],
        lg: ["18px", { lineHeight: "24px", letterSpacing: "-0.011em" }],
        xl: ["21px", { lineHeight: "27px", letterSpacing: "-0.015em" }],
        "2xl": ["26px", { lineHeight: "30px", letterSpacing: "-0.02em" }],
        "3xl": ["31px", { lineHeight: "34px", letterSpacing: "-0.024em" }],
        "4xl": ["37px", { lineHeight: "39px", letterSpacing: "-0.028em" }],
        "5xl": ["45px", { lineHeight: "46px", letterSpacing: "-0.032em" }],
        "6xl": ["54px", { lineHeight: "54px", letterSpacing: "-0.036em" }],

        // ---- Stitch named steps -----------------------------------
        "label-sm": [
          "11px",
          { lineHeight: "14px", letterSpacing: "0.04em", fontWeight: "500" },
        ],
        "label-md": ["13px", { lineHeight: "18px", fontWeight: "500" }],
        "label-lg": [
          "15px",
          { lineHeight: "20px", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "headline-sm": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "headline-md": ["22px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-lg": [
          "32px",
          { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "headline-lg-mobile": [
          "26px",
          { lineHeight: "34px", letterSpacing: "-0.01em", fontWeight: "700" },
        ],
        "body-sm": ["12px", { lineHeight: "16px" }],
        "body-md": ["14px", { lineHeight: "20px" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "500" }],
      },

      spacing: {
        // Legacy names — kept alive for existing markup.
        gutter: "1.25rem", // screen side padding (wide)
        "gutter-tight": "1rem", // = spec gutter-mobile
        header: "5.75rem", // status strip (28px) + brand row (64px)
        nav: "4rem", // BottomNav h-16
        touch: "3rem", // 48px — spec touch-min (clears the 44px floor)
        "safe-b": "env(safe-area-inset-bottom)",
        "safe-t": "env(safe-area-inset-top)",

        // ---- Stitch steps (spec §1) --------------------------------
        "gutter-mobile": "1rem",
        "gutter-tablet": "1.5rem",
        "stack-xs": "0.25rem",
        "stack-sm": "0.5rem",
        "stack-md": "0.75rem",
        "stack-lg": "1rem",
        "stack-xl": "1.5rem",
        "stack-2xl": "2rem",
        "touch-min": "3rem",
        "touch-standard": "3.5rem",
        "touch-prominent": "4rem",
      },

      /* ---------------------------------------------------------------
         ELEVATION — light system. Two named levels in CSS vars (raised
         = card at rest, lifted = hover/sheet) plus a restrained chrome
         shadow for the header/nav. No glow halos: the old "signal" rim
         becomes a quiet emphasis ring for live surfaces.
         --------------------------------------------------------------- */
      boxShadow: {
        raised: "var(--shadow-raised)",
        lifted: "var(--shadow-lifted)",
        signal: "var(--shadow-signal)",
        chrome: "var(--shadow-chrome)",
        // Kept for any straggler consumers; all resolve to light levels.
        card: "var(--shadow-raised)",
        glow: "var(--shadow-raised)",
        lg: "var(--shadow-raised)",
        "2xl": "var(--shadow-lifted)",
        // Inset hairline that seats controls into a panel (light).
        seated:
          "inset 0 0 0 1px rgb(17 28 45 / 0.05), inset 0 -1px 0 0 rgb(17 28 45 / 0.04)",
        none: "none",
      },

      /* ---------------------------------------------------------------
         MOTION TOKENS — MIRROR, NOT SOURCE.
         src/hooks/useAnimationConfig.ts is CANONICAL. Change the hook,
         then src/index.css, then here. The mirror map lives in the hook's
         header comment.
         --------------------------------------------------------------- */
      transitionTimingFunction: {
        entrance: "cubic-bezier(0.16, 1, 0.3, 1)",
        exit: "cubic-bezier(0.7, 0, 0.84, 0)",
        elastic: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        hover: "cubic-bezier(0.4, 0, 0.2, 1)",
        dramatic: "cubic-bezier(0.87, 0, 0.13, 1)",
      },
      // Mirrors DURATION.
      transitionDuration: {
        micro: "180ms",
        fast: "240ms",
        entrance: "480ms",
        slow: "600ms",
        page: "700ms",
        ambient: "14000ms",
      },
      // Mirrors STAGGER.
      transitionDelay: {
        "stagger-tight": "50ms",
        stagger: "70ms",
        "stagger-loose": "100ms",
      },
      transitionProperty: {
        // Compositor-only. Use this instead of `transition-all`.
        motion: "transform, opacity",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translate3d(0, 14px, 0)" },
          to: { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.94)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.7)", opacity: "0.7" },
          "80%, 100%": { transform: "scale(2.2)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -8px, 0)" },
        },
        // Ambient: a slow off-axis drift for background washes. Long
        // enough (18s) that it never reads as an animation.
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(2%, -1.5%, 0) scale(1.04)" },
        },
        // Ambient: instrument "breathing" on live indicators.
        breathe: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 400ms cubic-bezier(0.16,1,0.3,1) both",
        "fade-up": "fade-up 480ms cubic-bezier(0.16,1,0.3,1) both",
        "scale-in": "scale-in 480ms cubic-bezier(0.16,1,0.3,1) both",
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite",
        float: "float 3.5s cubic-bezier(0.4,0,0.2,1) infinite",
        drift: "drift 18s cubic-bezier(0.4,0,0.2,1) infinite",
        breathe: "breathe 2.4s cubic-bezier(0.4,0,0.2,1) infinite",
      },
    },
  },
  plugins: [],
};
