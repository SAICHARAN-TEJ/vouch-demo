import type { SensorEvent } from "@/types";
import type { ScenarioDef } from "@/config/scenarios";

/**
 * Sensor abstraction (PRD §23). Business logic subscribes to `onEvent` and never
 * cares whether events originate from a mock scenario or real Android hardware.
 *
 *   SensorProvider
 *     ├── MockSensorProvider     (demo)
 *     └── AndroidSensorProvider  (future — same interface)
 */
export type SensorProviderKind = "mock" | "android";

export interface SensorProvider {
  readonly kind: SensorProviderKind;
  /** Register a manoeuvre-event listener. Returns an unsubscribe function. */
  onEvent(listener: (event: SensorEvent) => void): () => void;
  /** Tear down any underlying subscriptions/timers. */
  stop(): void;
}

export interface MockSensorProviderApi extends SensorProvider {
  readonly kind: "mock";
  /**
   * Demo control: synthesise a motion event from a scenario, notify listeners,
   * and return it. Mirrors how an Android provider would surface a real event.
   */
  trigger(scenario: ScenarioDef): SensorEvent;
}
