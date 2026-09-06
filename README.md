# Vouch

Vouch is a rider-focused road-intelligence demo that explains why a manoeuvre
may have happened instead of judging motion alone.

> **Don't judge the action. Understand the context.**

## Live Demo

### **https://vouch-demo-beige.vercel.app**

This is the primary, verified production deployment. It was verified from
GitHub `main` at application commit
`81cae8a1ad7266ec4014aa9692e3eb5b88ada03b`.

## Project Overview

Vouch combines simulated ride telemetry, nearby road hazards, and rear-approach
signals to produce a contextual explanation for a rider's manoeuvre. The
current release is a deterministic, local-first product demo: it works without
credentials or a network-backed database, while retaining an optional Supabase
repository for configured environments.

The project is a React and TypeScript single-page application built with Vite.
It uses Zustand for ride and score state, React Query for repository data,
MapLibre for the shared hazard map, and pure engine modules for contextual
analysis, aggregation, and score calculations.

## Key Features

- Splash screen, rider dashboard, live ride, map, score, history, and road-event
  views.
- Six deterministic demo scenarios, including the full `Pothole + Vehicle`
  sequence.
- Simulated telemetry and camera metadata through replaceable provider seams.
- Context Engine correlation of motion, road hazards, and rear approach.
- Animated manoeuvre, analysis, verdict, and shared-intelligence overlays.
- Transparent Vouch Score breakdown and contextual score changes.
- Ride history with expandable signal explanations.
- Shared hazard map using MapLibre, with a schematic fallback when map tiles are
  unavailable.
- Duplicate-report protection in the demo aggregation flow.
- Keyboard-accessible controls and responsive narrow-screen behavior.
- Optional Supabase persistence for riders, trips, events, reports, score
  snapshots, and realtime query invalidation.

## Local Setup

### Requirements

- Node.js 20 or newer
- npm

Install the locked dependency set and start the development server:

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run typecheck` | Run TypeScript project checks without emitting files. |
| `npm test` | Run the Vitest unit test suite once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run build` | Type-check and create the production Vite build in `dist/`. |
| `npm run test:e2e` | Run the Playwright browser smoke tests. |
| `npm run preview` | Serve the production build locally for inspection. |

## Optional Environment Configuration

No environment variables are required for the default demo. To configure the
optional services, copy `.env.example` to `.env.local` and set any needed
public frontend values:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_MAP_STYLE_URL=
```

- `VITE_SUPABASE_URL` is the Supabase project URL.
- `VITE_SUPABASE_ANON_KEY` is the public/anonymous browser key. Never expose a
  Supabase `service_role` key in frontend configuration.
- `VITE_MAP_STYLE_URL` optionally overrides the MapLibre style. When it is
  blank, the app uses its built-in OpenStreetMap raster style and can fall back
  to the schematic map if tiles fail.

The optional demo schema and seed data are in
`supabase/migrations/001_init.sql`. That schema is intended for demonstration,
not as a production security or migration strategy.

## Local-First and Fallback Behavior

When valid Supabase settings are absent, Vouch automatically uses its seeded
local repository. This is the recommended mode for a reliable walkthrough and
requires no account or backend setup.

When Supabase settings are present, the app performs a health check before
selecting the Supabase repository. If the project is unavailable or does not
contain the expected schema, the app falls back to local seeded data rather
than blocking the demo.

The scripted providers and scenarios keep the main presentation flow
repeatable. Coordinates, rider records, and ride history used by the demo are
synthetic.

## Suggested Demo Walkthrough

1. Select **Get started** on the splash screen.
2. Choose **Start Live Ride**, or open **Demo controls**.
3. Select **Pothole + Vehicle** for the complete contextual sequence.
4. Advance the overlays manually or allow them to continue automatically.
5. Review the contextual verdict, score change, and shared hazard update.
6. Explore **Map**, **Score**, and **History** from the bottom navigation.
7. Use **Reset demo** to restore the seeded state.

## Architecture

```text
React screens and route-level flows
  -> Zustand ride and score state
  -> mock sensor and camera providers
  -> deterministic Context Engine
  -> road-event aggregation and score calculation
  -> local or Supabase repository
  -> React Query refresh and realtime invalidation
```

Important project boundaries:

- `src/engine/` contains pure context, aggregation, and score logic.
- `src/sensors/` and `src/camera/` define provider interfaces and mock
  implementations.
- `src/data/` selects and implements local or Supabase persistence.
- `src/store/` owns the live ride state machine and score presentation state.
- `src/components/ride/` implements the live sequence and overlays.
- `src/components/map/` contains the MapLibre and schematic map paths.
- `src/config/` contains deterministic scenarios, labels, and seeded demo data.
- `supabase/migrations/001_init.sql` defines the optional demo database.
- `ml/` documents and contains the separate pothole-model training workstream;
  it is not production inference inside the web application.

## Testing and Verification

The repository includes Vitest unit coverage for the context, aggregation,
score, local-repository, and ride-store logic. Playwright smoke tests cover core
navigation, the hero flow, duplicate interactions, and narrow-screen layout.

Run the complete project checks with:

```bash
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Use `npm run preview` after a build to inspect the generated static application
locally. The verified Vercel production deployment linked above corresponds to
the application source on GitHub `main` at commit
`81cae8a1ad7266ec4014aa9692e3eb5b88ada03b`.

## Deployment

### Vercel

Vercel is the primary live deployment. The application is built as a static
Vite SPA, with production output generated in `dist/`. The root `vercel.json`
keeps client-side routes working when opened directly by rewriting non-file
requests to `/index.html`:

```json
{
  "rewrites": [
    {
      "source": "/((?!.*\\.).*)",
      "destination": "/index.html"
    }
  ]
}
```

### GitHub Pages

The repository also retains `.github/workflows/deploy.yml` as a secondary
GitHub Pages path. On pushes to `main` or manual dispatch, it uses Node.js 20,
runs `npm ci` and `npm run build`, copies `dist/index.html` to `dist/404.html`
for SPA fallback behavior, and publishes the `dist` artifact through GitHub
Pages. During GitHub Actions builds, Vite uses `/vouch-demo/` as the base path;
local development and Vercel use `/`.

## Limitations and Future Work

- Sensor and camera inputs are mocked; native Android providers, device
  permissions, and real telemetry are not implemented.
- The ML directory is a training workstream only; production YOLO/ONNX
  inference is not integrated into the web app.
- The Supabase schema is demo-grade. Production use would require
  authentication, user-owned access policies, hardened migrations, and
  server-side transactional aggregation for concurrency.
- The automated suite is focused on core logic and smoke coverage rather than
  a complete component, accessibility, and multi-browser matrix.
- MapLibre can be further code-split and the production bundle further
  optimized.
- The Vouch Score is a concept demonstration, not an insurance, legal, credit,
  or official safety score.

## Privacy and Safety

- The demo stores camera detection metadata, not camera frames.
- Coordinates and rider records are synthetic demonstration data.
- Do not place privileged backend credentials in frontend environment files.

## License

No license has been selected. Treat the repository as an evaluation/demo
project unless the owner adds one.
