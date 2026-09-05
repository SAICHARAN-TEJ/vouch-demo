import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Splash } from "@/screens/Splash";
import { Home } from "@/screens/Home";
import { MapScreen } from "@/screens/MapScreen";
import { LiveRide } from "@/screens/LiveRide";
import { ScoreScreen } from "@/screens/ScoreScreen";
import { HistoryScreen } from "@/screens/HistoryScreen";
import { RoadEventScreen } from "@/screens/RoadEventScreen";
import { DemoControls } from "@/screens/DemoControls";

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
