# Vouch

Vouch is a rider-focused road-intelligence demo. It explains why a manoeuvre
may have happened instead of judging the manoeuvre from motion alone.

The application is designed around a simple product idea:

> **Don't judge the action. Understand the context.**

## Live Demo

Once GitHub Pages finishes its first deployment, the public demo will be:

**https://saicharan-tej.github.io/vouch-demo/**

The repository's Actions deployment is the source of truth for the live URL.
If the link is temporarily unavailable, open the **Actions** tab and wait for
the `Build and deploy` workflow to complete.

## What Is Included

The current release is **Demo v1**, with a deterministic local-first flow:

- Splash screen and rider dashboard.
- Live ride screen with simulated telemetry and a schematic route map.
- Context Engine that correlates motion, nearby road hazards, and rear approach.
- Six scripted scenarios, including the hero `Pothole + Vehicle` flow.
- Animated manoeuvre, analysis, verdict, and shared-road-intelligence overlays.
- Transparent Vouch Score breakdown with contextual score changes.
- Ride history with expandable signal explanations.
- Shared hazard map with MapLibre and a reliable schematic fallback.
- Local seeded repository that works without credentials or network access.
- Optional Supabase repository with rider, trip, event, report, and realtime data.
- Keyboard-accessible scenario, hazard, map, and overlay interactions.
- Browser smoke tests covering navigation, the hero flow, duplicate clicks, and
  narrow-screen layout.

## Quick Start

Requirements:

- Node.js 20 or newer.
- npm.

Install and run locally:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

Useful commands:

```bash
npm run typecheck   # TypeScript project checks
npm test            # Vitest unit tests
npm run test:e2e    # Playwright browser smoke tests
npm run build       # Production build
npm run preview     # Serve the production build locally
```

The app automatically uses seeded local data when Supabase variables are not
present. That is the recommended path for a quick product walkthrough.

## Demo Walkthrough

1. Open the app and choose **Get started**.
2. Choose **Start Live Ride**, or open **Demo controls** from the sparkle button.
3. Select **Pothole + Vehicle** for the full hero sequence.
4. Tap the overlays, or let them advance automatically.
5. Confirm the contextual verdict, score change, and shared hazard update.
6. Explore **Map**, **Score**, and **History** from the bottom navigation.
7. Use **Reset demo** to restore the seeded state.

The hero hazard starts at 7 reports, 6 riders, and 88% confidence. One fresh
demo report moves it to 8 reports, 7 riders, and 91% confidence. Repeated reports
from the same demo rider are protected from duplicate aggregation.

## Architecture

```text
React screens
  -> Zustand ride and score state
  -> mock sensor/camera providers
  -> deterministic Context Engine
  -> road-event aggregation
  -> repository persistence
  -> React Query refresh and realtime invalidation
```

Important boundaries:

- `src/engine/` contains pure context, aggregation, and score logic.
- `src/sensors/` and `src/camera/` define provider seams.
- `src/data/` hides local versus Supabase persistence.
- `src/store/` owns the live ride state machine and score presentation state.
- `src/components/ride/` renders the hero sequence as overlays.
- `supabase/migrations/001_init.sql` defines the demo schema and seed data.
- `ml/` contains the separate pothole-model training workstream.

## Optional Supabase Setup

Copy the example environment file:

```bash
copy .env.example .env.local
```

Set these public frontend variables in `.env.local`:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_MAP_STYLE_URL=
```

Run `supabase/migrations/001_init.sql` once in the Supabase SQL editor. The
schema is intentionally demo-grade and open to the anon key. It is not a
production security posture.

The app performs a health check before selecting Supabase. If the project is
unreachable or not migrated, it falls back to local seeded data.

## Deployment

Deployment is configured for GitHub Pages in:

```text
.github/workflows/deploy.yml
```

Every push to `main` runs the production build, creates the SPA `404.html`
fallback, uploads the Pages artifact, and deploys it. The Vite base path is
automatically set to `/vouch-demo/` in GitHub Actions, while local development
continues to use `/`.

To deploy manually through GitHub:

1. Push the project to a repository named `vouch-demo` under your account.
2. Open **Settings -> Pages**.
3. Select **GitHub Actions** as the source if GitHub asks for a source.
4. Push to `main` or run the workflow manually.

## Implementation Status

### Complete for Demo v1

- Deterministic contextual analysis.
- Mock provider event shapes and lifecycle seams.
- Six scenario definitions and hero overlays.
- Local fallback data path.
- Supabase mapping, rider/trip/event/report persistence boundaries.
- Rider-scoped synthetic-day history.
- Score and trip snapshot persistence hooks.
- Reset behavior and duplicate-trigger protection.
- Responsive phone layout and keyboard interaction coverage.

### Deliberately Future Work

- Native Android accelerometer and gyroscope provider.
- Native camera provider and on-device permissions.
- Production YOLO/ONNX inference inside the app.
- Authentication and user-owned RLS policies.
- Server-side transactional aggregation/RPC for high-concurrency reports.
- Production migrations that preserve existing data instead of resetting demo tables.
- Full component, accessibility, and multi-browser test matrix.
- Code-splitting MapLibre and further bundle optimization.

The ML training path is documented separately in `ml/README.md`. The mock
provider remains the reliable presentation path until real perception is ready.

## Privacy And Safety Notes

- The demo stores camera detection metadata, never camera frames.
- Coordinates and rider records are synthetic Chennai demo data.
- The Vouch Score is a concept demonstration, not an insurance, legal, credit,
  or official safety score.
- Do not place a Supabase `service_role` key in frontend environment variables.

## License

No license has been selected yet. Treat this repository as an evaluation/demo
project unless the owner adds one.
