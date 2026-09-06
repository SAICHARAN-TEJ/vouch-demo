import { describe, it, expect } from "vitest";
import { analyseContext, isJustified } from "./contextEngine";
import { freshRoadEvents } from "@/config/demoData";
import { SCENARIOS, type ScenarioDef } from "@/config/scenarios";
import { sensorProvider } from "@/sensors";
import { cameraProvider } from "@/camera";
import type { ContextInput } from "@/types";

/** Build a ContextInput exactly as the app would: via the mock providers. */
function inputFromScenario(scenario: ScenarioDef): ContextInput {
  return {
    sensorEvent: sensorProvider.trigger(scenario),
    cameraDetection: cameraProvider.trigger(scenario),
    location: scenario.location,
    nearbyRoadEvents: freshRoadEvents(),
    timestamp: Date.now(),
  };
}

describe("Context Engine — the six demo scenarios (PRD §21)", () => {
  it("Normal ride → no manoeuvre, context unclear", () => {
    const r = analyseContext(inputFromScenario(SCENARIOS.normal));
    expect(r.signals.motion).toBe(false);
    expect(r.verdict).toBe("context_unclear");
    expect(r.context).toEqual([]);
    expect(isJustified(r.verdict)).toBe(false);
  });

  it("Pothole (road context only) → likely justified", () => {
    const r = analyseContext(inputFromScenario(SCENARIOS.pothole));
    expect(r.signals).toMatchObject({
      motion: true,
      roadContext: true,
      rearApproach: false,
    });
    expect(r.context).toContain("pothole_detected");
    expect(r.verdict).toBe("likely_justified");
    expect(r.confidence).toBe(0.79);
  });

  it("Sudden brake (obstacle ahead) → likely justified", () => {
    const r = analyseContext(inputFromScenario(SCENARIOS.sudden_brake));
    expect(r.signals.rearApproach).toBe(true);
    expect(r.context).toContain("obstacle_detected");
    expect(r.verdict).toBe("likely_justified");
  });

  it("Vehicle approaching (rear only) → likely justified", () => {
    const r = analyseContext(inputFromScenario(SCENARIOS.vehicle_approaching));
    expect(r.signals).toMatchObject({
      motion: true,
      roadContext: false,
      rearApproach: true,
    });
    expect(r.context).toContain("vehicle_approaching");
    expect(r.verdict).toBe("likely_justified");
    expect(r.confidence).toBe(0.74);
  });

  it("HERO: Pothole + Vehicle → HIGH-confidence likely justified (0.91)", () => {
    const r = analyseContext(inputFromScenario(SCENARIOS.pothole_vehicle));
    expect(r.signals).toEqual({
      motion: true,
      roadContext: true,
      rearApproach: true,
    });
    expect(r.context).toEqual(["pothole_detected", "vehicle_approaching"]);
    expect(r.verdict).toBe("high_confidence_likely_justified");
    expect(r.confidence).toBe(0.91);
    // Pothole is "~8m ahead" (PRD §12).
    expect(r.hazardDistanceM).not.toBeNull();
    expect(r.hazardDistanceM as number).toBeLessThanOrEqual(12);
    expect(r.explanation).toMatch(/pothole/i);
    expect(r.explanation).toMatch(/vehicle/i);
  });

  it("Unexplained swerve (no context) → context unclear", () => {
    const r = analyseContext(inputFromScenario(SCENARIOS.unexplained_swerve));
    expect(r.signals).toMatchObject({
      motion: true,
      roadContext: false,
      rearApproach: false,
    });
    expect(r.context).toEqual([]);
    expect(r.verdict).toBe("context_unclear");
    expect(r.confidence).toBe(0.4);
  });
});
