/** @type {import('tailwindcss').Config} */

/* =====================================================================
   VOUCH — Tailwind theme
   ---------------------------------------------------------------------
   Every colour is an alias onto an RGB-channel CSS variable declared in
   src/index.css, so opacity modifiers (`bg-primary/15`) keep working and
   the palette stays single-sourced. Do not hard-code hex values here.
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
        // ---- Substrate -------------------------------------------------
        bg: "rgb(var(--c-bg) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        elevated: "rgb(var(--c-elevated) / <alpha-value>)",
        border: "rgb(var(--c-border) / <alpha-value>)",
        content: "rgb(var(--c-text) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",

        // ---- Signal ----------------------------------------------------
        primary: "rgb(var(--c-primary) / <alpha-value>)",
        "primary-fg": "rgb(var(--c-primary-fg) / <alpha-value>)",
        accent: "rgb(var(--c-accent) / <alpha-value>)",
        signal: "rgb(var(--c-signal) / <alpha-value>)",

        // ---- Status ----------------------------------------------------
        justified: "rgb(var(--c-justified) / <alpha-value>)",
        caution: "rgb(var(--c-caution) / <alpha-value>)",
        danger: "rgb(var(--c-danger) / <alpha-value>)",
        info: "rgb(var(--c-info) / <alpha-value>)",

        // ---- Hazard channels -------------------------------------------
        hazard: {
          pothole: "rgb(var(--c-hazard-pothole) / <alpha-value>)",
          speedbreaker: "rgb(var(--c-hazard-speedbreaker) / <alpha-value>)",
          waterlogging: "rgb(var(--c-hazard-waterlogging) / <alpha-value>)",
          debris: "rgb(var(--c-hazard-debris) / <alpha-value>)",
        },
      },

      /* ---------------------------------------------------------------
         RADIUS PHILOSOPHY — "machined, and it grows with the surface".
         Data cells stay near-square (2px) because they read as etched
         cells. Controls get 10px. Panels get 18px. Only the handset
         bezel is allowed to exceed that. Nothing in between is invented
         ad hoc; the generic scale below is aligned to the same steps so
         `rounded-2xl` and `rounded-panel` are the same corner.
         --------------------------------------------------------------- */
      borderRadius: {
        none: "0px",
        sharp: "2px", // data cells, meter fills, tick marks
        sm: "6px",
        DEFAULT: "8px",
        md: "8px",
        control: "10px", // buttons, chips, icon buttons, inputs
        lg: "10px",
        xl: "12px",
        panel: "18px", // cards and any resting surface
        "2xl": "18px",
        "3xl": "24px",
        bezel: "30px", // the phone frame, and nothing else
        full: "9999px",
      },

      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        // Manrope carries every display heading and every numeric readout.
        display: ["Manrope", "Inter", "ui-sans-serif", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },

      /* ---------------------------------------------------------------
         TYPE SCALE — 1.2x musical ratio anchored at 15px body.
         15 · 18 · 21 · 26 · 31 · 37 · 45 · 54
         Below the anchor the ratio continues to 12.5 and 10.5; `sm`
         (13.5px) is a deliberate half-step for dense telemetry rows.
         Tracking tightens as size grows — required for Manrope at
         display sizes, otherwise headings feel loose and generic.
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
      },

      spacing: {
        gutter: "1.25rem", // screen side padding
        "gutter-tight": "1rem",
        header: "3.5rem", // ScreenHeader min height
        nav: "4.75rem", // BottomNav height
        touch: "2.75rem", // 44px — minimum interactive edge
        "safe-b": "env(safe-area-inset-bottom)",
        "safe-t": "env(safe-area-inset-top)",
      },

      /* ---------------------------------------------------------------
         ELEVATION — three levels, all tinted with the primary hue.
         `raised` and `lifted` read from CSS vars so index.css stays the
         single source. `signal` is the "this is live" rim, not a level.
         --------------------------------------------------------------- */
      boxShadow: {
        raised: "var(--shadow-raised)",
        lifted: "var(--shadow-lifted)",
        signal: "var(--shadow-signal)",
        // Kept for existing consumers; both point at the named levels.
        card: "var(--shadow-raised)",
        glow: "var(--shadow-signal)",
        lg: "var(--shadow-raised)",
        "2xl": "var(--shadow-lifted)",
        // Inset hairline used to seat controls into a panel.
        seated: "inset 0 1px 0 0 rgb(255 255 255 / 0.05), inset 0 -1px 0 0 rgb(2 10 14 / 0.5)",
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
      // Mirrors DURATION. `slow` and `ambient` were missing and had drifted.
      transitionDuration: {
        micro: "180ms",
        fast: "240ms",
        entrance: "480ms",
        slow: "600ms",
        page: "700ms",
        ambient: "14000ms",
      },
      // Mirrors STAGGER. Makes stagger a real three-layer token via
      // `delay-stagger-tight` / `delay-stagger` / `delay-stagger-loose`.
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
