import type { CameraDetection } from "@/types";
import type { ScenarioDef } from "@/config/scenarios";
import type { MockCameraProviderApi } from "./types";

/**
 * MockCameraProvider — produces scripted rear-camera detections for the demo.
 * Retains only metadata (object, distance, motion, confidence, timestamp),
 * never frames, honouring the privacy principle (PRD §25).
 */
export class MockCameraProvider implements MockCameraProviderApi {
  readonly kind = "mock" as const;
  private listeners = new Set<(detection: CameraDetection) => void>();

  onDetection(listener: (detection: CameraDetection) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  trigger(scenario: ScenarioDef): CameraDetection | null {
    if (!scenario.camera) return null;
    const detection: CameraDetection = {
      ...scenario.camera,
      timestamp: Date.now(),
    };
    this.listeners.forEach((l) => l(detection));
    return detection;
  }

  stop(): void {
    this.listeners.clear();
  }
}
