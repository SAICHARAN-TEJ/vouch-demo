import { MockCameraProvider } from "./MockCameraProvider";
import type { MockCameraProviderApi } from "./types";

export * from "./types";
export { MockCameraProvider };

/**
 * The active camera provider for the demo. Swap for `new AndroidCameraProvider()`
 * to move to an on-device perception model later — nothing else changes.
 */
export const cameraProvider: MockCameraProviderApi = new MockCameraProvider();
