import type { CameraDetection } from "@/types";
import type { ScenarioDef } from "@/config/scenarios";

/**
 * Camera abstraction (PRD §24, §25). Only detection METADATA is ever surfaced —
 * never frames. Local perception, discard the frame, keep the event.
 *
 *   CameraProvider
 *     ├── MockCameraProvider     (demo — scripted detections)
 *     └── AndroidCameraProvider  (future — on-device perception model)
 */
export type CameraProviderKind = "mock" | "android";

export interface CameraProvider {
  readonly kind: CameraProviderKind;
  /** Register a detection listener. Returns an unsubscribe function. */
  onDetection(listener: (detection: CameraDetection) => void): () => void;
  stop(): void;
}

export interface MockCameraProviderApi extends CameraProvider {
  readonly kind: "mock";
  /**
   * Demo control: synthesise a rear detection from a scenario (or null if the
   * scenario has no rear context). Notifies listeners and returns the detection.
   */
  trigger(scenario: ScenarioDef): CameraDetection | null;
}
