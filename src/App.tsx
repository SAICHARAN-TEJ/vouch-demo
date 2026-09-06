import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Splash } from "@/screens/Splash";
import { Home } from "@/screens/Home";

/**
 * §8 route code-splitting (see .slim/deepwork/vouch-frontend-rebuild.md).
 *
 * Splash and Home stay eager: the splash → home auto-advance is the designed
 * seamless morph, and both run on the very first paint, so splitting them
 * would only trade a skeleton flash for no payload win. Every other screen
 * loads on first visit. MapScreen's chunk carries MapLibre (VouchMap is its
 * only importer), which keeps the heaviest dependency out of the entry
 * payload entirely. Named exports map to lazy defaults below.
 */
const MapScreen = lazy(() =>
  import("@/screens/MapScreen").then((m) => ({ default: m.MapScreen })),
);
const LiveRide = lazy(() =>
  import("@/screens/LiveRide").then((m) => ({ default: m.LiveRide })),
);
const ScoreScreen = lazy(() =>
  import("@/screens/ScoreScreen").then((m) => ({ default: m.ScoreScreen })),
);
const HistoryScreen = lazy(() =>
  import("@/screens/HistoryScreen").then((m) => ({ default: m.HistoryScreen })),
);
const RoadEventScreen = lazy(() =>
  import("@/screens/RoadEventScreen").then((m) => ({
    default: m.RoadEventScreen,
  })),
);
const DemoControls = lazy(() =>
  import("@/screens/DemoControls").then((m) => ({ default: m.DemoControls })),
);

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/map" element={<MapScreen />} />
        <Route path="/ride" element={<LiveRide />} />
        <Route path="/score" element={<ScoreScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
        <Route path="/road/:id" element={<RoadEventScreen />} />
        <Route path="/demo" element={<DemoControls />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}
