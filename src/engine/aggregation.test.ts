import { describe, it, expect } from "vitest";
import {
  createRoadEvent,
  statusForReports,
  strengthenRoadEvent,
} from "./aggregation";
import { freshRoadEvents, HERO_POTHOLE_ID } from "@/config/demoData";

describe("Road-event aggregation (PRD §22)", () => {
  it("maps report counts to status tiers", () => {
    expect(statusForReports(1)).toBe("possible");
    expect(statusForReports(2)).toBe("possible");
    expect(statusForReports(3)).toBe("probable");
    expect(statusForReports(4)).toBe("probable");
    expect(statusForReports(5)).toBe("confirmed");
    expect(statusForReports(8)).toBe("confirmed");
  });

  it("strengthens the hero pothole to the PRD §14 figures (8 / 7 / 0.91)", () => {
    const pothole = freshRoadEvents().find((e) => e.id === HERO_POTHOLE_ID)!;
    expect(pothole.reports).toBe(7);
    expect(pothole.riders).toBe(6);
    expect(pothole.confidence).toBe(0.88);

    const strengthened = strengthenRoadEvent(pothole, {
      newRider: true,
      now: new Date("2026-09-03T10:18:00"),
    });
    expect(strengthened.reports).toBe(8);
    expect(strengthened.riders).toBe(7);
    expect(strengthened.confidence).toBe(0.91);
    expect(strengthened.status).toBe("confirmed");
    // original is untouched (immutability)
    expect(pothole.reports).toBe(7);
  });

  it("creates a brand-new event as a single possible report", () => {
    const created = createRoadEvent({
      id: "x",
      type: "pothole",
      latitude: 13.06,
      longitude: 80.24,
    });
    expect(created.reports).toBe(1);
    expect(created.riders).toBe(1);
    expect(created.status).toBe("possible");
    expect(created.confidence).toBe(0.5);
  });
});
