import { MockSensorProvider } from "./MockSensorProvider";
import type { MockSensorProviderApi } from "./types";

export * from "./types";
export { MockSensorProvider };

/**
 * The active sensor provider for the demo. To move to real hardware later,
 * swap this line for `new AndroidSensorProvider()` — nothing else changes.
 */
export const sensorProvider: MockSensorProviderApi = new MockSensorProvider();
