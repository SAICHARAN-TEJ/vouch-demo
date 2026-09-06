import { beforeEach, describe, expect, it } from "vitest";
import { DEMO_START_POSITION } from "@/config/demoData";
import { useRideStore } from "./rideStore";

describe("ride store", () => {
  beforeEach(() => {
    useRideStore.getState().resetRide();
  });

  it("starts a ride from the initial position", () => {
    useRideStore.getState().startRide();

    expect(useRideStore.getState().phase).toBe("riding");
    expect(useRideStore.getState().position).toEqual(DEMO_START_POSITION);
  });

  it("reset returns the ride to idle and clears analysis state", () => {
    useRideStore.getState().startRide();
    useRideStore.getState().tick();

    useRideStore.getState().resetRide();

    const state = useRideStore.getState();
    expect(state.phase).toBe("idle");
    expect(state.position).toEqual(DEMO_START_POSITION);
    expect(state.distanceKm).toBe(0);
    expect(state.elapsedS).toBe(0);
    expect(state.analysis).toBeNull();
  });
});
