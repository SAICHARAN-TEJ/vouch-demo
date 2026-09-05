import type { SensorEvent } from "@/types";
import type { ScenarioDef } from "@/config/scenarios";
import type { MockSensorProviderApi } from "./types";

/**
 * MockSensorProvider — produces scripted motion events for the demo.
 * A future AndroidSensorProvider implements the same interface, driven by the
 * fused accelerometer + gyroscope stream, so nothing downstream changes.
 */
export class MockSensorProvider implements MockSensorProviderApi {
  readonly kind = "mock" as const;
  private listeners = new Set<(event: SensorEvent) => void>();

  onEvent(listener: (event: SensorEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  trigger(scenario: ScenarioDef): SensorEvent {
    const event: SensorEvent = {
      type: scenario.sensor.type,
      confidence: scenario.sensor.confidence,
      motion: { ...scenario.sensor.motion, timestamp: Date.now() },
    };
    this.listeners.forEach((l) => l(event));
    return event;
  }

  stop(): void {
    this.listeners.clear();
  }
}
